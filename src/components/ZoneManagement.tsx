import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  MapPin, Check, Save, ToggleLeft, ToggleRight, 
  HelpCircle, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  city: string;
  boundCenters: { lat: number; lng: number };
  status: 'active' | 'suspended';
  demandIndex: 'normal' | 'high' | 'surge';
}

export const ZoneManagement: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/zones');
      if (data && data.length > 0) {
        setZones(data);
      } else {
        setZones([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setZones([]);
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleZone = async (id: string, currentStatus: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/api/admin/zones/${id}`, { status: nextStatus });
      loadData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleSurge = async (id: string, demand: 'normal' | 'high' | 'surge') => {
    try {
      await api.patch(`/api/admin/zones/${id}/surge`, { demandIndex: demand });
      loadData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#061B35] p-8 rounded-xl animate-pulse h-64 border border-[#ffffff0c]" />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <Layers className="w-6 h-6 mr-2 text-[#FFC107]" /> Operational Zones & Coverage Settings
          </h1>
          <p className="text-slate-400 text-xs mt-1">Geofence boundary controllers, toggle active sectors, and induce surge pricing overrides across Pakistan.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107] p-3 rounded-lg text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-[#061B35] rounded-xl border border-[#ffffff0c] text-slate-400 text-xs font-semibold">
            No data available.
          </div>
        ) :
          zones.map(zone => (
          <div key={zone.id} className="bg-[#061B35] p-5 rounded-xl border border-[#ffffff0c] space-y-4 hover:border-[#FFC107]/30 transition">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#FFC107]" />
                <div>
                  <h3 className="text-white font-extrabold text-sm">{zone.name}</h3>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{zone.id} • {zone.city}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleToggleZone(zone.id, zone.status)}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {zone.status === 'active' ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
                </button>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{zone.status}</span>
              </div>
            </div>

            {/* Demand Surge Index Config */}
            <div className="border-t border-[#ffffff0c] pt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Surge Multiplier</span>
              <div className="flex space-x-1">
                {['normal', 'high', 'surge'].map(demand => (
                  <button
                    key={demand}
                    onClick={() => handleSurge(zone.id, demand as any)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                      zone.demandIndex === demand 
                        ? demand === 'surge' ? 'bg-rose-500 text-white' :
                          demand === 'high' ? 'bg-[#FFC107] text-[#020B18]' : 'bg-[#0B2A4A] text-slate-200'
                        : 'bg-[#020B18] text-slate-400 hover:text-white'
                    }`}
                  >
                    {demand} {demand === 'surge' ? 'x1.4' : demand === 'high' ? 'x1.2' : 'x1.0'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
