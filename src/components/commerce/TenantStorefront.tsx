import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Receipt,
  Store,
  MapPin,
  Phone
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { CommerceProduct, CommerceCategory, CommerceOrder } from './CommercePortal';
import { TaxInvoiceModal } from './TaxInvoiceModal';

export interface TenantStorefrontProps {
  theme: ThemeMode;
  language: Language;
  storeSlug?: string;
  onNavigateBack?: () => void;
}

export const TenantStorefront: React.FC<TenantStorefrontProps> = ({
  theme,
  language,
  storeSlug = 'himalayan-coffee',
  onNavigateBack,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';

  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [categories, setCategories] = useState<CommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<Array<{ product: CommerceProduct; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Pooja Shrestha');
  const [customerPhone, setCustomerPhone] = useState('9841234567');
  const [customerAddress, setCustomerAddress] = useState('Lazimpat, Kathmandu');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'cod'>('esewa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success dialog
  const [placedOrderData, setPlacedOrderData] = useState<{ order: CommerceOrder; whatsappAlert?: any } | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CommerceOrder | null>(null);

  // Store profile metadata
  const storeProfile = {
    name: 'Himalayan Sovereign Organic Store',
    slug: storeSlug,
    panNumber: '609812453',
    location: 'Ward No. 3, Lalitpur & Kathmandu Valley',
    phone: '+977-9841234567',
    tagline: 'Direct organic mountain produce, artisan crafts & sovereign technology',
    bannerUrl: '/api/storage/mock-media?key=banners/storefront-banner.jpg',
    logoUrl: '/api/storage/mock-media?key=logos/store-logo.jpg',
  };

  useEffect(() => {
    async function fetchStoreData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/commerce/products?businessId=biz_default'),
          fetch('/api/commerce/categories?businessId=biz_default'),
        ]);

        if (prodRes.ok) {
          const p = await prodRes.json();
          setProducts(p.products || []);
        }
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || []);
        }
      } catch (err) {
        console.error('Failed to load store data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStoreData();
  }, [storeSlug]);

  // Cart operations
  const addToCart = (product: CommerceProduct) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<{ product: CommerceProduct; quantity: number }>;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.priceNpr) * item.quantity), 0);
  const delivery = cart.length > 0 ? 100 : 0;
  const grandTotal = subtotal + delivery;

  // Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/commerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: 'biz_default',
          customer: {
            fullName: customerName.trim(),
            phone: customerPhone.trim(),
            address: customerAddress.trim(),
            city: 'Kathmandu'
          },
          items: cart.map(i => ({
            productId: i.product.id,
            title: i.product.title,
            unitPriceNpr: i.product.priceNpr,
            quantity: i.quantity
          })),
          paymentMethod,
          deliveryChargeNpr: delivery,
          notes: 'Customer direct purchase from public storefront'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlacedOrderData(data);
        setCart([]);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
      }
    } catch (err) {
      console.error('Order submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${
      isDark ? 'bg-[#080d1a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Store Navigation Bar */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
        isDark ? 'border-cyan-950/40 bg-[#080d1a]/90' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isNe ? 'फर्कनुहोस्' : 'Back'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-cyan-400" />
              <span className="font-bold text-sm sm:text-base tracking-tight">{storeProfile.name}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-cyan-950/20 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{isNe ? 'झोला' : 'Cart'}</span>
            <span className="ml-1 rounded-full bg-white text-cyan-900 px-1.5 py-0.2 text-2xs font-extrabold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </button>
        </div>
      </nav>

      {/* Hero Storefront Banner */}
      <div className="relative border-b border-cyan-900/30 overflow-hidden bg-gradient-to-r from-[#0d1527] via-cyan-950/30 to-[#080d1a]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-2xs font-bold tracking-wide uppercase mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified NepalAI Merchant • IRD PAN: {storeProfile.panNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {storeProfile.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {storeProfile.tagline}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-cyan-400" /> {storeProfile.location}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-cyan-400" /> {storeProfile.phone}</span>
              </div>
            </div>

            <div className={`rounded-2xl p-4 border text-center ${
              isDark ? 'border-cyan-950/60 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
            }`}>
              <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">{isNe ? 'भुक्तानी स्वीकार' : 'Accepted Rails'}</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs">eSewa</span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs">Khalti</span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs">FonePay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isNe ? 'सबै सामान' : 'All Catalog'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border text-xs w-full sm:w-64 ${
            isDark ? 'border-slate-800 bg-[#0d1527]' : 'border-slate-200 bg-white'
          }`}>
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isNe ? 'सामान खोज्नुहोस्...' : 'Search items...'}
              className="bg-transparent outline-none w-full text-xs"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:border-cyan-500/40 hover:shadow-lg ${
                isDark ? 'border-slate-800/80 bg-[#0d1527]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <div className="relative aspect-4/3 w-full bg-slate-900/60 overflow-hidden">
                <img
                  src={product.images?.[0]?.url || '/api/storage/mock-media?key=placeholder'}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1">{product.title}</h3>
                  <p className={`mt-1.5 text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
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
                    className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isNe ? 'झोलामा' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Slide-Over Drawer */}
      <AnimatePresence>
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
                    <h3 className="font-bold text-base">{isNe ? 'तपाईंको झोला' : 'Shopping Cart'}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    {isNe ? 'तपाईंको झोला खाली छ।' : 'Your shopping cart is empty.'}
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
                            <div className="text-cyan-400">रू {Number(item.product.priceNpr).toLocaleString('en-IN')}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-2 text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>रू {subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span>रू {delivery}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-cyan-400 pt-1 border-t border-slate-800">
                      <span>Total Amount</span>
                      <span>रू {grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-sky-400 transition-all cursor-pointer"
                  >
                    {isNe ? 'भुक्तानीमा जानुहोस् (Checkout)' : `Proceed to Checkout • रू ${grandTotal.toLocaleString('en-IN')}`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-bold text-base">{isNe ? 'अर्डर विवरण तथा भुक्तानी' : 'Checkout & Payment'}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 border border-slate-700 bg-slate-900 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Phone (WhatsApp for alerts) *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="9841XXXXXX"
                    className="w-full rounded-xl px-3 py-2 border border-slate-700 bg-slate-900 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Delivery Address in Nepal *</label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="Street, Municipality, City"
                    className="w-full rounded-xl px-3 py-2 border border-slate-700 bg-slate-900 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Select Nepal Payment Rail</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'esewa', label: 'eSewa' },
                      { id: 'khalti', label: 'Khalti' },
                      { id: 'cod', label: 'Cash on Delivery' },
                    ].map(rail => (
                      <button
                        key={rail.id}
                        type="button"
                        onClick={() => setPaymentMethod(rail.id as any)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          paymentMethod === rail.id
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-xs'
                            : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {rail.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-cyan-400">
                  <span>Grand Total (NPR):</span>
                  <span>रू {grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 hover:from-cyan-500 hover:to-sky-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming Order...' : `Confirm & Place Order`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post-Checkout Success & Tax Invoice Dialog */}
      <AnimatePresence>
        {placedOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">
                  {isNe ? 'अर्डर सफलतापूर्वक सम्पन्न भयो!' : 'Order Placed Successfully!'}
                </h3>
                <p className="mt-1 font-mono text-sm text-cyan-400">
                  #{placedOrderData.order.orderNumber}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Total: रू {Number(placedOrderData.order.totalNpr).toLocaleString('en-IN')} via {placedOrderData.order.paymentMethod.toUpperCase()}
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                {/* View Official Tax Invoice Button */}
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(placedOrderData.order)}
                  className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Receipt className="h-4 w-4 text-cyan-400" />
                  <span>{isNe ? 'आधिकारिक कर बिजक हेर्नुहोस् (IRD Invoice)' : 'View Official IRD Tax Invoice'}</span>
                </button>

                {/* WhatsApp Dispatch Link */}
                {placedOrderData.whatsappAlert?.whatsappLink && (
                  <a
                    href={placedOrderData.whatsappAlert.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>{isNe ? 'ह्वाट्सएपमा रसिद पठाउनुहोस्' : 'Send WhatsApp Confirmation'}</span>
                  </a>
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setPlacedOrderData(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
          businessName={storeProfile.name}
          businessPan={storeProfile.panNumber}
          businessAddress={storeProfile.location}
          businessPhone={storeProfile.phone}
          theme={theme}
          language={language}
        />
      )}
    </div>
  );
};
