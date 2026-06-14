import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Building2, Flame, MapPin, ToggleLeft, ToggleRight, 
  Clock, DollarSign, Plus, Check, Play, Edit, Trash, AlertCircle 
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  hours: string;
  earnings: number;
  preparationTime: string;
  categories: string[];
}

export const RestaurantsList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadHosts = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/restaurants');
      if (data && data.length > 0) {
        const mappedData = data.map((item: any) => ({
          id: item.id || '-',
          name: item.name || item.restaurant_name || item.brand || '-',
          address: item.address || item.location || '-',
          status: item.status || (item.is_active ? 'active' : 'inactive'),
          hours: item.hours || item.working_hours || item.operating_hours || '09:00 - 23:00',
          earnings: Number(item.earnings || item.total_earnings || 0),
          preparationTime: item.preparationTime || item.preparation_time || item.prep_time || '15 mins',
          categories: item.categories || []
        }));
        setRestaurants(mappedData);
      } else {
        setRestaurants([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setRestaurants([]);
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async (restId: string) => {
    try {
      const data = await api.get(`/api/admin/restaurants/${restId}/menu`);
      setMenuItems(data || []);
    } catch {
      setMenuItems([]);
    }
  };

  useEffect(() => {
    loadHosts();
  }, []);

  useEffect(() => {
    if (selectedRest) {
      loadMenu(selectedRest.id);
    } else {
      setMenuItems([]);
    }
  }, [selectedRest]);

  const handleToggleStatus = async (item: Restaurant) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/api/admin/restaurants/${item.id}`, { status: nextStatus });
      loadHosts();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleToggleItemAvailability = async (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    if (!item) return;
    try {
      await api.patch(`/api/admin/restaurants/menu/${itemId}`, { isAvailable: !item.isAvailable });
      setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m));
    } catch {
      setErrorStatus('Failed to update menu item.');
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const filtered = restaurants.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Restaurant Partners Console</h1>
          <p className="text-slate-400 text-sm mt-1">Audit restaurant operating licenses, menu listings, working hours, and settlement ledger balances.</p>
        </div>
      </div>

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-800/40 pb-3">
        {['all', 'active', 'pending', 'inactive'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              filter === f 
                ? 'bg-emerald-500 text-brand-navy-950 font-black' 
                : 'text-slate-400 bg-slate-900/40 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Brand Outlet</th>
                <th className="px-6 py-4">Coverage Location</th>
                <th className="px-6 py-4">Working Hours</th>
                <th className="px-6 py-4 text-center">Status</th>
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
                filtered.map(rest => (
                <tr key={rest.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 font-extrabold flex items-center justify-center text-sm border border-amber-500/20">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-white font-semibold block">{rest.name}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-slate-500">
                          <span className="font-mono">{rest.id}</span>
                          <span>• Prep: {rest.preparationTime}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {String(rest?.address || '').split(',')[0] || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {rest.hours}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold leading-none ${
                      rest.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      rest.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {rest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button 
                      onClick={() => setSelectedRest(rest)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded text-xs px-3 font-semibold border border-slate-700/60"
                    >
                      Audit Menu
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(rest)}
                      className="text-slate-400 hover:text-emerald-400 p-1.5 rounded"
                      title={rest.status === 'active' ? 'Deactivate restaurant' : 'Activate restaurant'}
                    >
                      {rest.status === 'active' ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right pane: Menu inspector and action toggling */}
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Restaurant Settings</h2>
          {selectedRest ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white block">{selectedRest.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedRest.address}</p>
              </div>

              <div className="border-t border-slate-800/60 pt-4 space-y-3.5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Menu Catalog ({menuItems.length})</h4>
                  <button className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold py-1 px-2.5 rounded flex items-center">
                    <Plus className="w-3 h-3 mr-1" /> Add dish
                  </button>
                </div>

                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {menuItems.map(item => (
                    <div key={item.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">{item.category}</span>
                        <span className="text-sm font-semibold text-white mt-0.5 block">{item.name}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">{item.price} PKR</span>
                      </div>
                      <button 
                        onClick={() => handleToggleItemAvailability(item.id)}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded transition ${
                          item.isAvailable 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.isAvailable ? 'AVAILABLE' : 'SOLDOUT'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-800/60 pt-4">
                <button
                  onClick={() => handleToggleStatus(selectedRest)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                    selectedRest.status === 'active'
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-505/15'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black'
                  }`}
                >
                  {selectedRest.status === 'active' ? 'Suspend Restaurant' : 'Approve Restaurant'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-500">
              <Building2 className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-xs">Select any brand outlet to modify their live menu directory listings, operating hours and active status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

