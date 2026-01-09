# Playground - ui4ai Demo App

This is a demo application showcasing ui4ai - a semantic UI context layer for AI agents.

## Setup

This monorepo uses [Turborepo](https://turbo.build/repo) for managing builds and dev scripts.

### Quick Start

```bash
# From the monorepo root
pnpm install

# Set up server with API key (optional, for LLM support)
# Create apps/server/.env with your OpenAI API key
echo "OPENAI_API_KEY=your-api-key-here" > apps/server/.env

# Optionally configure playground endpoint (defaults to http://localhost:3000/ui4ai/agent)
echo "VITE_UI4AI_API_ENDPOINT=http://localhost:3000/ui4ai/agent" > apps/playground/.env

# Run everything (builds packages, starts server + playground)
pnpm dev
```

This will:
- Build ui4ai packages
- Start the server on `http://localhost:3000` (if `OPENAI_API_KEY` is set in `apps/server/.env`)
- Start the playground on `http://localhost:5173`
- The playground will automatically connect to the server endpoint

### Manual Setup (if needed)

If you want to run things separately:

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up the server (optional - for LLM):**
   Create a `.env` file in `apps/server/`:
   ```bash
   OPENAI_API_KEY=your-api-key-here
   ```
   Then run:
   ```bash
   pnpm --filter ui4ai-server-app dev
   ```

3. **Configure playground (optional - for LLM):**
   Create a `.env` file in this directory:
   ```bash
   VITE_UI4AI_API_ENDPOINT=http://localhost:3000/ui4ai/agent
   ```

4. **Run the playground:**
   ```bash
   pnpm --filter ui4ai-playground dev
   ```

**Important:** 
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser
- If the API endpoint is not set, the app will use the rule-based agent (no server needed)

## Features Demonstrated

- **Navigation**: Ask the agent to navigate between pages
- **Button Clicks**: Ask the agent to click buttons
- **Error Handling**: Trigger an error in the Integrations page and see the agent help recover
- **LLM Agent**: If configured, uses LLM for natural language understanding
- **Rule-Based Fallback**: Works without LLM using pattern matching

## Try It Out

1. Open the agent panel (bottom-right button)
2. Try commands like:
   - "Take me to billing"
   - "Click enable billing"
   - "Go to integrations"
   - "Connect stripe" (will fail first time, then ask to retry)
