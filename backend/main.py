from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List
import faster_whisper
import uvicorn
import time
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
import uuid
from datetime import datetime
import random
from police_complaint_processor import PoliceComplaintProcessor, create_processor


# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store temp files
tmp_file_dir = "/tmp/example-files"
Path(tmp_file_dir).mkdir(parents=True, exist_ok=True)

# Load Whisper model
model = faster_whisper.WhisperModel("large-v3")

@app.post("/transcribe/")
async def transcribe_audio(files: List[UploadFile] = File(...)):
    results = []
    ticket_id = int(datetime.now().strftime("%Y%m%d%H%M%S") + str(random.randint(100, 999)))

    try:
        for file in files:
            temp_filename = f"{uuid.uuid4()}_{file.filename}"
            file_path = os.path.join(tmp_file_dir, temp_filename)

            with open(file_path, "wb") as f:
                f.write(await file.read())

            print(f"Received file {file.filename} with {os.path.getsize(file_path)} bytes.")

            start = time.time()

            # Transcribe the audio
            segments, info = model.transcribe(file_path, beam_size=5, task="translate")
            transcript = " ".join(segment.text for segment in segments)

            duration = time.time() - start

            # Call your custom function
            processor = create_processor()
            results= processor.process_complaint(
                text=transcript,
                filename=file.filename,
                ticket=ticket_id
            )            

            os.remove(file_path)

        return results

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Dial 112 Backend API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
