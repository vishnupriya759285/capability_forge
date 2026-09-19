'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Copy,
  Check,
  Play,
  FileCode,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { McpToolDefinition } from '@/lib/types';
import { NavTab } from '../layout/sidebar';

interface McpServerViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const McpServerView: React.FC<McpServerViewProps> = ({ onNavigate }) => {
  const [tools, setTools] = useState<McpToolDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/mcp/tools');
      if (res.ok) {
        const data = await res.json();
        const loadedTools: McpToolDefinition[] = data.tools || [];
        setTools(loadedTools);
        if (loadedTools.length > 0 && !selectedTool) {
          selectTool(loadedTools[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load MCP tools:', e);
    }
  };

  const selectTool = (tool: McpToolDefinition) => {
    setSelectedTool(tool.name);
    const initialArgs: Record<string, any> = {};
    if (tool.inputSchema?.properties) {
      for (const [propName, propVal] of Object.entries(tool.inputSchema.properties)) {
        initialArgs[propName] = (propVal as any).example !== undefined ? (propVal as any).example : '';
      }
    }
    setToolArgs(JSON.stringify(initialArgs, null, 2));
    setTestResult(null);
  };

  const currentTool = tools.find((t) => t.name === selectedTool) || tools[0];

  const handleCopySchema = () => {
    if (!currentTool) return;
    navigator.clipboard.writeText(JSON.stringify(currentTool, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestTool = async () => {
    if (!currentTool) return;
    setTesting(true);
    setTestResult(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgs);
    } catch {
      alert('Invalid JSON arguments. Please check your syntax.');
      setTesting(false);
      return;
    }

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: currentTool.name,
          arguments: parsedArgs,
          isHumanApproved: false,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
              MCP Server
            </h1>
            <span className="text-xs font-mono font-bold bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded-full border border-green-200">
              ● Active ({tools.length} Tools Registered)
            </span>
          </div>
          <p className="text-sm text-[#667066] mt-0.5">
            Model Context Protocol endpoint exposing dynamic capabilities directly to Claude Desktop, Cursor, or AI agents.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('agent-console')}
            className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm flex items-center space-x-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-[#DCFCE7]" />
            <span>Open in Agent Console</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">MCP Protocol Status</div>
          <div className="mt-1 text-xl font-bold font-mono text-[#16A34A] flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block mr-2 animate-pulse"></span>
            RUNNING
          </div>
          <div className="text-[11px] text-[#667066] mt-0.5">JSON-RPC 2.0 / HTTP & Stdio</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">Active Tools</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#172018]">{tools.length}</div>
          <div className="text-[11px] text-[#667066] mt-0.5">Dynamically compiled from spec</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">Execution Mode</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#14532D]">Live HTTP</div>
          <div className="text-[11px] text-[#667066] mt-0.5">Direct target dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E8E2] shadow-sm">
          <div className="text-xs font-medium text-[#667066] uppercase">Transport Mode</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#14532D]">Stdio & Web</div>
          <div className="text-[11px] text-[#667066] mt-0.5">Cursor & Claude Desktop ready</div>
        </div>
      </div>

      {/* 2-Column Tool Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tools Table */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#667066]">
            Registered MCP Tools
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {tools.map((tool) => {
              const isSelected = tool.name === selectedTool;
              return (
                <div
                  key={tool.name}
                  onClick={() => selectTool(tool)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FAFBF9] border-[#14532D] ring-1 ring-[#14532D]'
                      : 'bg-white border-[#E2E8E2] hover:border-[#CBD5CB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#14532D]">
                      {tool.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        tool.risk === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : tool.risk === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {tool.risk} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667066] mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2E8E2] text-[10px] text-[#667066]">
                    <span>Inputs: {Object.keys(tool.inputSchema?.properties || {}).length} params</span>
                    <span className="text-[#16A34A] font-semibold">● Ready</span>
                  </div>
                </div>
              );
            })}

            {tools.length === 0 && (
              <div className="p-6 text-center text-xs text-[#667066] italic">
                No tools registered. Import an OpenAPI specification in API Analysis to publish tools.
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Tool Schema & Test Console */}
        {currentTool && (
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8E2] pb-3">
                <div>
                  <div className="text-xs text-[#667066] font-medium">Selected Tool Definition</div>
                  <div className="font-mono text-base font-bold text-[#172018]">
                    {currentTool.name}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopySchema}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#F7F8F5] border border-[#E2E8E2] rounded-md text-[#172018] hover:bg-[#F1F3F0] flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#667066]" />
                        <span>Copy Schema</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleTestTool}
                    disabled={testing}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#DCFCE7]" />
                    <span>{testing ? 'Testing...' : 'Test Tool'}</span>
                  </button>
                </div>
              </div>

              {/* Arguments JSON Input */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#172018] uppercase">Test Invocation Arguments (JSON)</div>
                <textarea
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 font-mono text-xs bg-[#FAFBF9] border border-[#E2E8E2] rounded-md text-[#172018] focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                />
              </div>

              {/* Input Schema */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#172018] uppercase">Input Schema (JSON Schema)</div>
                <pre className="p-3 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-mono text-[11px] text-[#172018] overflow-x-auto max-h-40">
                  {JSON.stringify(currentTool.inputSchema, null, 2)}
                </pre>
              </div>

              {/* Output Schema */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#172018] uppercase">Output Schema (JSON Schema)</div>
                <pre className="p-3 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-mono text-[11px] text-[#172018] overflow-x-auto max-h-36">
                  {JSON.stringify(currentTool.outputSchema, null, 2)}
                </pre>
              </div>

              {/* Test Tool Live Response */}
              {testResult && (
                <div className="space-y-1 pt-2 border-t border-[#E2E8E2]">
                  <div className="text-xs font-bold text-[#16A34A] uppercase flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Live MCP Tool Invocation Result</span>
                  </div>
                  <pre className="p-3 bg-stone-900 text-stone-200 rounded-md font-mono text-[11px] max-h-48 overflow-y-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {!currentTool && (
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-12 text-center space-y-3 flex flex-col items-center justify-center min-h-[360px]">
            <Server className="w-10 h-10 text-[#667066] opacity-40" />
            <div className="text-sm font-bold text-[#172018]">No Tool Selected</div>
            <p className="text-xs text-[#667066] max-w-sm">
              Connect your OpenAPI specification to synthesize capabilities and expose them as Model Context Protocol tools.
            </p>
            <button
              onClick={() => onNavigate('api-analysis')}
              className="px-4 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm"
            >
              Import API Specification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
