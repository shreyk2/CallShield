"use client";

import React, { useState, useEffect } from 'react';
import { useCallSession } from '@/hooks/useCallSession';
import { useAgentAudio } from '@/hooks/useAgentAudio';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, MoreVertical, Grid3x3, Volume2, Grid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CallPage() {
  // We still destructure riskStatus to prevent errors, but we deliberately DO NOT display it
  const { sessionId, isRecording, startCall, endCall, sessionStartTime, setShouldSendAudio } = useCallSession();
  const { isAgentSpeaking, currentText } = useAgentAudio(isRecording, sessionStartTime, setShouldSendAudio);
  
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Visual state only for demo realism

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fake audio visualizer bars
  const AudioBars = () => (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 bg-white/80 rounded-full animate-pulse",
            isRecording ? "h-8" : "h-1.5"
          )}
          style={{
            animationDuration: `${0.5 + i * 0.1}s`,
            height: isRecording ? `${Math.max(12, Math.random() * 40)}px` : '4px'
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-between py-12 px-4 text-white overflow-hidden font-sans">
      
      {/* Top Bar (Mock Status) */}
      <div className="w-full max-w-md flex justify-between items-center opacity-50 text-xs mb-4">
        <span>Secure Channel</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Main Caller Info Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-8 animate-in fade-in duration-700">
        
        {/* Bank/Agent Avatar */}
        <div className="relative">
          <div className={cn(
            "absolute -inset-4 bg-blue-500/20 rounded-full blur-xl transition-opacity duration-1000",
            isRecording ? "opacity-100" : "opacity-0"
          )} />
          <Avatar className="h-32 w-32 border-4 border-slate-800 shadow-2xl">
            <AvatarImage src="/bank-logo-placeholder.png" alt="Bank" />
            <AvatarFallback className="bg-slate-800 text-3xl font-light text-white">
              CB
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Chase Bank Support</h2>
          <p className="text-slate-400 text-lg font-light">
            {isRecording ? "Call in progress..." : "Ready to connect"}
          </p>
        </div>

        {/* Timer & Visualizer */}
        <div className="h-20 flex flex-col items-center justify-center space-y-4">
          {isRecording && (
            <>
              <div className="text-4xl font-mono font-light tracking-widest opacity-90">
                {formatTime(duration)}
              </div>
              <AudioBars />
            </>
          )}
        </div>

        {/* Dynamic Captions (Agent Speech) */}
        <div className="h-24 flex items-center justify-center w-full px-6">
          {isAgentSpeaking && currentText && (
            <div className="bg-black/40 backdrop-blur-md text-white/90 px-6 py-3 rounded-2xl text-center text-sm leading-relaxed shadow-lg border border-white/5 animate-in slide-in-from-bottom-2">
              {currentText}
            </div>
          )}
        </div>
      </div>

      {/* Control Grid (iOS Style) */}
      <div className="w-full max-w-md space-y-8 mb-8">
        
        {/* Secondary Actions (Visual Only for Demo) */}
        <div className={cn(
            "grid grid-cols-3 gap-4 transition-opacity duration-500",
            isRecording ? "opacity-100 pointer-events-auto" : "opacity-30 pointer-events-none"
          )}>
            <Button variant="ghost" className="flex flex-col h-auto gap-2 text-white hover:bg-white/10 hover:text-white">
              <div className="p-4 rounded-full bg-slate-800/50 backdrop-blur-sm">
                <Volume2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-light">Speaker</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col h-auto gap-2 text-white hover:bg-white/10 hover:text-white">
              <div className="p-4 rounded-full bg-slate-800/50 backdrop-blur-sm">
                <Grid3x3 className="w-6 h-6" />
              </div>
              <span className="text-xs font-light">Keypad</span>
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "flex flex-col h-auto gap-2 hover:bg-white/10 hover:text-white",
                isMuted ? "text-white" : "text-white"
              )}
            >
              <div className={cn(
                "p-4 rounded-full backdrop-blur-sm transition-colors",
                isMuted ? "bg-white text-slate-900" : "bg-slate-800/50"
              )}>
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </div>
              <span className="text-xs font-light">Mute</span>
            </Button>
        </div>

        {/* Primary Action (Call/End) */}
        <div className="flex justify-center pb-8">
          {!isRecording ? (
            <Button
              onClick={startCall}
              className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="h-8 w-8 text-white fill-current" />
            </Button>
          ) : (
            <Button
              onClick={endCall}
              className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff className="h-8 w-8 text-white fill-current" />
            </Button>
          )}
        </div>
      </div>

      {/* Session ID Footer */}
      <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        Session: {sessionId || "Waiting..."}
      </div>
    </div>
  );
}