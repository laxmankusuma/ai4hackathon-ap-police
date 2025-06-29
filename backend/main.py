from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List
import faster_whisper
import uvicorn
import time
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
import uuid
from datetime import datetime, timedelta
import random
from police_complaint_processor import PoliceComplaintProcessor, create_processor
import pymysql


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

DB_HOST = "164.52.193.70"
DB_USER = "aiuser"
DB_PASSWORD = "Ptpl!234"
DB_NAME = "aihackathon"

def get_connection():
    return pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, cursorclass=pymysql.cursors.DictCursor)

@app.post("/transcribe")
async def transcribe_audio(files: List[UploadFile] = File(...)):
    results = []

    try:
        for file in files:
            ticket_id = int(datetime.now().strftime("%Y%m%d%H%M%S") + str(random.randint(100, 999)))
            
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

        return "Successfully Ingested"

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/total_incidents")
def total_incidents():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total_incidents FROM incident_reports;")
            result = cursor.fetchone()
        return result
    finally:
        conn.close()

@app.get("/incidents_by_crime_type")
def incidents_by_crime_type():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT crime_type, COUNT(*) AS count
                FROM incident_reports
                GROUP BY crime_type
                ORDER BY count DESC;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/incidents_by_district")
def incidents_by_district():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT district, COUNT(*) AS count
                FROM incident_reports
                GROUP BY district
                ORDER BY count DESC;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/monthly_trend")
def monthly_trend():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT DATE_FORMAT(incident_date, '%Y-%m') AS month, COUNT(*) AS count
                FROM incident_reports
                GROUP BY month
                ORDER BY month;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/gender_distribution")
def gender_distribution():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT caller_gender, COUNT(*) AS count
                FROM incident_reports
                GROUP BY caller_gender;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/common_crime_subtypes")
def common_crime_subtypes():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT crime_subtype, COUNT(*) AS count
                FROM incident_reports
                GROUP BY crime_subtype
                ORDER BY count DESC
                LIMIT 10;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/incidents_timeframe")
def incidents_timeframe(hours: int):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            since_time = datetime.now() - timedelta(hours=hours)
            cursor.execute("""
                SELECT *
                FROM incident_reports
                WHERE incident_date >= %s;
            """, (since_time,))
            result = cursor.fetchall()
        return result
    finally:
        conn.close()
        
@app.get("/incident_reports")
def incident_reports():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT *
                FROM incident_reports
                ORDER BY incident_date DESC
                limit 5;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/coordinates")
def coordinates():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, latitude, longitude
                FROM incident_reports
                WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
            """)
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/all_records")
def all_records():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM incident_reports;")
            result = cursor.fetchall()
        return result
    finally:
        conn.close()

@app.get("/")
async def root():
    return {"message": "Dial 112 Backend API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
