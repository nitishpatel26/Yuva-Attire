import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, CreditCard, Crown, 
  AlertTriangle, PlusCircle, Edit3, Trash2, CheckCircle2, XCircle, 
  Search, RefreshCw, Eye, ArrowUpRight, TrendingUp, ShieldCheck, 
  Lock, LogIn, ChevronDown, Filter, Sparkles, Layers, X, Plus, Minus, Tag, 
  MessageSquare, Star, Check, ThumbsUp, UserCheck, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  // Admin Login state if not logged in as admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin View
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'create_product' | 'inventory' | 'orders' | 'payments' | 'vip_members' | 'reviews'

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [vipMembersList, setVipMembersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coupons State
  const [couponSearchQuery, setCouponSearchQuery] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 10,
    minOrder: 499,
    maxDiscount: 500,
    description: '',
    expiryDate: '',
    isActive: true
  });
  const [couponActionMessage, setCouponActionMessage] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // VIP Configuration State
  const [vipConfigForm, setVipConfigForm] = useState({
    price: 1000,
    discountPercentage: 15,
    durationDays: 365,
    durationLabel: '1 Year (365 Days)',
    benefits: [
      'Flat Extra 15% OFF on every single order (No upper limit)',
      'Free Express Shipping with zero minimum order value',
      'Early 24-Hour VIP Access to Mega Sales & Festive Drops',
      'Special ₹500 Birthday Gift Voucher for your child',
      'Dedicated 24/7 Priority Parent Support & Quick Exchanges'
    ],
    isActive: true
  });
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [vipConfigSuccess, setVipConfigSuccess] = useState('');
  const [vipConfigError, setVipConfigError] = useState('');
  const [isSavingVipConfig, setIsSavingVipConfig] = useState(false);

  // Users Filter & Search
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userVipFilter, setUserVipFilter] = useState('ALL');
  const [userActionMessage, setUserActionMessage] = useState('');

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Order Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Reviews Filter
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');

  // Create Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('clothing');
  const [newSubCategory, setNewSubCategory] = useState('dresses');
  const [newGender, setNewGender] = useState('girls');
  const [newAgeGroup, setNewAgeGroup] = useState('2-4Y');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscountPrice, setNewDiscountPrice] = useState('');
  const [newImages, setNewImages] = useState('https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80');
  const [newSizes, setNewSizes] = useState([
    { size: '2-3Y', stock: 10 },
    { size: '3-4Y', stock: 8 },
    { size: '4-5Y', stock: 6 }
  ]);
  const [newFabric, setNewFabric] = useState('100% Breathable Organic Cotton');
  const [newCare, setNewCare] = useState('Gentle hand wash in cold water');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    category: 'clothing',
    subCategory: 'dresses',
    gender: 'girls',
    ageGroup: '2-4Y',
    price: '',
    discountPrice: '',
    imagesText: '',
    sizes: [],
    fabric: '',
    careInstructions: '',
    isSoldOut: false,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  });
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('yuva_token');
    if (!token) return;

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, prodRes, ordRes, payRes, vipRes, revRes, usersRes, vipConfigRes, cpnRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/products', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/payment/transactions', { headers }),
        fetch('/api/vip/members', { headers }),
        fetch('/api/admin/reviews', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/vip/config', { headers }),
        fetch('/api/coupons', { headers })
      ]);

      const [dashData, prodData, ordData, payData, vipData, revData, usersData, vipConfigData, cpnData] = await Promise.all([
        dashRes.json(),
        prodRes.json(),
        ordRes.json(),
        payRes.json(),
        vipRes.json(),
        revRes.json(),
        usersRes.json(),
        vipConfigRes.json(),
        cpnRes.json()
      ]);

      if (dashData.success) setDashboardData(dashData);
      if (prodData.success) setProductsList(prodData.products || []);
      if (ordData.success) setOrdersList(ordData.orders || []);
      if (payData.success) setPaymentsList(payData.transactions || []);
      if (vipData.success) setVipMembersList(vipData.members || []);
      if (revData.success) setReviewsList(revData.reviews || []);
      if (usersData.success) setUsersList(usersData.users || []);
      if (vipConfigData.success && vipConfigData.vipConfig) setVipConfigForm(vipConfigData.vipConfig);
      if (cpnData.success) setCouponsList(cpnData.coupons || []);
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Save VIP Club Config (Price, Discount %, Duration & Benefits)
  const handleSaveVipConfig = async (e) => {
    e.preventDefault();
    setIsSavingVipConfig(true);
    setVipConfigSuccess('');
    setVipConfigError('');

    try {
      const res = await fetch('/api/vip/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify(vipConfigForm)
      });
      const data = await res.json();
      setIsSavingVipConfig(false);

      if (data.success) {
        setVipConfigSuccess('✅ VIP Club price, discount, duration & benefits updated successfully!');
        setVipConfigForm(data.vipConfig);
        setTimeout(() => setVipConfigSuccess(''), 4000);
      } else {
        setVipConfigError(data.message || 'Failed to update VIP configuration');
      }
    } catch (err) {
      setIsSavingVipConfig(false);
      setVipConfigError(err.message || 'Error updating VIP configuration');
    }
  };

  // Handler: Add a benefit bullet to VIP config
  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setVipConfigForm((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), newBenefitInput.trim()]
    }));
    setNewBenefitInput('');
  };

  // Handler: Remove benefit bullet
  const handleRemoveBenefit = (index) => {
    setVipConfigForm((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  // Handler: Toggle Make/Revoke User VIP
  const handleToggleUserVip = async (userId, isVip, durationDays = 365) => {
    setUserActionMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/vip`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({ isVip, durationDays })
      });
      const data = await res.json();
      if (data.success) {
        setUserActionMessage(data.message);
        fetchAdminData();
        setTimeout(() => setUserActionMessage(''), 4000);
      } else {
        alert(data.message || 'Failed to update user VIP status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user VIP status');
    }
  };

  // Coupon Handlers
  const handleOpenCreateCouponModal = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discountPercent: 10,
      minOrder: 499,
      maxDiscount: 500,
      description: '',
      expiryDate: '',
      isActive: true
    });
    setCouponError('');
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCouponModal = (cpn) => {
    setEditingCoupon(cpn);
    setCouponForm({
      code: cpn.code || '',
      discountPercent: cpn.discountPercent || 10,
      minOrder: cpn.minOrder || 0,
      maxDiscount: cpn.maxDiscount || 0,
      description: cpn.description || '',
      expiryDate: cpn.expiryDate ? cpn.expiryDate.split('T')[0] : '',
      isActive: cpn.isActive !== false
    });
    setCouponError('');
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setIsSavingCoupon(true);
    setCouponError('');

    try {
      const url = editingCoupon
        ? `/api/coupons/${editingCoupon.id || editingCoupon.code}`
        : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify(couponForm)
      });
      const data = await res.json();
      setIsSavingCoupon(false);

      if (data.success) {
        setIsCouponModalOpen(false);
        setCouponActionMessage(data.message || 'Coupon saved successfully');
        setTimeout(() => setCouponActionMessage(''), 4000);
        fetchAdminData();
      } else {
        setCouponError(data.message || 'Failed to save coupon');
      }
    } catch (err) {
      setIsSavingCoupon(false);
      setCouponError(err.message || 'Failed to save coupon');
    }
  };

  const handleToggleCouponStatus = async (couponId) => {
    try {
      const res = await fetch(`/api/coupons/${couponId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCouponActionMessage(data.message);
        setTimeout(() => setCouponActionMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;

    try {
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCouponActionMessage(data.message);
        setTimeout(() => setCouponActionMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const res = await login(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.message || 'Invalid admin credentials');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!newTitle || !newPrice) {
      return setFormError('Title and price are required');
    }

    const imagesArray = newImages
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          subCategory: newSubCategory,
          gender: newGender,
          ageGroup: newAgeGroup,
          price: Number(newPrice),
          discountPrice: newDiscountPrice ? Number(newDiscountPrice) : Number(newPrice),
          images: imagesArray.length > 0 ? imagesArray : [
            'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
          ],
          sizes: newSizes,
          fabric: newFabric,
          careInstructions: newCare,
          isNewArrival: true,
          isFeatured: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess('✨ New kids product listed successfully in store!');
        setNewTitle('');
        setNewDesc('');
        setNewPrice('');
        setNewDiscountPrice('');
        fetchAdminData();
        setTimeout(() => setActiveTab('products'), 1200);
      } else {
        setFormError(data.message || 'Failed to list product');
      }
    } catch (err) {
      setFormError(err.message || 'Creation error');
    }
  };

  // Open Edit Product Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditSuccess('');
    setEditError('');
    setEditFormData({
      id: product.id,
      title: product.title || '',
      description: product.description || '',
      category: product.category || 'clothing',
      subCategory: product.subCategory || 'dresses',
      gender: product.gender || 'girls',
      ageGroup: product.ageGroup || '2-4Y',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      imagesText: (product.images || []).join('\n'),
      sizes: (product.sizes || []).map((s) => ({
        size: s.size,
        stock: s.stock,
        price: s.price !== undefined ? s.price : (product.price || ''),
        discountPrice: s.discountPrice !== undefined ? s.discountPrice : (product.discountPrice || '')
      })),
      fabric: product.fabric || '',
      careInstructions: product.careInstructions || '',
      isSoldOut: !!product.isSoldOut,
      isFeatured: !!product.isFeatured,
      isBestSeller: !!product.isBestSeller,
      isNewArrival: !!product.isNewArrival
    });
  };

  // Save Edited Product
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.id) return;
    setEditError('');
    setEditSuccess('');
    setIsSavingEdit(true);

    const imagesArray = editFormData.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/products/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description,
          category: editFormData.category,
          subCategory: editFormData.subCategory,
          gender: editFormData.gender,
          ageGroup: editFormData.ageGroup,
          price: Number(editFormData.price),
          discountPrice: editFormData.discountPrice ? Number(editFormData.discountPrice) : Number(editFormData.price),
          images: imagesArray.length > 0 ? imagesArray : [
            'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
          ],
          sizes: editFormData.sizes,
          fabric: editFormData.fabric,
          careInstructions: editFormData.careInstructions,
          isSoldOut: editFormData.isSoldOut,
          isFeatured: editFormData.isFeatured,
          isBestSeller: editFormData.isBestSeller,
          isNewArrival: editFormData.isNewArrival
        })
      });

      const data = await res.json();
      setIsSavingEdit(false);

      if (data.success) {
        setEditSuccess('✅ Product updated successfully!');
        fetchAdminData();
        setTimeout(() => {
          setEditingProduct(null);
        }, 1000);
      } else {
        setEditError(data.message || 'Failed to update product');
      }
    } catch (err) {
      setIsSavingEdit(false);
      setEditError(err.message || 'Update error');
    }
  };

  const handleToggleSoldOut = async (product) => {
    const newStatus = !product.isSoldOut;
    try {
      const res = await fetch(`/api/products/${product.id}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({ isSoldOut: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStock = async (product, addAmount) => {
    try {
      const res = await fetch(`/api/products/${product.id}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({ addStock: addAmount, isSoldOut: false })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Review Status Handler (Approve / Reject)
  const handleUpdateReviewStatus = async (reviewId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('yuva_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Review Handler
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('yuva_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // If NOT ADMIN, show Admin Login Form
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <Logo size="lg" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Yuva Attire Store Manager</h1>
            <p className="text-xs text-slate-400">Sign in with administrator credentials to manage products, inventory & orders</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                required
                placeholder="Enter admin email address"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-purple"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-purple"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Logo size="md" className="bg-white/10 p-1.5 rounded-2xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Yuva Attire Control Center</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Manage products, edit details, customer reviews, inventory, orders & payment logs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white font-bold text-xs transition"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
          { id: 'products', label: `Products (${productsList.length})`, icon: ShoppingBag },
          { id: 'create_product', label: 'Add New Product', icon: PlusCircle, highlight: true },
          { id: 'inventory', label: 'Inventory & Stock', icon: Layers },
          { id: 'orders', label: `Orders (${ordersList.length})`, icon: Package },
          { id: 'coupons', label: `Coupons (${couponsList.length})`, icon: Tag, highlight: true },
          { id: 'reviews', label: `Reviews (${reviewsList.length})`, icon: MessageSquare },
          { id: 'vip_config', label: 'VIP Club Settings', icon: Crown, highlight: true },
          { id: 'users', label: `Users & VIP (${usersList.length})`, icon: UserCheck },
          { id: 'payments', label: `Payments (${paymentsList.length})`, icon: CreditCard },
          { id: 'vip_members', label: `VIP Members (${vipMembersList.length})`, icon: Crown }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs font-black flex items-center gap-2 whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{kpis.totalRevenue?.toLocaleString('en-IN') || 0}
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">Orders + VIP Subscriptions</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.totalOrders || 0}</div>
              <p className="text-[11px] text-slate-500 font-bold">{kpis.paidOrders || 0} Paid via Razorpay/COD</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.totalProducts || 0}</div>
              <p className="text-[11px] text-brand-pink font-bold">{kpis.soldOutCount || 0} Sold-out items</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Reviews</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-1.5">
                <Star className="w-6 h-6 fill-amber-500" />
                <span>{reviewsList.length}</span>
              </div>
              <p className="text-[11px] text-amber-700 font-bold">Approved & Moderated</p>
            </div>
          </div>

          {/* Sold Out & Low Stock Alerts */}
          {(dashboardData?.inventoryAlerts?.soldOutProducts?.length > 0 || dashboardData?.inventoryAlerts?.lowStockProducts?.length > 0) && (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Inventory & Sold-Out Alerts</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Sold out list */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 space-y-2">
                  <h4 className="font-bold text-rose-600 uppercase tracking-wider">Sold Out Items ({dashboardData.inventoryAlerts.soldOutProducts.length})</h4>
                  {dashboardData.inventoryAlerts.soldOutProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                      <span className="font-bold text-slate-800">{p.title}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleAddStock(p, 10)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px]"
                        >
                          + Add 10 Stock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Low stock list */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 space-y-2">
                  <h4 className="font-bold text-amber-700 uppercase tracking-wider">Low Stock (&lt; 10 units)</h4>
                  {dashboardData.inventoryAlerts.lowStockProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                      <span className="font-bold text-slate-800">{p.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">{p.totalStock} left</span>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders Preview */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800">Recent Customer Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Order No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {dashboardData?.recentOrders?.map((ord) => (
                    <tr key={ord.id}>
                      <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="p-3">{ord.customerName}</td>
                      <td className="p-3">{ord.items?.length} items</td>
                      <td className="p-3 font-bold text-brand-pink">₹{ord.totalAmount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT WITH FULL EDIT FEATURE */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm w-full">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by title, SKU, tags..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-white"
              >
                <option value="all">All Categories</option>
                <option value="clothing">Kids Clothing</option>
                <option value="shoes">Footwear</option>
                <option value="toys">Toys</option>
                <option value="accessories">Accessories</option>
              </select>

              <button
                onClick={() => setActiveTab('create_product')}
                className="px-4 py-2.5 rounded-2xl bg-brand-pink text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-pink/20"
              >
                <PlusCircle className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category / Age</th>
                    <th className="p-4">Price / Discount</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {productsList
                    .filter((p) => {
                      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
                      if (productSearch) {
                        const q = productSearch.toLowerCase();
                        return p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-xl border shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 max-w-xs truncate">{p.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                              <div className="flex gap-1 mt-1">
                                {p.isFeatured && <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">Featured</span>}
                                {p.isBestSeller && <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">Bestseller</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize">{p.gender} • {p.category}</span>
                          <span className="block text-[10px] text-slate-400">{p.ageGroup}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900">₹{p.discountPrice || p.price}</span>
                          {p.discountPrice && p.discountPrice < p.price && (
                            <span className="text-[10px] text-slate-400 line-through block">₹{p.price} ({p.discountPercentage}% OFF)</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{p.rating || '5.0'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({p.reviewsCount || 0})</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {p.isSoldOut || p.totalStock === 0 ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                              SOLD OUT
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              {p.totalStock} in stock
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {/* EDIT PRODUCT BUTTON */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition"
                            title="Edit Product Details, Price, Images & Stock"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleToggleSoldOut(p)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            title={p.isSoldOut ? 'Mark In Stock' : 'Mark Sold Out'}
                          >
                            {p.isSoldOut ? 'Restock' : 'Sold Out'}
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL DIALOG */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-pink/20 text-brand-pink flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Edit Product: {editingProduct.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">SKU: {editingProduct.sku} • ID: {editingProduct.id}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {editSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 font-bold border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{editError}</span>
                </div>
              )}

              <form id="editProductForm" onSubmit={handleSaveEdit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 font-bold text-xs focus:ring-2 focus:ring-brand-pink"
                  />
                </div>

                {/* Categorization & Gender */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="shoes">Shoes</option>
                      <option value="toys">Toys</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                    >
                      <option value="girls">Girls</option>
                      <option value="boys">Boys</option>
                      <option value="infants">Infants</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age Group</label>
                    <select
                      value={editFormData.ageGroup}
                      onChange={(e) => setEditFormData({ ...editFormData, ageGroup: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                    >
                      <option value="0-24M">0-24M</option>
                      <option value="2-4Y">2-4Y</option>
                      <option value="4-8Y">4-8Y</option>
                      <option value="8-12Y">8-12Y</option>
                      <option value="12-16Y">12-16Y</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sub-Category</label>
                    <input
                      type="text"
                      value={editFormData.subCategory}
                      onChange={(e) => setEditFormData({ ...editFormData, subCategory: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {/* Pricing & Sale Discount */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Original Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Discounted Sale Price (₹)</label>
                    <input
                      type="number"
                      value={editFormData.discountPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, discountPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-brand-pink"
                    />
                  </div>
                </div>

                {/* Size-wise stock editor */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">Sizes & Stock Inventory:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData({
                          ...editFormData,
                          sizes: [
                            ...editFormData.sizes,
                            {
                              size: 'New Size',
                              stock: 10,
                              price: editFormData.price || '',
                              discountPrice: editFormData.discountPrice || ''
                            }
                          ]
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Size with Price
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editFormData.sizes?.map((s, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex-1 min-w-[110px]">
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Size / Age</label>
                          <input
                            type="text"
                            value={s.size}
                            onChange={(e) => {
                              const updated = [...editFormData.sizes];
                              updated[idx].size = e.target.value;
                              setEditFormData({ ...editFormData, sizes: updated });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold"
                            placeholder="e.g. 2-3Y"
                          />
                        </div>

                        <div className="w-20">
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Stock</label>
                          <input
                            type="number"
                            value={s.stock}
                            onChange={(e) => {
                              const updated = [...editFormData.sizes];
                              updated[idx].stock = Number(e.target.value) || 0;
                              setEditFormData({ ...editFormData, sizes: updated });
                            }}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center"
                          />
                        </div>

                        <div className="w-28">
                          <label className="text-[10px] text-slate-400 font-bold block mb-0.5">MRP Price (₹)</label>
                          <input
                            type="number"
                            value={s.price !== undefined ? s.price : ''}
                            placeholder={editFormData.price || 'Base MRP'}
                            onChange={(e) => {
                              const updated = [...editFormData.sizes];
                              updated[idx].price = e.target.value;
                              setEditFormData({ ...editFormData, sizes: updated });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                          />
                        </div>

                        <div className="w-28">
                          <label className="text-[10px] text-brand-pink font-bold block mb-0.5">Sale Price (₹)</label>
                          <input
                            type="number"
                            value={s.discountPrice !== undefined ? s.discountPrice : ''}
                            placeholder={editFormData.discountPrice || editFormData.price || 'Sale Price'}
                            onChange={(e) => {
                              const updated = [...editFormData.sizes];
                              updated[idx].discountPrice = e.target.value;
                              setEditFormData({ ...editFormData, sizes: updated });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-brand-pink"
                          />
                        </div>

                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editFormData.sizes.filter((_, i) => i !== idx);
                              setEditFormData({ ...editFormData, sizes: updated });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                            title="Remove Size"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URLs (One per line)</label>
                  <textarea
                    rows={2}
                    value={editFormData.imagesText}
                    onChange={(e) => setEditFormData({ ...editFormData, imagesText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                {/* Fabric & Care */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fabric / Material</label>
                    <input
                      type="text"
                      value={editFormData.fabric}
                      onChange={(e) => setEditFormData({ ...editFormData, fabric: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Wash Care</label>
                    <input
                      type="text"
                      value={editFormData.careInstructions}
                      onChange={(e) => setEditFormData({ ...editFormData, careInstructions: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                {/* Flags & Badges */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editFormData.isFeatured}
                      onChange={(e) => setEditFormData({ ...editFormData, isFeatured: e.target.checked })}
                      className="accent-brand-pink"
                    />
                    <span>Featured Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editFormData.isBestSeller}
                      onChange={(e) => setEditFormData({ ...editFormData, isBestSeller: e.target.checked })}
                      className="accent-brand-pink"
                    />
                    <span>Bestseller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editFormData.isNewArrival}
                      onChange={(e) => setEditFormData({ ...editFormData, isNewArrival: e.target.checked })}
                      className="accent-brand-pink"
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-600">
                    <input
                      type="checkbox"
                      checked={editFormData.isSoldOut}
                      onChange={(e) => setEditFormData({ ...editFormData, isSoldOut: e.target.checked })}
                      className="accent-rose-600"
                    />
                    <span>Mark as Sold Out</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="editProductForm"
                disabled={isSavingEdit}
                className="px-6 py-2.5 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-black text-xs shadow-md shadow-brand-pink/25 transition disabled:opacity-50"
              >
                {isSavingEdit ? 'Saving Changes...' : 'Save & Update Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE NEW PRODUCT LISTING */}
      {activeTab === 'create_product' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 animate-fadeIn">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Create New Kids Product Listing</h2>
            <p className="text-xs text-slate-400 mt-0.5">List dresses, footwear, or toys with images, prices, sizes & stock</p>
          </div>

          {formSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Shimmer Pastel Twirl Frock with Headband"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-pink"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 font-bold bg-white"
                >
                  <option value="clothing">Clothing</option>
                  <option value="shoes">Shoes</option>
                  <option value="toys">Toys</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 font-bold bg-white"
                >
                  <option value="girls">Girls</option>
                  <option value="boys">Boys</option>
                  <option value="infants">Infants</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Age Group *</label>
                <select
                  value={newAgeGroup}
                  onChange={(e) => setNewAgeGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 font-bold bg-white"
                >
                  <option value="0-24M">0-24M</option>
                  <option value="2-4Y">2-4Y</option>
                  <option value="4-8Y">4-8Y</option>
                  <option value="8-12Y">8-12Y</option>
                  <option value="12-16Y">12-16Y</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sub-Category</label>
                <input
                  type="text"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  placeholder="e.g. dresses, suits"
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Original Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="1899"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discounted Sale Price (₹)</label>
                <input
                  type="number"
                  value={newDiscountPrice}
                  onChange={(e) => setNewDiscountPrice(e.target.value)}
                  placeholder="1199"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Image URLs (One URL per line)</label>
              <textarea
                rows={2}
                value={newImages}
                onChange={(e) => setNewImages(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border border-slate-200 font-mono text-[11px]"
              />
            </div>

            {/* Size & Size-wise Price/Stock editor */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800">Sizes, Stock & Custom Size Pricing:</label>
                  <p className="text-[10px] text-slate-400">Optional: specify different MRP and Sale prices per size</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewSizes([
                      ...newSizes,
                      { size: 'New Size', stock: 10, price: newPrice || '', discountPrice: newDiscountPrice || '' }
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Size
                </button>
              </div>

              <div className="space-y-2">
                {newSizes.map((s, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex-1 min-w-[110px]">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Size / Age</label>
                      <input
                        type="text"
                        value={s.size}
                        onChange={(e) => {
                          const updated = [...newSizes];
                          updated[idx].size = e.target.value;
                          setNewSizes(updated);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold"
                        placeholder="e.g. 2-3Y"
                      />
                    </div>

                    <div className="w-20">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Stock</label>
                      <input
                        type="number"
                        value={s.stock}
                        onChange={(e) => {
                          const updated = [...newSizes];
                          updated[idx].stock = Number(e.target.value) || 0;
                          setNewSizes(updated);
                        }}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center"
                      />
                    </div>

                    <div className="w-28">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">MRP Price (₹)</label>
                      <input
                        type="number"
                        value={s.price !== undefined ? s.price : ''}
                        placeholder={newPrice || 'Base MRP'}
                        onChange={(e) => {
                          const updated = [...newSizes];
                          updated[idx].price = e.target.value;
                          setNewSizes(updated);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                      />
                    </div>

                    <div className="w-28">
                      <label className="text-[10px] text-brand-pink font-bold block mb-0.5">Sale Price (₹)</label>
                      <input
                        type="number"
                        value={s.discountPrice !== undefined ? s.discountPrice : ''}
                        placeholder={newDiscountPrice || newPrice || 'Sale Price'}
                        onChange={(e) => {
                          const updated = [...newSizes];
                          updated[idx].discountPrice = e.target.value;
                          setNewSizes(updated);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-brand-pink"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newSizes.filter((_, i) => i !== idx);
                          setNewSizes(updated);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        title="Remove Size"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Description</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Comfortable soft cotton dress with elegant floral patterns..."
                className="w-full px-4 py-2 rounded-2xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-black text-xs shadow-lg shadow-brand-pink/25 transition"
            >
              Publish New Product Listing to Store
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: INVENTORY & SOLD-OUT MANAGER */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900">Real-Time Inventory & Sold-Out Manager</h2>
            <p className="text-xs text-slate-400">
              When orders are placed, stock automatically deducts from inventory. If stock hits 0, it marks Sold Out automatically. You can also quickly edit details, add units or toggle Sold-Out status here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsList.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="w-12 h-14 object-cover rounded-xl border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-1 ${
                        p.isSoldOut ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.isSoldOut ? 'SOLD OUT' : `${p.totalStock} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Size Stock breakdown */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {p.sizes?.map((s) => (
                      <span key={s.size} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">
                        {s.size}: <span className="font-bold">{s.stock}</span>
                      </span>
                    ))}
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleAddStock(p, 5)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]"
                    >
                      +5 Stock
                    </button>
                    <button
                      onClick={() => handleAddStock(p, 10)}
                      className="flex-1 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px]"
                    >
                      +10 Stock
                    </button>
                    <button
                      onClick={() => handleToggleSoldOut(p)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] ${
                        p.isSoldOut ? 'bg-slate-800 text-white' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {p.isSoldOut ? 'Restock' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800">All Customer Orders ({ordersList.length})</h2>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="PLACED">Placed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="space-y-4">
            {ordersList
              .filter((o) => orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter)
              .map((ord) => (
                <div key={ord.id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <p className="text-sm font-black text-slate-900 font-mono">{ord.orderNumber}</p>
                      <p className="text-xs text-slate-500">
                        Customer: <span className="font-bold text-slate-800">{ord.customerName}</span> ({ord.customerEmail}, {ord.customerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-brand-pink">₹{ord.totalAmount}</span>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 cursor-pointer"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {ord.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                        <img src={item.image} alt="" className="w-10 h-12 object-cover rounded-lg border" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-slate-900">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-50 flex justify-between">
                    <span>Address: {ord.shippingAddress?.street}, {ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}</span>
                    <span className="font-mono">Tracking: {ord.trackingNumber}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS & RATINGS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm w-full">
              <input
                type="text"
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                placeholder="Search reviews by parent or comment..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-pink"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    reviewStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviewsList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-xs text-slate-400">
                No customer reviews found.
              </div>
            ) : (
              reviewsList
                .filter((r) => {
                  if (reviewStatusFilter !== 'ALL' && (r.status || 'APPROVED').toUpperCase() !== reviewStatusFilter) return false;
                  if (reviewSearchQuery) {
                    const q = reviewSearchQuery.toLowerCase();
                    return (
                      r.productTitle?.toLowerCase().includes(q) ||
                      r.userName?.toLowerCase().includes(q) ||
                      r.comment?.toLowerCase().includes(q) ||
                      r.title?.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      {/* Product Preview */}
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.productImage || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'}
                          alt=""
                          className="w-12 h-14 object-cover rounded-xl border shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs max-w-sm truncate">{rev.productTitle}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Product ID: {rev.productId}</p>
                        </div>
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            (rev.status || 'APPROVED') === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : (rev.status || 'APPROVED') === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rev.status || 'APPROVED'}
                        </span>

                        {(rev.status || 'APPROVED') !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}

                        {(rev.status || 'APPROVED') !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Reviewer and Rating */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rev.userName}</span>
                          <span className="text-slate-400">({rev.userEmail})</span>
                        </div>

                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.title && <h4 className="text-xs font-bold text-slate-800 pt-1">{rev.title}</h4>}
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      <p className="text-[10px] text-slate-400 pt-1">{new Date(rev.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENTS & TRANSACTIONS LOG */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-black text-slate-900">Razorpay Payment Transactions Log</h2>
                <p className="text-xs text-slate-400">Track all gateway payment statuses, signatures, and transaction IDs</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                {paymentsList.length} Transactions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Txn ID / Payment ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {paymentsList.map((tx) => (
                    <tr key={tx.id}>
                      <td className="p-3">
                        <p className="font-mono font-bold text-slate-900">{tx.transactionId}</p>
                        <p className="font-mono text-[10px] text-slate-400">{tx.razorpayPaymentId}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{tx.customerName}</p>
                        <p className="text-[10px] text-slate-400">{tx.customerEmail}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.type === 'VIP_MEMBERSHIP' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-brand-pink">₹{tx.amount}</td>
                      <td className="p-3 text-slate-500">{tx.method}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: VIP MEMBERS */}
      {activeTab === 'vip_members' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Subscribed VIP Club Members ({vipMembersList.length})</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Member Name</th>
                    <th className="p-3">Email & Contact</th>
                    <th className="p-3">Plan Amount</th>
                    <th className="p-3">Razorpay Payment ID</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {vipMembersList.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3 font-bold text-slate-900">{m.userName}</td>
                      <td className="p-3">
                        <p>{m.userEmail}</p>
                        <p className="text-[10px] text-slate-400">{m.phone}</p>
                      </td>
                      <td className="p-3 font-bold text-amber-600">₹{m.amount} / Year</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{m.razorpayPaymentId}</td>
                      <td className="p-3 text-slate-600">{new Date(m.endDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: VIP CLUB CONFIGURATION & BENEFITS EDITOR */}
      {activeTab === 'vip_config' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-black text-slate-900">VIP Club Membership Settings</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure VIP Club price, extra discount percentage, duration, and customer benefits
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
              Dynamic Settings
            </span>
          </div>

          {vipConfigSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{vipConfigSuccess}</span>
            </div>
          )}

          {vipConfigError && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {vipConfigError}
            </div>
          )}

          <form onSubmit={handleSaveVipConfig} className="space-y-6 text-xs">
            {/* Core Pricing & Discount Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">VIP Membership Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={vipConfigForm.price}
                    onChange={(e) => setVipConfigForm({ ...vipConfigForm, price: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-200 font-bold focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Charged to customer at checkout</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Extra Discount Percentage (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={vipConfigForm.discountPercentage}
                    onChange={(e) => setVipConfigForm({ ...vipConfigForm, discountPercentage: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 font-bold focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-3.5 top-2.5 font-bold text-slate-400">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Auto-applied in VIP members' cart</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Days) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={vipConfigForm.durationDays || 365}
                  onChange={(e) => setVipConfigForm({
                    ...vipConfigForm,
                    durationDays: Number(e.target.value),
                    durationLabel: `${e.target.value} Days`
                  })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 font-bold focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Default: 365 Days (1 Year)</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Plan Display Label</label>
              <input
                type="text"
                value={vipConfigForm.durationLabel || '1 Year (365 Days)'}
                onChange={(e) => setVipConfigForm({ ...vipConfigForm, durationLabel: e.target.value })}
                placeholder="e.g. 1 Year (365 Days)"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Benefits List Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-slate-700">VIP Membership Perks & Benefits</label>
                  <p className="text-[10px] text-slate-400">Displayed on the VIP Club page and product promotional badges</p>
                </div>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  {vipConfigForm.benefits?.length || 0} Perks
                </span>
              </div>

              <div className="space-y-2">
                {(vipConfigForm.benefits || []).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => {
                        const updated = [...vipConfigForm.benefits];
                        updated[index] = e.target.value;
                        setVipConfigForm({ ...vipConfigForm, benefits: updated });
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                      title="Remove Benefit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Benefit */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newBenefitInput}
                  onChange={(e) => setNewBenefitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                  placeholder="Type new benefit (e.g. Free Gift Wrapping on all orders)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Add Perk
                </button>
              </div>
            </div>

            {/* Active Toggle & Save Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vipConfigForm.isActive !== false}
                  onChange={(e) => setVipConfigForm({ ...vipConfigForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="font-bold text-slate-700 text-xs">Enable VIP Club Program on Storefront</span>
              </label>

              <button
                type="submit"
                disabled={isSavingVipConfig}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-lg shadow-slate-900/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{isSavingVipConfig ? 'Saving...' : 'Save VIP Club Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 10: USERS & VIP ACCESS MANAGER */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-brand-purple" />
                  <span>Customer Accounts & VIP Access Control ({usersList.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Grant VIP membership to any customer with 1-click or revoke access
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-purple"
                  />
                </div>

                <select
                  value={userVipFilter}
                  onChange={(e) => setUserVipFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-xs bg-white text-slate-700"
                >
                  <option value="ALL">All Users</option>
                  <option value="VIP_ONLY">VIP Members Only ⭐</option>
                  <option value="REGULAR_ONLY">Regular Customers</option>
                </select>
              </div>
            </div>

            {userActionMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{userActionMessage}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">User Name & Details</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Orders / Spent</th>
                    <th className="p-3">VIP Status</th>
                    <th className="p-3">VIP Expiry</th>
                    <th className="p-3 rounded-r-xl text-right">VIP Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {usersList
                    .filter((u) => {
                      if (userVipFilter === 'VIP_ONLY') return u.isVip;
                      if (userVipFilter === 'REGULAR_ONLY') return !u.isVip;
                      return true;
                    })
                    .filter((u) => {
                      if (!userSearchQuery) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (
                        u.name?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        u.phone?.toLowerCase().includes(q)
                      );
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {u.isVip && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          </p>
                          <p className="text-[11px] text-slate-500 font-normal">{u.email}</p>
                          {u.phone && <p className="text-[10px] text-slate-400 font-normal">{u.phone}</p>}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role || 'customer'}
                          </span>
                        </td>

                        <td className="p-3">
                          <p className="font-bold text-slate-900">{u.totalOrders || 0} Orders</p>
                          <p className="text-[10px] text-emerald-600 font-bold">₹{u.totalSpent || 0}</p>
                        </td>

                        <td className="p-3">
                          {u.isVip ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase shadow-sm">
                              <Crown className="w-3 h-3 fill-amber-500" /> VIP Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                              Regular Customer
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-slate-500">
                          {u.isVip && u.vipExpiry ? (
                            <span className="font-medium">{new Date(u.vipExpiry).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {u.isVip ? (
                            <button
                              onClick={() => handleToggleUserVip(u.id, false)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition inline-flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Revoke VIP
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleUserVip(u.id, true, 365)}
                                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-black transition inline-flex items-center gap-1 shadow-sm"
                                title="Grant 1 Year VIP membership"
                              >
                                <Crown className="w-3.5 h-3.5 fill-slate-900" /> Make VIP (+1 Yr)
                              </button>
                              <button
                                onClick={() => handleToggleUserVip(u.id, true, 3650)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-[10px] font-bold transition"
                                title="Grant Lifetime VIP membership"
                              >
                                Lifetime
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: COUPONS MANAGEMENT */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-pink" />
                <span>Discount Coupons & Promo Codes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Create, customize discount percentages, minimum order limits, and manage promo codes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search coupons..."
                  value={couponSearchQuery}
                  onChange={(e) => setCouponSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-pink"
                />
              </div>

              <button
                onClick={handleOpenCreateCouponModal}
                className="px-4 py-2.5 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white font-black text-xs shadow-md shadow-brand-pink/20 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>
          </div>

          {/* Action Notification */}
          {couponActionMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{couponActionMessage}</span>
            </div>
          )}

          {/* Coupons Table / Cards */}
          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Min. Order</th>
                    <th className="p-4">Max. Cap</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Expiry</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {couponsList
                    .filter((c) =>
                      c.code.toLowerCase().includes(couponSearchQuery.toLowerCase()) ||
                      c.description?.toLowerCase().includes(couponSearchQuery.toLowerCase())
                    )
                    .map((c) => (
                      <tr key={c.id || c.code} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs tracking-wider shadow-sm">
                            <Tag className="w-3 h-3 text-brand-pink" />
                            {c.code}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-black text-slate-900 text-sm">
                            {c.discountPercent}% OFF
                          </span>
                        </td>

                        <td className="p-4 font-bold text-slate-700">
                          {c.minOrder ? `₹${c.minOrder.toLocaleString('en-IN')}` : '₹0 (No Min)'}
                        </td>

                        <td className="p-4 font-bold text-slate-700">
                          {c.maxDiscount ? `₹${c.maxDiscount.toLocaleString('en-IN')}` : 'No Limit'}
                        </td>

                        <td className="p-4 text-slate-500 max-w-xs truncate" title={c.description}>
                          {c.description || '—'}
                        </td>

                        <td className="p-4 text-slate-600 font-medium">
                          {c.expiryDate ? (
                            new Date(c.expiryDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          ) : (
                            <span className="text-slate-400">Never Expires</span>
                          )}
                        </td>

                        <td className="p-4">
                          {c.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase">
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCouponStatus(c.id || c.code)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                                c.isActive
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={c.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                            >
                              {c.isActive ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleOpenEditCouponModal(c)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Edit Coupon"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCoupon(c.id || c.code, c.code)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {couponsList.length === 0 && (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Tag className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold">No discount coupons found</p>
                  <button
                    onClick={handleOpenCreateCouponModal}
                    className="px-4 py-2 rounded-2xl bg-brand-pink text-white text-xs font-bold"
                  >
                    Add First Coupon
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-brand-pink" />
                  <span>{editingCoupon ? 'Edit Discount Coupon' : 'Create New Coupon'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure discount code, rules, min order & maximum cap
                </p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {couponError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. YUVA25"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono font-black text-slate-900 focus:outline-none focus:border-brand-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Discount (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrder}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for unlimited"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Offer Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% off on all festive wear above ₹1499"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-pink"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="text-xs font-bold text-slate-800">Coupon is Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="px-6 py-2.5 rounded-2xl bg-brand-pink hover:bg-brand-coral text-white text-xs font-black shadow-md shadow-brand-pink/20 transition flex items-center gap-2"
                >
                  {isSavingCoupon ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
