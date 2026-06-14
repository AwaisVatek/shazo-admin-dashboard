import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Gift, Percent, ToggleLeft, ToggleRight, Plus, 
  Trash2, Play, AlertCircle, Save, Calendar, Sparkles 
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  code: string;
  type: 'free_ride' | 'discount_percentage';
  discountValue: number;
  maxDiscount?: number;
  totalLimit: number;
  usedCount: number;
  status: 'active' | 'paused';
  expiryDate: string;
}

export const PromoCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'free_ride' | 'discount_percentage'>('discount_percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [maxDiscount, setMaxDiscount] = useState(150);
  const [totalLimit, setTotalLimit] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2026-07-30');

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
    const nextStatus = item.status === 'active' ? 'paused' : 'active';
    try {
      await api.patch(`/api/admin/promo-campaigns/${item.id}`, { status: nextStatus });
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
    const newCamp: Campaign = {
      id: `PROM-${Date.now().toString().slice(-4)}`,
      name,
      code: code.toUpperCase().trim(),
      type,
      discountValue: type === 'free_ride' ? 100 : discountValue,
      maxDiscount: type === 'free_ride' ? 350 : maxDiscount,
      totalLimit,
      usedCount: 0,
      status: 'active',
      expiryDate
    };

    try {
      await api.post('/api/admin/promo-campaigns', newCamp);
      loadCampaigns();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to create campaign on backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }

    // Reset Form
    setName('');
    setCode('');
    setTotalLimit(100);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <Sparkles className="w-7 h-7 mr-2 text-[#F4B400]" /> Marketing Growth Campaigns
          </h1>
          <p className="text-[#AAB6C5] text-xs mt-1">Configure company-wide promo cuts or limit strict free ride initiatives with monitored total quotas.</p>
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
          <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">Target Promos Ledger</h2>
          <div className="bg-[#061B35] rounded-xl border border-[#ffffff0c] overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#020B18] border-b border-[#ffffff0c] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Campaign Particulars</th>
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Utilisation Gauge</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium font-medium">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs text-slate-500">
                      No data available.
                    </td>
                  </tr>
                ) :
                  campaigns.map(camp => {
                  const isFree = camp.type === 'free_ride';
                  return (
                    <tr key={camp.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2.5">
                          <Gift className={`w-4 h-4 ${isFree ? 'text-[#F4B400]' : 'text-indigo-400'}`} />
                          <div>
                            <span className="text-white font-semibold block text-xs">{camp.name}</span>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5 mt-1">
                              {isFree ? '100% Free Campaign' : `${camp.discountValue}% General Discount`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{camp.code}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>USED: {camp.usedCount}</span>
                          <span>CAP: {camp.totalLimit}</span>
                        </div>
                        <div className="w-full bg-[#020B18] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${isFree ? 'bg-[#F4B400]' : 'bg-indigo-400'}`} 
                            style={{ width: `${Math.min(100, (camp.usedCount / camp.totalLimit) * 100)}%` }} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-slate-500/15 text-slate-500'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleToggleStatus(camp)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title={camp.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                        >
                          {camp.status === 'active' ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Form Creation Pane */}
        <div className="xl:col-span-12 lg:col-span-5 bg-[#061B35] rounded-xl border border-[#ffffff0c] p-5 space-y-4">
          <h2 className="text-white font-bold text-xs uppercase tracking-wider text-[#AAB6C5]">Launch New Promo Code</h2>
          <form onSubmit={handleCreate} className="space-y-3.5 text-xs text-slate-350">
            <div>
              <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Campaign Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Clifton Launch Promo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white font-medium focus:outline-none focus:border-[#F4B400]/50 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-550 font-bold uppercase block text-[#AAB6C5]">Voucher Code</label>
              <input
                type="text"
                required
                placeholder="Voucher Code (uppercase)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white font-mono focus:outline-none focus:border-[#F4B400]/50 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-550 font-bold uppercase block text-[#AAB6C5]">Incentive Mechanism Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#020B18] border border-[#ffffff0c] py-2.5 px-3 rounded text-white font-medium focus:outline-none focus:border-[#F4B400]/50 mt-1 cursor-pointer"
              >
                <option value="discount_percentage">Generic Percentage Off Coupon</option>
                <option value="free_ride">Strict 100% Free Trip Campaign Limit</option>
              </select>
            </div>

            {type === 'discount_percentage' && (
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Discount Value (%)</label>
                  <input
                    type="number"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white mt-1 focus:outline-none focus:border-[#F4B400]/50"
                  />
                </div>
                <div>
                  <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Max Discount PKR</label>
                  <input
                    type="number"
                    value={maxDiscount || ''}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white mt-1 focus:outline-none focus:border-[#F4B400]/50"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-510 font-bold uppercase block text-[#AAB6C5]">Limit (Total Cap)</label>
                <input
                  type="number"
                  required
                  value={totalLimit || ''}
                  onChange={(e) => setTotalLimit(Number(e.target.value))}
                  className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-510 font-bold uppercase block text-[#AAB6C5]">Expiration Limit</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#020B18] border border-[#ffffff0c] py-2 px-3 rounded text-white mt-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#020B18] p-2.5 rounded text-[11px] text-slate-500 flex items-start space-x-2 border border-[#ffffff0c] mt-1">
              <AlertCircle className="w-4 h-4 text-[#F4B400] mt-0.5 flex-shrink-0" />
              <span>
                Free ride campaigns enforce strict non-relational quotas (maximum cumulative caps company-wide) to protect financial cash indexes from system abuse.
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#F4B400] hover:bg-[#FFD766] text-[#020B18] font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider cursor-pointer font-bold"
            >
              Issue Promotion Coupon
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

