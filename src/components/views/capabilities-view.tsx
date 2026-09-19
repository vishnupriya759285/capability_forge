'use client';

import React, { useState } from 'react';
import {
  Boxes,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  Server,
  Terminal,
  Code,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { Capability } from '@/lib/types';
import { NavTab } from '../layout/sidebar';

interface CapabilitiesViewProps {
  capabilities: Capability[];
  selectedCapabilityId: string;
  onSelectCapability: (id: string) => void;
  onNavigate: (tab: NavTab) => void;
  isBroken: boolean;
}

export const CapabilitiesView: React.FC<CapabilitiesViewProps> = ({
  capabilities,
  selectedCapabilityId,
  onSelectCapability,
  onNavigate,
  isBroken,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'contract' | 'endpoints'>('graph');
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'MEDIUM' | 'LOW'>('ALL');
  const [showJsonModal, setShowJsonModal] = useState(false);

  const selectedCap =
    capabilities.find((c) => c.id === selectedCapabilityId) || capabilities[0];

  const filteredCaps = capabilities.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'VERIFIED') return c.status === 'VERIFIED';
    if (filter === 'MEDIUM') return c.risk === 'MEDIUM';
    if (filter === 'LOW') return c.risk === 'LOW';
    return true;
  });

  if (capabilities.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
                Capabilities
              </h1>
              <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200">
                0 Total Compiled
              </span>
            </div>
            <p className="text-sm text-[#667066] mt-0.5">
              Task-level agent capabilities synthesized with deterministic logic, permissions, and contracts.
            </p>
          </div>
          <button
            onClick={() => onNavigate('api-analysis')}
            className="px-4 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5"
          >
            <Boxes className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Import API & Synthesize</span>
          </button>
        </div>

        <div className="p-16 text-center bg-white rounded-lg border border-[#E2E8E2] shadow-sm space-y-4 max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#14532D] flex items-center justify-center mx-auto shadow-sm">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#172018]">No Capabilities Compiled Yet</h2>
          <p className="text-xs text-[#667066] leading-relaxed">
            Upload or paste an OpenAPI specification in API Analysis. Capability Forge will analyze your endpoint relationships, safety gates, and parameters to compile task-oriented capabilities.
          </p>
          <button
            onClick={() => onNavigate('api-analysis')}
            className="px-5 py-2.5 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm inline-flex items-center space-x-2"
          >
            <span>Go to API Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
              Capabilities
            </h1>
            <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded-full border border-green-200">
              {capabilities.length} Total Compiled
            </span>
          </div>
          <p className="text-sm text-[#667066] mt-0.5">
            Task-level agent capabilities synthesized with deterministic logic, permissions, and contracts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('mcp-server')}
            className="px-4 py-2 text-xs font-semibold bg-white border border-[#E2E8E2] rounded-md text-[#172018] hover:bg-[#F7F8F5] transition-colors flex items-center space-x-1.5"
          >
            <Server className="w-3.5 h-3.5 text-[#14532D]" />
            <span>Expose via MCP</span>
          </button>
          <button
            onClick={() => onNavigate('agent-console')}
            className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Run in Agent Console</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Capability List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-[#E2E8E2] text-xs">
            {(['ALL', 'VERIFIED', 'MEDIUM', 'LOW'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                  filter === f
                    ? 'bg-[#14532D] text-white'
                    : 'text-[#667066] hover:text-[#172018]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredCaps.map((cap) => {
              const isSelected = selectedCap && cap.id === selectedCap.id;
              const isHeroBroken = isBroken && cap.humanApprovalRequired;

              return (
                <div
                  key={cap.id}
                  onClick={() => onSelectCapability(cap.id)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#14532D] shadow-sm ring-1 ring-[#14532D]'
                      : 'bg-white border-[#E2E8E2] hover:border-[#CBD5CB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#14532D]">
                      {cap.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isHeroBroken
                          ? 'bg-red-100 text-red-700'
                          : cap.status === 'VERIFIED'
                          ? 'bg-[#DCFCE7] text-[#14532D]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isHeroBroken ? '● Failed (8/9)' : `● ${cap.status}`}
                    </span>
                  </div>

                  <p className="text-xs text-[#667066] line-clamp-2 mt-1">
                    {cap.description}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#E2E8E2] text-[11px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        cap.risk === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-green-50 text-green-800 border border-green-200'
                      }`}
                    >
                      {cap.risk} Risk
                    </span>
                    <span className="text-[#667066] font-mono">
                      {cap.endpoints.length} Endpoints
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Capability Detail & Execution Graph */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-[#E2E8E2] shadow-sm flex flex-col">
          {/* Card Header */}
          <div className="p-5 border-b border-[#E2E8E2] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold font-mono text-[#172018]">
                  {selectedCap.name}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCap?.humanApprovalRequired && isBroken
                      ? 'bg-red-100 text-red-700'
                      : 'bg-[#DCFCE7] text-[#14532D]'
                  }`}
                >
                  {selectedCap?.humanApprovalRequired && isBroken
                    ? '● FAILED (8/9 Tests)'
                    : '● VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-[#667066] mt-0.5">{selectedCap.description}</p>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center space-x-1 bg-[#F7F8F5] p-1 rounded-md border border-[#E2E8E2] text-xs self-start">
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'graph' ? 'bg-white text-[#172018] shadow-sm' : 'text-[#667066]'
                }`}
              >
                Execution Graph
              </button>
              <button
                onClick={() => setActiveTab('contract')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'contract' ? 'bg-white text-[#172018] shadow-sm' : 'text-[#667066]'
                }`}
              >
                Contract
              </button>
              <button
                onClick={() => setActiveTab('endpoints')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'endpoints' ? 'bg-white text-[#172018] shadow-sm' : 'text-[#667066]'
                }`}
              >
                Endpoints
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 flex-1">
            {/* 1. Execution Graph Tab */}
            {activeTab === 'graph' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#667066]">
                  <span>Step-by-step deterministic orchestration graph</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#14532D]"></span>
                      <span>Root</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-300"></span>
                      <span>GET</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-300"></span>
                      <span>Logic</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#FEF9C3] border border-[#FACC15]"></span>
                      <span>Approval Guard</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300"></span>
                      <span>Mutation</span>
                    </span>
                  </div>
                </div>

                {/* Visual Execution Flow Nodes */}
                <div className="bg-[#FAFBF9] border border-[#E2E8E2] rounded-lg p-6 flex flex-col items-center space-y-3">
                  {/* Root Node */}
                  <div className="bg-[#14532D] text-white px-5 py-2.5 rounded-lg shadow-sm font-mono text-xs font-bold text-center border border-[#14532D]">
                    <div className="text-[10px] text-[#DCFCE7] uppercase">Capability Root</div>
                    <div>{selectedCap.name}</div>
                  </div>

                  <div className="w-0.5 h-4 bg-[#CBD5CB]"></div>

                  {/* Fan-out Parallel / Sequential Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
                    <div className="bg-white p-3 rounded-md border border-blue-200 text-center shadow-xs">
                      <div className="text-[10px] font-bold text-blue-700 uppercase">GET Endpoint</div>
                      <div className="font-mono text-xs font-semibold text-[#172018]">get_order</div>
                      <div className="text-[10px] text-[#667066] mt-0.5">/orders/{'{id}'}</div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-blue-200 text-center shadow-xs">
                      <div className="text-[10px] font-bold text-blue-700 uppercase">GET Endpoint</div>
                      <div className="font-mono text-xs font-semibold text-[#172018]">get_shipping</div>
                      <div className="text-[10px] text-[#667066] mt-0.5">/shipping/{'{orderId}'}</div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-blue-200 text-center shadow-xs">
                      <div className="text-[10px] font-bold text-blue-700 uppercase">GET Endpoint</div>
                      <div className="font-mono text-xs font-semibold text-[#172018]">get_refund_policy</div>
                      <div className="text-[10px] text-[#667066] mt-0.5">/refund-policy</div>
                    </div>
                  </div>

                  <div className="w-0.5 h-4 bg-[#CBD5CB]"></div>

                  {/* Logic Node */}
                  <div className="bg-white p-3 rounded-md border border-purple-300 text-center shadow-xs w-full max-w-md">
                    <div className="text-[10px] font-bold text-purple-700 uppercase">Evaluation Logic</div>
                    <div className="font-mono text-xs font-semibold text-[#172018]">
                      evaluate_refund_eligibility
                    </div>
                    <div className="text-[10px] text-[#667066] mt-0.5">
                      Check if shipping.days_delayed (6) &gt; policy.max_delay (3)
                    </div>
                  </div>

                  <div className="w-0.5 h-4 bg-[#CBD5CB]"></div>

                  {/* Human Approval Guard Node */}
                  <div
                    className={`p-3.5 rounded-md border text-center shadow-xs w-full max-w-md transition-all ${
                      isBroken
                        ? 'bg-red-50 border-red-300 ring-2 ring-red-400'
                        : 'bg-[#FEF9C3] border-[#FACC15]'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#854D0E]">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>
                        {isBroken
                          ? 'APPROVAL GUARD (BYPASSED IN CHAOS BUG)'
                          : 'APPROVAL GUARD (HUMAN IN THE LOOP)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#854D0E]/80 mt-0.5">
                      {isBroken
                        ? '⚠ Guard check bypassed: code directly executes POST /refund without consent!'
                        : 'Execution halts. Prompts operator with order delay context before mutation.'}
                    </div>
                  </div>

                  <div className="w-0.5 h-4 bg-[#CBD5CB]"></div>

                  {/* Mutation Node */}
                  <div className="bg-white p-3 rounded-md border border-green-300 text-center shadow-xs w-full max-w-md">
                    <div className="text-[10px] font-bold text-[#16A34A] uppercase">State Mutation</div>
                    <div className="font-mono text-xs font-semibold text-[#172018]">create_refund</div>
                    <div className="text-[10px] text-[#667066] mt-0.5">POST /refund → REF-9021</div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Capability Contract Tab */}
            {activeTab === 'contract' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#172018] uppercase tracking-wider">
                    Formal Contract Specification
                  </div>
                  <button
                    onClick={() => setShowJsonModal(true)}
                    className="text-xs font-mono text-[#14532D] hover:underline flex items-center space-x-1"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>View Raw JSON Contract</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Inputs */}
                  <div className="p-4 bg-[#FAFBF9] rounded-lg border border-[#E2E8E2] space-y-2">
                    <div className="font-bold text-[#172018] uppercase text-[11px]">Inputs</div>
                    <div className="space-y-1 font-mono text-[11px]">
                      {Object.entries(selectedCap.contract.inputs).map(([k, v]: [string, any]) => (
                        <div key={k} className="p-2 bg-white rounded border border-[#E2E8E2]">
                          <span className="font-bold text-[#14532D]">{k}</span>: {v.type}{' '}
                          {v.required && <span className="text-red-500 font-bold">*required</span>}
                          <div className="text-[10px] text-[#667066] font-sans mt-0.5">
                            {v.description} {v.example ? `(e.g. ${v.example})` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outputs */}
                  <div className="p-4 bg-[#FAFBF9] rounded-lg border border-[#E2E8E2] space-y-2">
                    <div className="font-bold text-[#172018] uppercase text-[11px]">Output Schema</div>
                    <div className="space-y-1 font-mono text-[11px]">
                      {Object.entries(selectedCap.contract.output).map(([k, v]: [string, any]) => (
                        <div key={k} className="p-1.5 bg-white rounded border border-[#E2E8E2] flex items-center justify-between">
                          <span className="font-bold text-[#172018]">{k}</span>
                          <span className="text-[#667066]">{v.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Permissions and Risk Grid */}
                <div className="p-4 bg-[#FAFBF9] rounded-lg border border-[#E2E8E2] space-y-2">
                  <div className="font-bold text-[#172018] uppercase text-[11px]">Security & Permissions</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 bg-white rounded border border-[#E2E8E2]">
                      <div className="text-[10px] text-[#667066] uppercase">Read Resources</div>
                      <div className="font-mono text-xs font-semibold text-[#16A34A] mt-0.5">
                        {selectedCap.contract.permissions.read.join(', ')}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-[#E2E8E2]">
                      <div className="text-[10px] text-[#667066] uppercase">Write Resources</div>
                      <div className="font-mono text-xs font-semibold text-amber-700 mt-0.5">
                        {selectedCap.contract.permissions.write.join(', ') || 'None (Read-Only)'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-[#E2E8E2]">
                      <div className="text-[10px] text-[#667066] uppercase">Human Approval</div>
                      <div className="font-semibold text-xs text-[#854D0E] mt-0.5">
                        {selectedCap.contract.humanApprovalRequired ? 'REQUIRED' : 'NOT REQUIRED'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Related Endpoints Tab */}
            {activeTab === 'endpoints' && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-[#172018] uppercase tracking-wider">
                  Bound Underlying API Endpoints
                </div>
                <div className="space-y-2">
                  {[
                    { method: 'GET', path: '/orders/{id}', summary: 'Fetch customer order details' },
                    { method: 'GET', path: '/shipping/{orderId}', summary: 'Carrier tracking milestones' },
                    { method: 'GET', path: '/refund-policy', summary: 'Store delay thresholds and rules' },
                    { method: 'POST', path: '/refund', summary: 'Issue customer refund (Gated write)' },
                  ].map((ep, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAFBF9] rounded-md border border-[#E2E8E2] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                            ep.method === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#172018]">
                          {ep.path}
                        </span>
                      </div>
                      <span className="text-xs text-[#667066]">{ep.summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-[#FAFBF9] border-t border-[#E2E8E2] flex items-center justify-between">
            <div className="text-xs text-[#667066] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Evaluated against 9 test scenarios</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('evaluations')}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E2E8E2] rounded-md text-[#172018] hover:bg-[#F7F8F5]"
              >
                Run Evaluation Suite
              </button>
              <button
                onClick={() => onNavigate('agent-console')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22]"
              >
                Test in Agent Console
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON Contract Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E2E8E2] max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#172018]">
                Capability Contract JSON Schema
              </h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-xs font-bold text-[#667066] hover:text-[#172018]"
              >
                ✕ Close
              </button>
            </div>
            <pre className="p-4 bg-stone-900 text-stone-200 rounded-lg text-xs font-mono max-h-96 overflow-y-auto">
              {JSON.stringify(selectedCap.contract, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
