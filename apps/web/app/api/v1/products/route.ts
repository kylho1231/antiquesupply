import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';
import { ProductSchema } from '@antiquesupply/shared-schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const municipality = searchParams.get('municipality');
  const q = searchParams.get('q')?.toLowerCase();

  let products = [...INITIAL_DATA.products];

  if (category && category !== 'all') {
    products = products.filter(p => p.category_id === category);
  }
  if (municipality && municipality !== 'all') {
    products = products.filter(p => p.origin_municipality === municipality);
  }
  if (q) {
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: products,
    count: products.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ProductSchema.safeParse(body);

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

    const newProduct = {
      ...parsed.data,
      id: `prod-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newProduct,
        message: 'Product listed successfully',
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
