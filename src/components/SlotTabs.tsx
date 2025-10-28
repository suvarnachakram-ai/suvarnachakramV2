import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TIME_SLOTS, formatSlotTime } from '../utils/time';

export default function SlotTabs() {
  const location = useLocation();

  const isActive = (slot: string) => {
    const slotPath = slot.replace(':', '-');
    return location.pathname === `/results/${slotPath}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        to="/results"
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          location.pathname === '/results'
            ? 'selection-glitter text-black font-bold'
            : 'glass-card text-yellow-200 hover:text-yellow-300'
        }`}
      >
        All Results
      </Link>
      {TIME_SLOTS.map((slot) => {
        const slotPath = slot.replace(':', '-');
        return (
          <Link
            key={slot}
            to={`/results/${slotPath}`}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isActive(slot)
                ? 'selection-glitter text-black font-bold'
                : 'glass-card text-yellow-200 hover:text-yellow-300'
            }`}
          >
            {formatSlotTime(slot)}
          </Link>
        );
      })}
    </div>
  );
}