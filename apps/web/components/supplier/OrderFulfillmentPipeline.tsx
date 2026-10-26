'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { OrderStatus } from '@antiquesupply/shared-schemas';

export default function OrderFulfillmentPipeline() {
  const { data, activeOrg, transitionOrderStatus } = useAntiqueSupplyStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [dispatchCarrier, setDispatchCarrier] = useState('Panay Express Freight Co.');
  const [dispatchTracking, setDispatchTracking] = useState('PNY-2026-LOG-781');
  const [selectedPoForDispatch, setSelectedPoForDispatch] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter orders where supplier is activeOrg
  const supplierOrders = data.purchaseOrders.filter(
    po => po.supplier_org_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  const filteredOrders = supplierOrders.filter(po => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return po.status === 'submitted' || po.status === 'confirmed';
    if (activeTab === 'processing') return po.status === 'preparing' || po.status === 'ready_for_dispatch';
    if (activeTab === 'transit') return po.status === 'dispatched';
    if (activeTab === 'completed') return po.status === 'delivered' || po.status === 'received';
    return true;
  });

  const handleAdvanceStatus = (
    poId: string,
    nextStatus: OrderStatus,
    notes?: string,
    tracking?: string
  ) => {
    setFeedback(null);
    const res = transitionOrderStatus(poId, nextStatus, notes, tracking);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Order transitioned to "${nextStatus.replace(/_/g, ' ')}" successfully.`,
      });
      setSelectedPoForDispatch(null);
      setTimeout(() => setFeedback(null), 3500);
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Failed to transition order status.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
            Supplier Operations
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Order Fulfillment Pipeline</h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Accept buyer orders, schedule packing/milling, dispatch with tracking, and verify delivery.
          </p>
        </div>

        {/* Tab Filter */}
        <div
          role="tablist"
          aria-label="Filter fulfillment pipeline orders"
          className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold self-start sm:self-auto overflow-x-auto scrollbar-none"
        >
          {[
            { id: 'all', label: `All (${supplierOrders.length})` },
            { id: 'pending', label: 'Action Required' },
            { id: 'processing', label: 'In Production' },
            { id: 'transit', label: 'In Transit' },
            { id: 'completed', label: 'Delivered' },
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div
          role="status"
          className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3"
        >
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" aria-hidden="true" />
          <h3 className="text-base font-bold text-slate-800">No orders in this stage</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            When buyers accept your commercial quotations, their purchase orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(po => {
            return (
              <article
                key={po.id}
                className="bg-white rounded-3xl border border-emerald-950/10 p-5 sm:p-6 shadow-sm space-y-4 hover:border-amber-300 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {po.po_number}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full font-bold capitalize text-[10px] ${
                        po.status === 'received'
                          ? 'bg-emerald-100 text-emerald-900'
                          : po.status === 'dispatched'
                          ? 'bg-amber-100 text-amber-900'
                          : po.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-900'
                          : po.status === 'preparing'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {po.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-800" aria-hidden="true" />
                      Buyer: {po.buyer_name}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-sm sm:text-base font-black text-antique-green font-mono">
                      ₱{po.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      Agreed Delivery: {new Date(po.delivery_date_agreed).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Items & Delivery Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Items Ordered
                    </span>
                    {po.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                        <span className="font-bold text-slate-900">{it.item_title}</span>
                        <span className="font-extrabold text-slate-900">
                          {it.quantity} {it.unit}s
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Location
                    </span>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-antique-green" aria-hidden="true" />
                        <span>{po.delivery_municipality}, {po.delivery_province}</span>
                      </p>
                      <p className="text-[11px] text-slate-600">{po.delivery_address}</p>
                      {po.tracking_reference && (
                        <p className="text-[11px] font-mono text-emerald-900 font-bold bg-white p-1.5 rounded-lg border border-slate-200 mt-1">
                          Waybill / Tracking: {po.tracking_reference}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dispatch Modal / Drawer inline */}
                {selectedPoForDispatch === po.id && (
                  <div className="p-4 sm:p-5 bg-amber-50/90 rounded-2xl border border-amber-300 space-y-3 animate-in fade-in duration-150">
                    <h4 className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-700" aria-hidden="true" />
                      <span>Enter Freight & Carrier Information for Dispatch</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-950 mb-1">
                          Carrier / Logistics Company *
                        </label>
                        <input
                          type="text"
                          value={dispatchCarrier}
                          onChange={e => setDispatchCarrier(e.target.value)}
                          className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-amber-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-950 mb-1">
                          Tracking Reference / Waybill # *
                        </label>
                        <input
                          type="text"
                          value={dispatchTracking}
                          onChange={e => setDispatchTracking(e.target.value)}
                          className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-amber-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setSelectedPoForDispatch(null)}
                        className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            po.id,
                            'dispatched',
                            `Dispatched via ${dispatchCarrier} (Ref: ${dispatchTracking})`,
                            dispatchTracking
                          )
                        }
                        className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        Confirm Dispatch & Release Stock
                      </button>
                    </div>
                  </div>
                )}

                {/* State Machine Transition Actions (Touch targets >= 44px) */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Next allowable workflow action:
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {po.status === 'submitted' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            po.id,
                            'confirmed',
                            'Supplier confirmed order receipt and allocated mill inventory.'
                          )
                        }
                        className="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Confirm Purchase Order</span>
                      </button>
                    )}

                    {po.status === 'confirmed' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            po.id,
                            'preparing',
                            'Production batch scheduled. Bagging and palletizing in progress.'
                          )
                        }
                        className="min-h-[44px] px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                      >
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span>Start Production / Milling</span>
                      </button>
                    )}

                    {po.status === 'preparing' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            po.id,
                            'ready_for_dispatch',
                            'Goods packed in moisture-barrier bags and cleared for dispatch.'
                          )
                        }
                        className="min-h-[44px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <PackageCheck className="w-4 h-4" aria-hidden="true" />
                        <span>Mark Ready for Dispatch</span>
                      </button>
                    )}

                    {po.status === 'ready_for_dispatch' && !selectedPoForDispatch && (
                      <button
                        onClick={() => setSelectedPoForDispatch(po.id)}
                        className="min-h-[44px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        <Truck className="w-4 h-4" aria-hidden="true" />
                        <span>Dispatch Shipment</span>
                      </button>
                    )}

                    {po.status === 'dispatched' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            po.id,
                            'delivered',
                            'Carrier successfully delivered shipment to receiving dock.'
                          )
                        }
                        className="min-h-[44px] px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Mark Delivered to Destination</span>
                      </button>
                    )}

                    {po.status === 'delivered' && (
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-300">
                        Awaiting Buyer Receipt Confirmation
                      </span>
                    )}

                    {po.status === 'received' && (
                      <span className="text-xs font-bold text-emerald-950 bg-emerald-100 px-4 py-2.5 rounded-xl flex items-center gap-2 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        <span>Completed & Settled</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
