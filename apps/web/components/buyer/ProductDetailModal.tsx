'use client';

import React from 'react';
import ProductGallery from '../media/ProductGallery';
import { Product } from '@antiquesupply/shared-schemas';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  X,
  MapPin,
  Clock,
  Package,
  ShieldCheck,
  CheckCircle2,
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
  if (!product) return null;

  const supplier = data.organizations.find(o => o.id === product.organization_id);
  const inv = data.inventory[product.id];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-emerald-900/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image gallery */}
          <div className="bg-stone-100 overflow-hidden">
            <ProductGallery key={product.id} product={product} />
            <div className="text-slate-700 text-[11px] px-3 py-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{product.is_demo ? 'Sample listing origin' : 'Product origin'}: {product.origin_municipality}, Antique</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Supplier header */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{supplier?.trade_name || 'Antique Verified Cooperative'}</span>
                {supplier?.verified_status === 'verified' && (
                  <span title="Verified Cooperative">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>

              {/* Price & MOQ */}
              <div className="mt-4 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-emerald-900 uppercase">Indicative Price</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-antique-green">
                      ₱{product.base_price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-600 font-medium"> / {product.unit}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/50">
                  <span>Minimum Order Quantity (MOQ):</span>
                  <span className="font-semibold text-slate-900">
                    {product.min_order_quantity} {product.unit}s
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Specifications</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{product.description}</p>
              </div>

              {/* Packaging & Lead Time */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Lead Time
                  </div>
                  <p className="font-semibold text-slate-900 mt-0.5">{product.lead_time_days} Days</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                    <Package className="w-3.5 h-3.5 text-emerald-600" /> Stock Status
                  </div>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {inv?.is_made_to_order ? (
                      <span className="text-amber-700 font-medium">Made to Order ({inv.daily_production_capacity}/day)</span>
                    ) : (
                      <span className="text-emerald-700">{inv?.available_stock || 0} {product.unit}s in warehouse</span>
                    )}
                  </p>
                </div>
              </div>

              {product.packaging_details && (
                <div className="mt-3 text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/40">
                  <span className="font-semibold text-amber-900">Commercial Packaging: </span>
                  {product.packaging_details}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onRequestQuote(product);
                }}
                className="flex-[2] py-2.5 text-xs font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-lg shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                Request Commercial Quotation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
