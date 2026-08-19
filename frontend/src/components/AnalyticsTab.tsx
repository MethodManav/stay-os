import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Percent, 
  CheckCircle,
  Eye,
  Bot
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { activeTenant } = useApp();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';

  // Analytics datasets depending on timeframe
  const data = {
    '7d': {
      revenue: [18000, 24000, 22000, 31000, 29000, 48000, 42000],
      occupancy: [65, 70, 68, 75, 72, 85, 78],
      visitors: [120, 150, 140, 190, 175, 230, 210],
      conversion: [2.5, 3.1, 2.8, 3.4, 3.0, 4.2, 3.8]
    },
    '30d': {
      revenue: [90000, 110000, 95000, 130000, 125000, 160000, 185000],
      occupancy: [68, 72, 70, 74, 76, 78, 80],
      visitors: [620, 750, 680, 890, 810, 980, 1120],
      conversion: [2.8, 3.0, 2.9, 3.2, 3.1, 3.5, 3.7]
    },
    '90d': {
      revenue: [280000, 340000, 310000, 420000, 390000, 520000, 480000],
      occupancy: [62, 69, 71, 75, 73, 79, 78],
      visitors: [1800, 2100, 1950, 2600, 2400, 3100, 2900],
      conversion: [2.4, 2.8, 2.7, 3.1, 3.0, 3.4, 3.3]
    },
    '1y': {
      revenue: [1200000, 1450000, 1300000, 1750000, 1600000, 2100000, 1950000],
      occupancy: [58, 64, 66, 71, 68, 76, 74],
      visitors: [7200, 8500, 7900, 9800, 9100, 11500, 10800],
      conversion: [2.2, 2.5, 2.4, 2.8, 2.7, 3.2, 3.0]
    }
  };

  const activeData = data[timeframe];
  
  // Custom Labels
  const labels = {
    '7d': ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    '30d': ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7"],
    '90d': ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    '1y': ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"]
  };
  const activeLabels = labels[timeframe];

  // Helper to draw Area Chart points
  const drawAreaPoints = (dataset: number[]) => {
    const width = 500;
    const height = 150;
    const maxVal = Math.max(...dataset) * 1.15;
    const points = dataset.map((val, idx) => {
      const x = (idx / (dataset.length - 1)) * (width - 40) + 20;
      const y = height - (val / maxVal) * (height - 30) - 15;
      return `${x},${y}`;
    }).join(' ');
    return points;
  };

  const drawAreaFill = (dataset: number[]) => {
    const height = 150;
    const points = drawAreaPoints(dataset);
    const firstPoint = points.split(' ')[0];
    const lastPoint = points.split(' ').pop();
    const firstX = firstPoint.split(',')[0];
    const lastX = lastPoint?.split(',')[0];
    return `${firstPoint} ${points} ${lastX},${height - 10} ${firstX},${height - 10}`;
  };

  return (
    <div className="space-y-8">
      
      {/* Header and timeframe control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-outfit">SaaS Analytics Panel</h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Track hotel traffic, conversions, and revenue channels</p>
        </div>

        <div className="flex border border-border-subtle rounded-xl p-0.5 bg-[#f1f5f9]">
          {(['7d', '30d', '90d', '1y'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                timeframe === tf ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === '90d' ? '3 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Booking Revenue', val: `${currencySymbol}${activeData.revenue.reduce((a, b) => a + b, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Average Occupancy', val: `${Math.round(activeData.occupancy.reduce((a, b) => a + b, 0) / activeData.occupancy.length)}%`, icon: BarChart, color: 'text-blue-700 bg-blue-50' },
          { label: 'Website Visitors', val: activeData.visitors.reduce((a, b) => a + b, 0).toLocaleString(), icon: Eye, color: 'text-purple-700 bg-purple-50' },
          { label: 'Booking Conversion', val: `${(activeData.conversion.reduce((a, b) => a + b, 0) / activeData.conversion.length).toFixed(1)}%`, icon: Percent, color: 'text-orange-700 bg-orange-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-border-subtle rounded-2xl p-5 shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{m.label}</span>
              <h3 className="text-xl font-extrabold text-text-primary font-outfit">{m.val}</h3>
            </div>
            <span className={`p-2 rounded-xl ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </span>
          </div>
        ))}
      </div>

      {/* SVG Charts Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Volume curved graph */}
        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Revenue Channels</h3>
            <span className="text-[10px] text-text-secondary">Direct incoming settlement totals</span>
          </div>

          <div className="w-full h-44 bg-bg-page border border-dashed border-border-subtle rounded-xl relative flex items-end pt-2">
            <svg viewBox="0 0 500 150" className="w-full h-full text-brand-primary" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="var(--color-border-subtle)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="var(--color-border-subtle)" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="var(--color-border-subtle)" strokeWidth="0.5" strokeDasharray="3" />

              <polygon points={drawAreaFill(activeData.revenue)} fill="url(#gradient-rev)" />
              <polyline fill="none" stroke="var(--color-brand-primary)" strokeWidth="2.5" points={drawAreaPoints(activeData.revenue)} />

              {activeData.revenue.map((val, i) => {
                const width = 500;
                const height = 150;
                const maxVal = Math.max(...activeData.revenue) * 1.15;
                const x = (i / (activeData.revenue.length - 1)) * (width - 40) + 20;
                const y = height - (val / maxVal) * (height - 30) - 15;
                return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--color-brand-primary)" stroke="white" strokeWidth="1" />;
              })}
            </svg>
            
            <div className="absolute bottom-1.5 left-2 right-2 flex justify-between px-3 text-[11px] text-text-secondary font-bold uppercase tracking-wider">
              {activeLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
            </div>
          </div>
        </div>

        {/* Occupancy bar chart */}
        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Occupancy Levels</h3>
            <span className="text-[10px] text-text-secondary">Average occupancy percentages</span>
          </div>

          <div className="w-full h-44 bg-bg-page border border-dashed border-border-subtle rounded-xl relative flex items-end justify-between px-6 pt-2 pb-6">
            {activeData.occupancy.map((occ, idx) => {
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">{occ}%</span>
                  <div 
                    className="w-8 bg-brand-primary/85 hover:bg-brand-primary rounded-t-md transition-all duration-500" 
                    style={{ height: `${occ * 0.9}%` }}
                  />
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{activeLabels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversions Dual overlays */}
        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Traffic & Lead Conversions</h3>
            <span className="text-[10px] text-text-secondary">Website clicks compared to checkout rates</span>
          </div>

          <div className="w-full h-44 bg-bg-page border border-dashed border-border-subtle rounded-xl relative flex items-end pt-2">
            <svg viewBox="0 0 500 150" className="w-full h-full text-blue-600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-visitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={drawAreaFill(activeData.visitors)} fill="url(#gradient-visitors)" />
              <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={drawAreaPoints(activeData.visitors)} />
              
              {/* Overlay secondary conversion line chart */}
              <polyline fill="none" stroke="#ea580c" strokeWidth="2.5" strokeDasharray="3" points={drawAreaPoints(activeData.conversion.map(c => c * 40))} />
            </svg>
            <div className="absolute bottom-1.5 left-2 right-2 flex justify-between px-3 text-[11px] text-text-secondary font-bold uppercase tracking-wider">
              {activeLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
            </div>
          </div>
          
          <div className="flex gap-4 text-[10px] font-bold text-text-secondary justify-center pt-2">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-600" /> Visitors Count</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-600" /> Conversion Rate (%)</span>
          </div>
        </div>

        {/* AI receptionist stats */}
        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="border-b border-border-subtle pb-3">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">AI Receptionist Efficiency</h3>
            <span className="text-[10px] text-text-secondary">AI chatbot booking ratios</span>
          </div>

          <div className="space-y-4 font-semibold text-xs text-text-primary">
            <div className="p-3.5 bg-bg-page border border-border-subtle rounded-xl flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-700">
                <Bot className="w-4 h-4 text-brand-primary" />
                Conversations Handled
              </span>
              <span className="font-extrabold text-sm">2,482</span>
            </div>
            <div className="p-3.5 bg-bg-page border border-border-subtle rounded-xl flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4 text-brand-primary" />
                Hot Leads captured
              </span>
              <span className="font-extrabold text-sm">822</span>
            </div>
            <div className="p-3.5 bg-bg-page border border-border-subtle rounded-xl flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-brand-primary" />
                AI Direct Bookings
              </span>
              <span className="font-extrabold text-sm">244</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default AnalyticsTab;
