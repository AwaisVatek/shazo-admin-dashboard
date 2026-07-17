import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Bell, MapPin, Check, Send, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

// Backed by admin_broadcasts (one row per broadcast, real target_audience +
// created_at). POST fans out an actual per-user notifications row per
// matching role — it previously only wrote one row scoped to the admin's own
// user_id, so no customer/rider ever received the "broadcast".
interface NotificationLog {
  id: string;
  title: string;
  body: string;
  target_audience: 'customers' | 'riders' | 'restaurants' | 'all';
  created_at: string;
}

export const NotificationCenter: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'customers' | 'riders' | 'restaurants' | 'all'>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/notifications');
      if (data && data.length > 0) {
        setLogs(data);
      } else {
        setLogs([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setLogs([]);
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
    loadLogs();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.post('/api/admin/notifications', { title, body, targetAudience });
      setSuccessMsg(result?.message || 'Notification broadcast successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadLogs();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to dispatch notification via backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }

    // Reset Form
    setTitle('');
    setBody('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in text-xs">
      <div className="xl:col-span-12 border-b border-[#ffffff0c] pb-5">
        <h1 className="text-xl font-black text-white tracking-tight flex items-center">
          <Bell className="w-7 h-7 mr-2 text-[#FFC107]" /> System Notifications
        </h1>
        <p className="text-[#AAB6C5] text-xs mt-1">Broadcast high-impact system alerts, marketing vouchers or critical warnings immediately to multi-app targets.</p>
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

      {/* Discovery Board */}
      <div className="xl:col-span-12 lg:col-span-7 space-y-4">
        <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">Previous Broadcast Messages</h2>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-10 bg-[#061B35] rounded-xl border border-[#ffffff0c] text-slate-400 font-semibold">
              No data available.
            </div>
          ) :
            logs.map(log => (
            <div key={log.id} className="bg-[#061B35] p-4 rounded-xl border border-[#ffffff0c] space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-550 font-mono block mb-0.5">{log.id} • {new Date(log.created_at).toLocaleString()}</span>
                  <h3 className="text-white font-bold text-sm">{log.title}</h3>
                </div>
                <span className="bg-[#020B18] inline-block px-1.5 py-0.5 text-[10px] font-bold text-[#FFC107] uppercase tracking-wide rounded">
                  To: {log.target_audience}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{log.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dispatch form Board */}
      <div className="xl:col-span-12 lg:col-span-5 bg-[#061B35] rounded-xl border border-[#ffffff0c] p-5 space-y-4">
        <h2 className="text-white font-bold text-xs uppercase tracking-wider text-[#AAB6C5]">Compose Push Broadcast</h2>
        <form onSubmit={handleBroadcast} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Target Audience Group</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full bg-[#020B18] border border-[#ffffff0c] py-2.5 px-3 rounded-lg text-white font-medium focus:outline-none focus:border-[#FFC107]/50 mt-1.5 cursor-pointer"
            >
              <option value="all">Broad Audience (Everyone)</option>
              <option value="customers">Customers Android App Only</option>
              <option value="riders">Rider Android App Only</option>
              <option value="restaurants">Restaurant Android App Only</option>
            </select>
          </div>

          <div>
            <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Notification Header Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Free ride quotas today!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#020B18] border border-[#ffffff0c] py-2.5 px-3 rounded-lg text-white font-bold focus:outline-none focus:border-[#FFC107]/50 mt-1.5"
            />
          </div>

          <div>
            <label className="text-slate-505 font-bold uppercase block text-[#AAB6C5]">Push Message Body</label>
            <textarea
              required
              rows={5}
              placeholder="Keep messages under 150 characters for clean lock screen rendering..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#020B18] border border-[#ffffff0c] text-white font-medium p-3 rounded-lg focus:outline-none focus:border-[#FFC107]/50 placeholder-slate-550 mt-1.5"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-[#020B18] font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4 mr-2" /> TRANSMIT BROADCAST
          </button>
        </form>
      </div>
    </div>
  );
};
