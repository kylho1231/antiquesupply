'use client';

import React from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import { ShieldCheck, Store, ShoppingBag, ArrowRightLeft } from 'lucide-react';

export default function RoleBanner() {
  const { activeRole, setActiveRole, activeOrg, data, setActiveOrgId } = useAntiqueSupplyStore();

  const buyers = data.organizations.filter(o => o.org_type === 'buyer' || o.org_type === 'both');
  const suppliers = data.organizations.filter(o => o.org_type === 'supplier' || o.org_type === 'both');

  return (
    <aside
      aria-label="Active Persona and Role Switcher"
      className="bg-antique-slate-900 border-b border-emerald-900/40 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md z-50 transition-colors"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex h-2 w-2 relative" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
          Active Persona:
        </span>
        <span className="font-bold text-slate-100">
          {activeOrg?.trade_name || 'Antique Provincial Marketplace'}
        </span>
        <span className="text-slate-400 text-[11px]">
          ({activeOrg?.municipality}, {activeOrg?.province})
        </span>
        <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
          {activeRole.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>Switch Persona:</span>
        </span>

        {/* Role Toggle Buttons */}
        <div
          role="group"
          aria-label="Select active user role"
          className="inline-flex rounded-lg shadow-sm bg-slate-800/90 p-1 border border-slate-700"
        >
          <button
            onClick={() => setActiveRole('buyer')}
            aria-pressed={activeRole === 'buyer'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              activeRole === 'buyer'
                ? 'bg-antique-green font-bold text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Buyer</span>
          </button>
          <button
            onClick={() => setActiveRole('supplier')}
            aria-pressed={activeRole === 'supplier'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              activeRole === 'supplier'
                ? 'bg-amber-600 font-bold text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Store className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Supplier</span>
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            aria-pressed={activeRole === 'admin'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              activeRole === 'admin'
                ? 'bg-purple-700 font-bold text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Admin</span>
          </button>
        </div>

        {/* Organization Dropdown */}
        {activeRole === 'buyer' && (
          <select
            value={activeOrg?.id}
            onChange={e => setActiveOrgId(e.target.value)}
            aria-label="Switch active buyer organization"
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer"
          >
            {buyers.map(b => (
              <option key={b.id} value={b.id}>
                {b.trade_name}
              </option>
            ))}
          </select>
        )}

        {activeRole === 'supplier' && (
          <select
            value={activeOrg?.id}
            onChange={e => setActiveOrgId(e.target.value)}
            aria-label="Switch active supplier organization"
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none cursor-pointer"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.trade_name}
              </option>
            ))}
          </select>
        )}
      </div>
    </aside>
  );
}
