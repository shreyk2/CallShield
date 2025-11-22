"""Audio Processor - Handles PCM audio conversion and time windows"""
import torch
import numpy as np


def current_role(elapsed_time: float) -> str:
    """
    Determine speaker role based on elapsed time.
    
    Time windows (no diarization needed):
    - 0-5s: Agent speaks
    - 5-25s: Caller speaks (ANALYZE THIS)
    - 25-30s: Agent speaks
    - 30-50s: Caller speaks (ANALYZE THIS)
    - 50-55s: Agent speaks
    - 55s+: Caller speaks (ANALYZE THIS)
    """
    if elapsed_time < 5:
        return "agent"
    elif elapsed_time < 25:
        return "caller"
    elif elapsed_time < 30:
        return "agent"
    elif elapsed_time < 50:
        return "caller"
    elif elapsed_time < 55:
        return "agent"
    else:
        return "caller"


class AudioProcessor:
    """Process raw audio chunks and manage buffers"""
    
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
    
    def bytes_to_tensor(self, audio_bytes: bytes) -> torch.Tensor:
        """
        Convert PCM bytes to torch tensor.
        
        Args:
            audio_bytes: Raw PCM 16-bit audio bytes
            
        Returns:
            torch.Tensor: Float tensor normalized to [-1, 1]
        """
        # Convert bytes to numpy int16 array
        audio_np = np.frombuffer(audio_bytes, dtype=np.int16)
        
        # Normalize to [-1, 1] by dividing by 32768.0 (max int16 value)
        audio_float = audio_np.astype(np.float32) / 32768.0
        
        # Convert to torch tensor
        audio_tensor = torch.from_numpy(audio_float)
        
        return audio_tensor
    
    def concatenate_chunks(self, chunks: list[bytes]) -> torch.Tensor:
        """
        Concatenate multiple audio chunks into single tensor.
        
        Args:
            chunks: List of PCM byte chunks
            
        Returns:
            Concatenated audio tensor
        """
        if not chunks:
            return torch.zeros(0)
        
        # Convert each chunk to tensor
        tensors = [self.bytes_to_tensor(chunk) for chunk in chunks]
        
        # Concatenate all tensors
        return torch.cat(tensors)
    
    def should_analyze(self, caller_audio: list[bytes], chunk_size: int) -> bool:
        """
        Check if we have enough caller audio to analyze.
        
        Args:
            caller_audio: List of caller audio chunks
            chunk_size: Minimum samples needed (e.g., 16000 for 1 second)
            
        Returns:
            True if we have enough audio for analysis
        """
        # Calculate total bytes in buffer
        total_bytes = sum(len(chunk) for chunk in caller_audio)
        
        # Convert bytes to samples (16-bit = 2 bytes per sample)
        total_samples = total_bytes // 2
        
        # Check if we have enough samples
        return total_samples >= chunk_size
    
    def get_duration(self, audio_bytes: bytes) -> float:
        """Get duration in seconds of audio bytes"""
        num_samples = len(audio_bytes) // 2  # 16-bit = 2 bytes per sample
        return num_samples / self.sample_rate
