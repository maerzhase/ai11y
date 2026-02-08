# @ai11y/core

Framework-agnostic core. Your app exposes UI via markers (elements with
`data-ai-id`, `data-ai-label`, optional `data-ai-intent`). The API is **describe
→ plan → act**.

## API

- **`createClient(options?)`** — Returns
  `{ describe, act, track, reportError }`. Options:
  `onNavigate?: (route: string) => void`.
- **`describe()`** — Returns `Ai11yContext`: markers, route, state, optional
  error. Scans the DOM for marked elements and which are in view.
- **`act(instruction)`** — Executes one instruction: click, navigate, highlight,
  scroll, or fillInput.
- **`plan(ui, input, config?, messages?)`** — Runs the agent (LLM or rule-based)
  and returns `Promise<{ reply, instructions }>`.

**JavaScript example:**

```ts
import { createClient, plan } from "@ai11y/core";

const client = createClient({
  onNavigate: (route) => window.history.pushState({}, "", route),
});

const ui = client.describe();
const { reply, instructions } = await plan(ui, "click the save button");
for (const instruction of instructions ?? []) {
  client.act(instruction);
}
```

Types (`Ai11yContext`, `Instruction`, `AgentResponse`, etc.) and DOM helpers
(`clickMarker`, `highlightMarker`, `navigateToRoute`, etc.) are exported from
the main entry. See generated docs for full reference.

## Structure

```
src/
├── agent/         # plan(), adapter, LLM + rule-based agents
├── dom-actions/  # click, highlight, navigate, scroll, fillInput
├── client-api.ts # createClient, Ai11yClient
├── context.ts    # Ai11yContext, Ai11yState, Ai11yError
├── dom.ts        # getContext(), viewport visibility
├── marker.ts    # marker extraction from DOM
├── store.ts     # route, state, error, events
└── index.ts
```
