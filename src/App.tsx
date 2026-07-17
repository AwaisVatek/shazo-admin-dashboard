import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShazoLogo } from './components/ShazoLogo';
import { DashboardOverview } from './components/DashboardOverview';
import { LiveDispatch } from './components/LiveDispatch';
import { CustomersList } from './components/CustomersList';
import { RidersList } from './components/RidersList';
import { RestaurantsList } from './components/RestaurantsList';
import { RidesList } from './components/RidesList';
import { AmbulanceBookings } from './components/AmbulanceBookings';
import { FoodOrders } from './components/FoodOrders';
import { FinanceModule } from './components/FinanceModule';
import { SettingsManualPayments } from './components/SettingsManualPayments';
import { SettingsFares } from './components/SettingsFares';
import { SettingsCommissions } from './components/SettingsCommissions';
import { PromoCampaigns } from './components/PromoCampaigns';
import { ZoneManagement } from './components/ZoneManagement';
import { SupportCenter } from './components/SupportCenter';
import { SafetyReports } from './components/SafetyReports';
import { NotificationCenter } from './components/NotificationCenter';
import { SystemHealth } from './components/SystemHealth';
import { AdminUsers } from './components/AdminUsers';
import { AppSettings } from './components/AppSettings';

import { 
  Users, Bike, Flame, Car, Shield, ShieldAlert, Percent, Gift, 
  MapPin, Settings, Key, HelpCircle, Activity, Bell, Lock, 
  ChevronRight, LogOut, CheckCircle, Smartphone, User, Menu, X, Landmark, Layers, Utensils
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Layout states
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Authenticate session check
  useEffect(() => {
    const checkAuth = () => {
      const token = api.getToken();
      const currUser = api.getCurrentUser();
      if (token && currUser) {
        setIsAuthenticated(true);
        setUserRole(currUser.role || 'admin');
        setUserProfile(currUser);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
        if (localStorage.getItem("shazo_session_expired") === "true") {
          setLoginError("Session expired. Please sign in again.");
          localStorage.removeItem("shazo_session_expired");
        }
      }
    };

    checkAuth();
    window.addEventListener("shazo_auth_change", checkAuth);
    return () => {
      window.removeEventListener("shazo_auth_change", checkAuth);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      // Connect to the real backend login endpoint
      const response = await api.post('/api/auth/email/login', { email, password });
      
      let token: string | null = null;
      let userRaw: any = null;

      if (response) {
        // Extraction of token
        if (response.data) {
          token = response.data.token || response.data.accessToken || response.data.jwt || null;
        }
        if (!token) {
          token = response.token || response.accessToken || response.jwt || null;
        }

        // Extraction of user
        if (response.data) {
          userRaw = response.data.user || response.data.admin || null;
        }
        if (!userRaw) {
          userRaw = response.user || response.admin || null;
        }
      }

      if (!token) {
        setLoginError("Login succeeded but no token was returned by backend.");
        return;
      }

      // Safe user object creation
      let user: any = null;
      if (userRaw) {
        user = {
          id: userRaw.id || userRaw._id || "admin",
          email: userRaw.email || email || "admin@shazoride.com",
          name: userRaw.name || userRaw.fullName || userRaw.full_name || "System Administrator",
          role: userRaw.role || "admin"
        };
      } else {
        user = {
          id: "admin",
          email: email || "admin@shazoride.com",
          name: "System Administrator",
          role: "admin"
        };
      }

      // Safe Console Diagnostics
      console.info("[Shazo Admin] Login response normalized", {
        hasToken: Boolean(token),
        userEmail: user?.email,
        userRole: user?.role
      });

      // Save to localStorage using correct keys
      api.setToken(token);
      api.setCurrentUser(user);

      setUserProfile(user);
      setUserRole(user.role || 'admin');
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // Roles access checker: hides/shows admin segments depending on security clearances requested
  const hasAccess = (tabId: string): boolean => {
    if (userRole === 'admin') return true;
    
    // Group permissions checks
    const opsTabs = ['overview', 'dispatch', 'customers', 'riders', 'restaurants', 'rides', 'ambulance', 'food_orders', 'support', 'safety', 'health'];
    const financeTabs = ['overview', 'finance', 'manual_payments', 'commissions'];
    const supportTabs = ['overview', 'customers', 'support', 'safety'];

    if (userRole === 'operations_manager') return opsTabs.includes(tabId);
    if (userRole === 'finance_admin') return financeTabs.includes(tabId);
    if (userRole === 'support_agent') return supportTabs.includes(tabId);

    return false;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020B18] flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Absolute branding graphics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 opacity-30 pointer-events-none">
          <ShazoLogo variant="square" tone="white" className="h-12" />
        </div>

        <div className="w-full max-w-md bg-[#061B35]/80 rounded-2xl border border-[#ffffff0c] p-8 shadow-2xl relative z-10 transition">
          <div className="text-center space-y-3 mb-8">
            <ShazoLogo variant="square" tone="coloured" className="h-24 mx-auto" purpose="login" />
            <h2 className="text-xl font-black text-white tracking-tight pt-1">Shazo Admin Dashboard</h2>
            <p className="text-[#AAB6C5] text-xs">Authorize credentials to access administrative dashboard.</p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs leading-relaxed mb-6 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-[#AAB6C5] uppercase tracking-widest text-[10px] block mb-1.5">Administrative Email Address</label>
              <input
                type="email"
                required
                placeholder="admin@shazoride.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#020B18]/70 border border-[#ffffff0c] py-3 px-3.5 rounded-xl text-white font-medium focus:outline-none focus:border-[#FFC107]/50 transition"
              />
            </div>

            <div>
              <label className="text-[#AAB6C5] uppercase tracking-widest text-[10px] block mb-1.5">Verification Passcode</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#020B18]/70 border border-[#ffffff0c] py-3 px-3.5 rounded-xl text-white font-medium focus:outline-none focus:border-[#FFC107]/50 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#FFC107] hover:bg-[#FFD54F] disabled:opacity-45 text-[#020B18] font-black tracking-widest uppercase text-xs rounded-xl py-3.5 mt-2 shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#020B18]" />
              <span>{loginLoading ? 'VERIFYING...' : 'SIGN IN'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#020B18] flex text-slate-100 font-sans tracking-wide">
      {/* 1. STRUCTURAL SIDEBAR WITH EXPANDABLE MENU BLOCKS */}
      <aside className={`bg-[#061B35] border-r border-[#ffffff0c] shrink-0 select-none flex flex-col justify-between transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="flex flex-col">
          {/* Header brand logo section */}
          <div className="p-5 border-b border-[#ffffff0c] flex items-center justify-between">
            <ShazoLogo variant={sidebarOpen ? 'horizontal' : 'icon'} tone="white" className="h-8" purpose={sidebarOpen ? "sidebar" : "icon"} />
            {sidebarOpen && (
              <span className="text-[9px] font-bold text-[#FFC107] bg-[#FFC107]/10 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest font-bold">
                ADMIN
              </span>
            )}
          </div>

          {/* User Role Card */}
          {sidebarOpen && userProfile && (() => {
            const displayName = userProfile.name || userProfile.full_name || userProfile.email || "System Administrator";
            const initials = String(displayName).split(' ').filter(Boolean).map((n:any)=>n[0]).join('').slice(0, 2).toUpperCase() || 'SA';
            return (
              <div className="p-4 mx-4 mt-4 bg-[#0B2A4A]/50 border border-[#ffffff0c] rounded-xl flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#020B18] flex items-center justify-center text-xs font-bold text-[#FFC107] border border-[#ffffff0f]">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <span className="text-white font-bold block text-xs truncate leading-none">{displayName}</span>
                  <span className="text-[9px] text-[#AAB6C5] uppercase font-bold tracking-wider block mt-1">{String(userRole || 'admin').replace('_', ' ')}</span>
                </div>
              </div>
            );
          })()}

          {/* Core Navigation Navigation Stack */}
          <nav className="p-4 space-y-6 overflow-y-auto pr-1 flex-1 max-h-[calc(100vh-220px)]">
            {/* Nav Group: Telemetry & Operations */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2.5 mb-1.5">Control Tower</span>}
              
              {hasAccess('overview') && (
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'overview' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Operations Control Center</span>}
                </button>
              )}

              {hasAccess('dispatch') && (
                <button
                   onClick={() => setActiveTab('dispatch')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'dispatch' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Live Dispatch</span>}
                </button>
              )}
            </div>

            {/* Nav Group: Registry books */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2.5 mb-1.5">Entity Registry</span>}
              
              {hasAccess('customers') && (
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'customers' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <User className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Customers</span>}
                </button>
              )}

              {hasAccess('riders') && (
                <button
                  onClick={() => setActiveTab('riders')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'riders' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Bike className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Riders & Drivers</span>}
                </button>
              )}

              {hasAccess('restaurants') && (
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'restaurants' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Flame className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Restaurants</span>}
                </button>
              )}

              {hasAccess('rides') && (
                <button
                  onClick={() => setActiveTab('rides')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'rides' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Car className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Trips & Deliveries</span>}
                </button>
              )}

              {hasAccess('ambulance') && (
                <button
                  onClick={() => setActiveTab('ambulance')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'ambulance' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-3 text-rose-500 shrink-0" />
                  {sidebarOpen && <span>Ambulances</span>}
                </button>
              )}

              {hasAccess('food_orders') && (
                <button
                  onClick={() => setActiveTab('food_orders')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'food_orders' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Utensils className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Food Orders</span>}
                </button>
              )}
            </div>

            {/* Nav Group: Accounting & Ledgers */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2.5 mb-1.5">accounting</span>}
              
              {hasAccess('finance') && (
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'finance' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Landmark className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Finance Hub</span>}
                </button>
              )}

              {hasAccess('manual_payments') && (
                <button
                  onClick={() => setActiveTab('manual_payments')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'manual_payments' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Landmark className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Manual Payment Verification</span>}
                </button>
              )}

              {hasAccess('commissions') && (
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'commissions' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Percent className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Commissions</span>}
                </button>
              )}
            </div>

            {/* Nav Group: Operations parameters settings */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2.5 mb-1.5">system config</span>}

              {hasAccess('fares') && (
                <button
                  onClick={() => setActiveTab('fares')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'fares' ? 'bg-[#FFC107] text-[#020B18] font-black text-left' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40 text-left'
                  }`}
                >
                  <Layers className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Fare Settings</span>}
                </button>
              )}

              {hasAccess('promo_campaigns') && (
                <button
                  onClick={() => setActiveTab('promo_campaigns')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'promo_campaigns' ? 'bg-[#FFC107] text-[#020B18] font-black text-left' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40 text-left'
                  }`}
                >
                  <Gift className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Promo & Free Ride Campaigns</span>}
                </button>
              )}

              {hasAccess('zones') && (
                <button
                  onClick={() => setActiveTab('zones')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'zones' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Operational Zones</span>}
                </button>
              )}

              {hasAccess('app_settings') && (
                <button
                  onClick={() => setActiveTab('app_settings')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'app_settings' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>App Maintenance Window</span>}
                </button>
              )}
            </div>

            {/* Nav Group: Platform support center & tickets */}
            <div className="space-y-1">
              {sidebarOpen && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2.5 mb-1.5">support desk</span>}

              {hasAccess('support') && (
                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'support' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Customer Support Tickets</span>}
                </button>
              )}

              {hasAccess('safety') && (
                <button
                  onClick={() => setActiveTab('safety')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'safety' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mr-3 text-rose-500 shrink-0" />
                  {sidebarOpen && <span>Emergency Reports</span>}
                </button>
              )}

              {hasAccess('notification_center') && (
                <button
                  onClick={() => setActiveTab('notification_center')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'notification_center' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Bell className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>System Notifications</span>}
                </button>
              )}

              {hasAccess('health') && (
                <button
                  onClick={() => setActiveTab('health')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'health' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>System Health Status</span>}
                </button>
              )}

              {hasAccess('admin_users') && (
                <button
                  onClick={() => setActiveTab('admin_users')}
                  className={`w-full flex items-center justify-start text-left px-2.5 py-2.2 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                    activeTab === 'admin_users' ? 'bg-[#FFC107] text-[#020B18] font-black' : 'text-[#AAB6C5] hover:text-white hover:bg-[#0B2A4A]/40'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-3 shrink-0" />
                  {sidebarOpen && <span>Staff Management</span>}
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Logout layout */}
        <div className="p-4 border-t border-[#ffffff0c]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start text-left px-2.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. CHIEF CONTENT DESK */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar navigation menu block */}
        <header className="bg-[#061B35] border-b border-[#ffffff0c] h-16 flex items-center justify-between px-6 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 border border-[#ffffff0c] rounded bg-[#020B18]/80 hover:bg-[#0B2A4A]/40 transition text-slate-400 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-slate-500 font-mono text-xs hidden md:inline">
              SECURE ADMIN SESSION • STATUS: ACTIVE
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-[#020B18] border border-[#ffffff0c] rounded-lg py-1 px-3 text-xs text-slate-300 font-bold uppercase tracking-wide flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFC107] mr-2 animate-pulse" />
              Karachi Operations
            </div>
          </div>
        </header>

        {/* Router Stage viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && hasAccess('overview') && <DashboardOverview />}
          {activeTab === 'dispatch' && hasAccess('dispatch') && <LiveDispatch />}
          {activeTab === 'customers' && hasAccess('customers') && <CustomersList />}
          {activeTab === 'riders' && hasAccess('riders') && <RidersList />}
          {activeTab === 'restaurants' && hasAccess('restaurants') && <RestaurantsList />}
          {activeTab === 'rides' && hasAccess('rides') && <RidesList />}
          {activeTab === 'ambulance' && hasAccess('ambulance') && <AmbulanceBookings />}
          {activeTab === 'food_orders' && hasAccess('food_orders') && <FoodOrders />}
          {activeTab === 'finance' && hasAccess('finance') && <FinanceModule />}
          {activeTab === 'manual_payments' && hasAccess('manual_payments') && <SettingsManualPayments />}
          {activeTab === 'commissions' && hasAccess('commissions') && <SettingsCommissions />}
          {activeTab === 'fares' && hasAccess('fares') && <SettingsFares />}
          {activeTab === 'promo_campaigns' && hasAccess('promo_campaigns') && <PromoCampaigns />}
          {activeTab === 'zones' && hasAccess('zones') && <ZoneManagement />}
          {activeTab === 'support' && hasAccess('support') && <SupportCenter />}
          {activeTab === 'safety' && hasAccess('safety') && <SafetyReports />}
          {activeTab === 'notification_center' && hasAccess('notification_center') && <NotificationCenter />}
          {activeTab === 'health' && hasAccess('health') && <SystemHealth />}
          {activeTab === 'admin_users' && hasAccess('admin_users') && <AdminUsers />}
          {activeTab === 'app_settings' && hasAccess('app_settings') && <AppSettings />}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  );
}
