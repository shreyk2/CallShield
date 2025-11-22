"""WebSocket endpoint for audio streaming"""
# TODO: Implement in Phase 2 - Backend Core

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/audio")
async def audio_stream(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for streaming caller audio.
    
    Implementation steps:
    1. Accept WebSocket connection
    2. Get SessionManager instance
    3. Verify session_id exists, otherwise close with error
    4. Enter loop to receive audio chunks:
       a. Receive binary PCM data from client
       b. Update session elapsed_time
       c. Append to session.raw_audio
       d. Check current_role(elapsed_time)
       e. If role == "caller":
          - Append to session.caller_audio
          - Check if should_analyze (enough audio buffered)
          - If yes:
            * Convert caller_audio to tensor
            * Compute voice embedding + similarity
            * Run deepfake detection
            * Append scores to session
            * Clear caller_audio buffer
    5. Handle WebSocketDisconnect to cleanup
    
    Client sends: Binary PCM 16-bit, 16kHz, mono
    """
    # TODO: Implement WebSocket audio streaming
    pass
