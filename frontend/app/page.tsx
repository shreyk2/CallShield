import NavBar from '@/components/landing/NavBar';
import Hero from '@/components/landing/Hero';
import FeatureCards from '@/components/landing/FeatureCards';
import RiskSimulator from '@/components/landing/RiskSimulator';
import EnrollmentPreview from '@/components/landing/EnrollmentPreview';
import ArchitectureSection from '@/components/landing/ArchitectureSection';
import SocialProof from '@/components/landing/SocialProof';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-shield-bg text-shield-text selection:bg-shield-blue/30 selection:text-shield-blue">
      <NavBar />
      <Hero />
      <SocialProof />
      <FeatureCards />
      <RiskSimulator />
      <EnrollmentPreview />
      <ArchitectureSection />
      <Footer />
    </main>
  );
}



