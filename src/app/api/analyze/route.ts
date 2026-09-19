import { NextRequest, NextResponse } from 'next/server';
import { OpenApiAnalyzer } from '@/lib/engine/openapi-analyzer';
import { capabilityStore } from '@/lib/engine/capability-store';

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

    // 2. If remote URL requested, fetch it
    if (specUrl && specUrl.startsWith('http')) {
      const fetchRes = await fetch(specUrl);
      if (!fetchRes.ok) {
        throw new Error(`Failed to fetch OpenAPI spec from ${specUrl}: ${fetchRes.statusText}`);
      }
      specContent = await fetchRes.text();
    }

    if (!specContent.trim()) {
      throw new Error('No specification provided. Please upload a YAML/JSON file or specify an OpenAPI URL.');
    }

    let analysis;
    try {
      analysis = OpenApiAnalyzer.analyze(specContent);
    } catch (parseErr: any) {
      // Fallback: If remote spec was a .yaml file that had syntax errors, attempt fetching companion .json if exists
      if (specUrl && /\.ya?ml$/i.test(specUrl)) {
        try {
          const jsonUrl = specUrl.replace(/\.ya?ml$/i, '.json');
          const jsonRes = await fetch(jsonUrl);
          if (jsonRes.ok) {
            const jsonText = await jsonRes.text();
            analysis = OpenApiAnalyzer.analyze(jsonText);
            specContent = jsonText;
          } else {
            throw parseErr;
          }
        } catch {
          throw parseErr;
        }
      } else {
        throw parseErr;
      }
    }

    // Save into central dynamic store
    capabilityStore.setSpec(specContent);

    if (targetBaseUrl) {
      capabilityStore.setTargetBaseUrl(targetBaseUrl);
    }

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

    return NextResponse.json({
      title: 'No API Connected',
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

export async function DELETE() {
  try {
    capabilityStore.clear();
    return NextResponse.json({
      title: 'No API Connected',
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

