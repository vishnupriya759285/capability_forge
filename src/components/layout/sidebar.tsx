'use client';

import React from 'react';
import {
  LayoutDashboard,
  SearchCode,
  Boxes,
  Server,
  Terminal,
  CheckCircle2,
  Wrench,
  Settings,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'api-analysis'
  | 'capabilities'
  | 'mcp-server'
  | 'agent-console'
  | 'evaluations'
  | 'repair-center'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isEngineConnected?: boolean;
  isCodexConnected?: boolean;
  brokenCount?: number;
  capabilityCount?: number;
  evalSummary?: string;
  hasEvaluationsRun?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isEngineConnected = true,
  isCodexConnected = true,
  brokenCount = 0,
  capabilityCount = 0,
  evalSummary,
  hasEvaluationsRun = false,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'api-analysis' as NavTab, label: 'API Analysis', icon: SearchCode },
    {
      id: 'capabilities' as NavTab,
      label: 'Capabilities',
      icon: Boxes,
      badge: capabilityCount > 0 ? String(capabilityCount) : undefined,
    },
    { id: 'mcp-server' as NavTab, label: 'MCP Server', icon: Server },
    { id: 'agent-console' as NavTab, label: 'Agent Console', icon: Terminal },
    {
      id: 'evaluations' as NavTab,
      label: 'Evaluations',
      icon: CheckCircle2,
      badge: brokenCount > 0 ? '1 Failed' : hasEvaluationsRun && evalSummary ? evalSummary : undefined,
      badgeColor: brokenCount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
    },
    {
      id: 'repair-center' as NavTab,
      label: 'Repair Center',
      icon: Wrench,
      badge: brokenCount > 0 ? 'Action Req' : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8E2] flex flex-col justify-between h-screen sticky top-0 select-none z-20">
      {/* Top Brand */}
      <div>
        <div className="p-5 border-b border-[#E2E8E2] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#DCFCE7]" />
            </div>
            <div>
              <div className="font-bold text-[15px] tracking-tight text-[#172018] leading-tight">
                Capability Forge
              </div>
              <div className="text-[11px] text-[#667066] font-medium">Developer Edition</div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#14532D] text-white shadow-sm'
                    : 'text-[#667066] hover:text-[#172018] hover:bg-[#F7F8F5]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#667066]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-[#F1F3F0] text-[#667066]')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-[#E2E8E2] space-y-2">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#14532D] text-white'
              : 'text-[#667066] hover:text-[#172018] hover:bg-[#F7F8F5]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <div className="bg-[#F7F8F5] p-2.5 rounded-lg border border-[#E2E8E2] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#667066]">Connection status:</span>
            <span className="flex items-center text-[#16A34A] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block mr-1.5 animate-pulse"></span>
              Local Engine
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#667066]">Codex Integration:</span>
            <span className="flex items-center text-[#16A34A] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block mr-1.5"></span>
              Connected
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
