# @ai11y/core

Core types and utilities shared across all ai11y packages.

A semantic UI context layer for AI agents.

## Structure

```
src/
├── agent/
│   ├── agent-adapter.ts  # Unified agent adapter
│   ├── llm-agent.ts      # LLM-based agent
│   ├── rule-based-agent.ts # Rule-based fallback
│   └── types.ts          # Agent configuration types
├── tools/
│   ├── click.ts          # Click marker tool
│   ├── highlight.ts      # Highlight marker tool
│   ├── navigate.ts       # Navigate to route tool
│   └── scroll.ts         # Scroll to marker tool
├── types/
│   ├── agent.ts          # Agent request/response types
│   ├── config.ts         # Server configuration types
│   ├── context.ts        # Assist context and state types
│   ├── tool.ts           # Tool call and tool definition types
│   └── index.ts          # Barrel export for all types
├── dom.ts                # DOM utilities
├── events.ts             # Event system
├── marker.ts             # Marker registry
├── store.ts              # State store
└── index.ts              # Main entry point
```

## Types

### Agent Types (`types/agent.ts`)
- `AgentRequest` - Request to the agent with input and context
- `AgentResponse` - Response from the agent with reply and tool calls

### Context Types (`types/context.ts`)
- `Ai11yContext` - Full context available to the agent
- `Ai11yState` - Application state tracking
- `Ai11yError` - Error information
- `Marker` - UI element marker information

### Tool Types (`types/tool.ts`)
- `ToolCall` - Tool call actions (navigate, highlight, click)
- `ToolDefinition` - Tool definition for extensibility
- `ToolExecutor` - Tool executor function type

### Config Types (`types/config.ts`)
- `ServerConfig` - LLM provider server configuration

## Usage

```typescript
import type { ToolCall, AgentResponse, Ai11yContext } from "@ai11y/core";
import { navigateToRoute, highlightMarker, clickMarker } from "@ai11y/core";
```

All types are re-exported from the main entry point, so you can import everything from `@ai11y/core` directly.
