"""WebSocket endpoint for audio streaming"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from ..services import get_session_manager
from ..services.audio_processor import AudioProcessor, current_role
from ..config import get_settings

router = APIRouter(tags=["websocket"])

# Initialize services
audio_processor = AudioProcessor()
settings = get_settings()


@router.websocket("/ws/audio")
async def audio_stream(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for streaming caller audio.
    
    Client sends: Binary PCM 16-bit, 16kHz, mono
    """
    # Accept WebSocket connection
    await websocket.accept()
    
    # Get session manager
    session_manager = get_session_manager()
    
    # Verify session exists
    session = session_manager.get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found")
        return
    
    print(f"WebSocket connected for session: {session_id[:8]}...")
    
    try:
        # Main audio streaming loop
        import asyncio
        consecutive_timeouts = 0
        max_consecutive_timeouts = 3  # Close after 15s of no data (3 x 5s)
        
        while True:
            # Receive binary PCM audio chunk from client with timeout
            try:
                audio_chunk = await asyncio.wait_for(
                    websocket.receive_bytes(),
                    timeout=5.0  # 5 second timeout
                )
                consecutive_timeouts = 0  # Reset on successful receive
            except asyncio.TimeoutError:
                consecutive_timeouts += 1
                print(f"  Timeout waiting for audio chunk ({consecutive_timeouts}/{max_consecutive_timeouts})...")
                if consecutive_timeouts >= max_consecutive_timeouts:
                    print(f"  → Max consecutive timeouts reached, closing connection")
                    break
                continue
            
            # Update elapsed time
            session_manager.update_elapsed_time(session_id)
            session = session_manager.get_session(session_id)
            
            if not session:
                break
            
            # Append to raw audio buffer (all audio)
            session_manager.append_raw_audio(session_id, audio_chunk)
            
            # Determine current speaker role
            role = current_role(session.elapsed_time)
            
            # Log audio reception
            duration = audio_processor.get_duration(audio_chunk)
            print(f"  [{session.elapsed_time:.1f}s] Received {len(audio_chunk)} bytes "
                  f"({duration:.2f}s) - Role: {role}")
            
            # If caller is speaking, add to caller buffer
            if role == "caller":
                session_manager.append_caller_audio(session_id, audio_chunk)
                
                # Check if we have enough audio to analyze
                if audio_processor.should_analyze(
                    session.caller_audio,
                    settings.audio_chunk_size
                ):
                    print(f"  → Caller audio buffer ready for analysis "
                          f"({len(session.caller_audio)} chunks)")
                    
                    # TODO Phase 3: Perform voice verification here
                    # - Convert caller_audio to tensor
                    # - Compute voice embedding
                    # - Calculate similarity with enrolled embedding
                    # - Append match_score to session
                    
                    # TODO Phase 4: Perform deepfake detection here
                    # - Convert caller_audio to WAV
                    # - Call deepfake detector
                    # - Append fake_score to session
                    
                    # DON'T clear the buffer yet - keep accumulating for export
                    # session.caller_audio.clear()
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session: {session_id[:8]}...")
        session_manager.close_session(session_id)
    
    except Exception as e:
        print(f"WebSocket error for session {session_id[:8]}: {e}")
        session_manager.close_session(session_id)
        await websocket.close(code=1011, reason=f"Server error: {str(e)}")
