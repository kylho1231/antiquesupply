'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ShoppingBag,
  Store,
  Layers,
  FileText,
  FileCheck2,
  PackageCheck,
  Bell,
  PlusCircle,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateRFQ?: () => void;
  onOpenAddProduct?: () => void;
}

export default function Navbar({ onOpenCreateRFQ, onOpenAddProduct }: NavbarProps) {
  const pathname = usePathname();
  const { activeRole, activeOrg, data } = useAntiqueSupplyStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = data.notifications.filter(n => !n.is_read);

  // Dynamic Navigation depending on active persona
  const buyerLinks = [
    { name: 'Marketplace', href: '/', icon: ShoppingBag },
    { name: 'My RFQs & Quotes', href: '/rfqs', icon: FileText, badge: data.rfqs.filter(r => r.status === 'open' || r.status === 'quoted').length },
    { name: 'Purchase Orders', href: '/orders', icon: FileCheck2, badge: data.purchaseOrders.length },
    { name: 'Suppliers Directory', href: '/suppliers', icon: Store },
  ];

  const supplierLinks = [
    { name: 'Supplier Hub', href: '/supplier', icon: Layers },
    { name: 'Catalog Management', href: '/supplier/products', icon: ShoppingBag },
    { name: 'RFQ Inbox', href: '/supplier/rfqs', icon: FileText, badge: data.rfqs.length },
    { name: 'Order Fulfillment', href: '/supplier/orders', icon: PackageCheck, badge: data.purchaseOrders.filter(p => p.status !== 'received' && p.status !== 'cancelled').length },
    { name: 'Inventory & Stock', href: '/supplier/inventory', icon: Layers },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', href: '/admin', icon: Layers },
    { name: 'Verification Queue', href: '/admin/verifications', icon: FileCheck2, badge: data.verificationRequests.filter(v => v.status === 'pending').length },
    { name: 'Organizations', href: '/admin/organizations', icon: Store },
  ];

  const currentLinks =
    activeRole === 'buyer'
      ? buyerLinks
      : activeRole === 'supplier'
      ? supplierLinks
      : adminLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-950/10 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-antique-green flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:bg-emerald-800 transition-colors">
                <span className="font-extrabold text-lg text-amber-400">A</span>
                <span className="font-bold text-sm text-white">S</span>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-antique-slate-900 flex items-center gap-1">
                  Antique<span className="text-antique-green">Supply</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-widest text-emerald-800 font-semibold uppercase -mt-1">
                  Local Products. Bigger Markets.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-antique-green font-semibold shadow-xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-antique-green hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-900 text-[10px] font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Notifications & Primary CTA */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-antique-green hover:bg-emerald-50 rounded-full relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">Notifications ({unreadNotifications.length} unread)</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Panay B2B Live</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {data.notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            {activeRole === 'buyer' && onOpenCreateRFQ && (
              <button
                onClick={onOpenCreateRFQ}
                className="flex items-center gap-1.5 bg-antique-green text-white hover:bg-emerald-800 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Create RFQ</span>
              </button>
            )}

            {activeRole === 'supplier' && onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                className="flex items-center gap-1.5 bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Add Product</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
            {currentLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
              >
                <span className="flex items-center gap-2">
                  <link.icon className="w-4 h-4 text-emerald-700" />
                  {link.name}
                </span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
