"use client";

import React, { useState, useEffect } from 'react';
import { useCallSession } from '@/hooks/useCallSession';
import { useAgentAudio } from '@/hooks/useAgentAudio';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Grid3x3, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CallPage() {
  const { sessionId, isRecording, startCall, endCall, sessionStartTime, setShouldSendAudio } = useCallSession();
  const { isAgentSpeaking, currentText } = useAgentAudio(isRecording, sessionStartTime, setShouldSendAudio);
  
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
    // UPDATED WRAPPER: 
    // - w-full: Takes full width of the parent container
    // - min-h-[...]: Calculates height to fit screen minus header (approx 140px)
    // - rounded-3xl: Gives it a modern "App within an App" look
    <div className="w-full min-h-[calc(100vh-140px)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-between py-8 px-4 text-white overflow-hidden font-sans rounded-3xl shadow-2xl border border-slate-800 relative">
      
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center opacity-50 text-xs mb-4">
        <div className="flex items-center gap-1">
          {/* Empty top bar for now, as requested in previous iteration */}
        </div>
      </div>

      {/* Main Caller Info */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md space-y-8 animate-in fade-in duration-700">
        
        {/* Avatar Placeholder - UPDATED WITH LOGO */}
        <div className="relative">
          {/* The glowing ring effect when call is active */}
          <div className={cn(
            "absolute -inset-4 bg-blue-500/20 rounded-full blur-xl transition-opacity duration-1000",
            isRecording ? "opacity-100" : "opacity-0"
          )} />
          
          {/* The circle container */}
          <div className="h-32 w-32 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-900 flex items-center justify-center relative z-10 p-4">
             {/* REPLACED TEXT SPAN WITH IMAGE URL */}
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Capital_One_logo.svg/2560px-Capital_One_logo.svg.png" 
               alt="Capital One Logo"
               className="w-full h-auto object-contain brightness-200"
             />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Capital One Bank Support</h2>
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

        {/* Captions */}
        <div className="h-24 flex items-center justify-center w-full px-6">
          {isAgentSpeaking && currentText && (
            <div className="bg-black/40 backdrop-blur-md text-white/90 px-6 py-3 rounded-2xl text-center text-sm leading-relaxed shadow-lg border border-white/5 animate-in slide-in-from-bottom-2">
              {currentText}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md space-y-8 mb-8">
        
        {/* Secondary Actions */}
        <div className={cn(
            "grid grid-cols-3 gap-4 transition-opacity duration-500",
            isRecording ? "opacity-100 pointer-events-auto" : "opacity-70 pointer-events-none"
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
              className="flex flex-col h-auto gap-2 text-white hover:bg-white/10 hover:text-white"
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

        {/* Main Action */}
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

      {/* Footer */}
      <div className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        Session: {sessionId || "Waiting..."}
      </div>
    </div>
  );
}