import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Bike, Car, Shield, Flame, Save, 
  HelpCircle, AlertCircle, RefreshCw, Layers 
} from 'lucide-react';

interface ServiceFare {
  serviceType: 'bike' | 'car' | 'ambulance' | 'food';
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
  minimumFare: number;
  peakHourMultiplier: number;
  cancelFee: number;
}

export const SettingsFares: React.FC = () => {
  const [fares, setFares] = useState<ServiceFare[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadFaresData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/settings/fares');
      if (data && data.length > 0) {
        setFares(data);
      } else {
        setFares([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
      setFares([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaresData();
  }, []);

  const handleUpdateFare = (index: number, field: keyof ServiceFare, value: number) => {
    setFares(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/settings/fares', { fares });
      setSuccessMsg('Fare settings updated globally!');
      setTimeout(() => setSuccessMsg(null), 3000);
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
      <div className="bg-brand-navy-800 p-8 rounded-xl animate-pulse h-64 border border-slate-800" />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
            <Layers className="w-6 h-6 mr-2 text-indigo-400" /> Fare Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure pricing parameters, operational thresholds, minimum bookings guarantees, and cancel thresholds.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {fares.length === 0 ? (
        <div className="bg-brand-navy-800 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
          No data available.
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fares.map((fare, idx) => {
              const isAmbulance = fare.serviceType === 'ambulance';
              return (
                <div key={fare.serviceType} className="bg-brand-navy-800 rounded-xl border border-slate-850 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      {fare.serviceType === 'bike' && <Bike className="w-5 h-5 text-indigo-400" />}
                      {fare.serviceType === 'car' && <Car className="w-5 h-5 text-emerald-400" />}
                      {fare.serviceType === 'ambulance' && <Shield className="w-5 h-5 text-rose-500" />}
                      {fare.serviceType === 'food' && <Flame className="w-5 h-5 text-amber-500" />}
                      <span className="text-white font-extrabold uppercase tracking-wide text-sm">Shazo {fare.serviceType}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-850 text-slate-500 px-2 py-0.5 rounded uppercase">
                      PKR CURRENCY
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Base Flag Drop Fee</label>
                      <input
                        type="number"
                        value={fare.baseFare}
                        onChange={(e) => handleUpdateFare(idx, 'baseFare', Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Per Kilometer Rate</label>
                      <input
                        type="number"
                        value={fare.perKmRate}
                        onChange={(e) => handleUpdateFare(idx, 'perKmRate', Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-slate-705"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Per Min Charge (Distance)</label>
                      <input
                        type="number"
                        disabled={isAmbulance}
                        value={fare.perMinRate}
                        onChange={(e) => handleUpdateFare(idx, 'perMinRate', Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-slate-705 disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Guarantee Min Fare</label>
                      <input
                        type="number"
                        value={fare.minimumFare}
                        onChange={(e) => handleUpdateFare(idx, 'minimumFare', Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-slate-705"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Peak-Time Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fare.peakHourMultiplier}
                        onChange={(e) => handleUpdateFare(idx, 'peakHourMultiplier', Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-slate-705"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 font-bold block mb-1">Cancellation Penalty</label>
                      <input
                        type="number"
                        value={fare.cancelFee}
                        onChange={(e) => handleUpdateFare(idx, 'cancelFee', Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-slate-705"
                      />
                    </div>
                  </div>

                  {isAmbulance && (
                    <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded text-[11px] text-rose-400">
                      Reminder: Do not attach free campaign multipliers or discount coupons to this emergency vehicle settings.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 px-8 rounded-lg text-xs uppercase tracking-wider flex items-center shadow-lg"
            >
              <Save className="w-4.5 h-4.5 mr-2" /> Commit Fare Multipliers Globally
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
