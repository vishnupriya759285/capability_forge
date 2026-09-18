# Capability Forge ⚡

> **"Compile APIs into reliable capabilities for AI agents."**  
> *Core Loop: UNDERSTAND → COMPILE → EXPOSE → EVALUATE → BREAK → REPAIR WITH CODEX → VERIFY*

---

## 1. Problem Statement

Traditional OpenAPI-to-MCP converters take a naive approach: they convert every low-level REST endpoint (`GET /orders/{id}`, `GET /shipping/{id}`, `GET /refund-policy`, `POST /refund`) into an isolated tool.

This puts an impossible burden on the AI agent:
- Which endpoints should be called and in what order?
- How is state piped from one response into the next request?
- Which actions are read-only vs. financial mutations?
- How is human authorization enforced before executing a destructive action?
- What happens when an endpoint fails or has a latency spike?
- How can developers verify that the tool actually behaves correctly under edge cases?

## 2. The Solution: Capability Forge

**Capability Forge** is a developer platform that analyzes API specifications, identifies resource joins and flow dependencies, and compiles them into **task-level capabilities**.

Each compiled capability includes:
1. **Deterministic Execution Graphs**: Clear multi-step workflows (e.g. `get_order` → `get_shipping` → `get_refund_policy` → `evaluate_eligibility` → `human_approval_guard` → `create_refund`).
2. **Formal Capability Contracts**: Strong Zod/JSON schemas specifying inputs, outputs, permissions, and risk tiers.
3. **Risk Engine & Approval Guards**: Strict gates halting execution before state mutations (`POST /refund`).
4. **Real MCP Protocol Server**: Standard JSON-RPC and stdio transports for direct integration into AI agents and tools like Claude Desktop or Cursor.
5. **Automated Evaluation Engine**: 9 scenario assertions with real diffs and logs.
6. **Chaos / Break Mode**: Intentional demo bug injection demonstrating failure detection.
7. **Codex-Assisted Self-Repair**: Automated diagnosis, code patching, and re-evaluation to **CAPABILITY VERIFIED**.

---

## 3. Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAPABILITY FORGE PLATFORM                       │
│                                                                        │
│  ┌───────────────────────┐         ┌───────────────────────────────┐   │
│  │   OpenAPI Analyzer    │         │      Capability Compiler      │   │
│  │  - Endpoint Parser    │ ──────> │  - Resource Relationship Map  │   │
│  │  - Schema & Methods   │         │  - Risk Engine (Read/Write)   │   │
│  │  - Parameter Mapper   │         │  - Execution Graph Generator  │   │
│  └───────────────────────┘         │  - Capability Contract (Zod)  │   │
│                                    └──────────────┬────────────────┘   │
│                                                   │                    │
│                                    ┌──────────────▼────────────────┐   │
│                                    │   Capability Runtime Engine   │   │
│                                    │  - Workflow Step Executor     │   │
│                                    │  - Human Approval Guard       │   │
│                                    │  - Real Local Mock API Client │   │
│                                    └──────┬─────────────────┬──────┘   │
│                                           │                 │          │
│                      ┌────────────────────┘                 └─────┐    │
│                      ▼                                            ▼    │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │           MCP Server Layer          │  │    Evaluation Suite     │  │
│  │  - Official @modelcontextprotocol   │  │  - 9 Scenario Assertions│  │
│  │  - JSON-RPC & Tool Registry         │  │  - Chaos / Break Mode   │  │
│  │  - Direct Agent Consumption         │  │  - Test Runner & Logs   │  │
│  └─────────────────────────────────────┘  └───────────┬─────────────┘  │
│                                                       │ (on failure)   │
│                                           ┌───────────▼─────────────┐  │
│                                           │      Repair Center      │  │
│                                           │  - Codex Repair Agent   │  │
│                                           │  - Patch & Diff Viewer  │  │
│                                           │  - Auto Re-Evaluation   │  │
│                                           │  - Capability Verified  │  │
│                                           └─────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. The 10-Step Hero Hackathon Demo Flow

1. **Launch Capability Forge**: Open `http://localhost:3000` and view the developer overview dashboard.
2. **Import & Analyze**: Navigate to **API Analysis** with `ecommerce-api.yaml` (12 endpoints, 6 resources, 5 relationships).
3. **Compile Capabilities**: Click **Compile Capabilities** to synthesize `resolve_customer_order`.
4. **Inspect Execution Graph**: View the step-by-step graph from root through GET endpoints, logic evaluation, approval guard, and refund mutation.
5. **Expose through MCP**: Review the MCP tool schema and copy/test tool execution.
6. **Execute in Agent Console**: Enter:
   > *"Order #4821 hasn't arrived. Find out where it is and tell me whether the customer qualifies for a refund."*
   Watch real HTTP calls execute against the local mock database.
7. **Human Approval Gate**: Observe execution pausing at the yellow approval card. Click **Approve Refund** to authorize `POST /refund` and generate confirmation `REF-9021`.
8. **Chaos Mode**: Click **Break Capability (Chaos Mode)** in the header or Evaluations page. Re-run evaluations: observe **8/9 passed, 1 failed (Refund permission check)**.
9. **Fix with Codex**: Click **FIX WITH CODEX** in the Repair Center. Watch Codex analyze the failure, inspect `workflow-executor.ts`, apply the code patch, and automatically re-evaluate to **9/9 PASSED**.
10. **Capability Verified**: See the celebration banner certifying the capability as safe for autonomous agents.

---

## 5. Local Setup & Running

### Requirements
- Node.js v18+ or v20+
- npm v10+

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd capability

# Install dependencies
npm install
```

### Running the Web Platform & Mock API
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Engine Tests
```bash
npm test
```

### Running Standalone MCP Stdio Server
For Claude Desktop or other MCP clients:
```bash
node src/scripts/mcp-stdio-server.mjs
```

---

## 6. Built With
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Engine**: Pure TypeScript deterministic analysis, Zod schema validation, Risk Engine, and Workflow Runtime.
- **Mock API**: Fast in-memory database with realistic e-commerce entities (Customers, Orders, Items, Shipping, Policies, Refunds).
- **MCP Protocol**: Official `@modelcontextprotocol/sdk`.
- **Repair**: Codex diagnostics pipeline with patch diff inspector and automated re-evaluation loop.
