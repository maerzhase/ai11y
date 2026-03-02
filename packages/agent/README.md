# @ai11y/agent

Runs the **plan** step for ai11y on the server (LLM + tools). Securely handles
LLM API calls and provides extensible tool support.

The agent uses the canonical `ai11yTools` definitions from `@ai11y/core` as its
tool registry -- the same definitions used for WebMCP registration on the
client. Single source of truth, no duplication.

## Installation

```bash
pnpm add @ai11y/agent
```

## Quick Start

### Standalone

Use `runAgent` with a config and tool registry; wire it to your own HTTP (or
other) transport:

```ts
import type { AgentRequest } from "@ai11y/core";
import { runAgent, createDefaultToolRegistry } from "@ai11y/agent";
import type { ServerConfig } from "@ai11y/agent";

const config: ServerConfig = {
  provider: "openai",
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

Register the plugin to expose the agent endpoint:

```ts
import Fastify from "fastify";
import { ai11yPlugin } from "@ai11y/agent/fastify";

const fastify = Fastify();

await fastify.register(ai11yPlugin, {
  config: {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  },
});

await fastify.listen({ port: 3000 });
```

The plugin registers `POST /ai11y/agent` and `GET /ai11y/health`. See
`apps/server/` for a full example.

## Tool registry

The default tool registry (`createDefaultToolRegistry()`) is populated from
`ai11yTools` in `@ai11y/core`. It registers the following tools with `ai11y_`
prefixed names:

| Tool              | Description                               |
| ----------------- | ----------------------------------------- |
| `ai11y_click`     | Click an interactive element by marker ID |
| `ai11y_fillInput` | Fill a form field by marker ID            |
| `ai11y_navigate`  | Navigate to a route                       |
| `ai11y_scroll`    | Scroll an element into view               |
| `ai11y_highlight` | Highlight an element                      |

WebMCP-only tools (`ai11y_describe`, `ai11y_setState`, `ai11y_getState`) are
excluded from the server agent since the server receives context via the request
body.

## Extending with custom tools

You can extend the agent with custom tools using the `ToolRegistry`:

```ts
import type { ToolDefinition, ToolExecutor } from "@ai11y/core";
import { createDefaultToolRegistry } from "@ai11y/agent";

const registry = createDefaultToolRegistry();

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
    return { success: true, messageId: "123" };
  },
);
```

For API details and types, see the generated docs.
