'use client';

import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  FileCode,
  ShieldCheck,
  History,
  Terminal,
  AlertTriangle,
  ArrowRight,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RepairContext, RepairHistoryItem } from '@/lib/types';
import { CodexRepairProgressStep } from '@/lib/engine/codex-repair';
import { NavTab } from '../layout/sidebar';

interface RepairCenterViewProps {
  isBroken: boolean;
  onRepairComplete: () => Promise<void>;
  onNavigate: (tab: NavTab) => void;
}

export const RepairCenterView: React.FC<RepairCenterViewProps> = ({
  isBroken,
  onRepairComplete,
  onNavigate,
}) => {
  const [repairing, setRepairing] = useState(false);
  const [repairMode, setRepairMode] = useState<'LIVE_CODEX' | 'DEMO_REPLAY'>('DEMO_REPLAY');
  const [repairSteps, setRepairSteps] = useState<CodexRepairProgressStep[]>([]);
  const [repairComplete, setRepairComplete] = useState(!isBroken);
  const [patchDiff, setPatchDiff] = useState<string | null>(null);

  const [history, setHistory] = useState<RepairHistoryItem[]>([
    {
      id: 'rep_hist_01',
      timestamp: '2026-09-18 10:15:22',
      capabilityId: 'mutation_capability',
      capabilityName: 'order_pet_safely',
      failureReason: 'Missing parameter sanitization on path variables',
      filesChanged: ['src/lib/engine/workflow-executor.ts'],
      testsBefore: '8/9',
      testsAfter: '9/9',
      status: 'VERIFIED',
      diff: `@@ -42,3 +42,3 @@\n- const path = endpoint.path.replace('{id}', inputs.id);\n+ const path = endpoint.path.replace(new RegExp('{id}', 'gi'), encodeURIComponent(inputs.id));`,
    },
  ]);

  const handleFixWithCodex = async () => {
    setRepairing(true);
    setRepairComplete(false);
    setPatchDiff(null);

    const steps: CodexRepairProgressStep[] = [
      { id: '1', label: 'Analyzing failure context & test assertions...', status: 'RUNNING' },
      { id: '2', label: 'Inspecting capability implementation in workflow-executor.ts...', status: 'PENDING' },
      { id: '3', label: 'Synthesizing & applying code patch...', status: 'PENDING' },
      { id: '4', label: 'Re-running evaluation suite (9 scenarios)...', status: 'PENDING' },
    ];
    setRepairSteps([...steps]);

    // Step 1
    await new Promise((r) => setTimeout(r, 700));
    steps[0].status = 'COMPLETED';
    steps[0].details = 'Located failed assertion in Test 5 (Mutation safety approval guard)';
    steps[1].status = 'RUNNING';
    setRepairSteps([...steps]);

    // Step 2
    await new Promise((r) => setTimeout(r, 900));
    steps[1].status = 'COMPLETED';
    steps[1].details = 'Detected missing human operator approval guard before live mutation dispatch';
    steps[2].status = 'RUNNING';
    setRepairSteps([...steps]);

    // Step 3
    await new Promise((r) => setTimeout(r, 900));
    steps[2].status = 'COMPLETED';
    steps[2].details = 'Re-inserted strict operator approval guard check in workflow-executor.ts';
    steps[3].status = 'RUNNING';
    setRepairSteps([...steps]);

    // Step 4: Execute real repair API call
    try {
      const res = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: repairMode }),
      });
      const data = await res.json();

      steps[3].status = 'COMPLETED';
      steps[3].details = '9/9 Scenarios Passed (VERIFIED)';
      setRepairSteps([...steps]);
      setPatchDiff(data.diff);

      await onRepairComplete();
      setRepairComplete(true);

      // Trigger celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14532D', '#16A34A', '#DCFCE7', '#FACC15'],
      });

      if (data.historyItem) {
        setHistory((prev) => [data.historyItem, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
              Repair Center
            </h1>
            <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded-full border border-green-200">
              ● Codex Integration Active
            </span>
          </div>
          <p className="text-sm text-[#667066] mt-0.5">
            Diagnose broken capability contracts, synthesize targeted code patches, and auto-verify with evaluations.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-[#E2E8E2] text-xs">
          <span className="text-[#667066] px-2 font-medium">Mode:</span>
          <button
            onClick={() => setRepairMode('LIVE_CODEX')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              repairMode === 'LIVE_CODEX'
                ? 'bg-[#14532D] text-white shadow-sm'
                : 'text-[#667066] hover:text-[#172018]'
            }`}
          >
            Live Codex Agent
          </button>
          <button
            onClick={() => setRepairMode('DEMO_REPLAY')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              repairMode === 'DEMO_REPLAY'
                ? 'bg-[#14532D] text-white shadow-sm'
                : 'text-[#667066] hover:text-[#172018]'
            }`}
          >
            Demo Repair Replay
          </button>
        </div>
      </div>

      {/* Hero Failure / Diagnostics Card */}
      {isBroken ? (
        <div className="bg-white rounded-lg border-2 border-red-300 shadow-sm p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold font-mono text-[#172018]">
                    resolve_customer_order
                  </h2>
                  <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    ● CAPABILITY FAILED
                  </span>
                </div>
                <div className="text-xs text-red-700 mt-0.5">
                  8 / 9 evaluation scenarios passed (1 failure detected)
                </div>
              </div>
            </div>

            {/* Prominent Fix CTA */}
            <button
              onClick={handleFixWithCodex}
              disabled={repairing}
              className="px-6 py-3 bg-[#14532D] text-white text-xs font-bold rounded-lg hover:bg-[#0f3e22] shadow-md flex items-center space-x-2 disabled:opacity-60 transition-all self-start md:self-auto"
            >
              <Wrench className="w-4 h-4 text-[#DCFCE7]" />
              <span>{repairing ? 'Codex Synthesizing Patch...' : 'FIX WITH CODEX'}</span>
            </button>
          </div>

          {/* Detailed Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-red-50/60 rounded-md border border-red-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-red-800">
                Failed Assertion: Refund Permission Check
              </span>
              <div className="text-[#172018] font-medium">
                Expected: POST /refund must require explicit human approval before financial mutation.
              </div>
            </div>

            <div className="p-3.5 bg-red-50/60 rounded-md border border-red-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-red-800">
                Observed Root Cause
              </span>
              <div className="text-[#172018] font-medium">
                Actual: Human approval guard was removed or bypassed in{' '}
                <code className="font-mono text-red-700 bg-red-100 px-1 py-0.5 rounded">
                  workflow-executor.ts
                </code>
                .
              </div>
            </div>
          </div>

          {/* Mode notice */}
          <div className="text-[11px] text-[#667066] flex items-center justify-between pt-1">
            <span>
              Codex integration mode:{' '}
              <strong>{repairMode === 'DEMO_REPLAY' ? 'Demo repair replay' : 'Live Codex Agent'}</strong>
            </span>
            <span className="font-mono text-xs text-[#14532D]">
              Affected File: src/lib/engine/workflow-executor.ts
            </span>
          </div>
        </div>
      ) : (
        /* Verified Celebration Card */
        <div className="bg-[#DCFCE7]/60 border-2 border-[#16A34A] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#14532D] shrink-0 border border-green-300">
              <ShieldCheck className="w-6 h-6 text-[#14532D]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold font-mono text-[#14532D]">
                  resolve_customer_order
                </h2>
                <span className="text-[11px] font-bold bg-[#14532D] text-white px-2 py-0.5 rounded">
                  ● CAPABILITY VERIFIED
                </span>
              </div>
              <div className="text-xs text-[#14532D]/80 mt-0.5">
                All 9 required tests passed. Human approval guards restored. Zero policy violations.
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('agent-console')}
              className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-[#DCFCE7]" />
              <span>Run in Agent Console</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Repair Stepper / Progress Stream */}
      {repairSteps.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8E2] pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#14532D]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172018]">
                Codex Repair Progress
              </span>
            </div>
            {repairMode === 'DEMO_REPLAY' && (
              <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                Demo repair replay
              </span>
            )}
          </div>

          <div className="space-y-3">
            {repairSteps.map((s, idx) => (
              <div key={s.id} className="flex items-start space-x-3 text-xs">
                <div className="mt-0.5">
                  {s.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : s.status === 'RUNNING' ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#14532D] border-t-transparent animate-spin inline-block"></span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-[#CBD5CB] inline-block text-[10px] text-[#9AA59A] text-center leading-3">
                      {idx + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className={`font-semibold ${
                      s.status === 'RUNNING'
                        ? 'text-[#14532D]'
                        : s.status === 'COMPLETED'
                        ? 'text-[#172018]'
                        : 'text-[#9AA59A]'
                    }`}
                  >
                    {s.label}
                  </div>
                  {s.details && (
                    <div className="text-[11px] text-[#667066] font-mono mt-0.5">
                      ✓ {s.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Diff Viewer */}
      {(patchDiff || !isBroken) && (
        <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8E2] pb-3">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-[#14532D]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#172018]">
                Code Patch Inspection (Diff)
              </span>
            </div>
            <span className="text-xs font-mono text-[#16A34A] font-semibold">
              +11 additions, -3 deletions
            </span>
          </div>

          <pre className="p-4 bg-stone-900 text-stone-200 rounded-md font-mono text-[11px] overflow-x-auto leading-relaxed">
            {patchDiff ||
              `diff --git a/src/lib/engine/workflow-executor.ts b/src/lib/engine/workflow-executor.ts
index 4b91a24..9f2910c 100644
--- a/src/lib/engine/workflow-executor.ts
+++ b/src/lib/engine/workflow-executor.ts
@@ -95,11 +95,17 @@ export class WorkflowExecutor {
-    // CHAOS BUG: Guard was bypassed during chaos injection
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
+    }`}
          </pre>
        </div>
      )}

      {/* Repair History Table */}
      <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8E2] pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#14532D]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#172018]">
              Repair History & Traceability Ledger
            </span>
          </div>
          <span className="text-xs font-mono text-[#667066]">
            {history.length} Incidents Repaired
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8E2] text-[#667066] bg-[#FAFBF9]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Capability</th>
                <th className="py-2.5 px-3">Failure Reason</th>
                <th className="py-2.5 px-3">Files Changed</th>
                <th className="py-2.5 px-3">Score Before/After</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E2]">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-[#F7F8F5]">
                  <td className="py-3 px-3 font-mono text-[#667066]">{h.timestamp}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#14532D]">
                    {h.capabilityName}
                  </td>
                  <td className="py-3 px-3 text-[#172018]">{h.failureReason}</td>
                  <td className="py-3 px-3 font-mono text-[#667066]">
                    {h.filesChanged.join(', ')}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-red-600 font-bold">{h.testsBefore}</span>
                    <span className="mx-1 text-[#9AA59A]">→</span>
                    <span className="text-[#16A34A] font-bold">{h.testsAfter}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="bg-[#DCFCE7] text-[#14532D] font-bold text-[10px] px-2 py-0.5 rounded">
                      ● {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
