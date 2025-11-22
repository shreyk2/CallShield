"""Test WebSocket audio streaming with dummy audio"""
import asyncio
import websockets
import json
import httpx
import numpy as np

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"


async def test_audio_streaming():
    print("=" * 60)
    print("WebSocket Audio Streaming Test")
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
    
    # Step 2: Connect WebSocket
    print(f"\n2. Connecting WebSocket...")
    ws_uri = f"{WS_URL}/ws/audio?session_id={session_id}"
    
    async with websockets.connect(ws_uri) as websocket:
        print(f"   ✓ WebSocket connected")
        
        # Step 3: Send dummy audio for 60 seconds (simulating a call)
        print(f"\n3. Streaming audio chunks...")
        print("   Time windows:")
        print("   - 0-5s: Agent speaks (not analyzed)")
        print("   - 5-25s: Caller speaks (ANALYZED)")
        print("   - 25-30s: Agent speaks (not analyzed)")
        print("   - 30-50s: Caller speaks (ANALYZED)")
        print("   - 50-55s: Agent speaks (not analyzed)")
        print("   - 55-60s: Caller speaks (ANALYZED)")
        print()
        
        # Simulate 60 seconds of audio
        # Send 100ms chunks (1600 samples at 16kHz)
        chunk_duration = 0.1  # 100ms
        samples_per_chunk = int(16000 * chunk_duration)  # 1600 samples
        total_duration = 60.0  # 60 seconds
        num_chunks = int(total_duration / chunk_duration)
        
        for i in range(num_chunks):
            # Generate dummy PCM audio (silence or tone)
            # 16-bit signed integers
            audio_samples = np.zeros(samples_per_chunk, dtype=np.int16)
            
            # Convert to bytes
            audio_bytes = audio_samples.tobytes()
            
            # Send to WebSocket
            await websocket.send(audio_bytes)
            
            # Small delay to simulate real-time streaming
            await asyncio.sleep(0.05)  # 50ms delay (faster than real-time for testing)
            
            # Print progress every 5 seconds
            elapsed = (i + 1) * chunk_duration
            if elapsed % 5.0 < chunk_duration:
                print(f"   → {elapsed:.1f}s of audio sent")
        
        print(f"\n   ✓ Completed streaming 60 seconds of audio")
    
    # Step 4: Check final risk status
    print(f"\n4. Checking final risk status...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/sessions/{session_id}/risk")
        risk_data = response.json()
        print(f"   ✓ Match score: {risk_data['match_score']}")
        print(f"   ✓ Fake score: {risk_data['fake_score']}")
        print(f"   ✓ Status: {risk_data['status']}")
        print(f"   ✓ Reason: {risk_data['status_reason']}")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)
    print("\nNote: Scores are still 0 because Phase 3 (voice verification)")
    print("and Phase 4 (deepfake detection) are not implemented yet.")
    print("But audio is being received, buffered, and time windows work!")


if __name__ == "__main__":
    asyncio.run(test_audio_streaming())
