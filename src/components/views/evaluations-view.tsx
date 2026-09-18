'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EvaluationReport, EvaluationScenario } from '@/lib/types';
import { NavTab } from '../layout/sidebar';

interface EvaluationsViewProps {
  evaluationReport: EvaluationReport | null;
  onRunEvaluations: () => Promise<void>;
  isBroken: boolean;
  onToggleChaos: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const EvaluationsView: React.FC<EvaluationsViewProps> = ({
  evaluationReport,
  onRunEvaluations,
  isBroken,
  onToggleChaos,
  onNavigate,
}) => {
  const [running, setRunning] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>('test_5_mutation_approval_guard');

  const handleRun = async () => {
    setRunning(true);
    await onRunEvaluations();
    setRunning(false);
  };

  const report = evaluationReport;
  const isFailed = report && report.failedTests > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
              Evaluations
            </h1>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                isFailed
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-[#DCFCE7] text-[#14532D] border-green-200'
              }`}
            >
              {report ? `${report.passedTests}/${report.totalTests} Scenarios Passed` : '9 Scenarios'}
            </span>
          </div>
          <p className="text-sm text-[#667066] mt-0.5">
            Automated test assertions verifying endpoint parameters, logic calculations, error handling, and security guards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Chaos Toggle Button */}
          <button
            onClick={onToggleChaos}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center space-x-1.5 transition-colors ${
              isBroken
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                : 'bg-white border-[#E2E8E2] text-[#667066] hover:text-[#172018] hover:bg-[#F7F8F5]'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isBroken ? 'text-red-600' : 'text-amber-500'}`} />
            <span>{isBroken ? 'Chaos Injected (Broken)' : 'Break Capability (Chaos Mode)'}</span>
          </button>

          {/* Run Evaluations Button */}
          <button
            onClick={handleRun}
            disabled={running}
            className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#DCFCE7]" />
            <span>{running ? 'Running Scenarios...' : 'Run All Evaluations'}</span>
          </button>
        </div>
      </div>

      {/* Failure Alert Banner (when broken) */}
      {isFailed && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-red-900">
                CAPABILITY FAILED: {report?.capabilityId || 'Active Capability'} ({report?.passedTests} / {report?.totalTests} tests passed)
              </div>
              <div className="text-xs text-red-800 mt-0.5">
                Security assertion violation: <strong>Mutation safety approval guard failed</strong>. Human approval guard bypassed before live mutation dispatch.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('repair-center')}
            className="px-4 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5 self-start md:self-auto shrink-0"
          >
            <Wrench className="w-4 h-4 text-[#DCFCE7]" />
            <span>FIX WITH CODEX</span>
          </button>
        </div>
      )}

      {/* Verified Banner (when all pass) */}
      {!isFailed && report && (
        <div className="p-4 bg-[#DCFCE7] border border-green-300 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
            <div>
              <div className="text-sm font-bold text-[#14532D]">
                CAPABILITY VERIFIED (9 / 9 PASSED)
              </div>
              <div className="text-xs text-[#14532D]/80">
                All 9 deterministic assertions passed. Security guards, parameter bindings, and schemas are certified safe for AI agent use.
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('agent-console')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22]"
          >
            Run in Agent Console
          </button>
        </div>
      )}

      {/* Tests Table / List */}
      <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8E2] bg-[#FAFBF9] flex items-center justify-between text-xs font-semibold text-[#667066]">
          <span>Evaluation Scenarios for resolve_customer_order</span>
          <span className="font-mono">
            {report?.passedTests || 9} passed, {report?.failedTests || 0} failed
          </span>
        </div>

        <div className="divide-y divide-[#E2E8E2]">
          {report?.scenarios.map((scenario: EvaluationScenario, index: number) => {
            const isPass = scenario.status === 'PASSED';
            const isExpanded = expandedId === scenario.id;

            return (
              <div key={scenario.id} className="transition-colors hover:bg-[#F7F8F5]">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#172018]">
                          {index + 1}. {scenario.name}
                        </span>
                        <span className="text-[10px] font-mono bg-[#FAFBF9] text-[#667066] px-1.5 py-0.2 rounded border border-[#E2E8E2]">
                          {scenario.assertionType}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#667066] mt-0.5">
                        {scenario.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-[#667066] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#9AA59A]" />
                      <span>{scenario.durationMs}ms</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isPass
                          ? 'bg-[#DCFCE7] text-[#14532D]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {scenario.status}
                    </span>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#667066]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#667066]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details / Logs */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-[#FAFBF9] border-t border-[#E2E8E2] text-xs space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 bg-white rounded border border-[#E2E8E2]">
                        <span className="text-[10px] font-bold text-[#667066] uppercase">
                          Expected Assertion
                        </span>
                        <div className="text-xs font-mono text-[#172018] mt-0.5">
                          {scenario.expected}
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded border ${
                          isPass
                            ? 'bg-white border-[#E2E8E2]'
                            : 'bg-red-50/50 border-red-200 text-red-900'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase text-[#667066]">
                          Actual Result
                        </span>
                        <div className="text-xs font-mono mt-0.5">{scenario.actual}</div>
                      </div>
                    </div>

                    {/* Assertion Logs */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-[#667066] uppercase">
                        Test Execution Logs
                      </div>
                      <div className="p-3 bg-stone-900 text-stone-200 rounded-md font-mono text-[11px] space-y-0.5">
                        {scenario.logs.map((log, lidx) => (
                          <div
                            key={lidx}
                            className={
                              log.includes('[FAIL]') || log.includes('[VIOLATION]')
                                ? 'text-red-400 font-bold'
                                : log.includes('[PASS]')
                                ? 'text-green-400 font-bold'
                                : 'text-stone-300'
                            }
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!isPass && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onNavigate('repair-center')}
                          className="px-3.5 py-1.5 bg-[#14532D] text-white text-xs font-bold rounded-md hover:bg-[#0f3e22] flex items-center space-x-1.5 shadow-sm"
                        >
                          <Wrench className="w-3.5 h-3.5 text-[#DCFCE7]" />
                          <span>Fix this failure with Codex</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
