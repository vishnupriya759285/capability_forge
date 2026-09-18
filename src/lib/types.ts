export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type CapabilityStatus = 
  | 'DRAFT' 
  | 'ANALYZING' 
  | 'COMPILED' 
  | 'TESTING' 
  | 'FAILED' 
  | 'REPAIRING' 
  | 'VERIFIED';

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  operationId: string;
  resource: string;
  parameters: Array<{
    name: string;
    in: 'path' | 'query' | 'header' | 'body';
    required: boolean;
    schema: Record<string, any>;
    example?: any;
  }>;
  requestBody?: {
    required: boolean;
    schema: Record<string, any>;
    example?: any;
  };
  responses: Record<string, {
    description: string;
    schema?: Record<string, any>;
  }>;
  risk: RiskLevel;
}

export interface ApiResource {
  name: string;
  endpointCount: number;
  endpoints: ApiEndpoint[];
}

export interface ResourceRelationship {
  id: string;
  fromResource: string;
  toResource: string;
  fromProperty: string;
  toProperty: string;
  relationType: 'one-to-one' | 'one-to-many' | 'flow-dependency';
  description: string;
}

export interface ApiAnalysisResult {
  title: string;
  version: string;
  description: string;
  baseUrl?: string;
  endpointCount: number;
  resourceCount: number;
  methodCounts: {
    GET: number;
    POST: number;
    PUT: number;
    PATCH: number;
    DELETE: number;
  };
  resources: ApiResource[];
  endpoints: ApiEndpoint[];
  relationships: ResourceRelationship[];
  potentialCapabilities: Array<{
    id: string;
    name: string;
    description: string;
    endpointCount: number;
    risk: RiskLevel;
    confidence: string;
    endpoints: string[];
  }>;
}

export interface CapabilityStep {
  id: string;
  name: string;
  type: 'API_CALL' | 'LOGIC' | 'APPROVAL_GUARD' | 'MUTATION';
  endpointId?: string;
  method?: HttpMethod;
  path?: string;
  description: string;
  requiresHumanApproval?: boolean;
}

export interface CapabilityContract {
  name: string;
  purpose: string;
  inputs: Record<string, {
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }>;
  output: Record<string, {
    type: string;
    description: string;
  }>;
  permissions: {
    read: string[];
    write: string[];
    destructive?: string[];
  };
  risk: RiskLevel;
  humanApprovalRequired: boolean;
  approvalReason?: string;
  endpointsUsed: string[];
  totalTests: number;
  status: CapabilityStatus;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  status: CapabilityStatus;
  risk: RiskLevel;
  humanApprovalRequired: boolean;
  contract: CapabilityContract;
  steps: CapabilityStep[];
  endpoints: string[];
  evaluationSummary?: {
    total: number;
    passed: number;
    failed: number;
    lastRun?: string;
  };
}

export interface ExecutionTraceItem {
  index: number;
  timestamp: string;
  stepName: string;
  type: 'INFO' | 'API_REQUEST' | 'API_RESPONSE' | 'LOGIC_EVAL' | 'APPROVAL_REQUIRED' | 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' | 'MUTATION_SUCCESS' | 'ERROR';
  details: string;
  payload?: any;
  durationMs?: number;
}

export interface ExecutionResult {
  success: boolean;
  capabilityId: string;
  orderId?: string;
  trace: ExecutionTraceItem[];
  resultData?: any;
  requiresApproval?: boolean;
  approvalPayload?: {
    actionName?: string;
    endpoint?: string;
    method?: string;
    payload?: any;
    targetUrl?: string;
    reason?: string;
    recommendedAction?: string;
    orderId?: string;
    customerName?: string;
    deliveryStatus?: string;
    expectedDelivery?: string;
    daysDelayed?: number;
    refundEligible?: boolean;
    refundAmount?: number;
  };
  mutationExecuted?: boolean;
  refundConfirmation?: {
    refund_id: string;
    order_id: string;
    amount: number;
    status: string;
    processed_at: string;
  };
}

export interface EvaluationScenario {
  id: string;
  name: string;
  description: string;
  expected: string;
  actual?: string;
  status: 'PASSED' | 'FAILED' | 'PENDING' | 'RUNNING';
  durationMs: number;
  logs: string[];
  assertionType: 'ENDPOINT_CALL' | 'PARAMETER_PASSING' | 'SCHEMA_MATCH' | 'LOGIC_CHECK' | 'SECURITY_GUARD' | 'ERROR_HANDLING';
}

export interface EvaluationReport {
  capabilityId: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  status: 'VERIFIED' | 'FAILED' | 'RUNNING';
  scenarios: EvaluationScenario[];
  timestamp: string;
}

export interface RepairContext {
  capabilityId: string;
  capabilityName: string;
  failedTestName: string;
  expectedBehavior: string;
  actualBehavior: string;
  relevantFiles: Array<{
    path: string;
    snippet: string;
    highlightLines?: [number, number];
  }>;
  logs: string[];
  reproductionSteps: string[];
}

export interface RepairHistoryItem {
  id: string;
  timestamp: string;
  capabilityId: string;
  capabilityName: string;
  failureReason: string;
  filesChanged: string[];
  testsBefore: string;
  testsAfter: string;
  status: 'VERIFIED' | 'FAILED';
  diff: string;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  outputSchema: {
    type: 'object';
    properties: Record<string, any>;
  };
  risk: RiskLevel;
  humanApprovalRequired: boolean;
  permissions: {
    read: string[];
    write: string[];
  };
}
