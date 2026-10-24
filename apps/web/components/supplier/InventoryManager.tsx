'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  Layers,
  Package,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Boxes,
  Sparkles,
} from 'lucide-react';

export default function InventoryManager() {
  const { data, activeOrg, adjustInventory } = useAntiqueSupplyStore();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movementType, setMovementType] = useState<string>('stock_in');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>('Fresh production harvest from mill');
  const [feedback, setFeedback] = useState<string | null>(null);

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
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Inventory & Warehouse Control
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Stock Allocations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor physical stock, active order reservations, and scheduled production capacity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-200">
            {supplierProducts.length} Managed SKUs
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-emerald-950/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Warehouse Stock Matrix
          </h3>
          <span className="text-xs text-slate-400">Values updated in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5 text-center">Type</th>
                <th className="p-3.5 text-center">Physical Stock</th>
                <th className="p-3.5 text-center">Locked / Reserved</th>
                <th className="p-3.5 text-center">Available to Quote</th>
                <th className="p-3.5 text-center">Threshold</th>
                <th className="p-3.5 text-right">Actions</th>
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
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{prod.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{prod.sku} • {prod.unit}</p>
                    </td>

                    <td className="p-3.5 text-center">
                      {inv.is_made_to_order ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          Made to Order ({inv.daily_production_capacity}/day)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          Physical Stock
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-800">
                      {inv.is_made_to_order ? '—' : `${inv.physical_stock} ${prod.unit}s`}
                    </td>

                    <td className="p-3.5 text-center font-bold text-amber-600">
                      {inv.reserved_stock > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-500" />
                          {inv.reserved_stock} {prod.unit}s
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {inv.is_made_to_order ? (
                        <span className="font-bold text-emerald-700">On-Demand Capacity</span>
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

                    <td className="p-3.5 text-center text-slate-500">
                      {inv.low_stock_threshold} {prod.unit}s
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-antique-green text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">
                Inventory Adjustment
              </span>
              <h3 className="text-base font-bold text-slate-900">{selectedProduct.name}</h3>
              <p className="text-xs text-slate-500">SKU: {selectedProduct.sku}</p>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                <select
                  value={movementType}
                  onChange={e => setMovementType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="stock_in">Stock In (Production Harvest / New Sacks)</option>
                  <option value="damage_writeoff">Damage / Spoilage Write-off</option>
                  <option value="manual_decrement">Manual Count Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity ({selectedProduct.unit}s) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Batch Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. October batch #23 from Laua-an mill"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-lg shadow-sm"
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
