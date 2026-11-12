import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  CreditCard, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Send, 
  QrCode, 
  Store, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Edit,
  ShoppingCart,
  X,
  Smartphone,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, Language } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MediaUploader } from '../media/MediaUploader';
import { TaxInvoiceModal } from './TaxInvoiceModal';

export interface CommercePortalProps {
  theme: ThemeMode;
  language: Language;
  onNavigateHome?: () => void;
  onOpenConsultation?: (service?: string) => void;
}

export interface CommerceProduct {
  id: string;
  businessId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  description: string;
  priceNpr: string;
  compareAtPriceNpr?: string | null;
  costPerItemNpr?: string | null;
  sku?: string | null;
  inventoryQuantity: string;
  trackQuantity: boolean;
  status: 'active' | 'draft' | 'archived';
  images: Array<{ key: string; url: string; alt?: string }>;
  metadata?: Record<string, any>;
}

export interface CommerceOrder {
  id: string;
  businessId: string;
  customerId?: string;
  orderNumber: string;
  subtotalNpr: string;
  deliveryChargeNpr: string;
  discountNpr: string;
  totalNpr: string;
  paymentMethod: 'esewa' | 'khalti' | 'fonepay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    id: string;
    productId: string;
    title: string;
    unitPriceNpr: string;
    quantity: string;
    totalPriceNpr: string;
  }>;
  notes?: string;
  createdAt: string;
}

export interface CommerceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CommerceAnalytics {
  totalOrders: number;
  totalRevenueNpr: number;
  pendingRevenueNpr: number;
  totalProducts: number;
  averageOrderValueNpr: number;
  gateways: {
    esewa: number;
    khalti: number;
    fonepay: number;
    cod: number;
  };
  fulfillment: {
    unfulfilled: number;
    processing: number;
    dispatched: number;
    delivered: number;
  };
}

export const CommercePortal: React.FC<CommercePortalProps> = ({
  theme,
  language,
  onNavigateHome,
  onOpenConsultation,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { currentBusiness, user } = useAuth();

  const businessId = currentBusiness?.id || 'biz_default';
  const businessName = currentBusiness?.name || 'Himalayan Sovereign Store';

  // Navigation tab: 'analytics' | 'products' | 'orders' | 'gateways' | 'storefront'
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'gateways' | 'storefront'>('analytics');

  // State
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [categories, setCategories] = useState<CommerceCategory[]>([]);
  const [orders, setOrders] = useState<CommerceOrder[]>([]);
  const [analytics, setAnalytics] = useState<CommerceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newComparePrice, setNewComparePrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStock, setNewStock] = useState('20');
  const [newSku, setNewSku] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Array<{ key: string; url: string; alt?: string }>>([]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CommerceOrder | null>(null);

  // Storefront Simulation State (Customer Experience)
  const [cart, setCart] = useState<Array<{ product: CommerceProduct; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('Bikash Sharma');
  const [checkoutPhone, setCheckoutPhone] = useState('9841987654');
  const [checkoutAddress, setCheckoutAddress] = useState('Baneshwor, Kathmandu');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'esewa' | 'khalti' | 'cod'>('esewa');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<{ order: CommerceOrder; whatsappAlert?: any } | null>(null);

  // Gateway Settings
  const [esewaMerchantCode, setEsewaMerchantCode] = useState('EPAYTEST');
  const [khaltiSecretKey, setKhaltiSecretKey] = useState('test_secret_key_nepalai');
  const [enableCod, setEnableCod] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);

  // Fetch all commerce data
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, ordRes, anaRes] = await Promise.all([
        fetch(`/api/commerce/products?businessId=${businessId}`),
        fetch(`/api/commerce/categories?businessId=${businessId}`),
        fetch(`/api/commerce/orders?businessId=${businessId}`),
        fetch(`/api/commerce/analytics?businessId=${businessId}`),
      ]);

      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(d.categories || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
      if (anaRes.ok) {
        const d = await anaRes.json();
        setAnalytics(d);
      }
    } catch (err) {
      console.error('Failed to load commerce data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Handle Add Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) return;

    setIsSubmittingProduct(true);
    try {
      const res = await fetch('/api/commerce/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          title: newTitle.trim(),
          description: newDescription.trim(),
          priceNpr: newPrice.trim(),
          compareAtPriceNpr: newComparePrice.trim() || null,
          categoryId: newCategory || null,
          sku: newSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
          inventoryQuantity: newStock.trim() || '10',
          trackQuantity: true,
          status: 'active',
          images: uploadedImages.length > 0 ? uploadedImages : [
            { key: 'products/placeholder.svg', url: '/api/storage/mock-media?key=products/sample.jpg', alt: newTitle }
          ]
        })
      });

      if (res.ok) {
        await loadData();
        setIsAddProductOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setNewComparePrice('');
        setNewStock('20');
        setNewSku('');
        setUploadedImages([]);
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, fulfillmentStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch(`/api/commerce/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus, paymentStatus })
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  // Dispatch WhatsApp Alert for Order
  const handleDispatchWhatsApp = async (order: CommerceOrder) => {
    try {
      const res = await fetch(`/api/commerce/orders/${order.id}/notify`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.whatsapp?.whatsappLink) {
          window.open(data.whatsapp.whatsappLink, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (err) {
      console.error('Failed to dispatch WhatsApp alert:', err);
    }
  };

  // Customer Cart Management
  const addToCart = (product: CommerceProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.priceNpr) * item.quantity), 0);
  const cartDelivery = cart.length > 0 ? 100 : 0;
  const cartTotal = cartSubtotal + cartDelivery;

  // Handle Storefront Customer Checkout
  const handleCustomerCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !checkoutName || !checkoutPhone) return;

    setIsPlacingOrder(true);
    try {
      const res = await fetch('/api/commerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          customer: {
            fullName: checkoutName,
            phone: checkoutPhone,
            address: checkoutAddress,
            city: 'Kathmandu'
          },
          items: cart.map(i => ({
            productId: i.product.id,
            title: i.product.title,
            unitPriceNpr: i.product.priceNpr,
            quantity: i.quantity
          })),
          paymentMethod: checkoutPaymentMethod,
          deliveryChargeNpr: cartDelivery,
          notes: 'Customer placed order via NepalAI Commerce preview'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastPlacedOrder(data);
        setCart([]);
        setIsCartOpen(false);
        await loadData();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesCat = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesQuery = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className={`min-h-[calc(100vh-4rem)] pb-16 transition-colors duration-300 ${
      isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header Banner */}
      <div className={`border-b backdrop-blur-xl ${
        isDark ? 'border-cyan-950/40 bg-[#0d1527]/80' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-lg shadow-cyan-500/20">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {isNe ? 'नेपालएआई कमर्स प्लेटफर्म' : 'NepalAI Commerce'}
                  </h1>
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                    Sovereign SaaS
                  </span>
                </div>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {businessName} • {isNe ? 'ईसेवा, खल्ती, फोनपे र ह्वाट्सएप अर्डर इन्जिन' : 'Multi-tenant eSewa, Khalti, FonePay & WhatsApp Engine'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('storefront')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  activeTab === 'storefront'
                    ? 'bg-cyan-600 text-white'
                    : isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Store className="h-4 w-4 text-cyan-400" />
                <span>{isNe ? 'ग्राहक स्टोरफ्रन्ट' : 'Customer Storefront'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-sky-400 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{isNe ? 'नयाँ सामान थप्नुहोस्' : 'Add New Product'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-px gap-2">
            {[
              { id: 'analytics', labelEn: 'Overview & Metrics', labelNe: 'अवलोकन तथा मेट्रिक्स', icon: TrendingUp },
              { id: 'products', labelEn: 'Product Catalog', labelNe: 'सामान सूची (क्याटलग)', icon: Package },
              { id: 'orders', labelEn: 'Orders & WhatsApp Dispatch', labelNe: 'अर्डर तथा ह्वाट्सएप', icon: Truck },
              { id: 'gateways', labelEn: 'Nepal Payments & Tax', labelNe: 'नेपाल भुक्तानी तथा प्यान', icon: CreditCard },
              { id: 'storefront', labelEn: 'Live Store Preview', labelNe: 'स्टोरफ्रन्ट प्रत्यक्ष झलक', icon: Store },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-cyan-500 text-cyan-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{isNe ? tab.labelNe : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`rounded-2xl p-5 border shadow-sm ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isNe ? 'सफल बिक्री रकम' : 'Total Revenue (Paid)'}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight text-cyan-400">
                  रू {analytics?.totalRevenueNpr ? Number(analytics.totalRevenueNpr).toLocaleString('en-IN') : '32,100'}
                </div>
                <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{isNe ? 'eSewa, Khalti र FonePay प्रमाणित' : 'Verified via eSewa & Khalti'}</span>
                </div>
              </div>

              <div className={`rounded-2xl p-5 border shadow-sm ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isNe ? 'कुल अर्डर संख्या' : 'Total Orders'}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight">
                  {analytics?.totalOrders || orders.length}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {analytics?.fulfillment?.processing || 1} {isNe ? 'तयारीमा' : 'in processing'} • {analytics?.fulfillment?.delivered || 1} {isNe ? 'सम्पन्न' : 'delivered'}
                </div>
              </div>

              <div className={`rounded-2xl p-5 border shadow-sm ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isNe ? 'सक्रिय सामान संख्या' : 'Active Products'}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight">
                  {analytics?.totalProducts || products.length}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {isNe ? 'Cloudflare R2 मिडिया होस्टिङ' : 'Hosted on Cloudflare R2'}
                </div>
              </div>

              <div className={`rounded-2xl p-5 border shadow-sm ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isNe ? 'औसत अर्डर मूल्य (AOV)' : 'Average Order Value'}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight text-teal-400">
                  रू {analytics?.averageOrderValueNpr ? Number(analytics.averageOrderValueNpr).toLocaleString('en-IN') : '16,050'}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {isNe ? 'स्थानीय उपभोक्ता औसत' : 'Average basket size'}
                </div>
              </div>
            </div>

            {/* Gateway Settlement Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className={`lg:col-span-2 rounded-2xl p-6 border ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold">
                    {isNe ? 'नेपाल भुक्तानी गेटवे विभाजन' : 'Nepal Payment Gateway Distribution'}
                  </h3>
                  <span className="text-xs text-cyan-400 font-semibold">{isNe ? 'प्रत्यक्ष बैंक सेटलमेन्ट' : 'Direct Settlements'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <div className="text-xs font-semibold text-slate-400">eSewa ePay</div>
                    <div className="mt-2 text-xl font-bold text-cyan-400">{analytics?.gateways?.esewa || 1}</div>
                    <div className="mt-1 text-2xs text-slate-400">Instant Wallet</div>
                  </div>
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <div className="text-xs font-semibold text-slate-400">Khalti v2</div>
                    <div className="mt-2 text-xl font-bold text-sky-400">{analytics?.gateways?.khalti || 1}</div>
                    <div className="mt-1 text-2xs text-slate-400">Lookup Verified</div>
                  </div>
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <div className="text-xs font-semibold text-slate-400">Nepal QR / FonePay</div>
                    <div className="mt-2 text-xl font-bold text-teal-400">{analytics?.gateways?.fonepay || 0}</div>
                    <div className="mt-1 text-2xs text-slate-400">Bank Direct</div>
                  </div>
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <div className="text-xs font-semibold text-slate-400">Cash on Delivery</div>
                    <div className="mt-2 text-xl font-bold text-amber-400">{analytics?.gateways?.cod || 0}</div>
                    <div className="mt-1 text-2xs text-slate-400">Doorstep Cash</div>
                  </div>
                </div>

                {/* Recent Orders Snippet */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {isNe ? 'पछिल्ला अर्डरहरू' : 'Recent Inflow Orders'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      {isNe ? 'सबै हेर्नुहोस् →' : 'View all orders →'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {orders.slice(0, 3).map(order => (
                      <div
                        key={order.id}
                        className={`flex items-center justify-between rounded-xl p-3 border text-xs ${
                          isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200 bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-cyan-400">#{order.orderNumber}</span>
                          <div>
                            <div className="font-semibold">{order.shippingAddress.fullName}</div>
                            <div className="text-slate-400 text-2xs">{order.shippingAddress.city} • {order.items.length} items</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold">रू {Number(order.totalNpr).toLocaleString('en-IN')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${
                            order.paymentStatus === 'paid' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Action Card */}
              <div className={`rounded-2xl p-6 border flex flex-col justify-between ${
                isDark ? 'border-cyan-950/40 bg-gradient-to-b from-[#0d1527] to-[#080d1a]' : 'border-slate-200 bg-gradient-to-b from-white to-slate-50'
              }`}>
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-3">
                    <Send className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold">
                    {isNe ? 'स्वचालित ह्वाट्सएप अर्डर अलर्ट' : 'Automated WhatsApp Invoicing'}
                  </h3>
                  <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isNe
                      ? 'ग्राहकहरूलाई उनीहरूको अर्डर नम्बर, रकम, सामानहरूको विवरण, र डेलिभरी ट्र्याकिङ लिंकसहित नेपाली र अंग्रेजीमा स्वचालित ह्वाट्सएप सन्देश पठाउनुहोस्।'
                      : 'Send customers formatted bilingual order confirmation alerts with order ID, NPR total, item breakdown, and delivery details directly via WhatsApp.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold transition-all shadow-md shadow-cyan-950/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>{isNe ? 'अर्डर व्यवस्थापनमा जानुहोस्' : 'Manage Customer Alerts'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs ${
                  isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-200 bg-white'
                }`}>
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isNe ? 'सामान खोज्नुहोस्...' : 'Search title, SKU...'}
                    className="bg-transparent outline-none w-48 text-xs"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className={`rounded-xl px-3 py-2 border text-xs outline-none cursor-pointer ${
                    isDark ? 'border-slate-800 bg-[#0d1527] text-slate-200' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <option value="all">{isNe ? 'सबै विधा (All Categories)' : 'All Categories'}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{isNe ? 'नयाँ सामान थप्नुहोस्' : 'Add New Product'}</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map(product => {
                const stock = parseInt(product.inventoryQuantity || '0', 10);
                const isLowStock = stock <= 15;
                const imgUrl = product.images?.[0]?.url || '/api/storage/mock-media?key=placeholder';

                return (
                  <div
                    key={product.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:border-cyan-500/40 ${
                      isDark ? 'border-slate-800/80 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Product Thumbnail with Cloudflare R2 Media */}
                      <div className="relative aspect-4/3 w-full bg-slate-900/50 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                            isLowStock ? 'bg-amber-500/80 text-black' : 'bg-cyan-500/80 text-black'
                          }`}>
                            {stock} {isNe ? 'बाँकी' : 'in stock'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="text-2xs font-mono text-cyan-400">{product.sku || 'SKU-NONE'}</div>
                        <h4 className="mt-1 font-bold text-sm line-clamp-1">{product.title}</h4>
                        <p className={`mt-1 text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 border-t flex items-center justify-between ${
                      isDark ? 'border-slate-800/80' : 'border-slate-100'
                    }`}>
                      <div>
                        <div className="text-base font-bold text-cyan-400">
                          रू {Number(product.priceNpr).toLocaleString('en-IN')}
                        </div>
                        {product.compareAtPriceNpr && (
                          <div className="text-2xs text-slate-400 line-through">
                            रू {Number(product.compareAtPriceNpr).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>{isNe ? 'किन्नुहोस्' : 'Buy'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & WHATSAPP DISPATCH */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {isNe ? 'अर्डर व्यवस्थापन तथा ह्वाट्सएप अलर्ट' : 'Orders & WhatsApp Dispatch Ledger'}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isNe ? 'ग्राहकका लागि एक-क्लिक ह्वाट्सएप सन्देश र भुक्तानी स्थिति' : 'One-click WhatsApp customer alerts & delivery updates'}
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                className="rounded-xl px-3 py-1.5 border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isNe ? 'रिफ्रेस' : 'Refresh'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-cyan-400">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${
                          order.paymentStatus === 'paid' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${
                          order.fulfillmentStatus === 'delivered' ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('ne-NP', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* View IRD Tax Invoice Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                        title="View official IRD Schedule 5 Tax Invoice"
                      >
                        <Receipt className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{isNe ? 'कर बिजक (Invoice)' : 'Tax Invoice'}</span>
                      </button>

                      {/* One-click WhatsApp Dispatch Button */}
                      <button
                        type="button"
                        onClick={() => handleDispatchWhatsApp(order)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Send bilingual WhatsApp order alert directly to buyer"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>{isNe ? 'ह्वाट्सएप' : 'WhatsApp'}</span>
                      </button>

                      {/* Fulfillment Status Changer */}
                      <select
                        value={order.fulfillmentStatus}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`rounded-xl px-2.5 py-1.5 border text-xs font-semibold outline-none cursor-pointer ${
                          isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-800'
                        }`}
                      >
                        <option value="unfulfilled">Unfulfilled</option>
                        <option value="processing">Processing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Details & Items */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">{isNe ? 'ग्राहक र ठेगाना' : 'Customer & Shipping'}</span>
                      <div className="font-bold text-slate-200">{order.shippingAddress.fullName}</div>
                      <div className="text-cyan-400">{order.shippingAddress.phone}</div>
                      <div className="text-slate-400">{order.shippingAddress.address}, {order.shippingAddress.city}</div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">{isNe ? 'सामानहरूको सूची' : 'Ordered Items'}</span>
                      <ul className="space-y-1">
                        {order.items.map(item => (
                          <li key={item.id} className="text-slate-300">
                            • {item.title} <span className="text-cyan-400 font-bold">x{item.quantity}</span> (रू {Number(item.totalPriceNpr).toLocaleString('en-IN')})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-right flex flex-col justify-end">
                      <div className="text-slate-400">
                        Subtotal: रू {Number(order.subtotalNpr).toLocaleString('en-IN')} | Delivery: रू {order.deliveryChargeNpr}
                      </div>
                      <div className="text-lg font-bold text-cyan-400 mt-1">
                        Total: रू {Number(order.totalNpr).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NEPAL PAYMENTS & TAX */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold">
                {isNe ? 'नेपाल भुक्तानी गेटवे तथा कर अनुपालन' : 'Nepal Payment Gateway & Tax Compliance Settings'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isNe ? 'eSewa, Khalti, FonePay QR र १३% भ्याट/प्यान बिलिङ' : 'Configure eSewa, Khalti, FonePay QR and IRD-compliant 13% VAT/PAN invoices'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Rail Config */}
              <div className={`rounded-2xl p-6 border ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm">{isNe ? 'गेटवे क्रेडेन्सियल' : 'Gateway Credentials'}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-semibold text-slate-400">Mode:</span>
                    <button
                      type="button"
                      onClick={() => setIsTestMode(!isTestMode)}
                      className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase transition-all cursor-pointer ${
                        isTestMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      }`}
                    >
                      {isTestMode ? 'Sandbox (Test)' : 'Production (Live)'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-300">eSewa Merchant Code (SCD)</label>
                    <input
                      type="text"
                      value={esewaMerchantCode}
                      onChange={e => setEsewaMerchantCode(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                        isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
                      }`}
                    />
                    <span className="text-2xs text-slate-500 mt-1 block">Default test merchant: EPAYTEST</span>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-300">Khalti Secret Key</label>
                    <input
                      type="password"
                      value={khaltiSecretKey}
                      onChange={e => setKhaltiSecretKey(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                        isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-800'
                      }`}
                    />
                    <span className="text-2xs text-slate-500 mt-1 block">Used for Khalti v2 ePayment lookup verification</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-slate-300">Cash on Delivery (COD)</span>
                      <span className="text-2xs text-slate-500">Allow customers to pay physical cash upon arrival</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableCod(!enableCod)}
                      className={`h-6 w-11 rounded-full transition-colors relative cursor-pointer ${
                        enableCod ? 'bg-cyan-600' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform absolute top-1 ${
                        enableCod ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* FonePay & Nepal QR Spec */}
              <div className={`rounded-2xl p-6 border flex flex-col justify-between ${
                isDark ? 'border-cyan-950/40 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-5 w-5 text-cyan-400" />
                    <h4 className="font-bold text-sm">{isNe ? 'नेपाल क्युआर (FonePay EMVCo)' : 'Nepal QR (FonePay & NRB EMVCo)'}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Compliant with Nepal Rastra Bank (NRB) National Payment Switch directives. Emits standard 524 (NPR) currency tags with dynamic order number references and PAN validation.
                  </p>

                  <div className="mt-4 rounded-xl p-3 bg-slate-900 border border-slate-800 font-mono text-2xs text-cyan-300 break-all">
                    00020101021226320016np.com.nepalqr01096098124535204541153035245802NP5925Himalayan Coffee6009Kathmandu
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">IRD PAN: 609812453</span>
                  <span className="text-xs font-bold text-cyan-400">NRB Benchmark Compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE STOREFRONT PREVIEW (CUSTOMER EXPERIENCE) */}
        {activeTab === 'storefront' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {isNe ? 'ग्राहक स्टोरफ्रन्ट प्रत्यक्ष झलक' : 'Live Customer Storefront Simulation'}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isNe ? 'ग्राहकहरूले तपाईंको स्टोरमा कसरी सामान छान्छन् र भुक्तानी गर्छन् हेर्नुहोस्' : 'Simulate buyer browsing, cart additions, and checkout via eSewa / Khalti'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{isNe ? 'झोला हेर्नुहोस्' : 'View Cart'}</span>
                {cart.length > 0 && (
                  <span className="h-5 w-5 rounded-full bg-white text-cyan-900 flex items-center justify-center text-2xs font-extrabold">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Simulated Store Banner */}
            <div className="rounded-3xl p-8 bg-gradient-to-r from-cyan-900/40 via-sky-900/30 to-[#080d1a] border border-cyan-800/40 relative overflow-hidden">
              <div className="max-w-xl">
                <span className="text-2xs font-bold tracking-widest uppercase text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
                  🇳🇵 Authentic Nepali Marketplace
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {businessName}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Direct from verified artisans and sovereign producers across Kathmandu, Nuwakot, and Ilam. Instant settlement via eSewa, Khalti, or Cash on Delivery.
                </p>
              </div>
            </div>

            {/* Storefront Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:border-cyan-500/40 ${
                    isDark ? 'border-slate-800/80 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  <div className="relative aspect-4/3 w-full bg-slate-900">
                    <img
                      src={product.images?.[0]?.url || '/api/storage/mock-media?key=placeholder'}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{product.title}</h4>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-base font-bold text-cyan-400">
                        रू {Number(product.priceNpr).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{isNe ? 'थप्नुहोस्' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ADD PRODUCT MODAL WITH INTEGRATED CLOUDFLARE R2 UPLOADER */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl ${
              isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-base">{isNe ? 'नयाँ सामान क्याटलगमा थप्नुहोस्' : 'Add New Product to Catalog'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isNe ? 'सामानको नाम (Product Title) *' : 'Product Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Single-Origin Himalayan Arabica Coffee (500g)"
                  className={`w-full rounded-xl px-3 py-2 border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isNe ? 'विवरण (Description)' : 'Product Description'}
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Tell buyers about ingredients, altitude, certifications..."
                  className={`w-full rounded-xl px-3 py-2 border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    {isNe ? 'मूल्य (Price in NPR) *' : 'Price (NPR) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="1250"
                    className={`w-full rounded-xl px-3 py-2 border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">
                    {isNe ? 'प्रारम्भिक स्टक (Inventory)' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    placeholder="25"
                    className={`w-full rounded-xl px-3 py-2 border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isNe ? 'विधा छान्नुहोस् (Category)' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 border outline-none cursor-pointer ${
                    isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  <option value="">{isNe ? 'सामान्य विधा' : 'General Catalog'}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Integrated Cloudflare R2 Media Upload */}
              <div>
                <label className="font-semibold block mb-1 text-slate-300">
                  {isNe ? 'सामानको तस्विर (Cloudflare R2 Media)' : 'Product Image (Cloudflare R2 S3 Storage)'}
                </label>
                <MediaUploader
                  folder="products"
                  tenantId={businessId}
                  maxFiles={1}
                  label="Drop product photo here (JPG, PNG, WebP)"
                  onUploadComplete={result => {
                    setUploadedImages([{
                      key: result.fileKey,
                      url: result.publicUrl,
                      alt: newTitle || 'Product Image'
                    }]);
                  }}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SHOPPING CART & CHECKOUT SLIDE-OVER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className={`w-full max-w-md h-full flex flex-col justify-between p-6 overflow-y-auto ${
              isDark ? 'bg-[#0d1527] text-slate-100 border-l border-cyan-950/60' : 'bg-white text-slate-900 border-l border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-bold text-base">{isNe ? 'तपाईंको झोला' : 'Customer Cart'}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  {isNe ? 'झोला खाली छ।' : 'Your shopping cart is empty.'}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images?.[0]?.url || '/api/storage/mock-media?key=placeholder'}
                          alt={item.product.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold line-clamp-1">{item.product.title}</div>
                          <div className="text-cyan-400">रू {Number(item.product.priceNpr).toLocaleString('en-IN')} x {item.quantity}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Form */}
              {cart.length > 0 && (
                <form onSubmit={handleCustomerCheckout} className="mt-6 pt-4 border-t border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200">{isNe ? 'डेलिभरी तथा भुक्तानी' : 'Shipping & Payment'}</h4>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={e => setCheckoutName(e.target.value)}
                      className="w-full rounded-xl px-3 py-1.5 border border-slate-700 bg-slate-900 text-slate-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-400">Phone (WhatsApp for alerts) *</label>
                    <input
                      type="text"
                      required
                      value={checkoutPhone}
                      onChange={e => setCheckoutPhone(e.target.value)}
                      placeholder="9841XXXXXX"
                      className="w-full rounded-xl px-3 py-1.5 border border-slate-700 bg-slate-900 text-slate-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-400">Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={checkoutAddress}
                      onChange={e => setCheckoutAddress(e.target.value)}
                      placeholder="e.g. Baneshwor, Kathmandu"
                      className="w-full rounded-xl px-3 py-1.5 border border-slate-700 bg-slate-900 text-slate-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-400">Payment Rail</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'esewa', label: 'eSewa' },
                        { id: 'khalti', label: 'Khalti' },
                        { id: 'cod', label: 'COD' },
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setCheckoutPaymentMethod(g.id as any)}
                          className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            checkoutPaymentMethod === g.id
                              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                              : 'border-slate-700 bg-slate-900 text-slate-400'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>रू {cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery</span>
                      <span>रू {cartDelivery}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-cyan-400 pt-1 border-t border-slate-800">
                      <span>Total Amount</span>
                      <span>रू {cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-sky-400 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPlacingOrder ? 'Processing...' : `Place Order • रू ${cartTotal.toLocaleString('en-IN')}`}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ORDER CONFIRMATION & WHATSAPP ALERT MODAL */}
      {lastPlacedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
              isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">
                {isNe ? 'अर्डर सफलतापूर्वक प्राप्त भयो!' : 'Order Placed Successfully!'}
              </h3>
              <p className="mt-1 font-mono text-sm text-cyan-400">
                #{lastPlacedOrder.order.orderNumber}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Total: रू {Number(lastPlacedOrder.order.totalNpr).toLocaleString('en-IN')} via {lastPlacedOrder.order.paymentMethod.toUpperCase()}
              </p>
            </div>

            {lastPlacedOrder.whatsappAlert?.whatsappLink && (
              <div className="mt-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-center">
                <span className="text-2xs font-semibold text-cyan-300 block mb-2">
                  📲 Instant WhatsApp Notification Ready
                </span>
                <a
                  href={lastPlacedOrder.whatsappAlert.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>{isNe ? 'ह्वाट्सएपमा रसिद खोल्नुहोस्' : 'Open WhatsApp Dispatch Link'}</span>
                </a>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setLastPlacedOrder(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close & Return to Commerce Hub
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Official IRD Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
          businessName={businessName}
          businessPan={currentBusiness?.panNumber || '609812453'}
          businessAddress={currentBusiness?.address || 'Ward No. 3, Lalitpur, Nepal'}
          businessPhone={currentBusiness?.phone || '+977-1-5541200'}
          theme={theme}
          language={language}
        />
      )}
    </div>
  );
};
