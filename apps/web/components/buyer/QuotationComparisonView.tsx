'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  FileText,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Truck,
  Plus,
} from 'lucide-react';
import CreateRFQModal from './CreateRFQModal';

interface QuotationComparisonViewProps {
  onNavigateToOrder?: (poId: string) => void;
}

export default function QuotationComparisonView({
  onNavigateToOrder,
}: QuotationComparisonViewProps) {
  const { data, acceptQuotation } = useAntiqueSupplyStore();

  const [selectedRfqId, setSelectedRfqId] = useState<string>(data.rfqs[0]?.id || '');
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedRfq = data.rfqs.find(r => r.id === selectedRfqId) || data.rfqs[0];
  const relatedQuotations = data.quotations.filter(q => q.rfq_id === selectedRfq?.id);

  const handleAcceptQuotation = (quotationId: string) => {
    setActionMessage(null);
    const result = acceptQuotation(quotationId);
    if (result.success && result.poId) {
      setActionMessage({
        type: 'success',
        text: `Quotation approved! Purchase Order successfully created and inventory locked.`,
      });
      if (onNavigateToOrder) {
        setTimeout(() => onNavigateToOrder(result.poId!), 1200);
      }
    } else {
      setActionMessage({
        type: 'error',
        text: result.error || 'Failed to accept quotation.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
            Commercial Sourcing Engine
          </span>
          <h1 className="text-2xl font-bold text-slate-900">RFQ & Quotation Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming supplier bids, compare unit prices and delivery terms, and issue purchase orders.
          </p>
        </div>

        <button
          onClick={() => setIsCreateRfqOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-antique-green text-white hover:bg-emerald-800 rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Sourcing RFQ</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in duration-200 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Grid: RFQ Selector (Left) & Quotation Comparison Matrix (Right) */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: RFQ List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            Active Sourcing RFQs ({data.rfqs.length})
          </h2>

          <div className="space-y-2.5">
            {data.rfqs.map(rfq => {
              const isSelected = rfq.id === selectedRfq?.id;
              const quoteCount = data.quotations.filter(q => q.rfq_id === rfq.id).length;

              return (
                <div
                  key={rfq.id}
                  onClick={() => setSelectedRfqId(rfq.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/90 border-antique-green shadow-sm ring-1 ring-antique-green/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-slate-600">{rfq.rfq_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold capitalize text-[10px] ${
                        rfq.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : rfq.status === 'quoted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rfq.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                    {rfq.title}
                  </h3>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{quoteCount} {quoteCount === 1 ? 'Quotation' : 'Quotations'}</span>
                    <span className="font-medium text-slate-700">
                      Target: {new Date(rfq.target_delivery_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected RFQ Overview & Quotation Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRfq ? (
            <>
              {/* Selected RFQ Snapshot */}
              <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold">
                      {selectedRfq.rfq_number}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{selectedRfq.title}</h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-100 text-antique-green font-bold rounded-full">
                    Target Budget: ₱{selectedRfq.target_budget?.toLocaleString('en-PH') || 'N/A'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Destination</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedRfq.delivery_municipality}, {selectedRfq.delivery_province}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{selectedRfq.delivery_address}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Deadline for Bids</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {new Date(selectedRfq.response_deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase">Target Delivery</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {new Date(selectedRfq.target_delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* RFQ Items requested */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100/70 px-3.5 py-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Requested Line Items
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {selectedRfq.items.map((item: any) => (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{item.item_title}</p>
                          <p className="text-slate-500 text-[11px]">{item.specifications}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">
                            {item.quantity} {item.unit}s
                          </span>
                          {item.target_unit_price && (
                            <p className="text-[10px] text-slate-500">
                              Target ₱{item.target_unit_price} / {item.unit}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quotations Received */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Supplier Commercial Quotations</span>
                    <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                      {relatedQuotations.length} Received
                    </span>
                  </h3>
                </div>

                {relatedQuotations.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
                    <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-800">
                      Awaiting responses from Antique producers & cooperatives
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Suppliers have been notified and are preparing bids for your delivery date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {relatedQuotations.map(quote => {
                      const isAccepted = quote.status === 'accepted';
                      const supplier = data.organizations.find(o => o.id === quote.supplier_org_id);

                      return (
                        <div
                          key={quote.id}
                          className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                            isAccepted
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                              : 'border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-mono font-bold text-slate-700">
                                  {quote.quotation_number}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="font-bold text-emerald-800 flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {quote.supplier_name}
                                </span>
                                {supplier?.verified_status === 'verified' && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Valid until: {new Date(quote.valid_until).toLocaleDateString()} • Lead time: {quote.lead_time_days} days
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-semibold text-slate-500">Total Commercial Offer</span>
                              <div className="text-2xl font-black text-antique-green">
                                ₱{quote.grand_total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>

                          {/* Line items quoted */}
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="text-[10px] text-slate-500 uppercase font-semibold border-b border-slate-200 pb-1">
                                    <th className="pb-1.5">Offered Product</th>
                                    <th className="pb-1.5 text-center">Quantity</th>
                                    <th className="pb-1.5 text-right">Unit Price</th>
                                    <th className="pb-1.5 text-right">Line Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {quote.items.map((it: any, idx: number) => (
                                    <tr key={idx} className="text-xs">
                                      <td className="py-2 font-medium text-slate-800">
                                        {it.item_title}
                                        {it.notes && (
                                          <span className="block text-[10px] text-emerald-700 italic">
                                            {it.notes}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 text-center text-slate-700 font-semibold">
                                        {it.offered_quantity} {it.unit}s
                                      </td>
                                      <td className="py-2 text-right text-slate-700">
                                        ₱{it.unit_price.toLocaleString('en-PH')}
                                      </td>
                                      <td className="py-2 text-right font-bold text-slate-900">
                                        ₱{it.line_total.toLocaleString('en-PH')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                                <span>Delivery Fee: ₱{quote.delivery_fee.toLocaleString('en-PH')}</span>
                                <span className="font-semibold">Subtotal: ₱{quote.subtotal.toLocaleString('en-PH')}</span>
                              </div>
                            </div>

                            {/* Terms */}
                            <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                              <span className="font-bold text-amber-900">Commercial Terms: </span>
                              {quote.commercial_terms}
                            </div>
                          </div>

                          {/* Acceptance Action */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            {isAccepted ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Accepted & Converted to Purchase Order</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Accepting this quote reserves stock & issues PO.</span>
                              </div>
                            )}

                            {!isAccepted && (
                              <button
                                onClick={() => handleAcceptQuotation(quote.id)}
                                className="px-5 py-2.5 bg-antique-green hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02] flex items-center gap-1.5"
                              >
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span>Accept Quotation & Issue PO</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 mt-2">No RFQ Selected</p>
              <p className="text-xs text-slate-500">Select an RFQ on the left or publish a new one.</p>
            </div>
          )}
        </div>
      </div>

      <CreateRFQModal
        isOpen={isCreateRfqOpen}
        onClose={() => setIsCreateRfqOpen(false)}
        onSuccess={rfqId => setSelectedRfqId(rfqId)}
      />
    </div>
  );
}
