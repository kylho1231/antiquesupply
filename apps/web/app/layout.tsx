import './globals.css';
import React from 'react';
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
          <footer className="bg-antique-slate-900 border-t border-emerald-950/20 text-slate-400 text-xs py-8 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-antique-green flex items-center justify-center text-amber-400 font-bold text-xs">
                  AS
                </div>
                <span className="font-bold text-white">AntiqueSupply</span>
                <span className="text-slate-500">— Sourcing platform for Antique & Panay Island</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Philippine B2B Procurement Platform • Compliant with Data Privacy Act of 2012
              </div>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
