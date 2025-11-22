"""Session API endpoints"""
from fastapi import APIRouter, HTTPException
from ..models.schemas import SessionCreate, SessionResponse, RiskResponse, RiskStatus
from ..services import get_session_manager
from ..services.risk_engine import RiskEngine

router = APIRouter(prefix="/sessions", tags=["sessions"])

# Initialize risk engine
risk_engine = RiskEngine()


@router.post("", response_model=SessionResponse)
async def create_session(request: SessionCreate):
    """
    Create a new call session.
    
    Returns session_id and initial agent prompt.
    """
    # Get session manager
    session_manager = get_session_manager()
    
    # Create new session
    session = session_manager.create_session(user_id=request.user_id)
    
    # Generate agent greeting
    agent_prompt = (
        "Hello, this is SecureBank customer support. "
        "How can I help you today?"
    )
    
    return SessionResponse(
        session_id=session.session_id,
        agent_prompt=agent_prompt,
    )


@router.get("/{session_id}/risk", response_model=RiskResponse)
async def get_risk(session_id: str):
    """
    Get current risk assessment for session.
    
    Returns voice match score, synthetic likelihood, and overall risk status.
    """
    # Get session manager
    session_manager = get_session_manager()
    
    # Get session
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Compute risk assessment
    mean_match, mean_fake, status, reason = risk_engine.compute_risk(
        match_scores=session.match_scores,
        fake_scores=session.fake_scores,
    )
    
    # Convert to 0-100 scale for UI
    match_score = risk_engine.normalize_to_100(mean_match)
    fake_score = risk_engine.normalize_to_100(mean_fake)
    
    return RiskResponse(
        match_score=match_score,
        fake_score=fake_score,
        status=status,
        status_reason=reason,
    )


@router.get("/{session_id}/export-audio")
async def export_audio(session_id: str):
    """
    Export caller audio buffer to WAV file for verification.
    
    This is a debug endpoint to verify audio capture is working correctly.
    """
    from fastapi.responses import FileResponse
    from ..services.audio_utils import export_audio_to_wav, get_audio_info
    import tempfile
    import os
    
    # Get session manager
    session_manager = get_session_manager()
    
    # Get session
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if there's audio to export
    if not session.caller_audio:
        raise HTTPException(status_code=400, detail="No caller audio captured yet")
    
    # Get audio info
    info = get_audio_info(session.caller_audio)
    print(f"Exporting audio: {info}")
    
    # Create temporary WAV file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    temp_path = temp_file.name
    temp_file.close()
    
    # Export to WAV
    export_audio_to_wav(session.caller_audio, temp_path)
    
    # Return file
    return FileResponse(
        temp_path,
        media_type="audio/wav",
        filename=f"caller_audio_{session_id[:8]}.wav",
        headers={
            "X-Audio-Duration": str(info["duration_seconds"]),
            "X-Audio-Chunks": str(info["num_chunks"]),
        }
    )
