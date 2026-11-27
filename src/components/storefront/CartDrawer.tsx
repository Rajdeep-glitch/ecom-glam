'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
  Scale,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    t,
    shipping,
    direction,
    deliveryLocation,
    setDeliveryLocation,
  } = useStore();
  const [locationError, setLocationError] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    if (!deliveryLocation.trim()) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred Tinted Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-md transition-opacity duration-300"
      />

      <div className={`fixed inset-y-0 ${direction === 'rtl' ? 'left-0' : 'right-0'} max-w-full flex pl-6 sm:pl-10`}>
        <div className="w-screen max-w-md bg-white/90 backdrop-blur-2xl border-l border-white/80 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-white/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-amber-950">
                  {t('cart.title', 'Your Honey Consignment')}
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-amber-100/80 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Glass Safety Warning Banner if fragile packaging is present */}
          {shipping.hasGlassPackaging && (
            <div className="bg-amber-100/80 backdrop-blur-md border-b border-amber-300 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-snug">
                {t(
                  'cart.glass_warning_banner',
                  'Glass Protection Enabled: Your order contains fragile glass jars and will receive reinforced shock-absorbent thermal sealing.'
                )}
              </div>
            </div>
          )}

          {/* Free Shipping Progress Meter with Luminous Bar */}
          <div className="p-3.5 bg-amber-50/50 border-b border-amber-100 text-xs">
            {shipping.freeShippingQualified ? (
              <div className="text-emerald-700 font-bold flex items-center gap-1.5 justify-center py-0.5">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>You have unlocked FREE Courier Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-stone-700">
                  <span>Add ₹{shipping.amountNeededForFreeShipping} for FREE Shipping</span>
                  <span className="text-amber-800 font-bold">Threshold: ₹{shipping.freeShippingThreshold}</span>
                </div>
                <div className="w-full h-2.5 bg-amber-200/60 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-xs"
                    style={{
                      width: `${Math.min(100, (shipping.subtotal / shipping.freeShippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-stone-500 space-y-3">
                <div className="text-5xl">🍯</div>
                <p className="text-sm font-medium">
                  {t('cart.empty', 'Your cart is empty. Indulge in raw natural honey today!')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-full text-xs font-bold shadow-md shadow-amber-600/30"
                >
                  {t('hero.cta_shop', 'Browse Varieties')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3.5 p-3.5 rounded-2xl glass-card border border-white/80 hover:border-amber-300 transition-all shadow-sm"
                >
                  <img
                    src={item.imageUrl || '/hero-honey.jpg'}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-amber-200/70 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {item.title}
                    </h4>

                    {/* Packaging & Weight specification */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          item.packagingType === 'GLASS_JAR'
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.netWeightGrams}g • {item.packagingType === 'GLASS_JAR' ? 'Glass' : 'PET'}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        (~{item.grossWeightGrams}g)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-900 font-serif">
                          ₹{item.price}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-[10px] text-stone-400 line-through">
                            ₹{item.mrp}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200/80 rounded-xl overflow-hidden bg-white/80 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-amber-50 text-stone-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1 hover:bg-amber-50 text-stone-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-stone-300 hover:text-red-500 p-1 self-start transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-amber-200/60 bg-amber-50/40 backdrop-blur-md space-y-3.5">
              {/* Gross Weight Sum */}
              <div className="flex items-center justify-between text-xs text-amber-950 glass-card p-3 rounded-2xl border border-white/90">
                <span className="flex items-center gap-2 font-semibold">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>{t('cart.total_weight', 'Total Consignment Tare')}:</span>
                </span>
                <span className="font-mono font-bold text-amber-950">
                  {shipping.totalGrossWeightGrams} g ({(shipping.totalGrossWeightGrams / 1000).toFixed(2)} kg)
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs px-1">
                <div className="flex justify-between text-stone-600">
                  <span>{t('cart.subtotal', 'Subtotal')}</span>
                  <span>₹{shipping.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t('cart.estimated_tax', 'GST (5% Included)')}</span>
                  <span>₹{Math.round(shipping.subtotal * 0.05 * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t('cart.shipping_est', 'Courier Shipping')}</span>
                  <span>
                    {shipping.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `₹${shipping.shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold font-serif text-amber-950 pt-2 border-t border-stone-200/70">
                  <span>Total Amount</span>
                  <span>₹{(shipping.subtotal + shipping.shippingFee).toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Location Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('cart.delivery_location', 'Delivery Location')}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => {
                    setDeliveryLocation(e.target.value);
                    if (e.target.value.trim()) setLocationError(false);
                  }}
                  placeholder="Enter delivery city, area, or pincode..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white/90 text-xs text-stone-900 placeholder:text-stone-400 border focus:outline-none focus:ring-2 transition-all ${
                    locationError
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-amber-200 focus:ring-amber-400'
                  }`}
                />
                {locationError && (
                  <p className="text-[11px] text-red-600 font-semibold">
                    Please enter your delivery location before proceeding to checkout.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-600/30 transition-all hover:scale-101 shimmer-button"
              >
                <span>{t('cart.proceed_to_checkout', 'Proceed to Secure Checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
