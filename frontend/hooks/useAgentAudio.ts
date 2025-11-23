import { useState, useEffect, useRef } from 'react';

interface AgentWindow {
  start: number;
  end: number;
  role: 'agent' | 'caller';
  segment_index: number | null;
}

interface ScriptSegment {
  text: string;
  agent_duration: number;
  caller_duration: number;
}

export const useAgentAudio = (
  isRecording: boolean, 
  sessionStartTime: number | null,
  setShouldSendAudio?: (should: boolean) => void
) => {
  const [currentSegment, setCurrentSegment] = useState<number>(-1);
  const [agentScript, setAgentScript] = useState<ScriptSegment[]>([]);
  const [windows, setWindows] = useState<AgentWindow[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentWindowRef = useRef<AgentWindow | null>(null);

  // Fetch agent script on mount
  useEffect(() => {
    const fetchScript = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/agent/script`);
        const data = await response.json();
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
        return;
      }

      // Check if window changed
      const windowChanged = !currentWindowRef.current || 
        currentWindowRef.current.role !== currentWindow.role ||
        currentWindowRef.current.segment_index !== currentWindow.segment_index;

      if (windowChanged) {
        currentWindowRef.current = currentWindow;
      }

      if (currentWindow.role === 'agent' && currentWindow.segment_index !== null) {
        setIsAgentSpeaking(true);
        
        // Mute microphone to backend during agent time
        if (setShouldSendAudio) {
          setShouldSendAudio(false);
        }
        
        // If this is a new segment, play the audio
        if (currentWindow.segment_index !== currentSegment) {
          setCurrentSegment(currentWindow.segment_index);
          playAgentAudio(currentWindow.segment_index, currentWindow.end - elapsed);
        }
      } else {
        // Caller time - stop agent audio immediately if still playing
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        
        setIsAgentSpeaking(false);
        
        // Unmute microphone for caller time
        if (setShouldSendAudio) {
          setShouldSendAudio(true);
        }
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

  const playAgentAudio = async (segmentIndex: number, maxDuration?: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const audioUrl = `${baseUrl}/agent/audio/${segmentIndex}?format=mp3`;
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Add event listeners
      audio.onerror = (e) => console.error(`[Agent Audio] Error loading segment ${segmentIndex}:`, e);

      // Set a timer to stop audio if it exceeds the window duration
      if (maxDuration) {
        setTimeout(() => {
          if (audioRef.current === audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        }, maxDuration * 1000);
      }

      // Play the audio
      await audio.play();

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
