# React Quest - In-App AI Assistant SDK

A minimal but real MVP of an "in-app AI assistant SDK" for React. The assistant can understand annotated UI elements ("markers"), react to runtime errors, and navigate/click inside the app based on chat commands.

## Architecture

The SDK consists of two main packages:

- **`packages/react-quest/`** - Core React SDK (provider, markers, hooks, agent)
- **`packages/playground/`** - Demo app that uses the SDK

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
  action={() => connectStripe()}
>
  <button>Connect Stripe</button>
</Mark>
```

**Behavior:**
- On mount: Registers the marker with the provider (id, label, intent, action, DOM ref)
- On unmount: Unregisters the marker
- The DOM element is discoverable for highlighting and simulated clicks
- Uses React refs (not CSS selectors) for reliable element access

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

For the MVP, the agent is **rule-based and local** (no external LLM). It parses commands and returns replies with tool calls:

```typescript
function runAgent(input: string, context: AssistContext): AgentResponse
```

**Supported Commands:**
- `"go to X"` / `"navigate to X"` / `"open X"` → Navigate to route
- `"click X"` / `"press X"` → Click a marked element
- `"highlight X"` / `"show X"` → Highlight a marked element
- Error handling: If an error exists, explains it and suggests retry

This is a placeholder for a future LLM integration.

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

### Marking Elements

```tsx
import { Mark, useAssist } from "react-quest";

function MyComponent() {
  const { reportError } = useAssist();

  return (
    <Mark
      id="my_button"
      label="My Button"
      intent="Perform an important action"
      action={() => {
        try {
          doSomething();
        } catch (error) {
          reportError(error, { markerId: "my_button" });
        }
      }}
    >
      <button>Click Me</button>
    </Mark>
  );
}
```

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

The playground (`packages/playground/`) demonstrates:

- **Routes**: `/` (Home), `/billing`, `/integrations`
- **Home Page**: Marked buttons for navigation
- **Billing Page**: "Enable Billing" button with local state
- **Integrations Page**: "Connect Stripe" button that simulates failure on first click, then succeeds on retry

### Running the Demo

```bash
# Install dependencies
pnpm install

# Build the SDK
cd packages/react-quest
pnpm build

# Run the playground
cd ../playground
pnpm dev
```

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
- **No External Dependencies**: Core SDK only depends on React
- **Refs-Based**: Uses React refs for element access (no CSS selectors)
- **Memory-Only**: No persistence beyond runtime
- **Rule-Based Agent**: Simple pattern matching (placeholder for future LLM)

## Future Enhancements

- Replace rule-based agent with real LLM integration
- Add persistence layer for state/events
- Add analytics dashboard
- Add authentication
- Add backend API for agent processing
