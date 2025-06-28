import os
import io
import time
import json
import base64
import random
import asyncio
import logging
import aiofiles
import tempfile
import requests
import numpy as np
import faster_whisper
from openai import OpenAI
from datetime import datetime
from pydub import AudioSegment
from typing import List, Optional
from huggingface_hub import login
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from RealtimeTTS import TextToAudioStream, EdgeEngine
from concurrent.futures import ThreadPoolExecutor
from twilio.twiml.voice_response import VoiceResponse, Connect
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from silero_vad import load_silero_vad, read_audio, get_speech_timestamps
from police_complaint_processor import PoliceComplaintProcessor, create_processor

edge_engine = EdgeEngine(rate=0, pitch=0, volume=0)
edge_engine.set_voice("en-US-JennyNeural")
import tempfile
import edge_tts

from agno.agent import Agent
from agno.storage.agent.sqlite import SqliteAgentStorage
from agno.memory import AgentMemory
from agno.tools.google_maps import GoogleMapTools
from agno.models.ollama import Ollama
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)
hf_token = "hf_token"
login(token=hf_token)

try:
    whisper_model = faster_whisper.WhisperModel("large-v3", device="cuda", compute_type="float16")
    print("Using GPU acceleration")
except Exception as e:
    print(f"GPU not available, using CPU: {e}")
    whisper_model = faster_whisper.WhisperModel("tiny", device="cpu", compute_type="int8")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger = logging.getLogger("uvicorn")

# Thread pool for CPU-intensive tasks
executor = ThreadPoolExecutor(max_workers=4)

vad_model = load_silero_vad()
os.environ["OPENAI_API_KEY"] = "llm-key"
LLM_MODEL = "meta-llama/Llama-3.1-8B-Instruct"


openai_api_base = "http://164.52.196.228:8020/v1"

chat = OpenAI(
    base_url=openai_api_base,
)

# Recording configuration
RECORDINGS_DIR = "recordings"
os.makedirs(RECORDINGS_DIR, exist_ok=True)


class ConversationEntry:
    def __init__(self, timestamp: str, speaker: str, text: str):
        self.timestamp = timestamp
        self.speaker = speaker  # "user" or "assistant"
        self.text = text


class CallState:
    def __init__(self, call_id: str,caller_number: str = None):
        self.call_id = call_id
        self.caller_number = caller_number
        self.processing_llm = False
        self.conversation_log: List[ConversationEntry] = []
        self.start_time = datetime.utcnow()
        self.conversation_json_path = os.path.join(RECORDINGS_DIR, f"conversation_{call_id}_{int(time.time())}.json")
        
        # Simplified audio recording variables
        self.audio_buffer = bytearray()
        self.speech_buffer = bytearray()
        self.is_recording = False
        self.speech_start_time = None
        self.silence_start_time = None
        self.last_speech_time = time.time()
        
        # Recording parameters
        self.min_speech_duration = 1.0  # Minimum 1 second of speech
        self.silence_threshold = 2.0    # 2 seconds of silence to stop
        
        # Conversation recording
        self.conversation_recording_path = os.path.join(RECORDINGS_DIR, f"full_conversation_{call_id}_{int(time.time())}.wav")
        self.conversation_audio_segments = []
        
        # Debug audio saving
        self.debug_audio_counter = 0
        
        logger.info(f"CallState initialized for call: {call_id}")
    
    def add_conversation_entry(self, speaker: str, text: str):
        """Add entry to conversation log"""
        timestamp = datetime.utcnow().isoformat()
        entry = ConversationEntry(timestamp, speaker, text)
        self.conversation_log.append(entry)
        logger.info(f"Added conversation entry: {speaker} - {text[:50]}...")
    
    async def save_conversation_log(self):
        """Save conversation log and create final audio file"""
        try:
            # Create final conversation audio file
            if self.conversation_audio_segments:
                await self._create_final_conversation_audio()
                
            conversation_data = {
                "call_id": self.call_id,
                "start_time": self.start_time.isoformat(),
                "end_time": datetime.utcnow().isoformat(),
                "duration_seconds": (datetime.utcnow() - self.start_time).total_seconds(),
                "conversation_recording": self.conversation_recording_path,
                "conversation": [
                    {
                        "timestamp": entry.timestamp,
                        "speaker": entry.speaker,
                        "text": entry.text
                    }
                    for entry in self.conversation_log
                ]
            }
            
            async with aiofiles.open(self.conversation_json_path, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(conversation_data, indent=2, ensure_ascii=False))
            
            async with aiofiles.open(self.conversation_json_path, 'r', encoding='utf-8') as f:
                content = await f.read()
                data = json.loads(content)
                
            conversation = data.get("conversation", [])
            paragraph = " ".join(f"{entry['speaker']}: {entry['text']}" for entry in conversation)
            processor = create_processor()
            ticket_id = int(datetime.now().strftime("%Y%m%d%H%M%S") + str(random.randint(100, 999)))
            results= processor.process_complaint(
                text=paragraph,
                filename=f"AUDIO_+91_{self.caller_number}",
                ticket=ticket_id
            )  
            logger.info(f"Conversation log saved to: {self.conversation_json_path}")
            logger.info(f"Full conversation audio saved to: {self.conversation_recording_path}")
            return conversation_data
        except Exception as e:
            logger.error(f"Error saving conversation log: {e}")
            return None
    
    async def _create_final_conversation_audio(self):
        """Create final conversation audio from all segments"""
        try:
            if not self.conversation_audio_segments:
                return
                
            # Combine all audio segments
            final_audio = AudioSegment.empty()
            for segment in self.conversation_audio_segments:
                final_audio += segment
            
            # Export final conversation
            final_audio.export(self.conversation_recording_path, format="wav")
            logger.info(f"Final conversation audio created: {self.conversation_recording_path}")
            
        except Exception as e:
            logger.error(f"Error creating final conversation audio: {e}")
    
    def add_audio_to_conversation(self, audio_segment: AudioSegment):
        """Add audio segment to conversation recording"""
        self.conversation_audio_segments.append(audio_segment)

call_states = {}

# Connection pooling for requests
session = requests.Session()

API_KEY = "AIzaSyDWT0N7pHNSf-SQ5ueYHwrWWuA3_aec580"


def get_location_suggestions(textQuery: str) -> str:
    """
    Get top 3 Google Maps location suggestions based on a text query.

    Args:
        textQuery (str): The location query, such as "My home hub" or "Near temple in Hyderabad"

    Returns:
        str: JSON string containing top 3 location suggestions.
    """
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.priceLevel"
    }
    data = {
        "textQuery": textQuery
    }

    response = requests.post(url, headers=headers, json=data)

    suggestions = []
    if response.status_code == 200:
        results = response.json().get("places", [])
        for place in results[:3]:
            name = place.get("displayName", {}).get("text", "N/A")
            address = place.get("formattedAddress", "N/A")
            price = place.get("priceLevel", "N/A")
            suggestions.append({
                "name": name,
                "address": address,
                "price_level": price
            })
    else:
        suggestions.append({"error": f"Failed to fetch results: {response.status_code}"})

    return json.dumps(suggestions, indent=2)

async def convert_to_ulaw_improved(audio_segment: AudioSegment) -> str:
    """Improved μ-law conversion with better quality"""
    try:
        # Ensure proper format
        audio_segment = audio_segment.set_channels(1).set_frame_rate(8000).set_sample_width(2)
        
        # Get PCM data as float for better processing
        pcm_data = np.frombuffer(audio_segment.raw_data, dtype=np.int16).astype(np.float32)
        
        # Apply soft limiting to prevent harsh clipping
        pcm_data = np.tanh(pcm_data / 32768.0) * 32767.0
        
        # Convert back to int16
        pcm_data = pcm_data.astype(np.int16)
        
        # Improved μ-law encoding with proper scaling
        ulaw_data = []
        for sample in pcm_data:
            # Standard μ-law compression algorithm
            sign = 0x80 if sample < 0 else 0x00
            magnitude = abs(int(sample))
            
            # Add bias and clip
            magnitude = min(magnitude + 33, 32767)
            
            # Find the position of the highest set bit
            if magnitude >= 256:
                exponent = int(np.log2(magnitude / 256)) + 1
                exponent = min(exponent, 7)
            else:
                exponent = 0
            
            # Calculate mantissa
            if exponent > 0:
                mantissa = (magnitude >> (exponent + 3)) & 0x0F
            else:
                mantissa = magnitude >> 4
            
            # Combine components
            ulaw_byte = sign | (exponent << 4) | mantissa
            ulaw_byte = (~ulaw_byte) & 0xFF
            
            ulaw_data.append(ulaw_byte)
        
        ulaw_bytes = bytes(ulaw_data)
        return base64.b64encode(ulaw_bytes).decode('utf-8')
        
    except Exception as e:
        logger.error(f"μ-law conversion error: {e}")
        return None

def ulaw_to_pcm(ulaw_data: bytes) -> np.ndarray:
    """Convert μ-law audio to PCM numpy array using lookup table"""
    try:
        # μ-law to linear conversion table (simplified)
        ulaw_table = np.array([
            -32124, -31100, -30076, -29052, -28028, -27004, -25980, -24956,
            -23932, -22908, -21884, -20860, -19836, -18812, -17788, -16764,
            -15996, -15484, -14972, -14460, -13948, -13436, -12924, -12412,
            -11900, -11388, -10876, -10364, -9852, -9340, -8828, -8316,
            -7932, -7676, -7420, -7164, -6908, -6652, -6396, -6140,
            -5884, -5628, -5372, -5116, -4860, -4604, -4348, -4092,
            -3900, -3772, -3644, -3516, -3388, -3260, -3132, -3004,
            -2876, -2748, -2620, -2492, -2364, -2236, -2108, -1980,
            -1884, -1820, -1756, -1692, -1628, -1564, -1500, -1436,
            -1372, -1308, -1244, -1180, -1116, -1052, -988, -924,
            -876, -844, -812, -780, -748, -716, -684, -652,
            -620, -588, -556, -524, -492, -460, -428, -396,
            -372, -356, -340, -324, -308, -292, -276, -260,
            -244, -228, -212, -196, -180, -164, -148, -132,
            -120, -112, -104, -96, -88, -80, -72, -64,
            -56, -48, -40, -32, -24, -16, -8, 0,
            32124, 31100, 30076, 29052, 28028, 27004, 25980, 24956,
            23932, 22908, 21884, 20860, 19836, 18812, 17788, 16764,
            15996, 15484, 14972, 14460, 13948, 13436, 12924, 12412,
            11900, 11388, 10876, 10364, 9852, 9340, 8828, 8316,
            7932, 7676, 7420, 7164, 6908, 6652, 6396, 6140,
            5884, 5628, 5372, 5116, 4860, 4604, 4348, 4092,
            3900, 3772, 3644, 3516, 3388, 3260, 3132, 3004,
            2876, 2748, 2620, 2492, 2364, 2236, 2108, 1980,
            1884, 1820, 1756, 1692, 1628, 1564, 1500, 1436,
            1372, 1308, 1244, 1180, 1116, 1052, 988, 924,
            876, 844, 812, 780, 748, 716, 684, 652,
            620, 588, 556, 524, 492, 460, 428, 396,
            372, 356, 340, 324, 308, 292, 276, 260,
            244, 228, 212, 196, 180, 164, 148, 132,
            120, 112, 104, 96, 88, 80, 72, 64,
            56, 48, 40, 32, 24, 16, 8, 0
        ], dtype=np.int16)
        
        # Convert μ-law bytes to indices and map to PCM values
        ulaw_indices = np.frombuffer(ulaw_data, dtype=np.uint8)
        pcm_values = ulaw_table[ulaw_indices]
        
        return pcm_values
    except Exception as e:
        logger.error(f"Error in μ-law to PCM conversion: {e}")
        return np.array([], dtype=np.int16)

async def query_llm(prompt: str, caller_number: str = None) -> str:
    """Async LLM query using OpenAI client with caller number as session_id"""
    try:
        system_prompt = """
        You are a calm, professional, and efficient Dial 112 emergency voice agent.

        Speak only **one sentence at a time** — short, clear, and helpful.

        Your job is to collect three things quickly:

        1. Name  
        2. Type of emergency (in short)  
        3. Location (confirm using Google Maps)

        Always start with:  
        "Please stay calm. I'm here to help you."

        Ask questions one at a time:

        - "What's your name?"  
        - "What happened?"  
        - "Where are you right now?"

        If they mention a place, use Google Maps to get top 3 results.

        Then say:  
        "I found a few places. Tell me which is right."  
        (List them one by one, clearly.)

        Once confirmed, say:  
        "Thank you. Help is coming. Stay where you are and stay safe."

        Never say more than one sentence at a time. No small talk.
        """

        # Use caller number as session_id, fallback to default if not available
        session_id = caller_number if caller_number and caller_number != 'Unknown' else "hlwbo"
        session_name = f"Emergency Call from {caller_number}" if caller_number else "Emergency Call Handler"

        agent = Agent(
            model=Ollama(id="qwen2.5:32b", host="http://164.52.196.116:11434"),
            
            # Agent identification and metadata
            name="Emergency_Services_AI_Agent",
            agent_id="dial_112_emergency_agent",
            tools=[get_location_suggestions],
            
            # Session management - Use caller number as session_id
            session_id=session_id,
            session_name=session_name,
            storage=SqliteAgentStorage(
                table_name="emergency_agent_sessions", 
                db_file="session/emergency_storage.db"
            ),

            # Memory configuration for conversation context
            memory=AgentMemory(),
            add_history_to_messages=True,
            num_history_responses=5,  # Keep more context for emergency calls
            
            # Response behavior
            stream=False,  # Set to True if you want streaming responses
            stream_intermediate_steps=True,  # Show processing steps for transparency
            markdown=False,  # Keep responses plain for voice processing
            
            # System instructions with enhanced structure
            system_message=system_prompt,
            
            # Instructions for better emergency handling
            instructions=[
                "Always prioritize caller safety and emotional state",
                "Collect information systematically but adapt to urgency",
                "Use simple, clear language appropriate for stressed individuals",
                "Confirm critical information by repeating it back",
                "Maintain professional calm regardless of situation severity"
            ],
            
            retries=2,  
            
            add_datetime_to_instructions=True,
            
            # Enhanced debugging and monitoring
            debug_mode=True,
            monitoring=True,  # Enable monitoring for emergency service quality
            show_tool_calls=True,
            # User interaction settings
            user_message_role="user",
            create_default_user_message=True,
            
            # Error handling
            exponential_backoff=False, 
        )
        response = agent.run(prompt)

        return response.content

    except Exception as e:
        logger.error(f"Error in query_llm: {e}")
        return "Sorry there is an network issue"

async def synthesize_speech(text: str, call_state: CallState = None):
    """Fixed EdgeTTS processing to eliminate distortion"""
    try:        
        # Create temporary file
        tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)  # Changed to mp3
        output_file = tmp.name
        tmp.close()
        
        # Generate speech with better voice settings
        voice = "en-US-AriaNeural"  # Changed voice - Aria is clearer than Jenny
        
        # Use plain text instead of SSML to avoid XML being read aloud
        communicate = edge_tts.Communicate(text, voice, rate="+5%", volume="+0%") # Slower rate, normal volume
        await communicate.save(output_file)
        
        # Load and process audio with minimal changes
        audio_segment = AudioSegment.from_file(output_file)
        os.unlink(output_file)
        
        # Critical: Proper format conversion for Twilio
        # First normalize to remove any DC offset
        audio_segment = audio_segment.remove_dc_offset()
        
        # Convert to proper format for telephony
        audio_segment = (audio_segment
                        .set_channels(1)
                        .set_frame_rate(8000)
                        .set_sample_width(2))  # 16-bit PCM
        
        # Apply gentle audio processing
        # 1. Light compression to prevent clipping
        audio_segment = audio_segment.compress_dynamic_range(threshold=-20.0, ratio=2.0, attack=5.0, release=50.0)
        
        # 2. Normalize to prevent distortion (keep it moderate)
        target_dBFS = -12.0  # Conservative target to prevent clipping
        if audio_segment.dBFS < -30.0:
            audio_segment = audio_segment.normalize(headroom=0.1)
            if audio_segment.dBFS > target_dBFS:
                audio_segment = audio_segment - (audio_segment.dBFS - target_dBFS)
        
        # 3. Apply a gentle low-pass filter to remove high-frequency artifacts
        audio_segment = audio_segment.low_pass_filter(3400)  # Telephony bandwidth
        
        if call_state:
            call_state.add_audio_to_conversation(audio_segment)
            call_state.add_conversation_entry("assistant", text)
        
        # Use improved μ-law conversion
        return await convert_to_ulaw_improved(audio_segment)
        
    except Exception as e:
        logger.error(f"EdgeTTS error: {e}")
        return None

# @app.api_route("/incoming-call", methods=["GET", "POST"])
# async def handle_incoming_call(request: Request):
#     logger.info("Received incoming call request from: %s", request.client.host)
    
#     try:
#         # Log the request details for debugging
#         form_data = await request.form()
#         logger.info(f"Call from: {form_data.get('From', 'Unknown')}")
#         logger.info(f"Call to: {form_data.get('To', 'Unknown')}")
#         logger.info(f"Call SID: {form_data.get('CallSid', 'Unknown')}")
        
#         response = VoiceResponse()
        
#         # Use your ngrok URL instead of direct server IP
#         ngrok_host = "bream-cool-hornet.ngrok-free.app"  # Your ngrok URL
        
#         connect = Connect()
#         connect.stream(url=f'wss://{ngrok_host}/media-stream')  # Use wss:// with ngrok
#         response.append(connect)
        
#         # Convert TwiML to string
#         twiml_str = str(response)
#         logger.info(f"Generated TwiML: {twiml_str}")
        
#         # Return as XML response with proper content type
#         return Response(
#             content=twiml_str,
#             media_type="application/xml",
#             status_code=200
#         )
        
#     except Exception as e:
#         logger.error(f"Error in handle_incoming_call: {e}")
        
#         # Return a fallback TwiML response
#         fallback_twiml = '''<?xml version="1.0" encoding="UTF-8"?>
#         <Response>
#             <Say voice="alice">Sorry, there was an error connecting your call. Please try again.</Say>
#         </Response>'''
        
#         return Response(
#             content=fallback_twiml,
#             media_type="application/xml",
#             status_code=200
#         )
    
@app.api_route("/incoming-call", methods=["GET", "POST"])
async def handle_incoming_call(request: Request):
    logger.info("Received incoming call request from: %s", request.client.host)
    
    try:
        # Log the request details for debugging
        form_data = await request.form()
        caller_number = form_data.get('From', 'Unknown')  # Extract caller number
        logger.info(f"Call from: {caller_number}")
        logger.info(f"Call to: {form_data.get('To', 'Unknown')}")
        call_sid = form_data.get('CallSid', 'Unknown')
        logger.info(f"Call SID: {call_sid}")
        
        # Store caller number in a global variable or pass it through the stream
        # We'll use a simple approach with a global dict
        if not hasattr(app.state, 'caller_numbers'):
            app.state.caller_numbers = {}
        app.state.caller_numbers[call_sid] = caller_number
        
        response = VoiceResponse()
        
        # Use your ngrok URL instead of direct server IP
        ngrok_host = "bream-cool-hornet.ngrok-free.app"  # Your ngrok URL
        
        connect = Connect()
        connect.stream(url=f'wss://{ngrok_host}/media-stream')  # Use wss:// with ngrok
        response.append(connect)
        
        # Convert TwiML to string
        twiml_str = str(response)
        logger.info(f"Generated TwiML: {twiml_str}")
        
        # Return as XML response with proper content type
        return Response(
            content=twiml_str,
            media_type="application/xml",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Error in handle_incoming_call: {e}")
        
        # Return a fallback TwiML response
        fallback_twiml = '''<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say voice="alice">Sorry, there was an error connecting your call. Please try again.</Say>
        </Response>'''
        
        return Response(
            content=fallback_twiml,
            media_type="application/xml",
            status_code=200
        ) 
    
def is_excessive_repetition(words):
    """Check if text has excessive repetition"""
    if len(words) < 4:
        return False
    
    # Check for word repetition
    word_counts = {}
    for word in words:
        word_counts[word] = word_counts.get(word, 0) + 1
    
    max_repetition = max(word_counts.values())
    if max_repetition > len(words) * 0.6:  # More than 60% repetition
        return True
    
    # Check for phrase repetition
    if len(words) >= 6:
        phrases = []
        for i in range(len(words) - 2):
            phrase = " ".join(words[i:i+3])
            phrases.append(phrase)
        
        phrase_counts = {}
        for phrase in phrases:
            phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1
        
        if phrases and max(phrase_counts.values()) > 2:
            return True
    
    return False

# Also reduce media event logging
@app.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    logger.info("WebSocket connection attempt...")
    
    try:
        await websocket.accept()
        logger.info("✅ Client connected to media stream")

        stream_sid = None
        call_state = None
        media_count = 0

        async for message in websocket.iter_text():
            try:
                data = json.loads(message)
                
                if data["event"] == "media":
                    media_count += 1
                    if media_count % 100 == 0:
                        logger.info(f"Processed {media_count} media events")
                elif data["event"] != "media":
                    logger.info(f"Received event: {data.get('event', 'unknown')}")

                if data["event"] == "start":
                    stream_sid = data["start"]["streamSid"]
                    call_sid = data["start"]["callSid"]  # Extract call SID from start event
                    logger.info(f"🎵 Media stream started: {stream_sid}")
                    
                    # Get caller number from stored data
                    caller_number = None
                    if hasattr(app.state, 'caller_numbers') and call_sid in app.state.caller_numbers:
                        caller_number = app.state.caller_numbers[call_sid]
                        logger.info(f"📞 Caller number: {caller_number}")
                    
                    call_id = f"{stream_sid}_{int(time.time())}"
                    call_state = CallState(call_id, caller_number)  # Pass caller number
                    call_states[stream_sid] = call_state
                                        
                    # Send initial greeting
                    greeting = "Hello, this is emergency services, How can I help you today?"
                    logger.info("🎤 Sending initial greeting...")
                    audio_data = await synthesize_speech(greeting, call_state)
                    if audio_data:
                        await send_audio_to_twilio(websocket, stream_sid, audio_data)

                elif data["event"] == "media" and call_state:
                    payload = base64.b64decode(data["media"]["payload"])
                    call_state.audio_buffer.extend(payload)
                    
                    # CHANGED: Process more frequently - every 320 bytes (40ms)
                    if len(call_state.audio_buffer) >= 640:  # Process every 80ms instead of 40ms
                        asyncio.create_task(process_audio_chunk(call_state, websocket, stream_sid))

                elif data["event"] == "stop":
                    logger.info("🛑 Media stream stopped")
                    
                    if call_state:
                        # Process any remaining audio
                        if call_state.is_recording and len(call_state.speech_buffer) > 800:
                            logger.info("🔄 Processing remaining speech buffer...")
                            await process_speech_buffer_improved(call_state, websocket, stream_sid)
                        
                        conversation_data = await call_state.save_conversation_log()
                        logger.info(f"📞 Call completed. Total entries: {len(call_state.conversation_log)}")
                        
                        if stream_sid in call_states:
                            del call_states[stream_sid]
                    
                    break
                    
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON decode error: {e}")
                continue
            except Exception as e:
                logger.error(f"❌ Error processing message: {e}")
                continue

    except WebSocketDisconnect:
        logger.info("🔌 WebSocket disconnected.")
        if stream_sid and stream_sid in call_states:
            call_state = call_states[stream_sid]
            await call_state.save_conversation_log()
            del call_states[stream_sid]
    except Exception as e:
        logger.error(f"❌ Error in media stream: {e}")
        if stream_sid and stream_sid in call_states:
            call_state = call_states[stream_sid]
            await call_state.save_conversation_log()
            del call_states[stream_sid]

async def process_llm_response(call_state: CallState, websocket: WebSocket, stream_sid: str, transcript: str):
    """Process LLM response without blocking speech detection"""
    try:
        if call_state.processing_llm:
            return
            
        call_state.processing_llm = True
        
        # Process LLM and TTS in parallel, pass caller number
        llm_task = asyncio.create_task(query_llm(transcript, call_state.caller_number))
        
        response_text = await llm_task
        logger.info(f"🤖 LLM responded: {response_text}")

        if response_text:
            # Generate TTS audio
            audio_reply = await synthesize_speech(response_text, call_state)
            if audio_reply:
                await send_audio_to_twilio(websocket, stream_sid, audio_reply)
        
    except Exception as e:
        logger.error(f"Error in process_llm_response: {e}")
    finally:
        call_state.processing_llm = False

async def process_recorded_speech(call_state: CallState, websocket: WebSocket, stream_sid: str):
    """Completely fixed speech processing - no distortion"""
    try:
        if len(call_state.speech_buffer) < 1600:
            logger.warning(f"Speech buffer too small: {len(call_state.speech_buffer)} bytes")
            return
        
        logger.info(f"🎵 Processing recorded speech: {len(call_state.speech_buffer)} bytes")
        
        # Convert to PCM with corrected conversion
        pcm_data = ulaw_to_pcm(bytes(call_state.speech_buffer))
        
        if len(pcm_data) == 0:
            logger.error("Failed to convert μ-law to PCM")
            return
        
        # Debug: Log PCM statistics
        logger.info(f"PCM stats - Min: {np.min(pcm_data)}, Max: {np.max(pcm_data)}, Mean: {np.mean(pcm_data):.1f}, Std: {np.std(pcm_data):.1f}")
        
        # Create audio segment - NO PROCESSING to avoid distortion
        audio_segment = AudioSegment(
            pcm_data.tobytes(),
            frame_rate=8000,
            sample_width=2,
            channels=1
        )
        
        # CRITICAL: Do NOT apply any audio effects - they cause distortion
        # Just upsample to 16kHz for Whisper
        audio_segment_16k = audio_segment.set_frame_rate(16000)
        
        # Save the RAW, unprocessed audio for Whisper
        call_state.debug_audio_counter += 1
        debug_audio_path = os.path.join(RECORDINGS_DIR, f"raw_speech_{call_state.call_id}_{call_state.debug_audio_counter}.wav")
        
        # Export as 16-bit PCM WAV (no compression)
        audio_segment_16k.export(
            debug_audio_path, 
            format="wav",
            parameters=["-acodec", "pcm_s16le"]  # Force 16-bit PCM
        )
        
        # Log audio characteristics
        logger.info(f"💾 Raw audio saved: {debug_audio_path}")
        logger.info(f"Audio duration: {len(audio_segment_16k) / 1000.0:.2f}s")
        logger.info(f"Audio level: {audio_segment_16k.dBFS:.1f} dBFS")
        
        # Add original audio to conversation recording (8kHz version)
        call_state.add_audio_to_conversation(audio_segment)
        
        # Transcribe using Whisper with optimized settings
        try:
            segments, info = whisper_model.transcribe(
                debug_audio_path,
                beam_size=5,  # Increased beam size for better accuracy
                task="transcribe",
                language="en",
                no_speech_threshold=0.2,  # Lower threshold for phone audio
                condition_on_previous_text=False,
                temperature=0.0,
                vad_filter=False,  # Disable VAD since we already did VAD
                suppress_tokens=[-1],
                initial_prompt="This is a phone call to emergency services.",
                word_timestamps=True  # Enable word-level timestamps
            )
            
            logger.info(f"Whisper detected language: {info.language} (confidence: {info.language_probability:.2f})")
            
            # Extract transcript with word-level confidence
            transcript_parts = []
            for segment in segments:
                text = segment.text.strip()
                if text and len(text) > 1:
                    transcript_parts.append(text)
                    logger.info(f"📝 Segment: '{text}' (avg_logprob: {segment.avg_logprob:.2f})")
                    
                    # Log word-level details if available
                    if hasattr(segment, 'words') and segment.words:
                        word_details = [f"{word.word}({word.probability:.2f})" for word in segment.words[:3]]
                        logger.info(f"   First words: {' '.join(word_details)}")
            
            transcript = " ".join(transcript_parts).strip()
            
            if transcript and len(transcript) > 2:
                logger.info(f"📝 FINAL TRANSCRIPT: '{transcript}'")
                call_state.add_conversation_entry("user", transcript)
                
                # Process LLM response
                if not call_state.processing_llm:
                    asyncio.create_task(process_llm_response(call_state, websocket, stream_sid, transcript))
            else:
                logger.info("📝 No meaningful transcript produced - checking audio quality")
                # Log additional debug info when transcription fails
                logger.info(f"Audio RMS: {audio_segment_16k.rms}, Max amplitude: {audio_segment_16k.max}")
                
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Keep debug file for analysis if transcription failed
        if not transcript or len(transcript) <= 2:
            logger.info(f"Keeping debug file for analysis: {debug_audio_path}")
        else:
            # Clean up debug file after successful processing
            try:
                os.unlink(debug_audio_path)
            except:
                pass
        
        # Reset speech buffer
        call_state.speech_buffer = bytearray()
        
    except Exception as e:
        logger.error(f"Error processing recorded speech: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

async def process_audio_chunk(call_state: CallState, websocket: WebSocket, stream_sid: str):
    """Improved audio chunk processing with better VAD using lookup table"""
    if len(call_state.audio_buffer) < 320:
        return
    
    try:
        chunk = bytes(call_state.audio_buffer[:320])
        call_state.audio_buffer = call_state.audio_buffer[320:]
        
        # Convert to PCM using lookup table
        pcm_data = ulaw_to_pcm(chunk)
        if len(pcm_data) == 0:
            return
        
        # Calculate energy metrics with proper scaling
        pcm_float = pcm_data.astype(np.float64)
        rms = np.sqrt(np.mean(pcm_float ** 2))
        max_amplitude = np.max(np.abs(pcm_data))
        
        # Zero crossing rate for voice activity
        zero_crossings = np.sum(np.diff(np.signbit(pcm_data)))
        
        # Energy in dB (proper reference for 16-bit audio)
        if rms > 1.0:
            energy_db = 20 * np.log10(rms / 32767.0)
        else:
            energy_db = -80
        
        current_time = time.time()
        print("energy_db",energy_db)
        # Adjusted thresholds for better detection
        energy_threshold = energy_db > -45    # Better threshold for phone audio
        rms_threshold = rms > 500            # Adjusted for lookup table values
        amplitude_threshold = max_amplitude > 2000
        voice_activity = zero_crossings > 8
        
        criteria_met = sum([energy_threshold, rms_threshold, amplitude_threshold, voice_activity])
        is_speech = criteria_met >= 2
        
        # Debug logging
        if hasattr(call_state, 'debug_counter'):
            call_state.debug_counter += 1
        else:
            call_state.debug_counter = 1
            
        if call_state.debug_counter % 25 == 0:
            logger.info(f"🔊 Audio - Energy: {energy_db:.1f}dB, RMS: {rms:.0f}, Max: {max_amplitude}, ZC: {zero_crossings}, Speech: {is_speech}")
        
        # Rest of the speech detection logic remains the same...
        if is_speech:
            call_state.last_speech_time = current_time
            
            if not call_state.is_recording:
                call_state.is_recording = True
                call_state.speech_buffer = bytearray()
                call_state.speech_start_time = current_time
                call_state.silence_start_time = None
                logger.info(f"🎙️ RECORDING START - Energy: {energy_db:.1f}dB")
            
            if call_state.is_recording:
                call_state.speech_buffer.extend(chunk)
                call_state.silence_start_time = None
                
        else:
            if call_state.is_recording:
                call_state.speech_buffer.extend(chunk)
                
                if call_state.silence_start_time is None:
                    call_state.silence_start_time = current_time
                    
                silence_duration = current_time - call_state.silence_start_time
                speech_duration = current_time - call_state.speech_start_time
                
                if (silence_duration >= 1.5 and speech_duration >= 0.8):
                    call_state.is_recording = False
                    logger.info(f"🔇 RECORDING STOP - Duration: {speech_duration:.1f}s")
                    
                    if len(call_state.speech_buffer) > 1280:
                        asyncio.create_task(process_recorded_speech(call_state, websocket, stream_sid))
        
    except Exception as e:
        logger.error(f"Error in audio chunk processing: {e}")
   
async def send_audio_to_twilio(websocket: WebSocket, stream_sid: str, audio_data: str):
    """Improved audio streaming with better timing and chunking"""
    try:
        if not audio_data:
            return
            
        audio_bytes = base64.b64decode(audio_data)
        
        # Use proper 20ms chunks for 8kHz μ-law (160 bytes per chunk)
        chunk_size = 160  # 20ms at 8kHz μ-law
        
        # Pre-calculate all chunks
        chunks = []
        for i in range(0, len(audio_bytes), chunk_size):
            chunk = audio_bytes[i:i + chunk_size]
            # Pad with μ-law silence (0x7F, not 0xFF)
            if len(chunk) < chunk_size:
                chunk = chunk + b'\x7F' * (chunk_size - len(chunk))
            chunks.append(base64.b64encode(chunk).decode('utf-8'))
        
        # Send chunks with precise timing
        start_time = asyncio.get_event_loop().time()
        
        for i, encoded_chunk in enumerate(chunks):
            audio_message = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {"payload": encoded_chunk}
            }
            
            await websocket.send_json(audio_message)
            
            # Calculate next send time for consistent 20ms intervals
            next_time = start_time + (i + 1) * 0.02
            current_time = asyncio.get_event_loop().time()
            
            if next_time > current_time:
                await asyncio.sleep(next_time - current_time)
                
    except Exception as e:
        logger.error(f"Error sending audio: {e}")

# API endpoint to retrieve call recordings
@app.get("/recordings/{call_id}")
async def get_call_recording(call_id: str):
    """Retrieve call recording and conversation log"""
    try:
        conversation_files = [f for f in os.listdir(RECORDINGS_DIR) if f.startswith(f"conversation_{call_id}")]
        
        if not conversation_files:
            return {"error": "Recording not found"}
        
        conversation_file = conversation_files[0]
        conversation_path = os.path.join(RECORDINGS_DIR, conversation_file)
        
        async with aiofiles.open(conversation_path, 'r', encoding='utf-8') as f:
            conversation_data = json.loads(await f.read())
        
        return conversation_data
        
    except Exception as e:
        logger.error(f"Error retrieving recording: {e}")
        return {"error": "Failed to retrieve recording"}

# API endpoint to list all recordings
@app.get("/recordings")
async def list_recordings():
    """List all available recordings"""
    try:
        recordings = []
        for filename in os.listdir(RECORDINGS_DIR):
            if filename.startswith("conversation_") and filename.endswith(".json"):
                file_path = os.path.join(RECORDINGS_DIR, filename)
                async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                    data = json.loads(await f.read())
                    recordings.append({
                        "call_id": data["call_id"],
                        "start_time": data["start_time"],
                        "duration_seconds": data["duration_seconds"],
                        "conversation_entries": len(data["conversation"]),
                        "conversation_recording": data.get("conversation_recording", "")
                    })
        
        return {"recordings": recordings}
        
    except Exception as e:
        logger.error(f"Error listing recordings: {e}")
        return {"error": "Failed to list recordings"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8567)