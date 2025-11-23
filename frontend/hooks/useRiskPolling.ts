import { useState, useEffect, useRef } from 'react';
import { RiskResponse, SessionStatus } from '@/types';
import { apiService } from '@/services/api';

export const useRiskPolling = (sessionId: string | null) => {
  const [riskScore, setRiskScore] = useState<RiskResponse | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setRiskScore(null);
      setSessionStatus(null);
      setIsSessionActive(false);
      return;
    }

    setIsSessionActive(true);

    const pollRisk = async () => {
      try {
        // Check session status first
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/sessions/${sessionId}/status`);
        
        if (!statusResponse.ok) {
          if (statusResponse.status === 404) {
            setIsSessionActive(false);
            setSessionStatus(null);
            setRiskScore(null);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return;
          }
          throw new Error('Failed to fetch session status');
        }
        
        const statusData: SessionStatus = await statusResponse.json();
        setSessionStatus(statusData);
        
        // If session is no longer active, stop polling
        if (!statusData.active) {
          setIsSessionActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        // Fetch risk data
        const data = await apiService.getSessionRisk(sessionId);
        
        // Only log if we have new Social Engineering data from OpenAI
        if (data.se_risk_level && data.se_risk_level !== 'SAFE') {
           console.group('🚨 OpenAI Social Engineering Detection');
           console.log('Risk Level:', data.se_risk_level);
           console.log('Score:', data.se_risk_score);
           console.log('Reason:', data.se_reason);
           console.log('Flagged Phrases:', data.se_flagged_phrases);
           console.groupEnd();
        } else if (data.se_risk_level) {
           // Log safe checks occasionally or just debug
           // console.log('OpenAI Check: Safe');
        }

        setRiskScore(data);
        setError(null);
      } catch (err) {
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
    sessionStatus,
    error,
    isSessionActive
  };
};
