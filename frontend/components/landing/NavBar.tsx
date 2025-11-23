'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Enrollment', href: '/enrollment' },
  { name: 'Call Simulation', href: '/call' },
  { name: 'Dashboard', href: '/dashboard' },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        scrolled
          ? 'bg-shield-bg/80 backdrop-blur-md border-white/5 py-4'
          : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight text-shield-text font-heading flex items-center gap-2">
          <div className="p-1.5 bg-shield-blue/10 rounded-lg">
            <Shield className="h-6 w-6 text-shield-blue" />
          </div>
          CallShield
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-sm font-medium text-shield-text-secondary hover:text-shield-text transition-colors"
              onMouseEnter={() => setActive(link.name)}
            >
              {link.name}
              {active === link.name && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-shield-blue rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold bg-shield-blue text-shield-bg rounded-lg hover:translate-y-[-2px] hover:shadow-[0_0_20px_-5px_rgba(59,164,255,0.5)] transition-all duration-300"
          >
            Log in
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
