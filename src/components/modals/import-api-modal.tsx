'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Globe,
  FileCode2,
  FolderOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { ApiAnalysisResult, Capability } from '@/lib/types';

interface ImportApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (analysis: ApiAnalysisResult, capabilities: Capability[]) => void;
}

export const ImportApiModal: React.FC<ImportApiModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileContent('');
      setRemoteUrl('');
      setRawText('');
      setIsLoading(false);
      setLoadingStep('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsText(selected);
  };

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

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    setFile(dropped);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read dropped file.');
    };
    reader.readAsText(dropped);
  };

  const executeImport = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      let analyzeBody: any = {};

      if (activeTab === 'upload') {
        if (!fileContent.trim()) {
          throw new Error('Please select an OpenAPI JSON or YAML file first.');
        }
        analyzeBody = { spec: fileContent };
      } else if (activeTab === 'url') {
        if (!remoteUrl.trim()) {
          throw new Error('Please enter a public OpenAPI / Swagger specification URL.');
        }
        analyzeBody = { specUrl: remoteUrl.trim() };
      } else {
        if (!rawText.trim()) {
          throw new Error('Please paste your OpenAPI YAML or JSON specification content.');
        }
        analyzeBody = { spec: rawText };
      }

      setLoadingStep('Parsing OpenAPI specification & schema...');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyzeBody),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze OpenAPI specification.');
      }

      const analysisData: ApiAnalysisResult = await analyzeRes.json();

      setLoadingStep('Synthesizing task-level capabilities...');
      const compileRes = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      let capabilities: Capability[] = [];
      if (compileRes.ok) {
        const cdata = await compileRes.json();
        capabilities = Array.isArray(cdata) ? cdata : cdata.capabilities || [];
      }

      setLoadingStep('Finalizing integration...');
      setTimeout(() => {
        setIsLoading(false);
        onImportComplete(analysisData, capabilities);
        onClose();
      }, 300);
    } catch (err: any) {
      setIsLoading(false);
      setLoadingStep('');
      setErrorMessage(err.message || 'Error importing specification.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-[#E2E8E2] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E2] bg-[#FAFBF9]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#14532D] flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172018]">Import API Specification</h2>
              <p className="text-xs text-[#667066]">
                Load your OpenAPI 3.x or Swagger 2.0 contract to synthesize MCP capabilities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#667066] hover:text-[#172018] p-1 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2E8E2] px-6 bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`flex items-center space-x-2 py-3 px-3 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'border-[#14532D] text-[#14532D]'
                : 'border-transparent text-[#667066] hover:text-[#172018]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setErrorMessage(null);
            }}
            className={`flex items-center space-x-2 py-3 px-3 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'border-[#14532D] text-[#14532D]'
                : 'border-transparent text-[#667066] hover:text-[#172018]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Fetch from URL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`flex items-center space-x-2 py-3 px-3 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'border-[#14532D] text-[#14532D]'
                : 'border-transparent text-[#667066] hover:text-[#172018]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Paste YAML / JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".yaml,.yml,.json"
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer select-none ${
                  isDragging
                    ? 'border-[#14532D] bg-[#DCFCE7]/30 ring-2 ring-[#14532D]'
                    : 'border-[#CBD5CB] bg-[#FAFBF9] hover:bg-[#F7F8F5] hover:border-[#14532D]'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-[#14532D] mx-auto mb-2" />
                <div className="text-sm font-semibold text-[#172018]">
                  {isDragging ? 'Drop specification here' : 'Drag & drop your OpenAPI file here'}
                </div>
                <div className="text-xs text-[#667066] mt-1 mb-4">
                  Supports OpenAPI 3.0, 3.1, or Swagger 2.0 (.json, .yaml, .yml)
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm inline-flex items-center space-x-1.5 transition-all"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Browse File</span>
                </button>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-[#FAFBF9] border border-[#E2E8E2] rounded-lg text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14532D]" />
                    <span className="font-mono font-bold text-[#172018]">{file.name}</span>
                    <span className="text-[#667066]">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileContent('');
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REMOTE URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172018] mb-1.5">
                  Public OpenAPI / Swagger Endpoint URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#667066] absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="https://petstore.swagger.io/v2/swagger.json"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-[#E2E8E2] rounded-md focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2 text-[11px] text-[#667066]">
                  <span>Quick try:</span>
                  <button
                    type="button"
                    onClick={() => setRemoteUrl('https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.json')}
                    className="px-2 py-0.5 rounded bg-[#FAFBF9] border border-[#E2E8E2] hover:bg-[#DCFCE7] hover:text-[#14532D] hover:border-green-300 font-mono text-[10px] transition-colors"
                  >
                    OpenAI API (JSON)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoteUrl('https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml')}
                    className="px-2 py-0.5 rounded bg-[#FAFBF9] border border-[#E2E8E2] hover:bg-[#DCFCE7] hover:text-[#14532D] hover:border-green-300 font-mono text-[10px] transition-colors"
                  >
                    OpenAI API (YAML)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoteUrl('https://petstore.swagger.io/v2/swagger.json')}
                    className="px-2 py-0.5 rounded bg-[#FAFBF9] border border-[#E2E8E2] hover:bg-[#DCFCE7] hover:text-[#14532D] hover:border-green-300 font-mono text-[10px] transition-colors"
                  >
                    Petstore
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#FAFBF9] border border-[#E2E8E2] rounded-lg text-xs text-[#667066] space-y-1.5">
                <div className="font-semibold text-[#172018]">Live Spec URL Format:</div>
                <p>
                  Ensure the URL is publicly reachable and returns a valid JSON or YAML OpenAPI specification with appropriate CORS headers.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE RAW CONTENT */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#172018]">Specification Content (YAML or JSON)</label>
                <span className="text-[#667066] font-mono">{rawText.length} characters</span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="openapi: 3.0.0&#10;info:&#10;  title: My Service API&#10;  version: 1.0.0&#10;paths:&#10;  /orders:&#10;    post: ..."
                rows={10}
                className="w-full p-3 font-mono text-xs bg-white border border-[#E2E8E2] rounded-md focus:outline-none focus:ring-1 focus:ring-[#14532D] resize-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8E2] bg-[#FAFBF9]">
          <div className="text-xs text-[#667066]">
            {isLoading && (
              <div className="flex items-center space-x-2 text-[#14532D] font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingStep}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-[#667066] hover:text-[#172018] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={executeImport}
              disabled={
                isLoading ||
                (activeTab === 'upload' && !fileContent) ||
                (activeTab === 'url' && !remoteUrl.trim()) ||
                (activeTab === 'paste' && !rawText.trim())
              }
              className="px-5 py-2 text-xs font-bold bg-[#14532D] text-white rounded-md hover:bg-[#0f3e22] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Boxes className="w-3.5 h-3.5 text-[#DCFCE7]" />
                  <span>Analyze & Synthesize</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
