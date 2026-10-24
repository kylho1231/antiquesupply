import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';
import { canTransitionOrder, OrderStatus } from '@antiquesupply/shared-schemas';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nextStatus, notes, trackingReference } = body;

    const po = INITIAL_DATA.purchaseOrders.find(p => p.id === id);
    if (!po) {
      return NextResponse.json(
        { success: false, error: `Purchase Order ${id} not found` },
        { status: 404 }
      );
    }

    if (!canTransitionOrder(po.status as OrderStatus, nextStatus as OrderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Illegal state transition from "${po.status}" to "${nextStatus}". Enforced by AntiqueSupply state machine.`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${po.po_number} successfully transitioned to ${nextStatus}`,
      data: {
        id: po.id,
        po_number: po.po_number,
        previous_status: po.status,
        new_status: nextStatus,
        tracking_reference: trackingReference || po.tracking_reference,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
