import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  ShieldAlert, 
  Cpu, 
  Upload, 
  X, 
  Check, 
  Image as ImageIcon 
} from 'lucide-react';
import { 
  getBrandLogo, 
  setBrandLogo, 
  removeBrandLogo, 
  validateLogoFile, 
  BrandingType 
} from '../utils/branding';

interface AppStates {
  customerAppMaintenance: boolean;
  riderAppMaintenance: boolean;
  restaurantAppMaintenance: boolean;
}

export const AppSettings: React.FC = () => {
  const [appStates, setAppStates] = useState<AppStates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  // Branding states
  const [brandingLogos, setBrandingLogos] = useState<Record<BrandingType, string | null>>({
    horizontal: null,
    square: null,
    icon: null,
    sidebar: null,
    login: null,
    favicon: null
  });
  const [brandingError, setBrandingError] = useState<string | null>(null);
  const [brandingSuccess, setBrandingSuccess] = useState<string | null>(null);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/settings/maintenance');
      setAppStates(data);
    } catch {
      setAppStates({
        customerAppMaintenance: false,
        riderAppMaintenance: false,
        restaurantAppMaintenance: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
    // Load local storage branding values
    setBrandingLogos({
      horizontal: getBrandLogo('horizontal'),
      square: getBrandLogo('square'),
      icon: getBrandLogo('icon'),
      sidebar: getBrandLogo('sidebar'),
      login: getBrandLogo('login'),
      favicon: getBrandLogo('favicon')
    });
  }, []);

  const handleToggleState = (key: keyof AppStates) => {
    if (!appStates) return;
    setAppStates({ ...appStates, [key]: !appStates[key] });
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appStates) return;
    try {
      setMaintenanceError(null);
      await api.post('/api/admin/settings/maintenance', appStates);
      setSuccessMsg('System maintenance configurations updated on backend!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setMaintenanceError('Backend endpoint not implemented yet.');
      } else {
        setMaintenanceError('Unable to save changes to backend.');
      }
      setTimeout(() => setMaintenanceError(null), 3500);
    }
  };

  const handleLogoUpload = (type: BrandingType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateLogoFile(file);
    if (error) {
      setBrandingError(error);
      setTimeout(() => setBrandingError(null), 5000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBrandingLogos(prev => ({ ...prev, [type]: dataUrl }));
      setBrandingSuccess(`Selected new ${type} logo.`);
      setTimeout(() => setBrandingSuccess(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save all logos to localStorage
      Object.entries(brandingLogos).forEach(([key, val]) => {
        if (val) {
          setBrandLogo(key as BrandingType, val);
        } else {
          removeBrandLogo(key as BrandingType);
        }
      });
      // TODO: Replace localStorage branding with GET/POST /api/admin/settings/branding once backend storage is added.
      setBrandingSuccess('Branding settings saved locally.');
      setTimeout(() => setBrandingSuccess(null), 3500);
    } catch (err) {
      setBrandingError('Failed to save custom corporate branding.');
      setTimeout(() => setBrandingError(null), 5000);
    }
  };

  const handleClearLogo = (type: BrandingType) => {
    setBrandingLogos(prev => ({ ...prev, [type]: null }));
    setBrandingSuccess(`Cleared local ${type} logo path. Click Save to persist.`);
    setTimeout(() => setBrandingSuccess(null), 3000);
  };

  if (loading || !appStates) {
    return (
      <div className="bg-[#061B35] p-8 rounded-xl animate-pulse h-64 border border-[#ffffff0c]" />
    );
  }

  const BRANDIND_FIELDS: { type: BrandingType; label: string; description: string }[] = [
    {
      type: 'horizontal',
      label: 'Horizontal Logo',
      description: 'Used across general screens, customer alerts, and dark horizontal panels.'
    },
    {
      type: 'square',
      label: 'Square Logo',
      description: 'Standard square brand display used for company receipts and catalogs.'
    },
    {
      type: 'icon',
      label: 'Icon Logo',
      description: 'Compact square insignia used for header bars, profile icons, and small icons.'
    },
    {
      type: 'sidebar',
      label: 'Dark / Sidebar Logo',
      description: 'High contrast white/negative-tone logo specifically rendered inside dark sidebar rails.'
    },
    {
      type: 'login',
      label: 'Login Panel Logo',
      description: 'Prominent, high-density coloured brand mark displayed on the central authorization window.'
    },
    {
      type: 'favicon',
      label: 'Favicon Icon',
      description: 'Small brand shortcut icon displayed in web explorer tabs.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-xs text-slate-300">
      {/* Page Header */}
      <div className="border-b border-[#ffffff0c] pb-5">
        <h1 className="text-xl font-black text-white tracking-tight flex items-center">
          <Settings className="w-6 h-6 mr-2 text-[#F4B400]" /> App Settings & Branding
        </h1>
        <p className="text-[#AAB6C5] text-xs mt-1">
          Configure emergency shut-offs, schedule platform-wide maintenance locks, and customize corporate brand assets dynamically.
        </p>
      </div>

      {successMsg && (
        <div className="bg-[#F4B400]/10 border border-[#F4B400]/20 text-[#F4B400] p-3.5 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {maintenanceError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {maintenanceError}
        </div>
      )}

      {/* 1. KILLS SWITCHES FORM */}
      <form onSubmit={handleSaveMaintenance} className="bg-[#061B35] rounded-xl border border-[#ffffff0c] p-6 space-y-6 shadow-xl">
        <div className="space-y-4">
          <h2 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#ffffff0c] pb-2 flex items-center">
            <Cpu className="w-4.5 h-4.5 mr-1.5 text-[#F4B400]" /> Application Safety Controls
          </h2>

          <div className="space-y-4 pt-1.5">
            {/* Customer maintenance */}
            <div className="flex items-center justify-between p-4 bg-[#020B18] rounded-xl border border-[#ffffff0c]">
              <div>
                <span className="text-white font-extrabold text-sm block">Customer App Network Link</span>
                <span className="text-xs text-[#AAB6C5] block mt-1">Forces maintenance screen on client-side Android logins.</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleState('customerAppMaintenance')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {appStates.customerAppMaintenance ? (
                    <ToggleRight className="w-9 h-9 text-rose-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-500" />
                  )}
                </button>
                <span className={`text-[10px] font-bold uppercase ${appStates.customerAppMaintenance ? 'text-rose-400 animate-pulse' : 'text-[#AAB6C5]'}`}>
                  {appStates.customerAppMaintenance ? 'LOCKED / OFFLINE' : 'ONLINE'}
                </span>
              </div>
            </div>

            {/* Rider maintenance */}
            <div className="flex items-center justify-between p-4 bg-[#020B18] rounded-xl border border-[#ffffff0c]">
              <div>
                <span className="text-white font-extrabold text-sm block">Rider Fleet App Network Link</span>
                <span className="text-xs text-[#AAB6C5] block mt-1">Forces system locks on riders and service personnel.</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleState('riderAppMaintenance')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {appStates.riderAppMaintenance ? (
                    <ToggleRight className="w-9 h-9 text-rose-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-500" />
                  )}
                </button>
                <span className={`text-[10px] font-bold uppercase ${appStates.riderAppMaintenance ? 'text-rose-400 animate-pulse' : 'text-[#AAB6C5]'}`}>
                  {appStates.riderAppMaintenance ? 'LOCKED / OFFLINE' : 'ONLINE'}
                </span>
              </div>
            </div>

            {/* Restaurant maintenance */}
            <div className="flex items-center justify-between p-4 bg-[#020B18] rounded-xl border border-[#ffffff0c]">
              <div>
                <span className="text-white font-extrabold text-sm block">Restaurant Brand Application Link</span>
                <span className="text-xs text-[#AAB6C5] block mt-1">Blocks active orders dispatches or catalogs editing.</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleState('restaurantAppMaintenance')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {appStates.restaurantAppMaintenance ? (
                    <ToggleRight className="w-9 h-9 text-rose-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-500" />
                  )}
                </button>
                <span className={`text-[10px] font-bold uppercase ${appStates.restaurantAppMaintenance ? 'text-rose-400 animate-pulse' : 'text-[#AAB6C5]'}`}>
                  {appStates.restaurantAppMaintenance ? 'LOCKED / OFFLINE' : 'ONLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ffffff0c] pt-5 flex items-center justify-between gap-4">
          <div className="flex items-start space-x-2 text-[11px] text-slate-500 max-w-lg">
            <ShieldAlert className="w-4.5 h-4.5 text-[#F4B400] flex-shrink-0 mt-0.5" />
            <span>
              Configuring online statuses modifies the raw configuration parameters. Ensure caution before forcing active system blocks.
            </span>
          </div>

          <button
            type="submit"
            className="bg-[#F4B400] hover:bg-[#FFD766] text-[#020B18] font-bold py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase flex items-center shadow-lg whitespace-nowrap cursor-pointer transition"
          >
            <Save className="w-4 h-4 mr-2" /> Save App States
          </button>
        </div>
      </form>

      {/* 2. CORPORATE BRANDING UPLOAD FORM */}
      <form onSubmit={handleSaveBranding} className="bg-[#061B35] rounded-xl border border-[#ffffff0c] p-6 space-y-6 shadow-xl">
        <div className="space-y-4">
          <h2 className="text-white font-bold text-xs uppercase tracking-wider border-b border-[#ffffff0c] pb-2 flex items-center">
            <ImageIcon className="w-4.5 h-4.5 mr-1.5 text-[#F4B400]" /> Admin Branding Customize Options
          </h2>
          <p className="text-[#AAB6C5] text-xs leading-relaxed">
            Customize the administrator interface logos. Upload PNG files under 2MB. Saved modifications will replace default static assets instantly.
          </p>

          {brandingSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-semibold">
              {brandingSuccess}
            </div>
          )}

          {brandingError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-semibold">
              {brandingError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {BRANDIND_FIELDS.map((field) => {
              const currentSrc = brandingLogos[field.type];
              return (
                <div key={field.type} className="bg-[#020B18] border border-[#ffffff0c] p-4.5 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-white font-extrabold text-sm block">{field.label}</span>
                    <span className="text-[11px] text-[#AAB6C5] leading-relaxed block">{field.description}</span>
                  </div>

                  {/* Logo state container */}
                  <div className="flex items-center space-x-4 pt-1 bg-[#061B35]/30 p-3 rounded-lg border border-[#ffffff05]">
                    {/* Preview box */}
                    <div className="w-16 h-16 shrink-0 rounded bg-[#020B18] border border-[#ffffff0c] flex items-center justify-center p-1.5 overflow-hidden">
                      {currentSrc ? (
                        <img 
                          src={currentSrc} 
                          alt="preview" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[9px] text-slate-600 font-bold uppercase">No Image</span>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 w-full">
                      {/* Input file trigger */}
                      <label className="bg-[#061B35] hover:bg-slate-800 border border-[#ffffff0c] text-white hover:text-[#F4B400] text-[11px] font-bold px-3 py-1.5 rounded flex items-center justify-center space-x-1.5 cursor-pointer text-center transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{currentSrc ? 'Replace Logo' : 'Upload PNG'}</span>
                        <input 
                          type="file" 
                          accept=".png" 
                          onChange={(e) => handleLogoUpload(field.type, e)}
                          className="hidden" 
                        />
                      </label>

                      {currentSrc && (
                        <button
                          type="button"
                          onClick={() => handleClearLogo(field.type)}
                          className="border border-rose-500/20 hover:bg-rose-550/10 hover:bg-rose-500/10 text-rose-400 text-[10px] font-bold py-1 rounded w-full flex items-center justify-center space-x-1.5 cursor-pointer transition"
                        >
                          <X className="w-3 h-3" />
                          <span>Clear / Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#ffffff0c] pt-5 flex items-center justify-between gap-4">
          <span className="text-[11px] text-slate-500">
            {/* TODO: Replace localStorage branding with GET/POST /api/admin/settings/branding once backend storage is added. */}
            Branding configurations will cache instantly on client browsers using local persistence layers.
          </span>

          <button
            type="submit"
            className="bg-[#F4B400] hover:bg-[#FFD766] text-[#020B18] font-bold py-2.5 px-8 rounded-lg text-xs tracking-wider uppercase flex items-center shadow-lg whitespace-nowrap cursor-pointer transition"
          >
            <Check className="w-4 h-4 mr-2" /> Save Branding Settings
          </button>
        </div>
      </form>
    </div>
  );
};
