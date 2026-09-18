import { NextRequest, NextResponse } from 'next/server';
import { CodexRepairEngine } from '@/lib/engine/codex-repair';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const capabilityId = searchParams.get('capabilityId') || undefined;

  const context = CodexRepairEngine.buildRepairContext(capabilityId);
  const diff = CodexRepairEngine.getPatchDiff();
  const history = CodexRepairEngine.getHistory();

  return NextResponse.json({
    context,
    diff,
    history,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'LIVE_CODEX';
    const capabilityId = body.capabilityId || undefined;

    const result = await CodexRepairEngine.executeRepair({
      mode,
      capabilityId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
