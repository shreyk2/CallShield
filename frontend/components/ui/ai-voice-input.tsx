"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  isRecording?: boolean;
  analyser?: AnalyserNode | null;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isRecording: externalIsRecording,
  analyser
}: AIVoiceInputProps) {
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(visualizerBars).fill(0));

  // Use external state if provided, otherwise internal state
  const submitted = externalIsRecording !== undefined ? externalIsRecording : internalSubmitted;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!submitted || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let animationId: number;

    const updateVisualizer = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Map frequency data to bars
      // We focus on the lower frequencies where voice usually is
      const step = Math.floor(bufferLength / visualizerBars);
      const newAudioData = new Uint8Array(visualizerBars);
      
      for (let i = 0; i < visualizerBars; i++) {
        // Get average of the bin
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j] || 0;
        }
        newAudioData[i] = sum / step;
      }
      
      setAudioData(newAudioData);
      animationId = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();

    return () => cancelAnimationFrame(animationId);
  }, [submitted, analyser, visualizerBars]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      // Only call onStart if we are managing state internally
      if (externalIsRecording === undefined) {
        onStart?.();
      }
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      // Only call onStop if we are managing state internally and time > 0
      if (externalIsRecording === undefined && time > 0) {
        onStop?.(time);
      }
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted, time, onStart, onStop, externalIsRecording]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setInternalSubmitted(true);
      timeoutId = setTimeout(() => {
        setInternalSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setInternalSubmitted(false);
    } else {
      if (externalIsRecording === undefined) {
        setInternalSubmitted((prev) => !prev);
      } else {
        // If controlled externally, trigger the appropriate callback
        if (submitted) {
          onStop?.(time);
        } else {
          onStart?.();
        }
      }
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
            submitted
              ? "bg-red-500 hover:bg-red-600 scale-110"
              : "bg-primary hover:bg-primary/90 hover:scale-105"
          )}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm bg-white cursor-pointer"
            />
          ) : (
            <Mic className="w-8 h-8 text-primary-foreground" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-12 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => {
            const height = analyser 
              ? Math.max(4, (audioData[i] / 255) * 100) 
              : 20 + Math.random() * 80;
              
            return (
              <div
                key={i}
                className={cn(
                  "w-0.5 rounded-full transition-all duration-75",
                  submitted
                    ? "bg-primary"
                    : "bg-muted-foreground/20 h-1"
                )}
                style={
                  submitted && isClient
                    ? {
                        height: `${height}%`,
                        animationDelay: analyser ? '0s' : `${i * 0.05}s`,
                      }
                    : undefined
                }
              />
            );
          })}
        </div>

        <p className="h-4 text-xs text-muted-foreground">
          {submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
}
