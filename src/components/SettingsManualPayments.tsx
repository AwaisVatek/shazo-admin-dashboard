import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  DollarSign, CheckSquare, Server, AlertCircle, 
  Settings, Check, Save, ToggleLeft, ToggleRight, Building 
} from 'lucide-react';

interface ManualPaymentAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  iban: string;
  easypaisaNo: string;
  easypaisaTitle: string;
  jazzcashNo: string;
  jazzcashTitle: string;
  minTopup: number;
  maxTopup: number;
  status: 'active' | 'inactive';
}

export const SettingsManualPayments: React.FC = () => {
  const [account, setAccount] = useState<ManualPaymentAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/settings/manual-payment-accounts');
      if (data && data.length > 0) {
        setAccount(data[0]);
      } else {
        setAccount(null);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    try {
      if (account.id.startsWith('MAN-SETT')) { // Mock prefix or missing backend DB matching ID
        await api.post('/api/admin/settings/manual-payment-accounts', account);
      } else {
        await api.patch(`/api/admin/settings/manual-payment-accounts/${account.id}`, account);
      }
      setSuccessMsg('Payment instructions updated successfully!');
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
          <Building className="w-6 h-6 mr-2 text-emerald-400" /> Manual Payment Channels
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure the official bank details and mobile wallet channels presented to riders for manual wallet recharges.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {account && (
        <form onSubmit={handleSave} className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Channel Particulars */}
            <div className="space-y-4">
              <h2 className="text-slate-200 font-bold text-sm uppercase tracking-wider border-b border-slate-805/40 pb-2 flex items-center">
                <Building className="w-4.5 h-4.5 mr-1.5 text-indigo-400" /> Administrative Bank Option
              </h2>
              
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase block">Official Bank Brand</label>
                  <input
                    type="text"
                    required
                    value={account.bankName}
                    onChange={(e) => setAccount({ ...account, bankName: e.target.value })}
                    className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-medium text-xs focus:outline-none focus:border-slate-700 mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase block">Holding Account Title</label>
                  <input
                    type="text"
                    required
                    value={account.accountTitle}
                    onChange={(e) => setAccount({ ...account, accountTitle: e.target.value })}
                    className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-medium text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase block">IBAN Coordinates Code</label>
                  <input
                    type="text"
                    required
                    value={account.iban}
                    onChange={(e) => setAccount({ ...account, iban: e.target.value })}
                    className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Wallet Channels */}
            <div className="space-y-4">
              <h2 className="text-slate-200 font-bold text-sm uppercase tracking-wider border-b border-slate-805/40 pb-2 flex items-center">
                <Settings className="w-4.5 h-4.5 mr-1.5 text-emerald-400" /> Mobile Restaurant Wallets
              </h2>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block">Easypaisa Phone</label>
                    <input
                      type="text"
                      value={account.easypaisaNo}
                      onChange={(e) => setAccount({ ...account, easypaisaNo: e.target.value })}
                      className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block">Easypaisa Name</label>
                    <input
                      type="text"
                      value={account.easypaisaTitle}
                      onChange={(e) => setAccount({ ...account, easypaisaTitle: e.target.value })}
                      className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block">JazzCash Phone</label>
                    <input
                      type="text"
                      value={account.jazzcashNo}
                      onChange={(e) => setAccount({ ...account, jazzcashNo: e.target.value })}
                      className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block">JazzCash Name</label>
                    <input
                      type="text"
                      value={account.jazzcashTitle}
                      onChange={(e) => setAccount({ ...account, jazzcashTitle: e.target.value })}
                      className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block">Min Topup limit</label>
                    <input
                      type="number"
                      value={account.minTopup}
                      onChange={(e) => setAccount({ ...account, minTopup: Number(e.target.value) })}
                      className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase block">Max Topup limit</label>
                    <input
                      type="number"
                      value={account.maxTopup}
                      onChange={(e) => setAccount({ ...account, maxTopup: Number(e.target.value) })}
                      className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-705 mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAccount({ ...account, status: account.status === 'active' ? 'inactive' : 'active' })}
                className="text-slate-400 hover:text-white transition"
              >
                {account.status === 'active' ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
              </button>
              <span className="text-xs text-slate-400 font-bold uppercase">Rider App Visibility (Active)</span>
            </div>

            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase flex items-center shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" /> Save Payments Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

