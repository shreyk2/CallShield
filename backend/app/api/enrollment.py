"""Enrollment endpoints for voice registration"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import numpy as np
from pathlib import Path

from ..services.voice_embedding import get_voice_embedding
from ..services.audio_processor import AudioProcessor
from ..config import get_settings

router = APIRouter(prefix="/enrollment", tags=["enrollment"])

audio_processor = AudioProcessor()
voice_embedding = get_voice_embedding()
settings = get_settings()


class EnrollmentRequest(BaseModel):
    user_id: str
    name: str


class EnrollmentResponse(BaseModel):
    user_id: str
    name: str
    status: str
    message: str
    embedding_dimension: Optional[int] = None


@router.post("/create", response_model=EnrollmentResponse)
async def create_enrollment(
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    name: str = Form(...)
):
    """
    Create voice enrollment for a new user.
    
    Expects:
    - user_id: Unique identifier for user (e.g., "john_doe_123")
    - name: Display name (e.g., "John Doe")
    - audio: WAV file with 10+ seconds of clear speech (16kHz, mono preferred)
    
    Returns enrollment status and embedding info.
    """
    try:
        # Validate audio file
        if not audio.filename.endswith(('.wav', '.mp3', '.m4a')):
            raise HTTPException(
                status_code=400,
                detail="Audio file must be WAV, MP3, or M4A format"
            )
        
        # Read audio data
        audio_data = await audio.read()
        
        # Convert to PCM chunks (assuming WAV format for now)
        # For production, you'd want proper format detection and conversion
        # Skip WAV header (44 bytes) if present
        if audio_data.startswith(b'RIFF'):
            audio_data = audio_data[44:]
        
        # Convert bytes to chunks
        chunk_size = 3200  # 100ms at 16kHz
        audio_chunks = [
            audio_data[i:i+chunk_size] 
            for i in range(0, len(audio_data), chunk_size)
        ]
        
        # Check minimum duration (at least 5 seconds)
        if len(audio_chunks) < 50:
            raise HTTPException(
                status_code=400,
                detail="Audio too short. Need at least 5 seconds of speech."
            )
        
        # Convert to tensor
        audio_tensor = audio_processor.concatenate_chunks(audio_chunks)
        
        # Generate embedding
        embedding = voice_embedding.compute_embedding(audio_tensor)
        
        # Save enrollment
        embeddings_dir = Path(settings.embeddings_dir)
        embeddings_dir.mkdir(parents=True, exist_ok=True)
        
        embedding_path = embeddings_dir / f"{user_id}_embedding.npy"
        np.save(embedding_path, embedding)
        
        # Save metadata
        metadata = {
            "user_id": user_id,
            "name": name,
            "embedding_dimension": len(embedding),
            "audio_duration": len(audio_tensor) / 16000
        }
        
        import json
        metadata_path = embeddings_dir / f"{user_id}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return EnrollmentResponse(
            user_id=user_id,
            name=name,
            status="success",
            message=f"Successfully enrolled {name}",
            embedding_dimension=len(embedding)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Enrollment failed: {str(e)}"
        )


@router.get("/check/{user_id}")
async def check_enrollment(user_id: str):
    """
    Check if a user is enrolled.
    
    Returns enrollment status and metadata if exists.
    """
    embeddings_dir = Path(settings.embeddings_dir)
    embedding_path = embeddings_dir / f"{user_id}_embedding.npy"
    metadata_path = embeddings_dir / f"{user_id}_metadata.json"
    
    if not embedding_path.exists():
        return {
            "enrolled": False,
            "user_id": user_id
        }
    
    # Load metadata if exists
    metadata = {}
    if metadata_path.exists():
        import json
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
    
    return {
        "enrolled": True,
        "user_id": user_id,
        **metadata
    }


@router.delete("/delete/{user_id}")
async def delete_enrollment(user_id: str):
    """
    Delete a user's enrollment.
    
    Removes embedding and metadata files.
    """
    embeddings_dir = Path(settings.embeddings_dir)
    embedding_path = embeddings_dir / f"{user_id}_embedding.npy"
    metadata_path = embeddings_dir / f"{user_id}_metadata.json"
    
    if not embedding_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"User {user_id} not enrolled"
        )
    
    # Delete files
    embedding_path.unlink()
    if metadata_path.exists():
        metadata_path.unlink()
    
    return {
        "status": "success",
        "message": f"Deleted enrollment for {user_id}"
    }


@router.get("/list")
async def list_enrollments():
    """
    List all enrolled users.
    
    Returns list of user_ids and their metadata.
    """
    embeddings_dir = Path(settings.embeddings_dir)
    
    if not embeddings_dir.exists():
        return {"users": []}
    
    users = []
    for embedding_file in embeddings_dir.glob("*_embedding.npy"):
        user_id = embedding_file.stem.replace("_embedding", "")
        metadata_path = embeddings_dir / f"{user_id}_metadata.json"
        
        user_info = {"user_id": user_id}
        if metadata_path.exists():
            import json
            with open(metadata_path, 'r') as f:
                user_info.update(json.load(f))
        
        users.append(user_info)
    
    return {"users": users}
