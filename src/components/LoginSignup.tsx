import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { setOnboardingCompleted, saveHotelConfig, getHotelConfig } from '../mockData';

export const LoginSignup: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('owner@stayosgrand.com');
  const [password, setPassword] = useState('password123');
  const [hotelName, setHotelName] = useState('StayOS Grand Hotel');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !hotelName)) {
      setError('all fields are required.');
      return;
    }
    
    setError('');
    
    if (isLogin) {
      navigate('/dashboard/inbox');
    } else {
      setOnboardingCompleted(false);
      const currentConfig = getHotelConfig();
      saveHotelConfig({
        ...currentConfig,
        name: hotelName
      });
      navigate('/onboarding');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-white">
      
      {/* Left panel - Cream Background Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 bg-[#f4f3ed] min-h-screen relative py-16">
        
        {/* Top Logo */}
        <div className="absolute top-8 left-6 sm:left-12 md:left-20 lg:left-24 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#1b4332] text-white flex items-center justify-center font-bold text-base shadow-sm">
            S
          </div>
          <span className="text-xl font-bold text-[#1a1a1e] tracking-tight">StayOS</span>
        </div>

        {/* Form Container */}
        <div className="max-w-[360px] mx-auto w-full space-y-6">
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-bold text-[#1a1a1e] tracking-tight">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {isLogin ? 'Welcome back! Please enter your details to continue' : 'Create your concierge SaaS platform account'}
            </p>
          </div>

          {/* Role Selectors */}
          <div className="flex gap-5 justify-center sm:justify-start pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                defaultChecked 
                className="w-4 h-4 accent-[#1b4332] cursor-pointer" 
              />
              <span>As a Hotel Owner</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
              <input 
                type="radio" 
                name="role" 
                className="w-4 h-4 accent-[#1b4332] cursor-pointer" 
              />
              <span>As a Hotel Staff</span>
            </label>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.86 3C6.18 7.56 8.84 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.41-4.92 3.41-8.55z"/>
                <path fill="#FBBC05" d="M5.25 10.56c-.25-.76-.39-1.57-.39-2.4 0-.83.14-1.64.39-2.4l-3.86-3C.5 4.37 0 6.13 0 8.01s.5 3.64 1.39 5.25l3.86-3z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-4.27 1.09-3.16 0-5.82-2.52-6.75-5.52l-3.86 3C3.37 20.33 7.35 23 12 23z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.09.08 2.21-.57 2.94-1.39z"/>
              </svg>
              <span>Sign in with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Orchid Resort"
                  className="w-full px-5 py-2.5 bg-white border border-gray-200 focus:border-[#1b4332] rounded-full text-sm text-gray-800 focus:outline-none placeholder:text-gray-450 font-medium"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-450" />
                <input
                  type="email"
                  placeholder="hello@delisas.com"
                  className="w-full pl-11 pr-5 py-2.5 bg-white border border-gray-200 focus:border-[#1b4332] rounded-full text-sm text-gray-800 focus:outline-none placeholder:text-gray-400 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Password *
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-bold text-[#1b4332] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-450" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-11 py-2.5 bg-white border border-gray-200 focus:border-[#1b4332] rounded-full text-sm text-gray-800 focus:outline-none placeholder:text-gray-400 font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center font-bold">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1b4332] hover:bg-[#143324] text-white text-xs font-bold rounded-full transition-colors cursor-pointer uppercase tracking-wider shadow-sm mt-3"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Switch screens */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500 font-medium">
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <button
                type="button"
                className="text-[#1b4332] font-bold hover:underline cursor-pointer"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>

      </div>

      {/* Right panel - White Testimonial Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-white relative min-h-screen border-l border-gray-100 overflow-hidden select-none">
        
        {/* Testimonial Quote */}
        <div className="max-w-[460px] mx-auto mt-24 space-y-6 relative">
          {/* Large orange opening quote mark */}
          <span className="text-7xl text-[#f97316]/15 font-serif absolute -top-8 -left-6 font-bold select-none">“</span>
          
          <p className="text-lg font-medium text-gray-700 leading-relaxed italic relative z-10">
            Seamless booking experience! The app makes finding and reserving rooms so easy. I loved the instant confirmation and personalized recommendations. Definitely my go-to for all future stays.
          </p>
          
          <div className="flex justify-end relative">
            {/* Large orange closing quote mark */}
            <span className="text-7xl text-[#f97316]/15 font-serif absolute -bottom-10 -right-4 font-bold select-none">”</span>
          </div>

          <div className="flex items-center gap-3.5 pt-4">
            <div className="w-10 h-10 rounded-full bg-[#f4f3ed] flex items-center justify-center font-bold text-[#1b4332] text-sm shadow-inner">
              MB
            </div>
            <div>
              <span className="block text-sm font-bold text-gray-950">Manav Behera</span>
              <span className="block text-xs text-gray-400">Gujarat</span>
            </div>
          </div>
        </div>

        {/* Skyscrapers vector outline graphic at the bottom */}
        <svg 
          className="w-[110%] h-auto max-h-[320px] mt-auto absolute bottom-0 right-[-5%] left-[-5%] translate-y-2 opacity-95" 
          viewBox="0 0 700 300" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background building outlines (lighter lines, colored fills) */}
          <path d="M450 150 L450 300 M550 110 L550 300 M450 150 L500 150 L500 300" stroke="#b2c2d4" strokeWidth="1.5" />
          <rect x="490" y="100" width="80" height="200" fill="#e3f2fd" opacity="0.4" stroke="#90caf9" strokeWidth="1" />
          <rect x="180" y="140" width="70" height="160" fill="#fce4ec" opacity="0.5" stroke="#f48fb1" strokeWidth="1" />
          
          {/* Skyscraper 1 (Far Left, Angled windows) */}
          <path d="M40 300 L40 180 L110 130 L110 300" stroke="#334e40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 185 L100 150 M50 205 L100 170 M50 225 L100 190 M50 245 L100 210 M50 265 L100 230" stroke="#4a6f5a" strokeWidth="1.5" />
          
          {/* Skyscraper 2 (Center left tall) */}
          <path d="M120 300 L120 100 L180 100 L180 300" stroke="#334e40" strokeWidth="2" strokeLinecap="round" />
          <line x1="135" y1="120" x2="135" y2="280" stroke="#334e40" strokeWidth="1.5" strokeDasharray="3 6" />
          <line x1="150" y1="120" x2="150" y2="280" stroke="#334e40" strokeWidth="1.5" strokeDasharray="3 6" />
          <line x1="165" y1="120" x2="165" y2="280" stroke="#334e40" strokeWidth="1.5" strokeDasharray="3 6" />
          
          {/* Skyscraper 3 (Thin center tower) */}
          <path d="M200 300 L200 50 L240 50 L240 300" stroke="#334e40" strokeWidth="2" strokeLinejoin="round" />
          <path d="M210 50 L210 40 L230 40 L230 50" stroke="#334e40" strokeWidth="1.5" />
          <line x1="220" y1="40" x2="220" y2="10" stroke="#334e40" strokeWidth="1.5" />
          {/* Horizontal windows grids */}
          <rect x="210" y="70" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="70" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="85" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="85" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="100" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="100" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="115" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="115" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="130" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="130" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="145" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="145" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="160" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="160" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="175" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="175" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="210" y="190" width="8" height="6" fill="#1b4332" opacity="0.1" />
          <rect x="222" y="190" width="8" height="6" fill="#1b4332" opacity="0.1" />
          
          {/* Skyscraper 4 (Center Right medium) */}
          <path d="M260 300 L260 120 L340 120 L340 300" stroke="#334e40" strokeWidth="2" />
          <line x1="260" y1="140" x2="340" y2="140" stroke="#334e40" strokeWidth="1" />
          <line x1="260" y1="160" x2="340" y2="160" stroke="#334e40" strokeWidth="1" />
          <line x1="260" y1="180" x2="340" y2="180" stroke="#334e40" strokeWidth="1" />
          <line x1="260" y1="200" x2="340" y2="200" stroke="#334e40" strokeWidth="1" />
          <line x1="260" y1="220" x2="340" y2="220" stroke="#334e40" strokeWidth="1" />
          <line x1="260" y1="240" x2="340" y2="240" stroke="#334e40" strokeWidth="1" />
          <line x1="260" y1="260" x2="340" y2="260" stroke="#334e40" strokeWidth="1" />
          <line x1="280" y1="120" x2="280" y2="300" stroke="#334e40" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="300" y1="120" x2="300" y2="300" stroke="#334e40" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="320" y1="120" x2="320" y2="300" stroke="#334e40" strokeWidth="1" strokeDasharray="2 4" />

          {/* Skyscraper 5 (Right tall skyscraper, vertical layout) */}
          <path d="M360 300 L360 60 L430 60 L430 300" stroke="#334e40" strokeWidth="2" strokeLinecap="round" />
          <line x1="375" y1="80" x2="375" y2="280" stroke="#334e40" strokeWidth="1.5" strokeDasharray="4 8" />
          <line x1="395" y1="80" x2="395" y2="280" stroke="#334e40" strokeWidth="1.5" strokeDasharray="4 8" />
          <line x1="415" y1="80" x2="415" y2="280" stroke="#334e40" strokeWidth="1.5" strokeDasharray="4 8" />
          
          {/* Skyscraper 6 (Extreme Right, rounded detail structure) */}
          <path d="M450 300 L450 110 L520 110 L520 300" stroke="#334e40" strokeWidth="2" />
          <path d="M450 110 C450 80, 520 80, 520 110 Z" fill="#fff9c4" opacity="0.3" stroke="#334e40" strokeWidth="2" />
          <line x1="470" y1="130" x2="470" y2="280" stroke="#334e40" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="485" y1="130" x2="485" y2="280" stroke="#334e40" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="500" y1="130" x2="500" y2="280" stroke="#334e40" strokeWidth="1" strokeDasharray="2 2" />

          {/* Tree 1 outline (Left) */}
          <circle cx="100" cy="275" r="15" fill="#e8f5e9" stroke="#334e40" strokeWidth="2" />
          <path d="M100 290 L100 300" stroke="#334e40" strokeWidth="2" />
          <circle cx="85" cy="280" r="10" fill="#e8f5e9" stroke="#334e40" strokeWidth="2" />
          <circle cx="115" cy="280" r="10" fill="#e8f5e9" stroke="#334e40" strokeWidth="2" />
          
          {/* Tree 2 outline (Right) */}
          <circle cx="490" cy="270" r="18" fill="#e8f5e9" stroke="#334e40" strokeWidth="2" />
          <path d="M490 288 L490 300" stroke="#334e40" strokeWidth="2" />
          <circle cx="515" cy="275" r="12" fill="#e8f5e9" stroke="#334e40" strokeWidth="2" />
          
          {/* Ground baseline */}
          <line x1="10" y1="300" x2="680" y2="300" stroke="#334e40" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

      </div>

    </div>
  );
};
