import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Loader } from 'lucide-react';
import { Draw } from '../types';
import { formatSlotTime } from '../utils/time';
import GlassCard from './GlassCard';

interface ResultCardProps {
  draw: Draw;
}

export default function ResultCard({ draw }: ResultCardProps) {
  const [isRevealed, setIsRevealed] = useState(true); // Always revealed now
  const [flippedDigits, setFlippedDigits] = useState<boolean[]>([false, false, false, false, false]);
  const [rollingDigits, setRollingDigits] = useState<boolean[]>([true, true, true, true, true]);
  const [currentNumbers, setCurrentNumbers] = useState<string[]>(['0', '0', '0', '0', '0']);
  const [cardVisible, setCardVisible] = useState(false);

  // If not published, show chakra animation
  if (!draw.published) {
    return (
      <GlassCard 
        hover 
        className="p-6 relative overflow-hidden transition-all duration-700 ease-out transform translate-y-0 opacity-100"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-yellow-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(draw.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-yellow-400">
            <Clock className="h-4 w-4" />
            <span>
              {formatSlotTime(draw.slot)}
            </span>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-yellow-600 mb-1">Draw No.</div>
          <div className="font-semibold text-yellow-100">{draw.drawNo}</div>
        </div>

        {/* Chakra Animation Grid */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="h-16 flex items-center justify-center">
              <div className="w-12 h-12 relative">
                {/* Spinning Chakra Wheel */}
                <div className="relative w-full h-full">
                  <img 
                    src="/outer.png" 
                    alt="Suvarna Chakra Outer" 
                    className="absolute inset-0 w-full h-full object-contain opacity-90"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))',
                      animation: `spin ${2 + index * 0.3}s linear infinite`,
                    }}
                  />
                  {/*<img 
                    src="/inner.png" 
                    alt="Suvarna Chakra Inner" 
                    className="absolute inset-0 w-full h-full object-contain opacity-90"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 18px rgba(245, 158, 11, 0.7))',
                      animation: `spin ${1.5 + index * 0.2}s linear infinite reverse`,
                    }}
                  />*/}
                </div>
                {/* Glowing ring around chakra */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-pulse"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: '1.5s'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pending Status */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Loader className="h-4 w-4 text-orange-400 animate-spin" />
            <span className="text-orange-400 font-medium">Draw in Progress</span>
          </div>
          <div className="text-xs text-gray-400">
            Results will be revealed shortly
          </div>
        </div>

        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/10 to-yellow-500/5 animate-pulse pointer-events-none" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400/60 rounded-full animate-float"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </GlassCard>
    );
  }

  const playFlipSound = (digitIndex: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Mechanical flip sound - quick click
      oscillator.frequency.setValueAtTime(800 + digitIndex * 100, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Auto-reveal animation when component mounts
  useEffect(() => {
    // First show the card with swipe-up animation
    const cardTimer = setTimeout(() => {
      setCardVisible(true);
    }, 100);

    // Then start the digit flip animation after card is visible
    const flipTimer = setTimeout(() => {
      // Flip each digit with staggered timing
      [0, 1, 2, 3, 4].forEach((index) => {
        setTimeout(() => {
          setFlippedDigits(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          playFlipSound(index);
          
          // Start slot machine animation after flip completes
          setTimeout(() => {
            startSlotMachineAnimation(index);
          }, 800); // Wait for flip animation to complete
        }, index * 200); // 200ms delay between each digit
      });
    }, 800); // Start flipping 800ms after card appears

    return () => {
      clearTimeout(cardTimer);
      clearTimeout(flipTimer);
    };
  }, []);

  const startSlotMachineAnimation = (digitIndex: number) => {
    const finalNumbers = [draw.digit1, draw.digit2, draw.digit3, draw.digit4, draw.digit5];
    const finalNumber = finalNumbers[digitIndex];
    const allNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    // Start rolling animation
    setRollingDigits(prev => {
      const newState = [...prev];
      newState[digitIndex] = true;
      return newState;
    });
    
    // Roll through numbers for 2 seconds
    const rollDuration = 3000 + (digitIndex * 400); // Staggered stopping
    const rollInterval = 100; // Change number every 100ms
    let rollCount = 0;
    const maxRolls = rollDuration / rollInterval;
    
    const rollTimer = setInterval(() => {
      rollCount++;
      
      if (rollCount >= maxRolls) {
        // Stop on final number
        setCurrentNumbers(prev => {
          const newNumbers = [...prev];
          newNumbers[digitIndex] = finalNumber;
          return newNumbers;
        });
        
        setRollingDigits(prev => {
          const newState = [...prev];
          newState[digitIndex] = false;
          return newState;
        });
        
        clearInterval(rollTimer);
      } else {
        // Show random number while rolling
        setCurrentNumbers(prev => {
          const newNumbers = [...prev];
          newNumbers[digitIndex] = allNumbers[Math.floor(Math.random() * 10)];
          return newNumbers;
        });
      }
    }, rollInterval);
  };
  const handleRevealOld = () => {
    // Flip each digit with staggered timing
    [0, 1, 2, 3, 4].forEach((index) => {
      setTimeout(() => {
        setFlippedDigits(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        playFlipSound(index);
      }, index * 200); // 200ms delay between each digit
    });
    
    // Mark as fully revealed after all digits are flipped
    setTimeout(() => {
      setIsRevealed(true);
    }, 4 * 200 + 800); // After last digit + flip duration
  };

  return (
    <GlassCard 
      hover 
      className={`p-6 relative overflow-hidden transition-all duration-700 ease-out transform ${
        cardVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-yellow-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(draw.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-yellow-400">
          <Clock className="h-4 w-4" />
          <span>
            {formatSlotTime(draw.slot)}
          </span>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="text-sm text-yellow-600 mb-1">Draw No.</div>
        <div className="font-semibold text-yellow-100">{draw.drawNo}</div>
      </div>
      <div className="grid grid-cols-5 gap-1 mb-6 p-3 border-2 border-gray-500 rounded-lg bg-gradient-to-r from-gray-800/20 via-gray-700/30 to-gray-800/20">
        {[
          { digit: draw.digit1, color: 'cyan' },
          { digit: draw.digit2, color: 'yellow' },
          { digit: draw.digit3, color: 'green' },
          { digit: draw.digit4, color: 'purple' },
          { digit: draw.digit5, color: 'pink' },
        ].map((item, index) => (
          <div key={index} className="flip-board h-16">
            <div className={`flip-digit ${flippedDigits[index] ? 'flipped' : ''}`}>
              {/* Front face - shows before flip */}
              <div className="flip-face flip-front">
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 border-2 border-yellow-600/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Texture overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                      radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px),
                      linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
                      linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%)
                    `,
                    backgroundSize: '8px 8px, 12px 12px, 4px 4px, 4px 4px'
                  }} />
                  
                  <div className="relative w-8 h-8 z-10">
                    <img 
                      src="/outer.png" 
                      alt="Suvarna Chakra Outer" 
                      className="absolute inset-0 w-8 h-8 object-contain opacity-90"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))',
                        animation: 'spin 2s linear infinite'
                      }}
                    />
                    {/*<img 
                      src="/inner.png" 
                      alt="Suvarna Chakra Inner" 
                      className="absolute inset-0 w-8 h-8 object-contain opacity-90"
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 18px rgba(245, 158, 11, 0.7))',
                        animation: 'spin 1.5s linear infinite reverse'
                      }}
                    />*/}
                  </div>
                </div>
              </div>
              
              {/* Back face - shows after flip */}
              <div className="flip-face flip-back">
                <div className="w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Center horizontal divider line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent transform -translate-y-0.5" />
                  
                  {/* Slot Machine Number Display */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
                    {rollingDigits[index] ? (
                      <div className="slot-machine-reel">
                        <div className="slot-reel-container">
                          {/* Show multiple numbers for rolling effect */}
                          {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5'].map((num, i) => (
                            <span key={i} className="slot-number rolling">
                              {(i === 8) ? currentNumbers[index] : num}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="slot-number final" style={{
                        color: '#000000',
                        textShadow: '0 0 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.6), 1px 1px 2px rgba(255, 255, 255, 0.2)',
                        fontWeight: '900',
                        fontSize: '1.5rem'
                      }}>
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
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <span className="text-gray-400 font-medium">Results Published</span>
        </div>
        <div className="text-xs text-gray-400">
          Suvarnaa Chakram Lottery
        </div>
      </div>

      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-gray-400/10 to-gray-500/5 animate-pulse pointer-events-none" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gray-400/60 rounded-full animate-float"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}