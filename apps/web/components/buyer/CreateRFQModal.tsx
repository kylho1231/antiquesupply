'use client';

import React, { useState } from 'react';
import { useAntiqueSupplyStore } from '../../lib/store';
import {
  ANTIQUE_MUNICIPALITIES,
  TARGET_EXPANSION_AREAS,
  PRODUCT_UNITS,
  CreateRFQSchema,
} from '@antiquesupply/shared-schemas';
import { X, Plus, Trash2, Send, AlertCircle, Building2, Calendar, MapPin } from 'lucide-react';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: any;
  onSuccess?: (rfqId: string) => void;
}

export default function CreateRFQModal({
  isOpen,
  onClose,
  preselectedProduct,
  onSuccess,
}: CreateRFQModalProps) {
  const { data, activeOrg, createRFQ } = useAntiqueSupplyStore();

  const [title, setTitle] = useState(
    preselectedProduct
      ? `Procurement for ${preselectedProduct.name}`
      : 'Quarterly Wholesale Sourcing Request'
  );
  const [supplierOrgId, setSupplierOrgId] = useState(preselectedProduct?.organization_id || '');
  const [deliveryAddress, setDeliveryAddress] = useState('Central Receiving Dock, Beachfront Area');
  const [deliveryMunicipality, setDeliveryMunicipality] = useState('Boracay (Malay)');
  const [deliveryProvince, setDeliveryProvince] = useState('Aklan');

  // Dates: Default 14 days delivery, 4 days deadline
  const defaultTargetDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const defaultDeadline = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];

  const [targetDeliveryDate, setTargetDeliveryDate] = useState(defaultTargetDate);
  const [responseDeadline, setResponseDeadline] = useState(defaultDeadline);
  const [targetBudget, setTargetBudget] = useState(
    preselectedProduct ? preselectedProduct.base_price * preselectedProduct.min_order_quantity : 50000
  );
  const [notes, setNotes] = useState(
    'Please include packaging specifications, FDA compliance docs if food, and estimated delivery timetable to Panay dock.'
  );

  // Line items
  const [items, setItems] = useState([
    {
      product_id: preselectedProduct?.id || '',
      item_title: preselectedProduct?.name || 'Organic Muscovado Sugar (50kg)',
      specifications: preselectedProduct?.description || 'Export grade, moisture barrier sealed, fresh harvest',
      quantity: preselectedProduct?.min_order_quantity || 10,
      unit: preselectedProduct?.unit || 'sack',
      target_unit_price: preselectedProduct?.base_price || 4200,
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        item_title: '',
        specifications: '',
        quantity: 1,
        unit: 'piece',
        target_unit_price: 100,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rfqPayload = {
      title,
      buyer_org_id: activeOrg.id,
      supplier_org_id: supplierOrgId || undefined,
      delivery_address: deliveryAddress,
      delivery_municipality: deliveryMunicipality,
      delivery_province: deliveryProvince,
      target_delivery_date: new Date(targetDeliveryDate).toISOString(),
      response_deadline: new Date(responseDeadline).toISOString(),
      target_budget: Number(targetBudget),
      notes,
      items: items.map(it => ({
        ...it,
        quantity: Number(it.quantity),
        target_unit_price: Number(it.target_unit_price),
      })),
    };

    const parseResult = CreateRFQSchema.safeParse(rfqPayload);
    if (!parseResult.success) {
      setError(parseResult.error.errors[0]?.message || 'Please check all required RFQ fields.');
      return;
    }

    try {
      const rfqId = createRFQ(rfqPayload);
      if (onSuccess) onSuccess(rfqId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit RFQ');
    }
  };

  const suppliers = data.organizations.filter(o => o.org_type === 'supplier' || o.org_type === 'both');
  const allDestinations = [...ANTIQUE_MUNICIPALITIES, ...TARGET_EXPANSION_AREAS];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-emerald-900/10">
        {/* Header */}
        <div className="bg-antique-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900/50">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              B2B Sourcing System
            </span>
            <h2 className="text-lg font-bold">Create Request for Quotation (RFQ)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sourcing Objective & Supplier Targeting */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                RFQ Title / Sourcing Project *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 500kg Muscovado Sugar for High Season"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-antique-green focus:ring-1 focus:ring-antique-green outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Target Supplier (Optional)
              </label>
              <select
                value={supplierOrgId}
                onChange={e => setSupplierOrgId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-antique-green outline-none bg-white"
              >
                <option value="">-- Open to All Antique Cooperatives & Guilds --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.trade_name} ({s.municipality})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery & Timetable */}
          <div className="grid sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Delivery Destination *
              </label>
              <select
                value={deliveryMunicipality}
                onChange={e => {
                  setDeliveryMunicipality(e.target.value);
                  if (e.target.value.includes('Boracay') || e.target.value.includes('Kalibo')) {
                    setDeliveryProvince('Aklan');
                  } else if (e.target.value.includes('Iloilo')) {
                    setDeliveryProvince('Iloilo');
                  } else {
                    setDeliveryProvince('Antique');
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
              >
                {allDestinations.map(dest => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Target Delivery Date *
              </label>
              <input
                type="date"
                required
                value={targetDeliveryDate}
                onChange={e => setTargetDeliveryDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" /> Response Deadline *
              </label>
              <input
                type="date"
                required
                value={responseDeadline}
                onChange={e => setResponseDeadline(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">
                Specific Address / Drop-off Point *
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Target Budget (PHP, Optional)
              </label>
              <input
                type="number"
                min="0"
                value={targetBudget}
                onChange={e => setTargetBudget(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Procurement Line Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-antique-green hover:text-emerald-800 font-semibold text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 grid sm:grid-cols-12 gap-2.5 items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.item_title}
                      onChange={e => handleItemChange(idx, 'item_title', e.target.value)}
                      placeholder="e.g. Muscovado 50kg Sacks"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Specifications & Grade *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.specifications}
                      onChange={e => handleItemChange(idx, 'specifications', e.target.value)}
                      placeholder="e.g. Moisture < 2%, organic cert"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Qty *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-1 py-1.5 rounded border border-slate-300 bg-white text-[11px]"
                    >
                      {PRODUCT_UNITS.map(u => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Target ₱
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.target_unit_price}
                      onChange={e => handleItemChange(idx, 'target_unit_price', Number(e.target.value))}
                      className="w-full px-1.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center pb-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Commercial Terms & Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-antique-green outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-lg shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4 text-amber-400" />
              Publish RFQ to Suppliers
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
