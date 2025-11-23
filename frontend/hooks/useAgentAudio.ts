import { useState, useEffect, useRef } from 'react';

interface AgentWindow {
  start: number;
  end: number;
  role: 'agent' | 'caller';
  segment_index: number | null;
}

interface ScriptSegment {
  text: string;
  duration: number;
}

export const useAgentAudio = (isRecording: boolean, sessionStartTime: number | null) => {
  const [currentSegment, setCurrentSegment] = useState<number>(-1);
  const [agentScript, setAgentScript] = useState<ScriptSegment[]>([]);
  const [windows, setWindows] = useState<AgentWindow[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch agent script on mount
  useEffect(() => {
    const fetchScript = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        console.log('[Agent Audio] Fetching script from:', `${baseUrl}/agent/script`);
        const response = await fetch(`${baseUrl}/agent/script`);
        const data = await response.json();
        console.log('[Agent Audio] Script loaded:', data);
        setAgentScript(data.script);
        setWindows(data.windows);
      } catch (error) {
        console.error('[Agent Audio] Failed to fetch agent script:', error);
      }
    };
    fetchScript();
  }, []);

  // Play agent audio based on elapsed time
  useEffect(() => {
    if (!isRecording || !sessionStartTime || windows.length === 0) {
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      setIsAgentSpeaking(false);
      return;
    }

    const checkAndPlayAudio = () => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      
      // Find current window
      const currentWindow = windows.find(w => w.start <= elapsed && elapsed < w.end);
      
      if (!currentWindow) {
        console.log('[Agent Audio] No current window found for elapsed time:', elapsed);
        return;
      }

      console.log('[Agent Audio] Current window:', currentWindow, 'elapsed:', elapsed);

      if (currentWindow.role === 'agent' && currentWindow.segment_index !== null) {
        setIsAgentSpeaking(true);
        
        // If this is a new segment, play the audio
        if (currentWindow.segment_index !== currentSegment) {
          console.log('[Agent Audio] Playing new segment:', currentWindow.segment_index);
          setCurrentSegment(currentWindow.segment_index);
          playAgentAudio(currentWindow.segment_index);
        }
      } else {
        setIsAgentSpeaking(false);
      }
    };

    // Check immediately
    checkAndPlayAudio();

    // Check every 500ms
    checkIntervalRef.current = setInterval(checkAndPlayAudio, 500);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isRecording, sessionStartTime, windows, currentSegment]);

  const playAgentAudio = async (segmentIndex: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const audioUrl = `${baseUrl}/agent/audio/${segmentIndex}?format=mp3`;
      
      console.log(`[Agent Audio] Attempting to play segment ${segmentIndex} from:`, audioUrl);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Add event listeners for debugging
      audio.onloadstart = () => console.log(`[Agent Audio] Loading audio ${segmentIndex}...`);
      audio.oncanplay = () => console.log(`[Agent Audio] Audio ${segmentIndex} ready to play`);
      audio.onerror = (e) => console.error(`[Agent Audio] Audio error for segment ${segmentIndex}:`, e);

      // Play the audio
      await audio.play();
      console.log(`[Agent Audio] Successfully started playing segment ${segmentIndex}`);

    } catch (error) {
      console.error(`[Agent Audio] Failed to play segment ${segmentIndex}:`, error);
    }
  };

  return {
    isAgentSpeaking,
    currentSegment,
    agentScript,
    currentText: currentSegment >= 0 && currentSegment < agentScript.length 
      ? agentScript[currentSegment].text 
      : null
  };
};
