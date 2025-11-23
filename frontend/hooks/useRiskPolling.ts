import { useState, useEffect, useRef } from 'react';
import { RiskResponse } from '@/types';
import { apiService } from '@/services/api';

export const useRiskPolling = (sessionId: string | null) => {
  const [riskScore, setRiskScore] = useState<RiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setRiskScore(null);
      setIsSessionActive(false);
      return;
    }

    setIsSessionActive(true);

    const pollRisk = async () => {
      try {
        // Check session status first
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/sessions/${sessionId}/status`);
        
        if (!statusResponse.ok) {
          throw new Error('Session not found');
        }
        
        const statusData = await statusResponse.json();
        
        // If session is no longer active, stop polling
        if (!statusData.active) {
          console.log('Session inactive, stopping poll');
          setIsSessionActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        // Fetch risk data
        const data = await apiService.getSessionRisk(sessionId);
        setRiskScore(data);
        setError(null);
      } catch (err) {
        console.error('Error polling risk data:', err);
        setError('Failed to fetch risk data');
        // Stop polling on error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Initial fetch
    pollRisk();

    // Start polling
    intervalRef.current = setInterval(pollRisk, 2000); // Poll every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId]);

  return {
    riskScore,
    error,
    isSessionActive
  };
};
