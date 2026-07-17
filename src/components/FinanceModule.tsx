import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  DollarSign, Wallet, FileText, Check, X,
  HelpCircle, AlertCircle, TrendingUp, ShieldAlert, ArrowUpRight
} from 'lucide-react';

// Field names match what GET /api/admin/finance/topups and
// GET /api/finance/customer-topups actually return — this used to be a
// guessed camelCase shape (riderName/paymentChannel/referenceNo/timestamp)
// that never matched the real API response.
interface TopupRequest {
  id: string;
  rider_name?: string;
  customer_name?: string;
  amount: number;
  payment_method: 'easypaisa' | 'jazzcash' | 'bank_transfer';
  transaction_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const FinanceModule: React.FC = () => {
  const [topups, setTopups] = useState<TopupRequest[]>([]);
  const [customerTopups, setCustomerTopups] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [adjustmentRiderId, setAdjustmentRiderId] = useState<string>('');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentMsg, setAdjustmentMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const [riderData, customerResponse] = await Promise.all([
        api.get('/api/admin/finance/topups').catch(() => []),
        // Customer wallet top-ups live on the /api/finance/* router, not
        // /api/admin/finance/* — a separate module built alongside the
        // customer wallet itself. Its response is { requests: [...] }, not the
        // { items, total } shape the API client auto-unwraps, so read it directly.
        api.get('/api/finance/customer-topups').catch(() => ({ requests: [] })),
      ]);
      const customerData = (customerResponse as any)?.requests || [];
      setTopups(riderData || []);
      setCustomerTopups(customerData);
      if ((!riderData || riderData.length === 0) && customerData.length === 0) {
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setTopups([]);
      setCustomerTopups([]);
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
    loadFinanceData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/api/admin/finance/topups/${id}/approve`);
      setSuccessMsg(`Topup transaction ${id} has been audited and approved successfully!`);
      loadFinanceData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/api/admin/finance/topups/${id}/reject`);
      setSuccessMsg(`Topup request ${id} rejected.`);
      loadFinanceData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleApproveCustomer = async (id: string) => {
    try {
      await api.patch(`/api/finance/customer-topups/${id}`, { status: 'approved' });
      setSuccessMsg(`Customer topup ${id} approved successfully!`);
      loadFinanceData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleRejectCustomer = async (id: string) => {
    try {
      await api.patch(`/api/finance/customer-topups/${id}`, { status: 'rejected' });
      setSuccessMsg(`Customer topup ${id} rejected.`);
      loadFinanceData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentRiderId || adjustmentAmount === 0) return;
    try {
      await api.post(`/api/admin/finance/rider-wallets/${adjustmentRiderId}/adjust`, { amount: adjustmentAmount });
      setAdjustmentMsg('Ledger balance adjustments completed successfully!');
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3050);
    }
    setAdjustmentRiderId('');
    setAdjustmentAmount(0);
    setTimeout(() => setAdjustmentMsg(null), 4000);
  };

  const pendingCount = topups.filter(t => t.status === 'pending').length + customerTopups.filter(t => t.status === 'pending').length;

  const renderTopupRow = (t: TopupRequest, kind: 'rider' | 'customer') => (
    <tr key={t.id} className="hover:bg-slate-900/40 transition">
      <td className="px-6 py-4 font-mono text-xs">{t.id}</td>
      <td className="px-6 py-4">
        <span className="text-white block">{kind === 'rider' ? t.rider_name : t.customer_name}</span>
        <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">{t.payment_method}</span>
      </td>
      <td className="px-6 py-4 font-mono text-xs text-slate-400">
        {t.transaction_id || '—'}
      </td>
      <td className="px-6 py-4 font-mono text-emerald-400 text-sm">
        +{t.amount} PKR
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase leading-none ${
          t.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
          t.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {t.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right space-x-1">
        {t.status === 'pending' ? (
          <>
            <button
              onClick={() => kind === 'rider' ? handleApprove(t.id) : handleApproveCustomer(t.id)}
              className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded"
              title="Approve Claims"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => kind === 'rider' ? handleReject(t.id) : handleRejectCustomer(t.id)}
              className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded"
              title="Reject Claims"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500">—</span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Finance Ops & Settlements</h1>
          <p className="text-slate-400 text-sm mt-1">Audit manual cash collections, verify wallet top-ups, issue driver settlements and adjust account ledgers.</p>
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

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-navy-800 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 uppercase font-bold block">Cash Collected Today</span>
          <span className="text-2xl font-mono font-black text-white mt-1 block" title="Not yet wired to a live figure — see /api/admin/finance/cash-collections">— PKR</span>
        </div>
        <div className="bg-brand-navy-800 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 uppercase font-bold block">Outstanding Fleet Wallets</span>
          <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block" title="Not yet wired to a live figure">— PKR</span>
        </div>
        <div className="bg-brand-navy-800 p-5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 uppercase font-bold block">Pending Top-up Claims</span>
          <span className="text-2xl font-mono font-black text-yellow-500 mt-1 block">
            {pendingCount} Requests
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Rider Top-up Requests</h2>
            <div className="bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Claim ID</th>
                    <th className="px-6 py-4">Rider</th>
                    <th className="px-6 py-4 font-mono">Trx Reference</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {topups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-semibold">
                        No data available.
                      </td>
                    </tr>
                  ) : topups.map(t => renderTopupRow(t, 'rider'))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Customer Wallet Top-up Requests</h2>
            <div className="bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Claim ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4 font-mono">Trx Reference</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {customerTopups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-semibold">
                        No data available.
                      </td>
                    </tr>
                  ) : customerTopups.map(t => renderTopupRow(t, 'customer'))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Pane: Manual Adjustment Panel */}
        <div className="space-y-6">
          <div className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Wallet Adjustment</h2>

            {adjustmentMsg && (
              <div className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 p-3 rounded-lg text-xs font-semibold">
                {adjustmentMsg}
              </div>
            )}

            <form onSubmit={handleManualAdjustment} className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Rider Identity (user id or rider profile id)</label>
                <input
                  type="text"
                  required
                  placeholder="Rider ID..."
                  value={adjustmentRiderId}
                  onChange={(e) => setAdjustmentRiderId(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800/80 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-700 mt-1.5"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Adjustment Volume (PKR)</label>
                <input
                  type="number"
                  required
                  placeholder="Use negative values to subtract..."
                  value={adjustmentAmount || ''}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="w-full bg-slate-905 border border-slate-800/80 py-2.5 px-3 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-slate-700 mt-1.5"
                />
              </div>

              <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2 border border-slate-850">
                <ShieldAlert className="w-4 h-4 text-yellow-500/80 flex-shrink-0 mt-0.5" />
                <span>
                  Adjusting ledger balance logs is recorded irreversibly under the logged admin auditor's username. Avoid errors.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider"
              >
                Execute Adjustments
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
