import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({ children, className = '', hover = false, glow = false }: GlassCardProps) {
  const baseClasses = glow 
    ? 'glass-card shadow-2xl shadow-yellow-500/30 border-yellow-500/40'
    : hover 
      ? 'glass-card-hover' 
      : 'glass-card';

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}