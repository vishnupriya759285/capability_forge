'use client';

import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onLaunchDemo: () => void;
  isBroken: boolean;
  onToggleChaos: () => void;
  currentProject?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLaunchDemo,
  isBroken,
  onToggleChaos,
  currentProject = 'OpenAPI Specification',
}) => {
  return (
    <header className="h-14 bg-white border-b border-[#E2E8E2] px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Project info */}
      <div className="flex items-center space-x-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#667066]">
          Project:
        </div>
        <div className="flex items-center space-x-2 bg-[#F7F8F5] border border-[#E2E8E2] px-2.5 py-1 rounded-md text-xs font-medium text-[#172018]">
          <span className="font-semibold">{currentProject}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              isBroken ? 'bg-red-100 text-red-700' : 'bg-[#DCFCE7] text-[#14532D]'
            }`}
          >
            {isBroken ? '● Broken (Chaos Mode)' : '● Verified'}
          </span>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center space-x-3">
        {/* Chaos Mode Toggle */}
        <button
          onClick={onToggleChaos}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            isBroken
              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              : 'bg-white border-[#E2E8E2] text-[#667066] hover:text-[#172018] hover:bg-[#F7F8F5]'
          }`}
          title="Chaos Mode: injects intentional approval guard bypass for evaluation testing"
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${isBroken ? 'text-red-600' : 'text-amber-500'}`} />
          <span>{isBroken ? 'Chaos Injected (Broken)' : 'Inject Chaos Bug'}</span>
        </button>

        {/* Console CTA */}
        <button
          onClick={onLaunchDemo}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#14532D] text-white hover:bg-[#0f3e22] shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#DCFCE7]" />
          <span>Test in Console</span>
        </button>
      </div>
    </header>
  );
};
