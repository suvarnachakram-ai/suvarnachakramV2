import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, FileText, HelpCircle, Mail, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TIME_SLOTS, getCurrentTimeSlotState, formatSlotTime } from '../utils/time';
import CountdownTimer from '../components/CountdownTimer';
import TimeBasedResultCard from '../components/TimeBasedResultCard';
import GlassCard from '../components/GlassCard';

export default function Home() {
  const { draws } = useData();
  const [selectedSlot, setSelectedSlot] = useState<string>('all');

  // === AUTO REFRESH LOGIC ===
  useEffect(() => {
    const scheduleNextRefresh = () => {
      const now = new Date();

      // find next slot reveal time
      let nextRefreshTime: number | null = null;

      for (const slot of TIME_SLOTS) {
        const [h, m] = slot.split(':').map(Number);
        const revealTime = new Date();
        revealTime.setHours(h, m + 15, 0, 0); // refresh 15 min after slot time

        if (revealTime.getTime() > now.getTime()) {
          nextRefreshTime = revealTime.getTime();
          break;
        }
      }

      if (nextRefreshTime) {
        const delay = nextRefreshTime - now.getTime() + 2000; // +2s buffer
        console.log('Next auto-refresh scheduled in', delay / 1000, 'seconds');

        return setTimeout(() => {
          window.location.reload();
        }, delay);
      }

      return null;
    };

    const timer = scheduleNextRefresh();

    // backup refresh every 1 hour (in case tab sleeps)
    const fallback = setInterval(() => {
      window.location.reload();
    }, 60 * 60 * 1000);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(fallback);
    };
  }, []);

  // === SLOT ORDERING ===
  const getOrderedTimeSlots = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const slotsWithData = TIME_SLOTS.map((slot, index) => {
      const state = getCurrentTimeSlotState(slot);
      const todayDraw = draws.find(
        (draw) => draw.date === today && draw.slot === slot && draw.published
      );
      return { slot, index, state, draw: todayDraw };
    });

    const sortedSlots = slotsWithData.sort((a, b) => {
      // 1. live draws
      if (a.state === 'live' && b.state !== 'live') return -1;
      if (b.state === 'live' && a.state !== 'live') return 1;

      // 2. recently revealed (within last 2 hrs)
      if (a.state === 'revealed' && b.state === 'revealed') {
        const aTime = new Date(`${today} ${a.slot}`).getTime();
        const bTime = new Date(`${today} ${b.slot}`).getTime();
        const twoHoursAgo = now.getTime() - 2 * 60 * 60 * 1000;

        const aRecent = aTime > twoHoursAgo;
        const bRecent = bTime > twoHoursAgo;

        if (aRecent && !bRecent) return -1;
        if (bRecent && !aRecent) return 1;
        return bTime - aTime; // newer first
      }

      // 3. revealed before waiting
      if (a.state === 'revealed' && b.state === 'waiting') return -1;
      if (b.state === 'revealed' && a.state === 'waiting') return 1;

      // 4. waiting sorted by time
      if (a.state === 'waiting' && b.state === 'waiting') {
        return a.index - b.index;
      }

      return a.index - b.index;
    });

    return sortedSlots;
  };

  // === FILTERING ===
  const getFilteredSlots = () => {
    const ordered = getOrderedTimeSlots();
    if (selectedSlot === 'all') return ordered;
    return ordered.filter(({ slot }) => slot === selectedSlot);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Slot Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto md:flex md:flex-wrap md:gap-3 md:justify-center md:max-w-none">
          <button
            onClick={() => setSelectedSlot('all')}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all md:px-6 md:py-3 md:text-base md:rounded-xl ${
              selectedSlot === 'all'
                ? 'selection-glitter text-black font-bold'
                : 'glass-card text-yellow-200 hover:text-yellow-300'
            }`}
          >
            All Draws
          </button>

          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all md:px-6 md:py-3 md:text-base md:rounded-xl ${
                selectedSlot === slot
                  ? 'selection-glitter text-black font-bold'
                  : 'glass-card text-yellow-200 hover:text-yellow-300'
              }`}
            >
              {formatSlotTime(slot)}
            </button>
          ))}
        </div>
      </div>

      {/* Live Results */}
      <div className="mb-12 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-100">Live Draw Results</h2>
          <div className="flex items-center space-x-2 text-sm text-yellow-600">
            <Calendar className="h-4 w-4" />
            <span>Auto-refreshes at each reveal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredSlots().map(({ slot, index }) => (
            <TimeBasedResultCard key={slot} slot={slot} slotIndex={index} />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="gradient-text">Today's</span>{' '}
          <span className="gold-text">Draws</span>
        </h1>
        <p className="text-xl text-yellow-200 mb-8 max-w-2xl mx-auto">
          Live Suvarna Chakram lottery results with instant updates. Check your winning numbers across all draws.
        </p>

        <div className="max-w-md mx-auto mb-8">
          <CountdownTimer />
        </div>
      </div>

      {/* CTA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/results" className="group">
          <GlassCard hover className="p-6 text-center h-full">
            <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-yellow-100 mb-2">View All Results</h3>
            <p className="text-sm text-yellow-600">
              Browse complete result history with advanced filters
            </p>
          </GlassCard>
        </Link>

        <Link to="/news" className="group">
          <GlassCard hover className="p-6 text-center h-full">
            <FileText className="h-8 w-8 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-yellow-100 mb-2">News</h3>
            <p className="text-sm text-yellow-600">
              Keep up to date with important news & alerts
            </p>
          </GlassCard>
        </Link>

        <Link to="/help" className="group">
          <GlassCard hover className="p-6 text-center h-full">
            <HelpCircle className="h-8 w-8 text-yellow-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-yellow-100 mb-2">Help & FAQ</h3>
            <p className="text-sm text-yellow-600">
              Get answers to common questions
            </p>
          </GlassCard>
        </Link>

        <Link to="/contact" className="group">
          <GlassCard hover className="p-6 text-center h-full">
            <Mail className="h-8 w-8 text-amber-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-yellow-100 mb-2">Contact Us</h3>
            <p className="text-sm text-yellow-600">
              Get in touch for support and inquiries
            </p>
          </GlassCard>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-12">
        <GlassCard className="p-4 text-center border-yellow-500/50">
          <p className="text-yellow-400 text-sm">
            <strong>Disclaimer:</strong> Results displayed are for quick reference only. Please verify with official Suvarna Chakram sources for final confirmation.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
