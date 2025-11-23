'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const benefits = [
  "Passive authentication, no extra steps for callers",
  "Detection tuned for AI voice cloning, not just generic biometrics",
  "Deployable as an API behind your IVR or agent assist",
  "Real-time risk scoring with < 200ms latency",
  "Bank-grade encryption and privacy compliance"
];

export default function ArchitectureSection() {
  return (
    <section id="for-banks" className="py-24 bg-shield-bg border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-shield-text mb-8 font-heading">
              Built for fraud teams and security engineers
            </h2>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-shield-blue shrink-0" />
                  <p className="text-shield-text-secondary text-lg">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-shield-surface border border-white/5 rounded-xl p-8 relative"
          >
            <div className="absolute inset-0 bg-grid-white/[0.02] rounded-xl" />
            
            <div className="relative z-10 flex flex-col items-center gap-8">
              {/* Top Box */}
              <div className="w-48 p-4 bg-shield-surface-highlight border border-white/10 rounded text-center">
                <span className="font-mono text-sm text-shield-text">Telephony / IVR</span>
              </div>

              {/* Arrow Down */}
              <div className="h-8 w-px bg-gradient-to-b from-white/10 to-shield-blue" />

              {/* Middle Box (Main) */}
              <div className="w-64 p-6 bg-shield-blue/10 border border-shield-blue/30 rounded-lg text-center relative">
                <div className="absolute -inset-px bg-shield-blue/20 blur-lg opacity-20" />
                <span className="font-mono font-bold text-shield-blue relative z-10">CallShield Voice Engine</span>
              </div>

              {/* Arrow Down */}
              <div className="h-8 w-px bg-gradient-to-b from-shield-blue to-white/10" />

              {/* Bottom Row */}
              <div className="flex gap-8">
                <div className="w-40 p-4 bg-shield-surface-highlight border border-white/10 rounded text-center">
                  <span className="font-mono text-sm text-shield-text">Risk API</span>
                </div>
                <div className="w-40 p-4 bg-shield-surface-highlight border border-white/10 rounded text-center">
                  <span className="font-mono text-sm text-shield-text">Bank Systems</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
