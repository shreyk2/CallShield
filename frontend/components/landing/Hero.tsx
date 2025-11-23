'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function Counter({ from, to, duration = 2, suffix = '' }: { from: number; to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Logic for decimals vs integers
      const current = progress * (to - from) + from;
      const display = to % 1 === 0 ? Math.floor(current) : current.toFixed(1);
      
      setCount(display as any);
      if (progress < 1) animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span>{count}{suffix}</span>;
}

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-slate-950">
      
      {/* Ambient Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Real-time Protection Active
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            Stop voice fraud <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              before the transfer.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-lg leading-relaxed">
            Passive voice authentication and deepfake detection that secures your call center without adding friction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/enrollment"
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Enroll Voice ID
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/call"
              className="px-8 py-4 border border-slate-700 bg-slate-900/50 text-slate-300 font-medium rounded-full hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all"
            >
              Simulate Call
            </Link>
          </div>
        </motion.div>

        {/* Right: Live Risk Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden group">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Live Analysis</span>
              </div>
              <span className="text-xs font-mono text-slate-500">ID: #8492-XJ</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Caller Identity</p>
                  <p className="text-lg font-semibold text-white">Sarah Connor</p>
                </div>
                <div className="px-3 py-1 bg-slate-800 rounded text-xs font-mono text-slate-300 border border-slate-700">
                  +1 (555) 019-2834
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">Voice Match</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    <Counter from={0} to={93} suffix="%" />
                  </div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-orange-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Deepfake Risk</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    <Counter from={0} to={0.1} suffix="%" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Overall Risk Level</span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                    SAFE
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '2%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}