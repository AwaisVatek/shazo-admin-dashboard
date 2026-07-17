import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { HelpCircle, AlertCircle, Eye, Check, Send, Sparkles, MessageSquare } from 'lucide-react';

// Real support_tickets columns + a joined sender_name/sender_type (the table
// has no display name of its own, and no source_type column — sender_type is
// derived from the user's role instead). priority/status are free-text in
// production (seen values include "normal", not a fixed low/medium/high/
// urgent enum), so both are typed loosely rather than as a strict union.
interface Ticket {
  id: string;
  sender_name: string | null;
  sender_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export const SupportCenter: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/support/tickets');
      if (data && data.length > 0) {
        setTickets(data);
      } else {
        setTickets([]);
        setErrorStatus('No data available.');
      }
    } catch (err: any) {
      setTickets([]);
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
    loadTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.post(`/api/admin/support/tickets/${id}/resolve`);
      loadTickets();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;
    try {
      await api.post(`/api/admin/support/tickets/${selectedTicket.id}/reply`, { replyText });
      setSuccessMsg(`Custom reply dispatched successfully to ${selectedTicket.sender_name || 'user'}!`);
      setReplyText('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to dispatch reply via backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
      <div className="xl:col-span-12 flex justify-between items-center border-b border-[#ffffff0c] pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center">
            <MessageSquare className="w-7 h-7 mr-2 text-[#FFC107]" /> Customer Support Tickets
          </h1>
          <p className="text-slate-400 text-xs mt-1">Audit guest issues, reply directly to active dispute chats, and fast-track priority resolutions.</p>
        </div>
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

      {/* Ticket Logs List */}
      <div className="xl:col-span-12 lg:col-span-7 space-y-4">
        <h2 className="text-white font-bold text-xs uppercase tracking-wider text-slate-400">Incoming Support Tickets</h2>
        <div className="bg-[#061B35] rounded-xl border border-[#ffffff0c] overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#020B18] border-b border-[#ffffff0c] text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Initiator Profile</th>
                <th className="px-6 py-4">Issue Summary</th>
                <th className="px-6 py-4 text-center">Urgency</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium font-medium">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs text-slate-500 animate-fade-in">
                    No data available.
                  </td>
                </tr>
              ) :
                tickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-mono text-xs">{t.id}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-white block font-semibold">{t.sender_name || 'Unknown user'}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold mt-1">{t.sender_type}</span>
                  </td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-400">
                    <span className="text-white block font-medium truncate">{t.subject}</span>
                    <span className="text-xs text-slate-500 block truncate mt-0.5">{t.description}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ['urgent', 'critical'].includes(t.priority?.toLowerCase()) ? 'bg-rose-500/15 text-rose-400' :
                      t.priority?.toLowerCase() === 'high' ? 'bg-[#FFC107]/15 text-[#FFC107]' : 'bg-[#020B18] text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedTicket(t)}
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

      {/* Right Reply Sheet Pane */}
      <div className="xl:col-span-12 bg-[#061B35] rounded-xl border border-[#ffffff0c] p-5 space-y-4">
        <h2 className="text-white font-bold text-xs uppercase tracking-wider text-[#AAB6C5]">Response Console Desk</h2>
        {selectedTicket ? (
          <div className="space-y-4 text-xs">
            <div className="border-b border-[#ffffff0c] pb-3">
              <span className="text-xs text-slate-500 font-mono block">{selectedTicket.id} • {new Date(selectedTicket.created_at).toLocaleString()}</span>
              <h3 className="text-sm font-extrabold text-white mt-1">Claim: {selectedTicket.subject}</h3>
              <p className="text-xs text-[#FFC107] mt-1">By: {selectedTicket.sender_name || 'Unknown user'} ({selectedTicket.sender_type})</p>
            </div>

            <div className="bg-[#020B18] p-3 rounded-lg border border-[#ffffff0c] text-xs text-slate-400 whitespace-pre-line leading-relaxed">
              {selectedTicket.description}
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <div>
                <label className="text-[#AAB6C5] text-xs font-bold uppercase block mb-1.5">Draft Response Ticket Reply</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Draft resolution parameters..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-[#020B18] border border-[#ffffff0c] text-white font-medium text-xs p-3 rounded-lg focus:outline-none focus:border-[#FFC107]/50 placeholder-slate-550"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] hover:bg-[#FFD54F] text-[#020B18] font-black text-xs py-2.5 rounded-lg transition uppercase flex items-center justify-center tracking-wider cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 mr-2" /> DISPATCH REPLY
                </button>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="border border-[#ffffff0c] text-[#AAB6C5] hover:bg-slate-900 text-xs py-2.5 px-4 rounded-lg transition uppercase font-bold flex items-center cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> RESOLVE TICKET
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-10 px-4 text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="text-xs">Select any customer support ticket row above to review details and draft resolution responses.</p>
          </div>
        )}
      </div>
    </div>
  );
};
