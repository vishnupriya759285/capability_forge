import { NextRequest, NextResponse } from 'next/server';
import { CapabilityEvaluator } from '@/lib/engine/evaluator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const capabilityId = searchParams.get('capabilityId') || undefined;
    const report = await CapabilityEvaluator.evaluateCapability(capabilityId);
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const capabilityId = body.capabilityId || undefined;
    const report = await CapabilityEvaluator.evaluateCapability(capabilityId);
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
