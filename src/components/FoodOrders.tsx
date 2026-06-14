import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Flame, Utensils, User, MapPin, DollarSign, 
  HelpCircle, Eye, CheckCircle2, AlertCircle, ShoppingBag 
} from 'lucide-react';

interface FoodOrder {
  id: string;
  restaurantName: string;
  customerName: string;
  riderName: string;
  itemsSummary: string;
  status: 'received' | 'preparing' | 'picked_up' | 'delivered' | 'cancelled';
  subtotal: number;
  deliveryFee: number;
  orderTotal: number;
  paymentMethod: 'cash' | 'wallet';
  timestamp: string;
}

export const FoodOrders: React.FC = () => {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<FoodOrder | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const data = await api.get('/api/admin/food-orders');
      if (data && data.length > 0) {
        const mappedData = data.map((item: any) => ({
          id: item.id || '-',
          restaurantName: item.restaurant_name || item.restaurant?.name || item.restaurant || '-',
          customerName: item.customer_name || item.customer?.full_name || item.customer || item.full_name || '-',
          riderName: item.rider_name || item.driver_name || item.rider?.full_name || item.rider || '-',
          itemsSummary: item.items_summary || (Array.isArray(item.items) ? `${item.items.length} items` : (typeof item.items === 'string' ? item.items : '-')),
          status: item.status || 'received',
          subtotal: Number(item.subtotal || item.total_amount || 0),
          deliveryFee: Number(item.delivery_fee || item.fee || 0),
          orderTotal: Number(item.order_total || item.total_amount || item.total_fare || 0),
          paymentMethod: item.payment_method || item.payment_type || 'cash',
          timestamp: item.timestamp || (item.created_at ? new Date(item.created_at).toLocaleString() : '-')
        }));
        setOrders(mappedData);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setOrders([]);
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
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: 'preparing' | 'picked_up' | 'delivered') => {
    try {
      await api.patch(`/api/orders/food/${orderId}`, { status });
      loadOrders();
    } catch (err: any) {
      if (err.status === 404 || err.message === 'NOT_IMPLEMENTED') {
        setErrorStatus('Backend endpoint not implemented yet.');
      } else {
        setErrorStatus('Unable to save changes to backend.');
      }
      setTimeout(() => setErrorStatus(null), 3000);
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Food Delivery Operations</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor restaurant preparation status, dispatch delivery riders, and cross-audit customer ticket totals.</p>
        </div>
      </div>

      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-semibold">
          {errorStatus}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/40 pb-3">
        {['all', 'received', 'preparing', 'picked_up', 'delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              filter === f 
                ? 'bg-emerald-500 text-brand-navy-950 font-black' 
                : 'text-slate-400 bg-slate-900/40 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-brand-navy-800 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-905 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Order Code</th>
                <th className="px-6 py-4">Restaurant Brand</th>
                <th className="px-6 py-4">Delicate Items</th>
                <th className="px-6 py-4 text-center">Total Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs text-slate-500">
                    No data available.
                  </td>
                </tr>
              ) :
                filtered.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4 font-mono text-xs text-white">
                    {ord.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-semibold block">{ord.restaurantName}</span>
                    <span className="text-xs text-slate-500 mt-1 block">Cust: {ord.customerName}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {ord.itemsSummary}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold font-mono text-white">
                    {ord.orderTotal} PKR
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(ord)}
                      className="text-slate-405 hover:text-white hover:bg-slate-800 p-1.5 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Detail Auditing Pane */}
        <div className="bg-brand-navy-800 rounded-xl border border-slate-800 p-6 space-y-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider text-slate-400">Order Dispatch Card</h2>
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs text-slate-500 font-mono block">{selectedOrder.id}</span>
                <h3 className="text-base font-bold text-white mt-1">{selectedOrder.restaurantName}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-2 ${
                  selectedOrder.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-yellow-500'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase text-slate-400 block">Pricing Details</span>
                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span>{selectedOrder.subtotal} PKR</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/65 pb-2">
                    <span>Delivery Courier Fee</span>
                    <span>{selectedOrder.deliveryFee} PKR</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1">
                    <span>Total Bill (Cash COD)</span>
                    <span className="text-emerald-400 font-mono">{selectedOrder.orderTotal} PKR</span>
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'received' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider"
                >
                  Authorize Food Prep
                </button>
              )}

              {selectedOrder.status === 'preparing' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'picked_up')}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider"
                >
                  Allocate Dispatch Rider
                </button>
              )}

              {selectedOrder.status === 'picked_up' && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-brand-navy-950 font-black py-2.5 rounded-lg text-xs transition uppercase tracking-wider"
                >
                  Mark Rider Delivered
                </button>
              )}

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-500 block uppercase tracking-wide text-[9px] mb-1">Rider Information</span>
                <span className="text-white font-semibold">{selectedOrder.riderName}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-4 text-slate-500">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-xs">Select any food ticket form the active registry above to inspect cooking progress or change courier assignments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

