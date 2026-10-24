import { NextResponse } from 'next/server';
import { INITIAL_DATA } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'buyer', 'supplier', 'all'

  let orgs = [...INITIAL_DATA.organizations];
  if (type && type !== 'all') {
    orgs = orgs.filter(o => o.org_type === type || o.org_type === 'both');
  }

  return NextResponse.json({
    success: true,
    data: orgs,
    count: orgs.length,
  });
}
