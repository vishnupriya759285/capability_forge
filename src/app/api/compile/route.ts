import { NextRequest, NextResponse } from 'next/server';
import { capabilityStore } from '@/lib/engine/capability-store';
import { CapabilityCompiler } from '@/lib/engine/capability-compiler';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const capability =
      capabilityStore.getCapability(id) || CapabilityCompiler.compile(id);
    return NextResponse.json(capability);
  }

  const list = capabilityStore.getCapabilities();
  if (list.length > 0) {
    return NextResponse.json(list);
  }

  return NextResponse.json(CapabilityCompiler.listCompiledCapabilities());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.capabilityId || 'resolve_customer_order';

    const capability =
      capabilityStore.getCapability(id) || CapabilityCompiler.compile(id);
    return NextResponse.json(capability);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
