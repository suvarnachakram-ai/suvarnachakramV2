import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatSlotTime, TIME_SLOTS } from '../utils/time';
import SlotTabs from '../components/SlotTabs';
import ResultCard from '../components/ResultCard';
import GlassCard from '../components/GlassCard';

export default function ResultsBySlot() {
  const { slot: slotParam } = useParams<{ slot: string }>();
  const { draws } = useData();
  const [slotDraws, setSlotDraws] = useState(draws);

  // Convert URL param back to slot format
  const actualSlot = slotParam?.replace('-', ':');
  
  // Validate slot parameter
  if (!actualSlot || !TIME_SLOTS.includes(actualSlot as any)) {
    return <Navigate to="/results" replace />;
  }

  useEffect(() => {
    const filtered = draws
      .filter(draw => draw.slot === actualSlot && draw.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSlotDraws(filtered);
  }, [draws, actualSlot]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
          {formatSlotTime(actualSlot)} Results
        </h1>
        <p className="text-gray-300">
          Complete result history for the {formatSlotTime(actualSlot)} draw slot.
        </p>
      </div>

      <SlotTabs />

      <GlassCard className="overflow-hidden">
        {slotDraws.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Draw No.</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">1st</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">2nd</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">3rd</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">4th</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">5th</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {slotDraws.map((draw) => (
                    <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(draw.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {draw.drawNo}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="number-display">
                          {draw.digit1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="number-display">
                          {draw.digit2}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="number-display">
                          {draw.digit3}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="number-display">
                          {draw.digit4}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="number-display">
                          {draw.digit5}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {slotDraws.map((draw) => (
                <ResultCard key={draw.id} draw={draw} />
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4 text-lg">No results available</div>
            <p className="text-gray-500">
              Results for this time slot will appear here once draws are completed
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}