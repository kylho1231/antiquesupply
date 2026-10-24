'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Package,
  ArrowRight,
  Sparkles,
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

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
              Regional Producer Network
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Antique Producers & Cooperatives Directory
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sample producer profiles. Cover photography illustrates the sector and does not depict or verify these organizations.
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 self-start sm:self-auto">
            {suppliers.length} Registered Producers
          </span>
        </div>

        {/* Suppliers Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {suppliers.map(sup => {
            const products = data.products.filter(p => p.organization_id === sup.id);

            return (
              <div
                key={sup.id}
                className="bg-white rounded-2xl border border-emerald-950/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {sup.banner_image && <div className="aspect-video rounded-xl overflow-hidden"><Photo src={sup.banner_image} alt="Sector illustration" label="Illustrative cover · sample supplier" sizes="(max-width: 768px) 100vw, 50vw" /></div>}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-slate-900 text-base">{sup.trade_name}</h2>
                        {sup.verified_status === 'verified' && (
                          <span title="Verified Cooperative">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{sup.legal_name}</p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize shrink-0 ${
                        sup.verified_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sup.verified_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{sup.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{sup.municipality}, {sup.province}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sup.contact_email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sup.contact_phone}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    {products.length} {products.length === 1 ? 'Product Listed' : 'Products Listed'}
                  </span>
                  <Link
                    href="/"
                    className="text-xs font-bold text-antique-green hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Browse Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
