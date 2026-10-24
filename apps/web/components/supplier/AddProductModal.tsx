'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ANTIQUE_MUNICIPALITIES,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  ProductSchema,
} from '@antiquesupply/shared-schemas';
import { X, Plus, AlertCircle, PackagePlus } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { activeOrg, addProduct } = useAntiqueSupplyStore();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(PRODUCT_CATEGORIES[0]?.id || 'cat-sugar');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('kg');
  const [basePrice, setBasePrice] = useState(100);
  const [moq, setMoq] = useState(5);
  const [leadTimeDays, setLeadTimeDays] = useState(3);
  const [originMunicipality, setOriginMunicipality] = useState(activeOrg.municipality || 'Laua-an');
  const [packagingDetails, setPackagingDetails] = useState('Standard moisture barrier food-grade packaging');
  const [stockAvailable, setStockAvailable] = useState(50);
  const [isMadeToOrder, setIsMadeToOrder] = useState(false);
  const [dailyCapacity, setDailyCapacity] = useState(15);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !sku.trim() || !description.trim()) {
      setError('Product name, SKU, and description are required.');
      return;
    }

    try {
      addProduct({
        organization_id: activeOrg.id,
        category_id: categoryId,
        name,
        sku,
        description,
        unit,
        base_price: Number(basePrice),
        min_order_quantity: Number(moq),
        lead_time_days: Number(leadTimeDays),
        origin_municipality: originMunicipality,
        packaging_details: packagingDetails,
        image_urls: [
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
        ],
        stock_available: Number(stockAvailable),
        is_made_to_order: isMadeToOrder,
        daily_capacity: Number(dailyCapacity),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add product');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-emerald-900/10">
        <div className="bg-antique-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900/50">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Catalog Management
            </span>
            <h2 className="text-base font-bold">List New Wholesale Product</h2>
            <p className="text-xs text-slate-400">Organization: {activeOrg.trade_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Certified Organic Muscovado 25kg Sack"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {PRODUCT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. LAU-MUSC-25K"
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure *</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              >
                {PRODUCT_UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Indicative Price (₱) *</label>
              <input
                type="number"
                min="0"
                required
                value={basePrice}
                onChange={e => setBasePrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Specifications *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail harvest conditions, certifications (FDA, CPR, CDA), processing method..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Order Qty (MOQ)</label>
              <input
                type="number"
                min="1"
                required
                value={moq}
                onChange={e => setMoq(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="0"
                required
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Municipality</label>
              <select
                value={originMunicipality}
                onChange={e => setOriginMunicipality(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              >
                {ANTIQUE_MUNICIPALITIES.map(m => (
                  <option key={m} value={m}>
                    {m}, Antique
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Packaging Details</label>
            <input
              type="text"
              value={packagingDetails}
              onChange={e => setPackagingDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isMadeToOrder}
                onChange={e => setIsMadeToOrder(e.target.checked)}
                className="rounded text-antique-green focus:ring-antique-green w-4 h-4"
              />
              <span>Made-to-Order Item</span>
            </label>

            {isMadeToOrder ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Daily Capacity:</span>
                <input
                  type="number"
                  min="1"
                  value={dailyCapacity}
                  onChange={e => setDailyCapacity(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border border-slate-300 bg-white"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Initial Stock:</span>
                <input
                  type="number"
                  min="0"
                  value={stockAvailable}
                  onChange={e => setStockAvailable(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border border-slate-300 bg-white"
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-lg shadow-sm"
            >
              Save & List Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
