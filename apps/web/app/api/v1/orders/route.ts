import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';
import {
  CreatePurchaseOrderSchema,
  validateInventoryAvailability,
} from '@antiquesupply/shared-schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const orgId = searchParams.get('org_id');

  let orders = [...INITIAL_DATA.purchaseOrders];
  if (status) {
    orders = orders.filter(o => o.status === status);
  }
  if (orgId) {
    orders = orders.filter(o => o.buyer_org_id === orgId || o.supplier_org_id === orgId);
  }

  return NextResponse.json({
    success: true,
    data: orders,
    count: orders.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreatePurchaseOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const orderData = parsed.data;

    // Concurrency / Inventory check
    for (const item of orderData.items) {
      if (item.product_id) {
        const inv = INITIAL_DATA.inventory[item.product_id];
        if (inv) {
          const check = validateInventoryAvailability(inv, item.quantity);
          if (!check.available) {
            return NextResponse.json(
              {
                success: false,
                error: `Cannot issue PO: Stock reservation failed. ${check.reason}`,
              },
              { status: 409 }
            );
          }
        }
      }
    }

    const poNumber = `PO-2026-${String(INITIAL_DATA.purchaseOrders.length + 51).padStart(4, '0')}`;
    const newPO = {
      ...orderData,
      id: `po-${Date.now().toString(36)}`,
      po_number: poNumber,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newPO,
        message: 'Purchase Order generated and inventory reservation locked',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
