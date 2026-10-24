'use client';

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import MarketplaceCatalog from '../components/buyer/MarketplaceCatalog';
import SupplierDashboard from '../components/supplier/SupplierDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import CreateRFQModal from '../components/buyer/CreateRFQModal';
import AddProductModal from '../components/supplier/AddProductModal';
import { useAntiqueSupplyStore } from '../lib/store';

export default function HomePage() {
  const { activeRole } = useAntiqueSupplyStore();

  const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenCreateRFQ={() => setIsRFQModalOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'buyer' && <MarketplaceCatalog />}
        {activeRole === 'supplier' && <SupplierDashboard />}
        {activeRole === 'admin' && <AdminDashboard />}
      </div>

      <CreateRFQModal
        isOpen={isRFQModalOpen}
        onClose={() => setIsRFQModalOpen(false)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}
