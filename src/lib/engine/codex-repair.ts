import {
  RepairContext,
  RepairHistoryItem,
} from '@/lib/types';
import { chaosEngine } from './chaos-engine';
import { CapabilityEvaluator } from './evaluator';
import { capabilityStore } from './capability-store';
import { CapabilityCompiler } from './capability-compiler';

export interface CodexRepairProgressStep {
  id: string;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  details?: string;
  durationMs?: number;
}

export class CodexRepairEngine {
  private static history: RepairHistoryItem[] = [
    {
      id: 'rep_hist_init_01',
      timestamp: '2026-09-18 10:15:22',
      capabilityId: 'order_pet_safely',
      capabilityName: 'order_pet_safely',
      failureReason: 'Missing parameter sanitization on path variables',
      filesChanged: ['src/lib/engine/workflow-executor.ts'],
      testsBefore: '8/9',
      testsAfter: '9/9',
      status: 'VERIFIED',
      diff: `@@ -42,3 +42,3 @@
- const path = endpoint.path.replace('{id}', inputs.id);
+ const path = endpoint.path.replace(new RegExp('{id}', 'gi'), encodeURIComponent(inputs.id));`,
    },
  ];

  /**
   * Build the structured repair context payload for Codex
   */
  public static buildRepairContext(capabilityId?: string): RepairContext {
    const chaos = chaosEngine.getState();
    const cap =
      (capabilityId ? capabilityStore.getCapability(capabilityId) : null) ||
      capabilityStore.getCapabilities()[0] ||
      (capabilityId ? CapabilityCompiler.compile(capabilityId) : CapabilityCompiler.listCompiledCapabilities()[0]);

    const capName = cap?.name || 'mutation_capability';
    const capId = cap?.id || 'mutation_capability';

    return {
      capabilityId: capId,
      capabilityName: capName,
      failedTestName: 'Mutation safety approval guard',
      expectedBehavior: 'State-changing mutation must require explicit operator approval before dispatching HTTP request.',
      actualBehavior: chaos.isBroken
        ? 'Mutation request was executed directly without operator approval gate.'
        : 'Guarded by operator authorization gate.',
      relevantFiles: [
        {
          path: 'src/lib/engine/workflow-executor.ts',
          snippet: `// Step: Human Approval Guard Check
if (step.type === 'APPROVAL_GUARD' || step.requiresHumanApproval) {
  if (!isBroken && !isHumanApproved) {
    addTrace(step.name, 'APPROVAL_REQUIRED', 'Operator approval required');
    return {
      success: true,
      requiresApproval: true,
      approvalPayload: { ... }
    };
  }
}`,
        },
      ],
      logs: [
        `[SECURITY AUDIT] Testing write operation on capability ${capName}`,
        '[VIOLATION] Execution proceeded directly to live mutation without verifying isHumanApproved',
        '[ASSERTION FAILED] Expected requiresApproval === true, received mutationExecuted === true',
      ],
      reproductionSteps: [
        `1. Compile capability ${capName}`,
        '2. Trigger execution with isHumanApproved=false',
        '3. Observe that write mutation was invoked directly without pausing for operator approval',
      ],
    };
  }

  /**
   * Get code diff showing the fix applied
   */
  public static getPatchDiff(): string {
    return `diff --git a/src/lib/engine/workflow-executor.ts b/src/lib/engine/workflow-executor.ts
index 4b91a24..9f2910c 100644
--- a/src/lib/engine/workflow-executor.ts
+++ b/src/lib/engine/workflow-executor.ts
@@ -95,11 +95,17 @@ export class WorkflowExecutor {
-    // CHAOS BUG: Guard was bypassed or removed during chaos injection
-    // Directly dispatching mutation to target API:
-    // const res = await fetch(fullUrl, fetchOptions);
+    // CODEX REPAIR APPLIED: Re-insert strict human operator approval guard
+    if (step.type === 'APPROVAL_GUARD' || step.requiresHumanApproval) {
+      if (!isHumanApproved) {
+        addTrace(
+          step.name,
+          'APPROVAL_REQUIRED',
+          'Operator authorization required before executing mutation: ' + step.description
+        );
+        return {
+          success: true,
+          capabilityId: capability.id,
+          requiresApproval: true,
+          approvalPayload: { ... }
+        };
+      }
+    }`;
  }

  /**
   * Execute Codex-assisted repair
   */
  public static async executeRepair(options: {
    mode?: 'LIVE_CODEX' | 'DEMO_REPLAY';
    capabilityId?: string;
  }): Promise<{
    success: boolean;
    diff: string;
    testsAfter: string;
    historyItem: RepairHistoryItem;
  }> {
    const diff = this.getPatchDiff();
    const cap =
      (options.capabilityId ? capabilityStore.getCapability(options.capabilityId) : null) ||
      capabilityStore.getCapabilities()[0] ||
      CapabilityCompiler.listCompiledCapabilities()[0];

    const capId = cap?.id || 'mutation_capability';
    const capName = cap?.name || 'mutation_capability';

    // 1. Repair chaos state
    chaosEngine.repairCapability();

    // 2. Re-run evaluations to verify fix
    const evalReport = await CapabilityEvaluator.evaluateCapability(capId);

    const historyItem: RepairHistoryItem = {
      id: `rep_hist_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      capabilityId: capId,
      capabilityName: capName,
      failureReason: 'Missing human operator approval guard before mutation dispatch',
      filesChanged: ['src/lib/engine/workflow-executor.ts'],
      testsBefore: '8/9',
      testsAfter: `${evalReport.passedTests}/${evalReport.totalTests}`,
      status: evalReport.status === 'FAILED' ? 'FAILED' : 'VERIFIED',
      diff,
    };

    this.history.unshift(historyItem);

    return {
      success: true,
      diff,
      testsAfter: `${evalReport.passedTests}/${evalReport.totalTests}`,
      historyItem,
    };
  }

  public static getHistory(): RepairHistoryItem[] {
    return this.history;
  }
}
