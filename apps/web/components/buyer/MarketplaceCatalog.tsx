'use client';

import React, { useState, useMemo } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ANTIQUE_MUNICIPALITIES,
  PRODUCT_CATEGORIES,
  Product,
} from '@antiquesupply/shared-schemas';
import ProductDetailModal from './ProductDetailModal';
import CreateRFQModal from './CreateRFQModal';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Package,
  Building2,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

export default function MarketplaceCatalog() {
  const { data } = useAntiqueSupplyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modals state
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);
  const [rfqTargetProduct, setRfqTargetProduct] = useState<Product | undefined>(undefined);

  // Filter products
  const filteredProducts = useMemo(() => {
    return data.products.filter(product => {
      if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
        return false;
      }
      if (selectedMunicipality !== 'all' && product.origin_municipality !== selectedMunicipality) {
        return false;
      }
      if (inStockOnly) {
        const inv = data.inventory[product.id];
        if (inv && !inv.is_made_to_order && inv.available_stock <= 0) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesMuni = product.origin_municipality.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesSku || matchesMuni;
      }
      return true;
    });
  }, [data.products, data.inventory, selectedCategory, selectedMunicipality, inStockOnly, searchQuery]);

  const handleOpenRFQForProduct = (product: Product) => {
    setRfqTargetProduct(product);
    setIsRFQModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Cinematic Hero Header (GetLayers atmospheric layout) */}
      <section className="relative overflow-hidden rounded-3xl bg-antique-slate-900 text-white p-6 md:p-10 border border-emerald-900/50 shadow-2xl">
        {/* Background atmospheric gradient */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-antique-green/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Antique B2B Wholesale & Cooperative Direct</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Local Products.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
              Bigger Markets.
            </span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
            Direct commercial procurement connecting Panay Island resorts, hotels, restaurants, and
            supermarkets directly with certified cooperatives and artisanal producers across the 18
            municipalities of Antique.
          </p>

          {/* Quick trust metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-800 pt-5">
            <div>
              <div className="text-xl font-extrabold text-amber-400">18</div>
              <div className="text-slate-400 text-[11px]">Municipalities</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-400">100%</div>
              <div className="text-slate-400 text-[11px]">Coop Direct</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">Net-30</div>
              <div className="text-slate-400 text-[11px]">B2B Credit Terms</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-amber-400">Panay & Boracay</div>
              <div className="text-slate-400 text-[11px]">Route Logistics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing Search & Filter Bar */}
      <section className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-emerald-950/10 space-y-4">
        {/* Search input & municipality selector */}
        <div className="grid md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search organic muscovado, handwoven patadyong, virgin coconut oil..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-antique-green focus:ring-1 focus:ring-antique-green outline-none transition-all"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 pointer-events-none" />
            <select
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              aria-label="Filter by Antique Municipality"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-antique-green outline-none bg-white cursor-pointer"
            >
              <option value="all">All 18 Municipalities of Antique</option>
              {ANTIQUE_MUNICIPALITIES.map(m => (
                <option key={m} value={m}>
                  {m}, Antique
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 w-full justify-center hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded text-antique-green focus:ring-antique-green w-4 h-4"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-antique-green text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({data.products.length})
          </button>
          {PRODUCT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-antique-green text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Wholesale Product Listings</span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {filteredProducts.length} Available
            </span>
          </h2>
          <span className="text-xs text-slate-500">Commercial Prices in Philippine Peso (PHP)</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No products match your filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your municipality or category filter, or post an open RFQ to request
              custom production from Antique cooperatives.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedMunicipality('all');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="text-xs font-semibold text-antique-green hover:underline mt-2 inline-block"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const supplier = data.organizations.find(o => o.id === product.organization_id);
              const inv = data.inventory[product.id];
              const isLowStock = inv && !inv.is_made_to_order && inv.available_stock <= inv.low_stock_threshold;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-emerald-950/10 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with origin overlay */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={product.image_urls[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-antique-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{product.origin_municipality}, Antique</span>
                      </div>

                      {inv?.is_made_to_order ? (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          Made to Order
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute top-3 right-3 bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          Low Stock: {inv?.available_stock} left
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          In Stock ({inv?.available_stock})
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      {/* Producer name */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{supplier?.trade_name || 'Antique Cooperative'}</span>
                        {supplier?.verified_status === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>

                      <h3
                        onClick={() => setInspectingProduct(product)}
                        className="font-bold text-slate-900 text-sm hover:text-antique-green transition-colors cursor-pointer line-clamp-2"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Pricing & MOQ Matrix */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase">
                            Indicative Price
                          </div>
                          <div className="text-base font-extrabold text-antique-green">
                            ₱{product.base_price.toLocaleString('en-PH')}
                            <span className="text-[11px] font-normal text-slate-600"> / {product.unit}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-semibold text-slate-500 uppercase">
                            Min Order
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            {product.min_order_quantity} {product.unit}s
                          </div>
                        </div>
                      </div>

                      {/* Specs pills */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Lead time: {product.lead_time_days} days
                        </span>
                        <span className="font-mono text-[10px]">SKU: {product.sku}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInspectingProduct(product)}
                      className="py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                    >
                      View Specs
                    </button>
                    <button
                      onClick={() => handleOpenRFQForProduct(product)}
                      className="py-2 text-xs font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-lg shadow-sm shadow-emerald-900/20 transition-all flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request Quote</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Inspect Specs Modal */}
      <ProductDetailModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
        onRequestQuote={handleOpenRFQForProduct}
      />

      {/* Create RFQ Modal */}
      <CreateRFQModal
        isOpen={isRFQModalOpen}
        onClose={() => {
          setIsRFQModalOpen(false);
          setRfqTargetProduct(undefined);
        }}
        preselectedProduct={rfqTargetProduct}
      />
    </div>
  );
}
