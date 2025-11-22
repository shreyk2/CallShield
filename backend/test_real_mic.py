"""Test WebSocket with REAL microphone audio capture"""
import asyncio
import websockets
import json
import httpx
import pyaudio
import sys

sys.path.insert(0, '/Users/shreykatyal/Documents/CallShield/backend')
from app.services.audio_utils import export_audio_to_wav

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

# Audio settings - MUST match backend
SAMPLE_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 1600  # 100ms at 16kHz
FORMAT = pyaudio.paInt16  # 16-bit


async def test_with_real_mic():
    print("=" * 60)
    print("WebSocket Audio Streaming - REAL MICROPHONE TEST")
    print("=" * 60)
    
    # Step 1: Create a session
    print("\n1. Creating session...")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/sessions",
            json={"user_id": "demo_user"}
        )
        session_data = response.json()
        session_id = session_data["session_id"]
        print(f"   ✓ Session created: {session_id[:8]}...")
        print(f"   ✓ Agent prompt: {session_data['agent_prompt']}")
    
    # Step 2: Initialize PyAudio
    print(f"\n2. Initializing microphone...")
    audio = pyaudio.PyAudio()
    
    try:
        stream = audio.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=SAMPLE_RATE,
            input=True,
            frames_per_buffer=CHUNK_SIZE
        )
        print(f"   ✓ Microphone ready (16kHz, mono, 16-bit)")
    except Exception as e:
        print(f"   ✗ Error opening microphone: {e}")
        return
    
    # Step 3: Connect WebSocket and stream
    print(f"\n3. Starting audio stream...")
    print("\n   TIME WINDOWS:")
    print("   - 0-5s: Agent speaks (DON'T TALK - not recorded)")
    print("   - 5-25s: Caller speaks (TALK NOW - recorded to buffer)")
    print("   - 25-30s: Agent speaks (DON'T TALK - not recorded)")
    print("   - 30-50s: Caller speaks (TALK NOW - recorded to buffer)")
    print("   - 50-55s: Agent speaks (DON'T TALK - not recorded)")
    print("   - 55-60s: Caller speaks (TALK NOW - recorded to buffer)")
    print("\n   Press Ctrl+C to stop early\n")
    
    ws_uri = f"{WS_URL}/ws/audio?session_id={session_id}"
    
    try:
        async with websockets.connect(ws_uri) as websocket:
            print(f"   ✓ WebSocket connected\n")
            
            import time
            start_time = time.time()
            duration = 60.0  # 60 seconds total
            
            chunk_count = 0
            while True:
                elapsed = time.time() - start_time
                
                if elapsed >= duration:
                    print(f"   → Reached {duration}s duration limit")
                    break
                
                # Read audio from mic
                try:
                    audio_chunk = stream.read(CHUNK_SIZE, exception_on_overflow=False)
                    chunk_count += 1
                    
                    # Send to WebSocket
                    await websocket.send(audio_chunk)
                    
                    # Small delay to prevent overwhelming the WebSocket buffer
                    await asyncio.sleep(0.01)  # 10ms delay to pace sends
                    
                    # Print progress every 5 seconds
                    if int(elapsed) % 5 == 0 and int(elapsed) != int(elapsed - 0.1):
                        print(f"   → {elapsed:.1f}s - Recording... (sent {chunk_count} chunks)")
                    
                except OSError as e:
                    print(f"   ✗ Microphone error at {elapsed:.1f}s: {e}")
                    break
                except Exception as e:
                    print(f"   ✗ Unexpected error at {elapsed:.1f}s: {type(e).__name__}: {e}")
                    break
            
            # Gracefully close the WebSocket
            await websocket.close()
            print(f"\n   ✓ Completed 60 seconds of recording")
    
    except KeyboardInterrupt:
        print(f"\n   ! Stopped by user")
    except websockets.exceptions.ConnectionClosed:
        print(f"\n   ✓ Connection closed gracefully")
    
    finally:
        # Cleanup
        stream.stop_stream()
        stream.close()
        audio.terminate()
        print(f"   ✓ Microphone closed")
    
    # Step 4: Get session and export caller audio
    print(f"\n4. Checking session and exporting audio...")
    async with httpx.AsyncClient() as client:
        # Check risk status
        response = await client.get(f"{BASE_URL}/sessions/{session_id}/risk")
        risk_data = response.json()
        print(f"   Status: {risk_data['status']}")
        print(f"   Reason: {risk_data['status_reason']}")
        
        # Try to export audio
        try:
            print(f"\n5. Downloading caller audio...")
            response = await client.get(f"{BASE_URL}/sessions/{session_id}/export-audio")
            if response.status_code == 200:
                # Save to file
                output_file = f"test_recording_{session_id[:8]}.wav"
                with open(output_file, 'wb') as f:
                    f.write(response.content)
                
                duration = response.headers.get('X-Audio-Duration', 'unknown')
                chunks = response.headers.get('X-Audio-Chunks', 'unknown')
                print(f"   ✓ Saved to: {output_file}")
                print(f"   ✓ Duration: {duration}s")
                print(f"   ✓ Chunks: {chunks}")
                print(f"\n   Play it with: open {output_file}")
            else:
                print(f"   ✗ Export failed: {response.status_code}")
                print(f"   ✗ {response.text}")
        except Exception as e:
            print(f"   ✗ Export error: {e}")
    
    print("\n" + "=" * 60)
    print("Test Complete! Check server logs for audio reception details.")
    print("=" * 60)


if __name__ == "__main__":
    print("\nMake sure:")
    print("1. FastAPI server is running (uvicorn app.main:app --reload)")
    print("2. Your microphone is connected and working")
    print("3. You're ready to speak during caller windows (5-25s, 30-50s, 55-60s)")
    print("\nStarting in 3 seconds...\n")
    
    import time
    time.sleep(3)
    
    asyncio.run(test_with_real_mic())
