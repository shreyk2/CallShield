CallShield – Product Requirements Document (PRD)

1. Overview

CallShield is a browser based demo showcasing passive voice authentication and AI voice clone detection for simulated sensitive banking calls.
The system uses:
	•	SpeechBrain ECAPA for speaker verification
	•	Deepfake detection API (pluggable vendor)
	•	Fish Audio TTS for agent prompts
	•	WebRTC mic capture for caller audio
	•	FastAPI + WebSockets for real time audio ingestion

A risk indicator widget on the frontend displays whether:
	•	The caller’s voice matches the enrolled voice fingerprint
	•	The caller’s audio appears AI generated
	•	The overall risk level is SAFE, UNCERTAIN, or HIGH_RISK

No PSTN or Twilio integration is required. The entire call simulation happens in the browser with backend assistance.

⸻

2. Goals & Non Goals

2.1 Goals
	•	Provide a compelling end to end demo of passive voice authentication.
	•	Show real time risk scoring based on:
	•	Voice identity match
	•	AI clone detection
	•	Simulate a bank customer support call using web audio.
	•	Keep the architecture flexible enough to extend to real telephony in the future.

2.2 Non Goals
	•	Full PSTN telephony integration.
	•	Multi-party diarization or overlapping speaker detection.
	•	Long-term persistence, user management, or production security requirements.

⸻

3. Core User Experience

3.1 User Flow
	1.	User visits the CallShield demo page.
	2.	User clicks “Start Secure Call”.
	3.	Browser requests microphone permission.
	4.	Backend returns the first agent prompt and begins streaming TTS audio.
	5.	The “call” progresses through predefined time blocks:
	•	Agent speaks (Fish TTS)
	•	Caller speaks (user talks into mic)
	6.	As the caller speaks, the backend analyzes:
	•	Voice similarity to stored embedding
	•	Deepfake probability
	7.	The frontend risk card updates every second with:
	•	Match Score (0–100)
	•	Synthetic Likelihood (0–100)
	•	Final risk level
	8.	If risk is HIGH_RISK, UI displays a warning.

⸻

4. High Level Architecture

Frontend (React)
    |
    | WebSocket: Caller Audio Stream (PCM)
    |
Backend (FastAPI)
    - Session Manager
    - Audio Buffer / Time Window Logic
    - SpeechBrain ECAPA Embedding
    - Deepfake Detection API Client
    - Risk Engine
    |
    | REST: Risk Polling
    |
Frontend

4.1 Frontend Responsibilities
	•	Capture microphone audio
	•	Send audio chunks to backend WebSocket
	•	Play agent TTS responses
	•	Poll risk endpoint and render risk widget

4.2 Backend Responsibilities
	•	Manage session lifecycle
	•	Decode PCM audio
	•	Split audio into caller/agent windows
	•	Run speaker embedding + cosine similarity
	•	Run deepfake detection
	•	Store scores and compute risk
	•	Serve agent prompts and risk output

⸻

5. Key Features and Requirements

5.1 Session Management

Endpoint: POST /sessions
Returns:

{
  "session_id": "string",
  "agent_prompt": "string"
}

Creates an in memory session record containing:
	•	user_id
	•	start_time
	•	raw_audio buffer
	•	caller_audio buffer
	•	match_scores[]
	•	fake_scores[]
	•	status fields

5.2 Audio Streaming

WebSocket: /ws/audio?session_id=...

Frontend sends binary PCM chunks in 16kHz mono.
Backend:
	•	Decodes bytes → Torch tensor
	•	Tracks elapsed time
	•	Routes audio into:
	•	raw_audio (entire stream)
	•	caller_audio (if in designated user voice windows)

5.3 Time Window Logic

To avoid diarization, predetermined roles:

Time (s)	Speaker
0 – 5	Agent
5 – 25	Caller
25 – 30	Agent
30 – 50	Caller

Helper:

def current_role(t):
    ...

Only caller windows are analyzed.

5.4 Voice Embedding & Matching

Model: SpeechBrain ECAPA-TDNN (speaker verification)

Enrollment:
	•	One WAV (demo_user)
	•	Precompute embedding → demo_user_embedding.npy

Runtime:
	•	For each caller chunk:
	•	Compute embedding
	•	Compute cosine similarity vs enrolled embedding
	•	Append to match_scores

Similarity mapped to 0-100 range for UI.

5.5 Deepfake Detection

API-agnostic wrapper:

def get_fake_probability(wav_bytes) -> float:  # 0 to 1

MVP stub:
	•	Return fixed values for “legit” or “attack” scenario
	•	Replace with real API calls when ready

Append results to fake_scores.

5.6 Risk Engine

Input:
	•	mean_match (0–1)
	•	mean_fake (0–1)

Rules:
	•	SAFE: match ≥ 0.8 and fake ≤ 0.2
	•	UNCERTAIN: mid match or mid fake
	•	HIGH_RISK: low match or high fake

Returns:
	•	status
	•	status_reason text

5.7 Risk Endpoint

GET /sessions/{session_id}/risk
Returns:

{
  "match_score": int,
  "fake_score": int,
  "status": "INITIAL | SAFE | UNCERTAIN | HIGH_RISK",
  "status_reason": "string"
}

Frontend polls every 1s.

⸻

6. Frontend Requirements

6.1 UI Components
	•	Start Button
	•	Agent prompt display
	•	Risk widget:
	•	Match score bar
	•	Synthetic likelihood bar
	•	Status chip
	•	Reason text

6.2 Mic Capture

Use browser APIs:

navigator.mediaDevices.getUserMedia({ audio: true })

Send audio via WebSocket:
	•	Convert recorded chunks to 16kHz PCM

6.3 Audio Playback
	•	Fetch agent TTS audio from backend or receive via WebSocket
	•	Play via HTMLAudioElement or Web Audio API

6.4 Risk Polling

Poll once per second:
GET /sessions/{id}/risk

Render everything reactively.

⸻

7. Backend Modules

7.1 Session Manager

Responsibilities:
	•	Create sessions
	•	Store session state
	•	Track start time
	•	Manage buffers
	•	Provide synchronized access to session dict

7.2 Audio Processor

Responsibilities:
	•	Accept binary PCM chunks
	•	Convert bytes → torch float tensor
	•	Append to raw_audio
	•	Append to caller_audio if within window
	•	Trigger analysis when caller_audio reaches CHUNK_SIZE

7.3 Voice Embedding Module

Responsibilities:
	•	Load SpeechBrain ECAPA on startup
	•	Provide consistent embedding for any 1-second chunk
	•	Provide enrollment script for demo_user

7.4 Deepfake Detector

Responsibilities:
	•	Wrap API call or stub model
	•	Convert chunk to WAV bytes
	•	Parse probability

7.5 Risk Engine

Responsibilities:
	•	Compute mean scores
	•	Apply threshold rules
	•	Generate status + reason

⸻

8. Milestones (Build Order)
	1.	Backend skeleton
	•	/sessions
	•	/sessions/{id}/risk
	•	/ws/audio (echo only)
	2.	Frontend skeleton
	•	Start button
	•	Agent prompt
	•	Static risk widget
	3.	Mic capture + WebSocket streaming
	4.	Time windows + caller audio buffering
	5.	Embedding integration
	•	Enrollment script
	•	Real match scores
	6.	Deepfake stub → risk engine
	7.	TTS: fish audio agent voice
	8.	Polish UI and demo flows

⸻

9. Future Extensions
	•	Replace static windows with real diarization
	•	Add Twilio / PSTN support
	•	Multi user enrollment and login
	•	Persistent DB (Supabase/Postgres)
	•	Full analytics dashboard

⸻

10. Deliverables
	•	backend/ FastAPI service
	•	frontend/ React SPA
	•	data/demo_user_enrollment.wav
	•	data/demo_user_embedding.npy
	•	Clear run instructions in README.md
