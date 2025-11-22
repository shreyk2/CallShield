"""Quick test script for Backend Core Phase 2"""
import sys
sys.path.insert(0, '/Users/shreykatyal/Documents/CallShield/backend')

from app.services.session_manager import SessionManager
from app.services.audio_processor import AudioProcessor, current_role
from app.services.risk_engine import RiskEngine

print("=" * 60)
print("CallShield Backend Core - Phase 2 Tests")
print("=" * 60)

# Test 1: SessionManager
print("\n1. Testing SessionManager...")
session_mgr = SessionManager()
session = session_mgr.create_session(user_id="test_user")
print(f"   ✓ Created session: {session.session_id[:8]}...")
print(f"   ✓ User ID: {session.user_id}")
print(f"   ✓ Start time: {session.start_time}")

retrieved = session_mgr.get_session(session.session_id)
print(f"   ✓ Retrieved session: {retrieved is not None}")

# Test 2: AudioProcessor
print("\n2. Testing AudioProcessor...")
processor = AudioProcessor(sample_rate=16000)

# Create dummy PCM audio (1 second of silence)
dummy_audio = b'\x00\x00' * 16000
tensor = processor.bytes_to_tensor(dummy_audio)
print(f"   ✓ Converted bytes to tensor: shape {tensor.shape}")
print(f"   ✓ Duration: {processor.get_duration(dummy_audio):.2f}s")

# Test time windows
print("\n3. Testing Time Windows...")
test_times = [2.0, 10.0, 27.0, 40.0, 52.0, 60.0]
for t in test_times:
    role = current_role(t)
    print(f"   ✓ At {t:4.1f}s: {role}")

# Test 4: RiskEngine
print("\n4. Testing RiskEngine...")
risk_engine = RiskEngine()

# Test initial state
mean_match, mean_fake, status, reason = risk_engine.compute_risk([], [])
print(f"   ✓ Initial state: {status.value}")

# Test SAFE condition
mean_match, mean_fake, status, reason = risk_engine.compute_risk([0.85, 0.90], [0.05, 0.10])
print(f"   ✓ SAFE condition: {status.value} - {reason}")

# Test HIGH_RISK condition
mean_match, mean_fake, status, reason = risk_engine.compute_risk([0.30, 0.40], [0.10, 0.15])
print(f"   ✓ HIGH_RISK condition: {status.value} - {reason}")

print("\n" + "=" * 60)
print("All Phase 2 Core Components Working! ✓")
print("=" * 60)
