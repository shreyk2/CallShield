"use client";

import NavBar from '@/components/landing/NavBar';
import Hero from '@/components/landing/Hero';
import RiskSimulator from '@/components/landing/RiskSimulator';
import EnrollmentPreview from '@/components/landing/EnrollmentPreview';
import Footer from '@/components/landing/Footer';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Fingerprint, ShieldAlert, Bot, Activity, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-shield-bg text-shield-text selection:bg-shield-blue/30 selection:text-shield-blue">
      <NavBar />
      <Hero />
      <RiskSimulator />
      <EnrollmentPreview />
      <Footer />
    </main>
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