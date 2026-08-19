import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginSignup: React.FC = () => {
  const { triggerOnboardingState } = useApp();
  const [email, setEmail] = useState('admin@admin.com');
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
    if (email === 'superadmin@stayos.com') {
      const superUser = {
        id: "usr-super",
        name: "SuperAdmin",
        email: "superadmin@stayos.com",
        tenants: []
      };
      localStorage.setItem("stayos_v1_user", JSON.stringify(superUser));
      navigate('/admin');
    } else {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] flex font-sans antialiased">
      {/* Left side: Sign in form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 z-10 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8">
          
          {/* Brand Logo Header */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Custom Isomorphic logo style */}
            <div className="flex gap-1.5 items-center">
              {/* Short Blue Capsule */}
              <div className="w-3.5 h-7 rounded-full bg-gradient-to-b from-[#3872fa] to-[#4f46e5] rotate-[25deg] transform -translate-y-0.5"></div>
              {/* Long Purple Capsule */}
              <div className="w-3.5 h-10 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] transform -translate-y-1"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0f172a] ml-1">
              stay<span className="text-[#3872fa]">os</span>
            </span>
          </Link>

          {/* Titles */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Welcome back! Please{' '}
              <span className="relative inline-block text-slate-900">
                Sign in
                {/* Hand-drawn underline SVG */}
                <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-[#3872fa]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M1 5 Q 50 10, 99 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>{' '}
              to continue.
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed font-normal">
              By signing up, you will gain access to exclusive content, special offers, and be the first to hear about exciting news and updates.
            </p>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            >
              {/* Apple icon SVG */}
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.05-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.06 1.005 1.45 2.187 3.068 3.765 3.008 1.516-.06 2.09-.982 3.922-.982 1.822 0 2.348.982 3.93.95 1.614-.03 2.653-1.464 3.64-2.902 1.144-1.668 1.617-3.278 1.642-3.364-.035-.015-3.15-1.212-3.182-4.794-.027-2.99 2.446-4.428 2.56-4.5-.022-.047-.397-.7-1.364-1.393-1.075-.754-2.28-1.096-2.932-1.096zm2.34-4.22c.983-1.218 1.642-2.915 1.463-4.607-1.455.06-3.214.966-4.258 2.184-.948 1.096-1.776 2.822-1.55 4.484 1.623.129 3.26-.803 4.345-2.06z" />
              </svg>
              Signin With Apple
            </button>
            <button
              type="button"
              className="flex items-center justify-center py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            >
              {/* Google icon SVG */}
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 1 12 1 7.35 1 3.37 3.68 1.41 7.62l3.88 3c.96-2.88 3.66-4.99 6.71-4.99z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.98h3.91c2.28-2.1 3.54-5.19 3.54-8.71z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.29 14.62c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41l-3.88-3C.54 8.44 0 10.16 0 12s.54 3.56 1.41 5.2l3.88-3.02z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.91-2.98c-1.08.72-2.48 1.15-4.05 1.15-3.05 0-5.75-2.11-6.71-4.99l-3.88 3C3.37 20.32 7.35 23 12 23z"
                />
              </svg>
              Signin With Google
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 text-xs uppercase font-semibold text-slate-400 bg-white">OR</span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#3872fa] text-sm text-slate-800 transition-colors placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="•••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#3872fa] text-sm text-slate-800 transition-colors placeholder:text-slate-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox and Forgot Password link */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-[#3872fa] focus:ring-[#3872fa] accent-[#3872fa]"
                />
                Remember Me
              </label>
              <a href="#forgot" className="text-[#3872fa] hover:underline">
                Forget Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#3872fa] hover:bg-[#1e5ade] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
            >
              Sign In
            </button>
          </form>

          {/* Registration Notice / Demo Login Mode */}
          <div className="p-4 rounded-xl bg-[#eff6ff] border border-blue-100 text-xs text-[#1e40af] leading-relaxed font-medium space-y-3">
            <div>
              <span className="font-bold text-[#1d4ed8] block mb-1">Hotel Manager:</span>
              Pre-filled with `admin@admin.com`. Just click **Sign In** to log in to the hotel portal.
            </div>
            <div className="border-t border-blue-200/50 pt-2 flex justify-between items-center gap-2">
              <div>
                <span className="font-bold text-indigo-700 block mb-0.5">SaaS Platform Admin:</span>
                Access the Super Admin panel.
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@stayos.com');
                  setPassword('superadmin123');
                  triggerOnboardingState(true);
                  const superUser = {
                    id: "usr-super",
                    name: "SuperAdmin",
                    email: "superadmin@stayos.com",
                    tenants: []
                  };
                  localStorage.setItem("stayos_v1_user", JSON.stringify(superUser));
                  navigate('/admin');
                }}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition-all text-[10px] cursor-pointer shrink-0"
              >
                Super Admin Login
              </button>
            </div>
          </div>

          {/* Redirect to signup */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Don't have a hotel dashboard?{' '}
            <Link to="/signup" className="text-[#3872fa] hover:underline font-bold">
              Create Your Hotel
            </Link>
          </div>

        </div>
      </div>

      {/* Right side: Mockup illustration (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-[#f8fafc] flex-col justify-center items-center p-12 xl:p-16 border-l border-slate-150 overflow-hidden relative">
        <div className="max-w-xl w-full text-center space-y-6 z-10 flex flex-col items-center">
          {/* Header titles */}
          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-md">
            The simplest way to manage your workspace.
          </h2>
          <p className="text-sm xl:text-base text-slate-500 max-w-sm">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint velit officia consequat duis.
          </p>

          {/* CSS-rendered live mockup card (mimicking the dashboard in user screenshot) */}
          <div className="w-full mt-4 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left text-xs font-sans text-slate-700 transform scale-[0.93] xl:scale-100 origin-center transition-transform">
            {/* Top Mockup Header Bar */}
            <div className="bg-white border-b border-slate-100 px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {/* Mini Isomorphic Logo */}
                <div className="flex gap-1 items-center">
                  <div className="w-2.5 h-5 rounded-full bg-gradient-to-b from-[#3872fa] to-[#4f46e5] rotate-[25deg]"></div>
                  <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] -translate-y-0.5"></div>
                </div>
                <span className="font-bold text-slate-900 text-xs">isomorphic</span>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
                <span className="text-[#3872fa] font-bold">Dashboard</span>
                <span>Products</span>
                <span>E-Commerce</span>
                <span>Smart Board</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-100"></div>
                <div className="w-5 h-5 rounded-full bg-slate-200"></div>
              </div>
            </div>

            {/* Mockup Dashboard Body */}
            <div className="p-4 space-y-4 bg-slate-50/50">
              {/* Sales Overview Title block */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-[#0f172a] text-sm">Sales Overview</h3>
                  <span className="text-[10px] text-slate-400">View current sales summary and activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-500 shadow-sm cursor-default flex items-center">
                    Jan 23, 2023 - Feb 23, 2023
                  </span>
                  <span className="text-[10px] px-2.5 py-1 bg-[#3872fa] text-white rounded-md font-bold shadow-sm cursor-default">
                    Filter
                  </span>
                </div>
              </div>

              {/* Grid of Earnings, Referral, Purchases */}
              <div className="grid grid-cols-3 gap-3">
                {/* Card 1: Total Earnings */}
                <div className="bg-white border-l-4 border-l-[#7c3aed] border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Earnings</span>
                  <span className="text-lg font-black text-slate-900 block">$12,402</span>
                  {/* Wave line placeholder */}
                  <svg className="w-full h-8 text-[#7c3aed]/40" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,25 Q15,5 30,20 T60,10 T90,22 L100,20" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </svg>
                  <span className="text-[9px] text-[#22c55e] font-extrabold block">+32.40% <span className="text-slate-400 font-medium">Increased last month</span></span>
                </div>

                {/* Card 2: Referral Sales */}
                <div className="bg-white border-l-4 border-l-[#3872fa] border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Referral Sales</span>
                  <span className="text-lg font-black text-slate-900 block">$3,302</span>
                  {/* Wave line placeholder */}
                  <svg className="w-full h-8 text-[#3872fa]/40" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,15 Q20,25 40,10 T80,22 T100,5" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </svg>
                  <span className="text-[9px] text-[#22c55e] font-extrabold block">+18.06% <span className="text-slate-400 font-medium">Increased last month</span></span>
                </div>

                {/* Card 3: Purchases */}
                <div className="bg-white border-l-4 border-l-[#ef4444] border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchases</span>
                  <span className="text-lg font-black text-slate-900 block">$9,200</span>
                  {/* Wave line placeholder */}
                  <svg className="w-full h-8 text-[#ef4444]/40" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0,5 Q20,20 40,8 T80,25 T100,15" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  </svg>
                  <span className="text-[9px] text-[#ef4444] font-extrabold block">-4.43% <span className="text-slate-400 font-medium">Decreased last month</span></span>
                </div>
              </div>

              {/* Lower Section mockup: Chart & Table */}
              <div className="grid grid-cols-3 gap-3">
                {/* Orders Chart Block */}
                <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-[10px]">Monthly Revenue</span>
                    <div className="flex gap-1.5 text-[8px] font-bold">
                      <span className="text-[#3872fa] flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#3872fa] inline-block"></span>New Orders</span>
                      <span className="text-[#7c3aed] flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] inline-block"></span>Shipped</span>
                    </div>
                  </div>
                  {/* CSS graph bars */}
                  <div className="flex items-end justify-between h-20 pt-4 px-2">
                    <div className="w-3 bg-[#3872fa]/20 rounded-t h-[40%]"></div>
                    <div className="w-3 bg-[#3872fa]/40 rounded-t h-[65%]"></div>
                    <div className="w-3 bg-[#3872fa]/60 rounded-t h-[50%]"></div>
                    <div className="w-3 bg-[#3872fa] rounded-t h-[80%]"></div>
                    <div className="w-3 bg-[#7c3aed]/40 rounded-t h-[55%]"></div>
                    <div className="w-3 bg-[#7c3aed]/80 rounded-t h-[90%]"></div>
                    <div className="w-3 bg-[#3872fa] rounded-t h-[75%]"></div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2">
                  <span className="font-bold text-slate-800 text-[10px] block">Activity Feed</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#3872fa]/10 flex items-center justify-center text-[7px] font-extrabold text-[#3872fa]">JW</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold text-slate-800 truncate leading-none">James Warren</p>
                        <span className="text-[7px] text-slate-400 block mt-0.5">Purchased Membership</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#7c3aed]/10 flex items-center justify-center text-[7px] font-extrabold text-[#7c3aed]">AS</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold text-slate-800 truncate leading-none">Alice Smith</p>
                        <span className="text-[7px] text-slate-400 block mt-0.5">Checked In</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Decorative blur elements for right side background */}
        <div className="absolute top-1/4 -right-16 w-80 h-80 bg-blue-400/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-16 w-80 h-80 bg-purple-400/10 rounded-full blur-[80px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default LoginSignup;
