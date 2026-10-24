import { z } from 'zod';

export declare const OrganizationTypeSchema: z.ZodEnum<['buyer', 'supplier', 'both']>;
export declare const VerificationStatusSchema: z.ZodEnum<['unverified', 'pending', 'verified', 'rejected']>;
export declare const OrganizationSchema: z.ZodObject<any>;

export declare const ProductUnitSchema: z.ZodEnum<['kg', 'piece', 'box', 'liter', 'pack', 'sack', 'bundle', 'meter']>;
export declare const ProductSchema: z.ZodObject<any>;

export declare const RFQStatusSchema: z.ZodEnum<['open', 'quoted', 'closed', 'cancelled']>;
export declare const RFQItemSchema: z.ZodObject<any>;
export declare const CreateRFQSchema: z.ZodObject<any>;

export declare const QuotationStatusSchema: z.ZodEnum<['submitted', 'accepted', 'rejected', 'expired']>;
export declare const QuotationItemSchema: z.ZodObject<any>;
export declare const CreateQuotationSchema: z.ZodObject<any>;

export declare const OrderStatusSchema: z.ZodEnum<[
  'draft',
  'submitted',
  'confirmed',
  'preparing',
  'ready_for_dispatch',
  'dispatched',
  'delivered',
  'received',
  'cancelled',
  'disputed'
]>;
export declare const PurchaseOrderItemSchema: z.ZodObject<any>;
export declare const CreatePurchaseOrderSchema: z.ZodObject<any>;
export declare const InventoryMovementSchema: z.ZodObject<any>;

export type Organization = z.infer<typeof OrganizationSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateRFQ = z.infer<typeof CreateRFQSchema>;
export type CreateQuotation = z.infer<typeof CreateQuotationSchema>;
export type CreatePurchaseOrder = z.infer<typeof CreatePurchaseOrderSchema>;
export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;
export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;

export declare const ORDER_STATUS_TRANSITIONS: Record<string, string[]>;
export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'received'
  | 'cancelled'
  | 'disputed';

export declare const ANTIQUE_MUNICIPALITIES: string[];
export declare const TARGET_EXPANSION_AREAS: string[];
export declare const PRODUCT_UNITS: string[];
export declare const PRODUCT_CATEGORIES: Array<{
  id: string;
  name: string;
  slug: string;
  icon: string;
}>;

export declare function canTransitionOrder(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean;

export declare function validateInventoryAvailability(
  productInventory: {
    physical_stock: number;
    reserved_stock: number;
    is_made_to_order?: boolean;
  },
  requestedQuantity: number
): {
  available: boolean;
  current_available?: number;
  remaining_after_reservation?: number;
  shortfall?: number;
  reason?: string;
};
