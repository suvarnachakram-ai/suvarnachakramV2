import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import supabase from '../lib/supabase';
import GlassCard from '../components/GlassCard';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(credentials.email, credentials.password);
    
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid email or password. If this is your first time, click "Create Admin Account" below.');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        // Auto-login after registration
        const loginSuccess = await login(credentials.email, credentials.password);
        if (loginSuccess) {
          navigate('/admin');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create admin account');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold gradient-text">
              {isRegistering ? 'Create Admin Account' : 'Admin Login'}
            </h1>
            <p className="text-gray-400 mt-2">
              {isRegistering ? 'Set up your admin account' : 'Access the administrative panel'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="input-field w-full"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="input-field w-full pr-12"
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isRegistering ? 'Creating Account...' : 'Signing in...') 
                : (isRegistering ? 'Create Admin Account' : 'Sign In')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 underline"
            >
              {//isRegistering 
                //? 'Already have an account? Sign In' 
                //: 'First time? Create Admin Account'
              }
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}