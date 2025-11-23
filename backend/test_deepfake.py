"""Test deepfake detection with Undetectable.AI - Measure timing"""
import asyncio
import time
from pathlib import Path
from app.services.deepfake_detector import DeepfakeDetector
from app.config import get_settings

async def test_deepfake():
    print("=" * 60)
    print("Testing Deepfake Detection - Performance Measurement")
    print("=" * 60)
    
    settings = get_settings()
    
    # Check if API credentials are configured
    if not settings.deepfake_api_key or not settings.deepfake_user_id:
        print("\n⚠ No API credentials found in .env")
        print("  Add DEEPFAKE_API_KEY and DEEPFAKE_USER_ID to test real detection")
        print("\n  Will use stub mode (returns fake_score=0.0)")
        return
    else:
        print(f"\n✓ API URL: {settings.deepfake_api_url}")
        print(f"✓ User ID: {settings.deepfake_user_id[:8]}...")
    
    # Initialize detector
    detector = DeepfakeDetector(
        api_url=settings.deepfake_api_url,
        api_key=settings.deepfake_api_key,
        user_id=settings.deepfake_user_id
    )
    
    # Find test audio
    test_audio = Path("./test.mp3")
    if not test_audio.exists():
        print(f"\n✗ Test audio not found: {test_audio}")
        print("  Run: python enroll_user.py")
        return
    
    print(f"\n✓ Found test audio: {test_audio}")
    
    # Read audio file
    with open(test_audio, 'rb') as f:
        wav_bytes = f.read()
    
    file_size_kb = len(wav_bytes) / 1024
    print(f"✓ Loaded {len(wav_bytes)} bytes ({file_size_kb:.1f} KB)")
    
    # Test detection with timing
    print("\n" + "─" * 60)
    print("Starting deepfake detection...")
    print("Watch for timing breakdown:")
    print("─" * 60)
    
    start_time = time.time()
    fake_score = await detector.detect(wav_bytes)
    total_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print(f"✓ COMPLETED IN {total_time:.1f} SECONDS")
    print("=" * 60)
    print(f"\nDeepfake Score: {fake_score:.3f} ({fake_score*100:.1f}% AI probability)")
    
    # Interpret result
    if fake_score <= settings.fake_threshold:
        print(f"\n✓ SAFE - Score {fake_score:.1%} ≤ threshold {settings.fake_threshold:.1%}")
        print("  Audio appears to be human voice")
    elif fake_score <= 0.6:
        print(f"\n⚠ UNCERTAIN - Score {fake_score:.1%} is borderline")
        print("  Cannot definitively determine if AI-generated")
    else:
        print(f"\n✗ HIGH RISK - Score {fake_score:.1%} > 60%")
        print("  High probability of AI-generated voice")
    
    # Analysis
    print("\n" + "─" * 60)
    print("PERFORMANCE ANALYSIS:")
    print("─" * 60)
    if total_time < 5:
        print("✓ FAST - Good for real-time use")
    elif total_time < 15:
        print("⚠ MODERATE - Acceptable but not ideal for real-time")
    else:
        print("✗ SLOW - Too slow for real-time detection")
        print("\nSUGGESTIONS:")
        print("  • Run detection less frequently (every 5-10s instead of every 1s)")
        print("  • Run detection in background, don't block WebSocket")
        print("  • Use shorter audio clips (5-10s instead of full buffer)")
        print("  • Consider caching results or rate limiting")

if __name__ == "__main__":
    asyncio.run(test_deepfake())
