import { useState, useCallback, useRef } from 'react';

export const useAudioCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioDataRef = useRef<Float32Array[]>([]);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Create AudioContext with 16kHz sample rate if supported
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 16000 
      });
      
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      // Use ScriptProcessor for raw PCM access (bufferSize, inputChannels, outputChannels)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      // We need to connect source -> analyser -> processor -> destination
      // Processor -> destination is needed for the script processor to fire events
      analyser.connect(processor);
      processor.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      processorRef.current = processor;
      audioDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        // Clone the data because the buffer is reused
        audioDataRef.current.push(new Float32Array(channelData));
      };

      setIsRecording(true);
      setAudioUrl(null);
      setAudioBlob(null);
      
    } catch (error) {
      console.error('Failed to start audio capture', error);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (audioContextRef.current && isRecording) {
      // Stop recording
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      
      // Process audio data
      const buffers = audioDataRef.current;
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const result = new Float32Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        result.set(buf, offset);
        offset += buf.length;
      }
      
      // Convert to WAV
      const wavBlob = encodeWAV(result, audioContextRef.current.sampleRate);
      const url = URL.createObjectURL(wavBlob);
      
      setAudioBlob(wavBlob);
      setAudioUrl(url);
      
      audioContextRef.current.close();
      audioContextRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    audioUrl,
    audioBlob,
    startCapture,
    stopCapture,
    analyser: analyserRef.current,
  };
};

// WAV Encoding Helpers
function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

