'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  FileCheck2,
  Building2,
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface PurchaseOrderTrackerProps {
  initialPoId?: string;
}

const LIFECYCLE_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_for_dispatch', label: 'Ready' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'received', label: 'Received' },
];

export default function PurchaseOrderTracker({ initialPoId }: PurchaseOrderTrackerProps) {
  const { data, activeRole, transitionOrderStatus } = useAntiqueSupplyStore();

  const [selectedPoId, setSelectedPoId] = useState<string>(
    initialPoId || data.purchaseOrders[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedPO =
    data.purchaseOrders.find(p => p.id === selectedPoId) || data.purchaseOrders[0];
  const history = data.statusHistory.filter(h => h.po_id === selectedPO?.id);

  const currentStepIndex = LIFECYCLE_STEPS.findIndex(s => s.key === selectedPO?.status);

  const handleConfirmReceived = () => {
    if (!selectedPO) return;
    const res = transitionOrderStatus(
      selectedPO.id,
      'received',
      'Goods inspected at destination dock, signed and received in full quantity.'
    );
    if (res.success) {
      setFeedback('Delivery successfully acknowledged! Order finalized.');
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback(res.error || 'Failed to update order.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm print:hidden">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Fulfillment & Procurement Operations
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Purchase Order Management</h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Track binding commercial purchase orders, delivery dispatches, and arrival confirmation.
          </p>
        </div>

        {selectedPO && (
          <button
            onClick={handlePrint}
            aria-label="Print purchase order summary"
            className="flex items-center gap-2 min-h-[44px] px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
          >
            <Printer className="w-4 h-4 text-emerald-800" aria-hidden="true" />
            <span>Print PO Summary</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center gap-2.5 print:hidden animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: PO List on Left, Active PO Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: PO List */}
        <div className="lg:col-span-4 space-y-3 print:hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
            Purchase Orders ({data.purchaseOrders.length})
          </h2>

          <div className="space-y-2.5" role="list" aria-label="Purchase orders list">
            {data.purchaseOrders.map(po => {
              const isSelected = po.id === selectedPO?.id;
              return (
                <div
                  key={po.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPoId(po.id)}
                  onKeyDown={e => e.key === 'Enter' && setSelectedPoId(po.id)}
                  aria-pressed={isSelected}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green ${
                    isSelected
                      ? 'bg-emerald-50/90 border-antique-green shadow-xs ring-1 ring-antique-green/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-slate-700">{po.po_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold capitalize text-[10px] ${
                        po.status === 'received'
                          ? 'bg-emerald-100 text-emerald-900'
                          : po.status === 'dispatched'
                          ? 'bg-amber-100 text-amber-900'
                          : po.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {po.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs truncate">
                    {po.supplier_name}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">
                    Buyer: {po.buyer_name}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-antique-green">
                      ₱{po.grand_total.toLocaleString('en-PH')}
                    </span>
                    <span className="text-slate-500">
                      {new Date(po.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: PO Commercial Sheet & Lifecycle */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPO ? (
            <article className="bg-white rounded-3xl border border-emerald-950/10 shadow-sm p-6 sm:p-8 space-y-6">
              {/* PO Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                      {selectedPO.po_number}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-600 font-medium">
                      Issued: {new Date(selectedPO.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Commercial Purchase Order & Delivery Schedule
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Grand Total
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-antique-green">
                    ₱{selectedPO.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">PHP (Inclusive of freight)</span>
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div
                role="region"
                aria-label="Order lifecycle stages"
                className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200"
              >
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Order Lifecycle State Machine</span>
                  <span className="font-mono text-emerald-900 font-black">
                    Current: {selectedPO.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="list">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        role="listitem"
                        aria-current={isCurrent ? 'step' : undefined}
                        className="text-center"
                      >
                        <div
                          className={`h-2.5 rounded-full mb-1.5 transition-colors ${
                            isCurrent
                              ? 'bg-amber-500 shadow-xs'
                              : isDone
                              ? 'bg-antique-green'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] sm:text-xs font-bold truncate block ${
                            isCurrent
                              ? 'text-amber-900'
                              : isDone
                              ? 'text-emerald-950'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Parties & Logistics Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Buyer Card */}
                <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Buyer Organization
                  </span>
                  <p className="font-black text-slate-900 text-sm sm:text-base">{selectedPO.buyer_name}</p>
                  <p className="text-slate-700 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-4 h-4 text-antique-green shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      {selectedPO.delivery_address}, {selectedPO.delivery_municipality},{' '}
                      {selectedPO.delivery_province}
                    </span>
                  </p>
                </div>

                {/* Supplier Card */}
                <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Supplier Organization
                  </span>
                  <p className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-800" aria-hidden="true" />
                    <span>{selectedPO.supplier_name}</span>
                  </p>
                  <p className="text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>
                      Target Delivery:{' '}
                      <strong>{new Date(selectedPO.delivery_date_agreed).toLocaleDateString()}</strong>
                    </span>
                  </p>
                  {selectedPO.tracking_reference && (
                    <p className="text-slate-800 font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-300">
                      Waybill / Tracking: {selectedPO.tracking_reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Line Items & Agreed Pricing</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Snapshot locked upon acceptance
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Product Description</th>
                        <th className="p-3.5 text-center">Unit</th>
                        <th className="p-3.5 text-center">Quantity</th>
                        <th className="p-3.5 text-right">Agreed Unit Price</th>
                        <th className="p-3.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPO.items.map((it: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 text-xs">{it.item_title}</p>
                            {it.product_snapshot && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Origin: {it.product_snapshot.origin} • SKU: {it.product_snapshot.sku}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5 text-center text-slate-800 font-medium">{it.unit}</td>
                          <td className="p-3.5 text-center font-black text-slate-900">{it.quantity}</td>
                          <td className="p-3.5 text-right text-slate-800 font-mono">
                            ₱{it.agreed_unit_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                            ₱{it.line_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-medium text-xs border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="p-3 text-right text-slate-700 font-semibold">Subtotal:</td>
                        <td className="p-3 text-right font-bold text-slate-900 font-mono">
                          ₱{selectedPO.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="p-2.5 text-right text-slate-700 font-semibold">Delivery Fee (Panay Freight):</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                          ₱{selectedPO.delivery_fee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="border-t border-slate-300 text-sm">
                        <td colSpan={4} className="p-3.5 text-right font-extrabold text-slate-900">Grand Total:</td>
                        <td className="p-3.5 text-right font-black text-antique-green font-mono text-base">
                          ₱{selectedPO.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Commercial Terms & Notes */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider block">
                  Agreed Commercial Terms
                </span>
                <p>{selectedPO.commercial_terms}</p>
                {selectedPO.notes && <p className="italic text-slate-600 mt-1">{selectedPO.notes}</p>}
              </div>

              {/* Audit Status History */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Order Status Audit Trail
                </h3>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {history.map((log: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span className="capitalize text-slate-600">{log.previous_status || 'Draft'}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          <span className="capitalize text-antique-green font-black">
                            {log.new_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1">{log.notes}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 shrink-0 font-medium">
                        <p className="font-bold text-slate-700">{log.changed_by_name}</p>
                        <p>{new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Action: Confirm Delivery Receipt */}
              {selectedPO.status === 'delivered' && (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden animate-in fade-in">
                  <div>
                    <h4 className="font-black text-emerald-950 text-xs sm:text-sm">
                      Shipment Marked as Delivered by Supplier
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      Please inspect goods upon delivery. Click below to confirm receipt and finalize the order.
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmReceived}
                    className="min-h-[44px] px-6 py-2.5 bg-antique-green hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span>Confirm Receipt of Goods</span>
                  </button>
                </div>
              )}
            </article>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-800 mt-2">No Purchase Order Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
