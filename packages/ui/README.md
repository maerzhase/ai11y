# @ui4ai/ui

Primitive UI components built with Tailwind CSS and Base UI.

A semantic UI context layer for AI agents.

## Installation

```bash
pnpm add @ui4ai/ui
```

## Usage

Import the CSS file in your application's entry point:

```tsx
import "@ui4ai/ui/styles.css";
import { AssistPanel } from "@ui4ai/ui";
```

## Components

### AssistPanel

A primitive chat panel component that accepts props for state and callbacks.

```tsx
import { AssistPanel } from "@ui4ai/ui";

<AssistPanel
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  onSubmit={async (message) => {
    // Handle message submission
    return { reply: "Response", toolCalls: [] };
  }}
  onToolCall={(toolCall) => {
    // Handle tool calls
  }}
/>
```

## Styling

This package uses Tailwind CSS. Make sure to import the CSS file:

```tsx
import "@ui4ai/ui/styles.css";
```

The CSS is processed and minified during build, containing only the Tailwind utilities used by the components.
