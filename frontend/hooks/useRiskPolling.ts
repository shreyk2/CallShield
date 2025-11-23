import { useState, useEffect } from 'react';
import { RiskResponse } from '@/types';
import { apiService } from '@/services/api';

export const useRiskPolling = (sessionId: string | null) => {
  const [riskScore, setRiskScore] = useState<RiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setRiskScore(null);
      return;
    }

    const pollRisk = async () => {
      try {
        const data = await apiService.getSessionRisk(sessionId);
        setRiskScore(data);
        setError(null);
      } catch (err) {
        console.error('Error polling risk data:', err);
        setError('Failed to fetch risk data');
      }
    };

    // Initial fetch
    pollRisk();

    const interval = setInterval(pollRisk, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  return {
    riskScore,
    error
  };
};
