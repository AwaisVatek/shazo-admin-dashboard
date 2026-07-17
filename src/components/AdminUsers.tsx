import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Users, User, Shield, AlertCircle, Plus, Key, RefreshCw } from 'lucide-react';

// GET /staff-users selects id, full_name, email, phone, role, is_verified,
// created_at from users — there is no separate "status" column.
interface StaffUser {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'operations_manager' | 'finance_admin' | 'support_agent';
  is_verified: boolean;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form creators
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'operations_manager' | 'finance_admin' | 'support_agent'>('support_agent');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/staff-users');
      if (data && data.length > 0) {
        setUsers(data);
      } else {
        setUsers([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setUsers([]);
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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Server generates the account id + a one-time temp password (there's
      // no email/SMS delivery wired up yet, so it comes back in the response
      // for the admin to hand off directly).
      const result = await api.post('/api/admin/staff-users', { name, email, role });
      setSuccessMsg(`Staff account created! Temp password: ${result?.tempPassword} — share this securely, it won't be shown again.`);
      setTimeout(() => setSuccessMsg(null), 15000);
      loadData();
      setName('');
      setEmail('');
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus(err.message || 'Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 4000);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
      <div className="xl:col-span-12 border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
          <Shield className="w-7 h-7 mr-2 text-indigo-400" /> Admin Users & Permissions
        </h1>
        <p className="text-slate-400 text-sm mt-1">Provision corporate user logons, adjust organizational roles (Admin, Finance, Dispatch, Support), and verify login status.</p>
      </div>

      {successMsg && (
        <div className="xl:col-span-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold animate-fade-in">
          {successMsg}
        </div>
      )}

      {errorStatus && (
        <div className="xl:col-span-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {/* Roster database table */}
      <div className="xl:col-span-7 space-y-4">
        <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center">
          <Users className="w-4.5 h-4.5 mr-1.5 text-indigo-400" /> System Staff Roster
        </h2>
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email Coordinates</th>
                <th className="px-6 py-4 text-center">Assigned Role</th>
                <th className="px-6 py-4 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium font-medium animate-fade-in">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400 text-xs text-slate-500">
                    No data available.
                  </td>
                </tr>
              ) :
                users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition text-xs">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center font-bold">
                        {String(u?.full_name || '').split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <span className="text-white font-semibold">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{u.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-indigo-505/10 bg-indigo-500/10 text-[10px] uppercase font-mono font-bold px-2 py-0.5 text-indigo-400 rounded">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold uppercase text-[10px] ${u.is_verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {u.is_verified ? 'verified' : 'unverified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Provisioning Panel */}
      <div className="xl:col-span-5 bg-brand-navy-800 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Add Staff Account</h2>
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="text-slate-500 font-bold uppercase block">Employee Title Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Faraz Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-medium focus:outline-none focus:border-slate-705 mt-1.5"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold uppercase block">Official Email Logon</label>
            <input
              type="email"
              required
              placeholder="faraz@shazoride.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-mono focus:outline-none focus:border-slate-705 mt-1.5"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold uppercase block">Assigned Security Role Permission</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-905 border border-slate-800 py-2.5 px-3 rounded-lg text-white font-bold focus:outline-none focus:border-slate-705 mt-1.5"
            >
              <option value="operations_manager">Operations Manager (Dispatch, Support, Drivers)</option>
              <option value="finance_admin">Finance Specialist (Accounts, top-ups, limits)</option>
              <option value="support_agent">Support Agent (Disputes, user reviews)</option>
              <option value="admin">Super Admin (Universal Access)</option>
            </select>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2 border border-slate-850 mt-1">
            <AlertCircle className="w-4 h-4 text-indigo-500/80 mt-0.5 flex-shrink-0" />
            <span>
              The specified role instantly limits module tabs inside the sidebar menu of this web console according to designated access privileges.
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1.5" /> PROVISION STAFF LOGON
          </button>
        </form>
      </div>
    </div>
  );
};
