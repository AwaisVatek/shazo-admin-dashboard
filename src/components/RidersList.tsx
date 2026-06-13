import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Users, Bike, Car, Flame, Shield, Check, X, FileText, 
  Wallet, DollarSign, Ban, MapPin, Eye, Star, AlertCircle 
} from 'lucide-react';

interface Rider {
  id: string;
  name: string;
  phone: string;
  status: 'verified' | 'pending' | 'rejected' | 'suspended';
  onlineStatus: 'online' | 'offline';
  services: ('bike' | 'car' | 'ambulance' | 'food')[];
  vehicleNo: string;
  vehicleModel: string;
  walletBalance: number;
  rating: number;
}

export const RidersList: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadRiders = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/riders');
      if (data && data.length > 0) {
        setRiders(data);
      } else {
        setRiders([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setRiders([]);
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
    loadRiders();
  }, []);

  const handleUpdateStatus = async (riderId: string, status: 'verified' | 'rejected' | 'suspended') => {
    try {
      await api.patch(`/api/admin/riders/${riderId}`, { status });
      loadRiders();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const filtered = riders.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'online') return r.onlineStatus === 'online';
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <Users className="w-6 h-6 mr-2 text-[#F4B400]" /> Rider Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">Audit rider credentials, vehicle registrations, service-type toggles, and ledger balances.</p>
        </div>
      </div>

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex space-x-2 border-b border-[#ffffff0c] pb-3">
        {['all', 'online', 'verified', 'pending', 'suspended'].map(filter => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              statusFilter === filter 
                ? 'bg-[#F4B400] text-[#020B18] font-black' 
                : 'text-slate-400 bg-[#020B18] hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#061B35] rounded-xl border border-[#ffffff0c] overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#020B18] border-b border-[#ffffff0c] text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Rider Profile</th>
                <th className="px-6 py-4">Approved Services</th>
                <th className="px-6 py-4">Vehicle Details</th>
                <th className="px-6 py-4 text-right">Wallet</th>
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
                filtered.map(rider => (
                <tr key={rider.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-700 font-extrabold flex items-center justify-center text-sm text-white">
                          {String(rider?.name || '').split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-brand-navy-800 ${
                          rider.onlineStatus === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                        }`} />
                      </div>
                      <div>
                        <span className="text-white font-semibold block">{rider.name}</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-slate-500 font-mono">{rider.id}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold uppercase leading-none ${
                            rider.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                            rider.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {rider.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {rider.services.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] font-mono text-slate-400 uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-white block font-medium">{rider.vehicleNo}</span>
                    <span className="text-slate-500 mt-0.5 block">{rider.vehicleModel}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs font-semibold">
                    <span className={rider.walletBalance < 0 ? 'text-rose-400' : 'text-slate-300'}>
                      {rider.walletBalance.toLocaleString()} PKR
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedRider(rider)} 
                      className="text-slate-405 hover:text-white hover:bg-slate-800 p-1.5 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {rider.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(rider.id, 'verified')}
                          className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded"
                          title="Verify Rider"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(rider.id, 'rejected')}
                          className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded"
                          title="Reject Rider"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleUpdateStatus(rider.id, rider.status === 'suspended' ? 'verified' : 'suspended')}
                        className={`p-1.5 rounded ${
                          rider.status === 'suspended' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={rider.status === 'suspended' ? 'Revoke suspension' : 'Suspend rider'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right pane: Inspection Panel */}
        <div className="bg-[#061B35] rounded-xl border border-[#ffffff0c] p-6 space-y-6">
          <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">Rider Verification Portal</h2>
          {selectedRider ? (
            <div className="space-y-6 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-700 font-extrabold flex items-center justify-center text-lg text-white">
                  {String(selectedRider?.name || '').split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white block">{selectedRider.name}</h3>
                  <span className="text-xs text-slate-400 font-mono block mt-0.5">{selectedRider.id} • {selectedRider.phone}</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-[#ffffff0c] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Credentials Audit Check list</h4>
                
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-[#020B18] rounded border border-[#ffffff0c]">
                    <span className="text-slate-400 flex items-center mb-0"><FileText className="w-3.5 h-3.5 mr-1.5 text-[#F4B400]" /> CNIC Copy</span>
                    <span className="text-emerald-400 font-bold flex items-center"><Check className="w-3 h-3 mr-0.5" /> VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#020B18] rounded border border-[#ffffff0c]">
                    <span className="text-slate-400 flex items-center mb-0"><FileText className="w-3.5 h-3.5 mr-1.5 text-[#F4B400]" /> Driving License</span>
                    <span className="text-emerald-400 font-bold flex items-center"><Check className="w-3 h-3 mr-0.5" /> VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#020B18] rounded border border-[#ffffff0c]">
                    <span className="text-slate-400 flex items-center mb-0"><FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Police Clearance</span>
                    <span className="text-[#F4B400] font-bold flex items-center">PENDING FILE</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#ffffff0c] pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Operations Ledger</h4>
                <div className="flex justify-between items-center p-3 bg-[#020B18] rounded-lg border border-[#ffffff0c]">
                  <div>
                    <span className="text-xs text-slate-500">Rider Balance</span>
                    <span className="text-base font-mono font-bold text-white block mt-0.5">{selectedRider.walletBalance.toLocaleString()} PKR</span>
                  </div>
                  <div className="p-2 bg-[#F4B400]/10 text-[#F4B400] rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedRider.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedRider.id, 'verified')}
                      className="flex-1 bg-[#F4B400] hover:bg-[#FFD766] text-[#020B18] font-black text-xs py-2.5 rounded-lg transition cursor-pointer font-bold uppercase"
                    >
                      Approve Driver
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedRider.id, 'rejected')}
                      className="flex-1 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs py-2.5 rounded-lg transition cursor-pointer font-bold uppercase"
                    >
                      Reject Documents
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedRider.id, selectedRider.status === 'suspended' ? 'verified' : 'suspended')}
                    className={`w-full font-bold py-2.5 text-xs rounded-lg transition cursor-pointer uppercase ${
                      selectedRider.status === 'suspended'
                        ? 'bg-[#F4B400] text-[#020B18] hover:bg-[#FFD766]'
                        : 'bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15'
                    }`}
                  >
                    {selectedRider.status === 'suspended' ? 'Lift Suspension' : 'Block Rider Account'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-500">
              <Users className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-xs">Select any driver profile from the register database to verify or adjust ledger parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
