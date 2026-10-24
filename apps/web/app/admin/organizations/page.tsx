'use client';

import React from 'react';
import Navbar from '../../../components/layout/Navbar';
import { useAntiqueSupplyStore } from '../../../lib/store';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const { data } = useAntiqueSupplyStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest">
            Registry Records
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Registered Business Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            All registered buyers, agricultural cooperatives, and artisanal guilds on the AntiqueSupply platform.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Trade Name & Legal Entity</th>
                <th className="p-4">Role</th>
                <th className="p-4">Location</th>
                <th className="p-4">TIN / Registration</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.organizations.map(org => (
                <tr key={org.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{org.trade_name}</p>
                    <p className="text-[11px] text-slate-400">{org.legal_name}</p>
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-semibold text-slate-700">{org.org_type}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {org.municipality}, {org.province}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-500">
                    {org.tin || org.registration_number || 'N/A'}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                        org.verified_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {org.verified_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
