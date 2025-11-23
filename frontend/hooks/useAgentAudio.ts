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

      // Check if window changed
      const windowChanged = !currentWindowRef.current || 
        currentWindowRef.current.role !== currentWindow.role ||
        currentWindowRef.current.segment_index !== currentWindow.segment_index;

      if (windowChanged) {
        console.log('[Agent Audio] Window changed at', elapsed.toFixed(1), 's:', currentWindow);
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
          console.log('[Agent Audio] Playing new segment:', currentWindow.segment_index);
          setCurrentSegment(currentWindow.segment_index);
          playAgentAudio(currentWindow.segment_index, currentWindow.end - elapsed);
        }
      } else {
        // Caller time - stop agent audio immediately if still playing
        if (audioRef.current && !audioRef.current.paused) {
          console.log('[Agent Audio] Stopping agent audio - caller time started at', elapsed.toFixed(1), 's');
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
      
      console.log(`[Agent Audio] Playing segment ${segmentIndex}, max duration: ${maxDuration?.toFixed(1)}s`);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Add event listeners
      audio.onloadstart = () => console.log(`[Agent Audio] Loading segment ${segmentIndex}...`);
      audio.oncanplay = () => console.log(`[Agent Audio] Segment ${segmentIndex} ready, duration: ${audio.duration.toFixed(1)}s`);
      audio.onerror = (e) => console.error(`[Agent Audio] Error loading segment ${segmentIndex}:`, e);
      audio.onended = () => console.log(`[Agent Audio] Segment ${segmentIndex} finished playing`);

      // Set a timer to stop audio if it exceeds the window duration
      if (maxDuration) {
        setTimeout(() => {
          if (audioRef.current === audio && !audio.paused) {
            console.log(`[Agent Audio] Forcing stop of segment ${segmentIndex} after ${maxDuration.toFixed(1)}s`);
            audio.pause();
            audio.currentTime = 0;
          }
        }, maxDuration * 1000);
      }

      // Play the audio
      await audio.play();
      console.log(`[Agent Audio] Started playing segment ${segmentIndex}`);

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
