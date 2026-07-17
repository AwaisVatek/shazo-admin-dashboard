import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  Gift, Percent, ToggleLeft, ToggleRight, Plus,
  Trash2, Play, AlertCircle, Save, Calendar, Sparkles
} from 'lucide-react';

// Field names match the real free_ride_campaigns columns exactly. There is no
// coupon-code / percentage-discount concept anywhere in the schema — this
// only supports a free-ride quota campaign (a running counter with a cap),
// scoped to a service type. The previous version modeled a voucher-code +
// discount-percentage system that the backend never actually stored (POST
// wrote to columns that didn't exist, so campaign creation silently did
// nothing) — fixed on both sides.
interface Campaign {
  id: string;
  name: string;
  service_type: string;
  total_quota: number;
  total_used: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const SERVICE_TYPES = ['bike', 'car', 'ambulance', 'food_delivery', 'restaurant'];

export const PromoCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('bike');
  const [totalQuota, setTotalQuota] = useState(100);
  const [endsAt, setEndsAt] = useState('2026-07-30');

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/promo-campaigns');
      if (data && data.length > 0) {
        setCampaigns(data);
      } else {
        setCampaigns([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setCampaigns([]);
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
    loadCampaigns();
  }, []);

  const handleToggleStatus = async (item: Campaign) => {
    try {
      await api.patch(`/api/admin/promo-campaigns/${item.id}`, { status: item.is_active ? 'paused' : 'active' });
      loadCampaigns();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/promo-campaigns', {
        name,
        service_type: serviceType,
        total_quota: totalQuota,
        ends_at: endsAt ? new Date(endsAt).toISOString() : undefined,
        is_active: true,
      });
      loadCampaigns();
      setSuccessMsg('Campaign created successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to create campaign on backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }

    setName('');
    setTotalQuota(100);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <Sparkles className="w-7 h-7 mr-2 text-[#FFC107]" /> Free Ride Campaigns
          </h1>
          <p className="text-[#AAB6C5] text-xs mt-1">Configure free-ride quota campaigns per service type with a monitored total cap. No coupon codes — quota-based only.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold animate-fade-in">
          {successMsg}
        </div>
      )}

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left List Pane */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">Active Campaigns</h2>
          <div className="bg-[#061B35] rounded-xl border border-[#ffffff0c] overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#020B18] border-b border-[#ffffff0c] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Quota Usage</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs text-slate-500">
                      No data available.
                    </td>
                  </tr>
                ) :
                  campaigns.map(camp => (
                  <tr key={camp.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <Gift className="w-4 h-4 text-[#FFC107]" />
                        <div>
                          <span className="text-white font-semibold block text-xs">{camp.name}</span>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">
                            Until {camp.ends_at ? new Date(camp.ends_at).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs uppercase">{camp.service_type}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>USED: {camp.total_used}</span>
                        <span>CAP: {camp.total_quota}</span>
                      </div>
                      <div className="w-full bg-[#020B18] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#FFC107]"
                          style={{ width: `${camp.total_quota > 0 ? Math.min(100, (camp.total_used / camp.total_quota) * 100) : 0}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        camp.is_active ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-slate-500/15 text-slate-500'
                      }`}>
                        {camp.is_active ? 'active' : 'paused'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(camp)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                        title={camp.is_active ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {camp.is_active ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Form Creation Pane */}
        <div className="xl:col-span-12 lg:col-span-5 bg-[#061B35] rounded-xl border border-[#ffffff0c] p-5 space-y-4">
          <h2 className="text-white font-bold text-xs uppercase tracking-wider text-[#AAB6C5]">Launch New Campaign</h2>
          <form onSubmit={handleCreate} className="space-y-3.5 text-xs text-slate-350">
            <div>
              <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Campaign Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Clifton Launch Promo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white font-medium focus:outline-none focus:border-[#FFC107]/50 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-550 font-bold uppercase block text-[#AAB6C5]">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2.5 px-3 rounded text-white font-medium focus:outline-none focus:border-[#FFC107]/50 mt-1 cursor-pointer"
              >
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-510 font-bold uppercase block text-[#AAB6C5]">Total Free-Ride Quota</label>
              <input
                type="number"
                required
                value={totalQuota || ''}
                onChange={(e) => setTotalQuota(Number(e.target.value))}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white mt-1 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-510 font-bold uppercase block text-[#AAB6C5]">Ends On</label>
              <input
                type="date"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white mt-1 focus:outline-none"
              />
            </div>

            <div className="bg-[#020B18] p-2.5 rounded text-[11px] text-slate-500 flex items-start space-x-2 border border-[#ffffff0c] mt-1">
              <AlertCircle className="w-4 h-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
              <span>
                Free ride campaigns enforce strict cumulative quota caps company-wide to protect financial cash indexes from system abuse.
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-[#020B18] font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider cursor-pointer font-bold"
            >
              Launch Campaign
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
