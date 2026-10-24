'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA, InitialDataState } from './mock-data';
import { migrateDemoImages } from './demo-image-migration';
import {
  canTransitionOrder,
  OrderStatus,
  validateInventoryAvailability,
} from '@antiquesupply/shared-schemas';

export type UserRole = 'buyer' | 'supplier' | 'admin';

interface StoreContextType {
  data: InitialDataState;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeOrg: any;
  setActiveOrgId: (id: string) => void;
  createRFQ: (rfqData: any) => string;
  submitQuotation: (quoteData: any) => string;
  acceptQuotation: (quotationId: string) => { success: boolean; poId?: string; error?: string };
  transitionOrderStatus: (
    poId: string,
    nextStatus: OrderStatus,
    notes?: string,
    trackingRef?: string
  ) => { success: boolean; error?: string };
  adjustInventory: (
    productId: string,
    movementType: string,
    quantity: number,
    notes?: string
  ) => void;
  verifySupplier: (orgId: string, approved: boolean, notes?: string) => void;
  addProduct: (productData: any) => void;
  updateProductPhotos: (productId: string, photos: string[]) => void;
  resetToInitial: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'antiquesupply_data_v1';
const ROLE_KEY = 'antiquesupply_active_role';
const ORG_KEY = 'antiquesupply_active_org';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InitialDataState>(INITIAL_DATA);
  const [activeRole, setActiveRoleState] = useState<UserRole>('buyer');
  const [activeOrgId, setActiveOrgIdState] = useState<string>('org-buy-001');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(migrateDemoImages(JSON.parse(saved)));
      }
      const savedRole = localStorage.getItem(ROLE_KEY) as UserRole;
      if (savedRole) {
        setActiveRoleState(savedRole);
      }
      const savedOrg = localStorage.getItem(ORG_KEY);
      if (savedOrg) {
        setActiveOrgIdState(savedOrg);
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to save to local storage:', e);
      }
    }
  }, [data, isLoaded]);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem(ROLE_KEY, role);
    if (role === 'buyer') {
      setActiveOrgIdState('org-buy-001');
      localStorage.setItem(ORG_KEY, 'org-buy-001');
    } else if (role === 'supplier') {
      setActiveOrgIdState('org-sup-001');
      localStorage.setItem(ORG_KEY, 'org-sup-001');
    } else {
      setActiveOrgIdState('admin-platform');
      localStorage.setItem(ORG_KEY, 'admin-platform');
    }
  };

  const setActiveOrgId = (id: string) => {
    setActiveOrgIdState(id);
    localStorage.setItem(ORG_KEY, id);
  };

  const activeOrg = data.organizations.find(o => o.id === activeOrgId) || {
    id: 'admin-platform',
    trade_name: 'Antique Provincial Market Administration',
    legal_name: 'Antique Supply Platform Admin',
    org_type: 'both',
    municipality: 'San Jose de Buenavista',
    province: 'Antique',
    verified_status: 'verified',
  };

  // 1. CREATE RFQ
  const createRFQ = (rfqData: any): string => {
    const id = `rfq-${Date.now().toString(36)}`;
    const rfqNumber = `RFQ-2026-${String(data.rfqs.length + 1).padStart(4, '0')}`;
    const buyerOrg = data.organizations.find(o => o.id === rfqData.buyer_org_id) || activeOrg;
    const supplierOrg = rfqData.supplier_org_id
      ? data.organizations.find(o => o.id === rfqData.supplier_org_id)
      : null;

    const newRFQ = {
      ...rfqData,
      id,
      rfq_number: rfqNumber,
      buyer_name: buyerOrg.trade_name,
      supplier_name: supplierOrg ? supplierOrg.trade_name : 'Open to Antique Producers Marketplace',
      status: 'open',
      created_at: new Date().toISOString(),
    };

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `RFQ Published: ${rfqNumber}`,
      message: `${buyerOrg.trade_name} submitted RFQ for "${rfqData.title}"`,
      notification_type: 'rfq_created',
      action_url: `/rfqs/${id}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      rfqs: [newRFQ, ...prev.rfqs],
      notifications: [newNotification, ...prev.notifications],
    }));

    return id;
  };

  // 2. SUBMIT QUOTATION
  const submitQuotation = (quoteData: any): string => {
    const id = `quo-${Date.now().toString(36)}`;
    const quotationNumber = `QUO-2026-${String(data.quotations.length + 101).padStart(4, '0')}`;
    const supplierOrg = data.organizations.find(o => o.id === quoteData.supplier_org_id) || activeOrg;
    const rfq = data.rfqs.find(r => r.id === quoteData.rfq_id);

    const newQuotation = {
      ...quoteData,
      id,
      quotation_number: quotationNumber,
      rfq_number: rfq ? rfq.rfq_number : 'RFQ-DIRECT',
      supplier_name: supplierOrg.trade_name,
      status: 'submitted',
      created_at: new Date().toISOString(),
    };

    // Update RFQ status to 'quoted'
    const updatedRfqs = data.rfqs.map(r =>
      r.id === quoteData.rfq_id ? { ...r, status: 'quoted' } : r
    );

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `Quotation Received: ${quotationNumber}`,
      message: `${supplierOrg.trade_name} submitted quotation for ${quoteData.grand_total.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`,
      notification_type: 'quotation_received',
      action_url: `/rfqs/${quoteData.rfq_id}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      rfqs: updatedRfqs,
      quotations: [newQuotation, ...prev.quotations],
      notifications: [newNotification, ...prev.notifications],
    }));

    return id;
  };

  // 3. ACCEPT QUOTATION & GENERATE PO (ATOMIC TRANSACTION)
  const acceptQuotation = (quotationId: string) => {
    const quotation = data.quotations.find(q => q.id === quotationId);
    if (!quotation) return { success: false, error: 'Quotation not found' };
    if (quotation.status !== 'submitted') {
      return { success: false, error: `Cannot accept quotation with status: ${quotation.status}` };
    }

    const rfq = data.rfqs.find(r => r.id === quotation.rfq_id);
    const buyerOrg = data.organizations.find(o => o.id === (rfq ? rfq.buyer_org_id : 'org-buy-001'));
    const supplierOrg = data.organizations.find(o => o.id === quotation.supplier_org_id);

    // Validate inventory availability for items
    for (const item of quotation.items) {
      const product = data.products.find(p => p.id === item.product_id || p.name === item.item_title);
      if (product) {
        const inv = data.inventory[product.id];
        if (inv) {
          const avail = validateInventoryAvailability(inv, item.offered_quantity);
          if (!avail.available) {
            return {
              success: false,
              error: `Stock reservation error for ${product.name}: ${avail.reason}`,
            };
          }
        }
      }
    }

    const poId = `po-${Date.now().toString(36)}`;
    const poNumber = `PO-2026-${String(data.purchaseOrders.length + 51).padStart(4, '0')}`;

    // Create PO items with frozen snapshot
    const poItems = quotation.items.map((item: any, idx: number) => {
      const prod = data.products.find(p => p.id === item.product_id || p.name === item.item_title);
      return {
        id: `poi-${Date.now()}-${idx}`,
        product_id: prod?.id,
        item_title: item.item_title,
        unit: item.unit,
        quantity: item.offered_quantity,
        agreed_unit_price: item.unit_price,
        line_total: item.line_total,
        product_snapshot: prod
          ? {
              sku: prod.sku,
              producer: supplierOrg?.trade_name,
              origin: prod.origin_municipality,
              packaging: prod.packaging_details,
            }
          : undefined,
      };
    });

    const newPO = {
      id: poId,
      po_number: poNumber,
      rfq_id: quotation.rfq_id,
      quotation_id: quotation.id,
      buyer_org_id: buyerOrg?.id || 'org-buy-001',
      buyer_name: buyerOrg?.trade_name || 'Buyer Organization',
      supplier_org_id: quotation.supplier_org_id,
      supplier_name: supplierOrg?.trade_name || 'Supplier Cooperative',
      status: 'submitted',
      subtotal: quotation.subtotal,
      delivery_fee: quotation.delivery_fee,
      tax_amount: quotation.tax_amount,
      grand_total: quotation.grand_total,
      delivery_address: rfq?.delivery_address || 'Main Receiving Station',
      delivery_municipality: rfq?.delivery_municipality || 'Antique',
      delivery_province: rfq?.delivery_province || 'Antique',
      delivery_date_agreed: new Date(Date.now() + (quotation.lead_time_days || 7) * 86400000).toISOString(),
      commercial_terms: quotation.commercial_terms,
      notes: quotation.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: poItems,
    };

    // Update inventory reservations atomically
    const updatedInventory = { ...data.inventory };
    for (const item of quotation.items) {
      const prod = data.products.find(p => p.id === item.product_id || p.name === item.item_title);
      if (prod && updatedInventory[prod.id]) {
        const inv = updatedInventory[prod.id];
        if (!inv.is_made_to_order) {
          const newReserved = inv.reserved_stock + item.offered_quantity;
          updatedInventory[prod.id] = {
            ...inv,
            reserved_stock: newReserved,
            available_stock: inv.physical_stock - newReserved,
          };
        }
      }
    }

    // Update status history
    const newHistory = {
      po_id: poId,
      previous_status: 'draft',
      new_status: 'submitted',
      changed_by_name: `${buyerOrg?.trade_name || 'Buyer'} (PO Submission)`,
      notes: `Purchase order generated from accepted Quotation ${quotation.quotation_number}`,
      created_at: new Date().toISOString(),
    };

    // Update Quotation & RFQ status
    const updatedQuotations = data.quotations.map(q =>
      q.id === quotationId ? { ...q, status: 'accepted' } : q
    );
    const updatedRfqs = data.rfqs.map(r =>
      r.id === quotation.rfq_id ? { ...r, status: 'closed' } : r
    );

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `New Purchase Order Created: ${poNumber}`,
      message: `Purchase Order ${poNumber} issued to ${supplierOrg?.trade_name} for ${quotation.grand_total.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}`,
      notification_type: 'order_created',
      action_url: `/orders/${poId}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      purchaseOrders: [newPO, ...prev.purchaseOrders],
      quotations: updatedQuotations,
      rfqs: updatedRfqs,
      inventory: updatedInventory,
      statusHistory: [newHistory, ...prev.statusHistory],
      notifications: [newNotification, ...prev.notifications],
    }));

    return { success: true, poId };
  };

  // 4. TRANSITION ORDER STATUS (STATE MACHINE ENGINE)
  const transitionOrderStatus = (
    poId: string,
    nextStatus: OrderStatus,
    notes?: string,
    trackingRef?: string
  ) => {
    const po = data.purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    if (!canTransitionOrder(po.status as OrderStatus, nextStatus)) {
      return {
        success: false,
        error: `Illegal state transition from "${po.status}" to "${nextStatus}" according to AntiqueSupply procurement protocol.`,
      };
    }

    // Adjust inventory if needed
    const updatedInventory = { ...data.inventory };
    if (nextStatus === 'dispatched') {
      // Dispatched: physical stock leaves warehouse, reserved stock decremented
      for (const item of po.items) {
        if (item.product_id && updatedInventory[item.product_id]) {
          const inv = updatedInventory[item.product_id];
          if (!inv.is_made_to_order) {
            const newPhys = Math.max(0, inv.physical_stock - item.quantity);
            const newRes = Math.max(0, inv.reserved_stock - item.quantity);
            updatedInventory[item.product_id] = {
              ...inv,
              physical_stock: newPhys,
              reserved_stock: newRes,
              available_stock: newPhys - newRes,
            };
          }
        }
      }
    } else if (nextStatus === 'cancelled') {
      // Cancellation: release reserved stock back into available pool
      for (const item of po.items) {
        if (item.product_id && updatedInventory[item.product_id]) {
          const inv = updatedInventory[item.product_id];
          if (!inv.is_made_to_order) {
            const newRes = Math.max(0, inv.reserved_stock - item.quantity);
            updatedInventory[item.product_id] = {
              ...inv,
              reserved_stock: newRes,
              available_stock: inv.physical_stock - newRes,
            };
          }
        }
      }
    }

    const updatedPO = {
      ...po,
      status: nextStatus,
      tracking_reference: trackingRef || po.tracking_reference,
      updated_at: new Date().toISOString(),
    };

    const newHistory = {
      po_id: poId,
      previous_status: po.status,
      new_status: nextStatus,
      changed_by_name: activeOrg.trade_name,
      notes: notes || `Order status updated to ${nextStatus.replace(/_/g, ' ')}`,
      created_at: new Date().toISOString(),
    };

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `Order ${po.po_number}: ${nextStatus.replace(/_/g, ' ').toUpperCase()}`,
      message: notes || `Order ${po.po_number} has been updated to ${nextStatus.replace(/_/g, ' ')}.`,
      notification_type: 'order_status_update',
      action_url: `/orders/${poId}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map(p => (p.id === poId ? updatedPO : p)),
      inventory: updatedInventory,
      statusHistory: [newHistory, ...prev.statusHistory],
      notifications: [newNotification, ...prev.notifications],
    }));

    return { success: true };
  };

  // 5. ADJUST INVENTORY
  const adjustInventory = (
    productId: string,
    movementType: string,
    quantity: number,
    notes?: string
  ) => {
    setData(prev => {
      const inv = prev.inventory[productId] || {
        physical_stock: 0,
        reserved_stock: 0,
        available_stock: 0,
        low_stock_threshold: 10,
        is_made_to_order: false,
        daily_production_capacity: 0,
      };

      let newPhysical = inv.physical_stock;
      if (movementType === 'stock_in') {
        newPhysical += quantity;
      } else if (movementType === 'damage_writeoff' || movementType === 'manual_decrement') {
        newPhysical = Math.max(0, newPhysical - quantity);
      }

      const newAvailable = Math.max(0, newPhysical - inv.reserved_stock);

      const updatedInventory = {
        ...prev.inventory,
        [productId]: {
          ...inv,
          physical_stock: newPhysical,
          available_stock: newAvailable,
        },
      };

      return {
        ...prev,
        inventory: updatedInventory,
      };
    });
  };

  // 6. VERIFY SUPPLIER (ADMIN WORKFLOW)
  const verifySupplier = (orgId: string, approved: boolean, notes?: string) => {
    setData(prev => {
      const updatedOrgs = prev.organizations.map(o =>
        o.id === orgId
          ? { ...o, verified_status: approved ? ('verified' as const) : ('rejected' as const) }
          : o
      );
      const updatedReqs = prev.verificationRequests.map(vr =>
        vr.organization_id === orgId
          ? {
              ...vr,
              status: approved ? 'approved' : 'rejected',
              reviewer_notes: notes || (approved ? 'All permits verified' : 'Incomplete documentation'),
            }
          : vr
      );
      return {
        ...prev,
        organizations: updatedOrgs,
        verificationRequests: updatedReqs,
      };
    });
  };

  // 7. ADD PRODUCT
  const addProduct = (productData: any) => {
    const id = `prod-${Date.now().toString(36)}`;
    const newProd = {
      ...productData,
      id,
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_active: true,
      stock_available: productData.stock_available || 10,
    };

    const next = {
      ...data,
      products: [newProd, ...data.products],
      inventory: {
        ...data.inventory,
        [id]: {
          physical_stock: productData.stock_available || 10,
          reserved_stock: 0,
          available_stock: productData.stock_available || 10,
          low_stock_threshold: 5,
          is_made_to_order: productData.is_made_to_order || false,
          daily_production_capacity: productData.daily_capacity || 10,
        },
      },
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { throw new Error('Browser storage is full. Remove photos or use smaller files before saving.'); }
    setData(next);
  };

  const updateProductPhotos = (productId: string, photos: string[]) => {
    const product = data.products.find(item => item.id === productId);
    if (activeRole !== 'supplier' || !product || product.organization_id !== activeOrg.id) throw new Error('Select the supplier that owns this product.');
    if (photos.length > 6) throw new Error('Maximum six photos per product.');
    const next = { ...data, products: data.products.map(item => item.id === productId ? { ...item, image_urls: photos, is_demo: photos.some(src => src.startsWith('/images/editorial/')) || item.is_demo, photo_rights_confirmed: true } : item) };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { throw new Error('Browser storage is full. Remove photos or use smaller files.'); }
    setData(next);
  };

  const resetToInitial = () => {
    setData(INITIAL_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StoreContext.Provider
      value={{
        data,
        activeRole,
        setActiveRole,
        activeOrg,
        setActiveOrgId,
        createRFQ,
        submitQuotation,
        acceptQuotation,
        transitionOrderStatus,
        adjustInventory,
        verifySupplier,
        addProduct,
        updateProductPhotos,
        resetToInitial,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useAntiqueSupplyStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAntiqueSupplyStore must be used within a StoreProvider');
  }
  return context;
}
