import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { ShieldAlert, MapPin, Eye, Check, Bell, Phone, AlertTriangle, RefreshCw } from 'lucide-react';

interface SafetyIncident {
  id: string;
  tripId: string;
  triggerBy: 'passenger' | 'driver';
  reporterName: string;
  description: string;
  severity: 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved';
  timestamp: string;
}

export const SafetyReports: React.FC = () => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInc, setSelectedInc] = useState<SafetyIncident | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/safety-incidents');
      if (data && data.length > 0) {
        setIncidents(data);
      } else {
        setIncidents([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setIncidents([]);
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

  const handleResolve = async (id: string) => {
    try {
      await api.post(`/api/admin/safety/${id}/resolve`);
      loadData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
      <div className="xl:col-span-12 flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-rose-500 tracking-tight flex items-center">
            <ShieldAlert className="w-8 h-8 mr-2 text-rose-500" strokeWidth={2.5} /> Emergency Reports
          </h1>
          <p className="text-slate-400 text-xs mt-1">Live critical incident telemetry monitoring riders' geo-coordinates and passenger emergency triggers.</p>
        </div>
        <button onClick={loadData} className="p-2 border border-[#ffffff0c] text-[#AAB6C5] rounded-lg bg-[#020B18] hover:bg-[#0B2A4A]/40 transition cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="xl:col-span-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold animate-fade-in">
          {successMsg}
        </div>
      )}

      {errorStatus && (
        <div className="xl:col-span-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold animate-fade-in">
          {errorStatus}
        </div>
      )}

      {/* SOS incidents logs */}
      <div className="xl:col-span-12 lg:col-span-7 space-y-4">
        <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center">
          <Bell className="w-4.5 h-4.5 mr-1.5 text-rose-500 animate-bounce" /> Active Emergency Feeds
        </h2>
        <div className="bg-[#061B35] rounded-xl border border-[#ffffff0c] overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#020B18] border-b border-[#ffffff0c] text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Incident ID</th>
                <th className="px-6 py-4">Sender Group</th>
                <th className="px-6 py-4">Trip Code</th>
                <th className="px-6 py-4 text-center">Urgency</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs text-slate-500 animate-fade-in">
                    No data available.
                  </td>
                </tr>
              ) :
                incidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-mono text-xs text-rose-400 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-rose-500" /> {inc.id}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-white block font-semibold">{inc.reporterName}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold mt-1">{inc.triggerBy}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {inc.tripId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.severity === 'critical' ? 'bg-rose-500/15 text-rose-450 text-rose-400 animate-pulse' : 'bg-amber-500/15 text-yellow-500'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedInc(inc)}
                      className="text-slate-400 hover:text-white hover:bg-slate-900 p-1.5 rounded cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Details Pane */}
      <div className="xl:col-span-12 bg-[#061B35] rounded-xl border border-[#ffffff0c] p-5 space-y-4">
        <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">Incident Triage Room</h2>
        {selectedInc ? (
          <div className="space-y-4 text-xs">
            <div className="border-b border-[#ffffff0c] pb-3">
              <span className="text-xs text-slate-500 font-mono block">{selectedInc.id} • {selectedInc.timestamp}</span>
              <h3 className="text-sm font-extrabold text-white mt-1">Incident Report on {selectedInc.tripId}</h3>
              <p className="text-xs text-rose-400 mt-1">Initiator: {selectedInc.reporterName}</p>
            </div>

            <div className="bg-[#020B18] p-3.5 rounded-lg border border-[#ffffff0c] text-xs text-slate-400 whitespace-pre-line leading-relaxed">
              {selectedInc.description}
            </div>

            <div className="bg-[#020B18] p-3 rounded-lg text-xs text-slate-500 border border-[#ffffff0c] space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block">Emergency Protocols Checklist</span>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="sc_1" className="bg-slate-950 border-slate-800 text-rose-500 focus:ring-0 rounded" defaultChecked />
                <label htmlFor="sc_1">Determine real-time GPS coordinates.</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="sc_2" className="bg-slate-950 border-slate-800 text-rose-500 focus:ring-0 rounded animate-pulse" />
                <label htmlFor="sc_2" className="text-rose-400 font-semibold animate-pulse">Contact medical responders or police authorities.</label>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href="tel:+9215"
                className="flex-1 bg-[#020B18] border border-[#ffffff0c] text-[#AAB6C5] hover:bg-[#0B2A4A]/40 font-black text-xs py-2.5 rounded-lg transition uppercase flex items-center justify-center tracking-wider"
              >
                <Phone className="w-3.5 h-3.5 mr-2" /> CALL 15 POLICE
              </a>
              {selectedInc.status !== 'resolved' && (
                <button
                  onClick={() => handleResolve(selectedInc.id)}
                  className="flex-1 bg-rose-650 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-lg transition uppercase tracking-wider cursor-pointer font-bold"
                >
                  SOLVE INCIDENT
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4 text-slate-500">
            <ShieldAlert className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="text-xs">Select any incoming SOS thread to inspect GPS routes, passengers, or dispatch security loops.</p>
          </div>
        )}
      </div>
    </div>
  );
};
