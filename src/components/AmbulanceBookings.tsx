import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  ShieldAlert, User, Shield, Phone, MapPin, 
  Clock, Check, Eye, AlertCircle, RefreshCcw 
} from 'lucide-react';

interface AmbulanceBooking {
  id: string;
  patientName: string;
  contactNo: string;
  emergencyType: string;
  pickup: string;
  destination: string;
  status: 'pending' | 'dispatched' | 'reached' | 'completed' | 'cancelled';
  driverName?: string;
  vehiclePlate?: string;
  estimatedFare: number;
}

export const AmbulanceBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AmbulanceBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<AmbulanceBooking | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadAmbulances = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/ambulance-bookings');
      if (data && data.length > 0) {
        const mappedData = data.map((item: any) => ({
          id: item.id || '-',
          patientName: item.patient_name || item.customer?.full_name || item.customer_name || '-',
          contactNo: item.contact_no || item.phone || item.customer?.phone || '-',
          emergencyType: item.emergency_type || item.type || 'Standard',
          pickup: item.pickup_address || item.pickup_location || '-',
          destination: item.destination_address || item.hospital_address || item.dropoff_address || '-',
          status: item.status || 'pending',
          driverName: item.driver_name || item.rider?.full_name || item.rider_name || '-',
          vehiclePlate: item.vehicle_plate || item.vehicle_number || '-',
          estimatedFare: Number(item.estimated_fare || item.fare || item.total_fare || 0)
        }));
        setBookings(mappedData);
      } else {
        setBookings([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setBookings([]);
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
    loadAmbulances();
  }, []);

  const handleDispatch = async (id: string, driver: string, plate: string) => {
    try {
      await api.patch(`/api/ambulance/${id}`, { status: 'dispatched', driverName: driver, vehiclePlate: plate });
      loadAmbulances();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3050);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-rose-500 tracking-tight flex items-center">
            <Shield className="w-7 h-7 mr-2 text-rose-500" strokeWidth={2.5} /> Medical Ambulance Dispatch
          </h1>
          <p className="text-slate-400 text-sm mt-1">Live triage system to log patients, assign ventilators, and track emergency responders.</p>
        </div>
        <button onClick={loadAmbulances} className="p-2 border border-slate-800 text-slate-300 rounded-lg bg-slate-900 hover:bg-slate-800 transition">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start space-x-3 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
        <div>
          <span className="font-bold">Disclaimer Notice: </span>
          Ambulance services are subject to availability and coverage. All medical vehicle trips are billed as paid dispatch operations; never configure free promo quotas for ambulance transportation.
        </div>
      </div>

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Patient Case</th>
                <th className="px-6 py-4">Emergency Category</th>
                <th className="px-6 py-4">Transit Path</th>
                <th className="px-6 py-4 text-center">Fare Estimate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs text-slate-500">
                    No data available.
                  </td>
                </tr>
              ) :
                bookings.map(bo => (
                <tr key={bo.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-white font-bold block">{bo.patientName}</span>
                      <span className="text-xs text-slate-500 font-mono block">{bo.id} • {bo.contactNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-xs font-bold font-mono">
                      {bo.emergencyType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-xs truncate">
                    <div className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {String(bo?.pickup || '').split(',')[0] || ''}</div>
                    <div className="flex items-center mt-1"><Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> {String(bo?.destination || '').split(',')[0] || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-white font-mono">
                    {bo.estimatedFare} PKR
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedBooking(bo)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Details Pane */}
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Ambulance Dispatcher Info</h2>
          {selectedBooking ? (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs text-slate-500 font-mono block">{selectedBooking.id}</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedBooking.patientName}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-2 ${
                  selectedBooking.status === 'pending' ? 'bg-amber-500/10 text-yellow-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">Emergency Particulars</span>
                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chief Complaint</span>
                    <span className="text-rose-400 font-semibold">{selectedBooking.emergencyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transit Type</span>
                    <span className="text-slate-300">Paid Dispatch Unit</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-slate-800/60 pt-2 mt-1">
                    <span>Admin Dispatched Fare</span>
                    <span className="font-mono text-emerald-400">{selectedBooking.estimatedFare} PKR</span>
                  </div>
                </div>
              </div>

              {selectedBooking.status === 'pending' ? (
                <button
                  onClick={() => handleDispatch(selectedBooking.id, 'Sajid Hussain', 'AMB-1122')}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider"
                >
                  Confirm Dispatch Unit
                </button>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Assigned Responder</span>
                  <span className="text-white font-bold block mt-1">{selectedBooking.driverName}</span>
                  <span className="text-slate-400 font-mono mt-0.5 block">{selectedBooking.vehiclePlate} (Cardiac Unit Enabled)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-500">
              <Shield className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-xs">Select any emergency transport case from the file registers to verify patient destination and dispatch ambulances.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

