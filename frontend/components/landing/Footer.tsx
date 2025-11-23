'use client';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-white font-bold">CallShield</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
        </div>
        <div className="text-slate-600 text-xs">
            © 2025 CallShield Security Inc.
        </div>
      </div>
    </footer>
  );
}