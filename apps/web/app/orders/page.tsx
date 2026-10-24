'use client';

import React, { Suspense } from 'react';
import Navbar from '../../components/layout/Navbar';
import PurchaseOrderTracker from '../../components/buyer/PurchaseOrderTracker';
import { useSearchParams } from 'next/navigation';

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialPoId = searchParams.get('po') || undefined;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PurchaseOrderTracker initialPoId={initialPoId} />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading order records...</div>}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
