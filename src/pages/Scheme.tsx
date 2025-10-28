import React from 'react';
import { Trophy, Clock, IndianRupee, HelpCircle } from 'lucide-react';
import { TIME_SLOTS, formatSlotTime, ANNOUNCEMENT_SCHEDULE } from '../utils/time';
import GlassCard from '../components/GlassCard';

export default function Scheme() {
  const prizeStructure = [
    { category: '5-Digit Match', prize: '₹50,000', description: 'Match all 5 digits in exact order' },
    { category: '4-Digit Match', prize: '₹5,000', description: 'Match any 4 digits in exact order' },
    { category: '3-Digit Match', prize: '₹500', description: 'Match any 3 digits in exact order' },
    { category: '2-Digit Match', prize: '₹100', description: 'Match any 2 digits in exact order' },
    { category: '1-Digit Match', prize: '₹20', description: 'Match any single digit' },
  ];

  const faqItems = [
    {
      question: 'How does the 5-digit prize work?',
      answer: 'To win the 5-digit prize of ₹50,000, your ticket number must match all 5 winning digits in exact order. For example, if the winning number is 35273, your ticket must have 35273 to win.',
    },
    {
      question: 'Can I win multiple prizes from one ticket?',
      answer: 'Yes! If your ticket matches the 5-digit number, you also win all lower-tier prizes automatically, for a total of ₹55,620.',
    },
    {
      question: 'What are the odds of winning?',
      answer: '5-digit: 1 in 100,000 • 4-digit: 1 in 10,000 • 3-digit: 1 in 1,000 • 2-digit: 1 in 100 • 1-digit: 1 in 10. Every ticket has multiple chances to win.',
    },
    {
      question: 'How are winners determined?',
      answer: 'Winners are determined through a transparent draw process conducted at specified times. The drawn numbers are the official winning numbers for that draw.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
          Prize Scheme
        </h1>
        <p className="text-xl text-gray-300">
          Learn about our daily lottery draws, prize structure, and payout rules.
        </p>
      </div>

      {/* Daily Schedule */}
      <GlassCard className="p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Daily Five Draws</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {TIME_SLOTS.map((slot, index) => (
            <div key={index} className="text-center p-4 glass-card">
              <div className="text-lg font-bold text-yellow-400 mb-1">{formatSlotTime(slot)}</div>
              <div className="text-sm text-gray-400">
                {slot === '12:00' ? 'Noon' : slot === '14:00' ? 'Afternoon' : 'Evening'} Draw
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Prize Structure */}
      <GlassCard className="p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Prize Structure</h2>
        </div>
        
        <div className="space-y-4">
          {prizeStructure.map((prize, index) => (
            <div key={index} className="flex items-center justify-between p-4 glass-card">
              <div>
                <div className="font-semibold text-white mb-1">{prize.category}</div>
                <div className="text-sm text-gray-400">{prize.description}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold gold-text flex items-center">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {prize.prize.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/20">
          <p className="text-yellow-400 text-sm">
            <strong>Maximum Win:</strong> If you match the 5-digit number, you win all prizes totaling ₹55,620!
          </p>
        </div>
      </GlassCard>

      {/* FAQ Section */}
      <GlassCard className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between p-4 glass-card cursor-pointer list-none group-open:bg-white/10 transition-all">
                <span className="font-medium text-white">{item.question}</span>
                <span className="text-yellow-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="mt-2 p-4 glass-card bg-white/5">
                <p className="text-gray-300 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </GlassCard>

      {/* Result Announcement Schedule */}
      <GlassCard className="p-8 mt-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Result Announcement Schedule</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ANNOUNCEMENT_SCHEDULE.slice(0, 3).map((schedule, index) => (
            <div key={index} className="text-center p-6 glass-card">
              <div className="text-lg font-bold text-yellow-400 mb-2">Draw #{index + 1}</div>
              <div className="text-xl font-semibold text-white mb-2">{schedule.drawTime}</div>
              <div className="text-sm text-gray-400 mb-2">Draw Time</div>
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="text-lg font-semibold text-cyan-400">{schedule.announcementTime}</div>
                <div className="text-sm text-gray-400">Result Announcement</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
          <p className="text-cyan-400 text-sm text-center">
            <strong>Note:</strong> Results are announced 30 minutes after each draw completion
          </p>
        </div>
      </GlassCard>

      {/* Important Notes */}
      <GlassCard className="p-6 mt-8 border-yellow-500/30">
        <h3 className="font-semibold text-yellow-400 mb-3">Important Notes</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• All prizes must be claimed within 30 days of the draw date</li>
          <li>• Winners must present the original ticket and valid photo ID</li>
          <li>• Taxes may be applicable on prize amounts as per government regulations</li>
          <li>• Results published here are for reference only - verify with official Suvarna Chakram sources</li>
        </ul>
      </GlassCard>
    </div>
  );
}