import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Check, 
  ExternalLink,
  Upload
} from 'lucide-react';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ value, onChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 mt-1">
      {/* Current Preview */}
      {value && (
        <div className="relative group w-full h-24 border border-slate-200 rounded-lg overflow-hidden shadow-xs bg-slate-50">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-0.5 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-bold rounded shadow-sm transition-all cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded shadow-sm transition-all cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-3.5 px-2 border border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragOver 
            ? 'border-emerald-600 bg-emerald-50/20' 
            : 'border-slate-350 hover:border-slate-400 bg-white hover:bg-slate-50/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onSelect}
          accept="image/*"
          className="hidden"
        />
        <Upload className="w-4.5 h-4.5 text-slate-400 mb-1" />
        <span className="text-[11px] font-bold text-slate-600 leading-none">
          {dragOver ? 'Drop image here' : 'Drop image, or click to browse'}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP</span>
      </div>
    </div>
  );
};

export const WebsiteTab: React.FC = () => {
  const { activeTenant, updateWebsiteTheme, updateBranding } = useApp();
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'sections' | 'branding' | 'templates'>('sections');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const website = activeTenant.website || { template: 'luxury', sections: [] };
  const branding = activeTenant.branding || { primaryColor: '#0f766e', secondaryColor: '#0d9488', font: 'sans', buttonStyle: 'rounded-full' };
  const currencySymbol = activeTenant.settings.currency === 'INR' ? '₹' : '$';

  const updateSectionVisibility = (id: string, visible: boolean) => {
    const sections = website.sections.map(s => s.id === id ? { ...s, visible } : s);
    updateWebsiteTheme({ ...website, sections });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...website.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    // Swap
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    updateWebsiteTheme({ ...website, sections: newSections });
  };

  const updateSectionContent = (id: string, key: string, val: string) => {
    const sections = website.sections.map(s => {
      if (s.id === id) {
        return {
          ...s,
          content: { ...s.content, [key]: val }
        };
      }
      return s;
    });
    updateWebsiteTheme({ ...website, sections });
  };

  const templates = [
    { id: 'luxury', name: 'Luxury Hotel', desc: 'Serif fonts and classic elegance.' },
    { id: 'modern', name: 'Modern Resort', desc: 'Geometric layouts and clean details.' },
    { id: 'boutique', name: 'Boutique Hotel', desc: 'Stylish spacing and text alignment.' },
    { id: 'minimal', name: 'Minimal Stay', desc: 'Spacious grids with thin boundaries.' }
  ];

  const colors = [
    { name: 'Forest Green', primary: '#1b4332', secondary: '#40916c' },
    { name: 'Ocean Teal', primary: '#0f766e', secondary: '#0d9488' },
    { name: 'Regal Navy', primary: '#1e3a8a', secondary: '#3b82f6' },
    { name: 'Burgundy Crimson', primary: '#7f1d1d', secondary: '#ef4444' },
    { name: 'Muted Clay', primary: '#7c2d12', secondary: '#f97316' },
    { name: 'Obsidian Jet', primary: '#111827', secondary: '#6b7280' }
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header and view site shortcut */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-outfit">Visual Website Builder</h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Customize your hotel landing website and review previews</p>
        </div>
        
        <a
          href={`/site/${activeTenant.subdomain}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-light text-brand-primary font-bold text-xs hover:bg-brand-primary hover:text-white transition-all shadow-sm"
        >
          <span>Open Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Customize Config Panel */}
        <div className="w-80 bg-white border border-border-subtle rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
          
          {/* Editor Sub-Tabs Switch */}
          <div className="grid grid-cols-3 border-b border-border-subtle p-1 bg-[#f1f5f9]/60 shrink-0">
            {(['sections', 'branding', 'templates'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Configuration Forms Scroll container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Sections Sub-Tab */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                <span className="block text-[11px] uppercase font-bold text-text-secondary tracking-widest border-b border-border-subtle pb-1.5 mb-2">Section Layout Order</span>
                {website.sections.map((sec, idx) => {
                  const isExpanded = expandedSection === sec.id;
                  return (
                    <div key={sec.id} className="border border-border-subtle rounded-xl overflow-hidden bg-bg-page">
                      <div className="p-3.5 flex items-center justify-between gap-2 bg-white">
                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                          className="flex-1 text-left font-bold text-xs text-text-primary hover:text-brand-primary"
                        >
                          {sec.title}
                        </button>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateSectionVisibility(sec.id, !sec.visible)}
                            className="p-1 rounded text-slate-500 hover:bg-[#f1f5f9] hover:text-brand-primary transition-colors"
                          >
                            {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-350" />}
                          </button>
                          <button
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, 'up')}
                            className="p-1 rounded text-slate-500 hover:bg-[#f1f5f9] disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === website.sections.length - 1}
                            onClick={() => moveSection(idx, 'down')}
                            className="p-1 rounded text-slate-500 hover:bg-[#f1f5f9] disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content editor inside expanded section */}
                      {isExpanded && (
                        <div className="p-3.5 border-t border-border-subtle bg-bg-page text-[10px] font-bold text-text-secondary space-y-3">
                          {Object.keys(sec.content).map(contentKey => {
                            const isImageKey = contentKey.toLowerCase().includes('image') || contentKey.toLowerCase().includes('img');
                            return (
                              <div key={contentKey}>
                                <label className="block uppercase tracking-wider mb-1 capitalize">
                                  {contentKey.replace(/([A-Z])/g, ' $1')}
                                </label>
                                {isImageKey ? (
                                  <ImageDropzone
                                    value={sec.content[contentKey]}
                                    onChange={url => updateSectionContent(sec.id, contentKey, url)}
                                  />
                                ) : contentKey === 'text' || contentKey === 'subheadline' || contentKey === 'quote' ? (
                                  <textarea
                                    rows={3}
                                    value={sec.content[contentKey]}
                                    onChange={e => updateSectionContent(sec.id, contentKey, e.target.value)}
                                    className="w-full p-2 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:outline-none"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={sec.content[contentKey]}
                                    onChange={e => updateSectionContent(sec.id, contentKey, e.target.value)}
                                    className="w-full p-2 bg-white border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:outline-none"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Branding Sub-Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-5 text-xs font-semibold text-text-primary">
                
                {/* Accent Palette Picker */}
                <div className="space-y-2">
                  <span className="block text-[11px] uppercase font-bold text-text-secondary">Accent Brand Colors</span>
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map(col => (
                      <button
                        key={col.name}
                        onClick={() => updateBranding({ ...branding, primaryColor: col.primary, secondaryColor: col.secondary })}
                        className={`p-2.5 rounded-xl border text-[10px] font-bold text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          branding.primaryColor === col.primary ? 'border-emerald-600 bg-[#f1f5f9]' : 'border-border-subtle bg-white'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full block border border-border-subtle" style={{ backgroundColor: col.primary }} />
                        <span className="truncate">{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font selection */}
                <div className="space-y-2">
                  <span className="block text-[11px] uppercase font-bold text-text-secondary">Font Typography Family</span>
                  <div className="grid grid-cols-1 gap-2">
                    {(['outfit', 'sans', 'serif'] as const).map(fontVal => (
                      <button
                        key={fontVal}
                        onClick={() => updateBranding({ ...branding, font: fontVal })}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                          branding.font === fontVal ? 'bg-[#f1f5f9] border-emerald-600 font-bold' : 'bg-white border-border-subtle'
                        }`}
                      >
                        <span className={`text-xs ${fontVal === 'serif' ? 'font-serif' : fontVal === 'outfit' ? 'font-outfit' : 'font-sans'}`}>
                          {fontVal === 'serif' ? 'Playfair style' : fontVal === 'outfit' ? 'Outfit' : 'Plus Jakarta Sans'}
                        </span>
                        {branding.font === fontVal && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Style selector */}
                <div className="space-y-2">
                  <span className="block text-[11px] uppercase font-bold text-text-secondary">Button Border Style</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['rounded-full', 'rounded-md', 'square'] as const).map(btnVal => (
                      <button
                        key={btnVal}
                        onClick={() => updateBranding({ ...branding, buttonStyle: btnVal })}
                        className={`py-2 border text-[10px] font-bold text-center transition-all cursor-pointer ${
                          branding.buttonStyle === btnVal ? 'bg-brand-primary text-white border-transparent' : 'bg-white border-border-subtle text-slate-700'
                        } ${
                          btnVal === 'rounded-full' ? 'rounded-full' : btnVal === 'rounded-md' ? 'rounded-md' : 'rounded-none'
                        }`}
                      >
                        {btnVal.replace('rounded-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Templates Sub-Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <span className="block text-[11px] uppercase font-bold text-text-secondary tracking-widest border-b border-border-subtle pb-1.5 mb-2">Web Template Selection</span>
                {templates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => updateWebsiteTheme({ ...website, template: tmpl.id as any })}
                    className={`w-full p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      website.template === tmpl.id ? 'bg-brand-light border-brand-primary' : 'bg-white border-border-subtle hover:border-slate-350'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold text-xs text-text-primary">{tmpl.name}</span>
                      {website.template === tmpl.id && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                    </div>
                    <span className="text-[10px] text-text-secondary mt-2.5 leading-relaxed font-semibold">{tmpl.desc}</span>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Live preview frame */}
        <div className="flex-1 flex flex-col border border-border-subtle rounded-2xl overflow-hidden bg-border-subtle/40 shadow-inner">
          
          {/* Preview Controls Bar */}
          <div className="h-14 bg-white border-b border-border-subtle flex justify-between items-center px-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-[10px] font-bold text-text-secondary ml-2 select-none">Preview Canvas: /site/{activeTenant.subdomain}</span>
            </div>
            
            {/* Device screen toggles */}
            <div className="flex border border-border-subtle rounded-lg p-0.5 bg-[#f1f5f9]">
              {(['desktop', 'tablet', 'mobile'] as const).map(device => {
                const Icon = device === 'desktop' ? Laptop : device === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={device}
                    onClick={() => setDeviceFrame(device)}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      deviceFrame === device ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title={`${device} preview`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Display wrapper frame */}
          <div className="flex-1 overflow-auto flex justify-center items-center p-4">
            
            <div 
              className={`h-full border border-border-subtle rounded-xl overflow-hidden shadow-2xl bg-white flex flex-col transition-all duration-300 ${
                deviceFrame === 'desktop' ? 'w-full' :
                deviceFrame === 'tablet' ? 'w-[640px]' :
                'w-[375px]'
              }`}
            >
              
              {/* Header inside website preview container */}
              <div className="bg-white border-b border-slate-100 px-4 py-3 flex justify-between items-center shrink-0 text-xs">
                <span className="font-extrabold text-text-primary tracking-tight">{activeTenant.branding.logo || '🏨'} {activeTenant.name}</span>
                <span className="px-3 py-1 text-[11px] font-extrabold uppercase text-white" style={{ backgroundColor: branding.primaryColor, borderRadius: branding.buttonStyle === 'rounded-full' ? '999px' : branding.buttonStyle === 'rounded-md' ? '4px' : '0px' }}>
                  Book
                </span>
              </div>

              {/* Scrollable mockup page */}
              <div 
                className="flex-1 overflow-y-auto space-y-8 pb-10 text-text-primary"
                style={{ 
                  fontFamily: branding.font === 'serif' ? 'Playfair Display, Georgia, serif' : branding.font === 'outfit' ? 'Outfit, sans-serif' : 'Plus Jakarta Sans, sans-serif'
                }}
              >
                {website.sections.filter(s => s.visible).map(sec => {
                  
                  if (sec.type === 'hero') {
                    return (
                      <div key={sec.id} className="relative h-60 bg-slate-900 text-white flex flex-col justify-center items-center text-center p-4 overflow-hidden">
                        <img src={sec.content.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45" />
                        <div className="relative z-10 space-y-2">
                          <h2 className="text-xl md:text-2xl font-extrabold leading-tight tracking-tight">{sec.content.headline}</h2>
                          <p className="text-[10px] max-w-sm text-slate-200 leading-normal">{sec.content.subheadline}</p>
                          <button className="px-4 py-1.5 font-bold text-[11px] uppercase tracking-wider text-black bg-white inline-block mt-2" style={{ borderRadius: branding.buttonStyle === 'rounded-full' ? '999px' : branding.buttonStyle === 'rounded-md' ? '4px' : '0px' }}>
                            {sec.content.ctaText}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'about') {
                    return (
                      <div key={sec.id} className="px-6 text-center space-y-2 py-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary" style={{ color: branding.primaryColor }}>{sec.title}</h3>
                        <p className="text-[11px] leading-relaxed text-text-secondary max-w-md mx-auto italic">
                          "{sec.content.text}"
                        </p>
                      </div>
                    );
                  }

                  if (sec.type === 'rooms') {
                    return (
                      <div key={sec.id} className="px-6 space-y-4 py-2">
                        <div className="text-center space-y-1">
                          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: branding.primaryColor }}>{sec.title}</h3>
                          <span className="text-[11px] text-text-secondary block">{sec.content.subheading}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {activeTenant.rooms.map(rm => (
                            <div key={rm.id} className="border border-slate-100 rounded-lg overflow-hidden flex bg-white text-xs">
                              <img src={rm.image} alt="" className="w-20 h-20 object-cover shrink-0" />
                              <div className="p-2.5 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-bold text-text-primary leading-snug">{rm.name}</h4>
                                  <span className="text-[11px] text-text-secondary mt-0.5 block">{rm.amenities.slice(0, 3).join(' • ')}</span>
                                </div>
                                <span className="font-extrabold text-[10px]" style={{ color: branding.primaryColor }}>
                                  {currencySymbol}{rm.basePrice.toLocaleString()}/night
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'amenities') {
                    return (
                      <div key={sec.id} className="px-6 py-4 bg-slate-50 border-y border-slate-100 text-center space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: branding.primaryColor }}>{sec.title}</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                          {sec.content.list.split(',').map((am, i) => (
                            <span key={i} className="px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                              {am.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'testimonials') {
                    return (
                      <div key={sec.id} className="px-6 py-4 text-center space-y-2 bg-[#f1f5f9]/30 border-y border-dashed border-border-subtle">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{sec.title}</h3>
                        <p className="text-xs font-medium italic text-slate-700 leading-relaxed max-w-sm mx-auto">
                          "{sec.content.quote}"
                        </p>
                        <span className="block text-[11px] font-bold text-slate-500">- {sec.content.author}</span>
                      </div>
                    );
                  }

                  if (sec.type === 'location') {
                    return (
                      <div key={sec.id} className="px-6 space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: branding.primaryColor }}>{sec.title}</h3>
                        <p className="text-[10px] text-center text-text-secondary">{sec.content.address}</p>
                        <div className="h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center text-[10px] text-slate-450 italic">
                          Map View Simulated Frame
                        </div>
                      </div>
                    );
                  }

                  if (sec.type === 'footer') {
                    return (
                      <div key={sec.id} className="pt-6 border-t border-slate-100 text-center text-[11px] text-text-secondary">
                        {sec.content.copyright}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default WebsiteTab;
