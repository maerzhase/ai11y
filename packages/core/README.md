# @quest/core

Core types and utilities shared across all React Quest packages.

This package contains **no runtime code**, only TypeScript type definitions. It serves as the single source of truth for shared types used across `@quest/react`, `@quest/server`, and other packages.

## Structure

```
src/
├── types/
│   ├── agent.ts      # Agent request/response types
│   ├── config.ts     # Server configuration types
│   ├── context.ts    # Assist context and state types
│   ├── tool.ts       # Tool call and tool definition types
│   └── index.ts      # Barrel export for all types
└── index.ts          # Main entry point
```

## Types

### Agent Types (`types/agent.ts`)
- `AgentRequest` - Request to the agent with input and context
- `AgentResponse` - Response from the agent with reply and tool calls

### Context Types (`types/context.ts`)
- `UIAIContext` - Full context available to the agent
- `UIAIState` - Application state tracking
- `UIAIError` - Error information
- `Marker` - UI element marker information

### Tool Types (`types/tool.ts`)
- `ToolCall` - Tool call actions (navigate, highlight, click)
- `ToolDefinition` - Tool definition for extensibility
- `ToolExecutor` - Tool executor function type

### Config Types (`types/config.ts`)
- `ServerConfig` - LLM provider server configuration

## Usage

```typescript
import type { ToolCall, AgentResponse, UIAIContext } from "@quest/core";
```

All types are re-exported from the main entry point, so you can import everything from `@quest/core` directly.

