import { useState, useEffect } from 'react';

export const useAgentAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAgentResponse = async (text: string) => {
    // TODO: Implement TTS or playback logic for agent simulation
    setIsPlaying(true);
    console.log('Playing agent response:', text);
    setTimeout(() => setIsPlaying(false), 2000); // Mock duration
  };

  return {
    isPlaying,
    playAgentResponse,
  };
};
