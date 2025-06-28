import asyncio
import re
from typing import Optional
from openai import OpenAI
from pydantic import BaseModel
from datetime import datetime
import requests
import json
import random
import logging
import mysql.connector
from mysql.connector import Error

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Classification labels with categories and subcategories
labels = {
    "Accident": ["Car Accident", "Train Accident"],
    "Robbery": ["Chain Snatching", "Vehicle Theft"],
    "Body Offence": ["Assault", "Kidnapping", "Murder", "Attempt to Murder"],
    "Disaster": ["Flood Disaster"],
    "Offence Against Public": ["Drunken Misconduct in Public"],
    "Missing": ["Missing Child"],
    "Offence Against Women": ["Eve-Teasing", "Domestic Violence"]
}

# Crime severity mapping (1-10 scale)
severity_mapping = {
    "Car Accident": 10,
    "Train Accident": 7,
    "Chain Snatching": 8,
    "Vehicle Theft": 5,
    "Assault": 9,
    "Kidnapping": 8,
    "Murder": 10,
    "Attempt to Murder": 10,
    "Flood Disaster": 6,
    "Drunken Misconduct in Public": 5,
    "Missing Child": 9,
    "Eve-Teasing": 6,
    "Domestic Violence": 9
}

# Telugu/Indian officer names
OFFICER_NAMES = [
    "Inspector Venkatesh Rao", "SI Lakshmi Devi", "Inspector Ravi Kumar",
    "SI Priya Sharma", "Inspector Suresh Babu", "SI Anitha Reddy",
    "Inspector Rajesh Chandra", "SI Meera Nair", "Inspector Kiran Kumar",
    "SI Divya Prasad", "Inspector Mohan Reddy", "SI Sita Devi",
    "Inspector Anil Varma", "SI Padma Sree", "Inspector Srinivas Rao",
    "SI Kavitha Rani", "Inspector Ramesh Naidu", "SI Swathi Kumari",
    "Inspector Vijay Krishna", "SI Saroja Devi"
]

class PoliceComplaintProcessor:
    def __init__(self, google_api_key, db_config=None):
        self.google_api_key = google_api_key
        self.db_config = db_config 
        self.chat = OpenAI(
            base_url="http://164.52.196.116:8020/v1",
            api_key="llm-key"  # vLLM doesn't require a real API key
        )
        self.model_name = 'meta-llama/Llama-3.1-8B-Instruct'
        # Fix: Add labels as instance variable
        self.labels = labels

    def get_db_connection(self):
        """Establish database connection"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            if connection.is_connected():
                return connection
        except Error as e:
            logger.error(f"Database connection error: {e}")
        return None

    # Fix: Remove duplicate classify_complaint method and keep only one
    def classify_complaint_sync(self, text):
        """Synchronous version of classify_complaint"""
        system_prompt = f"""
        You are a classifier for police complaint texts.

        Classify the given conversation into the following categories with this format:
        MainCategory → SubCategory

        Available categories:
        {self.labels}

        If none match, return: Uncategorized

        Give only the classification result, nothing else.
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]

        try:
            response = self.chat.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.2
            )
            
            return response.choices[0].message.content.strip()
                
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return "Uncategorized"

    def extract_entities_sync(self, text):
        """Synchronous version of extract_entities"""
        entity_prompt = """
        You are an entity extractor for police complaint transcripts.

        Extract the following information from the conversation:
        - Name: Caller's name (if mentioned)
        - Phone: Phone number (if mentioned)  
        - Gender: Caller's gender (Male/Female/Unknown - infer from name, voice cues, or context)
        - Location: The most complete and specific location mentioned in the complaint. Look for the final confirmed address that includes all details like street names, landmarks, area names, and city.
        - Case_Description: A brief, clear summary of the incident that a police officer can quickly understand for immediate action.

        Return the result in this exact JSON format:
        {
            "name": "extracted name or null",
            "phone": "extracted phone or null", 
            "gender": "Male/Female/Unknown",
            "location": "extracted complete location or null",
            "case_description": "concise incident summary"
        }

        For Case_Description:
        - Write 1-2 sentences maximum
        - Include: What happened, when (if mentioned), and key suspect details
        - Use clear, direct language that helps police understand the urgency and nature of the crime
        - Focus on actionable information (crime type, suspect description, immediate threat level)
        - Examples: "Chain snatching by male suspect on black scooter wearing helmet", "House break-in reported, suspect fled on foot", "Vehicle theft from parking area, blue Honda City missing"

        For location extraction:
        - Prioritize the most detailed and confirmed address mentioned
        - Include all relevant details: landmarks, street names, area names, market names, and city
        - If the operator confirms/repeats the location for verification, use that confirmed version

        Only return the JSON, nothing else.
        """
        
        messages = [
            {"role": "system", "content": entity_prompt},
            {"role": "user", "content": text}
        ]

        try:
            response = self.chat.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.1
            )
            
            content = response.choices[0].message.content.strip()
            
            # Clean up JSON formatting if needed
            if content.startswith('```json'):
                content = content.replace('```json', '').replace('```', '').strip()
            
            return json.loads(content)
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return {"name": None, "phone": None, "gender": "Unknown", "location": None, "case_description": None}
        except Exception as e:
            logger.error(f"Entity extraction error: {e}")
            return {"name": None, "phone": None, "gender": "Unknown", "location": None, "case_description": None}

    def geocode_address(self, address):
        """Get coordinates, verified address, and district using Google Geocoding API"""
        if not address:
            return None, None, None, None
            
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': address,
            'key': self.google_api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] == 'OK' and data['results']:
                result = data['results'][0]
                
                verified_address = result['formatted_address']
                location = result['geometry']['location']
                latitude = location['lat']
                longitude = location['lng']
                
                # Extract district from address components
                verified_district = None
                for component in result['address_components']:
                    if 'administrative_area_level_3' in component['types']:
                        verified_district = component['long_name']
                        break
                    elif 'administrative_area_level_2' in component['types']:
                        verified_district = component['long_name']
                        break
                return verified_address, latitude, longitude, verified_district
            else:
                logger.warning(f"Geocoding failed: {data.get('status', 'Unknown error')}")
                return None, None, None, None
                
        except Exception as e:
            logger.error(f"Geocoding error: {e}")
            return None, None, None, None

    def parse_classification(self, classification):
        """Parse classification into crime type and subtype"""
        if "→" in classification:
            parts = classification.split("→")
            crime_type = parts[0].strip()
            crime_subtype = parts[1].strip() if len(parts) > 1 else None
        else:
            crime_type = classification.strip()
            crime_subtype = None
            
        return crime_type, crime_subtype

    def get_crime_severity(self, crime_subtype):
        """Get crime severity based on crime subtype"""
        return severity_mapping.get(crime_subtype, 5)  # Default severity 5 if not found

    def insert_into_database(self, result,ticket_id):
        """Insert processed complaint data into MySQL database"""
        print(result)
        connection = None
        cursor = None
        try:
            connection = self.get_db_connection()
            cursor = connection.cursor()
            
            # # Generate ticket ID (using timestamp and random number)
            # ticket_id = int(datetime.now().strftime("%Y%m%d%H%M%S") + str(random.randint(100, 999)))
            
            print(result['incident']['description'])
            
            insert_query = """
            INSERT INTO incident_reports (
                ticketid, caller_name, caller_phone, caller_gender, 
                crime_type, crime_subtype, severity, incident_date, 
                incident_time, transcribe_text, description, address_text, 
                verified_address, district, latitude, longitude, 
                evidence_type, officer_assigned, audio_file, review_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            values = (
                ticket_id,
                result['caller']['name'],
                result['caller']['phone'],
                result['caller']['gender'],
                result['incident']['crimeType'],
                result['incident']['crimeSubType'],
                result['incident']['severity'],
                result['incident']['date'],
                result['incident']['time'],
                result['incident'].get('description'),
                result['caller'].get('case_description'),  # description (case_description)
                result['location']['addressText'],
                result['location']['verifiedAddress'],
                result['location'].get('district'),
                result['location']['latitude'],
                result['location']['longitude'],
                result['metadata']['evidenceType'],
                result['metadata']['officerAssigned'],
                result['metadata']['audioFile'],
                result['metadata']['reviewStatus']
            )
            
            cursor.execute(insert_query, values)
            connection.commit()
            logger.info(f"Successfully inserted complaint with ticket ID: {ticket_id}")
            return ticket_id
            
        except Error as e:
            logger.error(f"Database insertion error: {e}")
            
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    def extract_phone_from_filename(self, filename: str) -> Optional[str]:
        """Extract phone number from filename pattern like AUDIO_+91_6281045730.wav"""
        if not filename:
            return None
            
        try:
            # Pattern to match phone numbers in filename
            # Matches formats like: +91_6281045730, 91_6281045730, 6281045730
            phone_pattern = r'(?:\+?91_?)?(\d{10})'
            match = re.search(phone_pattern, filename)
            
            if match:
                phone_number = match.group(1)
                # Ensure it's a valid 10-digit Indian mobile number
                if len(phone_number) == 10 and phone_number[0] in ['6', '7', '8', '9']:
                    return phone_number
                    
        except Exception as e:
            logger.warning(f"Error extracting phone from filename {filename}: {e}")
            
        return None
    
    def contains_andhra_pradesh(self, address):
        if not address:
            return False
        
        # Convert to lowercase for case-insensitive comparison
        address_lower = address.lower()
        
        # List of Andhra Pradesh variations
        ap_variations = [
            'andhra pradesh',
            'andrapradesh', 
            'andra pradesh',
            'andrapradesh',
            'andra',
            'ap'
        ]
        
        # Check if any variation is present
        return any(variation in address_lower for variation in ap_variations)
        
    def correct_address_with_llm(self, address):
        system_prompt = """  
            You are an expert address formatter for Andhra Pradesh, India. Your task is to correct, standardize, and rephrase incomplete or poorly formatted addresses while retaining all original information. Follow these rules strictly:  

            1. Grammar & Readability:  
            - Fix spelling errors (e.g., "Guntur" not "Gunturr").  
            - Use proper commas, line breaks, and capitalization (e.g., "H.No 5-6, Near Bank" not "hno 5-6 near bank").  

            2. Standard Format:  
            - Follow hierarchy: [House/Flat] → [Street/Landmark] → [Locality] → [City] → [District] → [State] → [Pincode].  
            - Example: "Door No. 8-2-1, Gandhi Road, Ameerpet, Hyderabad, Telangana 500016" → "Door No. 8-2-1, Gandhi Road, Ameerpet, Hyderabad, Telangana, 500016."  

            3. AP-Specific Conventions:  
            - Mandals: Use "Mandal" suffix (e.g., "Bapatla Mandal").  
            - Cities: Append district if missing (e.g., "Kakinada" → "Kakinada, East Godavari Dist.").  
            - Landmarks: Expand abbreviations (e.g., "APSPDCL" → "Near APSPDCL Office").  

            4. Pincodes:  
            - Add/validate 6-digit pincodes if possible (e.g., "Vijayawada" → "Vijayawada, 520001").  

            5. Output:  
            - Return only the corrected address in a single line, without explanations.  

            Example Input: "hno 22 near rly stn nellore"  
            Output: "H.No. 22, Near Railway Station, Nellore, SPSR Nellore Dist., Andhra Pradesh."  
            """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": address}
        ]
        
        try:
            response = self.chat.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0,
                max_tokens=100
            )
            
            result = response.choices[0].message.content.strip()
            logger.info(f"Address corrected: '{address}' → '{result}'")
            return result
            
        except Exception as e:
            logger.error(f"Address correction error: {e}")
            return f"{address}, Andhra Pradesh"
        
    def validate_and_correct_address(self, address):
        # First attempt to geocode the original address
        verified_address, latitude, longitude, district = self.geocode_address(address)
        
        # Check if geocoding was successful and if verified_address contains Andhra Pradesh
        if verified_address and self.contains_andhra_pradesh(verified_address) and latitude:
            return verified_address, latitude, longitude, district
        
        # If geocoding failed or Andhra Pradesh is not found, use LLM to correct the address
        logger.info(f"Address '{address}' does not contain Andhra Pradesh. Attempting correction...")
        corrected_address = self.correct_address_with_llm(address)
        
        # Re-geocode the corrected address
        verified_address, latitude, longitude, district = self.geocode_address(corrected_address)
        
        # If still no success, log the issue
        if not verified_address:
            logger.warning(f"Failed to geocode even after correction. Original: '{address}', Corrected: '{corrected_address}'")
        
        return verified_address, latitude, longitude, district



    def process_complaint(self, text, filename=None, ticket=None):
        """Main function to process police complaint"""
        
        # Use current datetime
        dt = datetime.now()
        report_date = dt.strftime("%Y-%m-%d")
        report_time = dt.strftime("%H:%M:%S")
        
        # Extract entities
        logger.info("Extracting entities...")
        entities = self.extract_entities_sync(text)
        logger.info(f"Extracted entities: {entities}")
        
        # If phone is null and filename is provided, extract phone from filename
        phone = entities.get('phone')
        print(phone)
        if ( not phone or str(phone).strip().lower() == 'null' or not (str(phone).isdigit() and len(str(phone)) == 10)) and filename:
            phone = self.extract_phone_from_filename(filename)
            logger.info(f"Extracted phone from filename: {phone}")
            entities['phone'] = phone
        
        # Classify complaint
        logger.info("Classifying complaint...")
        case_description = entities.get('case_description') or text
        classification = self.classify_complaint_sync(case_description)
        crime_type, crime_subtype = self.parse_classification(classification)
        
        # Get crime severity
        crime_severity = self.get_crime_severity(crime_subtype)
        
        # Get address from entities
        address = entities.get('location')
        
        # Geocode address
        logger.info("Geocoding address...")
        verified_address, latitude, longitude, district = self.validate_and_correct_address(address)
        
        # Assign random officer
        officer_assigned = random.choice(OFFICER_NAMES)
    
        
        # Build result in JSON format
        result = {
            "ticketId": ticket,
            "caller": {
                "name": entities.get('name'),
                "phone": entities.get('phone'),
                "gender": entities.get('gender', 'Unknown'),
                "case_description": entities.get('case_description')
            },
            "incident": {
                "crimeType": crime_type,
                "crimeSubType": crime_subtype,
                "severity": crime_severity,
                "date": report_date,
                "time": report_time,
                "description": text
            },
            "location": {
                "addressText": address,
                "verifiedAddress": verified_address,
                "latitude": latitude,
                "longitude": longitude,
                "district": district
            },
            "metadata": {
                "evidenceType": "Voice",
                "officerAssigned": officer_assigned,
                "audioFile": filename or "audioFile.wav",
                "reviewStatus": "Pending"
            }
        }
        
        # Insert into database if new ticket
        
        self.insert_into_database(result,ticket)
        
        return result


# Configuration constants
DEFAULT_GOOGLE_API_KEY = "AIzaSyDWT0N7pHNSf-SQ5ueYHwrWWuA3_aec580"
DEFAULT_DB_CONFIG = {
    'host': '164.52.196.116',
    'database': 'aihackathon',
    'user': 'aiuser',
    'password': 'Ptpl!234'
}

def create_processor(google_api_key=None, db_config=None):
    """Factory function to create a PoliceComplaintProcessor instance"""
    api_key = google_api_key or DEFAULT_GOOGLE_API_KEY
    db_conf = db_config or DEFAULT_DB_CONFIG
    return PoliceComplaintProcessor(api_key, db_conf)
