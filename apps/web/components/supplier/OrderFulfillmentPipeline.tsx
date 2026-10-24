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
  ArrowRight,
  ShieldAlert,
  Calendar,
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
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Supplier Operations
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Order Fulfillment Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept buyer orders, schedule packing/milling, dispatch with tracking, and verify delivery.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
          {[
            { id: 'all', label: `All (${supplierOrders.length})` },
            { id: 'pending', label: 'Action Required' },
            { id: 'processing', label: 'In Production' },
            { id: 'transit', label: 'In Transit' },
            { id: 'completed', label: 'Delivered' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No orders in this stage</h3>
          <p className="text-xs text-slate-500">
            When buyers accept your commercial quotations, their purchase orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(po => {
            const isDispatched = po.status === 'dispatched';
            const isReady = po.status === 'ready_for_dispatch';

            return (
              <div
                key={po.id}
                className="bg-white rounded-2xl border border-emerald-950/10 p-5 shadow-sm space-y-4 hover:border-amber-200 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                      {po.po_number}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold capitalize text-[10px] ${
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
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                      Buyer: {po.buyer_name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-antique-green">
                      ₱{po.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Target: {new Date(po.delivery_date_agreed).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Items & Delivery Destination */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Items Ordered</span>
                    {po.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                        <span className="font-medium text-slate-800">{it.item_title}</span>
                        <span className="font-bold text-slate-900">
                          {it.quantity} {it.unit}s
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Delivery Location</span>
                    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700">
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        {po.delivery_municipality}, {po.delivery_province}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{po.delivery_address}</p>
                      {po.tracking_reference && (
                        <p className="text-[10px] font-mono text-emerald-800 font-semibold mt-1">
                          Waybill / Tracking: {po.tracking_reference}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dispatch Modal / Drawer inline */}
                {selectedPoForDispatch === po.id && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-3 animate-in fade-in duration-150">
                    <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-700" />
                      Enter Freight & Carrier Information for Dispatch
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                          Carrier / Logistics Company *
                        </label>
                        <input
                          type="text"
                          value={dispatchCarrier}
                          onChange={e => setDispatchCarrier(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                          Tracking Reference / Van Plate Number *
                        </label>
                        <input
                          type="text"
                          value={dispatchTracking}
                          onChange={e => setDispatchTracking(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setSelectedPoForDispatch(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-amber-100 rounded"
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
                        className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-xs"
                      >
                        Confirm Dispatch & Release Stock
                      </button>
                    </div>
                  </div>
                )}

                {/* State Machine Transition Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Next allowable workflow action:
                  </span>

                  <div className="flex items-center gap-2">
                    {po.status === 'submitted' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            po.id,
                            'confirmed',
                            'Supplier confirmed order receipt and allocated mill inventory.'
                          )
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
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
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
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
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Mark Ready for Dispatch</span>
                      </button>
                    )}

                    {po.status === 'ready_for_dispatch' && !selectedPoForDispatch && (
                      <button
                        onClick={() => setSelectedPoForDispatch(po.id)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
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
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Delivered to Destination</span>
                      </button>
                    )}

                    {po.status === 'delivered' && (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        Awaiting Buyer Receipt Confirmation
                      </span>
                    )}

                    {po.status === 'received' && (
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed & Settled</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
