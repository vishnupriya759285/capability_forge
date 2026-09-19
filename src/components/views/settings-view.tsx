'use client';

import React, { useState } from 'react';
import {
  Settings,
  Server,
  Cpu,
  RotateCcw,
  Check,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { NavTab } from '../layout/sidebar';

interface SettingsViewProps {
  onResetAll: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetAll,
  onNavigate,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#E2E8E2] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#172018]">
          Platform Settings
        </h1>
        <p className="text-sm text-[#667066] mt-0.5">
          Configure live engine transports, OpenAPI base URLs, and Codex integration keys.
        </p>
      </div>

      <div className="space-y-6">
        {/* Live Execution Gateway */}
        <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E2] pb-3">
            <Server className="w-4 h-4 text-[#14532D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172018]">
              Live HTTP Execution Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#667066] font-medium">HTTP Agent Dispatch</label>
              <input
                type="text"
                readOnly
                value="Direct Live HTTP fetch() with Header Propagation"
                className="mt-1 w-full px-3 py-2 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-mono text-[#172018]"
              />
            </div>

            <div>
              <label className="text-[#667066] font-medium">Capability Store</label>
              <input
                type="text"
                readOnly
                value="Centralized Dynamic Memory Store (Spec-driven)"
                className="mt-1 w-full px-3 py-2 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-sans text-[#172018]"
              />
            </div>
          </div>
        </div>

        {/* MCP Transport Config */}
        <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E2] pb-3">
            <Cpu className="w-4 h-4 text-[#14532D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172018]">
              MCP Server Transports
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#667066] font-medium">Stdio Server Command</label>
              <input
                type="text"
                readOnly
                value="node src/scripts/mcp-stdio-server.mjs"
                className="mt-1 w-full px-3 py-2 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-mono text-[#172018]"
              />
            </div>

            <div>
              <label className="text-[#667066] font-medium">HTTP JSON-RPC Endpoint</label>
              <input
                type="text"
                readOnly
                value="http://localhost:3000/api/mcp/call"
                className="mt-1 w-full px-3 py-2 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-mono text-[#172018]"
              />
            </div>
          </div>
        </div>

        {/* Codex Integration Config */}
        <div className="bg-white rounded-lg border border-[#E2E8E2] shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E2E8E2] pb-3">
            <Shield className="w-4 h-4 text-[#14532D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172018]">
              Codex Repair Integration
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#667066] font-medium">Codex Local Agent Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key (optional)"
                className="mt-1 w-full px-3 py-2 bg-[#FAFBF9] border border-[#E2E8E2] rounded-md font-mono text-[#172018]"
              />
              <div className="text-[11px] text-[#667066] mt-1">
                Automated diagnostics and patch synthesis are available out of the box with the local engine.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] flex items-center space-x-1.5"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saved ? 'Saved Configuration' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Reset Card */}
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Reset Platform State</h3>
            <p className="text-xs text-[#667066] mt-0.5">
              Clears chaos bugs, resets active capabilities to verified baseline, and flushes runtime logs.
            </p>
          </div>

          <button
            onClick={onResetAll}
            className="px-4 py-2 text-xs font-bold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-md flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
