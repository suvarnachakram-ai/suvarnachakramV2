import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getNextDrawTime, formatTimeRemaining } from '../utils/time';
import GlassCard from './GlassCard';

export default function CountdownTimer() {
  const [timeData, setTimeData] = useState<{ slot: string; timeUntil: number } | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      setTimeData(getNextDrawTime());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeData || timeData.timeUntil <= 0) {
    return null;
  }

  return (
    <GlassCard className="p-6 text-center" glow>
      <div className="flex items-center justify-center space-x-2 mb-3">
        <Clock className="h-5 w-5 text-yellow-400" />
        <span className="text-yellow-400 font-semibold">Next Draw</span>
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold gold-text">
          {timeData.slot === '10:00' ? '10:00 AM' :
           timeData.slot === '12:00' ? '12:00 PM' : 
           timeData.slot === '14:00' ? '02:00 PM' :
           timeData.slot === '17:00' ? '05:00 PM' :
           timeData.slot === '19:00' ? '07:00 PM' :'10:00 AM'}
        </div>
        <div className="text-xl font-mono text-yellow-100">
          {formatTimeRemaining(timeData.timeUntil)}
        </div>
        <div className="text-sm text-yellow-600">
          until next draw
        </div>
      </div>
    </GlassCard>
  );
}