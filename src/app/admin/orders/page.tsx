'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  FileText,
  Printer,
  Search,
  ShieldAlert,
  X,
  Sparkles,
  Scale,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<any | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    let url = `/api/orders?status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update order status');
      }
    } catch (e: any) {
      alert(e.message || 'Status transition failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">Pending</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'PACKED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">Packed</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">Shipped</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">{status}</span>;
    }
  };

  return (
    <div className="flex-1 pb-16">
      <AdminHeader title="Orders & Dispatch Pipeline" />

      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter & Search Glass Bar */}
        <div className="rounded-3xl glass-card border border-white/90 p-4 shadow-xl shadow-amber-950/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-600/30'
                    : 'glass-pill text-stone-600 hover:text-amber-950'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders();
            }}
            className="flex items-center gap-2 w-full md:w-80"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Order # or Buyer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Orders Table Glass Card */}
        <div className="rounded-3xl glass-card border border-white/90 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-amber-950 text-amber-100 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer & Shipping</th>
                  <th className="p-4">Honey Items</th>
                  <th className="p-4">Gross Weight & Safety</th>
                  <th className="p-4">Total & Payment</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-stone-500">
                      Loading order pipeline...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-stone-500">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-mono font-black text-amber-950 text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="p-4 align-top max-w-[200px]">
                        <div className="font-bold text-stone-900">{order.customerName}</div>
                        <div className="text-[11px] text-stone-500">{order.customerPhone}</div>
                        <div className="text-[11px] text-stone-500 truncate" title={order.shippingAddress}>
                          {order.shippingAddress}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="space-y-1">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="text-[11px] text-stone-800">
                              <span className="font-bold text-amber-950">{item.quantity}x</span> {item.productTitle}{' '}
                              <span className="text-stone-500">({item.variantTitle})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="font-bold text-stone-900 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-stone-400" />
                          <span>{order.totalGrossWeightGrams} g</span>
                        </div>
                        {order.hasGlassPackaging ? (
                          <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950 border border-amber-300">
                            <ShieldAlert className="w-3 h-3 text-amber-700" />
                            FRAGILE GLASS
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                            PET Standard
                          </span>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <div className="font-black text-sm text-amber-950 font-serif">
                          ₹{order.totalAmount}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Prepaid'}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700">
                          {order.paymentStatus}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        {getStatusBadge(order.status)}
                        {/* Status Transition Selector */}
                        <div className="mt-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-[11px] p-1.5 rounded-xl border border-stone-200 bg-white/90 text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-600 shadow-2xs"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PACKED">Packed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled (Restock)</option>
                          </select>
                        </div>
                      </td>

                      <td className="p-4 align-top text-right space-y-1.5">
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="w-full flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-stone-800 text-[11px] font-bold border border-stone-200 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-600" />
                          <span>Tax Invoice</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForLabel(order)}
                          className="w-full flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white text-[11px] font-bold transition-all shadow-md shadow-amber-600/20"
                        >
                          <Printer className="w-3.5 h-3.5 text-white" />
                          <span>Thermal Label</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 1-Click Print Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 text-stone-900 border border-stone-200">
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Tax Invoice Container */}
            <div id="printable-tax-invoice" className="border border-stone-300 p-6 rounded-2xl bg-stone-50/40">
              <div className="flex justify-between items-start border-b border-stone-300 pb-4">
                <div>
                  <div className="text-xl font-black font-serif text-amber-950 flex items-center gap-2">
                    🍯 Artisanal Royal Honey Co. Ltd.
                  </div>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Suite 104, Apiary Reserve, Western Ghats, Karnataka 577101
                  </p>
                  <p className="text-xs font-mono font-semibold text-stone-700 mt-1">
                    GSTIN: 07AAAAA0000A1Z5 | HSN: 04090000
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-amber-950 text-amber-200 font-bold text-xs uppercase tracking-wider rounded-xl">
                    TAX INVOICE
                  </span>
                  <div className="text-xs font-mono font-bold text-stone-900 mt-2">
                    {selectedOrderForInvoice.invoice?.invoiceNumber || `INV-2026-${selectedOrderForInvoice.orderNumber.split('-')[2]}`}
                  </div>
                  <div className="text-xs text-stone-500">
                    Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-stone-300 text-xs">
                <div>
                  <div className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Billed & Shipped To:
                  </div>
                  <div className="font-semibold text-stone-900 mt-1">{selectedOrderForInvoice.customerName}</div>
                  <div className="text-stone-600">{selectedOrderForInvoice.shippingAddress}</div>
                  <div className="text-stone-600">Phone: {selectedOrderForInvoice.customerPhone}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Order Details:
                  </div>
                  <div className="text-stone-900 font-mono mt-1">Order Ref: {selectedOrderForInvoice.orderNumber}</div>
                  <div className="text-stone-600">Payment: {selectedOrderForInvoice.paymentMethod}</div>
                  <div className="text-stone-600">Status: {selectedOrderForInvoice.paymentStatus}</div>
                </div>
              </div>

              <table className="w-full text-xs my-4">
                <thead>
                  <tr className="border-b border-stone-300 text-stone-500 text-[10px] uppercase">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-center">HSN</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {selectedOrderForInvoice.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2">
                        <div className="font-semibold text-stone-900">{item.productTitle}</div>
                        <div className="text-[10px] text-stone-500">{item.variantTitle} (SKU: {item.sku})</div>
                      </td>
                      <td className="py-2 text-center font-mono">04090000</td>
                      <td className="py-2 text-center font-bold">{item.quantity}</td>
                      <td className="py-2 text-right">₹{item.unitPrice}</td>
                      <td className="py-2 text-right font-bold">₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-stone-300 pt-3 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal (Taxable Value):</span>
                  <span>₹{selectedOrderForInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>CGST (2.5%):</span>
                  <span>₹{Math.round((selectedOrderForInvoice.taxAmount / 2) * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>SGST (2.5%):</span>
                  <span>₹{Math.round((selectedOrderForInvoice.taxAmount / 2) * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Gross Courier Shipping Fee:</span>
                  <span>₹{selectedOrderForInvoice.shippingFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-amber-950 pt-2 border-t border-stone-300 font-serif">
                  <span>Total Invoice Amount (INR):</span>
                  <span>₹{selectedOrderForInvoice.totalAmount}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-300 text-[10px] text-stone-500 text-center">
                This is a computer-generated tax invoice and requires no physical signature. Registered under Indian GST Act.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Thermal Shipping Label Modal */}
      {selectedOrderForLabel && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200">
            <button
              onClick={() => setSelectedOrderForLabel(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Standard 4x6" Thermal Label Layout */}
            <div
              id="printable-thermal-label"
              className="border-2 border-black p-4 rounded bg-white text-black font-sans leading-tight shadow-inner"
              style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}
            >
              {/* Header with Carrier */}
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <div>
                  <div className="font-bold text-sm tracking-wider uppercase">
                    HONEYEXPRESS CARGO
                  </div>
                  <div className="text-[10px] uppercase font-semibold">
                    Surface Express / Standard
                  </div>
                </div>
                <div className="text-right">
                  <span className="border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                    {selectedOrderForLabel.paymentMethod === 'COD' ? 'C.O.D.' : 'PREPAID'}
                  </span>
                </div>
              </div>

              {/* Scannable Barcode Mockup */}
              <div className="text-center py-3 border-b-2 border-black">
                <div className="font-mono text-xl tracking-[0.25em] font-black uppercase">
                  ||||| | |||| ||| ||||| || ||||
                </div>
                <div className="font-mono text-xs font-bold tracking-widest mt-1">
                  {selectedOrderForLabel.shippingLabel?.trackingNumber || 'AWB-8837192401'}
                </div>
              </div>

              {/* Destination Address */}
              <div className="py-2.5 border-b-2 border-black text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  Deliver To (Recipient):
                </div>
                <div className="font-black text-sm uppercase mt-0.5">
                  {selectedOrderForLabel.customerName}
                </div>
                <div className="font-semibold text-xs leading-snug mt-1">
                  {selectedOrderForLabel.shippingAddress}
                </div>
                <div className="font-bold text-xs mt-1">
                  TEL: {selectedOrderForLabel.customerPhone}
                </div>
              </div>

              {/* Weight & Packaging details */}
              <div className="grid grid-cols-2 gap-2 py-2 border-b-2 border-black text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase">Gross Weight:</span>
                  <div className="font-black text-base">
                    {selectedOrderForLabel.totalGrossWeightGrams} g
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase">Order ID:</span>
                  <div className="font-mono font-bold text-xs">
                    {selectedOrderForLabel.orderNumber}
                  </div>
                </div>
              </div>

              {/* AUTOMATED HANDLE WITH CARE - FRAGILE GLASS BADGE */}
              {selectedOrderForLabel.hasGlassPackaging && (
                <div className="my-2 p-2 bg-yellow-300 border-2 border-black text-center text-black font-black text-xs tracking-wider uppercase animate-pulse">
                  ⚠️ HANDLE WITH CARE — FRAGILE GLASS JAR
                </div>
              )}

              {/* Return Address */}
              <div className="pt-2 text-[10px] leading-tight">
                <span className="font-bold uppercase">Return If Undelivered To:</span>
                <div>Artisanal Royal Honey Co. Ltd., Suite 104, Apiary Reserve, Western Ghats, KA 577101</div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrderForLabel(null)}
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <Printer className="w-4 h-4" />
                Print 4x6 Thermal Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
