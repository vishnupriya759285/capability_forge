'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Globe,
  Lock,
  Sliders,
  Code,
} from 'lucide-react';
import { Capability, ExecutionResult, ExecutionTraceItem } from '@/lib/types';
import { NavTab } from '../layout/sidebar';

interface AgentConsoleViewProps {
  onNavigate: (tab: NavTab) => void;
  isBroken: boolean;
  capabilities?: Capability[];
}

export const AgentConsoleView: React.FC<AgentConsoleViewProps> = ({
  onNavigate,
  isBroken,
  capabilities = [],
}) => {
  const [availableCaps, setAvailableCaps] = useState<Capability[]>(capabilities);
  const [selectedCapId, setSelectedCapId] = useState<string>('');
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [rawJsonMode, setRawJsonMode] = useState<boolean>(false);
  const [rawJsonString, setRawJsonString] = useState<string>('{}');

  const [targetBaseUrl, setTargetBaseUrl] = useState<string>('');
  const [authHeader, setAuthHeader] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const [executing, setExecuting] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Load capabilities and targetBaseUrl if not provided
  useEffect(() => {
    loadPlatformCaps();
  }, []);

  const loadPlatformCaps = async () => {
    try {
      const res = await fetch('/api/compile');
      if (res.ok) {
        const data = await res.json();
        const caps: Capability[] = Array.isArray(data) ? data : (data.capabilities || []);
        setAvailableCaps(caps);
        if (caps.length > 0 && !selectedCapId) {
          selectCapability(caps[0]);
        }
      }

      const analysisRes = await fetch('/api/analyze');
      if (analysisRes.ok) {
        const analysis = await analysisRes.json();
        if (analysis.baseUrl && !targetBaseUrl) {
          setTargetBaseUrl(analysis.baseUrl);
        }
      }
    } catch (e) {
      console.error('Error loading capabilities:', e);
    }
  };

  const selectCapability = (cap: Capability) => {
    setSelectedCapId(cap.id);
    const initialInputs: Record<string, any> = {};
    if (cap.contract?.inputs) {
      for (const [key, val] of Object.entries(cap.contract.inputs)) {
        initialInputs[key] = val.example !== undefined ? val.example : '';
      }
    }
    setInputValues(initialInputs);
    setRawJsonString(JSON.stringify(initialInputs, null, 2));
    setExecutionResult(null);
  };

  const handleSelectCapabilityId = (capId: string) => {
    const cap = availableCaps.find((c) => c.id === capId);
    if (cap) {
      selectCapability(cap);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    const next = { ...inputValues, [key]: value };
    setInputValues(next);
    setRawJsonString(JSON.stringify(next, null, 2));
  };

  const handleRawJsonChange = (str: string) => {
    setRawJsonString(str);
    try {
      const parsed = JSON.parse(str);
      setInputValues(parsed);
    } catch {
      // Allow user to continue typing invalid JSON temporarily
    }
  };

  const handleRunTask = async (isApproved = false) => {
    if (isApproved) {
      setApproving(true);
    } else {
      setExecuting(true);
    }

    try {
      let finalInputs = inputValues;
      if (rawJsonMode) {
        try {
          finalInputs = JSON.parse(rawJsonString);
        } catch {
          alert('Invalid JSON input format. Please check your syntax.');
          setExecuting(false);
          setApproving(false);
          return;
        }
      }

      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capabilityId: selectedCapId,
          inputs: finalInputs,
          isHumanApproved: isApproved,
          targetBaseUrl: targetBaseUrl.trim() || undefined,
          authHeader: authHeader.trim() || undefined,
        }),
      });

      const data: ExecutionResult = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      console.error('Execution error:', err);
    } finally {
      setExecuting(false);
      setApproving(false);
    }
  };

  const activeCap = availableCaps.find((c) => c.id === selectedCapId) || availableCaps[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
              Agent Console
            </h1>
            <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded-full border border-green-200">
              ● Live HTTP Engine
            </span>
          </div>
          <p className="text-sm text-[#667066] mt-0.5">
            Test agent capabilities against live target APIs with real HTTP calls, request headers, and approval gates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {executionResult && (
            <button
              onClick={() => setExecutionResult(null)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E2E8E2] rounded-md text-[#667066] hover:text-[#172018] flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Trace</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('evaluations')}
            className="px-4 py-2 text-xs font-semibold bg-white border border-[#E2E8E2] rounded-md text-[#172018] hover:bg-[#F7F8F5]"
          >
            Run Evaluations
          </button>
        </div>
      </div>

      {/* Capability Selector & Live Endpoint Configuration */}
      <div className="bg-white p-5 rounded-lg border border-[#E2E8E2] shadow-sm space-y-5">
        {/* Capability Selection Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8E2] pb-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#667066] block mb-1">
              Select Capability to Test
            </label>
            <select
              value={selectedCapId}
              disabled={availableCaps.length === 0}
              onChange={(e) => handleSelectCapabilityId(e.target.value)}
              className="px-3 py-2 text-xs font-mono font-bold bg-[#FAFBF9] border border-[#E2E8E2] rounded-md text-[#14532D] focus:outline-none focus:ring-1 focus:ring-[#14532D] min-w-[300px] disabled:opacity-50"
            >
              {availableCaps.length === 0 ? (
                <option value="">No capabilities compiled yet</option>
              ) : (
                availableCaps.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.endpoints.length} endpoints • {c.risk} Risk)
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border flex items-center space-x-1.5 transition-colors ${
                targetBaseUrl
                  ? 'bg-green-50 border-green-200 text-[#14532D]'
                  : 'bg-white border-[#E2E8E2] text-[#667066] hover:bg-[#F7F8F5]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>
                {targetBaseUrl ? `Target: ${targetBaseUrl}` : 'Configure Target Server URL'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Server URL & Auth Config (Expandable) */}
        {showConfig && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAFBF9] rounded-md border border-[#E2E8E2] text-xs">
            <div>
              <label className="text-[#172018] font-bold block mb-1">
                Target API Base URL (Live Server)
              </label>
              <input
                type="text"
                value={targetBaseUrl}
                onChange={(e) => setTargetBaseUrl(e.target.value)}
                placeholder="e.g. https://api.yourcompany.com/v1"
                className="w-full px-3 py-2 bg-white border border-[#E2E8E2] rounded-md font-mono text-xs text-[#172018] focus:outline-none focus:ring-1 focus:ring-[#14532D]"
              />
              <p className="text-[11px] text-[#667066] mt-1">
                Requests will be dispatched directly to this host via live HTTP.
              </p>
            </div>

            <div>
              <label className="text-[#172018] font-bold block mb-1">
                Authorization Header (Bearer Token / API Key)
              </label>
              <input
                type="password"
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
                placeholder="Bearer YOUR_TOKEN or Basic ..."
                className="w-full px-3 py-2 bg-white border border-[#E2E8E2] rounded-md font-mono text-xs text-[#172018] focus:outline-none focus:ring-1 focus:ring-[#14532D]"
              />
              <p className="text-[11px] text-[#667066] mt-1">
                Attached as the Authorization header on every request.
              </p>
            </div>
          </div>
        )}

        {/* Empty state when no capabilities exist */}
        {availableCaps.length === 0 && (
          <div className="p-12 text-center bg-[#FAFBF9] rounded-lg border border-dashed border-[#CBD5CB] space-y-3">
            <Terminal className="w-10 h-10 text-[#667066] mx-auto opacity-50" />
            <div className="text-sm font-bold text-[#172018]">No Capabilities Available to Test</div>
            <p className="text-xs text-[#667066] max-w-md mx-auto">
              Import an OpenAPI specification to synthesize agent capabilities. Once compiled, you can test endpoints, payloads, and approval gates with live HTTP calls here.
            </p>
            <button
              onClick={() => onNavigate('api-analysis')}
              className="px-4 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm"
            >
              Import OpenAPI Specification
            </button>
          </div>
        )}

        {/* Capability Contract Information */}
        {activeCap && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-[#FAFBF9] rounded-md border border-[#E2E8E2]">
              <div>
                <span className="font-mono text-xs font-bold text-[#14532D]">
                  {activeCap.name}
                </span>
                <p className="text-xs text-[#667066] mt-0.5">{activeCap.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeCap.risk === 'HIGH'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : activeCap.risk === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-green-50 text-green-800 border-green-200'
                  }`}
                >
                  {activeCap.risk} RISK
                </span>
                {activeCap.humanApprovalRequired && (
                  <span className="text-[10px] font-bold bg-[#FEF9C3] text-[#854D0E] px-2 py-0.5 rounded border border-[#FACC15]">
                    APPROVAL GUARD ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Parameter Input Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#667066]">
                  Invocation Arguments
                </label>
                <button
                  onClick={() => setRawJsonMode(!rawJsonMode)}
                  className="text-[11px] text-[#14532D] hover:underline font-semibold flex items-center space-x-1"
                >
                  <Code className="w-3 h-3" />
                  <span>{rawJsonMode ? 'Switch to Form Fields' : 'Edit as Raw JSON'}</span>
                </button>
              </div>

              {rawJsonMode ? (
                <div>
                  <textarea
                    value={rawJsonString}
                    onChange={(e) => handleRawJsonChange(e.target.value)}
                    rows={6}
                    className="w-full p-3 font-mono text-xs bg-[#FAFBF9] border border-[#E2E8E2] rounded-md text-[#172018] focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(activeCap.contract?.inputs || {}).map(([paramName, paramInfo]) => (
                    <div key={paramName} className="p-3 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-mono font-bold text-[#172018]">
                          {paramName}
                        </label>
                        {paramInfo.required && (
                          <span className="text-[10px] font-bold text-red-600">required</span>
                        )}
                      </div>
                      <input
                        type={paramInfo.type === 'number' ? 'number' : 'text'}
                        value={inputValues[paramName] ?? ''}
                        onChange={(e) => handleInputChange(paramName, e.target.value)}
                        placeholder={paramInfo.example ? `e.g. ${paramInfo.example}` : `Enter ${paramName}`}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8E2] rounded font-mono text-[#172018] focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                      />
                      <div className="text-[10px] text-[#667066] mt-1 truncate">
                        {paramInfo.description || `Type: ${paramInfo.type}`}
                      </div>
                    </div>
                  ))}

                  {Object.keys(activeCap.contract?.inputs || {}).length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-[#667066] italic bg-[#FAFBF9] rounded-md border border-[#E2E8E2]">
                      No input parameters required for this capability.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Execute Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => handleRunTask(false)}
                disabled={executing}
                className="px-6 py-2.5 bg-[#14532D] text-white text-xs font-bold rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-2 disabled:opacity-60 transition-all"
              >
                <Play className="w-4 h-4 fill-current text-[#DCFCE7]" />
                <span>{executing ? 'Dispatching Live Request...' : 'Execute Live Capability'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Execution Timeline & Output */}
      {executionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Trace */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8E2] pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#14532D]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#172018]">
                  Live Execution Trace
                </span>
              </div>
              <span className="text-xs font-mono text-[#667066]">
                {executionResult.trace.length} Steps Recorded
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {executionResult.trace.map((item: ExecutionTraceItem) => {
                const isApproval = item.type === 'APPROVAL_REQUIRED';
                const isError = item.type === 'ERROR';
                const isMutation = item.type === 'MUTATION_SUCCESS';
                const isGranted = item.type === 'APPROVAL_GRANTED';

                return (
                  <div
                    key={item.index}
                    className={`p-3 rounded-md border text-xs font-mono transition-all ${
                      isApproval
                        ? 'bg-[#FEF9C3] border-[#FACC15] text-[#854D0E]'
                        : isError
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : isMutation
                        ? 'bg-green-50 border-green-300 text-green-900 font-semibold'
                        : isGranted
                        ? 'bg-[#DCFCE7] border-green-300 text-[#14532D]'
                        : 'bg-[#FAFBF9] border-[#E2E8E2] text-[#172018]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold opacity-60">0{item.index}</span>
                        <span className="font-bold">{item.stepName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] opacity-75">
                        {item.durationMs !== undefined && <span>{item.durationMs}ms</span>}
                        <span>{item.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-[11px] leading-relaxed font-sans">{item.details}</div>

                    {item.payload && (
                      <div className="mt-2 p-2 bg-black/5 rounded text-[10px] overflow-x-auto">
                        <pre>{JSON.stringify(item.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Approval Card & Output */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8E2] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172018]">
                  Target Resolution
                </span>
                <span className="text-xs font-mono bg-[#DCFCE7] text-[#14532D] font-bold px-2 py-0.5 rounded">
                  {selectedCapId}
                </span>
              </div>

              {/* Operator Approval Gate Card */}
              {executionResult.requiresApproval && executionResult.approvalPayload && (
                <div className="p-4 bg-[#FEF9C3] rounded-lg border-2 border-[#FACC15] space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#854D0E]">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Human Operator Sign-Off Required</span>
                  </div>

                  <div className="space-y-2 text-xs text-[#854D0E]">
                    <p className="leading-relaxed">
                      {executionResult.approvalPayload.reason || 'This mutation requires explicit human approval before executing on the target server.'}
                    </p>

                    <div className="bg-white/80 p-2.5 rounded border border-amber-300 font-mono text-[11px] space-y-1">
                      <div>
                        <span className="font-bold text-[#854D0E]">Target Method: </span>
                        <span>{executionResult.approvalPayload.method || 'POST'}</span>
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-[#854D0E]">Endpoint: </span>
                        <span>{executionResult.approvalPayload.targetUrl || executionResult.approvalPayload.endpoint}</span>
                      </div>
                    </div>

                    {executionResult.approvalPayload.payload && (
                      <div className="bg-white/80 p-2 rounded border border-amber-300 font-mono text-[10px] max-h-32 overflow-y-auto">
                        <pre>{JSON.stringify(executionResult.approvalPayload.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleRunTask(true)}
                      disabled={approving}
                      className="flex-1 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm transition-all"
                    >
                      {approving ? 'Executing Live Mutation...' : 'Authorize & Execute Mutation'}
                    </button>
                    <button
                      onClick={() => setExecutionResult(null)}
                      className="px-4 py-2 text-xs font-semibold bg-white border border-amber-300 rounded-md text-[#854D0E] hover:bg-amber-100/50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Execution Result Payload */}
              {executionResult.resultData && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#172018]">
                    <span>Response Payload</span>
                    <span className="text-[10px] font-mono text-[#667066]">application/json</span>
                  </div>
                  <pre className="p-3 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md text-[11px] font-mono text-[#172018] overflow-x-auto max-h-[350px]">
                    {JSON.stringify(executionResult.resultData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
