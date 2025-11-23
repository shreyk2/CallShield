'use client';

import { Activity, Lock, Mic, Shield, Server, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function Features() {
  return (
    <section className="py-24 container mx-auto px-4 max-w-7xl">
      <div className="mb-16 text-center max-w-2xl mx-auto">
         <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Defense in Depth</h2>
         <p className="text-slate-400">Three layers of biometric security working in parallel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Real-time Analysis (Biometric) */}
        <BentoCard className="md:col-span-2 min-h-[300px]">
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold text-lg text-white">Passive Biometrics</h3>
              </div>
              <p className="text-slate-400 max-w-md">
                Verify identity using background voice embeddings. No security questions required.
              </p>
            </div>
            {/* WIDGET: Biometric Visualizer */}
            <div className="mt-8 p-6 bg-slate-950/50 rounded-xl border border-slate-800/50">
               <BiometricVisualizer />
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Deepfake Defense */}
        <BentoCard className="bg-gradient-to-br from-slate-900 to-red-900/10">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <Lock className="w-5 h-5" />
              <h3 className="font-semibold text-lg text-white">Deepfake Defense</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 flex-1">
              AI models detect synthetic artifacts and clones with 99.8% accuracy.
            </p>
            {/* WIDGET: Deepfake Gauge */}
            <div className="mt-auto p-4 bg-slate-950/50 rounded-lg border border-slate-800">
               <DeepfakeGauge />
            </div>
          </div>
        </BentoCard>

        {/* Card 3: Social Engineering (New!) */}
        <BentoCard>
            <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-orange-400 mb-4">
              <Shield className="w-5 h-5" />
              <h3 className="font-semibold text-lg text-white">Social Engineering</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Detects coercion, urgency, and high-pressure scripts in real-time.
            </p>
            {/* WIDGET: Chat Simulator */}
            <div className="mt-auto p-4 bg-slate-950/50 rounded-lg border border-slate-800 relative overflow-hidden h-32">
                <SocialEngineeringChat />
            </div>
          </div>
        </BentoCard>

        {/* Card 4: Enterprise Logs */}
        <BentoCard className="md:col-span-2">
            <div className="grid md:grid-cols-2 gap-6 items-center h-full">
                <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Enterprise Grade</h3>
                    <p className="text-slate-400 text-sm">End-to-end encrypted WebSocket streams.</p>
                </div>
                 {/* WIDGET: Fake Terminal */}
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-[10px] leading-4 text-slate-400 opacity-80">
                    <div className="text-green-400">&gt;&gt; SYSTEM_INIT: Secure Connection OK</div>
                    <div>[10:42:01] WebSocket Handshake: 20ms</div>
                    <div>[10:42:03] Embedding Vector Generated</div>
                    <div className="text-blue-400">[10:42:03] Similarity Score: 0.92 (MATCH)</div>
                </div>
            </div>
        </BentoCard>

      </div>
    </section>
  );
}

// --- Helper Components & Widgets ---

function BentoCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 backdrop-blur-sm transition-all hover:bg-slate-900/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function BiometricVisualizer() {
  const [match, setMatch] = useState(85);
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Initialize random heights on client-side only
    setHeights(Array.from({ length: 8 }, () => Math.random() * 100));

    const interval = setInterval(() => {
      setMatch(prev => Math.min(99, Math.max(80, prev + (Math.random() - 0.5) * 10)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-1 h-8 items-center">
        {heights.map((h, i) => (
          <div 
            key={i} 
            className="w-1 bg-blue-500 rounded-full animate-pulse" 
            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} 
          />
        ))}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-2xl font-mono text-white font-bold">{match.toFixed(1)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Match Verified</span>
      </div>
    </div>
  );
}

function SocialEngineeringChat() {
  return (
    <div className="space-y-2 font-mono text-xs opacity-90">
      <div className="flex gap-2">
        <span className="text-slate-500">User:</span>
        <span className="text-slate-300">I need to transfer funds.</span>
      </div>
      <div className="flex gap-2 animate-pulse">
        <span className="text-slate-500">BadActor:</span>
        <span>
          Do it <span className="text-orange-400 font-bold">NOW</span> or account will lock.
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}

function DeepfakeGauge() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-400">AI Probability</span>
        <span className="text-emerald-400">0.2%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 w-[2%]" />
      </div>
    </div>
  );
}