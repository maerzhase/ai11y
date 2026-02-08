# @ai11y/agent

Runs the **plan** step for ai11y on the server (LLM + tools). Securely handles
LLM API calls and provides extensible tool support.

## Installation

```bash
pnpm add @ai11y/agent
```

## Quick Start

### With Fastify

```ts
import Fastify from "fastify";
import { ai11yPlugin } from "@ai11y/agent/fastify";

const fastify = Fastify();

await fastify.register(ai11yPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini", // Optional, defaults to gpt-4o-mini
    baseURL: "https://api.openai.com/v1", // Optional, for custom endpoints
  },
});

await fastify.listen({ port: 3000 });
```

The plugin will register the following routes:

- `POST /ai11y/agent` - Main agent endpoint
- `GET /ai11y/health` - Health check endpoint

**Example App:** See `apps/server/` in this monorepo for a complete example
server implementation.

**Note:** If you're running the server on a different origin than your frontend,
you'll need to configure CORS:

```ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { ai11yPlugin } from "@ai11y/agent/fastify";

const fastify = Fastify();

await fastify.register(cors, {
  origin: "http://localhost:5173", // Your frontend URL
});

await fastify.register(ai11yPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
});
```

### Standalone Usage

```ts
import { runAgent, createDefaultToolRegistry } from "@ai11y/agent";
import type { AgentRequest, ServerConfig } from "@ai11y/agent";

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

## Extending with Custom Tools

You can extend the agent with custom tools using the `ToolRegistry`:

```ts
import { ai11yPlugin, createToolRegistry } from "@ai11y/agent/fastify";
import type { ToolDefinition, ToolExecutor, Ai11yContext } from "@ai11y/agent";

// Create a custom tool registry
const registry = createToolRegistry();

// Register a custom tool
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
    // Execute your custom logic here
    console.log("Sending email:", args);
    // You can access the context for additional information
    return { success: true, messageId: "123" };
  },
);

// Use the custom registry with the plugin
await fastify.register(ai11yPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  toolRegistry: registry,
});
```

## API Reference

### `runAgent(request, config, toolRegistry?)`

Runs the LLM agent with the given request and configuration.

**Parameters:**

- `request: AgentRequest` - The agent request containing input and context
- `config: ServerConfig` - Server configuration with API key
- `toolRegistry?: ToolRegistry` - Optional tool registry (defaults to built-in
  tools)

**Returns:** `Promise<AgentResponse>`

### `ToolRegistry`

A registry for managing tools that can be called by the LLM agent.

**Methods:**

- `register(definition: ToolDefinition, executor: ToolExecutor)` - Register a
  new tool
- `unregister(name: string)` - Unregister a tool
- `getToolDefinitions()` - Get all tool definitions for LLM
- `executeToolCall(name, args, context)` - Execute a tool call
- `hasTool(name)` - Check if a tool is registered

### `createDefaultToolRegistry()`

Creates a tool registry with built-in tools (navigate, click, highlight).

### `ai11yPlugin`

Fastify plugin that registers the agent endpoints.

**Options:**

- `config: ServerConfig` - Required. Server configuration
- `toolRegistry?: ToolRegistry` - Optional. Custom tool registry

## Types

### `ServerConfig`

```ts
interface ServerConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}
```

### `AgentRequest`

```ts
interface AgentRequest {
  input: string;
  context: Ai11yContext;
}
```

### `AgentResponse`

```ts
interface AgentResponse {
  reply: string;
  toolCalls?: ToolCall[];
}
```

### `ToolDefinition`

```ts
interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}
```

### `ToolExecutor`

```ts
type ToolExecutor = (
  args: Record<string, unknown>,
  context: Ai11yContext,
) => Promise<unknown> | unknown;
```
