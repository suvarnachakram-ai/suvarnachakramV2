import React from 'react';
import { HelpCircle, Phone, Mail } from 'lucide-react';
import { useData } from '../context/DataContext';
import GlassCard from '../components/GlassCard';

export default function Help() {
  const { faqs } = useData();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
          Help & Support
        </h1>
        <p className="text-xl text-gray-300">
          Find answers to common questions about Suvarna Chakram lottery results and procedures.
        </p>
      </div>

      {/* FAQ Section */}
      <GlassCard className="p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.id} className="group">
              <summary className="flex items-center justify-between p-4 glass-card cursor-pointer list-none group-open:bg-white/10 transition-all">
                <span className="font-medium text-white">{faq.question}</span>
                <span className="text-yellow-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="p-4 pt-0">
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </GlassCard>

      {/* Quick Help Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Check Results</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>1. Visit the Results page or select a specific time slot</p>
            <p>2. Use filters to find results by date or search for specific numbers</p>
            <p>3. Compare your ticket numbers with the winning numbers</p>
            <p>4. Check prize structure to determine your winnings</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Timing & Timezones</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>All times are in Indian Standard Time (IST)</p>
            <p>Results are published within 15 minutes of each draw</p>
            <p>The website auto-refreshes to show the latest results</p>
            <p>Countdown timer shows time remaining until next draw</p>
          </div>
        </GlassCard>
      </div>

      {/* Support Contact */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Need More Help?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 glass-card">
            <Phone className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Phone Support</h3>
            <p className="text-yellow-400 font-mono">+91 484 2305230</p>
            <p className="text-sm text-gray-400 mt-2">Mon - Fri, 9 AM - 6 PM</p>
          </div>
          
          <div className="text-center p-6 glass-card">
            <Mail className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Email Support</h3>
            <p className="text-yellow-400">support@swarnachakra.com</p>
            <p className="text-sm text-gray-400 mt-2">Response within 24 hours</p>
          </div>
        </div>
      </GlassCard>

      {/* Glossary */}
      <GlassCard className="p-8 mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Glossary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <dt className="font-semibold text-yellow-400">3D/Three-Digit</dt>
              <dd className="text-gray-300 text-sm mt-1">The main winning number with the highest prize value</dd>
            </div>
            <div>
              <dt className="font-semibold text-yellow-400">2D/Two-Digit</dt>
              <dd className="text-gray-300 text-sm mt-1">Last two digits of the winning number</dd>
            </div>
            <div>
              <dt className="font-semibold text-yellow-400">1D/One-Digit</dt>
              <dd className="text-gray-300 text-sm mt-1">Last digit of the winning number</dd>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <dt className="font-semibold text-yellow-400">Draw No.</dt>
              <dd className="text-gray-300 text-sm mt-1">Unique identifier for each lottery draw</dd>
            </div>
            <div>
              <dt className="font-semibold text-yellow-400">Time Slot</dt>
              <dd className="text-gray-300 text-sm mt-1">Specific time when the lottery draw takes place</dd>
            </div>
            <div>
              <dt className="font-semibold text-yellow-400">Published</dt>
              <dd className="text-gray-300 text-sm mt-1">Official confirmation that results are final</dd>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}