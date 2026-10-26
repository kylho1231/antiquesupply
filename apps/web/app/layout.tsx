import './globals.css';
import React from 'react';
import Link from 'next/link';
import { StoreProvider } from '../lib/store';
import AmbientBackground from '../components/layers/AmbientBackground';
import RoleBanner from '../components/layout/RoleBanner';

export const metadata = {
  title: 'AntiqueSupply — Local Products. Bigger Markets.',
  description:
    'B2B Marketplace, Procurement Management, and Supplier Operations Platform for Antique, Boracay, and Panay Island.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen relative flex flex-col bg-antique-ivory text-antique-slate-900">
        <StoreProvider>
          {/* GetLayers-inspired cinematic ambient backdrop */}
          <AmbientBackground />

          {/* Persona switcher banner */}
          <RoleBanner />

          {/* Main page content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-antique-slate-900 border-t border-emerald-950/30 text-slate-300 text-xs py-10 print:hidden transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-antique-green flex items-center justify-center text-amber-400 font-black text-sm shadow-sm">
                    AS
                  </div>
                  <div>
                    <span className="font-black text-white text-base tracking-tight block">
                      AntiqueSupply
                    </span>
                    <span className="text-slate-400 text-xs">
                      B2B Sourcing Platform for Antique, Boracay & Panay Island
                    </span>
                  </div>
                </div>

                <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold">
                  <Link
                    href="/"
                    className="min-h-[44px] px-3 py-2 text-slate-300 hover:text-white inline-flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/suppliers"
                    className="min-h-[44px] px-3 py-2 text-slate-300 hover:text-white inline-flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    Suppliers Directory
                  </Link>
                  <Link
                    href="/rfqs"
                    className="min-h-[44px] px-3 py-2 text-slate-300 hover:text-white inline-flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    RFQ Workspace
                  </Link>
                  <Link
                    href="/orders"
                    className="min-h-[44px] px-3 py-2 text-slate-300 hover:text-white inline-flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    Purchase Orders
                  </Link>
                  <Link
                    href="/image-credits"
                    className="min-h-[44px] px-3 py-2 text-amber-400 hover:text-amber-300 inline-flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 font-bold"
                  >
                    Photography Registry (100 Assets)
                  </Link>
                </nav>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                <p>© {new Date().getFullYear()} AntiqueSupply. Demonstrative B2B platform.</p>
                <p className="flex items-center gap-2">
                  <span>Panay Regional Commerce Direct</span>
                  <span>•</span>
                  <span>18 Municipalities of Antique</span>
                </p>
              </div>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
