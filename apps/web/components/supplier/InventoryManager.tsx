'use client';

import React, { useState, useEffect } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  Layers,
  CheckCircle2,
  Lock,
  X,
} from 'lucide-react';

export default function InventoryManager() {
  const { data, activeOrg, adjustInventory } = useAntiqueSupplyStore();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movementType, setMovementType] = useState<string>('stock_in');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('Fresh production harvest from mill');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    if (selectedProduct) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  // Products belonging to active supplier
  const supplierProducts = data.products.filter(
    p => p.organization_id === activeOrg.id || activeOrg.id === 'admin-platform'
  );

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    adjustInventory(selectedProduct.id, movementType, Number(quantity), notes);
    setFeedback(`Inventory for "${selectedProduct.name}" updated successfully.`);
    setSelectedProduct(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-950/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
            Inventory & Warehouse Control
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Inventory & Stock Allocations</h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Monitor physical stock, active order reservations, and scheduled production capacity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3.5 py-2 bg-emerald-50 text-emerald-900 font-bold rounded-xl border border-emerald-200">
            {supplierProducts.length} Managed SKUs
          </span>
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

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-emerald-950/10 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Warehouse Stock Matrix
          </h3>
          <span className="text-xs text-slate-500 font-medium">Real-time inventory levels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Product & SKU</th>
                <th className="p-4 text-center">Type</th>
                <th className="p-4 text-center">Physical Stock</th>
                <th className="p-4 text-center">Locked / Reserved</th>
                <th className="p-4 text-center">Available to Quote</th>
                <th className="p-4 text-center">Threshold</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplierProducts.map(prod => {
                const inv = data.inventory[prod.id] || {
                  physical_stock: 0,
                  reserved_stock: 0,
                  available_stock: 0,
                  low_stock_threshold: 10,
                  is_made_to_order: false,
                  daily_production_capacity: 0,
                };

                const isLow = !inv.is_made_to_order && inv.available_stock <= inv.low_stock_threshold;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-xs">{prod.name}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{prod.sku} • {prod.unit}</p>
                    </td>

                    <td className="p-4 text-center">
                      {inv.is_made_to_order ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          Made to Order ({inv.daily_production_capacity}/day)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Physical Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center font-bold text-slate-900">
                      {inv.is_made_to_order ? '—' : `${inv.physical_stock} ${prod.unit}s`}
                    </td>

                    <td className="p-4 text-center font-bold text-amber-700">
                      {inv.reserved_stock > 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Lock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          <span>{inv.reserved_stock} {prod.unit}s</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {inv.is_made_to_order ? (
                        <span className="font-bold text-emerald-800">On-Demand</span>
                      ) : (
                        <span
                          className={`font-black text-sm ${
                            isLow ? 'text-red-600' : 'text-antique-green'
                          }`}
                        >
                          {inv.available_stock} {prod.unit}s
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center text-slate-600 font-medium">
                      {inv.low_stock_threshold} {prod.unit}s
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="min-h-[40px] px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-antique-green text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stock-adjustment-title"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                  Inventory Adjustment
                </span>
                <h3 id="stock-adjustment-title" className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">SKU: {selectedProduct.sku}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Close dialog"
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div>
                <label htmlFor="adjust-type" className="block font-bold text-slate-800 mb-1">
                  Adjustment Type *
                </label>
                <select
                  id="adjust-type"
                  value={movementType}
                  onChange={e => setMovementType(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                >
                  <option value="stock_in">Stock In (Production Harvest / New Sacks)</option>
                  <option value="damage_writeoff">Damage / Spoilage Write-off</option>
                  <option value="manual_decrement">Manual Count Adjustment</option>
                </select>
              </div>

              <div>
                <label htmlFor="adjust-qty" className="block font-bold text-slate-800 mb-1">
                  Quantity ({selectedProduct.unit}s) *
                </label>
                <input
                  id="adjust-qty"
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                />
              </div>

              <div>
                <label htmlFor="adjust-notes" className="block font-bold text-slate-800 mb-1">
                  Notes / Batch Reference
                </label>
                <input
                  id="adjust-notes"
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. October batch #23 from Laua-an mill"
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="min-h-[44px] px-5 py-2.5 font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-xl shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  Apply Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
