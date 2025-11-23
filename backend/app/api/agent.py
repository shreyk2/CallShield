"""Agent TTS API endpoints"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from ..services.tts_service import TTSService
from ..services.agent_script import get_agent_segment, get_timing_windows, AGENT_SCRIPT
from ..config import get_settings
from typing import Optional

router = APIRouter(prefix="/agent", tags=["agent"])

# Initialize TTS service
settings = get_settings()
tts_service: Optional[TTSService] = None

def get_tts_service() -> TTSService:
    """Get or create TTS service instance"""
    global tts_service
    if tts_service is None:
        if not settings.fish_audio_api_key:
            raise HTTPException(
                status_code=500,
                detail="Fish Audio API key not configured"
            )
        tts_service = TTSService(
            api_key=settings.fish_audio_api_key,
            model=settings.fish_audio_model,
            reference_id=settings.fish_audio_reference_id if settings.fish_audio_reference_id else None
        )
    return tts_service


@router.get("/script")
async def get_script():
    """Get the full agent script with timing"""
    return {
        "script": AGENT_SCRIPT,
        "windows": get_timing_windows()
    }


@router.get("/audio/{segment_index}")
async def get_agent_audio(segment_index: int, format: str = "mp3"):
    """
    Generate and return agent audio for a specific script segment.
    
    Args:
        segment_index: Index of the script segment (0-based)
        format: Audio format (mp3, wav, opus, flac)
    """
    print(f"[Agent TTS] Request for segment {segment_index}")
    
    # Get the segment
    segment = get_agent_segment(segment_index)
    print(f"[Agent TTS] Segment text: {segment['text'][:50]}...")
    
    # Generate TTS
    try:
        tts = get_tts_service()
        print(f"[Agent TTS] Calling Fish Audio API...")
        
        audio_bytes = await tts.generate_speech(
            text=segment["text"],
            format=format,
            sample_rate=16000,
            speed=1.0
        )
        
        print(f"[Agent TTS] Generated {len(audio_bytes)} bytes of audio")
        
        # Determine media type
        media_types = {
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "opus": "audio/opus",
            "flac": "audio/flac"
        }
        media_type = media_types.get(format, "audio/mpeg")
        
        return Response(
            content=audio_bytes,
            media_type=media_type,
            headers={
                "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
                "Content-Disposition": f'inline; filename="agent_{segment_index}.{format}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Agent TTS] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate TTS: {str(e)}"
        )
