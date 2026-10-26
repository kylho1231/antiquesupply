'use client';

import React, { useState, useEffect } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import { CreateQuotationSchema } from '@antiquesupply/shared-schemas';
import { X, Send, AlertCircle, DollarSign, Clock, Calendar, Truck } from 'lucide-react';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfq: any;
  onSuccess?: (quoteId: string) => void;
}

export default function CreateQuotationModal({
  isOpen,
  onClose,
  rfq,
  onSuccess,
}: CreateQuotationModalProps) {
  const { activeOrg, submitQuotation } = useAntiqueSupplyStore();

  const [deliveryFee, setDeliveryFee] = useState<number>(1500);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(4);
  const defaultValidUntil = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [validUntil, setValidUntil] = useState<string>(defaultValidUntil);
  const [commercialTerms, setCommercialTerms] = useState<string>(
    'Door-to-Jetty Port Caticlan Delivery. Net 30 days upon inspection and delivery acknowledgment.'
  );
  const [notes, setNotes] = useState<string>(
    'Guaranteed fresh milling batch with heavy-duty moisture barrier sacks.'
  );

  // Line items quote state
  const [quoteItems, setQuoteItems] = useState(
    rfq?.items?.map((it: any) => ({
      rfq_item_id: it.id,
      product_id: it.product_id,
      item_title: it.item_title,
      offered_quantity: it.quantity,
      unit: it.unit,
      unit_price: it.target_unit_price || 4200,
      line_total: (it.quantity || 1) * (it.target_unit_price || 4200),
      notes: 'Direct cooperative pricing',
    })) || []
  );

  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !rfq) return null;

  const handlePriceChange = (index: number, newPrice: number) => {
    const updated = [...quoteItems];
    updated[index].unit_price = newPrice;
    updated[index].line_total = newPrice * updated[index].offered_quantity;
    setQuoteItems(updated);
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    const updated = [...quoteItems];
    updated[index].offered_quantity = newQty;
    updated[index].line_total = updated[index].unit_price * newQty;
    setQuoteItems(updated);
  };

  const subtotal = quoteItems.reduce((acc: number, it: any) => acc + it.line_total, 0);
  const grandTotal = subtotal + Number(deliveryFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      rfq_id: rfq.id,
      supplier_org_id: activeOrg.id,
      items: quoteItems,
      subtotal,
      delivery_fee: Number(deliveryFee),
      tax_amount: 0,
      grand_total: grandTotal,
      lead_time_days: Number(leadTimeDays),
      valid_until: new Date(validUntil).toISOString(),
      commercial_terms: commercialTerms,
      notes,
    };

    const parsed = CreateQuotationSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Please check quotation fields');
      return;
    }

    try {
      const quoteId = submitQuotation(payload);
      if (onSuccess) onSuccess(quoteId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit quotation');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-quotation-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-emerald-900/10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-antique-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-emerald-900/50">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Supplier Response
            </span>
            <h2 id="create-quotation-modal-title" className="text-base font-bold text-white mt-0.5">
              Submit Commercial Quotation
            </h2>
            <p className="text-xs text-slate-300">
              Replying to {rfq.rfq_number} ({rfq.buyer_name})
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quotation dialog"
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-300 text-red-900 rounded-xl flex items-center gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Requested Items Quote Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              Item Pricing & Quantities
            </div>
            <div className="p-3.5 space-y-3">
              {quoteItems.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{item.item_title}</span>
                    <span className="font-mono text-emerald-800 font-extrabold text-sm">
                      ₱{item.line_total.toLocaleString('en-PH')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Offered Quantity ({item.unit}s)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.offered_quantity}
                        onChange={e => handleQuantityChange(idx, Number(e.target.value))}
                        className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Unit Price (₱ per {item.unit})
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.unit_price}
                        onChange={e => handlePriceChange(idx, Number(e.target.value))}
                        className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div>
              <label htmlFor="quote-delivery-fee" className="block font-bold text-slate-800 mb-1">
                Delivery Fee (PHP)
              </label>
              <input
                id="quote-delivery-fee"
                type="number"
                min="0"
                value={deliveryFee}
                onChange={e => setDeliveryFee(Number(e.target.value))}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
            <div>
              <label htmlFor="quote-lead-time" className="block font-bold text-slate-800 mb-1">
                Lead Time (Days)
              </label>
              <input
                id="quote-lead-time"
                type="number"
                min="0"
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Number(e.target.value))}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
            <div>
              <label htmlFor="quote-valid-until" className="block font-bold text-slate-800 mb-1">
                Quotation Valid Until
              </label>
              <input
                id="quote-valid-until"
                type="date"
                required
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quote-terms" className="block font-bold text-slate-800 mb-1">
              Commercial Terms & Payment Details
            </label>
            <input
              id="quote-terms"
              type="text"
              required
              value={commercialTerms}
              onChange={e => setCommercialTerms(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
            />
          </div>

          <div>
            <label htmlFor="quote-notes" className="block font-bold text-slate-800 mb-1">
              Additional Notes for Buyer
            </label>
            <textarea
              id="quote-notes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
            />
          </div>

          {/* Totals Preview */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <span className="font-bold text-slate-300 text-xs">Total Quotation Value:</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Actions (Touch targets >= 44px) */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Send className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Submit Official Quotation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
