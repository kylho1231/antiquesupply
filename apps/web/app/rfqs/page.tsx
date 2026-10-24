'use client';

import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import QuotationComparisonView from '../../components/buyer/QuotationComparisonView';
import CreateRFQModal from '../../components/buyer/CreateRFQModal';
import { useRouter } from 'next/navigation';

export default function RFQsPage() {
  const router = useRouter();
  const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenCreateRFQ={() => setIsRFQModalOpen(true)} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <QuotationComparisonView onNavigateToOrder={(poId) => router.push(`/orders?po=${poId}`)} />
      </div>
      <CreateRFQModal isOpen={isRFQModalOpen} onClose={() => setIsRFQModalOpen(false)} />
    </div>
  );
}
