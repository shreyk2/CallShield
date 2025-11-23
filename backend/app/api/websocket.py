"""WebSocket endpoint for audio streaming"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
import torch
from ..services import get_session_manager, DeepfakeDetector
from ..services.audio_processor import AudioProcessor
from ..services.voice_embedding import get_voice_embedding
from ..services.agent_script import get_current_window
from ..config import get_settings

router = APIRouter(tags=["websocket"])

# Initialize services
audio_processor = AudioProcessor()
voice_embedding = get_voice_embedding()
settings = get_settings()
deepfake_detector = DeepfakeDetector(
    api_url=settings.aurigin_api_url,
    api_key=settings.aurigin_api_key
)


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
        from ..services.agent_script import get_total_script_duration
        
        consecutive_timeouts = 0
        max_consecutive_timeouts = 3  # Close after 15s of no data (3 x 5s)
        script_duration = get_total_script_duration()
        max_duration = script_duration + 30.0  # Script duration + 30s buffer for final caller response
        print(f"  Script duration: {script_duration}s, Max call duration: {max_duration}s")
        last_deepfake_check = 0.0  # Track last time we ran deepfake detection
        deepfake_interval = 5.0  # Run deepfake every 5 seconds
        
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
            
            # Check if we've exceeded max duration
            if session.elapsed_time >= max_duration:
                print(f"\n✓ Reached max duration ({max_duration}s), closing connection")
                break
            
            # Append to raw audio buffer (all audio)
            session_manager.append_raw_audio(session_id, audio_chunk)
            
            # Determine current speaker role using script-based timing
            window = get_current_window(session.elapsed_time)
            role = window["role"]
            
            # Log audio reception
            duration = audio_processor.get_duration(audio_chunk)
            print(f"  [{session.elapsed_time:.1f}s] Received {len(audio_chunk)} bytes "
                  f"({duration:.2f}s) - Role: {role}")
            
            # If caller is speaking, add to caller buffer
            if role == "caller":
                session_manager.append_caller_audio(session_id, audio_chunk)
                
                # Check if we have enough audio to analyze (every 3 seconds of caller audio)
                if audio_processor.should_analyze(
                    session.caller_audio,
                    settings.audio_chunk_size * 3  # 3 seconds instead of 1
                ):
                    print(f"  → Caller audio buffer ready for analysis "
                          f"({len(session.caller_audio)} chunks)")
                    
                    # Phase 3: Voice Verification - Use ONLY last 5 seconds (50 chunks)
                    try:
                        # Use only the last 5 seconds of audio for fresh comparison
                        window_size = 50  # 50 chunks = 5 seconds at 0.1s per chunk
                        recent_audio = session.caller_audio[-window_size:] if len(session.caller_audio) >= window_size else session.caller_audio
                        
                        # Convert recent audio to tensor
                        audio_tensor = audio_processor.concatenate_chunks(recent_audio)
                        
                        # Verify against enrolled user (this is a FRESH score, not accumulated)
                        match_score = voice_embedding.verify_speaker(
                            audio_tensor,
                            session.user_id
                        )
                        
                        # Store match score
                        session_manager.append_match_score(session_id, match_score)
                        print(f"  → Voice match score: {match_score:.3f} (last {len(recent_audio)*0.1:.1f}s)")
                        
                    except Exception as e:
                        print(f"  ✗ Voice verification error: {e}")
                    
                    # Phase 4: Deepfake Detection (every 5 seconds)
                    # Only run if: (1) enough time has passed AND (2) we have 20+ seconds of audio
                    time_since_last_check = session.elapsed_time - last_deepfake_check
                    audio_duration = len(session.caller_audio) * 0.1  # Each chunk is 0.1s
                    
                    if time_since_last_check >= deepfake_interval and audio_duration >= 5.0:
                        try:
                            # Use ALL accumulated caller audio for better detection
                            print(f"  🔍 Running deepfake detection ({audio_duration:.1f}s of audio)...")
                            # Convert ALL caller_audio to WAV format
                            audio_tensor = audio_processor.concatenate_chunks(session.caller_audio)
                            # Properly convert to int16 with clipping to avoid overflow
                            audio_np = torch.clamp(audio_tensor, -1.0, 1.0).numpy()
                            pcm_bytes = (audio_np * 32767.0).astype('int16').tobytes()
                            wav_bytes = deepfake_detector.bytes_to_wav(pcm_bytes, settings.sample_rate)
                            
                            # DEBUG: Save audio to file for analysis
                            debug_path = f"debug_audio_{int(audio_duration)}s.wav"
                            with open(debug_path, 'wb') as f:
                                f.write(wav_bytes)
                            print(f"    💾 Saved audio to {debug_path} ({len(wav_bytes)/1024:.1f}KB)")
                            
                            # Detect deepfake (async)
                            fake_score = await deepfake_detector.detect(wav_bytes)
                            
                            # Store fake score
                            session_manager.append_fake_score(session_id, fake_score)
                            
                            # Update last check time
                            last_deepfake_check = session.elapsed_time
                            
                        except Exception as e:
                            print(f"  ✗ Deepfake detection error: {e}")
                    
                    # DON'T clear the buffer yet - keep accumulating for export
                    # session.caller_audio.clear()
            
    except WebSocketDisconnect:
        print(f"\n✓ WebSocket disconnected by client: {session_id[:8]}")
    except Exception as e:
        print(f"\n✗ WebSocket error for session {session_id[:8]}: {e}")
        try:
            await websocket.close(code=1011, reason=f"Server error: {str(e)}")
        except:
            pass  # Already closed
    finally:
        # Always close session and websocket
        print(f"\n✓ Cleaning up session: {session_id[:8]}")
        session_manager.close_session(session_id)
        try:
            await websocket.close()
        except:
            pass
