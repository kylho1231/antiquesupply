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
  ChevronRight,
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
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
            Fulfillment & Procurement Operations
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Order Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track binding commercial purchase orders, delivery dispatches, and arrival confirmation.
          </p>
        </div>

        {selectedPO && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-emerald-800" />
            <span>Print PO Summary</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: PO List on Left, Active PO Details on Right */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: PO List */}
        <div className="lg:col-span-4 space-y-3 print:hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            Purchase Orders ({data.purchaseOrders.length})
          </h2>

          <div className="space-y-2.5">
            {data.purchaseOrders.map(po => {
              const isSelected = po.id === selectedPO?.id;
              return (
                <div
                  key={po.id}
                  onClick={() => setSelectedPoId(po.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/90 border-antique-green shadow-sm ring-1 ring-antique-green/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-slate-700">{po.po_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold capitalize text-[10px] ${
                        po.status === 'received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'dispatched'
                          ? 'bg-amber-100 text-amber-800'
                          : po.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {po.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs truncate">
                    {po.supplier_name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Buyer: {po.buyer_name}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
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
            <div className="bg-white rounded-2xl border border-emerald-950/10 shadow-sm p-6 space-y-6">
              {/* PO Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {selectedPO.po_number}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500">
                      Issued: {new Date(selectedPO.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    Commercial Purchase Order & Delivery Schedule
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Grand Total</span>
                  <div className="text-2xl font-black text-antique-green">
                    ₱{selectedPO.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">PHP (Inclusive of delivery)</span>
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Order Lifecycle State Machine</span>
                  <span className="font-mono text-emerald-800">
                    Current: {selectedPO.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step.key} className="text-center">
                        <div
                          className={`h-2 rounded-full mb-1.5 transition-colors ${
                            isCurrent
                              ? 'bg-amber-500 shadow-sm'
                              : isDone
                              ? 'bg-antique-green'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-semibold truncate block ${
                            isCurrent
                              ? 'text-amber-800 font-bold'
                              : isDone
                              ? 'text-emerald-900'
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
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {/* Buyer Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Buyer Organization</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedPO.buyer_name}</p>
                  <p className="text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>
                      {selectedPO.delivery_address}, {selectedPO.delivery_municipality},{' '}
                      {selectedPO.delivery_province}
                    </span>
                  </p>
                </div>

                {/* Supplier Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Supplier Organization</span>
                  <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-800" />
                    <span>{selectedPO.supplier_name}</span>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Target Delivery:{' '}
                      {new Date(selectedPO.delivery_date_agreed).toLocaleDateString()}
                    </span>
                  </p>
                  {selectedPO.tracking_reference && (
                    <p className="text-slate-700 font-mono text-[11px] bg-white p-1.5 rounded border border-slate-200">
                      Carrier Track #: {selectedPO.tracking_reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items Table (Frozen Commercial Snapshot) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Line Items & Agreed Pricing</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Snapshot locked upon acceptance
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Product Description</th>
                      <th className="p-3 text-center">Unit</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Agreed Unit Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPO.items.map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{it.item_title}</p>
                          {it.product_snapshot && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Origin: {it.product_snapshot.origin} • SKU: {it.product_snapshot.sku}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-center text-slate-700">{it.unit}</td>
                        <td className="p-3 text-center font-bold text-slate-900">{it.quantity}</td>
                        <td className="p-3 text-right text-slate-700">
                          ₱{it.agreed_unit_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-900">
                          ₱{it.line_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 font-medium text-xs border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right text-slate-600">Subtotal:</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₱{selectedPO.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2 text-right text-slate-600">Delivery Fee (Panay Freight):</td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        ₱{selectedPO.delivery_fee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-300 text-sm">
                      <td colSpan={4} className="p-3 text-right font-bold text-slate-900">Grand Total:</td>
                      <td className="p-3 text-right font-black text-antique-green">
                        ₱{selectedPO.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Commercial Terms & Notes */}
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                  Agreed Commercial Terms
                </span>
                <p>{selectedPO.commercial_terms}</p>
                {selectedPO.notes && <p className="italic text-slate-600 mt-1">{selectedPO.notes}</p>}
              </div>

              {/* Audit Status History */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Order Status Audit Trail
                </h3>
                <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {history.map((log: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="capitalize text-emerald-800">{log.previous_status || 'Draft'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="capitalize text-antique-green font-bold">
                            {log.new_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{log.notes}</p>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 shrink-0">
                        <p>{log.changed_by_name}</p>
                        <p>{new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Action: Confirm Delivery Receipt */}
              {selectedPO.status === 'delivered' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between gap-3 print:hidden">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">Shipment Marked as Delivered by Supplier</h4>
                    <p className="text-[11px] text-emerald-800">
                      Inspect goods upon delivery. Click below to confirm receipt and finalize the order.
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmReceived}
                    className="px-5 py-2.5 bg-antique-green hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Confirm Receipt of Goods</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 mt-2">No Purchase Order Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
