"""Voice Embedding - SpeechBrain ECAPA-TDNN for speaker verification"""
import torch
import numpy as np
from pathlib import Path
from typing import Optional


class VoiceEmbedding:
    """Speaker embedding and verification using SpeechBrain ECAPA-TDNN"""
    
    def __init__(
        self,
        model_name: str = "speechbrain/spkrec-ecapa-voxceleb",
        embeddings_dir: str = "../data/embeddings",
    ):
        self.model_name = model_name
        self.embeddings_dir = Path(embeddings_dir)
        self.embeddings_dir.mkdir(parents=True, exist_ok=True)
        self.model = None  # Lazy loaded
    
    def _load_model(self):
        """Lazy load the SpeechBrain model with torchaudio compatibility patch"""
        if self.model is None:
            # Patch torchaudio compatibility issue before importing speechbrain
            import torchaudio
            if not hasattr(torchaudio, 'list_audio_backends'):
                # Monkey patch for newer torchaudio versions
                torchaudio.list_audio_backends = lambda: ["sox", "soundfile"]
            
            from speechbrain.inference.speaker import EncoderClassifier
            
            print(f"Loading SpeechBrain model: {self.model_name}...")
            self.model = EncoderClassifier.from_hparams(
                source=self.model_name,
                savedir="pretrained_models/spkrec-ecapa-voxceleb"
            )
            print("✓ Model loaded successfully")
    
    def compute_embedding(self, audio_tensor: torch.Tensor) -> np.ndarray:
        """
        Compute speaker embedding from audio tensor.
        
        Args:
            audio_tensor: 1D tensor of audio samples (mono, 16kHz)
        
        Returns:
            192-dimensional embedding as numpy array
        """
        self._load_model()
        
        # SpeechBrain expects (batch, time)
        if audio_tensor.dim() == 1:
            audio_tensor = audio_tensor.unsqueeze(0)  # Add batch dimension
        
        # Compute embedding
        with torch.no_grad():
            embedding = self.model.encode_batch(audio_tensor)
            # embedding shape: (batch, 1, embedding_dim)
            embedding = embedding.squeeze().cpu().numpy()
        
        return embedding
    
    def cosine_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Returns:
            Similarity score in range [0, 1] where 1 = identical, 0 = opposite
        """
        # Compute cosine similarity
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        similarity = dot_product / (norm1 * norm2)
        
        # Normalize from [-1, 1] to [0, 1]
        similarity = (similarity + 1.0) / 2.0
        
        return float(similarity)
    
    def load_enrolled_embedding(self, user_id: str) -> Optional[np.ndarray]:
        """
        Load pre-computed enrollment embedding from disk.
        
        Args:
            user_id: User identifier (e.g., "demo_user")
        
        Returns:
            Embedding array or None if not found
        """
        embedding_path = self.embeddings_dir / f"{user_id}_embedding.npy"
        
        if not embedding_path.exists():
            print(f"✗ No enrollment found for user: {user_id}")
            return None
        
        embedding = np.load(embedding_path)
        print(f"✓ Loaded enrollment for {user_id}: shape {embedding.shape}")
        return embedding
    
    def verify_speaker(self, audio_tensor: torch.Tensor, user_id: str) -> float:
        """
        Verify if audio matches enrolled speaker.
        
        Args:
            audio_tensor: Audio to verify
            user_id: User to verify against
        
        Returns:
            Similarity score [0, 1] where higher = more similar
        """
        # Load enrolled embedding
        enrolled_embedding = self.load_enrolled_embedding(user_id)
        if enrolled_embedding is None:
            return 0.0  # No enrollment = no match
        
        # Compute embedding for current audio
        current_embedding = self.compute_embedding(audio_tensor)
        
        # Calculate similarity
        similarity = self.cosine_similarity(enrolled_embedding, current_embedding)
        
        return similarity


# Global instance - singleton pattern
_voice_embedding: Optional[VoiceEmbedding] = None


def get_voice_embedding() -> VoiceEmbedding:
    """Get or create global voice embedding instance"""
    global _voice_embedding
    if _voice_embedding is None:
        _voice_embedding = VoiceEmbedding()
    return _voice_embedding
