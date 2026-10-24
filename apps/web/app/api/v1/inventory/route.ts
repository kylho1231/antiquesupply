import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';
import { InventoryMovementSchema } from '@antiquesupply/shared-schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (productId) {
    const inv = INITIAL_DATA.inventory[productId];
    if (!inv) {
      return NextResponse.json({ success: false, error: 'Product inventory not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: inv });
  }

  return NextResponse.json({
    success: true,
    data: INITIAL_DATA.inventory,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InventoryMovementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { product_id, movement_type, quantity, notes } = parsed.data;
    const inv = INITIAL_DATA.inventory[product_id];

    if (!inv) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Inventory movement logged: ${movement_type}`,
      data: {
        product_id,
        movement_type,
        quantity,
        notes,
        recorded_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
