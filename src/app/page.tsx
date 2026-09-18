'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from '../components/layout/sidebar';
import { Header } from '../components/layout/header';
import { OverviewView } from '../components/views/overview-view';
import { ApiAnalysisView } from '../components/views/api-analysis-view';
import { CapabilitiesView } from '../components/views/capabilities-view';
import { McpServerView } from '../components/views/mcp-server-view';
import { AgentConsoleView } from '../components/views/agent-console-view';
import { EvaluationsView } from '../components/views/evaluations-view';
import { RepairCenterView } from '../components/views/repair-center-view';
import { SettingsView } from '../components/views/settings-view';
import { ApiAnalysisResult, Capability, EvaluationReport } from '../lib/types';
import { CapabilityCompiler } from '../lib/engine/capability-compiler';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isBroken, setIsBroken] = useState(false);
  const [selectedCapabilityId, setSelectedCapabilityId] = useState('');
  const [currentProjectName, setCurrentProjectName] = useState('OpenAPI Specification');

  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [analysisData, setAnalysisData] = useState<ApiAnalysisResult | null>(null);
  const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>(null);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // 1. Fetch analysis data
      const analysisRes = await fetch('/api/analyze');
      if (analysisRes.ok) {
        const analysis = await analysisRes.json();
        setAnalysisData(analysis);
        if (analysis.title) {
          setCurrentProjectName(analysis.title);
        }
      }

      // 2. Load compiled capabilities
      const caps = CapabilityCompiler.listCompiledCapabilities();
      setCapabilities(caps);
      if (caps.length > 0) {
        setSelectedCapabilityId(caps[0].id);
      }

      // 3. Fetch current evaluation report
      const evalRes = await fetch('/api/evaluations');
      if (evalRes.ok) {
        const report = await evalRes.json();
        setEvaluationReport(report);
      }

      // 4. Fetch chaos state
      const chaosRes = await fetch('/api/chaos');
      if (chaosRes.ok) {
        const chaos = await chaosRes.json();
        setIsBroken(chaos.isBroken);
      }
    } catch (e) {
      console.error('Failed to load initial platform data:', e);
    }
  };

  const handleToggleChaos = async () => {
    try {
      const nextAction = isBroken ? 'repair' : 'break';
      const res = await fetch('/api/chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction }),
      });
      const data = await res.json();
      setIsBroken(data.state.isBroken);

      // Re-run evaluations to refresh test assertions immediately
      const evalRes = await fetch('/api/evaluations', { method: 'POST' });
      const report = await evalRes.json();
      setEvaluationReport(report);
    } catch (e) {
      console.error('Error toggling chaos state:', e);
    }
  };

  const handleRunEvaluations = async () => {
    try {
      const res = await fetch('/api/evaluations', { method: 'POST' });
      const report = await res.json();
      setEvaluationReport(report);
    } catch (e) {
      console.error('Error running evaluations:', e);
    }
  };

  const handleRepairComplete = async () => {
    setIsBroken(false);
    await handleRunEvaluations();
  };

  const handleLaunchDemo = async () => {
    // 1. Make sure clean initial state
    await fetch('/api/chaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'repair' }),
    });
    setIsBroken(false);

    // 2. Re-evaluate
    await handleRunEvaluations();

    // 3. Navigate straight to Agent Console for instant demonstration
    setActiveTab('agent-console');
  };

  const handleResetAll = async () => {
    await fetch('/api/chaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'repair' }),
    });
    await loadInitialData();
    setActiveTab('overview');
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8F5]">
      {/* Persistent Developer Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isEngineConnected={true}
        isCodexConnected={true}
        brokenCount={isBroken ? 1 : 0}
      />

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onLaunchDemo={handleLaunchDemo}
          isBroken={isBroken}
          onToggleChaos={handleToggleChaos}
          currentProject={currentProjectName}
        />

        <main className="flex-1 pb-16">
          {activeTab === 'overview' && (
            <OverviewView
              onNavigate={setActiveTab}
              onLaunchDemo={handleLaunchDemo}
              isBroken={isBroken}
              analysisData={analysisData}
              capabilities={capabilities}
            />
          )}

          {activeTab === 'api-analysis' && (
            <ApiAnalysisView
              analysisData={analysisData}
              onCompile={() => setActiveTab('capabilities')}
              onNavigate={setActiveTab}
              onLoadCustomSpec={(data) => {
                setAnalysisData(data);
                if (data.title) setCurrentProjectName(data.title);
                setCapabilities(CapabilityCompiler.listCompiledCapabilities());
              }}
            />
          )}

          {activeTab === 'capabilities' && (
            <CapabilitiesView
              capabilities={capabilities}
              selectedCapabilityId={selectedCapabilityId}
              onSelectCapability={setSelectedCapabilityId}
              onNavigate={setActiveTab}
              isBroken={isBroken}
            />
          )}

          {activeTab === 'mcp-server' && (
            <McpServerView onNavigate={setActiveTab} />
          )}

          {activeTab === 'agent-console' && (
            <AgentConsoleView
              onNavigate={setActiveTab}
              isBroken={isBroken}
              capabilities={capabilities}
            />
          )}

          {activeTab === 'evaluations' && (
            <EvaluationsView
              evaluationReport={evaluationReport}
              onRunEvaluations={handleRunEvaluations}
              isBroken={isBroken}
              onToggleChaos={handleToggleChaos}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'repair-center' && (
            <RepairCenterView
              isBroken={isBroken}
              onRepairComplete={handleRepairComplete}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView onResetAll={handleResetAll} onNavigate={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
}
