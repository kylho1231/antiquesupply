'use client';

import React, { useState } from 'react';
import Navbar from '../../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../../lib/store';
import AddProductModal from '../../../components/supplier/AddProductModal';
import { ProductPhoto } from '../../../components/media/Photo';
import EditProductPhotos from '../../../components/media/EditProductPhotos';
import { Plus, Image as ImageIcon } from 'lucide-react';

export default function SupplierProductsPage() {
  const { data, activeOrg } = useAntiqueSupplyStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPhotos, setEditingPhotos] = useState<any>(null);

  const products = data.products.filter(
    p => p.organization_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAddProduct={() => setIsAddOpen(true)} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
              Catalog Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Cooperative Product Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Add new wholesale items, adjust indicative prices, lead times, and specifications.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>List New Product</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-3xl overflow-hidden border border-emerald-950/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square bg-slate-100 overflow-hidden">
                  <ProductPhoto product={p} contain />
                </div>
                <div className="p-6 space-y-3">
                  <span className="font-mono text-[10px] text-slate-500 block">SKU: {p.sku}</span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>

                  <button
                    onClick={() => setEditingPhotos(p)}
                    className="min-h-[40px] px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-antique-green hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                  >
                    <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Manage Photos ({p.image_urls.length})</span>
                  </button>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-black text-antique-green text-sm">
                      ₱{p.base_price.toLocaleString('en-PH')} <span className="text-xs font-normal text-slate-600">/ {p.unit}</span>
                    </span>
                    <span className="text-slate-600 font-semibold">MOQ: {p.min_order_quantity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      {editingPhotos && (
        <EditProductPhotos
          key={editingPhotos.id}
          product={editingPhotos}
          onClose={() => setEditingPhotos(null)}
        />
      )}
    </div>
  );
}
