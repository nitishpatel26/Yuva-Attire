import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  User, Package, MapPin, Crown, Phone, Mail, Clock, 
  Truck, CheckCircle2, ChevronRight, ShieldCheck, ShoppingBag, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserProfilePage() {
  const { user, isAuthenticated, isVip, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders';
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please Sign In to Access Your Profile</h2>
        <p className="text-xs text-slate-400">Track orders, manage addresses & enjoy VIP club privileges.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-2xl bg-brand-pink text-white font-bold text-xs">
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Profile Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-pink via-brand-coral to-brand-yellow text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-brand-pink/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
              {isVip && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-amber-700" /> VIP MEMBER (15% OFF)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* VIP Status or Upgrade */}
        <div className="flex items-center gap-3">
          <Link
            to="/vip-club"
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition shadow-sm ${
              isVip
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:opacity-90'
            }`}
          >
            <Crown className="w-4 h-4 fill-slate-900" />
            <span>{isVip ? 'VIP Club Active' : 'Join VIP Club (₹1,000/yr)'}</span>
          </Link>

          <button
            onClick={logout}
            className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:text-rose-600 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={`pb-3 text-xs font-black flex items-center gap-2 transition border-b-2 ${
            activeTab === 'orders'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders & Tracking ({orders.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'addresses' })}
          className={`pb-3 text-xs font-black flex items-center gap-2 transition border-b-2 ${
            activeTab === 'addresses'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-slate-400 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <p className="text-3xl">📦</p>
              <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-400">Discover joyful kids dresses, party suits & toys!</p>
              <Link to="/shop" className="mt-4 inline-block px-6 py-2.5 rounded-2xl bg-brand-pink text-white text-xs font-bold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order No</span>
                      <p className="text-sm font-black text-slate-900 font-mono">{order.orderNumber}</p>
                      <p className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                      <span className="text-sm font-black text-brand-pink">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <Truck className="w-4 h-4 text-brand-pink" />
                      <span>Delivery Partner: Delhivery</span>
                    </div>
                    <span className="font-mono text-slate-700 font-bold">{order.trackingNumber}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-xl border" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                        <span className="font-black text-slate-800">₹{item.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab Content */}
      {activeTab === 'addresses' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800">Saved Delivery Addresses</h3>
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-slate-800">{addr.name}</p>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-md bg-brand-pink/10 text-brand-pink text-[10px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{addr.street}</p>
                  <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-slate-400 mt-1">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Addresses saved during checkout will appear here.</p>
          )}
        </div>
      )}
    </div>
  );
}
