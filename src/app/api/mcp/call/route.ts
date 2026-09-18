import { NextRequest, NextResponse } from 'next/server';
import { CapabilityMcpRegistry } from '@/lib/mcp/mcp-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { tool, arguments: args = {}, isHumanApproved = false } = body;

    if (!tool) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }

    const result = await CapabilityMcpRegistry.callTool(tool, args, isHumanApproved);
    return NextResponse.json({
      tool,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
