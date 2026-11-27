'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/Footer';
import { useStore } from '@/context/StoreContext';
import {
  ShieldAlert,
  CreditCard,
  Lock,
  ArrowRight,
  Truck,
  Weight,
  AlertCircle,
  ChevronLeft,
  Sparkles,
  Scale,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, shipping, t, deliveryLocation } = useStore();

  const [formData, setFormData] = useState({
    name: 'Ananya Sen',
    email: 'ananya.sen@example.com',
    phone: '+91 91234 56789',
    street: 'Apartment 4B, Heritage Enclave, Salt Lake Sector 2',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700091',
    paymentMethod: 'ONLINE_UPI_CARD',
  });

  useEffect(() => {
    if (deliveryLocation && deliveryLocation.trim()) {
      setFormData((prev) => ({
        ...prev,
        street: deliveryLocation.trim(),
      }));
    }
  }, [deliveryLocation]);

  const [idempotencyKey] = useState<string>(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <StoreHeader />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="text-5xl">🍯</div>
          <h2 className="text-2xl font-serif font-black text-amber-950">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-stone-500">
            Please select your favorite artisanal honey jars to proceed with checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold text-xs shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            Explore Varieties
          </Link>
        </div>
        <StoreFooter />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullShippingAddress = `${formData.street}, ${formData.city}, ${formData.state} - ${formData.postalCode}`;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: fullShippingAddress,
          billingAddress: fullShippingAddress,
          paymentMethod: formData.paymentMethod,
          paymentTransactionId: formData.paymentMethod === 'ONLINE_UPI_CARD' ? `TXN-${Date.now()}` : null,
          idempotencyKey,
          items: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      const tokenQuery = data.order?.guestAccessToken ? `?token=${encodeURIComponent(data.order.guestAccessToken)}` : '';
      router.push(`/order-success/${data.order.id}${tokenQuery}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative">
      <StoreHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-amber-950">
            {t('checkout.title', 'Complete Your Honey Consignment')}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Single-vendor direct harvest consignment • Instant GST Tax Invoice Generated
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Shipping & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Destination Glass Card */}
            <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-5">
              <h2 className="font-serif font-black text-base text-amber-950 flex items-center gap-2.5 border-b border-amber-100 pb-3">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>{t('checkout.shipping_details', 'Shipping Destination')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.name', 'Full Name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.email', 'Email Address')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.phone', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.address', 'Street Address & Apartment')} *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.city', 'City / District')} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.state', 'State')} *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5">
                    {t('checkout.pincode', 'Postal PIN Code')} *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-3 text-xs rounded-2xl border border-stone-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector Glass Card */}
            <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-4">
              <h2 className="font-serif font-black text-base text-amber-950 flex items-center gap-2.5 border-b border-amber-100 pb-3">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>{t('checkout.payment_method', 'Payment Options')}</span>
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'ONLINE_UPI_CARD'
                      ? 'border-amber-600 bg-amber-500/15 ring-2 ring-amber-600/40 shadow-md'
                      : 'glass-card hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE_UPI_CARD"
                    checked={formData.paymentMethod === 'ONLINE_UPI_CARD'}
                    onChange={handleInputChange}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-amber-950">
                      {t('checkout.pay_online', 'Instant Online Payment (UPI, Credit/Debit Cards, Net Banking)')}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Fastest dispatch • Secured via 256-bit TLS encrypted Payment Gateway
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'COD'
                      ? 'border-amber-600 bg-amber-500/15 ring-2 ring-amber-600/40 shadow-md'
                      : 'glass-card hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleInputChange}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-amber-950">
                      {t('checkout.pay_cod', 'Cash on Delivery (COD)')}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Pay cash or UPI upon delivery directly to the courier agent
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary: Consignment Breakdown & Final CTA (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-2xl shadow-amber-950/5 space-y-5">
              <h3 className="font-serif font-black text-base text-amber-950 border-b border-amber-100 pb-3">
                Consignment Summary
              </h3>

              {/* Items in Consignment */}
              <div className="divide-y divide-amber-100 max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {cart.map((item) => (
                  <div key={item.variantId} className="pt-2 flex justify-between items-start text-xs">
                    <div>
                      <div className="font-bold text-stone-900">
                        {item.quantity}x {item.title}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {item.netWeightGrams}g ({item.packagingType === 'GLASS_JAR' ? 'Glass' : 'PET'}) • Gross: ~{item.grossWeightGrams * item.quantity}g
                      </div>
                    </div>
                    <div className="font-bold font-serif text-amber-950">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight Breakdown Callout */}
              <div className="p-3.5 rounded-2xl glass-card-amber border border-amber-300 text-xs text-amber-950 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-700" />
                    Total Gross Courier Tare:
                  </span>
                  <span className="font-mono text-sm">
                    {shipping.totalGrossWeightGrams}g ({(shipping.totalGrossWeightGrams / 1000).toFixed(2)}kg)
                  </span>
                </div>
                {shipping.hasGlassPackaging && (
                  <div className="text-[10px] text-amber-900 flex items-center gap-1.5 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Fragile Glass jars enclosed (protective air packaging applied)</span>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs pt-2 border-t border-amber-100">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal (Taxable Value):</span>
                  <span>₹{shipping.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5% Inclusive):</span>
                  <span>₹{Math.round(shipping.subtotal * 0.05 * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Courier Shipping:</span>
                  <span>
                    {shipping.shippingFee === 0 ? (
                      <strong className="text-emerald-700 font-bold">FREE</strong>
                    ) : (
                      `₹${shipping.shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black font-serif text-amber-950 pt-2 border-t border-amber-200">
                  <span>Total Payable:</span>
                  <span>₹{(shipping.subtotal + shipping.shippingFee).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-black text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 disabled:opacity-50 shimmer-button"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Securing Harvest Order...'
                    : t('checkout.place_order_btn', 'Confirm & Place Honey Order')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-stone-400 font-medium">
                Automated 1-Click Tax Invoice & Thermal Barcode Label generated immediately.
              </div>
            </div>
          </div>
        </form>
      </main>

      <StoreFooter />
    </div>
  );
}
