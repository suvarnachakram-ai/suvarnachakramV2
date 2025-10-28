import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Disc3 } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Charts', href: '/results' },
    { name: 'News', href: '/news' },
    { name: 'Help', href: '/help' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50 glass-card border-b border-yellow-500/20 rounded-2xl" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative h-12 w-12">
              {/* Outer rotating layer */}
              <img 
                src="/outer.png" 
                alt="Suvarna Chakra Outer" 
                className="absolute inset-0 h-12 w-12 object-contain animate-logo-rotate filter drop-shadow-2xl shadow-yellow-400/70 group-hover:shadow-yellow-300/90 transition-all duration-300"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.4))',
                  animation: 'logo-rotate 3s linear infinite, logo-glow 3s ease-in-out infinite alternate',
                  willChange: 'transform, filter'
                }}
              />
              {/* Inner counter-rotating layer 
              <img 
                src="/inner.png" 
                alt="Suvarna Chakra Inner" 
                className="absolute inset-0 h-12 w-12 object-contain filter drop-shadow-xl shadow-yellow-300/80 group-hover:shadow-yellow-200/90 transition-all duration-300"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))',
                  animation: 'logo-rotate 2s linear infinite reverse, logo-glow 2s ease-in-out infinite alternate',
                  willChange: 'transform, filter'
                }}
              />*/}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl gradient-text">Suvarna Chakram</span>
              <span className="text-xs text-yellow-400" style={{ fontFamily: 'serif' }}>സ്വർണ്ണ ചക്ര</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                  isActive(item.href)
                    ? 'gradient-text bg-yellow-400/10'
                    : 'text-white hover:text-yellow-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-yellow-200 hover:text-yellow-400 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-yellow-500/20 mt-2 pt-4 pb-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-yellow-400'
                    : 'text-yellow-200 hover:text-yellow-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}