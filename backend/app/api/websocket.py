"""WebSocket endpoint for audio streaming"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
import torch
from ..services import get_session_manager, DeepfakeDetector
from ..services.audio_processor import AudioProcessor
from ..services.voice_embedding import get_voice_embedding
from ..services.agent_script import get_current_window
from ..services.social_engineering import SocialEngineeringDetector
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
se_detector = SocialEngineeringDetector()


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
    
    try:
        # Main audio streaming loop
        import asyncio
        from ..services.agent_script import get_total_script_duration
        
        consecutive_timeouts = 0
        max_consecutive_timeouts = 3  # Close after 15s of no data (3 x 5s)
        script_duration = get_total_script_duration()
        max_duration = script_duration + 30.0  # Script duration + 30s buffer for final caller response
        last_deepfake_check = 0.0  # Track last time we ran deepfake detection
        deepfake_interval = 5.0  # Run deepfake every 5 seconds
        
        # Social Engineering vars
        last_se_check = 0.0
        se_interval = 8.0
        se_audio_buffer = []
        
        while True:
            # Update elapsed time FIRST (before receiving audio)
            session_manager.update_elapsed_time(session_id)
            session = session_manager.get_session(session_id)
            
            if not session:
                break
            
            # Check if we've exceeded max duration
            if session.elapsed_time >= max_duration:
                break
            
            # Determine current speaker role using script-based timing
            window = get_current_window(session.elapsed_time)
            role = window["role"]
            
            # Receive binary PCM audio chunk from client with timeout
            try:
                audio_chunk = await asyncio.wait_for(
                    websocket.receive_bytes(),
                    timeout=5.0  # 5 second timeout
                )
                consecutive_timeouts = 0  # Reset on successful receive
            except asyncio.TimeoutError:
                # During agent speaking time, timeouts are expected (mic is muted)
                if role == "agent":
                    continue
                else:
                    # During caller time, count timeouts
                    consecutive_timeouts += 1
                    if consecutive_timeouts >= max_consecutive_timeouts:
                        break
                    continue
            
            # Append to raw audio buffer (all audio)
            session_manager.append_raw_audio(session_id, audio_chunk)
            
            # If caller is speaking, add to caller buffer
            if role == "caller":
                session_manager.append_caller_audio(session_id, audio_chunk)
                se_audio_buffer.append(audio_chunk)
                caller_duration = len(session.caller_audio) * 0.1  # Each chunk is ~0.1s
                
                # Check if we have enough audio to analyze (every 3 seconds of caller audio)
                if audio_processor.should_analyze(
                    session.caller_audio,
                    settings.audio_chunk_size * 3  # 3 seconds instead of 1
                ):
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
                        print(f"  ✅ Voice match score: {match_score:.3f} | Total scores: {len(session.match_scores)}")
                        
                    except Exception as e:
                        pass
                    
                    # Phase 4: Deepfake Detection (every 5 seconds)
                    # Only run if: (1) enough time has passed AND (2) we have 20+ seconds of audio
                    time_since_last_check = session.elapsed_time - last_deepfake_check
                    audio_duration = len(session.caller_audio) * 0.1  # Each chunk is 0.1s
                    
                    if time_since_last_check >= deepfake_interval and caller_duration >= 5.0:
                        try:
                            print(f"  🤖 Running deepfake detection ({caller_duration:.1f}s of audio, last check: {last_deepfake_check:.1f}s)...")
                            # Convert ALL caller_audio to WAV format
                            audio_tensor = audio_processor.concatenate_chunks(session.caller_audio)
                            # Properly convert to int16 with clipping to avoid overflow
                            audio_np = torch.clamp(audio_tensor, -1.0, 1.0).numpy()
                            pcm_bytes = (audio_np * 32767.0).astype('int16').tobytes()
                            wav_bytes = deepfake_detector.bytes_to_wav(pcm_bytes, settings.sample_rate)
                            
                            # Detect deepfake (async)
                            fake_score = await deepfake_detector.detect(wav_bytes)
                            
                            # Store fake score
                            session_manager.append_fake_score(session_id, fake_score)
                            
                            # Update last check time
                            last_deepfake_check = session.elapsed_time
                            
                        except Exception as e:
                            pass
                    
                    # Phase 5: Social Engineering Detection (every 8 seconds)
                    time_since_last_se = session.elapsed_time - last_se_check
                    se_duration = len(se_audio_buffer) * 0.1
                    
                    if time_since_last_se >= se_interval and se_duration >= 3.0:
                        try:
                            # Convert buffer to WAV
                            se_tensor = audio_processor.concatenate_chunks(se_audio_buffer)
                            se_np = torch.clamp(se_tensor, -1.0, 1.0).numpy()
                            se_pcm = (se_np * 32767.0).astype('int16').tobytes()
                            se_wav = deepfake_detector.bytes_to_wav(se_pcm, settings.sample_rate)
                            
                            # Detect
                            se_result = await se_detector.detect(se_wav)
                            
                            if se_result:
                                session_manager.append_se_result(session_id, se_result)
                            
                            # Clear buffer after check
                            se_audio_buffer = []
                            last_se_check = session.elapsed_time
                            
                        except Exception as e:
                            pass
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.close(code=1011, reason=f"Server error: {str(e)}")
        except:
            pass
    finally:
        # Always close session and websocket
        session_manager.close_session(session_id)
        try:
            await websocket.close()
        except:
            pass
