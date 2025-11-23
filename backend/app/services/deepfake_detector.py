"""Deepfake Detector - API wrapper for AI voice clone detection using Aurigin.AI"""
import httpx
import io
import wave
import os
from typing import Optional


class DeepfakeDetector:
    """Detect AI-generated/synthetic speech using Aurigin.AI"""
    
    def __init__(self, api_url: str, api_key: str):
        """
        Initialize deepfake detector.
        
        Args:
            api_url: Base URL for Aurigin.AI API
            api_key: API key for authentication (x-api-key header)
        """
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.use_stub = not api_key
    
    async def detect(self, audio_bytes: bytes) -> float:
        """
        Detect if audio is AI-generated using Aurigin.AI API.
        Uses multipart/form-data upload with "file" field.
        
        Args:
            audio_bytes: WAV format audio bytes
            
        Returns:
            Probability [0, 1] that audio is synthetic
        """
        if self.use_stub:
            return 0.0  # No API key configured
        
        try:
            import time
            total_start = time.time()
            print("  🔍 Starting Aurigin.AI deepfake detection...")
            
            # Prepare multipart form data
            files = {
                "file": ("recording.wav", audio_bytes, "audio/wav")
            }
            
            # Make API request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_url}/predict",
                    headers={"x-api-key": self.api_key},
                    files=files
                )
                print(f"    [DEBUG] Raw HTTP Status: {response.status_code}")
                print(f"    [DEBUG] Raw Response Text: {response.text}")
                response.raise_for_status()
                result = response.json()
            
            total_time = time.time() - total_start
            
            # Extract AI probability from response
            # Actual API format: {"predictions": ["real", "fake", ...], "global_probability": [0.001, 0.99, ...]}
            predictions = result.get("predictions", [])
            probabilities = result.get("global_probability", [])
            
            if not predictions or not probabilities:
                print(f"    ✗ Invalid API response: {result}")
                return 0.0
            
            # Count fake vs real predictions
            fake_count = sum(1 for p in predictions if p == "fake")
            total_count = len(predictions)
            
            # Calculate mean probability - these are probabilities of being FAKE
            # So we can use the mean directly as AI probability
            mean_fake_prob = sum(probabilities) / len(probabilities) if probabilities else 0.0
            
            ai_prob = mean_fake_prob
            
            print(f"  ✓ Aurigin.AI: {ai_prob:.3f} ({ai_prob*100:.1f}% AI) - {fake_count}/{total_count} fake segments in {total_time:.1f}s")
            
            return ai_prob
            
        except Exception as e:
            print(f"✗ Aurigin.AI detection error: {e}")
            return 0.0
    
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
