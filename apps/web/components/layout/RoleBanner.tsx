'use client';

import React from 'react';
import { useAntiqueSupplyStore, UserRole } from '../../lib/store';
import { ShieldCheck, Store, ShoppingBag, ArrowRightLeft, Sparkles } from 'lucide-react';

export default function RoleBanner() {
  const { activeRole, setActiveRole, activeOrg, data, setActiveOrgId } = useAntiqueSupplyStore();

  const buyers = data.organizations.filter(o => o.org_type === 'buyer' || o.org_type === 'both');
  const suppliers = data.organizations.filter(o => o.org_type === 'supplier' || o.org_type === 'both');

  return (
    <div className="bg-antique-slate-900 border-b border-emerald-900/40 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">Active Persona:</span>
        <span className="font-medium text-slate-200">
          {activeOrg?.trade_name || 'Antique Provincial Marketplace'}
        </span>
        <span className="text-slate-400">({activeOrg?.municipality}, {activeOrg?.province})</span>
        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
          {activeRole.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-400 flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3 text-amber-400" /> Switch Role:
        </span>

        {/* Role Toggle Buttons */}
        <div className="inline-flex rounded-md shadow-sm bg-slate-800/80 p-0.5 border border-slate-700">
          <button
            onClick={() => setActiveRole('buyer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              activeRole === 'buyer'
                ? 'bg-antique-green font-semibold text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3 h-3" /> Buyer View
          </button>
          <button
            onClick={() => setActiveRole('supplier')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              activeRole === 'supplier'
                ? 'bg-amber-600 font-semibold text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Store className="w-3 h-3" /> Supplier View
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              activeRole === 'admin'
                ? 'bg-purple-700 font-semibold text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Admin View
          </button>
        </div>

        {/* Organization Dropdown if multiple */}
        {activeRole === 'buyer' && (
          <select
            value={activeOrg?.id}
            onChange={(e) => setActiveOrgId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
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
            onChange={(e) => setActiveOrgId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.trade_name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
