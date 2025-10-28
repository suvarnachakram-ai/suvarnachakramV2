import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ transform: 'translateZ(0)' }}>
      <Header />
      <main className="flex-1 pt-24" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}