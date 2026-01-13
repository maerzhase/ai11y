# ui4ai - A semantic UI context layer for AI agents

A minimal but powerful SDK that provides semantic UI context for AI agents. The agent can understand annotated UI elements ("markers"), react to runtime errors, and navigate/interact with your app based on natural language commands.

## Architecture

The SDK consists of:

**Packages (libraries):**

- **`packages/core/`** - Core SDK (markers, store, agents, tool definitions)
- **`packages/react/`** - React bindings (provider, hooks, components)
- **`packages/ui/`** - UI components (chat panel, triggers, message bubbles)
- **`packages/server/`** - Server-side package for secure LLM API calls with extensible tool support

**Apps (applications):**

- **`apps/demo/`** - Demo app that uses the SDK
- **`apps/server/`** - Example server application using the server package

## Core Concepts

### 1. UIAIProvider

The `UIAIProvider` is the central context provider that maintains:

- **Marker Registry**: A map of `markerId → metadata + DOM ref` for all marked elements
- **Assist State**: User-defined JSON state that can be accessed by the agent
- **Recent Events & Errors**: Tracks application events and errors for context
- **Imperative API**: Methods exposed via context:
  - `track(event, payload?)` - Track custom events
  - `reportError(error, meta?)` - Report errors (auto-opens panel)
- **Tool Functions**: Available from `@ui4ai/core`:
  - `navigateToRoute(route)` - Navigate to a route
  - `highlightMarker(markerId, options?)` - Visually highlight an element
  - `scrollToMarker(markerId)` - Scroll to a marker element
  - `clickMarker(markerId)` - Click a marker element
- **React-Specific Tools**: Available via `useAssistTools()` hook (wraps core functions with React features like highlightWrapper, onHighlight callbacks)

### 2. Mark Component

The `Mark` component is a semantic wrapper that registers UI elements with the agent:

```tsx
<Mark
  id="connect_stripe"
  label="Connect Stripe"
  intent="Connect Stripe to accept payments"
>
  <button onClick={() => connectStripe()}>Connect Stripe</button>
</Mark>
```

**Behavior:**

- On mount: Registers the marker with the provider (id, label, intent, DOM ref)
- On unmount: Unregisters the marker
- The DOM element is discoverable for highlighting and simulated clicks
- Uses React refs (not CSS selectors) for reliable element access
- **No action prop needed**: The agent simulates browser events (clicks) on the wrapped element, which naturally triggers your existing `onClick` handlers

### 3. AssistPanel

A floating chat panel in the bottom-right corner that provides:

- Chat transcript showing user messages, agent replies, and system messages
- Input box for user commands
- Context collection before sending to agent:
  - Current route
  - Assist state
  - Last error (if any)
  - List of active markers (id + label + intent)
- Tool call execution (navigate, highlight, click)

### 4. Agent Brain

The SDK supports **two agent modes**:

#### LLM Agent (Recommended)

The SDK includes server-side LLM integration with function calling. The agent runs securely on your server (not in the browser) and uses AI models to understand natural language and intelligently interact with your app.

**Features:**

- Natural language understanding
- Context-aware responses
- Intelligent tool selection (navigate, click, highlight)
- Error explanation and recovery suggestions
- Conversational interactions
- **Secure**: API keys stay on the server, never exposed to the browser
- **Extensible**: Easy to add custom tools via the server package

#### Rule-Based Agent (Fallback)

If no LLM configuration is provided, the SDK falls back to a **rule-based local agent** that parses commands using pattern matching:

```typescript
function runAgent(input: string, context: UIAIContext): AgentResponse
```

**Supported Commands:**

- `"go to X"` / `"navigate to X"` / `"open X"` → Navigate to route
- `"click X"` / `"press X"` → Click a marked element
- `"highlight X"` / `"show X"` → Highlight a marked element
- Error handling: If an error exists, explains it and suggests retry

The rule-based agent is useful for development and testing, or when you don't want to use an external API.

### 5. Tool Calls

A simple tool protocol:

```typescript
type ToolCall =
  | { type: "navigate"; route: string }
  | { type: "highlight"; markerId: string }
  | { type: "click"; markerId: string };
```

The `AssistPanel` executes these via provider methods.

### 6. Error Reporting

Errors can be reported programmatically:

```typescript
assist.reportError(error, {
  surface?: string;
  markerId?: string;
});
```

When an error is reported:

- It's stored as `lastError` in context
- The `AssistPanel` auto-opens with a helpful message
- The agent can suggest retry actions

## Usage

### Basic Setup

#### With Rule-Based Agent (Default)

```tsx
import { UIAIProvider, AssistPanel, Mark } from "@ui4ai/react";

function App() {
  return (
    <UIAIProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
      <AssistPanel />
    </UIAIProvider>
  );
}
```

#### With LLM Agent (Server-Side)

**Step 1: Set up the server**

```bash
# Install the server package
pnpm add @ui4ai/server

# Set your API key in a .env file (recommended)
# Create a .env file in your server directory:
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

**Step 2: Create a server file**

```ts
// server.ts
import Fastify from 'fastify';
import { ui4aiPlugin, type ServerConfig } from '@ui4ai/server/fastify';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required');
}

const fastify = Fastify();

const config: ServerConfig = {
  provider: 'openai',
  apiKey,
  model: 'gpt-5-nano', // Optional, defaults to gpt-5-nano
};

await fastify.register(ui4aiPlugin, {
  config,
});

await fastify.listen({ port: 3000 });
```

**Step 3: Configure the client**

```tsx
import { UIAIProvider, AssistPanel, Mark } from "@ui4ai/react";

function App() {
  const agentConfig = {
    apiEndpoint: "http://localhost:3000/ui4ai/agent",
  };

  return (
    <UIAIProvider 
      onNavigate={(route) => navigate(route)}
      agentConfig={agentConfig}
    >
      <YourApp />
      <AssistPanel />
    </UIAIProvider>
  );
}
```

**Important:**

- The LLM agent automatically falls back to rule-based if the API endpoint is unavailable or misconfigured.
- API keys are kept secure on the server, never exposed to the browser.
- See `packages/server/README.md` for more details on extending with custom tools.

### Marking Elements

```tsx
import { Mark, useAssist } from "@ui4ai/react";

function MyComponent() {
  const { reportError } = useAssist();

  const handleClick = () => {
    try {
      doSomething();
    } catch (error) {
      reportError(error, { markerId: "my_button" });
    }
  };

  return (
    <Mark
      id="my_button"
      label="My Button"
      intent="Perform an important action"
    >
      <button onClick={handleClick}>Click Me</button>
    </Mark>
  );
}
```

**Key Points:**

- No `action` prop needed - just use regular `onClick` handlers
- The agent simulates browser click events, which trigger your existing handlers
- Works with any clickable element (buttons, links, divs with onClick, etc.)
- Simplifies integration - no need to wrap existing components with action callbacks

### Using Tool Functions

Tool functions are available directly from the core package:

```tsx
import { navigateToRoute, highlightMarker, clickMarker } from "@ui4ai/core";
import { useAssist } from "@ui4ai/react";

function MyComponent() {
  const { track } = useAssist();

  const handleSomething = () => {
    track("custom_event", { data: "value" });
    navigateToRoute("/billing");
    highlightMarker("some_marker");
    clickMarker("another_marker");
  };

  return <button onClick={handleSomething}>Do Something</button>;
}
```

For React-specific features (like `highlightWrapper` or `onHighlight` callbacks), use the `useAssistTools()` hook:

```tsx
import { useAssistTools } from "@ui4ai/react";

function MyComponent() {
  const { navigate, highlight, click } = useAssistTools();

  const handleSomething = () => {
    navigate("/billing");  // Calls onNavigate callback if provided
    highlight("some_marker");  // Uses highlightWrapper if provided
    click("another_marker");
  };

  return <button onClick={handleSomething}>Do Something</button>;
}
```

## Demo App

The demo (`apps/demo/`) demonstrates:

- **Routes**: `/` (Home), `/billing`, `/integrations`
- **Home Page**: Marked buttons for navigation
- **Billing Page**: "Enable Billing" button with local state
- **Integrations Page**: "Connect Stripe" button that simulates failure on first click, then succeeds on retry

### Running the Demo

This monorepo uses [Turborepo](https://turbo.build/repo) for managing builds and dev scripts.

**Quick Start:**

```bash
# Install all dependencies
pnpm install

# Set up environment variables
export OPENAI_API_KEY=your-api-key-here  # For server (required for LLM agent)

# Create .env file for demo (optional, for LLM support)
echo "VITE_UI4AI_API_ENDPOINT=http://localhost:3000/ui4ai/agent" > apps/demo/.env

# Run everything (frontend + backend) in one command
pnpm dev
```

This will:

- Build ui4ai packages
- Start the server on `http://localhost:3000` (if `OPENAI_API_KEY` is set)
- Start the demo on `http://localhost:5173`

**Other Commands:**

```bash
# Build all packages
pnpm build

# Watch mode (rebuilds on changes)
pnpm watch
```

**To enable LLM in the demo:**

1. Set `OPENAI_API_KEY` environment variable
2. Create a `.env` file in `apps/demo/` with:

   ```
   VITE_UI4AI_API_ENDPOINT=http://localhost:3000/ui4ai/agent
   ```

   (The demo will use the rule-based agent if this is not set)

## UX Features

- **Visual Highlighting**: When `highlight(markerId)` is called, the element is outlined with a blue border for 2 seconds
- **Click Simulation**: `click(markerId)` either calls the marker's `action` function or triggers a native click on the element
- **Navigation**: When the agent navigates, the route actually changes (integrated with your router)
- **System Messages**: The panel shows system messages like "Navigated to /billing" and "Clicked Connect Stripe"
- **Error Recovery**: When errors occur, the agent explains them and guides recovery
