'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../../lib/store';
import CreateQuotationModal from '../../../components/supplier/CreateQuotationModal';
import { FileText, Send, Building2, Calendar, MapPin } from 'lucide-react';

export default function SupplierRFQsPage() {
  const { data, activeOrg } = useAntiqueSupplyStore();
  const [selectedRfqToQuote, setSelectedRfqToQuote] = useState<any>(null);

  const incomingRfqs = data.rfqs.filter(
    r => !r.supplier_org_id || r.supplier_org_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
              Commercial Opportunities
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Incoming RFQs Inbox</h1>
            <p className="text-xs text-slate-500 mt-1">
              Buyer requests from Boracay, Aklan, and Antique seeking wholesale supply.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg border border-amber-200">
            {incomingRfqs.length} Active Requests
          </span>
        </div>

        <div className="space-y-4">
          {incomingRfqs.map(rfq => {
            const myQuote = data.quotations.find(
              q => q.rfq_id === rfq.id && q.supplier_org_id === activeOrg.id
            );

            return (
              <div
                key={rfq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-700">{rfq.rfq_number}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-900">{rfq.buyer_name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {rfq.delivery_municipality}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{rfq.title}</h3>
                  <p className="text-xs text-slate-500">
                    Deadline: {new Date(rfq.response_deadline).toLocaleDateString()} • Target Delivery:{' '}
                    {new Date(rfq.target_delivery_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600 italic">"{rfq.notes}"</p>
                </div>

                <div className="shrink-0">
                  {myQuote ? (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700 block">Quoted</span>
                      <span className="text-sm font-extrabold text-antique-green">
                        ₱{myQuote.grand_total.toLocaleString('en-PH')}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedRfqToQuote(rfq)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Official Bid</span>
                    </button>
                  )}
                </div>
              </div>
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
