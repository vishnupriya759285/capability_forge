import { NextRequest, NextResponse } from 'next/server';
import { WorkflowExecutor } from '@/lib/engine/workflow-executor';
import { capabilityStore } from '@/lib/engine/capability-store';
import { CapabilityCompiler } from '@/lib/engine/capability-compiler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      capabilityId,
      inputs = {},
      isHumanApproved = false,
      targetBaseUrl,
      authHeader,
    } = body;

    const targetCapId =
      capabilityId ||
      capabilityStore.getCapabilities()[0]?.id ||
      CapabilityCompiler.listCompiledCapabilities()[0]?.id;

    if (!targetCapId) {
      return NextResponse.json(
        { error: 'No capability selected and no capabilities compiled. Please import an OpenAPI spec.' },
        { status: 400 }
      );
    }

    const result = await WorkflowExecutor.executeCapability(targetCapId, {
      inputs,
      isHumanApproved: Boolean(isHumanApproved),
      targetBaseUrl,
      authHeader,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
