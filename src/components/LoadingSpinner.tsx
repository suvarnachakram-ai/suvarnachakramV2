import React, { useEffect } from 'react';

interface LoadingSpinnerProps {
  onComplete: () => void;
}

export default function LoadingSpinner({ onComplete }: LoadingSpinnerProps) {
  useEffect(() => {
    // Auto-play loading sounds
    const playLoadingSounds = () => {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create coin falling sound
        const createCoinSound = () => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Higher pitched coin sound
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
          
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
        };

        // Create wheel spinning sound
        const createWheelSound = () => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Low frequency spinning sound
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 2);
          oscillator.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 4);
          
          gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 4);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 4);
        };

        // Auto-start audio context and play sounds
        const startSounds = async () => {
          // Resume audio context if suspended
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          // Start wheel spinning sound immediately
          createWheelSound();
          
          // Play coin sounds at intervals
          const coinIntervals = [200, 600, 1200, 1800, 2400, 3000, 3600, 4200];
          coinIntervals.forEach(delay => {
            setTimeout(createCoinSound, delay);
          });
        };

        // Start sounds immediately
        startSounds();
        
        // Also try to start on any user interaction
        const handleInteraction = () => {
          startSounds();
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };
        
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
        
        // Cleanup
        setTimeout(() => {
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        }, 5000);
        
      } catch (error) {
        console.log('Audio not supported');
      }
    };

    playLoadingSounds();

    // Complete loading after 5 seconds
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Falling Gold Coins */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 z-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10vh',
              animation: `coin-fall-loading ${4 + Math.random() * 3}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 shadow-2xl shadow-yellow-400/80 border-3 border-yellow-100" 
                 style={{ animation: 'coin-spin 1s linear infinite' }}>
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-yellow-100 shadow-inner border border-yellow-200/50"></div>
              </div>
            </div>
          </div>
        ))}
        
      </div>

      {/* Lucky Spin Wheel */}
      <div className="relative z-10">


        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/40 to-amber-400/40 blur-3xl animate-pulse scale-150" />
        
        {/* Main Logo and Text */}
        <div className="flex flex-col items-center justify-center">
          {/* Title Text */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,215,0,0.6)] animate-pulse">
              Keralam
            </h1>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,215,0,0.6)] animate-pulse">
    കേരളം
  </h1>
          </div>

          {/* Logo */}
          <div className="relative w-32 h-32">
            {/* Outer layer - slower rotation */}
            <img 
              src="/outer.png" 
              alt="Suvarna Chakra Outer" 
              className="absolute inset-0 w-32 h-32 object-contain"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 50px rgba(245, 158, 11, 0.7)) drop-shadow(0 0 75px rgba(251, 191, 36, 0.5))',
                animation: 'loading-logo-rotate 4s linear infinite, loading-logo-glow 3s ease-in-out infinite alternate'
              }}
            />
            {/* Inner layer - faster counter-rotation 
            <img 
              src="/inner.png" 
              alt="Suvarna Chakra Inner" 
              className="absolute inset-0 w-32 h-32 object-contain"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 1)) drop-shadow(0 0 60px rgba(245, 158, 11, 0.8)) drop-shadow(0 0 90px rgba(251, 191, 36, 0.6))',
                animation: 'loading-logo-rotate 2.5s linear infinite reverse, loading-logo-glow 2s ease-in-out infinite alternate'
              }}
            />*/}
          </div>
          
          {/* Bottom Text */}
          <div className="mt-8 text-center">
            <div className="text-xl font-bold gradient-text mb-1">Suvarna Chakram</div>
            <div className="text-sm text-yellow-400" style={{ fontFamily: 'serif' }}>സുവർണ്ണ ചക്രം</div>
          </div>
        </div>
      </div>
    </div>
  );
}