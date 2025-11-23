'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck } from 'lucide-react';

const badges = [
  { icon: Shield, text: "SOC 2 Type II Ready" },
  { icon: Lock, text: "GDPR Compliant" },
  { icon: FileCheck, text: "ISO 27001 Certified" },
];

export default function SocialProof() {
  return (
    <section className="py-12 bg-shield-surface/50 border-y border-white/5">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm font-mono text-shield-text-secondary uppercase tracking-widest mb-8">
          Trusted by security teams at
        </p>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-12">
          {/* Placeholder Logos */}
          {['Acme Bank', 'Global Finance', 'SecureTrust', 'NeoBank'].map((name) => (
            <span key={name} className="text-xl font-bold text-shield-text hover:text-shield-blue transition-colors cursor-default">
              {name}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-shield-surface border border-white/5 rounded-full"
            >
              <badge.icon className="w-4 h-4 text-shield-aqua" />
              <span className="text-xs font-medium text-shield-text-secondary">{badge.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
