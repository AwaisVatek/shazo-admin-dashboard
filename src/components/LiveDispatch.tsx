import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Navigation, User, Bike, Car, Flame, Shield, MapPin, 
  Send, AlertCircle, RefreshCw, XCircle, Settings 
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_MAPS_API_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'replace_with_shazo_frontend_maps_key';

interface DispatchRequest {
  id: string;
  customerName: string;
  serviceType: 'bike' | 'car' | 'ambulance' | 'food';
  status: 'pending_rider_match' | 'assigned' | 'trip_started' | 'completed';
  pickupAddress: string;
  dropoffAddress: string;
  timestamp: string;
  riderId?: string;
  riderName?: string;
}

export const LiveDispatch: React.FC = () => {
  const [requests, setRequests] = useState<DispatchRequest[]>([]);
  const [nearbyRiders, setNearbyRiders] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DispatchRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mapAuthError, setMapAuthError] = useState<boolean>(false);

  // Hook global Google Maps authentication failure handler
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps credentials rejected, RefererNotAllowedMapError, or limit reached.");
      setMapAuthError(true);
    };
    return () => {
      try {
        delete (window as any).gm_authFailure;
      } catch (e) {}
    };
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const activeData = await api.get('/api/dispatch/active');
      if (activeData && activeData.length > 0) {
        setRequests(activeData);
      } else {
        setRequests([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setRequests([]);
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to load data from backend.');
      }
    } finally {
      setLoading(false);
    }

    try {
      const riders = await api.get('/api/maps/nearby-riders?lat=24.8607&lng=67.0011');
      setNearbyRiders(riders || []);
    } catch {
      setNearbyRiders([]);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // Poll dispatch logs every 20 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAssignRider = async (requestId: string, riderId: string) => {
    try {
      await api.post(`/api/dispatch/assign`, { requestId, riderId });
      setSuccessMsg(`Rider successfully assigned to Trip ${requestId}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadData();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 4000);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm(`Are you sure you want to cancel the dispatch for active request ${requestId}?`)) return;
    try {
      await api.delete(`/api/dispatch/${requestId}`);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      <div className="lg:col-span-12 flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Karachi Dispatch Control</h1>
          <p className="text-slate-400 text-sm mt-1">Live dispatch assignments, unassigned bookings logs, and central vehicle navigation trackers.</p>
        </div>
        <button onClick={loadData} className="p-2 border border-slate-800 text-slate-300 rounded-lg bg-slate-900 hover:bg-slate-800 transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {errorStatus && (
        <div className="lg:col-span-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {successMsg && (
        <div className="lg:col-span-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* Left pane: Requests logs */}
      <div className="lg:col-span-5 space-y-4">
        <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Dispatch Queue</h2>
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {requests.length === 0 ? (
            <div className="bg-brand-navy-800 border border-slate-800 p-8 rounded-xl text-center text-slate-400 text-sm">
              No data available.
            </div>
          ) : (
            requests.map(req => {
              const isUnassigned = req.status === 'pending_rider_match';
              return (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedRequest?.id === req.id 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : isUnassigned ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800 bg-brand-navy-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">{req.id}</span>
                      <h3 className="text-white font-bold text-sm mt-1">{req.customerName}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.serviceType === 'ambulance' ? 'bg-rose-500/15 text-rose-400' :
                      req.serviceType === 'food' ? 'bg-amber-500/15 text-amber-400' :
                      req.serviceType === 'car' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {req.serviceType}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{req.pickupAddress}</span>
                    </div>
                    <div className="flex items-center">
                      <Navigation className="w-3.5 h-3.5 text-emerald-500 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{req.dropoffAddress}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between items-center text-xs">
                    <span className="text-slate-500">{req.timestamp}</span>
                    {isUnassigned ? (
                      <span className="text-amber-400 font-bold animate-pulse">Assign Rider</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Driver: {req.riderName}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right pane: Manual Match Board and Live Map */}
      <div className="lg:col-span-7 space-y-4">
        {selectedRequest ? (
          <div className="bg-brand-navy-800 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-white font-bold text-base">Assign Driver for {selectedRequest.id}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Pickup: {selectedRequest.pickupAddress}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white text-xs">Close</button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
                <Navigation className="w-4 h-4 mr-1 text-emerald-500" /> Nearby Fleet Drivers
              </h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {nearbyRiders
                  .filter(r => r.service === selectedRequest.serviceType || selectedRequest.serviceType === 'ambulance')
                  .map(rider => (
                    <div key={rider.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-semibold text-white">{rider.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono block mt-0.5">{rider.id} • Active near coordinate</span>
                      </div>
                      <button 
                        onClick={() => handleAssignRider(selectedRequest.id, rider.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black text-xs py-1.5 px-3 rounded flex items-center shadow"
                      >
                        <Send className="w-3 h-3 mr-1" /> Match
                      </button>
                    </div>
                  ))}
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex justify-between">
                <button 
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                  className="border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs py-2 px-4 rounded-lg flex items-center mr-auto"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Cancel Request
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/5 p-6 rounded-xl border border-emerald-500/10 text-center">
            <span className="text-emerald-400 text-sm font-medium">Select any active trip from the queue on the left to start manual matching or live driver monitoring.</span>
          </div>
        )}

        {/* Live coordinate tracking canvas representation */}
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden relative" style={{ height: '360px' }}>
          {hasValidKey && !mapAuthError ? (
            <APIProvider apiKey={API_KEY} version="weekly text-xs">
              <Map
                defaultCenter={{ lat: 24.8607, lng: 67.0011 }}
                defaultZoom={13}
                mapId="DISPATCH_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {nearbyRiders.map(rider => (
                  <AdvancedMarker key={rider.id} position={{ lat: rider.lat, lng: rider.lng }} title={rider.name}>
                    <Pin 
                      background={rider.service === 'ambulance' ? '#f43f5e' : '#10b981'} 
                      glyphColor="#fff" 
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="relative text-center max-w-sm z-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-1 border border-slate-700">
                  <Settings className="w-6 h-6 text-[#F4B400] animate-spin" />
                </div>
                
                {mapAuthError ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-left text-[11px] leading-normal text-amber-400">
                    <span className="font-bold text-white block mb-0.5">Google Maps Referer API Error Detected</span>
                    The loaded key returned <code>RefererNotAllowedMapError</code>. Please ensure HTTP referrer restrictions for your API credentials allow requests from this app's hostname. Falling back to the localized grid format.
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-white mb-1">Visual Karachi schematic operational grid</h4>
                    <p className="text-xs text-slate-400">
                      Configure your maps credentials in settings secret <code>VITE_MAPS_API_KEY</code> to enable overlay.
                    </p>
                  </>
                )}

                <div className="pt-2 flex flex-wrap gap-2 justify-center">
                  {nearbyRiders.map(r => (
                    <span key={r.id} className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[10px] font-mono">
                      {r.name} ({r.service})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
