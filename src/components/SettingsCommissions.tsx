import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Percent, Save, Bike, Car, Shield, Flame, 
  HelpCircle, AlertCircle, RefreshCw 
} from 'lucide-react';

interface CommissionSetting {
  serviceType: 'bike' | 'car' | 'ambulance' | 'food';
  commissionPercentage: number;
  minCommissionPKR: number;
  variablePeakHourlyCharge: boolean;
}

export const SettingsCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/settings/commissions');
      if (data && data.length > 0) {
        setCommissions(data);
      } else {
        setCommissions([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangePercentage = (index: number, val: number) => {
    setCommissions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], commissionPercentage: Math.max(0, Math.min(100, val)) };
      return copy;
    });
  };

  const handleChangeMinCommission = (index: number, val: number) => {
    setCommissions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], minCommissionPKR: Math.max(0, val) };
      return copy;
    });
  };

  const handleToggleVariable = (index: number) => {
    setCommissions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], variablePeakHourlyCharge: !copy[index].variablePeakHourlyCharge };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/settings/commissions', { commissions });
      setSuccessMsg('Commission split rates committed successfully!');
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
          <Percent className="w-6 h-6 mr-2 text-indigo-400" /> Corporate Commission Splits
        </h1>
        <p className="text-slate-400 text-sm mt-1">Audit or tune the platform's cut per trip to maintain driver satisfaction index and margins.</p>
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

      {commissions.length === 0 ? (
        <div className="bg-brand-navy-800 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
          No data available.
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            {commissions.map((comm, idx) => (
              <div key={comm.serviceType} className="bg-brand-navy-800 p-5 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-56 flex-shrink-0">
                  <div className="p-2 bg-slate-905 rounded-lg border border-slate-800/60">
                    {comm.serviceType === 'bike' && <Bike className="w-5 h-5 text-indigo-400" />}
                    {comm.serviceType === 'car' && <Car className="w-5 h-5 text-emerald-400" />}
                    {comm.serviceType === 'ambulance' && <Shield className="w-5 h-5 text-rose-500" />}
                    {comm.serviceType === 'food' && <Flame className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <span className="text-white font-black uppercase text-sm">{comm.serviceType} Split</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono mt-0.5">Shazo Base Cut</span>
                  </div>
                </div>

                {/* Input details */}
                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400">
                  <div className="w-28">
                    <label className="text-slate-500 block mb-1">Commission (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={comm.commissionPercentage}
                        onChange={(e) => handleChangePercentage(idx, Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2.5 pl-3 pr-7 rounded-lg text-white font-mono focus:outline-none focus:border-slate-700"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-500">%</span>
                    </div>
                  </div>

                  <div className="w-32">
                    <label className="text-slate-500 block mb-1">Standard Min Cut</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={comm.minCommissionPKR}
                        onChange={(e) => handleChangeMinCommission(idx, Number(e.target.value))}
                        className="w-full bg-slate-905 border border-slate-800 py-2.5 pl-3 pr-10 rounded-lg text-white font-mono focus:outline-none focus:border-slate-700"
                      />
                      <span className="absolute right-3.5 top-3 text-slate-500">PKR</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-5">
                    <button
                      type="button"
                      onClick={() => handleToggleVariable(idx)}
                      className={`inline-flex px-2 py-1 rounded text-[10px] uppercase font-bold border transition ${
                        comm.variablePeakHourlyCharge 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {comm.variablePeakHourlyCharge ? 'PEAK VARIABLE CHARGE ON' : 'FIXED PERCENTAGE ONLY'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 px-8 rounded-lg text-xs uppercase tracking-wider flex items-center shadow-lg"
            >
              <Percent className="w-4 h-4 mr-2" /> Commit Margins Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
