"use client";

import React, { useState, useEffect } from 'react';
import { useCallSession } from '@/hooks/useCallSession';
import { useAgentAudio } from '@/hooks/useAgentAudio';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, ShieldAlert, ShieldCheck, ShieldQuestion, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CallPage() {
  const { sessionId, isRecording, startCall, endCall, riskStatus, sessionStartTime } = useCallSession();
  const { isAgentSpeaking, currentText } = useAgentAudio(isRecording, sessionStartTime);
  const [duration, setDuration] = useState(0);

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

  const getStatusColor = () => {
    if (!isRecording) return "text-muted-foreground";
    if (!riskStatus) return "text-green-500";
    
    switch (riskStatus.status) {
      case 'HIGH_RISK': return "text-red-500";
      case 'UNCERTAIN': return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  const getStatusText = () => {
    if (!isRecording) return "Ready";
    if (!riskStatus) return "• Connecting...";
    
    switch (riskStatus.status) {
      case 'HIGH_RISK': return "• High Risk Detected";
      case 'UNCERTAIN': return "• Verifying Identity...";
      case 'INITIAL': return "• Analyzing Voice...";
      default: return "• Secure Connection";
    }
  };

  const getStatusIcon = () => {
    if (!isRecording) return <Mic className="w-10 h-10" />;
    if (!riskStatus) return <Mic className="w-10 h-10 animate-pulse" />;

    switch (riskStatus.status) {
      case 'HIGH_RISK': return <ShieldAlert className="w-10 h-10 animate-pulse" />;
      case 'UNCERTAIN': return <ShieldQuestion className="w-10 h-10 animate-pulse" />;
      case 'INITIAL': return <Activity className="w-10 h-10 animate-pulse" />;
      default: return <ShieldCheck className="w-10 h-10" />;
    }
  };

  const getBgColor = () => {
    if (!isRecording) return "bg-muted";
    if (!riskStatus) return "bg-green-500";

    switch (riskStatus.status) {
      case 'HIGH_RISK': return "bg-red-500";
      case 'UNCERTAIN': return "bg-yellow-500";
      case 'INITIAL': return "bg-blue-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="flex flex-col items-center space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Secure Voice Channel</h1>
          <p className="text-muted-foreground">
            End-to-end encrypted connection
          </p>
        </div>

        <Card className="w-full border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center space-y-10">
            
            {/* Timer - The Hero Element */}
            <div className="flex flex-col items-center space-y-2">
              <div className={cn(
                "text-7xl font-mono font-light tracking-tight tabular-nums transition-colors duration-300",
                isRecording ? "text-foreground" : "text-muted-foreground/30"
              )}>
                {formatTime(duration)}
              </div>
              <div className={cn(
                "text-sm font-medium uppercase tracking-widest transition-colors duration-300",
                getStatusColor()
              )}>
                {getStatusText()}
              </div>
            </div>

            {/* Minimal Visualizer / Icon */}
            <div className="relative flex items-center justify-center h-32 w-32">
              {isRecording && (
                <>
                  <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", getBgColor())} />
                  <div className={cn("absolute inset-0 rounded-full animate-pulse delay-75 opacity-10", getBgColor())} />
                </>
              )}
              
              <div className={cn(
                "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                isRecording 
                  ? cn(getBgColor(), "text-white shadow-lg scale-110")
                  : "bg-muted text-muted-foreground"
              )}>
                {getStatusIcon()}
              </div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-xs">
              {!isRecording ? (
                <Button
                  onClick={startCall}
                  className="w-full h-12 text-base font-medium rounded-full shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Start Call
                </Button>
              ) : (
                <Button
                  onClick={endCall}
                  variant="destructive"
                  className="w-full h-12 text-base font-medium rounded-full shadow-sm transition-all hover:scale-[1.02]"
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Call
                </Button>
              )}
            </div>

            {/* Agent Text Display */}
            {currentText && isAgentSpeaking && (
              <div className="w-full max-w-md text-center">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Agent Speaking</div>
                <div className="text-sm text-foreground bg-blue-50 dark:bg-blue-950/30 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  "{currentText}"
                </div>
              </div>
            )}
            
            {/* Session ID Display */}
            {sessionId && (
              <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-full">
                Session ID: {sessionId}
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
