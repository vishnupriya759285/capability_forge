import { NextRequest, NextResponse } from 'next/server';
import { OpenApiAnalyzer } from '@/lib/engine/openapi-analyzer';
import { capabilityStore } from '@/lib/engine/capability-store';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    let specContent = '';
    let preset = '';
    let specUrl = '';
    let targetBaseUrl = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      specContent = body.spec || '';
      preset = body.preset || '';
      specUrl = body.specUrl || '';
      targetBaseUrl = body.targetBaseUrl || '';
    } else {
      specContent = await request.text();
    }

    // 1. If remote URL requested, fetch it
    if (specUrl && specUrl.startsWith('http')) {
      const fetchRes = await fetch(specUrl);
      if (!fetchRes.ok) {
        throw new Error(`Failed to fetch OpenAPI spec from ${specUrl}: ${fetchRes.statusText}`);
      }
      specContent = await fetchRes.text();
    }

    // 2. If real-world standard preset requested
    if (!specContent.trim() && preset) {
      let specFileName = path.join('specs', 'petstore-api.yaml');
      if (preset === 'github') specFileName = path.join('specs', 'github-issues-api.yaml');
      else if (preset === 'stripe') specFileName = path.join('specs', 'stripe-billing-api.yaml');
      else if (preset === 'petstore') specFileName = path.join('specs', 'petstore-api.yaml');

      const presetPath = path.join(process.cwd(), 'src', 'data', specFileName);
      if (fs.existsSync(presetPath)) {
        specContent = fs.readFileSync(presetPath, 'utf-8');
      }
    }

    // 3. Fallback: Default to standard Petstore 3.0 sandbox
    if (!specContent.trim()) {
      const defaultSpecPath = path.join(process.cwd(), 'src', 'data', 'specs', 'petstore-api.yaml');
      if (fs.existsSync(defaultSpecPath)) {
        specContent = fs.readFileSync(defaultSpecPath, 'utf-8');
      }
    }

    if (!specContent.trim()) {
      throw new Error('No specification provided. Please upload a YAML/JSON file or specify an OpenAPI URL.');
    }

    // Save into central dynamic store
    capabilityStore.setSpec(specContent);

    if (targetBaseUrl) {
      capabilityStore.setTargetBaseUrl(targetBaseUrl);
    }

    const analysis = OpenApiAnalyzer.analyze(specContent);
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unable to parse specification' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const existing = capabilityStore.getAnalysis();
    if (existing) {
      return NextResponse.json(existing);
    }

    // Default to Petstore standard real API
    const defaultSpecPath = path.join(process.cwd(), 'src', 'data', 'specs', 'petstore-api.yaml');
    if (fs.existsSync(defaultSpecPath)) {
      const specContent = fs.readFileSync(defaultSpecPath, 'utf-8');
      capabilityStore.setSpec(specContent);
      const analysis = OpenApiAnalyzer.analyze(specContent);
      return NextResponse.json(analysis);
    }

    return NextResponse.json({
      title: 'No API Loaded',
      version: '0.0.0',
      description: 'Upload an OpenAPI 3.x or Swagger 2.0 specification to get started.',
      endpointCount: 0,
      resourceCount: 0,
      methodCounts: { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 },
      resources: [],
      endpoints: [],
      relationships: [],
      potentialCapabilities: [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
