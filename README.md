<p align="center">
  <img src="./opm-logo.svg" alt="OPM" width="280" />
</p>

<p align="center">A customized AI coding agent — forked from OpenCode.</p>

---

> **Disclaimer:** OPM is an independent fork of [OpenCode](https://github.com/anomalyco/opencode) and is **not affiliated with, endorsed by, or built by the OpenCode team**. All customizations and modifications in this repository are maintained independently.

OPM is a customized AI coding agent built on top of OpenCode — an open-source AI coding agent. This fork adds custom agents, modified UI, and project-specific configurations tailored for internal use.

---

## What's Different from OpenCode

| Feature | OpenCode | OPM |
|---------|----------|-----|
| Logo | OPENCODE ASCII | OPM ASCII (green & white) |
| Security Agent | — | Built-in `@security` subagent |
| Custom Config | — | Project-specific `.opencode/agent/` |

---

## Getting Started

### Requirements

- [Bun](https://bun.sh) 1.3+
- Node.js 18+

### Install Dependencies

```bash
bun install
```

### Development

```bash
# Run dev (standard)
bun dev

# Run dev with auto-restart on file changes
bun dev:watch
```

By default, `bun dev` runs OPM in the `packages/opencode` directory. To run against a different directory:

```bash
bun dev <directory>

# Run against current repo root
bun dev .
```

### Build Standalone Binary

```bash
./packages/opencode/script/build.ts --single
```

Output binary:

```
./packages/opencode/dist/opencode-<platform>/bin/opencode
```

Replace `<platform>` with your platform, e.g. `darwin-arm64` or `linux-x64`.

---

## Custom Agents

OPM ships with custom subagents under `.opencode/agent/`. Invoke them with `@agent-name` in the prompt.

| Agent | Mode | Description |
|-------|------|-------------|
| `@security` | subagent | Security review agent — audits git diff for vulnerabilities (OWASP Top 10, injection, auth, XSS, SSRF, and more) |

### Adding a Custom Agent

Create a Markdown file in `.opencode/agent/`:

```
.opencode/
└── agent/
    └── my-agent.md
```

```markdown
---
mode: subagent
description: "When to use this agent"
model: opencode/claude-sonnet-4-6
color: "#22c55e"
permission:
  "*": deny
  read: allow
---

Your agent's system prompt goes here.
```

See [OpenCode agent docs](https://opencode.ai/docs/agents) for all available frontmatter options.

---

## Project Structure

```
packages/
├── opencode/       # Core business logic & CLI server
├── tui/            # Terminal UI (SolidJS + opentui)
├── core/           # Shared services (session, auth, credential)
├── llm/            # LLM provider abstraction layer
├── server/         # HTTP server & REST API
├── sdk/            # TypeScript client SDK
└── app/            # Shared web UI components
```

---

## AI Provider Setup

OPM connects directly to AI provider APIs. No separate AI server is needed.

**Supported providers:** Anthropic, OpenAI, Google Gemini, Amazon Bedrock, Azure OpenAI, Cloudflare, xAI, OpenRouter, and any OpenAI-compatible endpoint.

Set your API key via the UI on first run, or use environment variables:

```bash
ANTHROPIC_API_KEY=your_key bun dev
OPENAI_API_KEY=your_key bun dev
```

If you have an [opencode.ai/go](https://opencode.ai/go) subscription, log in once and your provider credentials will be loaded automatically.

---

## Running the HTTP Server Standalone

OPM exposes a REST API that can be called from any external project:

```bash
# Start server on a specific port
bun run --cwd packages/opencode --conditions=browser src/index.ts serve --port 4096
```

The server URL and credentials are saved to `~/.local/state/opencode/server.json`. API documentation is available at `http://localhost:<port>/openapi.json`.

---

## License

OPM is released under the [MIT License](./LICENSE).

This project is based on [OpenCode](https://github.com/anomalyco/opencode), copyright © 2025 opencode, also licensed under MIT. The original copyright notice is preserved as required by the license terms.
