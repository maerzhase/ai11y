# ui4ai Server App

Example server application using the `@ui4ai/server` package.

A semantic UI context layer for AI agents.

## Setup

```bash
# Install dependencies (from monorepo root)
pnpm install
```

## Running

### Option 1: Using .env file (Recommended)

1. Create a `.env` file in this directory:
```bash
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

2. Run the server:
```bash
pnpm dev
```

### Option 2: Using environment variables

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here

# Run in development mode
pnpm dev

# Or from monorepo root
pnpm --filter ui4ai-server-app dev
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` env var) with the following endpoints:
- `POST /ui4ai/agent` - Main agent endpoint
- `GET /ui4ai/health` - Health check endpoint

**CORS:** The server has CORS enabled to allow requests from localhost origins (for development). In production, you should configure specific allowed origins.

## Environment Variables

The server automatically loads environment variables from a `.env` file in this directory.

### Provider Configuration

**LLM Provider** (defaults to `openai`):
- `LLM_PROVIDER` - Provider to use: `openai`, `anthropic`, `google`, or `custom`

**OpenAI** (default):
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `LLM_MODEL` (optional) - Model to use (defaults to `gpt-4o-mini`)
- `LLM_BASE_URL` or `OPENAI_BASE_URL` (optional) - Custom base URL

**Anthropic**:
- `ANTHROPIC_API_KEY` (required) - Your Anthropic API key
- `LLM_MODEL` (optional) - Model to use (defaults to `claude-3-haiku-20240307`)
- `LLM_BASE_URL` (optional) - Custom base URL

**Google**:
- `GOOGLE_API_KEY` (required) - Your Google API key
- `LLM_MODEL` (optional) - Model to use (defaults to `gemini-pro`)
- `LLM_BASE_URL` (optional) - Custom base URL

**Custom** (OpenAI-compatible APIs):
- `CUSTOM_API_KEY` or `OPENAI_API_KEY` (required) - Your API key
- `LLM_MODEL` (required) - Model name
- `LLM_BASE_URL` (required) - Base URL for the API

**General**:
- `LLM_TEMPERATURE` (optional) - Temperature for responses (defaults to `0.7`)
- `PORT` (optional) - Server port (defaults to `3000`)

### Example Configurations

**OpenAI:**
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
```

**Anthropic:**
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-3-haiku-20240307
```

**Google:**
```bash
LLM_PROVIDER=google
GOOGLE_API_KEY=...
LLM_MODEL=gemini-pro
```

**Custom (e.g., local LLM):**
```bash
LLM_PROVIDER=custom
OPENAI_API_KEY=not-needed
LLM_MODEL=llama-2
LLM_BASE_URL=http://localhost:11434/v1
```
