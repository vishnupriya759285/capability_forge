import { NextRequest, NextResponse } from 'next/server';
import { capabilityStore } from '@/lib/engine/capability-store';
import { CapabilityCompiler } from '@/lib/engine/capability-compiler';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const capability = capabilityStore.getCapability(id);
    if (!capability) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }
    return NextResponse.json(capability);
  }

  const list = capabilityStore.getCapabilities();
  return NextResponse.json({ capabilities: list });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body.capabilityId;

    if (id) {
      const capability = capabilityStore.getCapability(id);
      if (!capability) {
        return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
      }
      return NextResponse.json(capability);
    }

    capabilityStore.autoCompileCapabilities();
    const list = capabilityStore.getCapabilities();
    return NextResponse.json({ capabilities: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
