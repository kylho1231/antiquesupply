'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import manifest from '../../public/image-manifest.json';
import Photo from '../../components/media/Photo';
import { Search, ShieldCheck, Download, ArrowLeft, Filter } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All 100 Assets' },
  { id: 'municipalities', label: 'Municipalities (18)' },
  { id: 'sugar', label: 'Sugar & Cane (10)' },
  { id: 'coconut', label: 'Coconut & VCO (10)' },
  { id: 'textiles', label: 'Textiles & Loom (12)' },
  { id: 'handicrafts', label: 'Palm & Bamboo (12)' },
  { id: 'food_spices', label: 'Salt & Spices (10)' },
  { id: 'fisheries', label: 'Fisheries & Marine (10)' },
  { id: 'logistics', label: 'Port & Logistics (10)' },
  { id: 'regional', label: 'Regional Panay (8)' },
];

export default function ImageCreditsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = useMemo(() => {
    return manifest.filter(asset => {
      const matchesCat =
        selectedCategory === 'all' || (asset as any).category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.usage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to B2B Marketplace
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="/image-manifest.json"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            Download Manifest JSON (100 Items)
          </a>
          <a
            href="/docs/image-contact-sheet.png"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            View 10x10 Contact Sheet
          </a>
        </div>
      </div>

      {/* Main Title & Disclosures */}
      <div className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Verified Legal Provenance
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
            100 Verified Assets
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Photography & Asset Rights Registry
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-4xl">
          These 100 photographs illustrate authentic places, traditional materials, agricultural commodities, and artisan crafts across Antique Province and Panay Island. They serve as verified illustrative samples and background context. They do not claim or verify a specific supplier, facility, product specification, or commercial endorsement.
        </p>
        <p className="text-slate-500 text-xs leading-relaxed max-w-4xl">
          All images have been downloaded, verified under Creative Commons (CC BY, CC BY-SA, CC0) or Public Domain licenses, metadata-scrubbed, and optimized to WebP. In accordance with Section #31 standards, commercial product listings on AntiqueSupply require real, authorized supplier-uploaded photographs.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, creator, municipality or commodity..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredAssets.length}</strong> of 100 assets
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map(asset => (
          <article
            id={asset.id}
            key={asset.id}
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm flex flex-col hover:border-emerald-600 transition-colors"
          >
            <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
              <Photo src={asset.path} alt={asset.alt} contain />
              <div className="absolute top-2 left-2 bg-slate-950/75 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-md font-mono">
                {asset.width}×{asset.height}
              </div>
              <div className="absolute top-2 right-2 bg-emerald-900/80 backdrop-blur-sm text-[10px] text-emerald-200 px-2 py-0.5 rounded-md font-bold uppercase">
                {asset.license}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between text-xs space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  {(asset as any).category || 'Regional'}
                </span>
                <h2 className="font-bold text-slate-900 line-clamp-1" title={asset.title}>
                  {asset.title}
                </h2>
                <p className="text-slate-600 text-[11px] line-clamp-2" title={asset.alt}>
                  {asset.alt}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Author / Creator:</span>
                  <span className="font-semibold text-slate-800 max-w-[150px] truncate" title={asset.creator}>
                    {asset.creator}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 underline font-medium"
                  >
                    Original Commons Source
                  </a>
                  <a
                    href={asset.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-slate-900 underline font-medium"
                  >
                    License Deed
                  </a>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  SHA-256: {asset.sha256.slice(0, 16)}...
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
