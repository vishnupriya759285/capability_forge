import { ExecutionResult, ExecutionTraceItem, Capability } from '@/lib/types';
import { capabilityStore } from './capability-store';
import { chaosEngine } from './chaos-engine';
import { CapabilityCompiler } from './capability-compiler';

export interface ExecuteCapabilityOptions {
  inputs?: Record<string, any>;
  isHumanApproved?: boolean;
  targetBaseUrl?: string;
  authHeader?: string;
  orderId?: string;
}

export class WorkflowExecutor {
  /**
   * Execute any capability dynamically against live target APIs
   */
  public static async executeCapability(
    capabilityId: string,
    options: ExecuteCapabilityOptions = {}
  ): Promise<ExecutionResult> {
    const inputs = { ...(options.inputs || {}) };
    if (options.orderId && !inputs.order_id && !inputs.id) {
      inputs.order_id = options.orderId;
      inputs.id = options.orderId;
    }

    const capability =
      capabilityStore.getCapability(capabilityId) ||
      CapabilityCompiler.compile(capabilityId);

    if (!capability) {
      return {
        success: false,
        capabilityId,
        trace: [
          {
            index: 1,
            timestamp: new Date().toTimeString().split(' ')[0],
            stepName: 'capability_lookup',
            type: 'ERROR',
            details: `Capability "${capabilityId}" is not registered. Ingest an OpenAPI specification to compile capabilities.`,
          },
        ],
        resultData: { error: `Capability "${capabilityId}" not found.` },
      };
    }

    return this.executeRealCapability(capability, inputs, options);
  }

  /**
   * Universal Live HTTP Execution Engine for Any OpenAPI Capability
   */
  private static async executeRealCapability(
    capability: Capability,
    inputs: Record<string, any>,
    options: ExecuteCapabilityOptions
  ): Promise<ExecutionResult> {
    const trace: ExecutionTraceItem[] = [];
    const isHumanApproved = Boolean(options.isHumanApproved);
    const isBroken = chaosEngine.getState().isBroken;

    let traceIndex = 1;
    const addTrace = (
      stepName: string,
      type: ExecutionTraceItem['type'],
      details: string,
      payload?: any,
      durationMs?: number
    ) => {
      const now = new Date();
      const timeStr =
        now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      trace.push({
        index: traceIndex++,
        timestamp: timeStr,
        stepName,
        type,
        details,
        payload,
        durationMs: durationMs || Math.floor(Math.random() * 15) + 10,
      });
    };

    addTrace(capability.name, 'INFO', `Starting capability execution: ${capability.name}`, {
      capabilityId: capability.id,
      risk: capability.risk,
      inputs,
      approvalRequired: capability.humanApprovalRequired,
    });

    let targetBaseUrl =
      options.targetBaseUrl?.trim() ||
      capabilityStore.getTargetBaseUrl()?.trim() ||
      '';

    if (targetBaseUrl.endsWith('/')) {
      targetBaseUrl = targetBaseUrl.slice(0, -1);
    }

    const authHeader = (options.authHeader || capabilityStore.getAuthHeader() || '').trim();

    let lastResultData: any = null;

    for (const step of capability.steps) {
      // 1. Approval Guard Step
      if (step.type === 'APPROVAL_GUARD' || step.requiresHumanApproval) {
        if (!isBroken && !isHumanApproved) {
          addTrace(
            step.name,
            'APPROVAL_REQUIRED',
            `Operator authorization required before executing mutation: ${step.description}`
          );

          return {
            success: true,
            capabilityId: capability.id,
            trace,
            requiresApproval: true,
            approvalPayload: {
              actionName: step.name,
              endpoint: step.path || capability.endpoints[0] || 'API Endpoint',
              method: step.method || 'POST',
              targetUrl: targetBaseUrl ? `${targetBaseUrl}${step.path || ''}` : step.path,
              payload: inputs,
              reason: `Human operator sign-off required for write mutation: ${step.description}`,
              recommendedAction: 'Verify input parameters and authorize live execution.',
            },
            resultData: {
              status: 'AWAITING_APPROVAL',
              message: 'Execution halted safely at approval gate. Awaiting operator confirmation.',
            },
          };
        } else if (isBroken) {
          addTrace(
            step.name,
            'ERROR',
            '⚠ CHAOS MODE ACTIVE: Human approval guard was bypassed! Executing mutation directly.'
          );
        } else {
          addTrace(step.name, 'APPROVAL_GRANTED', 'Operator approval granted. Proceeding with execution.');
        }
        continue;
      }

      // 2. Logic Step
      if (step.type === 'LOGIC') {
        addTrace(step.name, 'LOGIC_EVAL', `Evaluated condition: ${step.description}`, {
          status: 'EVALUATED_OK',
        });
        continue;
      }

      // 3. Live HTTP Request Step
      if (step.path && step.method) {
        // Substitute path parameters: e.g. /pet/{petId} -> /pet/1
        let resolvedPath = step.path;
        const queryParams: Record<string, string> = {};

        for (const [key, val] of Object.entries(inputs)) {
          if (val === undefined || val === null) continue;
          const paramPlaceholderRegex = new RegExp(`{${key}}`, 'gi');
          const colonParamRegex = new RegExp(`:${key}\\b`, 'gi');

          if (paramPlaceholderRegex.test(resolvedPath) || colonParamRegex.test(resolvedPath)) {
            resolvedPath = resolvedPath.replace(paramPlaceholderRegex, encodeURIComponent(String(val)));
            resolvedPath = resolvedPath.replace(colonParamRegex, encodeURIComponent(String(val)));
          } else if (step.method === 'GET' && typeof val !== 'object') {
            queryParams[key] = String(val);
          }
        }

        // Clean any unreplaced path parameters (e.g. {id} -> 1)
        resolvedPath = resolvedPath.replace(/{[^}]+}/g, '1');

        if (step.method === 'GET' && Object.keys(queryParams).length > 0) {
          const qs = new URLSearchParams(queryParams).toString();
          resolvedPath += (resolvedPath.includes('?') ? '&' : '?') + qs;
        }

        // Determine full target URL
        let fullUrl = resolvedPath;
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
          if (targetBaseUrl) {
            fullUrl = `${targetBaseUrl}${resolvedPath.startsWith('/') ? '' : '/'}${resolvedPath}`;
          } else {
            fullUrl = resolvedPath;
          }
        }

        addTrace(
          step.name,
          'API_REQUEST',
          `Dispatching live ${step.method} request to ${fullUrl}`,
          {
            method: step.method,
            url: fullUrl,
            headers: authHeader ? { Authorization: 'Bearer [REDACTED]' } : {},
            inputs,
          }
        );

        const t0 = Date.now();

        try {
          const reqHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          };

          if (authHeader) {
            reqHeaders['Authorization'] = authHeader.startsWith('Bearer ') || authHeader.toLowerCase().startsWith('basic ')
              ? authHeader
              : `Bearer ${authHeader}`;
          }

          const fetchOptions: RequestInit = {
            method: step.method,
            headers: reqHeaders,
          };

          if (['POST', 'PUT', 'PATCH'].includes(step.method)) {
            fetchOptions.body = JSON.stringify(inputs.body || inputs);
          }

          // Execute real HTTP network request
          const res = await fetch(fullUrl, fetchOptions);
          const duration = Date.now() - t0;

          const contentType = res.headers.get('content-type') || '';
          let data: any;
          if (contentType.includes('application/json')) {
            data = await res.json().catch(() => ({}));
          } else {
            const rawText = await res.text().catch(() => '');
            try {
              data = JSON.parse(rawText);
            } catch {
              data = { responseText: rawText.slice(0, 1000) };
            }
          }

          lastResultData = data;

          if (res.ok) {
            addTrace(
              step.name,
              step.method === 'GET' ? 'API_RESPONSE' : 'MUTATION_SUCCESS',
              `${step.method} ${fullUrl} → HTTP ${res.status} ${res.statusText}`,
              data,
              duration
            );
          } else {
            addTrace(
              step.name,
              'ERROR',
              `HTTP Error: ${step.method} ${fullUrl} returned ${res.status} ${res.statusText}`,
              data,
              duration
            );
          }
        } catch (err: any) {
          const duration = Date.now() - t0;
          const errorMsg = `Live network call failed: ${err.message}`;
          addTrace(step.name, 'ERROR', errorMsg, { url: fullUrl, error: err.message }, duration);
          lastResultData = {
            status: 'NETWORK_ERROR',
            url: fullUrl,
            message: err.message,
            hint: 'Verify that the Target Base URL is reachable and CORS / network access is allowed.',
          };
        }
      }
    }

    return {
      success: true,
      capabilityId: capability.id,
      trace,
      mutationExecuted: isHumanApproved,
      resultData: lastResultData || { status: 'COMPLETED' },
    };
  }
}
