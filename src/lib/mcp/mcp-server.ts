import { CapabilityCompiler } from '@/lib/engine/capability-compiler';
import { WorkflowExecutor } from '@/lib/engine/workflow-executor';
import { McpToolDefinition } from '@/lib/types';
import { capabilityStore } from '@/lib/engine/capability-store';

export class CapabilityMcpRegistry {
  /**
   * Return dynamic MCP tools compiled from the active API specification
   */
  public static listTools(): McpToolDefinition[] {
    const storeCaps = capabilityStore.getCapabilities();
    if (storeCaps.length > 0) {
      return storeCaps.map((cap) => {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [paramName, paramInfo] of Object.entries(cap.contract.inputs)) {
          properties[paramName] = {
            type: paramInfo.type || 'string',
            description: paramInfo.description || `Parameter ${paramName}`,
          };
          if (paramInfo.example) {
            properties[paramName].example = paramInfo.example;
          }
          if (paramInfo.required) {
            required.push(paramName);
          }
        }

        return {
          name: cap.id,
          description: cap.description,
          inputSchema: {
            type: 'object',
            properties,
            required,
          },
          outputSchema: {
            type: 'object',
            properties: cap.contract.output || {},
          },
          risk: cap.risk,
          humanApprovalRequired: cap.humanApprovalRequired,
          permissions: cap.contract.permissions || { read: [], write: [] },
        };
      });
    }

    return [];
  }

  public static getTool(name: string): McpToolDefinition | undefined {
    return this.listTools().find((t) => t.name === name);
  }

  /**
   * Invoke an MCP tool dynamically through the live capability execution runtime
   */
  public static async callTool(
    name: string,
    args: Record<string, any>,
    isHumanApproved = false
  ): Promise<any> {
    return await WorkflowExecutor.executeCapability(name, {
      inputs: args,
      isHumanApproved,
    });
  }
}
