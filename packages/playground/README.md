# Playground - React Quest Demo App

This is a demo application showcasing the React Quest AI Assistant SDK.

## Setup

### 1. Install Dependencies

```bash
# From the monorepo root
pnpm install

# Install OpenAI package (optional, for LLM support)
pnpm add openai
```

### 2. Configure Environment Variables (Optional - for LLM)

To enable the LLM agent with OpenAI:

1. Create a `.env` file in this directory (`packages/playground/.env`):

```bash
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

2. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. The app will automatically use the LLM agent if the environment variable is set, otherwise it falls back to the rule-based agent.

**Important:** 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser

### 3. Build the SDK

```bash
# From packages/react-quest
cd ../react-quest
pnpm build
```

### 4. Run the Playground

```bash
# From packages/playground
cd ../playground
pnpm dev
```

The app will open at `http://localhost:5173` (or the port Vite assigns).

## Features Demonstrated

- **Navigation**: Ask the assistant to navigate between pages
- **Button Clicks**: Ask the assistant to click buttons
- **Error Handling**: Trigger an error in the Integrations page and see the assistant help recover
- **LLM Agent**: If configured, uses OpenAI GPT for natural language understanding
- **Rule-Based Fallback**: Works without LLM using pattern matching

## Try It Out

1. Open the assistant panel (bottom-right button)
2. Try commands like:
   - "Take me to billing"
   - "Click enable billing"
   - "Go to integrations"
   - "Connect stripe" (will fail first time, then ask to retry)

