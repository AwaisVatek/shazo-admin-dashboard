import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { MessageCircle, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DiagnosticsData {
  diagnostics: {
    whatsapp_api_online: boolean;
    webhook_health: string;
  };
  recent_otps: Array<{
    id: string;
    phone: string;
    role: string;
    created_at: string;
    expires_at: string;
    verified_at: string | null;
    attempts: number;
    max_attempts: number;
    status: string;
  }>;
  recent_webhooks: Array<{
    id: string;
    event_type: string;
    created_at: string;
  }>;
}

export const WhatsAppDiagnostics: React.FC = () => {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState(false);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const res = await api.get('/api/admin/integrations/whatsapp/diagnostics');
      if (res) {
        setData(res);
      } else {
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setErrorStatus('Unable to load WhatsApp diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  const configureWebhook = async () => {
    if (!window.confirm("Are you sure you want to reconfigure the Evolution API webhook?")) return;
    try {
      setConfiguring(true);
      await api.post('/api/admin/integrations/evolution/configure-webhook', {});
      alert("Webhook configured successfully");
      fetchDiagnostics();
    } catch (err: any) {
      alert("Failed to configure webhook: " + err.message);
    } finally {
      setConfiguring(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <MessageCircle className="w-5 h-5 mr-3 text-[#facc15]" />
            WhatsApp & OTP Diagnostics
          </h1>
          <p className="text-[#a1a1aa] mt-1 font-medium">Monitor Evolution API and OTP health.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchDiagnostics} 
            className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={configureWebhook} 
            disabled={configuring}
            className="bg-[#facc15] hover:bg-[#eab308] text-black px-4 py-2 rounded-lg font-bold transition-colors flex items-center disabled:opacity-50"
          >
            Configure Webhook
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#a1a1aa] font-medium animate-pulse">Loading diagnostics...</div>
      ) : errorStatus ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 font-bold">{errorStatus}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#18181b] border border-[#ffffff0c] rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#a1a1aa] font-medium">Evolution API Status</span>
                {data.diagnostics.whatsapp_api_online ? 
                  <CheckCircle className="w-5 h-5 text-green-500" /> : 
                  <XCircle className="w-5 h-5 text-red-500" />
                }
              </div>
              <p className="text-2xl font-black text-white">
                {data.diagnostics.whatsapp_api_online ? 'Online' : 'Offline'}
              </p>
            </div>
            
            <div className="bg-[#18181b] border border-[#ffffff0c] rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#a1a1aa] font-medium">Webhook Health</span>
                {data.diagnostics.webhook_health === 'receiving' ? 
                  <CheckCircle className="w-5 h-5 text-green-500" /> : 
                  <Clock className="w-5 h-5 text-yellow-500" />
                }
              </div>
              <p className="text-2xl font-black text-white capitalize">
                {data.diagnostics.webhook_health.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-[#ffffff0c] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#ffffff0c] bg-[#1f1f22]">
              <h2 className="font-bold text-white">Recent OTP Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#18181b] text-[#a1a1aa]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Attempts</th>
                    <th className="px-5 py-3 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffffff0c]">
                  {data.recent_otps.map(otp => (
                    <tr key={otp.id} className="hover:bg-[#1f1f22] transition-colors">
                      <td className="px-5 py-4 font-bold text-white">{otp.phone}</td>
                      <td className="px-5 py-4 text-[#a1a1aa] capitalize">{otp.role}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          otp.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                          otp.status === 'expired' ? 'bg-gray-500/20 text-gray-400' :
                          otp.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {otp.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#a1a1aa]">{otp.attempts} / {otp.max_attempts}</td>
                      <td className="px-5 py-4 text-[#a1a1aa]">{new Date(otp.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {data.recent_otps.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#a1a1aa]">No recent OTPs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
