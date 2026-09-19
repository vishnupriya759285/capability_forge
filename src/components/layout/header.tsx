'use client';

import React from 'react';
import { Play, Plus, Terminal } from 'lucide-react';

interface HeaderProps {
  onImportApi?: () => void;
  onRunConsole?: () => void;
  isBroken?: boolean;
  currentProject?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onImportApi,
  onRunConsole,
  isBroken = false,
  currentProject = 'No API Connected',
}) => {
  const isNoApi = !currentProject || currentProject === 'No API Connected';

  return (
    <header className="h-14 bg-white border-b border-[#E2E8E2] px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Project info */}
      <div className="flex items-center space-x-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#667066]">
          Project:
        </div>
        <div className="flex items-center space-x-2 bg-[#F7F8F5] border border-[#E2E8E2] px-2.5 py-1 rounded-md text-xs font-medium text-[#172018]">
          <span className={isNoApi ? 'text-[#667066] font-medium' : 'font-semibold text-[#172018]'}>
            {currentProject}
          </span>
          {isNoApi ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
              ● Standby
            </span>
          ) : isBroken ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
              ● Security Alert
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#14532D] border border-green-200">
              ● Live API
            </span>
          )}
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onImportApi}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-[#E2E8E2] bg-white text-[#172018] hover:bg-[#F7F8F5] active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#14532D]" />
          <span>Import API</span>
        </button>

        <button
          onClick={onRunConsole}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#14532D] text-white hover:bg-[#0f3e22] shadow-sm transition-all"
        >
          <Terminal className="w-3.5 h-3.5 text-[#DCFCE7]" />
          <span>Agent Console</span>
        </button>
      </div>
    </header>
  );
};
