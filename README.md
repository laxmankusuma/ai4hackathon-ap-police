
# 🚨 Dial 112 – AI-Powered Emergency Response System

## 📌 Project Title
**Dial 112 – Intelligent Voice AI for Emergency Call Centers**

## 📝 Brief Description
This project modernizes emergency call centers (like Dial 112) using advanced AI.

Our solution begins with **Automated Audio Extraction**, where recorded 112 emergency calls are processed using a **multimodal LLM pipeline**:
- Converts speech to text using [Whisper Large v3](https://github.com/openai/whisper)
- Classifies incident type and subtype
- Extracts timestamps and infers spoken locations to accurate **GPS coordinates**

Next, a **Voice AI Agent** handles live emergency calls:
- Engages in real-time human-like conversations
- Collects caller details and confirms location
- Prioritizes incident severity

Meanwhile, a **Heatmap Agent** updates a **live crime heatmap** of Andhra Pradesh:
- Visualizes incident trends by location, time, and category
- Assists central operators in identifying and responding to crime patterns faster

The system includes a **Dashboard**, **Ticket Management**, and a **Review Agent**:
- 📊 Dashboard: Visual overview of calls, crime types, time-based activity, and location-wise heatmaps
- 🎫 Ticket Management: Automatically logs structured call data with timestamps, location, and crime classification into a central MySQL database
- ✅ Review Agent: Provides summaries and quick incident verification to assist backend teams and officers in the field

## 🚨 Problem Statement

Currently, 112 emergency call centers in India are **manual and overloaded**:
- Operators must listen, transcribe, classify, and log GPS info in real time
- Many calls come from distressed or panicked individuals
- The manual process limits **speed**, **accuracy**, and **scalability**

> Our AI-powered solution **automates**, **accelerates**, and **enhances** the end-to-end emergency response pipeline—reducing human error and response time.

## 💻 Tech Stack Used

| Component | Technology |
|----------|-------------|
| Language Models | `llama`, `qwen` |
| Speech-to-Text | `openai/whisper-large-v3` |
| Backend | `Python`, `FastAPI` |
| Frontend | `ReactJS` |
| Database | `MySQL` |

## ⚙️ Installation & Usage

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/dial-112.git
cd dial-112
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Database Setup
- Ensure MySQL is running
- Import the `schema.sql` file into your MySQL instance
- Update DB credentials in the `config.py`

## 📸 Screenshots / Demo

> (Add UI screenshots, GIFs, or demo video links here)

## 🧠 Known Issues and Future Enhancements

### 🎙️ Speech & Language
- Needs better **noise handling** and **accent recognition**
- Extend to **regional languages** for pan-India support

### ⚡ Real-Time Optimization
- Reduce latency for **live assistance** and **decision-making**

### 🧩 Legacy Integration
- Compatibility with **existing emergency systems** is in progress

### 📈 Scalability
- Extend deployment across multiple states or pan-nationally

### 🔐 Privacy & Security
- Future plans: **end-to-end encryption** and **role-based access**

### 🗺️ Location Detection
- Integrate **GIS APIs** and use **audio context cues** to validate location

### 🧠 Crime Prediction
- Improve multi-label classification (e.g., *fire + assault*)

### 📄 Officer Summarization
- Auto-generate **brief summaries** for field dispatch

### 🧪 Data & Fine-Tuning
- Explore **synthetic data generation**
- Collaborate with emergency agencies for **real-world datasets**

## 🙌 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
