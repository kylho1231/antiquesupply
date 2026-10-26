'use client';

import React, { useState, useMemo } from 'react';
import Photo, { ProductPhoto } from '../media/Photo';
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
  MapPin,
  Clock,
  Package,
  Building2,
  ShieldCheck,
  FileText,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  X,
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

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedMunicipality('all');
    setSearchQuery('');
    setInStockOnly(false);
  };

  const isFiltered =
    selectedCategory !== 'all' ||
    selectedMunicipality !== 'all' ||
    searchQuery.trim() !== '' ||
    inStockOnly;

  return (
    <div className="space-y-8 pb-16">
      {/* Cinematic Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-antique-slate-900 text-white p-6 sm:p-8 md:p-12 border border-emerald-900/50 shadow-2xl">
        <div className="absolute inset-0">
          <Photo
            src="/images/editorial/antique-rice-terraces.webp"
            alt="Rice terraces in Antique"
            priority
            sizes="100vw"
            credits={false}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30 pointer-events-none" />
        
        {/* Ambient atmospheric gradients */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-antique-green/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Antique B2B Wholesale & Cooperative Direct</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Local Products.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">
              Bigger Markets.
            </span>
          </h1>

          <p className="mt-3 text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
            Direct commercial procurement connecting Panay Island resorts, hotels, restaurants, and
            supermarkets directly with certified cooperatives and artisanal producers across the 18
            municipalities of Antique.
          </p>

          {/* Trust Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-800/80 pt-5">
            <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800/50">
              <div className="text-xl sm:text-2xl font-black text-amber-400">18</div>
              <div className="text-slate-300 text-[11px] font-medium">Municipalities</div>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800/50">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">100%</div>
              <div className="text-slate-300 text-[11px] font-medium">Coop Direct</div>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800/50">
              <div className="text-xl sm:text-2xl font-black text-white">Net-30</div>
              <div className="text-slate-300 text-[11px] font-medium">B2B Terms</div>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800/50">
              <div className="text-xl sm:text-2xl font-black text-amber-400">Panay Island</div>
              <div className="text-slate-300 text-[11px] font-medium">Route Logistics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimers & Credits Note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="leading-relaxed">
          Demonstration marketplace. Seed suppliers, verification badges, prices and listings are illustrative. Photos showcase authentic regional materials and craft traditions.{' '}
          <a className="underline font-bold text-amber-900 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-800" href="/image-credits">
            View Photography Credits & Licenses
          </a>.
        </p>
      </div>

      {/* Sourcing Search & Filter Bar */}
      <section
        aria-label="Filter and Search Products"
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-950/10 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search organic muscovado, patadyong, virgin coconut oil..."
              aria-label="Search products by keyword, origin, or SKU"
              className="w-full pl-10 pr-9 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green focus-visible:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Municipality Selector */}
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-green pointer-events-none" aria-hidden="true" />
            <select
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              aria-label="Filter by Antique Municipality"
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green bg-white cursor-pointer transition-all"
            >
              <option value="all">All 18 Municipalities of Antique</option>
              {ANTIQUE_MUNICIPALITIES.map(m => (
                <option key={m} value={m}>
                  {m}, Antique
                </option>
              ))}
            </select>
          </div>

          {/* In-Stock Filter */}
          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 w-full justify-center transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded text-antique-green focus-visible:ring-2 focus-visible:ring-antique-green w-4 h-4 cursor-pointer"
              />
              <span>In-Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div
          role="tablist"
          aria-label="Product categories"
          className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none"
        >
          <button
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 min-h-[44px] rounded-xl whitespace-nowrap font-bold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green ${
              selectedCategory === 'all'
                ? 'bg-antique-green text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            All Categories ({data.products.length})
          </button>
          {PRODUCT_CATEGORIES.map(cat => {
            const count = data.products.filter(p => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl whitespace-nowrap font-bold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green ${
                  isSelected
                    ? 'bg-antique-green text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Catalog Grid */}
      <section aria-labelledby="catalog-listings-heading">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 id="catalog-listings-heading" className="text-base font-extrabold text-slate-900">
              Wholesale Product Listings
            </h2>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {filteredProducts.length} Available
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-antique-green hover:text-emerald-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green rounded px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div
            role="status"
            className="bg-white rounded-2xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-antique-green flex items-center justify-center mx-auto border border-emerald-200">
              <Package className="w-7 h-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No products found matching your criteria
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We couldn't find any listings for this municipality or category. Try clearing your filters or create a custom Request for Quotation (RFQ) directly for Antique producers.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsRFQModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-antique-green hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Publish Custom Sourcing RFQ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const supplier = data.organizations.find(o => o.id === product.organization_id);
              const inv = data.inventory[product.id];
              const isLowStock =
                inv && !inv.is_made_to_order && inv.available_stock <= inv.low_stock_threshold;

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-600/40 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with origin overlay */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <ProductPhoto product={product} contain />
                      <div className="absolute top-3 left-3 bg-antique-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/20 shadow-sm">
                        <MapPin className="w-3 h-3 text-amber-400" aria-hidden="true" />
                        <span>{product.origin_municipality}, Antique</span>
                      </div>

                      {inv?.is_made_to_order ? (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                          Made to Order
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute top-3 right-3 bg-amber-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                          Low Stock: {inv?.available_stock} left
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-emerald-700 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                          In Stock ({inv?.available_stock})
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      {/* Producer name */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{supplier?.trade_name || 'Antique Cooperative'}</span>
                        {supplier?.verified_status === 'verified' && (
                          <span title="Verified Cooperative Organization">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setInspectingProduct(product)}
                        onKeyDown={e => e.key === 'Enter' && setInspectingProduct(product)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View full details for ${product.name}`}
                        className="font-bold text-slate-900 text-sm hover:text-antique-green transition-colors cursor-pointer line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green rounded"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Pricing & MOQ Matrix */}
                      <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Indicative Price
                          </div>
                          <div className="text-base font-black text-antique-green">
                            ₱{product.base_price.toLocaleString('en-PH')}
                            <span className="text-xs font-semibold text-slate-600"> / {product.unit}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Min Order
                          </div>
                          <div className="text-xs font-bold text-slate-900">
                            {product.min_order_quantity} {product.unit}s
                          </div>
                        </div>
                      </div>

                      {/* Specs pills */}
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          Lead time: {product.lead_time_days} days
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card actions (Touch targets >= 44px) */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setInspectingProduct(product)}
                      className="min-h-[44px] py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      View Specs
                    </button>
                    <button
                      onClick={() => handleOpenRFQForProduct(product)}
                      className="min-h-[44px] py-2.5 text-xs font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      <span>Request Quote</span>
                    </button>
                  </div>
                </article>
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
