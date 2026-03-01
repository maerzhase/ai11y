# @ai11y/agent

Runs the plan step for ai11y on the server (LLM + tools). Securely handles LLM
API calls and provides extensible tool support.

## Installation

```bash
pnpm add @ai11y/agent
```

## Quick Start

### Standalone

Use `runAgent` with a config and tool registry; wire it to your own HTTP (or
other) transport:

```typescript
import {
  runAgent,
  createDefaultToolRegistry,
  type ServerConfig,
} from "@ai11y/agent";
import type { AgentRequest } from "@ai11y/agent";

const config: ServerConfig = {
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
};

const toolRegistry = createDefaultToolRegistry();

async function handleRequest(request: AgentRequest) {
  const response = await runAgent(request, config, toolRegistry);
  return response;
}
```

### With Fastify

Import the plugin directly from the main package:

```typescript
import Fastify from "fastify";
import { ai11yAgentPlugin } from "@ai11y/agent";

const fastify = Fastify();

await fastify.register(ai11yAgentPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
    baseURL: "https://api.openai.com/v1",
  },
});

await fastify.listen({ port: 3000 });
```

The plugin registers `POST /ai11y/agent` and `GET /ai11y/health`.

### With Next.js API Routes

```typescript
// app/api/ai11y/agent/route.ts
import { runAgent, createDefaultToolRegistry } from "@ai11y/agent";
import type { AgentRequest } from "@ai11y/agent";

const config = {
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
};

const toolRegistry = createDefaultToolRegistry();

export async function POST(request: Request) {
  const body = (await request.json()) as AgentRequest;
  const result = await runAgent(body, config, toolRegistry);
  return Response.json(result);
}
```

## Extending with Custom Tools

You can extend the agent with custom tools using the ToolRegistry:

```typescript
import { ai11yAgentPlugin, createToolRegistry } from "@ai11y/agent";
import type { Ai11yContext } from "@ai11y/agent";

const registry = createToolRegistry();

registry.register(
  {
    name: "send_email",
    description: "Send an email notification",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body" },
      },
      required: ["to", "subject", "body"],
    },
  },
  async (args, context) => {
    console.log("Sending email:", args);
    // args: { to: string, subject: string, body: string }
    // context: { route?: string, state?: Record, markers: [] }
    return { success: true, messageId: "123" };
  },
);

await fastify.register(ai11yAgentPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  toolRegistry: registry,
});
```

## API Reference

### `createDefaultToolRegistry()`

Creates a registry pre-populated with the default ai11y tools:

- `ai11y_describe` - Get current UI context
- `ai11y_click` - Click an element by marker ID
- `ai11y_fillInput` - Fill an input by marker ID
- `ai11y_navigate` - Navigate to a route
- `ai11y_scroll` - Scroll to an element
- `ai11y_highlight` - Highlight an element
- `ai11y_setState` - Set application state
- `ai11y_getState` - Get application state

### `createToolRegistry()`

Creates an empty registry for custom tools.

### `runAgent(request, config, toolRegistry?)`

Executes the agent with:

- `request`: `{ message, context, history? }`
- `config`: `{ apiKey, provider?, model?, baseURL?, temperature?, maxTokens? }`
- `toolRegistry?`: Optional custom tool registry

Returns: `{ instructions: [], reply?: string }`

### `createAgent(config)`

Creates an agent instance with a simpler API for repeated calls.

### `ai11yAgentPlugin`

Fastify plugin that registers `/ai11y/agent` and `/ai11y/health` endpoints.

### ServerConfig

```typescript
interface ServerConfig {
  apiKey: string;
  provider?: "openai" | "anthropic";
  model?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
}
```

### ToolRegistry

```typescript
class ToolRegistry {
  register(definition: ToolDefinition, executor: ToolExecutor): void;
  unregister(name: string): boolean;
  getTool(
    name: string,
  ): { definition: ToolDefinition; executor: ToolExecutor } | undefined;
  getAllTools(): ToolDefinition[];
  getToolNames(): string[];
  has(name: string): boolean;
}
```
