'use client';

import React from 'react';
import {
  FileCode2,
  Search,
  Boxes,
  Server,
  CheckCircle2,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Zap,
  FolderOpen,
} from 'lucide-react';
import { NavTab } from '../layout/sidebar';
import { ApiAnalysisResult, Capability } from '@/lib/types';

interface OverviewViewProps {
  onNavigate: (tab: NavTab) => void;
  onLaunchDemo: () => void;
  isBroken: boolean;
  analysisData?: ApiAnalysisResult | null;
  capabilities?: Capability[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onLaunchDemo,
  isBroken,
  analysisData,
  capabilities = [],
}) => {
  const pipelineSteps = [
    { label: 'API Import', desc: 'Ingest any OpenAPI 3.x spec', icon: FileCode2 },
    { label: 'Understand', desc: 'Detect resources & relations', icon: Search },
    { label: 'Compile', desc: 'Synthesize capability graphs', icon: Boxes },
    { label: 'MCP Expose', desc: 'Register real tools via MCP', icon: Server },
    { label: 'Evaluate', desc: 'Run automated assertions', icon: CheckCircle2 },
    { label: 'Repair', desc: 'Codex-assisted auto-fix', icon: Wrench },
    { label: 'Verify', desc: 'Certified safe for agents', icon: ShieldCheck },
  ];

  const totalEndpoints = analysisData?.endpointCount ?? capabilities.reduce((acc, c) => acc + c.endpoints.length, 0);
  const totalResources = analysisData?.resourceCount ?? 3;
  const totalCapabilities = capabilities.length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
              Capability Forge
            </h1>
            <span className="text-xs bg-[#DCFCE7] text-[#14532D] font-bold px-2 py-0.5 rounded-full border border-green-200">
              Universal OpenAPI Platform
            </span>
          </div>
          <p className="text-sm text-[#667066]">
            Compile any REST API into reliable, safe, and evaluated capabilities for AI agents.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('api-analysis')}
            className="px-4 py-2 text-xs font-bold bg-white border border-[#E2E8E2] rounded-md text-[#172018] hover:bg-[#F7F8F5] shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#14532D]" />
            <span>Import OpenAPI Spec</span>
          </button>
          <button
            onClick={() => onNavigate('agent-console')}
            className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-[#DCFCE7]" />
            <span>Run in Agent Console</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase tracking-wider">Active API</div>
          <div className="mt-1 text-sm font-bold text-[#172018] truncate">
            {analysisData?.title || 'OpenAPI Specification'}
          </div>
          <div className="text-[11px] text-[#667066] mt-0.5 font-mono">v{analysisData?.version || '1.0.0'}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase tracking-wider">Endpoints</div>
          <div className="mt-1 text-2xl font-bold text-[#172018] font-mono">{totalEndpoints}</div>
          <div className="text-[11px] text-[#667066] mt-0.5">{totalResources} resources identified</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase tracking-wider">Capabilities</div>
          <div className="mt-1 text-2xl font-bold text-[#172018] font-mono">{totalCapabilities}</div>
          <div className="text-[11px] text-[#667066] mt-0.5">Synthesized workflows</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase tracking-wider">Verified</div>
          <div className="mt-1 text-2xl font-bold text-[#16A34A] font-mono">
            {isBroken ? totalCapabilities - 1 : totalCapabilities}
          </div>
          <div className="text-[11px] text-[#16A34A] mt-0.5">Passing security gates</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase tracking-wider">Status</div>
          <div
            className={`mt-1 text-2xl font-bold font-mono ${
              isBroken ? 'text-red-600' : 'text-[#16A34A]'
            }`}
          >
            {isBroken ? 'FAIL' : 'READY'}
          </div>
          <div className="text-[11px] text-[#667066] mt-0.5">
            {isBroken ? 'Action required in Repair Center' : 'Clean evaluation state'}
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8E2] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172018] uppercase tracking-wider">
              The Capability Lifecycle Pipeline
            </h2>
            <p className="text-xs text-[#667066] mt-0.5">
              Deterministic transformation: raw endpoints become validated, guarded agent capabilities.
            </p>
          </div>
          <span className="text-xs font-mono bg-[#F7F8F5] text-[#667066] px-2 py-1 rounded border border-[#E2E8E2]">
            Universal Pipeline Engine
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 pt-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="relative bg-[#F7F8F5] p-3 rounded-lg border border-[#E2E8E2] flex flex-col items-center text-center group hover:border-[#14532D] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8E2] flex items-center justify-center text-[#14532D] shadow-sm mb-2 group-hover:bg-[#DCFCE7] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#172018]">{step.label}</div>
                <div className="text-[11px] text-[#667066] mt-1 leading-tight">{step.desc}</div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-3 h-3 text-[#CBD5CB]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compiled Capabilities Section */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8E2] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172018]">
              Compiled Capabilities for {analysisData?.title || 'Current Specification'}
            </h2>
            <p className="text-xs text-[#667066] mt-0.5">
              Task-oriented tools ready to expose to Claude Desktop, Cursor, or autonomous agents.
            </p>
          </div>
          <button
            onClick={() => onNavigate('capabilities')}
            className="text-xs font-semibold text-[#14532D] hover:underline flex items-center space-x-1"
          >
            <span>View All ({capabilities.length})</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {capabilities.slice(0, 6).map((cap) => (
            <div
              key={cap.id}
              onClick={() => onNavigate('capabilities')}
              className="p-4 bg-[#FAFBF9] hover:bg-[#F4F9F4] rounded-lg border border-[#E2E8E2] cursor-pointer transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#14532D] truncate">
                    {cap.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      cap.risk === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : cap.risk === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {cap.risk} Risk
                  </span>
                </div>
                <p className="text-xs text-[#667066] line-clamp-2">
                  {cap.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E2E8E2] flex items-center justify-between text-[11px] text-[#667066]">
                <span className="font-mono">{cap.endpoints.length} endpoints</span>
                <span className="text-[#16A34A] font-semibold">● Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
