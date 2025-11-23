'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function Counter({ from, to, duration = 2, suffix = '' }: { from: number; to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const update = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * (to - from) + from));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      }
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span>{count}{suffix}</span>;
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-shield-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border border-shield-blue rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 4, delay: i * 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-shield-bg to-transparent" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-shield-text leading-tight mb-6 font-heading">
            Stop AI voice imposters before they <span className="text-shield-blue">drain accounts</span>
          </h1>
          <p className="text-xl text-shield-text-secondary mb-8 max-w-lg leading-relaxed">
            CallShield passively verifies your customer’s voiceprint and flags AI deepfakes in real time during banking calls.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/enrollment"
              className="px-8 py-4 bg-shield-blue text-shield-bg font-semibold rounded-lg hover:translate-y-[-2px] hover:shadow-[0_0_25px_-5px_rgba(59,164,255,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Try the voiceprint demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-8 py-4 border border-shield-blue/30 text-shield-blue font-semibold rounded-lg hover:bg-shield-blue/5 transition-colors">
              View technical docs
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Live Call Risk Panel */}
          <div className="bg-shield-surface border border-white/5 rounded-xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-shield-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-shield-text-secondary uppercase tracking-wider">Live Analysis</span>
              </div>
              <span className="text-xs font-mono text-shield-text-secondary">ID: #8492-XJ</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-shield-text-secondary mb-1">Caller Identity</p>
                  <p className="text-lg font-semibold text-shield-text">Sarah Connor</p>
                </div>
                <div className="px-3 py-1 bg-shield-surface-highlight rounded text-xs font-mono text-shield-text-secondary">
                  +1 (555) 019-2834
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-shield-surface-highlight/50 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-shield-aqua">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">Voice Match</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-shield-text">
                    <Counter from={0} to={98} suffix="%" />
                  </div>
                </div>
                <div className="bg-shield-surface-highlight/50 p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-shield-amber">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Deepfake Risk</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-shield-text">
                    <Counter from={0} to={2} suffix="%" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-shield-text-secondary">Overall Risk Level</span>
                  <span className="px-3 py-1 bg-shield-aqua/10 text-shield-aqua text-xs font-bold rounded-full border border-shield-aqua/20">
                    LOW RISK
                  </span>
                </div>
                <div className="h-2 bg-shield-surface-highlight rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '2%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-shield-aqua"
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
