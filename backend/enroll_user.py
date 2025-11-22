"""Enrollment script - Record user voice and generate embedding"""
import asyncio
import pyaudio
import torch
import sys
from pathlib import Path

sys.path.insert(0, '/Users/shreykatyal/Documents/CallShield/backend')
from app.services.voice_embedding import VoiceEmbedding
from app.services.audio_processor import AudioProcessor

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 1600  # 100ms
FORMAT = pyaudio.paInt16


async def enroll_user(user_id: str = "demo_user", duration: int = 10):
    """
    Record audio from microphone and generate enrollment embedding.
    
    Args:
        user_id: User identifier
        duration: Recording duration in seconds (default 10s)
    """
    print("=" * 60)
    print("CallShield - User Enrollment")
    print("=" * 60)
    print(f"\nEnrolling user: {user_id}")
    print(f"Recording duration: {duration} seconds")
    print("\n⚠️  Speak clearly and naturally for the entire duration")
    print("⚠️  Avoid background noise and interruptions")
    print("\nStarting in 3 seconds...\n")
    
    await asyncio.sleep(3)
    
    # Initialize PyAudio
    audio = pyaudio.PyAudio()
    audio_processor = AudioProcessor()
    
    try:
        stream = audio.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=SAMPLE_RATE,
            input=True,
            frames_per_buffer=CHUNK_SIZE
        )
        print("🎤 Recording... SPEAK NOW!")
        
        # Record audio
        audio_chunks = []
        import time
        start_time = time.time()
        
        while True:
            elapsed = time.time() - start_time
            if elapsed >= duration:
                break
            
            chunk = stream.read(CHUNK_SIZE, exception_on_overflow=False)
            audio_chunks.append(chunk)
            
            # Progress indicator
            if int(elapsed) != int(elapsed - 0.1):
                remaining = duration - elapsed
                print(f"   {elapsed:.1f}s / {duration}s (keep speaking...)", end='\r')
        
        print(f"\n✓ Recording complete: {len(audio_chunks)} chunks ({len(audio_chunks) * 0.1:.1f}s)")
        
        # Cleanup
        stream.stop_stream()
        stream.close()
        audio.terminate()
        
    except Exception as e:
        print(f"✗ Recording error: {e}")
        return
    
    # Convert to tensor
    print("\n2. Processing audio...")
    audio_tensor = audio_processor.concatenate_chunks(audio_chunks)
    print(f"   ✓ Audio tensor shape: {audio_tensor.shape}")
    print(f"   ✓ Duration: {len(audio_tensor) / SAMPLE_RATE:.2f}s")
    
    # Generate embedding
    print("\n3. Generating voice embedding...")
    voice_embedding = VoiceEmbedding()
    embedding = voice_embedding.compute_embedding(audio_tensor)
    print(f"   ✓ Embedding shape: {embedding.shape}")
    print(f"   ✓ Embedding dimension: {len(embedding)}")
    
    # Save to disk
    print("\n4. Saving enrollment...")
    embeddings_dir = Path("../data/embeddings")
    embeddings_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = embeddings_dir / f"{user_id}_embedding.npy"
    import numpy as np
    np.save(output_path, embedding)
    print(f"   ✓ Saved to: {output_path}")
    
    # Also save the enrollment audio for reference
    from app.services.audio_utils import export_audio_to_wav
    audio_path = embeddings_dir / f"{user_id}_enrollment.wav"
    export_audio_to_wav(audio_chunks, str(audio_path))
    print(f"   ✓ Audio saved to: {audio_path}")
    
    print("\n" + "=" * 60)
    print("✓ Enrollment Complete!")
    print("=" * 60)
    print(f"\nUser '{user_id}' is now enrolled and ready for verification.")
    print(f"Embedding file: {output_path}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Enroll a user for voice verification")
    parser.add_argument("--user-id", default="demo_user", help="User identifier")
    parser.add_argument("--duration", type=int, default=10, help="Recording duration in seconds")
    
    args = parser.parse_args()
    
    asyncio.run(enroll_user(args.user_id, args.duration))
