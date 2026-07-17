import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  Settings, AlertCircle, Save, ToggleLeft, ToggleRight, Building, Plus, Trash2
} from 'lucide-react';

// Real manual_payment_accounts columns: id, account_type, account_title,
// account_number, bank_name, instructions, is_active, display_order,
// created_at, updated_at. There is no min_topup/max_topup column — this is a
// LIST of payment channels (bank, easypaisa, jazzcash, ...), not a single
// bank-account row, confirmed against the real production data (which
// already has separate 'bank' and 'easypaisa' rows).
interface ManualPaymentAccount {
  id: string;
  account_type: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  instructions: string;
  is_active: boolean;
  display_order: number;
}

const emptyAccount = (): ManualPaymentAccount => ({
  id: '',
  account_type: 'bank',
  bank_name: '',
  account_title: 'Shazo Ride',
  account_number: '',
  instructions: '',
  is_active: true,
  display_order: 0,
});

export const SettingsManualPayments: React.FC = () => {
  const [accounts, setAccounts] = useState<ManualPaymentAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<ManualPaymentAccount | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/settings/manual-payment-accounts');
      if (data && data.length > 0) {
        setAccounts(data);
      } else {
        setAccounts([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      // POST upserts by id (ON CONFLICT) — omitting id creates a new account.
      await api.post('/api/admin/settings/manual-payment-accounts', selected);
      setSuccessMsg('Payment account saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelected(null);
      loadAccounts();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleToggleActive = async (acct: ManualPaymentAccount) => {
    try {
      await api.patch(`/api/admin/settings/manual-payment-accounts/${acct.id}`, { is_active: !acct.is_active });
      loadAccounts();
    } catch {
      setErrorStatus('Unable to save changes to backend.');
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleDelete = async (acct: ManualPaymentAccount) => {
    try {
      await api.delete(`/api/admin/settings/manual-payment-accounts/${acct.id}`);
      if (selected?.id === acct.id) setSelected(null);
      loadAccounts();
    } catch {
      setErrorStatus('Unable to remove account.');
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-navy-800 p-8 rounded-xl animate-pulse h-64 border border-slate-800" />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
            <Building className="w-6 h-6 mr-2 text-[#FFC107]" /> Manual Payment Channels
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage every bank/mobile-wallet account (bank transfer, Easypaisa, JazzCash, ...) presented to riders for manual wallet recharges.</p>
        </div>
        <button
          onClick={() => setSelected(emptyAccount())}
          className="bg-[#FFC107] hover:bg-[#FFD54F] text-[#020B18] font-black py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center shadow-lg"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Channel
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <div className="lg:col-span-2 bg-brand-navy-800 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
            No data available.
          </div>
        ) : (
          accounts.map(acct => (
            <div key={acct.id} className="bg-brand-navy-800 rounded-xl border border-slate-800 p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFC107] block">{acct.account_type}</span>
                  <h3 className="text-white font-bold text-sm mt-0.5">{acct.bank_name || acct.account_title}</h3>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">{acct.account_number}</span>
                </div>
                <button
                  onClick={() => handleToggleActive(acct)}
                  className="text-slate-400 hover:text-white transition"
                  title={acct.is_active ? 'Deactivate' : 'Activate'}
                >
                  {acct.is_active ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{acct.instructions}</p>
              <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => setSelected(acct)}
                  className="flex-1 text-xs font-bold uppercase tracking-wider py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(acct)}
                  className="text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <form onSubmit={handleSave} className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-5 shadow-xl">
          <h2 className="text-slate-200 font-bold text-sm uppercase tracking-wider border-b border-slate-800/40 pb-2 flex items-center">
            <Settings className="w-4.5 h-4.5 mr-1.5 text-[#FFC107]" /> {selected.id ? 'Edit' : 'New'} Payment Channel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase block">Channel Type</label>
              <select
                value={selected.account_type}
                onChange={(e) => setSelected({ ...selected, account_type: e.target.value })}
                className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-medium text-xs mt-1.5"
              >
                <option value="bank">Bank Transfer</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase block">Bank / Wallet Name</label>
              <input
                type="text"
                value={selected.bank_name}
                onChange={(e) => setSelected({ ...selected, bank_name: e.target.value })}
                className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-medium text-xs mt-1.5"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase block">Account Title</label>
              <input
                type="text"
                required
                value={selected.account_title}
                onChange={(e) => setSelected({ ...selected, account_title: e.target.value })}
                className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-medium text-xs mt-1.5"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase block">Account Number / IBAN</label>
              <input
                type="text"
                required
                value={selected.account_number}
                onChange={(e) => setSelected({ ...selected, account_number: e.target.value })}
                className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold uppercase block">Instructions shown to riders</label>
            <textarea
              rows={3}
              value={selected.instructions}
              onChange={(e) => setSelected({ ...selected, instructions: e.target.value })}
              className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white text-xs mt-1.5"
            />
          </div>

          <div className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-500 flex items-start space-x-2 border border-slate-850">
            <AlertCircle className="w-4 h-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
            <span>Display order controls the sequence riders see these channels in.</span>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold uppercase block">Display Order</label>
            <input
              type="number"
              value={selected.display_order}
              onChange={(e) => setSelected({ ...selected, display_order: Number(e.target.value) })}
              className="w-32 bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono text-xs mt-1.5"
            />
          </div>

          <div className="border-t border-slate-800/60 pt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-white text-xs font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 px-6 rounded-lg text-xs tracking-wider uppercase flex items-center shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" /> Save Channel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
