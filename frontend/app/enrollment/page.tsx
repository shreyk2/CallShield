"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Save, Loader2, Play, Pause, ShieldCheck } from "lucide-react";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ENROLLMENT_PROMPTS = [
  "I am enrolling my voice to secure my account. My voice is my unique password that verifies my identity. By speaking this phrase, I authorize the system to create a secure voiceprint for future authentication. This process ensures that only I can access my sensitive information.",
  "Voice authentication provides a secure and convenient way to verify my identity. I am providing this sample to establish my unique voice profile. This technology analyzes the characteristics of my speech to prevent unauthorized access and protect my personal data.",
  "My voice is a unique biometric identifier that cannot be easily replicated. By recording this phrase, I am setting up an additional layer of security for my account. I understand that this voiceprint will be used solely for authentication purposes to ensure safety.",
  "Security is a top priority, and voice biometrics offer a robust solution for identity verification. I consent to the processing of my voice data to create a secure profile. This system will help distinguish my voice from others, providing a seamless login experience.",
  "I am participating in the voice enrollment process to enhance the security of my digital interactions. My voice pattern is unique to me, much like a fingerprint. By providing this audio sample, I enable the system to accurately recognize me and safeguard my account."
];

export default function EnrollmentPage() {
  const [userId, setUserId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { isRecording, audioUrl, audioBlob, startCapture, stopCapture, reset, analyser } = useAudioCapture();

  useEffect(() => {
    // Generate a random user ID on mount
    const randomId = 'user_' + Math.random().toString(36).substring(2, 9);
    setUserId(randomId);
    // Select random prompt
    setPrompt(ENROLLMENT_PROMPTS[Math.floor(Math.random() * ENROLLMENT_PROMPTS.length)]);
  }, []);

  const handleSave = async () => {
    if (!audioBlob) {
      alert('Please record audio first');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.enrollUser(userId, audioBlob);
      alert('Enrollment successful!');
    } catch (error) {
      console.error(error);
      alert('Enrollment failed: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-between py-12 px-4 text-white overflow-hidden font-sans">
      
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center opacity-50 text-xs mb-4">
        <span>Secure Enrollment</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Active</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-8 animate-in fade-in duration-700">
        
        {/* Avatar / Icon */}
        <div className="relative">
          <div className={cn(
            "absolute -inset-4 bg-purple-500/20 rounded-full blur-xl transition-opacity duration-1000",
            isRecording ? "opacity-100" : "opacity-50"
          )} />
          <Avatar className="h-32 w-32 border-4 border-slate-800 shadow-2xl">
            <AvatarFallback className="bg-slate-800 text-3xl font-light text-white">
              <ShieldCheck className="w-16 h-16 opacity-80" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Voice Enrollment</h2>
          <p className="text-slate-400 text-lg font-light">
            Create Your Unique Vocalprint
          </p>
        </div>

        {/* The Phrase */}
        <div className="w-full px-4">
            <div className="bg-black/40 backdrop-blur-md text-white/90 px-6 py-6 rounded-2xl text-center text-lg leading-relaxed shadow-lg border border-white/5">
              "{prompt}"
            </div>
        </div>

        {/* Recording Interface */}
        <div className="w-full flex flex-col items-center gap-6">
            {!audioUrl ? (
                <div className="scale-125">
                    <AIVoiceInput 
                        isRecording={isRecording}
                        analyser={analyser}
                        onStart={startCapture}
                        onStop={stopCapture}
                        visualizerBars={20}
                        className="text-white"
                    />
                </div>
            ) : (
                <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <CustomAudioPlayer src={audioUrl} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            variant="outline" 
                            className="h-12 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
                            onClick={reset}
                        >
                            Retry
                        </Button>
                        <Button 
                            className="h-12 bg-green-600 hover:bg-green-500 text-white border-0"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Submit
                        </Button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

function CustomAudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-slate-800/50 backdrop-blur-sm w-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
      </Button>
      
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400 w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <span className="text-xs font-mono text-slate-400 w-10">
          {formatTime(duration)}
        </span>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
