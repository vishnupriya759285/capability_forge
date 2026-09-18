import { NextRequest, NextResponse } from 'next/server';
import { chaosEngine } from '@/lib/engine/chaos-engine';

export async function GET() {
  return NextResponse.json(chaosEngine.getState());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'break';

    if (action === 'break') {
      const state = chaosEngine.breakCapability();
      return NextResponse.json({
        message: 'Capability intentionally broken (Chaos Demo Mode). Test 8 will now fail.',
        state,
      });
    } else if (action === 'repair' || action === 'reset') {
      const state = chaosEngine.repairCapability();
      return NextResponse.json({
        message: 'Capability restored to safe verified mode.',
        state,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
