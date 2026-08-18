import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginSignup: React.FC = () => {
  const { triggerOnboardingState } = useApp();
  const [email, setEmail] = useState('manav@stayos.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }
    
    // Auto validate and redirect
    triggerOnboardingState(true);
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070c09] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-950/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-950/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Main card panel */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand logo top header */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center font-extrabold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
            ⚡
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">stay<span className="text-emerald-400">os</span></span>
        </Link>

        <div className="bg-[#0d1611] border border-emerald-900/30 rounded-2xl py-8 px-4 shadow-2xl sm:px-10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-outfit">Welcome Back</h2>
            <p className="text-xs text-[#a3b2a8] font-semibold">Sign in to manage your hotel operations portal</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-white">
            
            {/* Email field */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-500 mb-1.5">Owner Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3b2a8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090f0c] border border-emerald-900/35 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-500 mb-1.5">Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3b2a8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#090f0c] border border-emerald-900/35 focus:outline-none focus:border-emerald-500 text-xs font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3b2a8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo Notice */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-[10px] text-[#a3b2a8] leading-normal font-medium">
              <span className="font-extrabold text-emerald-400 block mb-0.5">Demo Mode Credentials:</span>
              Login is pre-filled with the mock owner account. Simply click 'Sign In' to access.
            </div>

            {/* Action button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#0b130e] font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all cursor-pointer text-center"
            >
              Sign In
            </button>
          </form>

          {/* Redirect to signup onboarding */}
          <div className="text-center pt-2 border-t border-emerald-950 text-[10px] text-[#a3b2a8] font-bold">
            Don't have a hotel dashboard?{' '}
            <Link to="/signup" className="text-emerald-400 hover:underline">
              Create Your Hotel
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
export default LoginSignup;
