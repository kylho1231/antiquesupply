import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';
import { CreateRFQSchema } from '@antiquesupply/shared-schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const orgId = searchParams.get('org_id');

  let rfqs = [...INITIAL_DATA.rfqs];
  if (status) {
    rfqs = rfqs.filter(r => r.status === status);
  }
  if (orgId) {
    rfqs = rfqs.filter(r => r.buyer_org_id === orgId || r.supplier_org_id === orgId);
  }

  return NextResponse.json({
    success: true,
    data: rfqs,
    count: rfqs.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateRFQSchema.safeParse(body);

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

    const rfqNumber = `RFQ-2026-${String(INITIAL_DATA.rfqs.length + 10).padStart(4, '0')}`;
    const newRFQ = {
      ...parsed.data,
      id: `rfq-${Date.now().toString(36)}`,
      rfq_number: rfqNumber,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newRFQ,
        message: 'RFQ created successfully',
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
