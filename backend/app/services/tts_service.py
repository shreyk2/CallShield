"""Fish Audio TTS Service for Agent Voice"""
from fishaudio import FishAudio
from fishaudio.utils import save
from typing import Optional
import tempfile
import os


class TTSService:
    """Text-to-Speech service using Fish Audio SDK"""
    
    def __init__(self, api_key: str, model: str = "fish-speech-1.5", reference_id: Optional[str] = None):
        self.client = FishAudio(api_key=api_key)
        self.model = model
        self.reference_id = reference_id
    
    async def generate_speech(
        self,
        text: str,
        format: str = "mp3",
        sample_rate: int = 16000,
        speed: float = 1.0,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> bytes:
        """
        Generate speech audio from text using Fish Audio SDK.
        
        Args:
            text: Text to convert to speech
            format: Audio format (mp3, wav, opus, flac)
            sample_rate: Audio sample rate in Hz
            speed: Speech speed multiplier (0.5 - 2.0)
            temperature: Sampling temperature for variation
            top_p: Nucleus sampling parameter
            
        Returns:
            Audio bytes in specified format
        """
        print(f"[Fish Audio] Generating TTS for: {text[:50]}...")
        print(f"[Fish Audio] Using reference_id: {self.reference_id}")
        
        try:
            # Use Fish Audio SDK to generate speech
            audio = self.client.tts.convert(
                text=text,
                reference_id=self.reference_id,
            )
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=f'.{format}', delete=False) as tmp_file:
                tmp_path = tmp_file.name
            
            # Use Fish Audio's save function
            save(audio, tmp_path)
            
            # Read the file back as bytes
            with open(tmp_path, 'rb') as f:
                audio_bytes = f.read()
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            print(f"[Fish Audio] Success! Generated {len(audio_bytes)} bytes")
            return audio_bytes
            
        except Exception as e:
            print(f"[Fish Audio] Error: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"TTS generation failed: {str(e)}")
