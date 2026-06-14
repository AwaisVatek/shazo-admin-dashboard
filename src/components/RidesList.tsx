import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Car, Bike, MapPin, User, Navigation, AlertCircle, 
  DollarSign, Clock, FileSpreadsheet, Eye, Receipt, Calendar 
} from 'lucide-react';

interface Ride {
  id: string;
  customerName: string;
  riderName: string;
  vehicleType: 'bike' | 'car';
  pickup: string;
  dropoff: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled';
  fare: number;
  commission: number;
  paymentMethod: 'cash' | 'wallet';
  createdAt: string;
}

export const RidesList: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/rides');
      if (data && data.length > 0) {
        const mappedData = data.map((item: any) => ({
          id: item.id || '-',
          customerName: item.customer_name || item.customer?.full_name || item.customer || item.full_name || '-',
          riderName: item.rider_name || item.driver_name || item.rider?.full_name || item.rider || '-',
          vehicleType: item.vehicle_type || item.service_type || 'car',
          pickup: item.pickup_address || item.pickup_location || item.route?.pickup || '-',
          dropoff: item.dropoff_address || item.dropoff_location || item.route?.dropoff || '-',
          status: item.status || 'pending',
          fare: Number(item.total_fare || item.fare || item.total_amount || 0),
          commission: Number(item.commission_amount || item.commission || 0),
          paymentMethod: item.payment_method || item.payment_type || 'cash',
          createdAt: item.created_at ? new Date(item.created_at).toLocaleString() : '-'
        }));
        setRides(mappedData);
      } else {
        setRides([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setRides([]);
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
    loadBookings();
  }, []);

  const filtered = rides.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Trip Operations Audit</h1>
          <p className="text-slate-400 text-sm mt-1">Review historic and active Bike/Car trip requests, fare structures, payment routes and matching timelines.</p>
        </div>
      </div>

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/40 pb-3">
        {['all', 'pending', 'accepted', 'started', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              filter === tab 
                ? 'bg-emerald-500 text-brand-navy-950 font-black' 
                : 'text-slate-400 bg-slate-900/40 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Trip Identifier</th>
                <th className="px-6 py-4">Customer & Driver</th>
                <th className="px-6 py-4">Route Info</th>
                <th className="px-6 py-4 text-center">Amount</th>
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
                filtered.map(ride => (
                <tr key={ride.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {ride.vehicleType === 'bike' ? <Bike className="w-4 h-4 text-indigo-400" /> : <Car className="w-4 h-4 text-emerald-400" />}
                      <div>
                        <span className="text-white font-semibold font-mono text-xs block">{ride.id}</span>
                        <span className="text-[10px] text-slate-500 flex items-center mt-0.5"><Clock className="w-3 h-3 mr-1" /> {ride.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">
                    <div className="text-white">Cust: {ride.customerName}</div>
                    <div className="text-slate-400 mt-0.5">Rider: {ride.riderName}</div>
                  </td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-400">
                    <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" /> <span className="truncate">{ride.pickup}</span></div>
                    <div className="flex items-center mt-1"><Navigation className="w-3.5 h-3.5 mr-1 text-emerald-500 flex-shrink-0" /> <span className="truncate">{ride.dropoff}</span></div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs">
                    <span className="text-white block font-bold">{ride.fare} PKR</span>
                    <span className="text-[10px] text-emerald-500 block mt-0.5">{ride.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedRide(ride)}
                      className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right pane: Fare detail audit */}
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Fare & Trip Auditor</h2>
          {selectedRide ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-500 font-mono block">{selectedRide.id}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1.5 ${
                    selectedRide.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    selectedRide.status === 'started' ? 'bg-indigo-500/10 text-indigo-400' :
                    selectedRide.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {selectedRide.status}
                  </span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  {selectedRide.vehicleType === 'bike' ? <Bike className="w-5 h-5 text-indigo-400" /> : <Car className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <Receipt className="w-4 h-4 mr-1.5 text-indigo-400" /> Operational Fare Breakdown
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Fare Charge</span>
                    <span className="font-mono">{selectedRide.fare} PKR</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/40 pb-2">
                    <span>Admin App Commission (10%)</span>
                    <span className="font-mono text-emerald-400">+{selectedRide.commission} PKR</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-1">
                    <span>Rider Ledger Payout</span>
                    <span className="font-mono">{selectedRide.fare - selectedRide.commission} PKR</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/60 pt-4 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-indigo-400" /> Journey Milestones
                </h4>
                <div className="space-y-3 pl-3 border-l-2 border-slate-800 text-xs">
                  <div className="relative">
                    <span className="font-bold text-white block">Trip Created</span>
                    <span className="text-slate-500 block">System matched passenger coordinates to nearby driver loops.</span>
                  </div>
                  {selectedRide.status !== 'pending' && selectedRide.status !== 'cancelled' && (
                    <div className="relative">
                      <span className="font-bold text-emerald-400 block">Matched with Driver</span>
                      <span className="text-slate-500 block">Driver {selectedRide.riderName} accepted routing and coordinates.</span>
                    </div>
                  )}
                  {selectedRide.status === 'completed' && (
                    <div className="relative animate-pulse">
                      <span className="font-bold text-emerald-400 block">Journey Completed Successfully</span>
                      <span className="text-slate-500 block">Fare of {selectedRide.fare} PKR dispatched.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-500">
              <Car className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-xs">Select any ride trip from the ledger directory above to audit pricing splits and driver match status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

