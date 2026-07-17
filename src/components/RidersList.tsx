import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  Users, Bike, Car, Flame, Shield, Check, X, FileText,
  Wallet, DollarSign, Ban, MapPin, Eye, Star, AlertCircle
} from 'lucide-react';

// Field names match GET /api/admin/riders exactly. This used to be a guessed
// shape (`status`, `onlineStatus`, `services: []`, `vehicleNo`,
// `walletBalance`) that never matched the real response — in particular
// `services` was never returned at all, so `rider.services.map(...)` threw
// on every render (the whole table crashed, not just showed blank data).
interface Rider {
  id: string;
  name: string;
  phone: string;
  verification_status: 'verified' | 'pending' | 'rejected' | 'suspended' | string;
  is_online: boolean;
  vehicle_type: string | null;
  vehicle_number: string | null;
  vehicle_model: string | null;
  balance: number;
  rating: number;
}

export const RidersList: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleSelectRider = async (rider: Rider) => {
    setSelectedRider(rider);
    setSelectedDetails(null);
    setRejectionReason('');
    try {
      const details = await api.get(`/api/admin/riders/${rider.id}/details`);
      setSelectedDetails(details);
    } catch (err) {
      console.error("Failed to load rider details");
    }
  };

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

  const handleUpdateStatus = async (riderId: string, status: 'verified' | 'rejected' | 'suspended', reason?: string) => {
    try {
      await api.patch(`/api/admin/riders/${riderId}`, { status, rejection_reason: reason });
      loadRiders();
      if (selectedRider) handleSelectRider(selectedRider); // Reload details
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleUpdateDocument = async (riderId: string, docId: string, status: 'verified' | 'rejected', reason?: string) => {
    try {
      await api.put(`/api/admin/riders/${riderId}/documents/${docId}`, { status, rejection_reason: reason });
      if (selectedRider) handleSelectRider(selectedRider);
    } catch (err) {
      console.error("Failed to update document");
    }
  };

  const handleUpdateVehicle = async (riderId: string, status: 'verified' | 'rejected', reason?: string) => {
    try {
      await api.put(`/api/admin/riders/${riderId}/vehicle`, { status, rejection_reason: reason });
      if (selectedRider) handleSelectRider(selectedRider);
    } catch (err) {
      console.error("Failed to update vehicle");
    }
  };

  const filtered = riders.filter(r => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'online') return r.is_online;
    return r.verification_status === statusFilter;
  });

  const initials = (name?: string) => String(name || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <Users className="w-6 h-6 mr-2 text-[#FFC107]" /> Rider Management
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
                ? 'bg-[#FFC107] text-[#020B18] font-black'
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
                <th className="px-6 py-4">Vehicle Type</th>
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
                          {initials(rider.name)}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-brand-navy-800 ${
                          rider.is_online ? 'bg-emerald-400' : 'bg-slate-500'
                        }`} />
                      </div>
                      <div>
                        <span className="text-white font-semibold block">{rider.name}</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-slate-500 font-mono">{rider.id}</span>
                          <span className={`text-[10px] px-1.5 rounded font-bold uppercase leading-none ${
                            rider.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                            rider.verification_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {rider.verification_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] font-mono text-slate-400 uppercase">
                      {rider.vehicle_type || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-white block font-medium">{rider.vehicle_number || '—'}</span>
                    <span className="text-slate-500 mt-0.5 block">{rider.vehicle_model || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs font-semibold">
                    <span className={Number(rider.balance) < 0 ? 'text-rose-400' : 'text-slate-300'}>
                      {Number(rider.balance || 0).toLocaleString()} PKR
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleSelectRider(rider)}
                      className="text-slate-405 hover:text-white hover:bg-slate-800 p-1.5 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {rider.verification_status === 'pending' ? (
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
                        onClick={() => handleUpdateStatus(rider.id, rider.verification_status === 'suspended' ? 'verified' : 'suspended')}
                        className={`p-1.5 rounded ${
                          rider.verification_status === 'suspended' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={rider.verification_status === 'suspended' ? 'Revoke suspension' : 'Suspend rider'}
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
                  {initials(selectedRider.name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white block">{selectedRider.name}</h3>
                  <span className="text-xs text-slate-400 font-mono block mt-0.5">{selectedRider.id} • {selectedRider.phone}</span>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-[#ffffff0c] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Credentials & Documents</h4>

                <div className="space-y-2.5 text-xs">
                  {!selectedDetails ? (
                    <div className="text-slate-500 italic">Loading documents...</div>
                  ) : selectedDetails.documents?.length > 0 ? (
                    selectedDetails.documents.map((doc: any) => (
                      <div key={doc.id} className="flex flex-col p-2.5 bg-[#020B18] rounded border border-[#ffffff0c]">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-slate-400 flex items-center mb-0">
                              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#FFC107]" />
                              {doc.document_type.replace('_', ' ').toUpperCase()}
                            </span>
                            <a href={doc.file_url} target="_blank" className="text-[10px] text-blue-400 hover:underline ml-5 mt-1">View File</a>
                          </div>
                          <span className={`font-bold flex items-center ${doc.status === 'verified' ? 'text-emerald-400' : doc.status === 'rejected' ? 'text-rose-400' : 'text-yellow-400'}`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </div>
                        {doc.status !== 'verified' && (
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => handleUpdateDocument(selectedRider.id, doc.id, 'verified')} className="text-emerald-400 hover:underline text-[10px]">Approve</button>
                            <button onClick={() => handleUpdateDocument(selectedRider.id, doc.id, 'rejected', rejectionReason)} className="text-rose-400 hover:underline text-[10px]">Reject</button>
                          </div>
                        )}
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <div className="text-[10px] text-rose-500 mt-1 ml-5">Reason: {doc.rejection_reason}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">No documents uploaded.</div>
                  )}
                </div>
              </div>

              <div className="space-y-3.5 border-t border-[#ffffff0c] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vehicle Details</h4>
                <div className="space-y-2.5 text-xs">
                  {!selectedDetails ? (
                    <div className="text-slate-500 italic">Loading vehicle...</div>
                  ) : selectedDetails.vehicle ? (
                    <div className="p-3 bg-[#020B18] rounded-lg border border-[#ffffff0c]">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Category</span>
                          <span className="text-slate-300 font-medium">{selectedDetails.vehicle.vehicle_category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Make/Model</span>
                          <span className="text-slate-300 font-medium">{selectedDetails.vehicle.make_model}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Plate</span>
                          <span className="text-slate-300 font-medium">{selectedDetails.vehicle.license_plate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                          <span className={`font-bold ${selectedDetails.vehicle.verification_status === 'verified' ? 'text-emerald-400' : selectedDetails.vehicle.verification_status === 'rejected' ? 'text-rose-400' : 'text-yellow-400'}`}>
                            {selectedDetails.vehicle.verification_status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {selectedDetails.vehicle.registration_document_url && (
                        <div className="mb-2">
                          <a href={selectedDetails.vehicle.registration_document_url} target="_blank" className="text-[10px] text-blue-400 hover:underline">View Registration Doc</a>
                        </div>
                      )}
                      {selectedDetails.vehicle.verification_status !== 'verified' && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => handleUpdateVehicle(selectedRider.id, 'verified')} className="text-emerald-400 hover:underline text-[10px]">Approve</button>
                          <button onClick={() => handleUpdateVehicle(selectedRider.id, 'rejected', rejectionReason)} className="text-rose-400 hover:underline text-[10px]">Reject</button>
                        </div>
                      )}
                      {selectedDetails.vehicle.verification_status === 'rejected' && selectedDetails.vehicle.rejection_reason && (
                        <div className="text-[10px] text-rose-500 mt-1">Reason: {selectedDetails.vehicle.rejection_reason}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">No vehicle submitted.</div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#ffffff0c] pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Wallet Operations Ledger</h4>
                <div className="flex justify-between items-center p-3 bg-[#020B18] rounded-lg border border-[#ffffff0c]">
                  <div>
                    <span className="text-xs text-slate-500">Rider Balance</span>
                    <span className="text-base font-mono font-bold text-white block mt-0.5">{Number(selectedRider.balance || 0).toLocaleString()} PKR</span>
                  </div>
                  <div className="p-2 bg-[#FFC107]/10 text-[#FFC107] rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {selectedRider.verification_status === 'pending' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Reason for Rejection (Optional)"
                      className="w-full bg-[#020B18] border border-[#ffffff0c] text-slate-300 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#FFC107]"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedRider.id, 'verified')}
                        className="flex-1 bg-[#FFC107] hover:bg-[#FFD54F] text-[#020B18] font-black text-xs py-2.5 rounded-lg transition cursor-pointer font-bold uppercase"
                      >
                        Approve Driver
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedRider.id, 'rejected', rejectionReason)}
                        className="flex-1 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs py-2.5 rounded-lg transition cursor-pointer font-bold uppercase"
                      >
                        Reject Profile
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedRider.id, selectedRider.verification_status === 'suspended' ? 'verified' : 'suspended', rejectionReason)}
                    className={`w-full font-bold py-2.5 text-xs rounded-lg transition cursor-pointer uppercase ${
                      selectedRider.verification_status === 'suspended'
                        ? 'bg-[#FFC107] text-[#020B18] hover:bg-[#FFD54F]'
                        : 'bg-rose-950/20 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15'
                    }`}
                  >
                    {selectedRider.verification_status === 'suspended' ? 'Lift Suspension' : 'Block Rider Account'}
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
