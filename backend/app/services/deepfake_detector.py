"""Deepfake Detector - API wrapper for AI voice clone detection using Undetectable.AI"""
import httpx
import io
import wave
import asyncio
from typing import Optional


class DeepfakeDetector:
    """Detect AI-generated/synthetic speech using Undetectable.AI"""
    
    def __init__(self, api_url: str, api_key: str, user_id: str):
        """
        Initialize deepfake detector.
        
        Args:
            api_url: Base URL for Undetectable.AI API
            api_key: API key for authentication
            user_id: User ID for API requests
        """
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.user_id = user_id
        self.use_stub = not api_key or not user_id
    
    async def detect(self, audio_bytes: bytes) -> float:
        """
        Detect if audio is AI-generated using Undetectable.AI 3-step process:
        1. Get presigned URL
        2. Upload audio to presigned URL
        3. Submit for detection and poll for results
        
        Args:
            audio_bytes: WAV format audio bytes
            
        Returns:
            Probability [0, 1] that audio is synthetic (mean_ai_prob)
        """
        if self.use_stub:
            # Return stub value for demo
            return 0.0  # Return 0 to indicate no detection (will be filtered out in averaging)
        
        try:
            import time
            total_start = time.time()
            print("  🔍 Starting deepfake API detection...")
            
            # Step 1: Get presigned upload URL
            step_start = time.time()
            filename = "audio_sample.wav"
            presigned_data = await self._get_presigned_url(filename)
            presigned_url = presigned_data.get("presigned_url")
            file_path = presigned_data.get("file_path")
            print(f"    1. Got presigned URL ({time.time()-step_start:.1f}s)")
            
            if not presigned_url or not file_path:
                print(f"✗ Failed to get presigned URL: {presigned_data}")
                return 0.0
            
            # Step 2: Upload audio to presigned URL
            step_start = time.time()
            upload_success = await self._upload_audio(presigned_url, audio_bytes)
            print(f"    2. Uploaded audio ({time.time()-step_start:.1f}s, {len(audio_bytes)/1024:.1f}KB)")
            if not upload_success:
                print("✗ Failed to upload audio")
                return 0.0
            
            # Step 3: Submit for detection
            step_start = time.time()
            detection_id = await self._submit_detection(file_path)
            print(f"    3. Submitted detection ({time.time()-step_start:.1f}s)")
            if not detection_id:
                print("✗ Failed to submit detection")
                return 0.0
            
            # Step 4: Poll for results
            step_start = time.time()
            result = await self._poll_results(detection_id, max_attempts=30, delay=2)
            poll_time = time.time() - step_start
            
            if result:
                mean_ai_prob = result.get("mean_ai_prob", 0.0)
                total_time = time.time() - total_start
                print(f"    4. Got results ({poll_time:.1f}s polling)")
                print(f"  ✓ Deepfake API complete: {mean_ai_prob:.3f} ({mean_ai_prob*100:.1f}% AI) in {total_time:.1f}s total")
                return mean_ai_prob
            
            print("  ✗ Failed to get detection results")
            return 0.0
            
        except Exception as e:
            print(f"✗ Deepfake detection error: {e}")
            return 0.0
    
    async def _get_presigned_url(self, filename: str) -> dict:
        """Step 1: Get presigned upload URL"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.api_url}/get-presigned-url",
                params={"file_name": filename},
                headers={"apikey": self.api_key}
            )
            response.raise_for_status()
            return response.json()
    
    async def _upload_audio(self, presigned_url: str, audio_bytes: bytes) -> bool:
        """Step 2: Upload audio to presigned URL"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                presigned_url,
                content=audio_bytes,
                headers={
                    "Content-Type": "audio/wav",
                    "x-amz-acl": "private"
                }
            )
            return response.status_code == 200
    
    async def _submit_detection(self, file_path: str, analyze_seconds: int = 60) -> Optional[str]:
        """Step 3: Submit audio for detection"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.api_url}/detect",
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                json={
                    "key": self.api_key,
                    "url": file_path,
                    "document_type": "Audio",
                    "analyzeUpToSeconds": analyze_seconds
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("id")
    
    async def _poll_results(self, detection_id: str, max_attempts: int = 30, delay: int = 2) -> Optional[dict]:
        """Step 4: Poll for detection results"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(max_attempts):
                response = await client.post(
                    f"{self.api_url}/query",
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    json={"id": detection_id}
                )
                response.raise_for_status()
                data = response.json()
                
                status = data.get("status")
                if status == "done":
                    # Extract mean_ai_prob from result_details
                    result_details = data.get("result_details", {})
                    return result_details
                elif status == "failed":
                    print(f"✗ Detection failed: {data.get('message')}")
                    return None
                elif status in ["pending", "analyzing"]:
                    # Still processing, wait and retry
                    await asyncio.sleep(delay)
                    continue
            
            print(f"✗ Detection timed out after {max_attempts * delay}s")
            return None
    
    def bytes_to_wav(self, pcm_bytes: bytes, sample_rate: int = 16000) -> bytes:
        """
        Convert PCM bytes to WAV format for API submission.
        
        Args:
            pcm_bytes: Raw PCM audio bytes (16-bit)
            sample_rate: Sample rate in Hz
            
        Returns:
            WAV format audio bytes
        """
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_bytes)
        return buffer.getvalue()
