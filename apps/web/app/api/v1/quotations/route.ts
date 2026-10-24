import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';
import { CreateQuotationSchema } from '@antiquesupply/shared-schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rfqId = searchParams.get('rfq_id');
  const supplierId = searchParams.get('supplier_id');

  let quotes = [...INITIAL_DATA.quotations];
  if (rfqId) {
    quotes = quotes.filter(q => q.rfq_id === rfqId);
  }
  if (supplierId) {
    quotes = quotes.filter(q => q.supplier_org_id === supplierId);
  }

  return NextResponse.json({
    success: true,
    data: quotes,
    count: quotes.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateQuotationSchema.safeParse(body);

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

    const quotationNumber = `QUO-2026-${String(INITIAL_DATA.quotations.length + 101).padStart(4, '0')}`;
    const newQuotation = {
      ...parsed.data,
      id: `quo-${Date.now().toString(36)}`,
      quotation_number: quotationNumber,
      status: 'submitted',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newQuotation,
        message: 'Quotation submitted successfully',
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
