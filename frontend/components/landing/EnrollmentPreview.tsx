'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EnrollmentPreview() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'success'>('idle');

  const handleInteraction = () => {
    if (status === 'idle') {
      setStatus('recording');
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      }, 2000);
    }
  };

  return (
    <section className="py-24 bg-shield-bg relative overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-shield-text mb-4 font-heading">
            What enrollment feels like for your customers
          </h2>
          <p className="text-shield-text-secondary text-lg">
            Frictionless enrollment on web and mobile. Just a few seconds of speech is all it takes to secure an account forever.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-shield-surface border border-white/5 rounded-2xl p-8 shadow-2xl relative">
          {/* Status Indicators */}
          <div className="flex justify-center gap-2 mb-12">
            {['Idle', 'Recording', 'Analyzing'].map((step, i) => {
              const isActive = 
                (status === 'idle' && i === 0) ||
                (status === 'recording' && i === 1) ||
                (status === 'success' && i === 2);
              
              return (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-300",
                    isActive ? "bg-shield-blue" : "bg-shield-surface-highlight"
                  )} />
                  <span className={cn(
                    "text-[10px] uppercase tracking-wider font-mono transition-colors duration-300",
                    isActive ? "text-shield-blue" : "text-shield-text-secondary/50"
                  )}>{step}</span>
                </div>
              );
            })}
          </div>

          {/* Main Interaction Area */}
          <div className="relative h-64 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-shield-aqua/10 rounded-full flex items-center justify-center mx-auto mb-4 text-shield-aqua">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-shield-text">Voiceprint Enrolled</h3>
                  <p className="text-sm text-shield-text-secondary mt-2">Securely stored & encrypted</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    {/* Ripple Effect */}
                    <motion.div
                      className="absolute inset-0 bg-shield-blue/20 rounded-full"
                      animate={status === 'recording' ? { scale: [1, 1.5], opacity: [0.5, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    
                    <button
                      onClick={handleInteraction}
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                        status === 'recording' 
                          ? "bg-shield-blue text-white shadow-[0_0_30px_rgba(59,164,255,0.4)]" 
                          : "bg-shield-surface-highlight text-shield-text hover:bg-shield-surface-highlight/80"
                      )}
                    >
                      <Mic className="w-8 h-8" />
                    </button>

                    {/* Idle Animation */}
                    {status === 'idle' && (
                      <div className="absolute -inset-4 pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 border border-shield-blue/10 rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="mt-8 text-lg font-medium text-shield-text">
                    {status === 'recording' ? 'Listening...' : 'Tap to record your voicephrase'}
                  </p>
                  
                  {status === 'recording' && (
                    <motion.div 
                      className="flex gap-1 mt-4 h-8 items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-shield-blue rounded-full"
                          animate={{ height: [8, 24, 8] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
