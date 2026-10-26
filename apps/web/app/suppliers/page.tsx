'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Photo from '../../components/media/Photo';

export default function SuppliersDirectoryPage() {
  const { data } = useAntiqueSupplyStore();

  const suppliers = data.organizations.filter(
    o => o.org_type === 'supplier' || o.org_type === 'both'
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
              Regional Producer Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Antique Producers & Cooperatives Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Sample producer profiles. Cover photography illustrates the sector and does not depict or verify these organizations.
            </p>
          </div>
          <span className="text-xs px-3.5 py-2 bg-emerald-50 text-emerald-900 font-bold rounded-xl border border-emerald-200 self-start sm:self-auto">
            {suppliers.length} Registered Producers
          </span>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map(sup => {
            const products = data.products.filter(p => p.organization_id === sup.id);

            return (
              <article
                key={sup.id}
                className="bg-white rounded-3xl border border-emerald-950/10 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
              >
                {sup.banner_image && (
                  <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200">
                    <Photo
                      src={sup.banner_image}
                      alt="Sector illustration"
                      label="Illustrative cover · sample supplier"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-slate-900 text-lg">{sup.trade_name}</h2>
                        {sup.verified_status === 'verified' && (
                          <span title="Verified Cooperative Organization">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{sup.legal_name}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[10px] capitalize shrink-0 ${
                        sup.verified_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {sup.verified_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-3 leading-relaxed">{sup.description}</p>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-antique-green shrink-0" aria-hidden="true" />
                      <span>{sup.municipality}, {sup.province}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{sup.contact_email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{sup.contact_phone}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {products.length} {products.length === 1 ? 'Product Listed' : 'Products Listed'}
                  </span>
                  <Link
                    href="/"
                    className="min-h-[44px] px-4 py-2 inline-flex items-center gap-1.5 text-xs font-bold text-antique-green hover:text-emerald-800 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                  >
                    <span>Browse Products</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
