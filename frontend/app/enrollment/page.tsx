"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Save, Loader2, Play, Pause, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

const ENROLLMENT_PROMPTS = [
  "I am enrolling my voice to secure my account. My voice is my unique password that verifies my identity. By speaking this phrase, I authorize the system to create a secure voiceprint for future authentication. This process ensures that only I can access my sensitive information.",
  "Voice authentication provides a secure and convenient way to verify my identity. I am providing this sample to establish my unique voice profile. This technology analyzes the characteristics of my speech to prevent unauthorized access and protect my personal data.",
  "My voice is a unique biometric identifier that cannot be easily replicated. By recording this phrase, I am setting up an additional layer of security for my account. I understand that this voiceprint will be used solely for authentication purposes to ensure safety.",
  "Security is a top priority, and voice biometrics offer a robust solution for identity verification. I consent to the processing of my voice data to create a secure profile. This system will help distinguish my voice from others, providing a seamless login experience.",
  "I am participating in the voice enrollment process to enhance the security of my digital interactions. My voice pattern is unique to me, much like a fingerprint. By providing this audio sample, I enable the system to accurately recognize me and safeguard my account."
];

export default function EnrollmentPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isRecording, audioUrl, audioBlob, startCapture, stopCapture, reset, analyser } = useAudioCapture();

  useEffect(() => {
    // Generate a random user ID on mount
    const randomId = 'user_' + Math.random().toString(36).substring(2, 9);
    setUserId(randomId);
    // Select random prompt
    setPrompt(ENROLLMENT_PROMPTS[Math.floor(Math.random() * ENROLLMENT_PROMPTS.length)]);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when closed
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
        reset();
      }, 300);
    }
  };

  const handleSave = async () => {
    if (!audioBlob) {
      setStatus('error');
      setErrorMessage('Please record audio first');
      return;
    }

    setIsSaving(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await apiService.enrollUser(userId, audioBlob);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
      let msg = (error as Error).message;
      // Remove "Enrollment failed: 400: " or similar prefixes
      msg = msg.replace(/^Enrollment failed: \d+: /, '');
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center py-12 px-4 text-white overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center w-full max-w-md space-y-10 animate-in fade-in duration-700">
        
        {/* Avatar / Icon */}
        <div className="relative">
          <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl" />
          <Avatar className="h-32 w-32 border-4 border-slate-800 shadow-2xl">
            <AvatarFallback className="bg-slate-800 text-3xl font-light text-white">
              <ShieldCheck className="w-16 h-16 opacity-80" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">Voice Enrollment</h2>
          <p className="text-slate-400 text-lg font-light">
            Create your own Vocalprint
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button 
              className="h-12 px-8 text-lg bg-white text-slate-900 hover:bg-slate-200 rounded-full transition-all hover:scale-105"
            >
              Begin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md p-8">
            <DialogTitle className="sr-only">Voice Enrollment</DialogTitle>
            {status === 'success' ? (
              <div className="flex flex-col items-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Enrollment Complete</h3>
                  <p className="text-slate-400">Your voiceprint has been securely created.</p>
                </div>
                <Button onClick={() => router.push('/call')} className="w-full bg-white text-slate-900 hover:bg-slate-200">
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-8">
                
                <div className="text-center space-y-6 w-full">
                  <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">
                    Record and read the following text
                  </p>
                  <div className="text-white/90 text-lg leading-relaxed font-light">
                    "{prompt}"
                  </div>
                </div>

                {/* Recording Interface */}
                <div className="w-full flex flex-col items-center gap-6">
                    {!audioUrl ? (
                        <div className="scale-125 py-4">
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
                    
                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errorMessage || "Something went wrong. Please try again."}</span>
                      </div>
                    )}
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

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
