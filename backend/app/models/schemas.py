"""Pydantic models for API requests and responses"""
from enum import Enum
from pydantic import BaseModel, Field


class RiskStatus(str, Enum):
    """Risk status levels"""
    INITIAL = "INITIAL"
    SAFE = "SAFE"
    UNCERTAIN = "UNCERTAIN"
    HIGH_RISK = "HIGH_RISK"


class SessionCreate(BaseModel):
    """Request to create a new session"""
    user_id: str = Field(default="demo_user", description="User identifier for enrollment")


class SessionResponse(BaseModel):
    """Response after creating a session"""
    session_id: str = Field(description="Unique session identifier")
    agent_prompt: str = Field(description="Initial agent greeting")


class RiskResponse(BaseModel):
    """Real-time risk analysis response"""
    match_score: int = Field(ge=0, le=100, description="Voice match score (0-100)")
    fake_score: int = Field(ge=0, le=100, description="AI synthetic likelihood (0-100)")
    status: RiskStatus = Field(description="Overall risk status")
    status_reason: str = Field(description="Explanation of risk assessment")


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str = Field(description="Error message")
