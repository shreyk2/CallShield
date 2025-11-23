import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useAudioCapture } from './useAudioCapture';
import { RiskResponse } from '@/types';

export const useCallSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [riskStatus, setRiskStatus] = useState<RiskResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [shouldSendAudio, setShouldSendAudio] = useState(true);

  // Callback for audio data - only send when it's caller time
  const handleAudioData = useCallback((data: Int16Array) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (shouldSendAudio) {
        wsRef.current.send(data.buffer);
      }
    }
  }, [shouldSendAudio]);

  const { isRecording, startCapture, stopCapture: stopAudioCapture, analyser } = useAudioCapture(handleAudioData);

  const startCall = async () => {
    try {
      // 1. Create Session
      const session = await apiService.createSession();
      setSessionId(session.session_id);
      
      // Save to local storage for Dashboard access across tabs
      localStorage.setItem('active_session_id', session.session_id);

      // 2. Connect WebSocket
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const wsBaseUrl = baseUrl.replace(/^http/, 'ws');
      const wsUrl = `${wsBaseUrl}/ws/audio?session_id=${session.session_id}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSessionStartTime(Date.now());
        // 3. Start Audio Capture only after WS is open
        startCapture();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = useCallback(() => {
    stopAudioCapture();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setSessionStartTime(null);
    
    // Clear localStorage to stop dashboard from polling
    localStorage.removeItem('active_session_id');
    
    setSessionId(null);
    setRiskStatus(null);
  }, [stopAudioCapture]);

  // Poll for risk updates
  useEffect(() => {
    if (!sessionId || !isConnected) return;

    const interval = setInterval(async () => {
      try {
        const risk = await apiService.getSessionRisk(sessionId);
        setRiskStatus(risk);
      } catch (error) {
        console.error('Failed to fetch risk status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, isConnected]);

  return {
    sessionId,
    isRecording,
    isConnected,
    riskStatus,
    sessionStartTime,
    startCall,
    endCall,
    analyser,
    setShouldSendAudio  // Export so agent audio hook can control it
  };
};
