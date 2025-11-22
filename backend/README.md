# CallShield Backend

Passive voice authentication and AI voice clone detection for banking calls.

## Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration management
│   ├── api/                 # API endpoints
│   │   ├── sessions.py      # POST /sessions, GET /sessions/{id}/risk
│   │   └── websocket.py     # WebSocket /ws/audio
│   ├── models/              # Pydantic schemas
│   │   └── schemas.py       # Request/response models
│   └── services/            # Core business logic
│       ├── session_manager.py    # Session state management
│       ├── audio_processor.py    # PCM audio handling
│       ├── voice_embedding.py    # SpeechBrain ECAPA-TDNN
│       ├── deepfake_detector.py  # AI clone detection
│       └── risk_engine.py        # Risk scoring logic
├── pyproject.toml           # Dependencies (uv)
└── .python-version          # Python 3.10
```

## Setup

### 1. Install uv (if not already installed)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Create virtual environment and install dependencies

```bash
cd backend
uv venv
source .venv/bin/activate  # On macOS/Linux
uv pip install -e .
```

### 3. Run the development server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using Python directly:

```bash
python -m app.main
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Implementation Phases

### Phase 1: Project Setup ✅
- [x] Directory structure
- [x] Dependencies (pyproject.toml)
- [x] Configuration management
- [x] Data models (Pydantic schemas)
- [x] Service skeletons with pseudocode

### Phase 2: Backend Core (TODO)
- [ ] Implement SessionManager
  - [ ] Session creation and storage
  - [ ] Thread-safe operations
  - [ ] Session lifecycle management
- [ ] Implement AudioProcessor
  - [ ] PCM to tensor conversion
  - [ ] Time window logic (current_role)
  - [ ] Audio buffering
- [ ] Build API endpoints
  - [ ] POST /sessions
  - [ ] GET /sessions/{id}/risk
  - [ ] WebSocket /ws/audio (basic echo)
- [ ] Test with Postman/curl

### Phase 3: Voice Verification (TODO)
- [ ] Integrate SpeechBrain ECAPA-TDNN
- [ ] Implement compute_embedding
- [ ] Implement cosine_similarity
- [ ] Create enrollment script
- [ ] Test with demo audio

### Phase 4: Deepfake Detection (TODO)
- [ ] Implement stub detector
- [ ] Add PCM to WAV conversion
- [ ] Integrate real API (when vendor chosen)
- [ ] Test detection accuracy

### Phase 5: Risk Analysis (TODO)
- [ ] Implement RiskEngine logic
- [ ] Define threshold rules
- [ ] Generate risk reasons
- [ ] End-to-end testing

### Phase 6: TTS Integration (TODO)
- [ ] Integrate Fish Audio API
- [ ] Generate agent prompts
- [ ] Stream TTS to frontend

## Configuration

Create `.env` file in `backend/` directory:

```env
# Application
DEBUG=True

# Audio
SAMPLE_RATE=16000
AUDIO_CHUNK_SIZE=16000

# Thresholds
MATCH_THRESHOLD=0.8
FAKE_THRESHOLD=0.2

# API Keys (when needed)
# DEEPFAKE_API_URL=https://api.example.com
# FISH_AUDIO_API_KEY=your_key_here
```

## Development Notes

- All service modules currently contain pseudocode
- Implementation should be done phase by phase
- Each phase builds on the previous one
- Test each component before moving to next phase
- Use stubs for external dependencies during development

## Next Steps

1. Run `uv pip install -e .` to install dependencies
2. Start implementing Phase 2 (Backend Core)
3. Begin with SessionManager implementation
4. Test API endpoints with basic session management
