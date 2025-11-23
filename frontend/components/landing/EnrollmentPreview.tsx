'use client';

import { useState } from 'react';
import { Mic, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function EnrollmentPreview() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleStartEnrollment = async () => {
    setIsLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      router.push('/enrollment');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Secure your voice identity
          </h2>
          <p className="text-slate-400 text-lg">
            Enrollment takes less than 30 seconds. Create your unique voiceprint today to prevent fraud.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Status Bar */}
          <div className="flex justify-between items-center mb-12 px-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">System Active</span>
             </div>
             <Lock className="w-4 h-4 text-slate-600" />
          </div>

          {/* Main Interaction Area */}
          <div className="relative h-64 flex flex-col items-center justify-center">
            
            <div className="relative">
                {/* Pulsing Rings */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-20 duration-1000" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse opacity-40 delay-150" />
                
                <button
                    onClick={handleStartEnrollment}
                    disabled={isLoading}
                    className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 border-4 border-slate-900",
                    isLoading 
                        ? "bg-slate-800 scale-95 cursor-wait" 
                        : "bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] cursor-pointer"
                    )}
                >
                    {isLoading ? (
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Mic className="w-10 h-10 text-white" />
                    )}
                </button>
            </div>

            <p className="mt-8 text-lg font-medium text-white">
                {isLoading ? 'Connecting...' : 'Tap to Start Enrollment'}
            </p>
            
            <p className="mt-2 text-xs text-slate-500 font-mono">
                {isLoading ? 'Verifying session...' : 'Requires microphone access'}
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}