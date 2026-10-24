'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../../lib/store';
import AddProductModal from '../../../components/supplier/AddProductModal';
import { Plus, Package, Clock, Building2, MapPin } from 'lucide-react';

export default function SupplierProductsPage() {
  const { data, activeOrg } = useAntiqueSupplyStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const products = data.products.filter(
    p => p.organization_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAddProduct={() => setIsAddOpen(true)} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
              Catalog Administration
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Cooperative Product Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">
              Add new wholesale items, adjust indicative prices, lead times, and specifications.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>List New Product</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={p.image_urls[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  <div className="pt-2 flex justify-between text-xs">
                    <span className="font-bold text-antique-green">
                      ₱{p.base_price.toLocaleString('en-PH')} / {p.unit}
                    </span>
                    <span className="text-slate-500">MOQ: {p.min_order_quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
