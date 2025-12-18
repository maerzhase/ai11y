# React Quest - In-App AI Assistant SDK

A minimal but real MVP of an "in-app AI assistant SDK" for React. The assistant can understand annotated UI elements ("markers"), react to runtime errors, and navigate/click inside the app based on chat commands.

## Architecture

The SDK consists of:

**Packages (libraries):**
- **`packages/react-quest/`** - Core React SDK (provider, markers, hooks, client-side agent)
- **`packages/react-quest-server/`** - Server-side package for secure OpenAI API calls with extensible tool support

**Apps (applications):**
- **`apps/playground/`** - Demo app that uses the SDK
- **`apps/server/`** - Example server application using the server package

## Core Concepts

### 1. AssistProvider

The `AssistProvider` is the central context provider that maintains:

- **Marker Registry**: A map of `markerId → metadata + DOM ref` for all marked elements
- **Assist State**: User-defined JSON state that can be accessed by the agent
- **Recent Events & Errors**: Tracks application events and errors for context
- **Imperative API**: Methods exposed via context:
  - `track(event, payload?)` - Track custom events
  - `reportError(error, meta?)` - Report errors (auto-opens panel)
  - `navigate(route)` - Navigate to a route
  - `highlight(markerId)` - Visually highlight an element for 2 seconds
  - `click(markerId)` - Trigger a marker's action or click its element

### 2. Mark Component

The `Mark` component is a semantic wrapper that registers UI elements with the assistant:

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
- **No action prop needed**: The assistant simulates browser events (clicks) on the wrapped element, which naturally triggers your existing `onClick` handlers

### 3. AssistPanel

A floating chat panel in the bottom-right corner that provides:

- Chat transcript showing user messages, assistant replies, and system messages
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

The SDK includes server-side OpenAI integration with function calling. The agent runs securely on your server (not in the browser) and uses GPT models to understand natural language and intelligently interact with your app.

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
function runAgent(input: string, context: AssistContext): AgentResponse
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
import { AssistProvider, AssistPanel, Mark } from "react-quest";

function App() {
  return (
    <AssistProvider onNavigate={(route) => navigate(route)}>
      <YourApp />
      <AssistPanel />
    </AssistProvider>
  );
}
```

#### With LLM Agent (Server-Side)

**Step 1: Set up the server**

```bash
# Install the server package
pnpm add @react-quest/server openai

# Set your OpenAI API key in a .env file (recommended)
# Create a .env file in your server directory:
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

**Step 2: Create a server file**

```ts
// server.ts
import Fastify from 'fastify';
import { questPlugin } from '@react-quest/server/fastify';

const fastify = Fastify();

await fastify.register(questPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini', // Optional
  }
});

await fastify.listen({ port: 3000 });
```

**Step 3: Configure the client**

```tsx
import { AssistProvider, AssistPanel, Mark } from "react-quest";

function App() {
  const llmConfig = {
    apiEndpoint: "http://localhost:3000/quest/agent",
  };

  return (
    <AssistProvider 
      onNavigate={(route) => navigate(route)}
      llmConfig={llmConfig}
    >
      <YourApp />
      <AssistPanel />
    </AssistProvider>
  );
}
```

**Important:** 
- The LLM agent automatically falls back to rule-based if the API endpoint is unavailable or misconfigured.
- API keys are kept secure on the server, never exposed to the browser.
- See `packages/react-quest-server/README.md` for more details on extending with custom tools.

### Marking Elements

```tsx
import { Mark, useAssist } from "react-quest";

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
- The assistant simulates browser click events, which trigger your existing handlers
- Works with any clickable element (buttons, links, divs with onClick, etc.)
- Simplifies integration - no need to wrap existing components with action callbacks

### Using the Imperative API

```tsx
import { useAssist } from "react-quest";

function MyComponent() {
  const { navigate, highlight, click, track } = useAssist();

  const handleSomething = () => {
    track("custom_event", { data: "value" });
    navigate("/billing");
    highlight("some_marker");
    click("another_marker");
  };

  return <button onClick={handleSomething}>Do Something</button>;
}
```

## Demo App

The playground (`apps/playground/`) demonstrates:

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
export OPENAI_API_KEY=your-api-key-here  # For server (optional)

# Create .env file for playground (optional, for LLM support)
echo "VITE_QUEST_API_ENDPOINT=http://localhost:3000/quest/agent" > apps/playground/.env

# Run everything (frontend + backend) in one command
pnpm dev
```

This will:
- Build `react-quest` package
- Start the server on `http://localhost:3000` (if `OPENAI_API_KEY` is set)
- Start the playground on `http://localhost:5173`

**Other Commands:**

```bash
# Build all packages
pnpm build

# Watch mode (rebuilds on changes)
pnpm watch
```

**To enable LLM in the demo:**

1. Set `OPENAI_API_KEY` environment variable
2. Create a `.env` file in `apps/playground/` with:
   ```
   VITE_QUEST_API_ENDPOINT=http://localhost:3000/quest/agent
   ```
   (The playground will use the rule-based agent if this is not set)

## UX Features

- **Visual Highlighting**: When `highlight(markerId)` is called, the element is outlined with a blue border for 2 seconds
- **Click Simulation**: `click(markerId)` either calls the marker's `action` function or triggers a native click on the element
- **Navigation**: When the assistant navigates, the route actually changes (integrated with React Router)
- **System Messages**: The panel shows system messages like "Navigated to /billing" and "Clicked Connect Stripe"
- **Error Recovery**: When errors occur, the assistant explains them and guides recovery

## Success Criteria

✅ A user can:
- Open the app
- Ask the assistant "take me to billing" → See navigation happen
- Ask "click enable billing" → Button is clicked
- Trigger an error in integrations → Watch the assistant explain and guide recovery

This feels like a real product primitive, not a demo chatbot.

## Technical Details

- **TypeScript**: Strict mode enabled
- **Minimal Dependencies**: Core SDK only depends on React
- **Refs-Based**: Uses React refs for element access (no CSS selectors)
- **Memory-Only**: No persistence beyond runtime
- **Dual Agent Mode**: LLM agent (server-side) with rule-based fallback
- **Function Calling**: Uses OpenAI's function calling API for structured tool execution
- **Secure**: API keys never exposed to the browser
- **Extensible**: Server package supports custom tools via `ToolRegistry`

## Server Package

The `@react-quest/server` package provides:

- **Secure API handling**: OpenAI API calls happen server-side
- **Fastify middleware**: Easy integration with Fastify servers
- **Extensible tool system**: Register custom tools that the LLM can call
- **Type-safe**: Full TypeScript support

See `packages/react-quest-server/README.md` for detailed documentation on:
- Setting up the server
- Extending with custom tools
- API reference

## Future Enhancements

- Support for other LLM providers (Anthropic, local models, etc.)
- Add persistence layer for state/events
- Add analytics dashboard
- Add authentication
- Streaming responses for better UX
- Middleware for other frameworks (Express, Hono, etc.)
