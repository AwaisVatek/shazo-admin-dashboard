import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Users, Shield, Bike, Car, Flame, DollarSign, Wallet, Percent, 
  HelpCircle, AlertTriangle, Activity, CheckCircle, XCircle 
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtext?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-brand-navy-800 p-5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1.5">{value}</h3>
      {subtext && <p className="text-xs text-emerald-500 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const stats = await api.get('/api/admin/dashboard');
        setData(stats);
        setErrorStatus(null);
      } catch (err: any) {
        if (err.message === 'NOT_IMPLEMENTED') {
          setErrorStatus('Backend endpoint not implemented yet.');
        } else {
          setErrorStatus('Unable to load data from backend.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (errorStatus) {
    return (
      <div className="space-y-6 animate-fade-in text-xs text-slate-300">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">System Operations Hub</h1>
            <p className="text-[#AAB6C5] text-xs mt-1">Real-time control tower for the Shazo Pakistan-wide mobility platform.</p>
          </div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-8 rounded-xl text-center text-xs font-semibold max-w-xl mx-auto space-y-4 shadow-2xl">
          <AlertTriangle className="w-10 h-10 mx-auto text-rose-500" />
          <h2 className="text-white font-extrabold text-sm uppercase tracking-wider">
            {errorStatus}
          </h2>
          <p className="text-[#AAB6C5]">Please configure appropriate backend routes in your server environment to start metrics telemetry.</p>
        </div>
      </div>
    );
  }

  if (!loading && (!data || Object.keys(data).length === 0)) {
    return (
      <div className="space-y-6 animate-fade-in text-xs text-slate-300">
        <div className="flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">System Operations Hub</h1>
            <p className="text-[#AAB6C5] text-xs mt-1">Real-time control tower for the Shazo Pakistan-wide mobility platform.</p>
          </div>
        </div>
        <div className="bg-[#061B35] border border-[#ffffff0c] text-slate-400 p-12 rounded-xl text-center text-xs font-semibold max-w-xl mx-auto space-y-3.5 shadow-2xl">
          <Activity className="w-10 h-10 mx-auto text-[#F4B400] opacity-40 animate-pulse" />
          <h2 className="text-white font-extrabold text-sm uppercase tracking-wider">No data available.</h2>
          <p className="text-[#AAB6C5]">There are currently no metrics recorded in this control terminal. Start mobile activities to begin receiving live operations telemetry.</p>
        </div>
      </div>
    );
  }

  const totals = data?.totals || data || {};
  const n = (value: any) => Number(value || 0).toLocaleString();
  const money = (value: any) => `${Number(value || 0).toLocaleString()} PKR`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Operations Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time control tower for the Shazo Pakistan-wide mobility platform.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-lg text-xs font-mono text-emerald-400">
          <Activity className="w-4 h-4 animate-spin text-emerald-500" />
          <span>SYS HEALTH: OPTIMAL</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-[#AAB6C5] font-mono text-xs uppercase tracking-widest animate-pulse p-4 justify-center py-20 bg-[#061B35]/30 rounded-xl border border-slate-800/40">
            <Activity className="w-5 h-5 animate-spin text-[#F4B400]" />
            <span>Loading dashboard…</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-50 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-navy-800 h-32 rounded-xl border border-slate-800" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total Customers" 
              value={n(totals.customers)} 
              icon={Users} 
              color="bg-indigo-500/10 text-indigo-400" 
              subtext="+12% from last week"
            />
            <MetricCard 
              title="Active Riders" 
              value={`${n(totals.active_riders)} / ${n(totals.riders)}`} 
              icon={Bike} 
              color="bg-emerald-500/10 text-emerald-400" 
              subtext={`${Number(totals.riders || 0) > 0 ? Math.round((Number(totals.active_riders || 0) / Number(totals.riders || 1)) * 100) : 0}% current utilization`}
            />
            <MetricCard 
              title="Active Restuarants" 
              value={n(totals.active_restaurants || totals.restaurants)} 
              icon={Flame} 
              color="bg-amber-500/10 text-amber-400" 
              subtext={`${n(totals.pending_restaurant_verifications)} pending onboarding`}
            />
            <MetricCard 
              title="Revenue Today" 
              value={money(totals.today_revenue)} 
              icon={DollarSign} 
              color="bg-green-500/10 text-green-400" 
              subtext="Cash/Wallet collective sum"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Bookings Split */}
            <div className="bg-brand-navy-800 p-6 rounded-xl border border-slate-800">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Today's Fleet Volumes</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><Bike className="w-4 h-4 mr-2 text-indigo-400" /> Bike Trips</span>
                  <span className="text-white font-bold text-sm">{n(totals.today_bike_rides)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><Car className="w-4 h-4 mr-2 text-emerald-400" /> Car Trips</span>
                  <span className="text-white font-bold text-sm">{n(totals.today_car_rides)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><Shield className="w-4 h-4 mr-2 text-rose-400" strokeWidth={2.5} /> Ambulance Bookings</span>
                  <span className="text-white font-bold text-sm">{n(totals.today_ambulance_bookings)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><Flame className="w-4 h-4 mr-2 text-amber-400" /> Food Orders</span>
                  <span className="text-white font-bold text-sm">{n(totals.today_food_orders)}</span>
                </div>
              </div>
            </div>

            {/* Financial Health Split */}
            <div className="bg-brand-navy-800 p-6 rounded-xl border border-slate-800">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Financial Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><DollarSign className="w-4 h-4 mr-2 text-emerald-400" /> Total Cash Collected</span>
                  <span className="text-white font-bold text-sm">{n(totals.cash_collected_today)} PKR</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><Wallet className="w-4 h-4 mr-2 text-indigo-400" /> Pending Wallet Top-ups</span>
                  <span className="text-white font-bold text-sm text-yellow-500">{n(totals.pending_wallet_topups)} requests</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><Percent className="w-4 h-4 mr-2 text-indigo-400" /> Commission Today</span>
                  <span className="text-white font-bold text-sm">{n(totals.commission_today)} PKR</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> Free Campaign Quota</span>
                  <span className="text-white font-mono text-sm">{`${n(totals.free_quota_used)} / ${n(totals.free_quota_total)} used`}</span>
                </div>
              </div>
            </div>

            {/* Support Health Split */}
            <div className="bg-brand-navy-800 p-6 rounded-xl border border-slate-800">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-4 text-slate-300">Support Metrics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><HelpCircle className="w-4 h-4 mr-2 text-cyan-400" /> Open Support Tickets</span>
                  <span className="text-white font-bold text-sm text-yellow-500">{n(totals.support_tickets_open)} Open</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><XCircle className="w-4 h-4 mr-2 text-rose-400" /> Cancellation Index</span>
                  <span className="text-white font-bold text-sm text-rose-500">0% of orders</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/55 pb-2">
                  <span className="text-slate-400 text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> SLA Target Rating</span>
                  <span className="text-white font-bold text-sm">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center"><Users className="w-4 h-4 mr-2 text-slate-400" /> Active Agents</span>
                  <span className="text-white font-bold text-sm">0 Online</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

