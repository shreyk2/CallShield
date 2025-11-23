"use client";

import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features'; // The Bento Grid Widgets
import RiskSimulator from '@/components/landing/RiskSimulator';
import EnrollmentPreview from '@/components/landing/EnrollmentPreview';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <RiskSimulator />
      <EnrollmentPreview />
      <Footer />
    </main>
  );
}