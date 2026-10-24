'use client';

import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import SupplierDashboard from '../../components/supplier/SupplierDashboard';
import AddProductModal from '../../components/supplier/AddProductModal';
import { useRouter } from 'next/navigation';

export default function SupplierPage() {
  const router = useRouter();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAddProduct={() => setIsAddProductOpen(true)} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SupplierDashboard onNavigateToTab={(tab) => router.push(`/supplier/${tab}`)} />
      </div>
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}
