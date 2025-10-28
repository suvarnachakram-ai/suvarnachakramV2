import React, { useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    // Complete loading after 3 seconds
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Falling Gold Coins */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 animate-coin-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10vh',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              animationIterationCount: 'infinite',
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/50 animate-coin-spin">
              <div className="w-full h-full rounded-full border-2 border-yellow-200/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yellow-200/60"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lucky Spin Wheel */}
      <div className="relative">
{/* Title Text */}
<div className="absolute -top-24 left-1/2 transform -translate-x-1/2">
  <h1 className="text-4xl font-extrabold bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,215,0,0.6)] animate-pulse">
    Keralam
  </h1>
  <h1 className="text-4xl font-bold bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,215,0,0.6)] animate-pulse">
    കേരളം
  </h1>
</div>

        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-yellow-400/30 blur-2xl animate-pulse scale-150" />
        
        {/* Main Wheel */}
        <div className="w-40 h-40 rounded-full border-4 border-gradient-to-r from-cyan-400 to-blue-500 animate-wheel-spin relative shadow-2xl shadow-cyan-500/30">
          {/* Wheel Background */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-2xl shadow-yellow-500/40 overflow-hidden">
            {/* Layered Chakra Design */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                <img 
                  src="/outer.png" 
                  alt="Suvarna Chakra Outer" 
                  className="absolute inset-0 w-32 h-32 object-contain opacity-80"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8))',
                    animation: 'spin 3s linear infinite'
                  }}
                />
                {/*<img 
                  src="/inner.png" 
                  alt="Suvarna Chakra Inner" 
                  className="absolute inset-0 w-32 h-32 object-contain opacity-90"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.9))',
                    animation: 'spin 2s linear infinite reverse'
                  }}
                />*/}
              </div>
            </div>
            
            {/* Wheel Segments */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  <div className={`absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom transform -translate-x-1/2 ${
                    i % 2 === 0 ? 'bg-yellow-300/80' : 'bg-amber-600/80'
                  }`} />
                </div>
              ))}
              
              {/* Numbers on wheel */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xs font-bold text-amber-900"
                  style={{
                    top: '20%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-25px) rotate(-${i * 45}deg)`,
                    transformOrigin: '0 25px',
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Center Hub */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-inner flex items-center justify-center border-2 border-yellow-200/30">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 shadow-lg border border-yellow-200/20" />
            </div>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-cyan-400 drop-shadow-2xl shadow-cyan-400/50" 
               style={{ 
                 borderLeftWidth: '12px', 
                 borderRightWidth: '12px', 
                 borderBottomWidth: '20px',
                 filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.6))'
               }} />
        </div>

        {/* Inner Glow Ring */}
        <div className="absolute inset-4 rounded-full border-2 border-cyan-400/20 animate-pulse" />
      </div>
    </div>
  );
}