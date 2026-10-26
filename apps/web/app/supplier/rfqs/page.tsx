'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../../lib/store';
import CreateQuotationModal from '../../../components/supplier/CreateQuotationModal';
import { Send } from 'lucide-react';

export default function SupplierRFQsPage() {
  const { data, activeOrg } = useAntiqueSupplyStore();
  const [selectedRfqToQuote, setSelectedRfqToQuote] = useState<any>(null);

  const incomingRfqs = data.rfqs.filter(
    r => !r.supplier_org_id || r.supplier_org_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
              Commercial Opportunities
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Incoming RFQs Inbox
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Buyer requests from Boracay, Aklan, and Antique seeking wholesale supply.
            </p>
          </div>
          <span className="text-xs px-3.5 py-2 bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-200 self-start sm:self-auto">
            {incomingRfqs.length} Active Requests
          </span>
        </div>

        <div className="space-y-4">
          {incomingRfqs.map(rfq => {
            const myQuote = data.quotations.find(
              q => q.rfq_id === rfq.id && q.supplier_org_id === activeOrg.id
            );

            return (
              <article
                key={rfq.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {rfq.rfq_number}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-900">{rfq.buyer_name}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {rfq.delivery_municipality}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{rfq.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Deadline: {new Date(rfq.response_deadline).toLocaleDateString()} • Target Delivery:{' '}
                    {new Date(rfq.target_delivery_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-700 italic">"{rfq.notes}"</p>
                </div>

                <div className="shrink-0">
                  {myQuote ? (
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-emerald-800 block">Quoted</span>
                      <span className="text-base font-black text-antique-green font-mono">
                        ₱{myQuote.grand_total.toLocaleString('en-PH')}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedRfqToQuote(rfq)}
                      className="min-h-[44px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Send className="w-4 h-4 text-white" aria-hidden="true" />
                      <span>Submit Official Bid</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <CreateQuotationModal
        isOpen={Boolean(selectedRfqToQuote)}
        onClose={() => setSelectedRfqToQuote(null)}
        rfq={selectedRfqToQuote}
      />
    </div>
  );
}
