import { NextResponse } from 'next/server';
import { CapabilityMcpRegistry } from '@/lib/mcp/mcp-server';

export async function GET() {
  const tools = CapabilityMcpRegistry.listTools();
  return NextResponse.json({
    status: 'running',
    transport: 'local',
    toolCount: tools.length,
    tools,
  });
}
