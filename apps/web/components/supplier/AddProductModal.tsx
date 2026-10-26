'use client';

import React, { useState, useEffect } from 'react';
import PhotoEditor from '../media/PhotoEditor';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ANTIQUE_MUNICIPALITIES,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
} from '@antiquesupply/shared-schemas';
import { X, AlertCircle } from 'lucide-react';

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
  const [photos, setPhotos] = useState<string[]>([]);
  const [ownsPhotos, setOwnsPhotos] = useState(false);
  const [preparingPhotos, setPreparingPhotos] = useState(false);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (preparingPhotos || (photos.length > 0 && !ownsPhotos)) {
      setError('Please confirm that you are legally authorized to publish these product photographs.');
      return;
    }

    if (!name.trim() || !sku.trim() || !description.trim()) {
      setError('Product name, SKU code, and description are required.');
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
        image_urls: photos,
        is_demo: false,
        photo_rights_confirmed: ownsPhotos,
        stock_available: Number(stockAvailable),
        is_made_to_order: isMadeToOrder,
        daily_capacity: Number(dailyCapacity),
      });
      setPhotos([]);
      setOwnsPhotos(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add product');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-emerald-900/10 animate-in zoom-in-95 duration-150">
        <div className="bg-antique-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-emerald-900/50">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Catalog Management
            </span>
            <h2 id="add-product-modal-title" className="text-base font-bold text-white mt-0.5">
              List New Wholesale Product
            </h2>
            <p className="text-xs text-slate-300">Supplier: {activeOrg.trade_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

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

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 tracking-wide">
                Product Media & Photography
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Max 6 photos · JPG, PNG, WebP
              </span>
            </div>
            <PhotoEditor photos={photos} onChange={setPhotos} onBusyChange={setPreparingPhotos} />
            {photos.length > 0 && (
              <label className="flex items-start gap-2.5 pt-3 border-t border-slate-200 text-xs text-slate-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={ownsPhotos}
                  onChange={event => setOwnsPhotos(event.target.checked)}
                  required
                  className="mt-0.5 rounded border-slate-300 text-antique-green focus-visible:ring-2 focus-visible:ring-antique-green w-4 h-4"
                />
                <span>
                  I confirm that our organization owns or holds legal commercial rights to publish these product photographs.
                </span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-name" className="block font-bold text-slate-800 mb-1">
                Product Title *
              </label>
              <input
                id="prod-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Certified Organic Muscovado 25kg Sack"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>

            <div>
              <label htmlFor="prod-cat" className="block font-bold text-slate-800 mb-1">
                Category *
              </label>
              <select
                id="prod-cat"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              >
                {PRODUCT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="prod-sku" className="block font-bold text-slate-800 mb-1">
                SKU Code *
              </label>
              <input
                id="prod-sku"
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. LAU-MUSC-25K"
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
            <div>
              <label htmlFor="prod-unit" className="block font-bold text-slate-800 mb-1">
                Unit of Measure *
              </label>
              <select
                id="prod-unit"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              >
                {PRODUCT_UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prod-price" className="block font-bold text-slate-800 mb-1">
                Indicative Price (₱) *
              </label>
              <input
                id="prod-price"
                type="number"
                min="0"
                required
                value={basePrice}
                onChange={e => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prod-desc" className="block font-bold text-slate-800 mb-1">
              Description & Specifications *
            </label>
            <textarea
              id="prod-desc"
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail harvest conditions, certifications (FDA, CPR, CDA), processing method..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
            />
          </div>

          <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200">
            <legend className="text-[11px] font-bold text-slate-700 px-1 uppercase tracking-wider">
              Production Details
            </legend>
            <div>
              <label htmlFor="prod-moq" className="block font-bold text-slate-800 mb-1">
                Min Order Qty (MOQ)
              </label>
              <input
                id="prod-moq"
                type="number"
                min="1"
                required
                value={moq}
                onChange={e => setMoq(Number(e.target.value))}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
            <div>
              <label htmlFor="prod-lead" className="block font-bold text-slate-800 mb-1">
                Lead Time (Days)
              </label>
              <input
                id="prod-lead"
                type="number"
                min="0"
                required
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Number(e.target.value))}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              />
            </div>
            <div>
              <label htmlFor="prod-origin" className="block font-bold text-slate-800 mb-1">
                Origin Municipality
              </label>
              <select
                id="prod-origin"
                value={originMunicipality}
                onChange={e => setOriginMunicipality(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl border border-slate-300 bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              >
                {ANTIQUE_MUNICIPALITIES.map(m => (
                  <option key={m} value={m}>
                    {m}, Antique
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <div>
            <label htmlFor="prod-pkg" className="block font-bold text-slate-800 mb-1">
              Packaging Details
            </label>
            <input
              id="prod-pkg"
              type="text"
              value={packagingDetails}
              onChange={e => setPackagingDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-900">
              <input
                type="checkbox"
                checked={isMadeToOrder}
                onChange={e => setIsMadeToOrder(e.target.checked)}
                className="rounded text-antique-green focus-visible:ring-2 focus-visible:ring-antique-green w-4 h-4 cursor-pointer"
              />
              <span>Made-to-Order Production</span>
            </label>

            {isMadeToOrder ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-medium">Daily Production Capacity:</span>
                <input
                  type="number"
                  min="1"
                  value={dailyCapacity}
                  onChange={e => setDailyCapacity(Number(e.target.value))}
                  className="w-24 px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-medium">Initial In-Warehouse Stock:</span>
                <input
                  type="number"
                  min="0"
                  value={stockAvailable}
                  onChange={e => setStockAvailable(Number(e.target.value))}
                  className="w-24 px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                />
              </div>
            )}
          </div>

          {/* Actions (Touch targets >= 44px) */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={preparingPhotos}
              className="min-h-[44px] px-6 py-2.5 font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Save & List Wholesale Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
