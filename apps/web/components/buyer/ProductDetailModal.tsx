'use client';

import React, { useEffect } from 'react';
import ProductGallery from '../media/ProductGallery';
import { Product } from '@antiquesupply/shared-schemas';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  X,
  MapPin,
  Clock,
  Package,
  ShieldCheck,
  FileText,
  Building2,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestQuote: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onRequestQuote,
}: ProductDetailModalProps) {
  const { data } = useAntiqueSupplyStore();

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const supplier = data.organizations.find(o => o.id === product.organization_id);
  const inv = data.inventory[product.id];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-emerald-900/10 animate-in zoom-in-95 duration-150">
        {/* Close Button (44x44px touch target) */}
        <button
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-950 shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image gallery */}
          <div className="bg-stone-100 overflow-hidden flex flex-col justify-between">
            <ProductGallery key={product.id} product={product} />
            <div className="text-slate-700 text-xs px-4 py-3 flex items-center gap-1.5 bg-stone-200/50 border-t border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-antique-green shrink-0" aria-hidden="true" />
              <span className="font-semibold">
                {product.is_demo ? 'Sample listing origin' : 'Product origin'}: {product.origin_municipality}, Antique
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Supplier header */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1.5">
                <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{supplier?.trade_name || 'Antique Verified Cooperative'}</span>
                {supplier?.verified_status === 'verified' && (
                  <span title="Verified Cooperative Organization">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  </span>
                )}
              </div>

              <h2
                id="product-detail-modal-title"
                className="text-xl sm:text-2xl font-black text-slate-900 leading-snug"
              >
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>

              {/* Price & MOQ */}
              <div className="mt-4 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Indicative Price
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-antique-green">
                      ₱{product.base_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-700 font-medium"> / {product.unit}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-700 flex items-center justify-between mt-2 pt-2.5 border-t border-emerald-200">
                  <span className="font-medium">Minimum Order Quantity (MOQ):</span>
                  <span className="font-bold text-slate-900">
                    {product.min_order_quantity} {product.unit}s
                  </span>
                </div>
              </div>

              {/* Specifications */}
              <div className="mt-4 space-y-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Product Specifications
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Packaging & Lead Time */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" /> Lead Time
                  </div>
                  <p className="font-bold text-slate-900 mt-1">{product.lead_time_days} Business Days</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                    <Package className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" /> Stock Status
                  </div>
                  <p className="font-bold text-slate-900 mt-1">
                    {inv?.is_made_to_order ? (
                      <span className="text-amber-800 font-semibold">
                        Made to Order ({inv.daily_production_capacity}/day)
                      </span>
                    ) : (
                      <span className="text-emerald-800">
                        {inv?.available_stock || 0} {product.unit}s available
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {product.packaging_details && (
                <div className="mt-3 text-xs text-slate-700 bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
                  <span className="font-bold text-amber-950">Commercial Packaging: </span>
                  {product.packaging_details}
                </div>
              )}
            </div>

            {/* Action buttons (Touch targets >= 44px) */}
            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 min-h-[44px] py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onRequestQuote(product);
                }}
                className="flex-[2] min-h-[44px] py-2.5 text-xs font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-xl shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <FileText className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Request Commercial Quotation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
