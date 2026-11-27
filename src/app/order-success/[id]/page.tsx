'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StoreHeader from '@/components/storefront/StoreHeader';
import StoreFooter from '@/components/storefront/Footer';
import {
  CheckCircle,
  Truck,
  Printer,
  ShieldAlert,
  ChevronLeft,
  Scale,
  Sparkles,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const token = searchParams.get('token');
    const url = token
      ? `/api/orders/${params.id}?token=${encodeURIComponent(token)}`
      : `/api/orders/${params.id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <StoreHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-4xl animate-spin text-amber-600">🍯</div>
        </div>
        <StoreFooter />
      </div>
    );
  }

  if (!order || order.error) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <StoreHeader />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-serif font-black text-amber-950">
            Order Not Found
          </h2>
          <p className="text-xs text-stone-500">
            We could not locate this order consignment.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold text-xs shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        <StoreFooter />
      </div>
    );
  }

  const steps = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.status) > -1 ? steps.indexOf(order.status) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative">
      <StoreHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Success Header Glass Card */}
        <div className="rounded-[2.5rem] glass-card border border-white/90 p-8 sm:p-10 shadow-2xl shadow-amber-950/5 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif font-black text-2xl sm:text-4xl text-amber-950">
              Honey Consignment Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Thank you for ordering, <strong>{order.customerName}</strong>. Your harvest is being carefully packaged with reinforced cushioning.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2 glass-card-amber rounded-full border border-amber-300 text-xs">
            <span className="text-stone-600 font-medium">Order Reference:</span>
            <span className="font-mono font-black text-amber-950 text-sm">{order.orderNumber}</span>
          </div>
        </div>

        {/* Live Delivery Status Tracker Glass Card */}
        <div className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-5">
          <h3 className="font-serif font-black text-sm text-amber-950 flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Live Consignment Delivery Pipeline</span>
          </h3>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
            {steps.map((st, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              return (
                <div key={st} className="space-y-2">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center mx-auto text-xs font-black transition-all ${
                      isPastOrCurrent
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-600/30 scale-105'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isPastOrCurrent ? 'text-amber-950' : 'text-stone-400'
                    }`}
                  >
                    {st}
                  </div>
                </div>
              );
            })}
          </div>

          {order.shippingLabel?.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-amber-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-stone-600">
              <span>Carrier Partner: <strong>{order.shippingLabel.courierPartner}</strong></span>
              <span>AWB Tracking: <strong className="font-mono text-amber-950">{order.shippingLabel.trackingNumber}</strong></span>
            </div>
          )}
        </div>

        {/* Consignment Items & Printable Tax Invoice Details */}
        <div id="printable-tax-invoice" className="rounded-3xl glass-card border border-white/90 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-start border-b border-stone-200 pb-4">
            <div>
              <div className="font-serif font-black text-xl text-amber-950">
                🍯 Artisanal Royal Honey Co. Ltd.
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Suite 104, Apiary Reserve, Western Ghats, Karnataka 577101
              </p>
              <p className="text-xs font-mono font-semibold text-stone-700 mt-1">
                GSTIN: 07AAAAA0000A1Z5 | HSN: 04090000 (Natural Honey)
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-amber-950 text-amber-200 font-bold text-xs uppercase tracking-wider rounded-xl">
                TAX INVOICE
              </span>
              <div className="text-xs font-mono font-bold text-stone-900 mt-2">
                {order.invoice?.invoiceNumber || `INV-2026-${order.orderNumber.split('-')[2]}`}
              </div>
              <div className="text-xs text-stone-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                Shipping Destination:
              </div>
              <div className="font-semibold text-stone-900 mt-1">{order.customerName}</div>
              <div className="text-stone-600">{order.shippingAddress}</div>
              <div className="text-stone-600">Phone: {order.customerPhone}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                Consignment Metadata:
              </div>
              <div className="text-stone-900 font-mono mt-1">Order: {order.orderNumber}</div>
              <div className="text-stone-600">Payment: {order.paymentMethod} ({order.paymentStatus})</div>
              <div className="text-stone-900 font-semibold mt-1">
                Gross Tare: {order.totalGrossWeightGrams}g
              </div>
            </div>
          </div>

          {/* Table of Items */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-[10px] uppercase">
                <th className="py-2.5 text-left">Harvest Variety</th>
                <th className="py-2.5 text-center">HSN</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {order.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2.5">
                    <div className="font-semibold text-stone-900">{item.productTitle}</div>
                    <div className="text-[10px] text-stone-500">
                      {item.variantTitle} (SKU: {item.sku}) • Tare: {item.grossWeightGrams}g
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-mono">04090000</td>
                  <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-2.5 text-right">₹{item.unitPrice}</td>
                  <td className="py-2.5 text-right font-bold">₹{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Breakdown */}
          <div className="border-t border-stone-200 pt-3 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal (Taxable Value):</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>CGST (2.5%):</span>
              <span>₹{Math.round((order.taxAmount / 2) * 100) / 100}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>SGST (2.5%):</span>
              <span>₹{Math.round((order.taxAmount / 2) * 100) / 100}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Courier Logistics Shipping:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold font-serif text-amber-950 pt-2 border-t border-stone-200">
              <span>Total Amount Paid (INR):</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          {order.hasGlassPackaging && (
            <div className="p-3.5 rounded-2xl glass-card-amber border border-amber-300 text-xs text-amber-950 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Consignment contains Fragile Glass packaging. Dispatched with shock-resistant cushioning.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-amber-800 hover:text-amber-950"
          >
            <ChevronLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <button
            onClick={() => window.print()}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-amber-600/30"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Tax Invoice
          </button>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
