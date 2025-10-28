import React from 'react';
import { Link } from 'react-router-dom';
import { Disc3, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-card border-t border-yellow-500/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative h-6 w-6">
                <img 
                  src="/outer.png" 
                  alt="Suvarna Chakra Outer" 
                  className="absolute inset-0 h-8 w-8 object-contain animate-spin-slow"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.4))',
                    animation: 'spin 4s linear infinite'
                  }}
                />
                {/*<img 
                  src="/inner.png" 
                  alt="Suvarna Chakra Inner" 
                  className="absolute inset-0 h-6 w-6 object-contain animate-spin-slow"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 14px rgba(245, 158, 11, 0.6))',
                    animation: 'spin 3s linear infinite reverse'
                }}
                />*/}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg gradient-text">Suvarna Chakram</span>
                <span className="text-xs text-yellow-400" style={{ fontFamily: 'serif' }}>
സുവർണ്ണ ചക്രം</span>
              </div>
            </div>
            <p className="text-yellow-600 text-sm leading-relaxed">
              Your trusted source for Suvarna Chakram lottery results. Quick, accurate, and always up-to-date.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-yellow-100 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/results" className="block text-yellow-600 hover:text-yellow-400 transition-colors text-sm">
                Charts
              </Link>
              <Link to="/news" className="block text-yellow-600 hover:text-yellow-400 transition-colors text-sm">
                News
              </Link>
              <Link to="/help" className="block text-yellow-600 hover:text-yellow-400 transition-colors text-sm">
                Help & FAQ
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-yellow-100 mb-4">Information</h3>
            <div className="space-y-2">
              <Link to="/news" className="block text-yellow-600 hover:text-yellow-400 transition-colors text-sm">
                Latest News
              </Link>
              <Link to="/contact" className="block text-yellow-600 hover:text-yellow-400 transition-colors text-sm">
                Contact Us
              </Link>
              <a href="#" className="block text-yellow-600 hover:text-yellow-400 transition-colors text-sm">
                Official Website
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-yellow-100 mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                {/*
              <Phone className="h-4 w-4" />
                <span>+91 971 2305xxx</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
              */}
                <Mail className="h-4 w-4" />
                <span>info@suvarnachakram.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                <MapPin className="h-4 w-4" />
                <span>Thiruvananthapuram, Kerala</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-500/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-yellow-600 text-sm">
              © 2020 - {new Date().getFullYear()} Suvarna Chakram Results. All rights reserved.
            </p>
            <p className="text-yellow-700 text-xs mt-2 md:mt-0">
              Results displayed are for reference only. Please verify with official sources.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}