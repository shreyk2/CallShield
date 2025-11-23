'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RiskSimulator() {
  const [riskLevel, setRiskLevel] = useState(0);

  const scenarios = [
    {
      label: 'Trusted',
      matchScore: 83,       // High Match
      deepfakeScore: 0.5,   // Low Fake
      status: 'VERIFIED',
      statusColor: 'text-emerald-400',
      barColor: '#34d399', 
    },
    {
      label: 'Noisy Audio', // Changed from "Uncertain" to explain the discrepancy
      matchScore: 45,       // Low Match (Bad mic/Environment)
      deepfakeScore: 2,     // Low Fake (It's still human)
      status: 'UNCERTAIN',
      statusColor: 'text-yellow-400',
      barColor: '#facc15', 
    },
    {
      label: 'Voice Clone',
      matchScore: 96,       // High Match (The clone is good!)
      deepfakeScore: 99,    // High Fake (But we detected artifacts)
      status: 'HIGH RISK',
      statusColor: 'text-red-500',
      barColor: '#ef4444', 
    },
  ];

  const currentScenario = scenarios[riskLevel];

  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Controls */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              See the risk engine in action
            </h2>
            <p className="text-slate-400 mb-12 text-lg">
              Adjust the slider to simulate different call vectors. Note how Voice Match and Deepfake Detection operate independently.
            </p>

            <div className="space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
              <div>
                <label className="text-sm font-medium text-white mb-4 block uppercase tracking-wider">
                  Simulation Scenario
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between mt-4 text-xs text-slate-500 font-mono uppercase">
                  <span className={riskLevel === 0 ? "text-emerald-400 font-bold" : ""}>Trusted</span>
                  <span className={riskLevel === 1 ? "text-yellow-400 font-bold" : ""}>Low Quality</span>
                  <span className={riskLevel === 2 ? "text-red-500 font-bold" : ""}>Clone Attack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Card */}
          <motion.div
            animate={riskLevel === 2 ? { x: [-2, 2, -2, 2, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</span>
                <motion.span
                  key={currentScenario.status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("text-2xl font-bold font-mono", currentScenario.statusColor)}
                >
                  {currentScenario.status}
                </motion.span>
              </div>
              {riskLevel === 2 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                   <span className="text-xs font-bold text-red-500">AI DETECTED</span>
                </div>
              )}
            </div>

            <div className="flex gap-8 h-48">
              {/* Voice Match Meter */}
              <div className="flex-1 flex flex-col justify-end gap-1 bg-slate-950/50 rounded-lg p-2 border border-slate-800">
                {[...Array(20)].map((_, i) => {
                  const isActive = i < (currentScenario.matchScore / 5);
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? currentScenario.barColor : '#1e293b',
                        opacity: isActive ? 1 : 0.3
                      }}
                      transition={{ duration: 0.3, delay: (20 - i) * 0.01 }}
                      className="w-full h-full rounded-sm"
                    />
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex-1 flex flex-col justify-center gap-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Voiceprint Match</p>
                  <motion.p
                    key={currentScenario.matchScore}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-mono font-bold text-white"
                  >
                    {currentScenario.matchScore}%
                  </motion.p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Deepfake Prob</p>
                  <motion.p
                    key={currentScenario.deepfakeScore}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("text-4xl font-mono font-bold", 
                      riskLevel === 2 ? "text-red-500" : "text-slate-400"
                    )}
                  >
                    {currentScenario.deepfakeScore}%
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}