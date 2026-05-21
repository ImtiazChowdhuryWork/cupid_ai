# Cupid AI — AI Microservice

Python + FastAPI service that wraps the Claude API and returns consistent, structured flirting response suggestions.

## Why this exists

Raw Claude responses are non-deterministic — same input, different output every time. This service locks Claude into a fixed JSON schema through prompt engineering and output validation, so the Golang backend always receives predictable data.

## Setup

### 1. Install Python 3.11+

### 2. Create virtual environment

```bash
cd ai_service
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set API key

Copy `.env.example` to `.env` and add your Claude API key:

```bash
cp .env.example .env
```

Then edit `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your key from: https://console.anthropic.com

### 5. Run

```bash
uvicorn app.main:app --reload --port 8001
```

## API

### POST /analyze

Accepts a conversation, returns 5 structured response suggestions.

**Request:**
```json
{
  "conversation": "Them: Hey! How was your weekend?\nYou: Really good! Went hiking."
}
```

**Response:**
```json
{
  "suggestions": [
    { "mode": "witty",      "text": "Depends, are you asking as my therapist or just curious?", "confidence": 0.91 },
    { "mode": "sincere",    "text": "It was really peaceful actually, I needed that reset.", "confidence": 0.88 },
    { "mode": "confident",  "text": "Great. You should join me next time.", "confidence": 0.85 },
    { "mode": "thoughtful", "text": "It gave me a lot of time to think — been a heavy week.", "confidence": 0.87 },
    { "mode": "casual",     "text": "Not bad! Just got some fresh air. You?", "confidence": 0.90 }
  ],
  "sentiment": "positive"
}
```

### GET /health

```json
{ "status": "ok" }
```

## Test with Postman

1. `GET http://localhost:8001/health` — confirm service is running
2. `POST http://localhost:8001/analyze` with the JSON body above
3. Run it multiple times — the structure should always be identical
