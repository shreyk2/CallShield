'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-shield-bg border-t border-white/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-shield-blue/20 via-transparent to-transparent" />
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#3BA4FF 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-shield-text mb-6 font-heading"
          >
            Ready to stop AI voice fraud?
          </motion.h2>
          <p className="text-xl text-shield-text-secondary mb-10">
            Join the leading banks securing their voice channels with CallShield.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/enrollment"
              className="px-8 py-4 bg-shield-blue text-shield-bg font-semibold rounded-lg hover:translate-y-[-2px] hover:shadow-[0_0_25px_-5px_rgba(59,164,255,0.6)] transition-all duration-300 w-full sm:w-auto"
            >
              Book a security review
            </Link>
            <button className="text-shield-blue hover:text-shield-aqua transition-colors font-medium underline decoration-shield-blue/30 hover:decoration-shield-aqua underline-offset-4">
              Download implementation guide
            </button>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-shield-text-secondary">
          <p>© 2025 CallShield Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-shield-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-shield-text transition-colors">Terms</a>
            <a href="#" className="hover:text-shield-text transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
