# UI Package

Primitive UI components built with Tailwind CSS and Base UI.

## Installation

```bash
pnpm add @quest/ui
```

## Usage

Import the CSS file in your application's entry point:

```tsx
import "@quest/ui/styles.css";
import { AssistPanel } from "@quest/ui";
```

## Components

### AssistPanel

A primitive chat panel component that accepts props for state and callbacks.

```tsx
import { AssistPanel } from "ui";

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
import "ui/styles.css";
```

The CSS is processed and minified during build, containing only the Tailwind utilities used by the components.

