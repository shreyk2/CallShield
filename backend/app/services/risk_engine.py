"""Risk Engine - Compute risk scores and status"""
from typing import Tuple
from ..models.schemas import RiskStatus


class RiskEngine:
    """Analyze risk based on voice matching and deepfake detection"""
    
    def __init__(self, match_threshold: float = 0.8, fake_threshold: float = 0.2):
        self.match_threshold = match_threshold
        self.fake_threshold = fake_threshold
    
    def compute_risk(
        self,
        match_scores: list[float],
        fake_scores: list[float],
    ) -> Tuple[float, float, RiskStatus, str]:
        """
        Compute overall risk assessment.
        
        Args:
            match_scores: List of voice similarity scores [0, 1]
            fake_scores: List of AI-generated probabilities [0, 1]
            
        Returns:
            (mean_match, mean_fake, RiskStatus, reason_text)
        """
        # Handle initial state - no scores yet
        if not match_scores and not fake_scores:
            return 0.0, 0.0, RiskStatus.INITIAL, "Waiting for caller audio..."
        
        # Compute mean scores
        mean_match = sum(match_scores) / len(match_scores) if match_scores else 0.0
        mean_fake = sum(fake_scores) / len(fake_scores) if fake_scores else 0.0
        
        # Determine status and generate reason
        status, reason = self._assess_risk(mean_match, mean_fake)
        
        return mean_match, mean_fake, status, reason
    
    def _assess_risk(self, mean_match: float, mean_fake: float) -> Tuple[RiskStatus, str]:
        """
        Apply threshold rules to determine risk status.
        
        Rules:
        - HIGH_RISK: Low match (<0.5) OR high fake (>0.6)
        - SAFE: High match (≥0.8) AND low fake (≤0.2)
        - UNCERTAIN: Everything else
        """
        # HIGH RISK conditions - immediate red flags
        if mean_match < 0.5:
            return (
                RiskStatus.HIGH_RISK,
                f"Voice match too low ({mean_match:.1%}). Caller may not be enrolled user."
            )
        
        if mean_fake > 0.6:
            return (
                RiskStatus.HIGH_RISK,
                f"High probability ({mean_fake:.1%}) of AI-generated voice. Possible deepfake attack."
            )
        
        # SAFE conditions - both metrics pass thresholds
        if mean_match >= self.match_threshold and mean_fake <= self.fake_threshold:
            return (
                RiskStatus.SAFE,
                f"Voice verified ({mean_match:.1%} match). No synthetic speech detected."
            )
        
        # UNCERTAIN - middle ground, needs monitoring
        reasons = []
        if mean_match < self.match_threshold:
            reasons.append(f"match score {mean_match:.1%}")
        if mean_fake > self.fake_threshold:
            reasons.append(f"synthetic likelihood {mean_fake:.1%}")
        
        reason_text = "Moderate risk: " + " and ".join(reasons)
        return RiskStatus.UNCERTAIN, reason_text
    
    def normalize_to_100(self, score: float) -> int:
        """Convert [0, 1] score to [0, 100] integer for UI display"""
        return int(round(score * 100))
