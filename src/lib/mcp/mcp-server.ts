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

    // Default standard real-world tools (Petstore, GitHub, Stripe)
    return [
      {
        name: 'order_pet_safely',
        description: 'Verifies pet health & catalog status, checks store inventory capacity, and prompts operator before placing purchase order.',
        inputSchema: {
          type: 'object',
          properties: {
            pet_id: { type: 'string', description: 'Pet catalog ID (e.g. 1)' },
            quantity: { type: 'number', description: 'Quantity to purchase (default 1)' },
          },
          required: ['pet_id'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            pet_status: { type: 'string' },
            inventory_checked: { type: 'boolean' },
            order_status: { type: 'string' },
          },
        },
        risk: 'MEDIUM',
        humanApprovalRequired: true,
        permissions: {
          read: ['pet', 'store'],
          write: ['store/order'],
        },
      },
      {
        name: 'triage_and_respond_issue',
        description: 'Retrieves repository issue metadata and thread comments, proposes an AI response, and halts for maintainer sign-off before publishing comment.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner (e.g. facebook)' },
            repo: { type: 'string', description: 'Repository name (e.g. react)' },
            issue_number: { type: 'number', description: 'Issue number (e.g. 1042)' },
          },
          required: ['owner', 'repo', 'issue_number'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            issue_state: { type: 'string' },
            comment_posted: { type: 'boolean' },
            comment_id: { type: 'string' },
          },
        },
        risk: 'MEDIUM',
        humanApprovalRequired: true,
        permissions: {
          read: ['repos', 'issues'],
          write: ['comments'],
        },
      },
      {
        name: 'process_invoice_payment',
        description: 'Inspects customer account details, retrieves unpaid invoices, and requires explicit financial sign-off before executing charge.',
        inputSchema: {
          type: 'object',
          properties: {
            customer_id: { type: 'string', description: 'Stripe customer ID' },
            invoice_id: { type: 'string', description: 'Invoice ID' },
          },
          required: ['customer_id', 'invoice_id'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            customer_name: { type: 'string' },
            invoice_status: { type: 'string' },
            charge_amount: { type: 'number' },
          },
        },
        risk: 'HIGH',
        humanApprovalRequired: true,
        permissions: {
          read: ['customers', 'invoices'],
          write: ['invoices/pay'],
        },
      },
    ];
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
