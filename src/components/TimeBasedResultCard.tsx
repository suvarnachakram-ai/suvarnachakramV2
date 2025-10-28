import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Loader, Zap } from 'lucide-react';
import { formatSlotTime, getCurrentTimeSlotState, getTimeUntilSlot } from '../utils/time';
import { useData } from '../context/DataContext';
import GlassCard from './GlassCard';

interface TimeBasedResultCardProps {
  slot: string;
  slotIndex: number;
}

export default function TimeBasedResultCard({ slot, slotIndex }: TimeBasedResultCardProps) {
  const { draws } = useData();

  const [cardState, setCardState] = useState<'waiting' | 'live' | 'revealed'>('waiting');
  const [timeUntil, setTimeUntil] = useState(0);
  const [timeUntilReveal, setTimeUntilReveal] = useState(0);
  const [rollingDigits, setRollingDigits] = useState<boolean[]>([false, false, false, false, false]);
  const [currentNumbers, setCurrentNumbers] = useState<string[]>(['0', '0', '0', '0', '0']);
  const [finalNumbers, setFinalNumbers] = useState<string[]>(['0', '0', '0', '0', '0']);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // === Audio Ref for Spin Sound ===
  const spinSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load spin sound once
    spinSound.current = new Audio('/sounds/spin.mp3');
    spinSound.current.loop = true;
    spinSound.current.volume = 1; // Adjust volume as desired
  }, []);

  // Get today's draw for this slot
  const today = new Date().toISOString().split('T')[0];
  const todayDraw = draws.find(
    (draw) => draw.date === today && draw.slot === slot && draw.published
  );

  // Calculate time until reveal (15 minutes after draw time)
  const getTimeUntilReveal = () => {
    const now = new Date();
    const [hours, minutes] = slot.split(':').map(Number);
    const revealTime = new Date();
    revealTime.setHours(hours, minutes + 15, 0, 0);

    if (revealTime.getTime() <= now.getTime()) {
      return 0;
    }
    return revealTime.getTime() - now.getTime();
  };

  useEffect(() => {
    const updateState = () => {
      const state = getCurrentTimeSlotState(slot);
      const timeRemaining = getTimeUntilSlot(slot);
      const revealTimeRemaining = getTimeUntilReveal();

      setCardState(state);
      setTimeUntil(timeRemaining);
      setTimeUntilReveal(revealTimeRemaining);

      // If slot is revealed and we have today's draw and animation not yet started
      if (state === 'revealed' && todayDraw && !hasAnimated) {
        const numbers = [
          todayDraw.digit1,
          todayDraw.digit2,
          todayDraw.digit3,
          todayDraw.digit4,
          todayDraw.digit5,
        ];
        setFinalNumbers(numbers);
        setHasAnimated(true);

        setTimeout(() => {
          startSlotAnimation(numbers);
        }, 300);
      }

      // If animation is already done
      if (state === 'revealed' && todayDraw && hasAnimated && animationComplete) {
        setShowResults(true);
        setCurrentNumbers([
          todayDraw.digit1,
          todayDraw.digit2,
          todayDraw.digit3,
          todayDraw.digit4,
          todayDraw.digit5,
        ]);
      }
    };

    updateState();
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [slot, todayDraw, hasAnimated, animationComplete]);

  const startSlotAnimation = (winningNumbers: string[]) => {
    setShowResults(false);
    setAnimationComplete(false);
    setRollingDigits([true, true, true, true, true]);

    // Start spin sound
    spinSound.current?.play();

    let completedDigits = 0;
    const maxRolls = 20;

    // Start all digits spinning simultaneously
    for (let digitIndex = 0; digitIndex < 5; digitIndex++) {
      let rollCount = 0;

      const rollInterval = setInterval(() => {
        rollCount++;

        setCurrentNumbers((prev) => {
          const newNumbers = [...prev];
          newNumbers[digitIndex] = Math.floor(Math.random() * 10).toString();
          return newNumbers;
        });

        if (rollCount >= maxRolls + digitIndex * 3) {
          clearInterval(rollInterval);

          // Lock final digit
          setRollingDigits((prev) => {
            const newState = [...prev];
            newState[digitIndex] = false;
            return newState;
          });

          setCurrentNumbers((prev) => {
            const newNumbers = [...prev];
            newNumbers[digitIndex] = winningNumbers[digitIndex];
            return newNumbers;
          });

          completedDigits++;
          if (completedDigits === 5) {
            // Stop spin sound
            spinSound.current?.pause();
            spinSound.current!.currentTime = 0;

            setTimeout(() => {
              setAnimationComplete(true);
              setShowResults(true);
              setCurrentNumbers([...winningNumbers]);
            }, 500);
          }
        }
      }, 100);
    }
  };

  const generateDrawNumber = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString();
    return `SC${day}${month}${year}${slotIndex + 1}`;
  };

  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <GlassCard hover className="p-6 relative overflow-hidden transition-all duration-700 ease-out">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-yellow-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-yellow-400">
          <Clock className="h-4 w-4" />
          <span>{formatSlotTime(slot)}</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="text-sm text-yellow-600 mb-1">Draw No.</div>
        <div className="font-semibold text-yellow-100">{generateDrawNumber()}</div>
      </div>

      {/* Live Badge */}
      {cardState === 'live' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            <Zap className="h-3 w-3" />
            <span>LIVE NOW</span>
          </div>
        </div>
      )}

      {/* Number Grid */}
      <div className="grid grid-cols-5 gap-1 mb-6 p-3 border-2 border-gray-500 rounded-lg bg-gradient-to-r from-gray-800/20 via-gray-700/30 to-gray-800/20">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flip-board h-16">
            <div className="flip-digit flipped">
              <div className="flip-face flip-back">
                <div className="w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent transform -translate-y-0.5" />
                  <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
                    {(cardState === 'waiting' || cardState === 'live') ? (
                      // spinning logo before reveal
                      <div className="relative w-8 h-8">
                        <img
                          src="/outer.png"
                          alt="Suvarna Chakra"
                          className="absolute inset-0 w-8 h-8 object-contain opacity-90"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8)) drop-shadow(0 0 16px rgba(245,158,11,0.6))',
                            animation: 'spin 2s linear infinite'
                          }}
                        />
                      </div>
                    ) : rollingDigits[index] ? (
                      // rolling animation
                      <div className="slot-machine-reel">
                        <div className="slot-reel-container">
                          {['0','1','2','3','4','5','6','7','8','9'].map((num, i) => (
                            <span key={i} className="slot-number rolling">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // final number
                      <span
                        className="slot-number final"
                        style={{
                          color: '#000',
                          textShadow: '0 0 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6), 1px 1px 2px rgba(255,255,255,0.2)',
                          fontWeight: '900',
                          fontSize: '1.5rem'
                        }}
                      >
                        {currentNumbers[index]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="text-center">
        {cardState === 'waiting' && (
          <>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-medium">Starts in</span>
            </div>
            <div className="text-xs text-gray-400">
              {timeUntil > 0 ? formatTimeRemaining(timeUntil) : 'Starting soon...'}
            </div>
          </>
        )}

        {cardState === 'live' && (
          <>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Loader className="h-4 w-4 text-red-400 animate-spin" />
              <span className="text-red-400 font-medium">Draw in Progress</span>
            </div>
            <div className="text-xs text-gray-400">
              Results in {timeUntilReveal > 0 ? formatTimeRemaining(timeUntilReveal) : 'any moment...'}
            </div>
          </>
        )}

        {cardState === 'revealed' && animationComplete && (
          <>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">Results Published</span>
            </div>
            <div className="text-xs text-gray-400">Suvarna Chakram Lottery</div>
          </>
        )}

        {cardState === 'revealed' && !animationComplete && (
          <>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Loader className="h-4 w-4 text-yellow-400 animate-spin" />
              <span className="text-yellow-400 font-medium">Revealing Results</span>
            </div>
            <div className="text-xs text-gray-400">Revealing Results in Seconds...</div>
          </>
        )}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gray-400/60 rounded-full animate-float"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.2}s`
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}
