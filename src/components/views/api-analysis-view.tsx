'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  Boxes,
  Globe,
  Layers,
  FileCheck,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { ApiAnalysisResult } from '@/lib/types';
import { NavTab } from '../layout/sidebar';

interface ApiAnalysisViewProps {
  analysisData: ApiAnalysisResult | null;
  onCompile: () => void;
  onNavigate: (tab: NavTab) => void;
  onLoadCustomSpec?: (data: ApiAnalysisResult) => void;
}

export const ApiAnalysisView: React.FC<ApiAnalysisViewProps> = ({
  analysisData,
  onCompile,
  onNavigate,
  onLoadCustomSpec,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFileName, setSelectedFileName] = useState<string>('petstore-api.yaml');
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<ApiAnalysisResult | null>(analysisData);

  const analysisSteps = [
    'Parsing specification',
    'Detecting resources',
    'Mapping relationships',
    'Analyzing operations',
    'Detecting potential workflows',
  ];

  const presets = [
    {
      id: 'petstore',
      name: 'Swagger Petstore 3.0',
      file: 'petstore-api.yaml',
      badge: 'Live Public Sandbox',
      desc: 'Pet inventory, adoptions, and store orders with live servers',
    },
    {
      id: 'github',
      name: 'GitHub Issues API',
      file: 'github-issues-api.yaml',
      badge: 'DevOps REST',
      desc: 'Repo issues, discussion triage, and comments',
    },
    {
      id: 'stripe',
      name: 'Stripe Billing API',
      file: 'stripe-billing-api.yaml',
      badge: 'FinTech Mutations',
      desc: 'Customer accounts, invoices, and charge authorizations',
    },
  ];

  const runAnalysisSteps = (onComplete?: () => void) => {
    setActiveStepIndex(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveStepIndex(step);
      if (step >= analysisSteps.length) {
        clearInterval(interval);
        setAnalyzing(false);
        onComplete?.();
      }
    }, 180);
  };

  const processSpecContent = async (content: string, fileName: string) => {
    setAnalyzing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec: content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse OpenAPI specification.');
      }

      const data: ApiAnalysisResult = await res.json();
      setSelectedFileName(fileName);
      setCurrentResult(data);
      onLoadCustomSpec?.(data);

      runAnalysisSteps(() => {
        setSuccessMessage(`Successfully loaded & analyzed "${fileName}" (${data.endpointCount} endpoints, ${data.resourceCount} resources).`);
      });
    } catch (err: any) {
      setAnalyzing(false);
      setErrorMessage(err.message || 'Error analyzing OpenAPI specification.');
    }
  };

  // 1. File Upload Handler (via Choose File button)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processSpecContent(content, fileName);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsText(file);
    // reset input so same file can be chosen again
    e.target.value = '';
  };

  // 2. Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processSpecContent(content, fileName);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read dropped file.');
    };
    reader.readAsText(file);
  };

  // 3. Remote URL Fetcher
  const handleAnalyzeUrl = async () => {
    if (!remoteUrl.trim()) {
      setErrorMessage('Please enter an OpenAPI URL first.');
      return;
    }
    setAnalyzing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specUrl: remoteUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch specification from URL.');
      }

      const data: ApiAnalysisResult = await res.json();
      const derivedName = remoteUrl.split('/').pop() || 'remote-spec.json';
      setSelectedFileName(derivedName);
      setCurrentResult(data);
      onLoadCustomSpec?.(data);

      runAnalysisSteps(() => {
        setSuccessMessage(`Successfully fetched & parsed specification from ${remoteUrl}`);
      });
    } catch (err: any) {
      setAnalyzing(false);
      setErrorMessage(err.message || 'Failed to fetch from URL.');
    }
  };

  // 4. Preset Loader
  const handleSelectPreset = async (presetId: string, fileName: string) => {
    setAnalyzing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load preset.');
      }

      const data: ApiAnalysisResult = await res.json();
      setSelectedFileName(fileName);
      setCurrentResult(data);
      onLoadCustomSpec?.(data);

      runAnalysisSteps(() => {
        setSuccessMessage(`Loaded ${data.title} (${data.endpointCount} endpoints).`);
      });
    } catch (err: any) {
      setAnalyzing(false);
      setErrorMessage(err.message);
    }
  };

  const displayData = currentResult || analysisData;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".yaml,.yml,.json"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
            API Analysis
          </h1>
          <p className="text-sm text-[#667066] mt-0.5">
            Understand endpoints, resources, dependencies, and permissions before exposing them to an agent.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => runAnalysisSteps()}
            disabled={analyzing}
            className="px-4 py-2 text-xs font-semibold bg-white border border-[#E2E8E2] rounded-md text-[#172018] hover:bg-[#F7F8F5] transition-colors"
          >
            {analyzing ? 'Analyzing Spec...' : 'Re-Analyze API'}
          </button>
          <button
            onClick={onCompile}
            className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Boxes className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Compile Capabilities</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Area & URL Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Drag & Drop / File Selector Box */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8E2] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
            OpenAPI Source File
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer select-none ${
              isDragging
                ? 'border-[#14532D] bg-[#DCFCE7]/30 ring-2 ring-[#14532D]'
                : 'border-[#CBD5CB] bg-[#FAFBF9] hover:bg-[#F7F8F5] hover:border-[#14532D]'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-[#14532D] mx-auto mb-2" />
            <div className="text-xs font-semibold text-[#172018]">
              {isDragging ? 'Drop your OpenAPI file here' : 'Drag & drop OpenAPI file here'}
            </div>
            <div className="text-[11px] text-[#667066] mt-0.5 mb-3">
              or choose a local YAML/JSON file from your computer
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-1.5 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm inline-flex items-center space-x-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Choose file</span>
            </button>
          </div>

          {/* Active File Pill */}
          <div className="pt-2 border-t border-[#E2E8E2] flex items-center justify-between text-xs">
            <span className="text-[#667066]">Selected:</span>
            <span className="font-mono font-bold text-[#14532D] bg-[#DCFCE7] px-2.5 py-1 rounded border border-green-200">
              {selectedFileName}
            </span>
          </div>
        </div>

        {/* Right: URL Input & Specification Presets */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8E2] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
              Or Paste OpenAPI URL
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="https://api.example.com/openapi.yaml"
                className="flex-1 px-3 py-2 text-xs font-mono bg-[#FAFBF9] border border-[#E2E8E2] rounded-md focus:outline-none focus:ring-2 focus:ring-[#14532D] text-[#172018]"
              />
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={analyzing}
                className="px-4 py-2 bg-[#14532D] text-white text-xs font-bold rounded-md hover:bg-[#0f3e22] shadow-sm disabled:opacity-60"
              >
                Analyze URL
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8E2]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
              Quick Sample Presets
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id, p.file)}
                  className={`p-2.5 text-left rounded-md border text-xs transition-all ${
                    selectedFileName === p.file
                      ? 'bg-[#F4F9F4] border-[#14532D] font-bold text-[#14532D] ring-1 ring-[#14532D]'
                      : 'bg-[#FAFBF9] border-[#E2E8E2] text-[#172018] hover:bg-[#F1F3F0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px] truncate">{p.name}</span>
                    <span className="text-[9px] font-mono bg-white px-1 py-0.2 rounded border border-[#E2E8E2]">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#667066] font-normal truncate mt-0.5">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Stepper */}
      <div className="bg-white p-5 rounded-lg border border-[#E2E8E2] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
            Analysis Pipeline: {displayData?.title}
          </div>
          <span className="text-[11px] font-mono text-[#16A34A] font-semibold bg-green-50 px-2.5 py-0.5 rounded border border-green-200">
            OpenAPI {displayData?.version} • {displayData?.endpointCount} endpoints • {displayData?.resourceCount} resources
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {analysisSteps.map((stepName, i) => {
            const isCompleted = activeStepIndex > i;
            const isCurrent = activeStepIndex === i && analyzing;
            return (
              <div
                key={stepName}
                className={`p-3 rounded-md border text-center transition-all ${
                  isCompleted
                    ? 'bg-[#F4F9F4] border-[#16A34A]/30 text-[#14532D]'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                    : 'bg-[#FAFBF9] border-[#E2E8E2] text-[#9AA59A]'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-current text-[10px] flex items-center justify-center font-mono">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold leading-snug">{stepName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">Endpoints</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#172018]">
            {displayData?.endpointCount || 0}
          </div>
          <div className="text-[11px] text-[#667066] mt-0.5">Total registered</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">Resources</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#172018]">
            {displayData?.resourceCount || 0}
          </div>
          <div className="text-[11px] text-[#667066] mt-0.5">Identified entities</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">GET (Read)</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#16A34A]">
            {displayData?.methodCounts.GET || 0}
          </div>
          <div className="text-[11px] text-[#16A34A] mt-0.5">Low risk operations</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">POST (Write)</div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-600">
            {displayData?.methodCounts.POST || 0}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">State mutations</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">DELETE</div>
          <div className="mt-1 text-2xl font-bold font-mono text-red-600">
            {displayData?.methodCounts.DELETE || 0}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">Destructive action</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">Relationships</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#14532D]">
            {displayData?.relationships.length || 0}
          </div>
          <div className="text-[11px] text-[#14532D] mt-0.5">Detected joins</div>
        </div>
      </div>

      {/* Discovered Relationships & Graph */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relationships List */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E8E2] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
              Detected Relationships
            </div>
            <span className="text-xs font-mono text-[#14532D] bg-[#DCFCE7] px-2 py-0.5 rounded">
              {displayData?.relationships.length || 0} Inferred Joins
            </span>
          </div>

          <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
            {displayData?.relationships.map((rel, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#F7F8F5] rounded-md border border-[#E2E8E2] flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#172018]">
                    <span>{rel.fromResource}</span>
                    <ArrowRight className="w-3 h-3 text-[#667066]" />
                    <span>{rel.toResource}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#667066]">{rel.fromProperty}</div>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E2E8E2] text-[#667066]">
                  {rel.relationType}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Entity Topology */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E8E2] shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
                Entity Relationship Topology
              </div>
              <span className="text-xs text-[#667066]">Algorithmic Discovery</span>
            </div>

            <div className="bg-[#FAFBF9] rounded-lg border border-[#E2E8E2] p-4 flex items-center justify-center relative min-h-[220px]">
              <svg className="w-full h-48" viewBox="0 0 400 200">
                <line x1="200" y1="100" x2="80" y2="50" stroke="#CBD5CB" strokeWidth="2" />
                <line x1="200" y1="100" x2="80" y2="150" stroke="#CBD5CB" strokeWidth="2" />
                <line x1="200" y1="100" x2="320" y2="50" stroke="#CBD5CB" strokeWidth="2" />
                <line x1="200" y1="100" x2="320" y2="150" stroke="#16A34A" strokeWidth="2" strokeDasharray="4" />
                <line x1="80" y1="50" x2="80" y2="150" stroke="#E2E8E2" strokeWidth="1" />

                <g transform="translate(150, 80)">
                  <rect width="100" height="40" rx="6" fill="#14532D" />
                  <text x="50" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
                    {displayData?.resources[0]?.name || 'Primary'}
                  </text>
                </g>

                <g transform="translate(30, 30)">
                  <rect width="90" height="35" rx="6" fill="#FFFFFF" stroke="#CBD5CB" strokeWidth="1.5" />
                  <text x="45" y="22" fill="#172018" fontSize="11" fontWeight="600" textAnchor="middle">
                    {displayData?.resources[1]?.name || 'Entity A'}
                  </text>
                </g>

                <g transform="translate(30, 135)">
                  <rect width="90" height="35" rx="6" fill="#FFFFFF" stroke="#CBD5CB" strokeWidth="1.5" />
                  <text x="45" y="22" fill="#172018" fontSize="11" fontWeight="600" textAnchor="middle">
                    {displayData?.resources[2]?.name || 'Entity B'}
                  </text>
                </g>

                <g transform="translate(270, 30)">
                  <rect width="100" height="35" rx="6" fill="#FFFFFF" stroke="#CBD5CB" strokeWidth="1.5" />
                  <text x="50" y="22" fill="#172018" fontSize="11" fontWeight="600" textAnchor="middle">
                    {displayData?.resources[3]?.name || 'Entity C'}
                  </text>
                </g>

                <g transform="translate(270, 135)">
                  <rect width="100" height="35" rx="6" fill="#FEF9C3" stroke="#FACC15" strokeWidth="2" />
                  <text x="50" y="22" fill="#854D0E" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {displayData?.resources[4]?.name || 'Mutation'} ⚠
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="text-[11px] text-[#667066] flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#14532D]"></span>
              <span>Primary Resource</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FEF9C3] border border-[#FACC15]"></span>
              <span>Guarded Mutation</span>
            </span>
          </div>
        </div>
      </div>

      {/* Potential Capabilities Table */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8E2] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172018]">
              Potential Capabilities
            </h2>
            <p className="text-xs text-[#667066]">
              Synthesized by the Capability Compiler from detected endpoint relationships.
            </p>
          </div>
          <button
            onClick={onCompile}
            className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5 self-start"
          >
            <Boxes className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Compile Capabilities</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8E2] text-[#667066] font-semibold bg-[#FAFBF9]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Endpoints</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E2]">
              {displayData?.potentialCapabilities.map((cap) => (
                <tr key={cap.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#172018]">
                    <div className="font-mono text-[13px] text-[#14532D]">{cap.id}</div>
                    <div className="text-[11px] text-[#667066] font-normal">{cap.name}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">{cap.endpointCount} endpoints</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cap.risk === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : cap.risk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {cap.risk}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#667066]">{cap.confidence}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-medium text-[#16A34A] text-xs">● Ready</span>
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
