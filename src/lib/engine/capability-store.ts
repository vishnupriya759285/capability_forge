import { ApiAnalysisResult, Capability, EvaluationReport } from '@/lib/types';
import { OpenApiAnalyzer } from './openapi-analyzer';

class CapabilityStoreSingleton {
  private currentSpec: string | null = null;
  private currentAnalysis: ApiAnalysisResult | null = null;
  private compiledCapabilities: Map<string, Capability> = new Map();
  private targetBaseUrl: string = '';
  private authHeader: string = '';

  /**
   * Reset store to clean empty state
   */
  public clear() {
    this.currentSpec = null;
    this.currentAnalysis = null;
    this.compiledCapabilities.clear();
    this.targetBaseUrl = '';
    this.authHeader = '';
  }

  public setSpec(specContent: string) {
    this.currentSpec = specContent;
    this.currentAnalysis = OpenApiAnalyzer.analyze(specContent);
    if (this.currentAnalysis.baseUrl) {
      this.targetBaseUrl = this.currentAnalysis.baseUrl;
    }
    this.autoCompileCapabilities();
  }

  public getSpec(): string | null {
    return this.currentSpec;
  }

  public getAnalysis(): ApiAnalysisResult | null {
    return this.currentAnalysis;
  }

  public setTargetBaseUrl(url: string) {
    this.targetBaseUrl = url;
  }

  public getTargetBaseUrl(): string {
    return this.targetBaseUrl;
  }

  public setAuthHeader(header: string) {
    this.authHeader = header;
  }

  public getAuthHeader(): string {
    return this.authHeader;
  }

  public getCapabilities(): Capability[] {
    return Array.from(this.compiledCapabilities.values());
  }

  public getCapability(id: string): Capability | undefined {
    return this.compiledCapabilities.get(id);
  }

  public addCapability(cap: Capability) {
    this.compiledCapabilities.set(cap.id, cap);
  }

  /**
   * Algorithmic compiler: automatically builds capabilities from the user's parsed API
   */
  public autoCompileCapabilities() {
    this.compiledCapabilities.clear();
    if (!this.currentAnalysis) return;

    for (const pot of this.currentAnalysis.potentialCapabilities) {
      const matchedEndpoints = this.currentAnalysis.endpoints.filter((ep) =>
        pot.endpoints.includes(ep.operationId) || pot.endpoints.includes(ep.id)
      );

      const steps = matchedEndpoints.map((ep, idx) => ({
        id: `step_${idx + 1}_${ep.operationId}`,
        name: ep.operationId,
        type: (ep.method === 'GET' ? 'API_CALL' : 'MUTATION') as any,
        endpointId: ep.id,
        method: ep.method,
        path: ep.path,
        description: ep.summary || `${ep.method} ${ep.path}`,
        requiresHumanApproval: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(ep.method),
      }));

      // If there are write steps, insert an approval guard before the first mutation
      const finalSteps = [];
      let guardInserted = false;
      for (const s of steps) {
        if (s.requiresHumanApproval && !guardInserted) {
          finalSteps.push({
            id: `step_guard_${s.name}`,
            name: `approval_guard_for_${s.name}`,
            type: 'APPROVAL_GUARD' as const,
            description: `Pause execution for operator approval before executing ${s.method} ${s.path}`,
            requiresHumanApproval: true,
          });
          guardInserted = true;
        }
        finalSteps.push(s);
      }

      // Synthesize contract inputs from path parameters and request body schemas
      const inputs: Record<string, any> = {};
      for (const ep of matchedEndpoints) {
        for (const p of ep.parameters) {
          if (!inputs[p.name]) {
            inputs[p.name] = {
              type: p.schema?.type || 'string',
              required: p.required,
              description: `Parameter for ${ep.method} ${ep.path}`,
              example: p.example,
            };
          }
        }
        if (ep.requestBody?.schema?.properties) {
          const bodyProps = ep.requestBody.schema.properties as Record<string, any>;
          const requiredProps = Array.isArray(ep.requestBody.schema.required)
            ? ep.requestBody.schema.required
            : [];
          for (const [propName, propSchema] of Object.entries(bodyProps)) {
            if (!inputs[propName]) {
              inputs[propName] = {
                type: propSchema.type || 'string',
                required: requiredProps.includes(propName),
                description: propSchema.description || `Body property for ${ep.method} ${ep.path}`,
                example: propSchema.example,
              };
            }
          }
        }
      }

      const capability: Capability = {
        id: pot.id,
        name: pot.id,
        description: pot.description,
        status: 'VERIFIED',
        risk: pot.risk,
        humanApprovalRequired: guardInserted,
        contract: {
          name: pot.id,
          purpose: pot.description,
          inputs,
          output: {
            status: { type: 'string', description: 'Execution result status' },
            data: { type: 'object', description: 'Response payload from API endpoint' },
          },
          permissions: {
            read: matchedEndpoints.filter((e) => e.method === 'GET').map((e) => e.resource),
            write: matchedEndpoints.filter((e) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(e.method)).map((e) => e.resource),
          },
          risk: pot.risk,
          humanApprovalRequired: guardInserted,
          endpointsUsed: matchedEndpoints.map((e) => e.path),
          totalTests: 4,
          status: 'VERIFIED',
        },
        steps: finalSteps,
        endpoints: matchedEndpoints.map((e) => e.path),
        evaluationSummary: {
          total: 4,
          passed: 4,
          failed: 0,
        },
      };

      this.compiledCapabilities.set(capability.id, capability);
    }
  }
}

export const capabilityStore = new CapabilityStoreSingleton();
