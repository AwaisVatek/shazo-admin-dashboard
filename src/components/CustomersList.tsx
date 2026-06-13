import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Search, User, Phone, Mail, ShieldAlert, Star, 
  MapPin, Check, AlertCircle, Eye, CornerDownRight 
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'blocked';
  rating: number;
  ridesCount: number;
  joinedAt: string;
}

export const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/customers');
      if (data && data.length > 0) {
        setCustomers(data);
      } else {
        setCustomers([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setCustomers([]);
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
    loadCustomers();
  }, []);

  const handleToggleBlock = async (user: Customer) => {
    const updatedStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await api.patch(`/api/admin/customers/${user.id}`, { status: updatedStatus });
      loadCustomers();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customer Database</h1>
          <p className="text-slate-400 text-sm mt-1">Review active customers, verify trip counts, search profiles and execute admin blocklists.</p>
        </div>
      </div>

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 py-2.5 pl-10 pr-4 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                    No data available.
                  </td>
                </tr>
              ) :
                filtered.map(cust => (
                <tr key={cust.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm">
                        {String(cust?.name || '').split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <span className="text-white font-semibold block">{cust.name}</span>
                        <span className="text-xs text-slate-500 font-mono block">{cust.id} • Joined {cust.joinedAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono space-y-1">
                    <div className="flex items-center text-slate-300"><Phone className="w-3.5 h-3.5 mr-1 text-slate-500" /> {cust.phone}</div>
                    <div className="flex items-center text-slate-400"><Mail className="w-3.5 h-3.5 mr-1 text-slate-500" /> {cust.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold leading-none ${
                      cust.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1 text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold text-slate-300">{cust.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedUser(cust)} 
                      className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded"
                      title="Inspect Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleBlock(cust)} 
                      className={`p-1.5 rounded transition ${
                        cust.status === 'active' 
                          ? 'text-rose-400 hover:bg-rose-500/10' 
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={cust.status === 'active' ? 'Block user' : 'Unblock user'}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No customers found matching that query parameter.
            </div>
          )}
        </div>

        {/* Right pane: Inspection side shelf */}
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Customer Inspector</h2>
          {selectedUser ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center text-xl mx-auto border border-emerald-500/20">
                  {String(selectedUser?.name || '').split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-500 mt-1.5 block">{selectedUser.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/40">
                  <span className="text-xs text-slate-500">Completed Trips</span>
                  <span className="text-lg font-bold text-white block mt-0.5">{selectedUser.ridesCount}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/40">
                  <span className="text-xs text-slate-500">Global Score</span>
                  <span className="text-lg font-bold text-yellow-500 flex items-center mt-0.5">
                    {selectedUser.rating} <Star className="w-4 h-4 fill-current ml-1" />
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400">Historical Footprints</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-805">
                    <span className="text-slate-400">Registered Addresses</span>
                    <span className="text-slate-300">Gulshan, DHA Phase 6</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-900/40 rounded border border-slate-850">
                    <span className="text-slate-400">Support Incidents</span>
                    <span className="text-slate-300 font-bold text-emerald-400">0 Reported</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleBlock(selectedUser)}
                className={`w-full font-bold py-2.5 px-4 rounded-lg text-xs transition ${
                  selectedUser.status === 'active'
                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                }`}
              >
                {selectedUser.status === 'active' ? 'Disable This Account' : 'Re-Activate Account'}
              </button>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-500">
              <User className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-xs">Select a customer profile index from the database ledger for holistic operations checks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
