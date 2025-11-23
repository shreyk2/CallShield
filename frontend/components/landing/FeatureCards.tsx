'use client';

import { motion } from 'framer-motion';
import { Mic, Activity, ShieldAlert } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Enroll voiceprint',
    description: 'Customers enroll once through a secure onboarding flow.',
  },
  {
    icon: Activity,
    title: 'Monitor the live call',
    description: 'We continuously match the voice to the enrolled print while the customer speaks.',
  },
  {
    icon: ShieldAlert,
    title: 'Detect AI deepfakes',
    description: 'Our model flags synthetic or cloned voices before money moves.',
  },
];

export default function FeatureCards() {
  return (
    <section id="how-it-works" className="py-24 bg-shield-bg relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-shield-text mb-4 font-heading">
            How CallShield protects every call
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group bg-shield-surface border border-white/5 p-8 rounded-xl hover:border-shield-blue/30 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-shield-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-12 h-12 bg-shield-surface-highlight rounded-lg flex items-center justify-center mb-6 text-shield-blue group-hover:text-shield-aqua transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-shield-text mb-3 font-heading">
                {feature.title}
              </h3>
              <p className="text-shield-text-secondary leading-relaxed">
                {feature.description}
              </p>

              {/* Tiny waveform animation on hover */}
              <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-shield-blue/50 rounded-full"
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
