import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  MessageSquareCode, 
  CalendarCheck2, 
  Globe2, 
  Users2, 
  ArrowRight,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

interface SaaSMarketingProps {
  currentTab?: 'home' | 'pricing' | 'features' | 'solutions';
}

export const SaaSMarketing: React.FC<SaaSMarketingProps> = ({ currentTab = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-[#3872fa] selection:text-white">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex gap-1 items-center">
              {/* Short Blue Capsule */}
              <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#3872fa] to-[#4f46e5] rotate-[25deg]"></div>
              {/* Long Purple Capsule */}
              <div className="w-2.5 h-8 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] -translate-y-0.5"></div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">stay<span className="text-[#3872fa]">os</span></span>
              <span className="block text-[10px] text-[#3872fa] font-bold uppercase tracking-widest mt-0.5 leading-none">hotel os</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/features" 
              className={`text-sm font-semibold transition-all hover:text-[#3872fa] ${currentTab === 'features' ? 'text-[#3872fa] font-bold' : 'text-slate-600'}`}
            >
              Features
            </Link>
            <Link 
              to="/solutions/hotels" 
              className={`text-sm font-semibold transition-all hover:text-[#3872fa] ${currentTab === 'solutions' ? 'text-[#3872fa] font-bold' : 'text-slate-600'}`}
            >
              Hotel Solutions
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-semibold transition-all hover:text-[#3872fa] ${currentTab === 'pricing' ? 'text-[#3872fa] font-bold' : 'text-slate-600'}`}
            >
              Pricing
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/admin" 
              className="text-sm font-bold text-slate-500 hover:text-[#3872fa] px-3 py-2 transition-colors"
            >
              SaaS Admin
            </Link>
            <Link 
              to="/login" 
              className="text-sm font-bold text-slate-700 hover:text-[#3872fa] px-4 py-2 transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="relative group overflow-hidden bg-[#3872fa] hover:bg-[#1e5ade] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              Create Your Hotel
            </Link>
          </div>

          {/* Mobile Menu Btn */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-750 hover:text-[#3872fa] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-white border-t border-slate-200 px-6 py-8 flex flex-col gap-6 md:hidden shadow-lg">
          <Link 
            to="/features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-bold text-slate-700 hover:text-[#3872fa]"
          >
            Features
          </Link>
          <Link 
            to="/solutions/hotels" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-bold text-slate-700 hover:text-[#3872fa]"
          >
            Solutions
          </Link>
          <Link 
            to="/pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-bold text-slate-700 hover:text-[#3872fa]"
          >
            Pricing
          </Link>
          <hr className="border-slate-100" />
          <div className="flex flex-col gap-4">
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl border border-indigo-200 text-indigo-650 bg-indigo-50/30 font-bold"
            >
              SaaS Admin Portal
            </Link>
            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl border border-slate-200 text-slate-700 font-bold"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-[#3872fa] text-white font-bold"
            >
              Create Your Hotel
            </Link>
          </div>
        </div>
      )}

      {/* Homepage */}
      {currentTab === 'home' && (
        <>
          {/* Hero Section */}
          <section className="relative pt-20 pb-28 px-6 text-center overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#3872fa] text-xs font-bold uppercase tracking-wider mx-auto">
                <Sparkles className="w-3.5 h-3.5" />
                Next Generation Hospitality Platform
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-outfit">
                Everything Your Hotel Needs to <span className="bg-gradient-to-r from-[#3872fa] to-[#6366f1] bg-clip-text text-transparent">Go Direct.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Launch your hotel website, manage bookings, understand your guests, and automate conversations — all from one premium platform.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 rounded-full bg-[#3872fa] hover:bg-[#1e5ade] text-white font-bold text-base shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2 group"
                >
                  Create Your Hotel
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/features"
                  className="px-8 py-4 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-base hover:bg-slate-200 active:scale-98 transition-all"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            {/* Premium Mockup Display */}
            <div className="max-w-5xl mx-auto mt-20 relative rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-white group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent z-10 pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" 
                alt="StayOS Premium Interface Dashboard View" 
                className="w-full h-auto object-cover opacity-90 group-hover:scale-[1.01] transition-transform duration-[4000ms]"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-[#3872fa] shadow-xl text-2xl font-bold">
                  ⚡
                </div>
                <span className="text-xs font-bold tracking-widest text-[#3872fa] uppercase bg-white/95 px-3 py-1 rounded-full shadow-sm">
                  StayOS Operating System
                </span>
              </div>
            </div>
          </section>

          {/* Modular Connectivity Concept */}
          <section className="py-24 px-6 border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-slate-900">The Connected OS Core</h2>
                <p className="text-slate-500 max-w-lg mx-auto text-sm">
                  Stop duct-taping custom forms, CRMs, and email platforms together. StayOS connects your guest journey out of the box.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-[#3872fa]/40 group transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3872fa] flex items-center justify-center mb-6 group-hover:bg-[#3872fa] group-hover:text-white transition-colors duration-300">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Hotel Website</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Set up your hotel profile and receive a stunning, optimized website. Room inventory and rates update dynamically based on the CRM state.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-[#3872fa]/40 group transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3872fa] flex items-center justify-center mb-6 group-hover:bg-[#3872fa] group-hover:text-white transition-colors duration-300">
                    <MessageSquareCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">AI Floating Receptionist</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Your website features a floating receptionist connected directly to availability. Answer policy queries and secure bookings right in the chat.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-[#3872fa]/40 group transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3872fa] flex items-center justify-center mb-6 group-hover:bg-[#3872fa] group-hover:text-white transition-colors duration-300">
                    <Users2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Connected Hotel CRM</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Bookings instantly record guest metrics, preferences, tags, and lifetime billing statistics, making guest relationships simple.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Features Tab */}
      {currentTab === 'features' && (
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-outfit">SaaS Platform Capabilities</h1>
            <p className="text-slate-500 max-w-xl mx-auto font-medium text-base">
              Everything required to operate independent hotel digital presence without maintaining complex codebase setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#3872fa] text-xs font-bold">
                <CalendarCheck2 className="w-3.5 h-3.5" /> Bookings
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Interactive Reservation Calendar</h2>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                A complete room grid visualizing dates and guest allocations. Filter reservations, update status (Pending, Confirmed, Checked-in, Checked-out), or schedule manual bookings seamlessly.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3872fa]" /> Easy drag-and-drop availability mapping</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3872fa]" /> Fully supports check-in/out transitions</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3872fa]" /> Multi-room type listings</li>
              </ul>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white p-2">
              <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80" alt="Calendar grid mockup" className="w-full h-auto rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#3872fa] text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" /> Site Builder
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Visual Drag & Drop Customizer</h2>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                Edit branding assets, toggle section visibilities, modify headers, and reorder sections (hero, testimonials, gallery, maps) with instantaneous Desktop, Tablet, and Mobile preview structures.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3872fa]" /> 1-Click Accent Color & Typography shifts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3872fa]" /> Linked direct to CRM prices</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3872fa]" /> Responsive layouts built in</li>
              </ul>
            </div>
            <div className="md:order-1 rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white p-2">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" alt="Site Editor Mockup" className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </section>
      )}

      {/* Solutions Tab */}
      {currentTab === 'solutions' && (
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl font-extrabold font-outfit text-slate-900">Bespoke Operating Model for Independent Hotels</h1>
            <p className="text-slate-500 text-base leading-relaxed font-medium">
              Tailored for resorts, boutique hotels, and homestays. Launch your digital business ecosystem in minutes without writing a single line of code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Boutique & Heritage Hotels</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Showcase unique charm with high-resolution image sections, customizable layout builder templates, and instant booking processes.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Luxury & Beach Resorts</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Connect luxury amenities, private activity schedules, and allow guests to query check-in specifications directly via the AI Concierge widget.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Independent Stays & B&Bs</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Keep operations lean. Manage all customer preferences, tags, cancellations, and billing history from a single browser page.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Tab */}
      {currentTab === 'pricing' && (
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-outfit">SaaS Subscription Tiers</h1>
            <p className="text-slate-500 max-w-md mx-auto text-sm font-medium">
              Simple, transparent prices. Start building your hotel presence completely free for 14 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Tier 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#3872fa] uppercase tracking-widest block mb-2">Starter</span>
                <div className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-extrabold">₹1,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed font-medium">
                  Best for homestays and single-property bed & breakfasts.
                </p>
                <hr className="border-slate-100 my-6" />
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Up to 15 Rooms</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Automated Website Builder</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Unified Calendar & CRM</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Mock Payments Mode</li>
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-[#3872fa] font-bold hover:bg-slate-50 text-xs mt-6 block transition-all"
              >
                Start Trial
              </Link>
            </div>

            {/* Tier 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border-2 border-[#3872fa] shadow-xl shadow-blue-100/30 space-y-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-4 right-4 bg-[#3872fa] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Popular
              </div>
              <div>
                <span className="text-xs font-bold text-[#3872fa] uppercase tracking-widest block mb-2">Growth</span>
                <div className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-extrabold">₹3,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed font-medium">
                  Perfect for independent boutique hotels and mid-sized beach resorts.
                </p>
                <hr className="border-slate-100 my-6" />
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Unlimited Room Listings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Live AI receptionist chatbot</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Custom Domain Integration</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> 3 Team Admin accounts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Full analytics & reports</li>
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="w-full text-center py-2.5 rounded-lg bg-[#3872fa] hover:bg-[#1e5ade] text-white font-bold text-xs mt-6 block transition-all shadow-sm hover:shadow"
              >
                Create Hotel
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#3872fa] uppercase tracking-widest block mb-2">Enterprise</span>
                <div className="flex items-baseline gap-1 text-slate-900">
                  <span className="text-4xl font-extrabold">₹7,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed font-medium">
                  Customized scaling for luxury resorts with multiple properties.
                </p>
                <hr className="border-slate-100 my-6" />
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Multi-Property switchboards</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Premium WhatsApp automation</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Custom integrations / API Access</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#3872fa]" /> Dedicated Account Managers</li>
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-[#3872fa] font-bold hover:bg-slate-50 text-xs mt-6 block transition-all"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1 items-center">
              <div className="w-2.5 h-5 rounded-full bg-gradient-to-b from-[#3872fa] to-[#4f46e5] rotate-[25deg]"></div>
              <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#7c3aed] rotate-[25deg] -translate-y-0.5"></div>
            </div>
            <span className="text-base font-bold text-slate-900">stayos</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            © 2026 StayOS Platform Inc. Built for premium direct hospitality.
          </span>
        </div>
      </footer>
    </div>
  );
};
