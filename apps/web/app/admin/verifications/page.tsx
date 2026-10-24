'use client';

import React from 'react';
import Navbar from '../../../components/layout/Navbar';
import AdminDashboard from '../../../components/admin/AdminDashboard';

export default function AdminVerificationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminDashboard />
      </div>
    </div>
  );
}
