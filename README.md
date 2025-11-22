# CallShield

Browser-based demo showcasing passive voice authentication and AI voice clone detection for banking calls.

## Project Structure

```
CallShield/
├── PRD.md                   # Product Requirements Document
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── config.py       # Configuration
│   │   ├── api/            # REST + WebSocket endpoints
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── pyproject.toml      # Dependencies (uv)
│   └── README.md           # Backend setup guide
├── data/                    # Enrollment data
│   ├── enrollments/        # WAV files for enrollment
│   └── embeddings/         # Pre-computed speaker embeddings
└── frontend/               # React frontend (to be created)
```

## Quick Start

### Backend Setup

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e .
uvicorn app.main:app --reload
```

Visit http://localhost:8000/docs for API documentation.

## Implementation Status

- ✅ **Phase 1: Project Setup** - Backend structure with pseudocode
- ⏳ **Phase 2: Backend Core** - Session management, audio processing, API endpoints
- ⏳ **Phase 3: Voice Verification** - SpeechBrain ECAPA integration
- ⏳ **Phase 4: Deepfake Detection** - AI clone detection API
- ⏳ **Phase 5: Risk Analysis** - Risk engine and scoring
- ⏳ **Phase 6: Frontend** - React SPA with WebRTC
- ⏳ **Phase 7: TTS Integration** - Fish Audio agent prompts

## Key Technologies

- **Backend**: FastAPI, WebSockets, SpeechBrain ECAPA-TDNN, PyTorch
- **Frontend**: React, WebRTC, Web Audio API
- **Voice Auth**: Speaker embedding + cosine similarity
- **Deepfake**: Pluggable API (stub for now)

See `PRD.md` for complete requirements and `backend/README.md` for detailed setup.
