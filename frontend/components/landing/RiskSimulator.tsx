'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function RiskSimulator() {
  const [riskLevel, setRiskLevel] = useState(0); // 0: Safe, 1: Uncertain, 2: High Risk

  const scenarios = [
    {
      label: 'Trusted customer',
      color: 'bg-shield-aqua',
      textColor: 'text-shield-aqua',
      matchScore: 97,
      deepfakeScore: 3,
      status: 'VERIFIED',
    },
    {
      label: 'Uncertain',
      color: 'bg-shield-blue',
      textColor: 'text-shield-blue',
      matchScore: 65,
      deepfakeScore: 35,
      status: 'ANALYZING',
    },
    {
      label: 'Likely deepfake',
      color: 'bg-shield-amber',
      textColor: 'text-shield-amber',
      matchScore: 12,
      deepfakeScore: 88,
      status: 'HIGH RISK',
    },
  ];

  const currentScenario = scenarios[riskLevel];

  return (
    <section className="py-24 bg-shield-bg border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-shield-text mb-6 font-heading">
              See how risk changes in real time
            </h2>
            <p className="text-shield-text-secondary mb-12 text-lg">
              Adjust the slider to simulate different call scenarios and see how CallShield responds instantly.
            </p>

            <div className="space-y-8">
              <div>
                <label className="text-sm font-medium text-shield-text mb-4 block">
                  Call risk scenario
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-shield-surface-highlight rounded-lg appearance-none cursor-pointer accent-shield-blue focus:outline-none focus:ring-2 focus:ring-shield-blue/50"
                />
                <div className="flex justify-between mt-2 text-xs text-shield-text-secondary font-mono uppercase">
                  <span>Trusted</span>
                  <span>Uncertain</span>
                  <span>Deepfake</span>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            animate={riskLevel === 2 ? { x: [-2, 2, -2, 2, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-shield-surface border border-white/5 rounded-xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-sm text-shield-text-secondary mb-1">Analysis Status</span>
                <motion.span
                  key={currentScenario.status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("text-xl font-bold font-mono", currentScenario.textColor)}
                >
                  {currentScenario.status}
                </motion.span>
              </div>
              {riskLevel === 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-shield-amber animate-ping"
                />
              )}
            </div>

            <div className="flex gap-8 h-64">
              {/* Trust Meter */}
              <div className="flex-1 flex flex-col justify-end gap-1 bg-shield-surface-highlight/30 rounded-lg p-1 relative overflow-hidden">
                {[...Array(20)].map((_, i) => {
                  const isActive = i < (currentScenario.matchScore / 5);
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        backgroundColor: isActive 
                          ? riskLevel === 2 ? '#FFB55A' : riskLevel === 1 ? '#3BA4FF' : '#4BF2C0'
                          : 'rgba(255,255,255,0.05)',
                        opacity: isActive ? 1 : 0.3
                      }}
                      transition={{ duration: 0.3, delay: (20 - i) * 0.02 }}
                      className="w-full h-full rounded-sm"
                    />
                  );
                })}
              </div>

              <div className="flex-1 flex flex-col justify-center gap-6">
                <div>
                  <p className="text-sm text-shield-text-secondary mb-1">Voiceprint Match</p>
                  <motion.p
                    key={currentScenario.matchScore}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-mono font-bold text-shield-text"
                  >
                    {currentScenario.matchScore}%
                  </motion.p>
                </div>
                <div>
                  <p className="text-sm text-shield-text-secondary mb-1">Deepfake Likelihood</p>
                  <motion.p
                    key={currentScenario.deepfakeScore}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("text-3xl font-mono font-bold", 
                      riskLevel === 2 ? "text-shield-amber" : "text-shield-text"
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
