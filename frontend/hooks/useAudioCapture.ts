import { useState, useCallback } from 'react';

export const useAudioCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCapture = useCallback(async () => {
    try {
      // TODO: Implement getUserMedia logic
      setIsRecording(true);
      console.log('Starting audio capture...');
    } catch (error) {
      console.error('Failed to start audio capture', error);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    console.log('Stopped audio capture');
  }, [stream]);

  return {
    isRecording,
    startCapture,
    stopCapture,
  };
};
