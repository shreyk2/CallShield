"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Fingerprint, ShieldAlert, Bot, Activity, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 py-24 mx-auto relative z-10">
        
        {/* Hero Text */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live v1.0 Now Available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Trust the voice <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              verify the human.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Real-time passive voice authentication, deepfake detection, 
            and social engineering defense for modern banking security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-base">
              <Link href="/enrollment">
                Launch Demo <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 px-8 rounded-full text-slate-300 hover:text-white hover:bg-slate-800">
              <Link href="/dashboard">
                View Agent Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Grid (The Bento Box) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Widget 1: Biometric Auth */}
          <CardWrapper className="md:col-span-1 delay-100">
            <div className="flex flex-col h-full">
              <div className="p-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Fingerprint className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Voice Biometrics</h3>
                <p className="text-sm text-slate-400">Passive 1:N identity verification using ECAPA-TDNN embeddings.</p>
              </div>
              <div className="mt-auto p-6 bg-slate-900/50 border-t border-slate-800">
                <BiometricVisualizer />
              </div>
            </div>
          </CardWrapper>

          {/* Widget 2: Social Engineering (New Feature) */}
          <CardWrapper className="md:col-span-1 delay-200">
            <div className="flex flex-col h-full">
              <div className="p-6">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Social Engineering</h3>
                <p className="text-sm text-slate-400">Real-time NLP analysis detects coercion, urgency, and high-pressure scripts.</p>
              </div>
              <div className="mt-auto p-4 bg-slate-900/50 border-t border-slate-800 h-32 overflow-hidden relative">
                 <SocialEngineeringChat />
              </div>
            </div>
          </CardWrapper>

          {/* Widget 3: Deepfake Detection */}
          <CardWrapper className="md:col-span-1 delay-300">
             <div className="flex flex-col h-full">
              <div className="p-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Anti-Deepfake</h3>
                <p className="text-sm text-slate-400">Detects synthetic audio artifacts and AI-generated voice clones instantly.</p>
              </div>
              <div className="mt-auto p-6 bg-slate-900/50 border-t border-slate-800">
                <DeepfakeGauge />
              </div>
            </div>
          </CardWrapper>

        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function CardWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl overflow-hidden hover:border-slate-700 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards",
      className
    )}>
      {children}
    </div>
  );
}

// Animated Audio Wave & Match Status
function BiometricVisualizer() {
  const [match, setMatch] = useState(85);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMatch(prev => Math.min(99, Math.max(80, prev + (Math.random() - 0.5) * 10)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-1 h-8 items-center">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-green-500 rounded-full animate-pulse" 
            style={{ 
              height: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s` 
            }} 
          />
        ))}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-2xl font-mono text-white font-bold">{match.toFixed(1)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-green-500 font-bold">Match Verified</span>
      </div>
    </div>
  );
}

// Chat simulator that flags dangerous words
function SocialEngineeringChat() {
  return (
    <div className="space-y-2 font-mono text-xs opacity-80">
      <div className="flex gap-2">
        <span className="text-slate-500">Caller:</span>
        <span className="text-slate-300">I need to transfer funds.</span>
      </div>
      <div className="flex gap-2">
        <span className="text-blue-500">Agent:</span>
        <span className="text-slate-300">Can you verify the amount?</span>
      </div>
      <div className="flex gap-2 animate-pulse">
        <span className="text-slate-500">Caller:</span>
        <span>
          It is <span className="text-orange-500 font-bold bg-orange-500/10 px-1 rounded">URGENT</span>. Do it <span className="text-red-500 font-bold bg-red-500/10 px-1 rounded">NOW</span>.
        </span>
      </div>
      
      {/* Overlay gradient to fade out bottom */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900/90 to-transparent" />
    </div>
  );
}

// Fluctuating Probability Gauge
function DeepfakeGauge() {
  const [score, setScore] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      // Keep it low (safe) mostly
      setScore(prev => Math.max(2, Math.min(25, prev + (Math.random() - 0.5) * 10)));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-400">AI Probability</span>
        <span className={score > 50 ? "text-red-400" : "text-blue-400"}>{score.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between items-center pt-1">
        <span className="text-[10px] text-slate-500">Synthesized Audio</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">HUMAN</span>
      </div>
    </div>
  );
}