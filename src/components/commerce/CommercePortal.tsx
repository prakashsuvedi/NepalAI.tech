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
  Receipt,
  Copy,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, Language } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MediaUploader } from '../media/MediaUploader';
import { TaxInvoiceModal } from './TaxInvoiceModal';

export interface CommercePortalProps {
  theme: ThemeMode;
  language: Language;
  initialTab?: 'analytics' | 'products' | 'orders' | 'gateways' | 'storefront';
  storeSlug?: string;
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
  initialTab,
  storeSlug,
  onNavigateHome,
  onOpenConsultation,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const { currentBusiness, user, getIdToken, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [publicStoreInfo, setPublicStoreInfo] = useState<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    panNumber?: string;
    address?: string;
    phone?: string;
  } | null>(null);

  const businessId = publicStoreInfo?.id || currentBusiness?.id || 'biz_default';
  const businessName = publicStoreInfo?.name || currentBusiness?.name || 'Himalayan Sovereign Store';
  const activeStoreSlug = publicStoreInfo?.slug || currentBusiness?.slug || storeSlug || 'himalayan-coffee';

  // Navigation tab: 'analytics' | 'products' | 'orders' | 'gateways' | 'storefront'
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'gateways' | 'storefront'>(
    initialTab || (storeSlug ? 'storefront' : 'analytics')
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, storeSlug]);

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
  const [whatsappDispatchModal, setWhatsappDispatchModal] = useState<{
    orderNumber: string;
    customerName: string;
    phoneFormatted: string;
    messageText: string;
    whatsappLink: string;
  } | null>(null);

  // Storefront Simulation State (Customer Experience)
  const [cart, setCart] = useState<Array<{ product: CommerceProduct; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('Bikash Sharma');
  const [checkoutPhone, setCheckoutPhone] = useState('9841987654');
  const [checkoutAddress, setCheckoutAddress] = useState('Baneshwor, Kathmandu');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'esewa' | 'khalti' | 'fonepay' | 'cod'>('esewa');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<{
    order: CommerceOrder;
    whatsappAlert?: any;
    paymentSession?: {
      gateway: 'esewa' | 'khalti' | 'fonepay' | 'cod';
      mode?: string;
      pidx?: string;
      esewaFields?: Record<string, string>;
      esewaEndpoint?: string;
      qrPayload?: string;
      invoiceNumber?: string;
    };
  } | null>(null);

  // Gateway Readiness & Dynamic Nepal QR Settings (no client secrets)
  const [gatewayStatus, setGatewayStatus] = useState<{
    esewa?: { mode: string; merchantCode: string; v2SignatureEnabled: boolean };
    khalti?: { mode: string; v2LookupEnabled: boolean };
    fonepayQr?: { mode: string; currencyCode: string };
    r2Configured?: boolean;
    smtpConfigured?: boolean;
  } | null>(null);
  const [sampleQrPayload, setSampleQrPayload] = useState<string>(
    '00020101021226320016np.com.nepalqr01096098124535204541153035245802NP5925Himalayan Coffee6009Kathmandu'
  );
  const [enableCod, setEnableCod] = useState(true);

  // Fetch all commerce data
  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      if (storeSlug) {
        const storeRes = await fetch(`/api/commerce/stores/${encodeURIComponent(storeSlug)}`);
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          if (storeData.store) {
            setPublicStoreInfo(storeData.store);
            setProducts(storeData.products || []);
            setCategories(storeData.categories || []);
          }
        }
      } else {
        setPublicStoreInfo(null);
      }

      const activeBizId = currentBusiness?.id || 'biz_default';
      const requests: Promise<Response>[] = storeSlug
        ? []
        : [
            fetch(`/api/commerce/products?businessId=${activeBizId}`),
            fetch(`/api/commerce/categories?businessId=${activeBizId}`),
          ];

      const [prodRes, catRes] = requests.length > 0 ? await Promise.all(requests) : [null, null];

      if (prodRes?.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }
      if (catRes?.ok) {
        const d = await catRes.json();
        setCategories(d.categories || []);
      }

      if (token) {
        const [ordRes, anaRes, gwRes] = await Promise.all([
          fetch(`/api/commerce/orders?businessId=${activeBizId}`, { headers: authHeaders }),
          fetch(`/api/commerce/analytics?businessId=${activeBizId}`, { headers: authHeaders }),
          fetch('/api/commerce/payments/status', { headers: authHeaders }),
        ]);

        if (ordRes?.ok) {
          const d = await ordRes.json();
          setOrders(d.orders || []);
        }
        if (anaRes?.ok) {
          const d = await anaRes.json();
          setAnalytics(d);
        }
        if (gwRes?.ok) {
          const d = await gwRes.json();
          setGatewayStatus(d);
        }
      } else {
        setOrders([]);
        setAnalytics(null);
        setGatewayStatus(null);
      }
    } catch (err) {
      console.error('Failed to load commerce data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBusiness?.id, storeSlug, user]);

  useEffect(() => {
    fetch('/api/commerce/payments/qr-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: 'ORD-2081-PREVIEW',
        amountNpr: 1250,
        merchantName: businessName,
        panNumber: publicStoreInfo?.panNumber || currentBusiness?.panNumber || '609812453',
        city: 'Kathmandu',
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.qrPayload) setSampleQrPayload(d.qrPayload);
      })
      .catch(() => {});
  }, [businessName, currentBusiness?.panNumber, publicStoreInfo?.panNumber]);

  // Handle Add Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice.trim()) return;

    setIsSubmittingProduct(true);
    try {
      const token = await getIdToken();
      if (!token) {
        await signInWithGoogle();
        return;
      }

      const res = await fetch('/api/commerce/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch(`/api/commerce/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fulfillmentStatus, paymentStatus })
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  // Build Bilingual WhatsApp Dispatch Modal (avoids window.open popup blocks)
  const handleDispatchWhatsApp = async (order: CommerceOrder) => {
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch(`/api/commerce/orders/${order.id}/notify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.whatsapp?.whatsappLink) {
          setWhatsappDispatchModal({
            orderNumber: order.orderNumber,
            customerName: order.shippingAddress?.fullName || 'Customer',
            phoneFormatted: data.whatsapp.phoneFormatted,
            messageText: data.whatsapp.messageText,
            whatsappLink: data.whatsapp.whatsappLink,
          });
        }
      }
    } catch (err) {
      console.error('Failed to dispatch WhatsApp alert:', err);
    }
  };

  const handleCopyStorefrontLink = async () => {
    const shareUrl = `${window.location.origin}/#store/${activeStoreSlug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Storefront URL Copied', shareUrl, 'success', 2500);
    } catch {
      showToast('Share Storefront', shareUrl, 'info', 3000);
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
          notes: 'Customer placed order via NepalAI Commerce storefront'
        })
      });

      if (res.ok) {
        const data = await res.json();
        let paymentSession: any = { gateway: checkoutPaymentMethod };

        if (checkoutPaymentMethod === 'esewa' && data.order?.orderNumber) {
          const initRes = await fetch('/api/commerce/payments/esewa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderIdOrNumber: data.order.orderNumber,
              successUrl: `${window.location.origin}/#store/${activeStoreSlug}`,
              failureUrl: `${window.location.origin}/#store/${activeStoreSlug}`,
            }),
          });
          if (initRes.ok) {
            const initData = await initRes.json();
            paymentSession = {
              gateway: 'esewa',
              mode: initData.mode,
              esewaFields: initData.fields,
              esewaEndpoint: initData.endpointUrl,
            };
          }
        } else if (checkoutPaymentMethod === 'khalti' && data.order?.orderNumber) {
          const initRes = await fetch('/api/commerce/payments/khalti/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderIdOrNumber: data.order.orderNumber,
              returnUrl: `${window.location.origin}/#store/${activeStoreSlug}`,
              websiteUrl: window.location.origin,
            }),
          });
          if (initRes.ok) {
            const initData = await initRes.json();
            paymentSession = {
              gateway: 'khalti',
              mode: initData.mode,
              pidx: initData.pidx,
            };
          }
        } else if (checkoutPaymentMethod === 'fonepay' && data.order?.orderNumber) {
          const qrRes = await fetch('/api/commerce/payments/qr-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: data.order.orderNumber,
              amountNpr: data.order.totalNpr,
              merchantName: businessName,
              panNumber: publicStoreInfo?.panNumber || currentBusiness?.panNumber || '609812453',
            }),
          });
          if (qrRes.ok) {
            const qrData = await qrRes.json();
            paymentSession = {
              gateway: 'fonepay',
              qrPayload: qrData.qrPayload,
              invoiceNumber: qrData.invoiceNumber,
            };
          }
        }

        setLastPlacedOrder({
          ...data,
          paymentSession,
        });
        setCart([]);
        setIsCartOpen(false);
        await loadData();
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      showToast('Order Error', 'Could not place order. Please check details and try again.', 'error', 3000);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Complete & Verify Gateway Payment on Placed Order
  const handleVerifyOrderPayment = async () => {
    if (!lastPlacedOrder?.order) return;
    const { order, paymentSession } = lastPlacedOrder;
    setIsVerifyingPayment(true);
    try {
      let res: Response;
      if (paymentSession?.gateway === 'khalti') {
        res = await fetch('/api/commerce/payments/khalti/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pidx: paymentSession.pidx || `KHLTI_SANDBOX_${order.orderNumber}`,
            amountNpr: Number(order.totalNpr),
            orderId: order.orderNumber,
          }),
        });
      } else if (paymentSession?.gateway === 'fonepay') {
        res = await fetch('/api/commerce/payments/fonepay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderIdOrNumber: order.orderNumber,
            traceId: `NPQR-${Date.now().toString(36).toUpperCase()}`,
            amountNpr: Number(order.totalNpr),
          }),
        });
      } else {
        res = await fetch('/api/commerce/payments/esewa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amt: Number(order.totalNpr),
            oid: order.orderNumber,
            refId: `ESW-TST-${Date.now().toString().slice(-6)}`,
            scd: 'EPAYTEST',
          }),
        });
      }

      if (res.ok) {
        const result = await res.json();
        setLastPlacedOrder((prev) =>
          prev
            ? {
                ...prev,
                order: result.order || { ...prev.order, paymentStatus: 'paid' },
              }
            : null
        );
        showToast('Payment Verified', `Order #${order.orderNumber} marked as Paid.`, 'success', 3000);
        await loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast('Verification Failed', errData.error || errData.message || 'Could not verify payment.', 'error', 3500);
      }
    } catch {
      showToast('Verification Failed', 'Network error verifying payment.', 'error', 3000);
    } finally {
      setIsVerifyingPayment(false);
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
      isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-[#f8fafc] text-slate-950'
    }`}>
      {/* Top Header Banner */}
      <div className={`border-b backdrop-blur-xl ${
        isDark ? 'border-cyan-950/40 bg-[#0d1527]/85' : 'border-slate-200 bg-white/95'
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-lg shadow-cyan-500/20">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-xl font-bold tracking-tight sm:text-2xl ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'नेपालएआई कमर्स प्लेटफर्म' : 'NepalAI Commerce'}
                  </h1>
                  <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold border ${
                    isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-900 border-cyan-300'
                  }`}>
                    Sovereign SaaS
                  </span>
                </div>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {businessName} • {isNe ? 'ईसेवा, खल्ती, फोनपे र ह्वाट्सएप अर्डर इन्जिन' : 'Multi-tenant eSewa, Khalti, FonePay & WhatsApp Engine'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('storefront')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                  activeTab === 'storefront'
                    ? 'bg-cyan-600 text-white'
                    : isDark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <Store className={`h-4 w-4 ${activeTab === 'storefront' ? 'text-white' : (isDark ? 'text-cyan-400' : 'text-cyan-700')}`} />
                <span>{isNe ? 'ग्राहक स्टोरफ्रन्ट' : 'Customer Storefront'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 hover:from-cyan-500 hover:to-sky-400 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{isNe ? 'नयाँ सामान थप्नुहोस्' : 'Add New Product'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`mt-6 flex overflow-x-auto border-b pb-px gap-2 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
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
                  className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? isDark ? 'border-cyan-400 text-cyan-300' : 'border-cyan-700 text-cyan-800'
                      : isDark ? 'border-transparent text-slate-300 hover:text-white' : 'border-transparent text-slate-700 hover:text-slate-950'
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
            {!user && (
              <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'border-cyan-800/50 bg-cyan-950/25' : 'border-cyan-200 bg-cyan-50/80'
              }`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className={`h-5 w-5 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                  <div className="text-xs">
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isNe ? 'मर्चेन्ट खाता साइन-इन आवश्यक छ' : 'Merchant Sign-In for Live Store Telemetry'}
                    </div>
                    <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {isNe
                        ? 'आफ्नो वास्तविक अर्डर र बिक्री विश्लेषण हेर्न गुगलबाट साइन-इन गर्नुहोस्। ग्राहक स्टोरफ्रन्ट सार्वजनिक छ।'
                        : 'Sign in with Google to view live orders and revenue for your store. Customer storefront remains public.'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  {isNe ? 'गुगलबाट साइन-इन गर्नुहोस्' : 'Continue with Google'}
                </button>
              </div>
            )}

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 tabular-nums">
              <div className={`rounded-2xl p-5 border shadow-xs ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNe ? 'सफल बिक्री रकम' : 'Total Revenue (Paid)'}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className={`mt-3 text-2xl font-bold tracking-tight ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                  रू {Number(analytics?.totalRevenueNpr ?? 0).toLocaleString('en-IN')}
                </div>
                <div className={`mt-1 text-xs flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                  <span>{isNe ? 'eSewa, Khalti र FonePay प्रमाणित' : 'Verified via eSewa & Khalti'}</span>
                </div>
              </div>

              <div className={`rounded-2xl p-5 border shadow-xs ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNe ? 'कुल अर्डर संख्या' : 'Total Orders'}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-700'}`}>
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <div className={`mt-3 text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {analytics?.totalOrders ?? orders.length}
                </div>
                <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {analytics?.fulfillment?.processing ?? 0} {isNe ? 'तयारीमा' : 'in processing'} • {analytics?.fulfillment?.delivered ?? 0} {isNe ? 'सम्पन्न' : 'delivered'}
                </div>
              </div>

              <div className={`rounded-2xl p-5 border shadow-xs ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNe ? 'सक्रिय सामान संख्या' : 'Active Products'}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <div className={`mt-3 text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {analytics?.totalProducts ?? products.length}
                </div>
                <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'Cloudflare R2 मिडिया होस्टिङ' : 'Hosted on Cloudflare R2'}
                </div>
              </div>

              <div className={`rounded-2xl p-5 border shadow-xs ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNe ? 'औसत अर्डर मूल्य (AOV)' : 'Average Order Value'}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className={`mt-3 text-2xl font-bold tracking-tight ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                  रू {Number(analytics?.averageOrderValueNpr ?? 0).toLocaleString('en-IN')}
                </div>
                <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'स्थानीय उपभोक्ता औसत' : 'Average basket size'}
                </div>
              </div>
            </div>

            {/* Gateway Settlement Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className={`lg:col-span-2 rounded-2xl p-6 border ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'नेपाल भुक्तानी गेटवे विभाजन' : 'Nepal Payment Gateway Distribution'}
                  </h3>
                  <span className={`text-xs font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>{isNe ? 'प्रत्यक्ष बैंक सेटलमेन्ट' : 'Direct Settlements'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>eSewa ePay</div>
                    <div className={`mt-2 text-xl font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>{analytics?.gateways?.esewa ?? 0}</div>
                    <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Instant Wallet</div>
                  </div>
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Khalti v2</div>
                    <div className={`mt-2 text-xl font-bold ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>{analytics?.gateways?.khalti ?? 0}</div>
                    <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lookup Verified</div>
                  </div>
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nepal QR / FonePay</div>
                    <div className={`mt-2 text-xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{analytics?.gateways?.fonepay ?? 0}</div>
                    <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Bank Direct</div>
                  </div>
                  <div className={`rounded-xl p-4 border text-center ${
                    isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cash on Delivery</div>
                    <div className={`mt-2 text-xl font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{analytics?.gateways?.cod ?? 0}</div>
                    <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Doorstep Cash</div>
                  </div>
                </div>

                {/* Recent Orders Snippet */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {isNe ? 'पछिल्ला अर्डरहरू' : 'Recent Inflow Orders'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}
                    >
                      {isNe ? 'सबै हेर्नुहोस् →' : 'View all orders →'}
                    </button>
                  </div>

                  <div className="space-y-2 tabular-nums">
                    {orders.slice(0, 3).map(order => (
                      <div
                        key={order.id}
                        className={`flex items-center justify-between rounded-xl p-3 border text-xs ${
                          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>#{order.orderNumber}</span>
                          <div>
                            <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>{order.shippingAddress.fullName}</div>
                            <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.shippingAddress.city} • {order.items.length} items</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>रू {Number(order.totalNpr).toLocaleString('en-IN')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? (isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-100 text-cyan-900')
                              : (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-900')
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
                isDark ? 'border-cyan-950/60 bg-gradient-to-b from-[#0d1527] to-[#080d1a]' : 'border-slate-200 bg-gradient-to-b from-white to-slate-50'
              }`}>
                <div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${
                    isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-700'
                  }`}>
                    <Send className="h-5 w-5" />
                  </div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'स्वचालित ह्वाट्सएप अर्डर अलर्ट' : 'Automated WhatsApp Invoicing'}
                  </h3>
                  <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {isNe
                      ? 'ग्राहकहरूलाई उनीहरूको अर्डर नम्बर, रकम, सामानहरूको विवरण, र डेलिभरी ट्र्याकिङ लिंकसहित नेपाली र अंग्रेजीमा स्वचालित ह्वाट्सएप सन्देश पठाउनुहोस्।'
                      : 'Send customers formatted bilingual order confirmation alerts with order ID, NPR total, item breakdown, and delivery details directly via WhatsApp.'}
                  </p>
                </div>

                <div className={`mt-6 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold transition-colors shadow-md shadow-cyan-950/20 cursor-pointer flex items-center justify-center gap-2"
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
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors hover:border-cyan-500/60 ${
                      isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Product Thumbnail with Cloudflare R2 Media */}
                      <div className={`relative aspect-4/3 w-full overflow-hidden ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
                        <img
                          src={imgUrl}
                          alt={product.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider tabular-nums ${
                            isLowStock ? 'bg-amber-400 text-slate-950' : 'bg-cyan-400 text-slate-950'
                          }`}>
                            {stock} {isNe ? 'बाँकी' : 'in stock'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className={`text-xs font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-800 font-semibold'}`}>{product.sku || 'SKU-NONE'}</div>
                        <h4 className={`mt-1 font-bold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-slate-950'}`}>{product.title}</h4>
                        <p className={`mt-1 text-xs line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 border-t flex items-center justify-between ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <div className="tabular-nums">
                        <div className={`text-base font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                          रू {Number(product.priceNpr).toLocaleString('en-IN')}
                        </div>
                        {product.compareAtPriceNpr && (
                          <div className={`text-xs line-through ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            रू {Number(product.compareAtPriceNpr).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isDark
                            ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-500/40'
                            : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-300'
                        }`}
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
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {isNe ? 'अर्डर व्यवस्थापन तथा ह्वाट्सएप अलर्ट' : 'Orders & WhatsApp Dispatch Ledger'}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'ग्राहकका लागि एक-क्लिक ह्वाट्सएप सन्देश र भुक्तानी स्थिति' : 'One-click WhatsApp customer alerts & delivery updates'}
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                className={`rounded-xl px-3 py-1.5 border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100 bg-white'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isNe ? 'रिफ्रेस' : 'Refresh'}</span>
              </button>
            </div>

            {!user && (
              <div className={`rounded-2xl p-6 border text-center space-y-3 ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <ShieldCheck className={`h-8 w-8 mx-auto ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {isNe ? 'अर्डर हेर्न मर्चेन्ट साइन-इन आवश्यक छ' : 'Sign in to view & dispatch orders'}
                </div>
                <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe
                    ? 'अर्डर विवरण र कर बिजक सुरक्षित राख्न गुगल खाताबाट साइन-इन गर्नुहोस्।'
                    : 'Customer order details and tax invoices are protected. Sign in with Google to manage fulfillment.'}
                </p>
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isNe ? 'गुगलबाट अगाडि बढ्नुहोस्' : 'Continue with Google'}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`rounded-2xl p-5 border transition-colors ${
                    isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono font-bold text-sm ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                          order.paymentStatus === 'paid'
                            ? (isDark ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-900 border border-cyan-300')
                            : (isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-900 border border-amber-300')
                        }`}>
                          {order.paymentMethod.toUpperCase()} • {order.paymentStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.fulfillmentStatus === 'delivered'
                            ? (isDark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-900')
                            : (isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800')
                        }`}>
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <div className={`mt-1 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {new Date(order.createdAt).toLocaleDateString('ne-NP', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* View IRD Tax Invoice Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                        }`}
                        title="View official IRD Schedule 5 Tax Invoice"
                      >
                        <Receipt className={`h-3.5 w-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                        <span>{isNe ? 'कर बिजक (Invoice)' : 'Tax Invoice'}</span>
                      </button>

                      {/* One-click WhatsApp Dispatch Button */}
                      <button
                        type="button"
                        onClick={() => handleDispatchWhatsApp(order)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-bold transition-colors shadow-xs cursor-pointer"
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
                          isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
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
                      <span className={`font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{isNe ? 'ग्राहक र ठेगाना' : 'Customer & Shipping'}</span>
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{order.shippingAddress.fullName}</div>
                      <div className={isDark ? 'text-cyan-300' : 'text-cyan-800 font-medium'}>{order.shippingAddress.phone}</div>
                      <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>{order.shippingAddress.address}, {order.shippingAddress.city}</div>
                    </div>

                    <div>
                      <span className={`font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{isNe ? 'सामानहरूको सूची' : 'Ordered Items'}</span>
                      <ul className="space-y-1">
                        {order.items.map(item => (
                          <li key={item.id} className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                            • {item.title} <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>x{item.quantity}</span> (रू {Number(item.totalPriceNpr).toLocaleString('en-IN')})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-right flex flex-col justify-end tabular-nums">
                      <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Subtotal: रू {Number(order.subtotalNpr).toLocaleString('en-IN')} | Delivery: रू {order.deliveryChargeNpr}
                      </div>
                      <div className={`text-lg font-bold mt-1 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
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
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {isNe ? 'नेपाल भुक्तानी गेटवे तथा कर अनुपालन' : 'Nepal Payment Gateway & Tax Compliance Status'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {isNe ? 'eSewa v2 HMAC, Khalti v2, FonePay QR र १३% भ्याट/प्यान बिलिङ' : 'Server-verified eSewa ePay v2, Khalti v2, Nepal QR EMVCo & IRD 13% VAT invoicing'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Server Payment Rail Status */}
              <div className={`rounded-2xl p-6 border ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {isNe ? 'गेटवे प्रमाणीकरण स्थिति' : 'Server Gateway Readiness'}
                  </h4>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                    gatewayStatus?.esewa?.mode === 'live'
                      ? (isDark ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-sky-50 text-sky-900 border-sky-300')
                      : (isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-cyan-50 text-cyan-900 border-cyan-300')
                  }`}>
                    {gatewayStatus?.esewa?.mode === 'live' ? 'Production Ready' : 'Sandbox Active'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div>
                      <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>eSewa ePay v2 (HMAC-SHA256)</span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Merchant: {gatewayStatus?.esewa?.merchantCode || 'EPAYTEST'} • Signed Form + Callback Verify
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase ${
                      gatewayStatus?.esewa?.mode === 'live'
                        ? (isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-100 text-cyan-900')
                        : (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-900')
                    }`}>
                      {gatewayStatus?.esewa?.mode || 'sandbox'}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div>
                      <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-950'}`}>Khalti v2 ePayment API</span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Server-side secret lookup • Auto pidx initiation
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase ${
                      gatewayStatus?.khalti?.mode === 'live'
                        ? (isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-100 text-cyan-900')
                        : (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-900')
                    }`}>
                      {gatewayStatus?.khalti?.mode || 'sandbox'}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Cash on Delivery (COD)</span>
                      <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Allow customers to pay physical cash upon arrival</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableCod(!enableCod)}
                      className={`h-6 w-11 rounded-full transition-colors relative cursor-pointer ${
                        enableCod ? 'bg-cyan-600' : (isDark ? 'bg-slate-700' : 'bg-slate-400')
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
                isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                    <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>{isNe ? 'नेपाल क्युआर (FonePay EMVCo)' : 'Nepal QR (FonePay & NRB EMVCo)'}</h4>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Compliant with Nepal Rastra Bank (NRB) National Payment Switch directives. Emits standard 524 (NPR) currency tags with dynamic order number references and PAN validation.
                  </p>

                  <div className={`mt-4 rounded-xl p-3 border font-mono text-xs break-all ${
                    isDark ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-slate-100 border-slate-200 text-cyan-900'
                  }`}>
                    {sampleQrPayload}
                  </div>
                </div>

                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    IRD PAN: {publicStoreInfo?.panNumber || currentBusiness?.panNumber || '609812453'}
                  </span>
                  <span className={`text-xs font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>NRB Benchmark Compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE STOREFRONT PREVIEW (CUSTOMER EXPERIENCE) */}
        {activeTab === 'storefront' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {isNe ? 'ग्राहक स्टोरफ्रन्ट प्रत्यक्ष झलक' : 'Public Customer Storefront'}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'ग्राहकहरूले तपाईंको स्टोरमा कसरी सामान छान्छन् र भुक्तानी गर्छन् हेर्नुहोस्' : 'Browse catalog, add to cart, and verify payment via eSewa, Khalti, or Nepal QR'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyStorefrontLink}
                  className={`rounded-xl px-3.5 py-2 border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>{isNe ? 'स्टोर लिंक कपी' : 'Share Storefront'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="relative rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold transition-colors shadow-md cursor-pointer flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{isNe ? 'झोला हेर्नुहोस्' : 'View Cart'}</span>
                  {cart.length > 0 && (
                    <span className="h-5 w-5 rounded-full bg-white text-cyan-900 flex items-center justify-center text-xs font-extrabold tabular-nums">
                      {cart.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Store Banner */}
            <div className="rounded-3xl p-8 bg-gradient-to-r from-cyan-950 via-sky-950/90 to-[#080d1a] border border-cyan-800/50 relative overflow-hidden">
              <div className="max-w-xl">
                <span className="text-xs font-bold tracking-widest uppercase text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-700/60">
                  🇳🇵 Authentic Nepali Marketplace • #{activeStoreSlug}
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {businessName}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {publicStoreInfo?.description || 'Direct from verified artisans and sovereign producers across Kathmandu, Nuwakot, and Ilam. Instant settlement via eSewa, Khalti, Nepal QR, or Cash on Delivery.'}
                </p>
              </div>
            </div>

            {/* Storefront Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors hover:border-cyan-500/60 ${
                    isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  <div className={`relative aspect-4/3 w-full ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <img
                      src={product.images?.[0]?.url || '/api/storage/mock-media?key=placeholder'}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-950'}`}>{product.title}</h4>
                      <p className={`mt-1 text-xs line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{product.description}</p>
                    </div>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`text-base font-bold tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                        रू {Number(product.priceNpr).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
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
              isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-950'
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Package className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                <h3 className="font-bold text-base">{isNe ? 'नयाँ सामान क्याटलगमा थप्नुहोस्' : 'Add New Product to Catalog'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className={`cursor-pointer p-1 rounded-lg ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'सामानको नाम (Product Title) *' : 'Product Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Single-Origin Himalayan Arabica Coffee (500g)"
                  className={`w-full rounded-xl px-3 py-2 border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                  }`}
                />
              </div>

              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'विवरण (Description)' : 'Product Description'}
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Tell buyers about ingredients, altitude, certifications..."
                  className={`w-full rounded-xl px-3 py-2 border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isNe ? 'मूल्य (Price in NPR) *' : 'Price (NPR) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="1250"
                    className={`w-full rounded-xl px-3 py-2 border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                    }`}
                  />
                </div>
                <div>
                  <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isNe ? 'प्रारम्भिक स्टक (Inventory)' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    placeholder="25"
                    className={`w-full rounded-xl px-3 py-2 border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isNe ? 'विधा छान्नुहोस् (Category)' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 border outline-none cursor-pointer ${
                    isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-slate-50 text-slate-950'
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
                <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
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

              <div className={`pt-4 border-t flex items-center justify-end gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors shadow-md cursor-pointer disabled:opacity-50"
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
              isDark ? 'bg-[#0d1527] text-slate-100 border-l border-cyan-950/60' : 'bg-white text-slate-950 border-l border-slate-200'
            }`}
          >
            <div>
              <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`} />
                  <h3 className="font-bold text-base">{isNe ? 'तपाईंको झोला' : 'Customer Cart'}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className={`cursor-pointer p-1 rounded-lg ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className={`py-16 text-center text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {isNe ? 'झोला खाली छ।' : 'Your shopping cart is empty.'}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images?.[0]?.url || '/api/storage/mock-media?key=placeholder'}
                          alt={item.product.title}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold line-clamp-1">{item.product.title}</div>
                          <div className={`tabular-nums ${isDark ? 'text-cyan-300' : 'text-cyan-800 font-semibold'}`}>रू {Number(item.product.priceNpr).toLocaleString('en-IN')} x {item.quantity}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className={`p-1 cursor-pointer ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-600 hover:text-red-600'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Form */}
              {cart.length > 0 && (
                <form onSubmit={handleCustomerCheckout} className={`mt-6 pt-4 border-t space-y-3 text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>{isNe ? 'डेलिभरी तथा भुक्तानी' : 'Shipping & Payment'}</h4>

                  <div>
                    <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={e => setCheckoutName(e.target.value)}
                      className={`w-full rounded-xl px-3 py-1.5 border outline-none ${
                        isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Phone (WhatsApp for alerts) *</label>
                    <input
                      type="text"
                      required
                      value={checkoutPhone}
                      onChange={e => setCheckoutPhone(e.target.value)}
                      placeholder="9841XXXXXX"
                      className={`w-full rounded-xl px-3 py-1.5 border outline-none ${
                        isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={checkoutAddress}
                      onChange={e => setCheckoutAddress(e.target.value)}
                      placeholder="e.g. Baneshwor, Kathmandu"
                      className={`w-full rounded-xl px-3 py-1.5 border outline-none ${
                        isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-slate-50 text-slate-950'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`font-semibold block mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Payment Rail</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'esewa', label: 'eSewa' },
                        { id: 'khalti', label: 'Khalti' },
                        { id: 'fonepay', label: 'Nepal QR' },
                        ...(enableCod ? [{ id: 'cod', label: 'COD' }] : []),
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setCheckoutPaymentMethod(g.id as any)}
                          className={`py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                            checkoutPaymentMethod === g.id
                              ? (isDark ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-cyan-700 bg-cyan-700 text-white')
                              : (isDark ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-300 bg-slate-50 text-slate-700')
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`pt-4 border-t space-y-1.5 tabular-nums ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>Subtotal</span>
                      <span>रू {cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={`flex justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span>Delivery</span>
                      <span>रू {cartDelivery}</span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold pt-1 border-t ${
                      isDark ? 'text-cyan-300 border-slate-800' : 'text-cyan-900 border-slate-200'
                    }`}>
                      <span>Total Amount</span>
                      <span>रू {cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-sky-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isPlacingOrder ? 'Processing...' : `Place Order • रू ${cartTotal.toLocaleString('en-IN')}`}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ORDER CONFIRMATION, GATEWAY VERIFICATION & WHATSAPP RECEIPT MODAL */}
      {lastPlacedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl ${
              isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-950'
            }`}
          >
            <div className="text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-3 ${
                lastPlacedOrder.order.paymentStatus === 'paid'
                  ? (isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-50 text-cyan-700')
                  : (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700')
              }`}>
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">
                {lastPlacedOrder.order.paymentStatus === 'paid'
                  ? (isNe ? 'भुक्तानी प्रमाणित भयो!' : 'Payment Verified & Confirmed!')
                  : (isNe ? 'अर्डर दर्ता भयो!' : 'Order Placed Successfully!')}
              </h3>
              <p className={`mt-1 font-mono text-sm ${isDark ? 'text-cyan-300' : 'text-cyan-800 font-bold'}`}>
                #{lastPlacedOrder.order.orderNumber}
              </p>
              <p className={`mt-2 text-xs tabular-nums ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Total: रू {Number(lastPlacedOrder.order.totalNpr).toLocaleString('en-IN')} via {lastPlacedOrder.order.paymentMethod.toUpperCase()} ({lastPlacedOrder.order.paymentStatus.toUpperCase()})
              </p>
            </div>

            {/* Interactive Gateway Verification Step for Pending Online Orders */}
            {lastPlacedOrder.order.paymentStatus !== 'paid' && lastPlacedOrder.order.paymentMethod !== 'cod' && (
              <div className={`mt-5 p-4 rounded-2xl border space-y-3 text-xs ${
                isDark ? 'bg-slate-900/70 border-cyan-500/30' : 'bg-slate-50 border-cyan-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-cyan-600 dark:text-cyan-300">
                    {lastPlacedOrder.order.paymentMethod.toUpperCase()} Settlement
                  </span>
                  <span className="font-mono text-[11px] opacity-80">
                    {lastPlacedOrder.paymentSession?.mode === 'live' ? 'LIVE' : 'SANDBOX'}
                  </span>
                </div>

                {lastPlacedOrder.paymentSession?.gateway === 'fonepay' && lastPlacedOrder.paymentSession.qrPayload && (
                  <div className={`p-2.5 rounded-xl border font-mono text-[11px] break-all ${
                    isDark ? 'bg-black/40 border-slate-800 text-cyan-300' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {lastPlacedOrder.paymentSession.qrPayload}
                  </div>
                )}

                {lastPlacedOrder.paymentSession?.gateway === 'khalti' && lastPlacedOrder.paymentSession.pidx && (
                  <div className="font-mono text-[11px] opacity-90">
                    Khalti pidx: {lastPlacedOrder.paymentSession.pidx}
                  </div>
                )}

                {lastPlacedOrder.paymentSession?.gateway === 'esewa' && lastPlacedOrder.paymentSession.esewaFields?.signature && (
                  <div className="font-mono text-[11px] opacity-90 truncate">
                    HMAC-SHA256 Signed: {lastPlacedOrder.paymentSession.esewaFields.signature}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOrderPayment}
                  disabled={isVerifyingPayment}
                  className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingPayment
                    ? 'Verifying Payment...'
                    : `Complete & Verify ${lastPlacedOrder.order.paymentMethod.toUpperCase()} Payment`}
                </button>
              </div>
            )}

            {lastPlacedOrder.whatsappAlert?.whatsappLink && (
              <div className={`mt-5 p-4 rounded-2xl border text-center ${
                isDark ? 'bg-cyan-950/30 border-cyan-800/40' : 'bg-cyan-50 border-cyan-200'
              }`}>
                <span className={`text-xs font-semibold block mb-2 ${isDark ? 'text-cyan-200' : 'text-cyan-900'}`}>
                  📲 Instant WhatsApp Notification Ready
                </span>
                <a
                  href={lastPlacedOrder.whatsappAlert.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>{isNe ? 'ह्वाट्सएपमा रसिद खोल्नुहोस्' : 'Open WhatsApp Dispatch Link'}</span>
                </a>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoiceOrder(lastPlacedOrder.order);
                  setLastPlacedOrder(null);
                }}
                className={`w-full rounded-xl py-2 text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>View &amp; Print IRD Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setLastPlacedOrder(null)}
                className={`py-1.5 text-xs cursor-pointer font-medium ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}
              >
                Close &amp; Return to Storefront
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* WHATSAPP DISPATCH PREVIEW MODAL (Zero window.open) */}
      {whatsappDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
            isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-950'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-500/20">
              <h3 className="text-sm font-bold">
                WhatsApp Alert • #{whatsappDispatchModal.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setWhatsappDispatchModal(null)}
                className="p-1 rounded-lg cursor-pointer opacity-80 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 text-xs space-y-2">
              <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                Recipient: <strong>{whatsappDispatchModal.customerName}</strong> (+{whatsappDispatchModal.phoneFormatted})
              </div>
              <pre className={`p-3 rounded-xl border text-[11px] whitespace-pre-wrap font-sans max-h-56 overflow-y-auto ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {whatsappDispatchModal.messageText}
              </pre>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(whatsappDispatchModal.messageText);
                    showToast('Copied', 'WhatsApp message copied to clipboard', 'success', 2000);
                  } catch {}
                }}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Text</span>
              </button>

              <a
                href={whatsappDispatchModal.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 text-center"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Send on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Official IRD Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
          businessName={businessName}
          businessPan={publicStoreInfo?.panNumber || currentBusiness?.panNumber || '609812453'}
          businessAddress={publicStoreInfo?.address || currentBusiness?.address || 'Ward No. 3, Lalitpur, Nepal'}
          businessPhone={publicStoreInfo?.phone || currentBusiness?.phone || '+977-1-5541200'}
          theme={theme}
          language={language}
        />
      )}
    </div>
  );
};
