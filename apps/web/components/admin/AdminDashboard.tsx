'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
} from 'lucide-react';

export default function AdminDashboard() {
  const { data, verifySupplier } = useAntiqueSupplyStore();

  const [feedback, setFeedback] = useState<string | null>(null);

  const pendingRequests = data.verificationRequests.filter(vr => vr.status === 'pending');
  const allSuppliers = data.organizations.filter(o => o.org_type === 'supplier' || o.org_type === 'both');
  const allBuyers = data.organizations.filter(o => o.org_type === 'buyer' || o.org_type === 'both');

  const gmv = data.purchaseOrders.reduce((sum, p) => sum + (p.status !== 'cancelled' ? p.grand_total : 0), 0);

  const handleVerify = (orgId: string, approved: boolean) => {
    verifySupplier(
      orgId,
      approved,
      approved
        ? 'All business permits & cooperative accreditation verified by admin.'
        : 'Incomplete documentation.'
    );
    setFeedback(`Verification status updated for cooperative organization.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-antique-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-purple-900/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-700/60 text-purple-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Platform Governance & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Antique Marketplace Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Verify local cooperative credentials, audit procurement transactions, manage categories, and monitor Panay regional commerce.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Platform GMV</span>
          <div className="text-xl sm:text-2xl font-black text-antique-green">₱{gmv.toLocaleString('en-PH')}</div>
          <p className="text-[11px] text-slate-500 font-mono">{data.purchaseOrders.length} commercial orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Verifications</span>
          <div className="text-xl sm:text-2xl font-black text-purple-700">{pendingRequests.length}</div>
          <p className="text-[11px] text-slate-500">Pending reviews</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Suppliers</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{allSuppliers.length}</div>
          <p className="text-[11px] text-slate-500">Cooperatives & guilds</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Buyers</span>
          <div className="text-xl sm:text-2xl font-black text-blue-700">{allBuyers.length}</div>
          <p className="text-[11px] text-slate-500">Resorts, dining, grocers</p>
        </div>
      </div>

      {/* Supplier Verification Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest block">
              Trust & Safety Workflow
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Cooperative Verification Queue ({pendingRequests.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Document Review Engine</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" aria-hidden="true" />
            <p className="text-xs font-bold text-slate-800">No pending verification requests</p>
            <p className="text-[11px] text-slate-500">All registered cooperatives are currently verified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(vr => {
              const org = data.organizations.find(o => o.id === vr.organization_id);

              return (
                <div
                  key={vr.id}
                  className="p-5 rounded-2xl border border-purple-100 bg-purple-50/20 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{vr.organization_name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 capitalize">
                          {vr.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                        <span>{org?.municipality}, Antique • Reg #: {org?.registration_number}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-1 italic">"{vr.notes}"</p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => handleVerify(vr.organization_id, false)}
                        className="min-h-[44px] px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleVerify(vr.organization_id, true)}
                        className="min-h-[44px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Approve Verification</span>
                      </button>
                    </div>
                  </div>

                  {/* Submitted Documents */}
                  <div className="pt-3 border-t border-purple-100">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                      Submitted Supporting Business Documents
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {vr.submitted_documents?.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-2xs"
                        >
                          <FileText className="w-4 h-4 text-purple-700 shrink-0" aria-hidden="true" />
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate text-xs">{doc.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{doc.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Directory of All Organizations */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          All Registered Organizations ({data.organizations.length})
        </h2>
        <div className="divide-y divide-slate-100 text-xs">
          {data.organizations.map(org => (
            <div key={org.id} className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{org.trade_name}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {org.municipality}, {org.province} • TIN: {org.tin || 'N/A'} • Type: {org.org_type.toUpperCase()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-bold text-[10px] capitalize ${
                  org.verified_status === 'verified'
                    ? 'bg-emerald-100 text-emerald-900'
                    : org.verified_status === 'pending'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {org.verified_status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
