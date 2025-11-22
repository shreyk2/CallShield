"""Session Manager - Manages session state and lifecycle"""
import time
import uuid
import threading
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class Session:
    """Session state container for tracking call state"""
    session_id: str
    user_id: str
    start_time: float
    # Audio buffers - will store raw PCM bytes
    raw_audio: list[bytes] = field(default_factory=list)  # All audio
    caller_audio: list[bytes] = field(default_factory=list)  # Only caller windows
    # Analysis results
    match_scores: list[float] = field(default_factory=list)  # Voice similarity scores
    fake_scores: list[float] = field(default_factory=list)  # Deepfake probabilities
    # Metadata
    elapsed_time: float = 0.0
    active: bool = True


class SessionManager:
    """Manages active sessions with thread-safe operations"""
    
    def __init__(self, max_sessions: int = 100, timeout_seconds: int = 300):
        self._sessions: Dict[str, Session] = {}
        self._lock = threading.RLock()
        self.max_sessions = max_sessions
        self.timeout_seconds = timeout_seconds
    
    def create_session(self, user_id: str = "demo_user") -> Session:
        """Create a new session"""
        with self._lock:
            # Clean up old sessions if at capacity
            if len(self._sessions) >= self.max_sessions:
                self._cleanup_old_sessions()
            
            # Generate unique session ID
            session_id = str(uuid.uuid4())
            
            # Create session object
            session = Session(
                session_id=session_id,
                user_id=user_id,
                start_time=time.time(),
            )
            
            # Store in sessions dict
            self._sessions[session_id] = session
            
            return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """Get session by ID (thread-safe)"""
        with self._lock:
            return self._sessions.get(session_id)
    
    def update_elapsed_time(self, session_id: str) -> None:
        """Update elapsed_time = current_time - start_time"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.elapsed_time = time.time() - session.start_time
    
    def append_raw_audio(self, session_id: str, audio_chunk: bytes) -> None:
        """Append audio chunk to raw_audio buffer"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.raw_audio.append(audio_chunk)
    
    def append_caller_audio(self, session_id: str, audio_chunk: bytes) -> None:
        """Append audio chunk to caller_audio buffer (only during caller windows)"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.caller_audio.append(audio_chunk)
    
    def append_match_score(self, session_id: str, score: float) -> None:
        """Append voice match score to list"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.match_scores.append(score)
    
    def append_fake_score(self, session_id: str, score: float) -> None:
        """Append deepfake probability score to list"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.fake_scores.append(score)
    
    def close_session(self, session_id: str) -> None:
        """Mark session as inactive"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                session.active = False
    
    def delete_session(self, session_id: str) -> None:
        """Remove session from manager"""
        with self._lock:
            self._sessions.pop(session_id, None)
    
    def _cleanup_old_sessions(self) -> None:
        """Remove oldest inactive or timed-out sessions"""
        current_time = time.time()
        sessions_to_remove = []
        
        for sid, session in self._sessions.items():
            age = current_time - session.start_time
            if not session.active or age > self.timeout_seconds:
                sessions_to_remove.append(sid)
        
        for sid in sessions_to_remove:
            del self._sessions[sid]


# Global instance - singleton pattern
_session_manager: Optional[SessionManager] = None


def get_session_manager() -> SessionManager:
    """Get or create global session manager instance"""
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager
