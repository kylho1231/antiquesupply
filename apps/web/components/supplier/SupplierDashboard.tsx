'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  TrendingUp,
  FileText,
  PackageCheck,
  AlertTriangle,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import CreateQuotationModal from './CreateQuotationModal';
import AddProductModal from './AddProductModal';
import Photo from '../media/Photo';

interface SupplierDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function SupplierDashboard({ onNavigateToTab }: SupplierDashboardProps) {
  const { data, activeOrg } = useAntiqueSupplyStore();

  const [selectedRfqToQuote, setSelectedRfqToQuote] = useState<any>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Supplier metrics
  const myOrders = data.purchaseOrders.filter(
    po => po.supplier_org_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );
  const totalRevenue = myOrders.reduce((sum, po) => sum + (po.status !== 'cancelled' ? po.grand_total : 0), 0);
  const activeFulfillments = myOrders.filter(
    po => po.status !== 'received' && po.status !== 'cancelled'
  ).length;

  const myProducts = data.products.filter(
    p => p.organization_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  const lowStockProducts = myProducts.filter(p => {
    const inv = data.inventory[p.id];
    return inv && !inv.is_made_to_order && inv.available_stock <= inv.low_stock_threshold;
  });

  const incomingRfqs = data.rfqs.filter(
    r =>
      !r.supplier_org_id ||
      r.supplier_org_id === activeOrg.id ||
      activeOrg.id === 'admin-platform'
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] overflow-hidden rounded-3xl bg-white border border-stone-200 shadow-sm">
        <div className="aspect-video">
          <Photo
            src="/images/editorial/philippine-logistics.webp"
            alt="Warehouse at the port of Nasipit, Philippines"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <p className="uppercase tracking-widest text-xs text-emerald-800 font-bold">
            From local craft to commercial supply
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Show buyers the products you make.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Add clear photographs of your goods, packaging and available sizes. Logistics illustration: the port of Nasipit in Mindanao. This is not a supplier facility or an Antique location.
          </p>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-antique-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Cooperative Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {activeOrg.trade_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            {activeOrg.description ||
              'Cooperative supplier hub for commercial quotations, order fulfillment, and Panay logistics.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>List New Product</span>
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('orders')}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>View Active Orders ({activeFulfillments})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
            <span>Orders Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-antique-green">
            ₱{totalRevenue.toLocaleString('en-PH')}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">{myOrders.length} commercial orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
            <span>Fulfillments</span>
            <PackageCheck className="w-4 h-4 text-blue-600" aria-hidden="true" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700">{activeFulfillments}</div>
          <p className="text-[11px] text-slate-500">Scheduled for dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
            <span>Incoming RFQs</span>
            <FileText className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{incomingRfqs.length}</div>
          <p className="text-[11px] text-slate-500">Awaiting commercial quotes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
            <span>Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
          </div>
          <div
            className={`text-xl sm:text-2xl font-black ${
              lowStockProducts.length > 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {lowStockProducts.length > 0 ? 'Action required in warehouse' : 'Stock levels healthy'}
          </p>
        </div>
      </div>

      {/* Incoming RFQs Workspace for Supplier */}
      <div className="bg-white rounded-3xl border border-emerald-950/10 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
              Direct Inquiries & Marketplace Requests
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Incoming Buyer RFQs ({incomingRfqs.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Panay & Antique Buyers</span>
        </div>

        <div className="space-y-3">
          {incomingRfqs.map(rfq => {
            const myQuote = data.quotations.find(
              q => q.rfq_id === rfq.id && q.supplier_org_id === activeOrg.id
            );

            return (
              <div
                key={rfq.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-700">{rfq.rfq_number}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-900">{rfq.buyer_name}</span>
                    <span className="text-[10px] font-semibold bg-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                      {rfq.delivery_municipality}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{rfq.title}</h3>
                  <p className="text-xs text-slate-600">
                    Deadline: {new Date(rfq.response_deadline).toLocaleDateString()} • Target Delivery:{' '}
                    {new Date(rfq.target_delivery_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {myQuote ? (
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-emerald-800 font-bold block">Quotation Sent</span>
                      <span className="text-sm font-extrabold text-antique-green">
                        ₱{myQuote.grand_total.toLocaleString('en-PH')}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedRfqToQuote(rfq)}
                      className="min-h-[44px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                      <span>Submit Quotation</span>
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

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}
