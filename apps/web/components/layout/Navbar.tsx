'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateRFQ?: () => void;
  onOpenAddProduct?: () => void;
}

export default function Navbar({ onOpenCreateRFQ, onOpenAddProduct }: NavbarProps) {
  const pathname = usePathname();
  const { activeRole, data } = useAntiqueSupplyStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = data.notifications.filter(n => !n.is_read);

  // Close notifications and mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Dynamic Navigation depending on active persona
  const buyerLinks = [
    { name: 'Marketplace', href: '/', icon: ShoppingBag },
    {
      name: 'My RFQs & Quotes',
      href: '/rfqs',
      icon: FileText,
      badge: data.rfqs.filter(r => r.status === 'open' || r.status === 'quoted').length,
    },
    {
      name: 'Purchase Orders',
      href: '/orders',
      icon: FileCheck2,
      badge: data.purchaseOrders.length,
    },
    { name: 'Suppliers Directory', href: '/suppliers', icon: Store },
  ];

  const supplierLinks = [
    { name: 'Supplier Hub', href: '/supplier', icon: Layers },
    { name: 'Catalog Management', href: '/supplier/products', icon: ShoppingBag },
    { name: 'RFQ Inbox', href: '/supplier/rfqs', icon: FileText, badge: data.rfqs.length },
    {
      name: 'Order Fulfillment',
      href: '/supplier/orders',
      icon: PackageCheck,
      badge: data.purchaseOrders.filter(
        p => p.status !== 'received' && p.status !== 'cancelled'
      ).length,
    },
    { name: 'Inventory & Stock', href: '/supplier/inventory', icon: Layers },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', href: '/admin', icon: Layers },
    {
      name: 'Verification Queue',
      href: '/admin/verifications',
      icon: FileCheck2,
      badge: data.verificationRequests.filter(v => v.status === 'pending').length,
    },
    { name: 'Organizations', href: '/admin/organizations', icon: Store },
  ];

  const currentLinks =
    activeRole === 'buyer'
      ? buyerLinks
      : activeRole === 'supplier'
      ? supplierLinks
      : adminLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
              aria-label="AntiqueSupply Home"
            >
              <div className="w-9 h-9 rounded-xl bg-antique-green flex items-center justify-center text-white shadow-sm shadow-emerald-900/25 group-hover:bg-emerald-800 transition-colors">
                <span className="font-extrabold text-base text-amber-400">A</span>
                <span className="font-bold text-xs text-white">S</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-0.5">
                  Antique<span className="text-antique-green">Supply</span>
                </span>
                <span className="hidden sm:block text-[9px] tracking-widest text-emerald-800 font-bold uppercase -mt-0.5">
                  Local Products. Bigger Markets.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center space-x-1 lg:space-x-1.5"
          >
            {currentLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-emerald-50 text-antique-green font-bold shadow-xs border border-emerald-200/70'
                      : 'text-slate-600 hover:text-antique-green hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Notifications & Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-11 h-11 flex items-center justify-center text-slate-600 hover:text-antique-green hover:bg-emerald-50 rounded-xl relative transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                aria-label={`Notifications, ${unreadNotifications.length} unread`}
                aria-expanded={showNotifications}
                aria-haspopup="true"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full">
                    <span className="sr-only">{unreadNotifications.length} unread notifications</span>
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div
                  role="dialog"
                  aria-label="Recent notifications"
                  className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Notifications ({unreadNotifications.length} unread)
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Panay B2B Live
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {data.notifications.length === 0 ? (
                      <p className="p-4 text-center text-slate-500 text-xs">No notifications yet.</p>
                    ) : (
                      data.notifications.map(n => (
                        <div
                          key={n.id}
                          className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <p className="font-bold text-slate-900 text-xs">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            {activeRole === 'buyer' && onOpenCreateRFQ && (
              <button
                onClick={onOpenCreateRFQ}
                aria-label="Create Request for Quotation"
                className="flex items-center gap-1.5 bg-antique-green text-white hover:bg-emerald-800 text-xs font-bold min-h-[44px] px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Create RFQ</span>
              </button>
            )}

            {activeRole === 'supplier' && onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                aria-label="List New Product"
                className="flex items-center gap-1.5 bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold min-h-[44px] px-4 py-2.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              >
                <PlusCircle className="w-4 h-4 text-white" aria-hidden="true" />
                <span className="hidden sm:inline">Add Product</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="xl:hidden w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu with backdrop */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="xl:hidden border-t border-slate-200 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150"
          >
            {currentLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl text-xs font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    isActive
                      ? 'bg-emerald-50 text-antique-green font-bold border border-emerald-200/80'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-antique-green" aria-hidden="true" />
                    <span>{link.name}</span>
                  </span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-xs font-black rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
