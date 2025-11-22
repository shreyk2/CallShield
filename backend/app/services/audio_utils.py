"""Utility functions for audio debugging and export"""
import wave
import io
from typing import List


def export_audio_to_wav(
    audio_chunks: List[bytes],
    output_path: str,
    sample_rate: int = 16000,
    channels: int = 1,
    sample_width: int = 2  # 16-bit = 2 bytes
) -> None:
    """
    Export audio buffer to WAV file.
    
    Args:
        audio_chunks: List of PCM byte chunks
        output_path: Path to save WAV file
        sample_rate: Sample rate in Hz
        channels: Number of channels (1=mono, 2=stereo)
        sample_width: Bytes per sample (2 for 16-bit)
    """
    # Concatenate all chunks
    audio_data = b''.join(audio_chunks)
    
    # Write WAV file
    with wave.open(output_path, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data)
    
    duration = len(audio_data) // (sample_width * channels) / sample_rate
    print(f"Exported {duration:.2f}s of audio to: {output_path}")


def get_audio_info(audio_chunks: List[bytes], sample_rate: int = 16000) -> dict:
    """Get information about audio buffer"""
    total_bytes = sum(len(chunk) for chunk in audio_chunks)
    total_samples = total_bytes // 2  # 16-bit
    duration = total_samples / sample_rate
    
    return {
        "num_chunks": len(audio_chunks),
        "total_bytes": total_bytes,
        "total_samples": total_samples,
        "duration_seconds": duration,
    }
