"""Session API endpoints"""
# TODO: Implement in Phase 2 - Backend Core

from fastapi import APIRouter, HTTPException
from ..models.schemas import SessionCreate, SessionResponse, RiskResponse, RiskStatus

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session(request: SessionCreate):
    """
    Create a new call session.
    
    Implementation steps:
    1. Get SessionManager instance
    2. Call session_manager.create_session(user_id)
    3. Generate agent prompt (first greeting)
    4. Return SessionResponse with session_id and agent_prompt
    
    Agent prompt example:
    "Hello, this is SecureBank customer support. How can I help you today?"
    """
    # TODO: Implement session creation
    pass


@router.get("/{session_id}/risk", response_model=RiskResponse)
async def get_risk(session_id: str):
    """
    Get current risk assessment for session.
    
    Implementation steps:
    1. Get SessionManager instance
    2. Get session by session_id
    3. If not found, raise HTTPException 404
    4. Get RiskEngine instance
    5. Compute risk from session.match_scores and session.fake_scores
    6. Convert scores to 0-100 range
    7. Return RiskResponse with match_score, fake_score, status, reason
    """
    # TODO: Implement risk retrieval
    pass
