# Clarity — PM Writing Coach

A macOS desktop app that helps product managers write better documents. Clarity provides structured templates, real-time coaching nudges, and AI-powered feedback so you ship clearer PRDs, one-pagers, launch briefs, competitive analyses, strategy docs, and retrospectives.

## Features

- **6 PM templates** — PRD, One-Pager, Launch Brief, Competitive Analysis, Strategy Doc, Retrospective
- **Structural guidance** — ghost paragraphs show what a well-structured section looks like
- **Dimension tracking** — progress dots show which key areas you've covered
- **AI ghost text** — contextual next-sentence suggestions (Tab to accept)
- **Clarity Check** — AI-powered writing feedback per section
- **Auto-install local AI** — select "Local Model" and Clarity downloads and runs everything automatically (Electron only)
- **Claude API option** — optional Anthropic API key for premium quality
- **Readability scoring** — Flesch-Kincaid grade level in real time
- **Rule-based coaching** — nudges for common PM writing mistakes
- **Multi-format export** — Markdown, PDF, and Word (.docx)
- **Document library** — auto-saved locally via localStorage, documents persist across sessions

## Download

Download the latest `.dmg` from [GitHub Releases](../../releases).

### macOS Unsigned App Notice

Clarity is not yet code-signed. On first launch:

1. Right-click the app in Applications
2. Select **Open**
3. Click **Open** in the dialog

You only need to do this once.

## Run in Web Mode (Browser)

You can run Clarity entirely in the browser — no Electron or desktop install required. All documents are stored locally in your browser's `localStorage` and persist across sessions.

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm 10+

### Quick Start

```bash
cd clarity
npm install
npm run dev
```

Opens at **http://127.0.0.1:5181**

### Local Storage

- All documents, settings, and AI preferences are saved in `localStorage`
- Data persists across page reloads and browser restarts
- Documents auto-save every 10 seconds while editing
- No server or database required — everything runs client-side

### AI Setup (Web Mode)

In web mode, you have two options for AI features:

**Option A: Local Model via Ollama (Free)**

1. Install [Ollama](https://ollama.com) or run `brew install ollama`
2. Pull a model: `ollama pull llama3.2:3b`
3. Start Ollama (it runs in your menu bar)
4. In Clarity Settings, select **Local Model**

**Option B: Claude API (Best Quality)**

1. Get an API key from [Anthropic](https://console.anthropic.com)
2. In Clarity Settings, select **Claude API** and enter your key

You can also use Clarity without any AI — templates, structure guides, and coaching nudges still work.

## Build from Source

### Desktop Development (Electron + Hot Reload)

```bash
npm install
npm run electron:dev
```

Launches Electron pointing at Vite's dev server with hot reload. In Electron mode, selecting "Local Model" in Settings auto-downloads and configures Ollama — no manual install needed.

### Build macOS .dmg

```bash
npm run electron:build
```

Output: `release/Clarity-{version}-universal.dmg`

## AI Setup (Desktop App)

### Local Model (Auto-Install)

In the desktop app (Electron), Clarity handles everything automatically:

1. Open Settings and select **Local Model**
2. Click **Save**
3. Clarity downloads the Ollama engine (~80 MB), starts it, and pulls the default model (~2 GB)
4. Progress bars show each step — no terminal commands needed
5. On subsequent launches, the server starts silently in the background

All AI processing runs locally on your machine. Nothing is sent to any server.

### Claude API

1. Get an API key from [Anthropic](https://console.anthropic.com)
2. In Settings, select **Claude API** and enter your key

## Architecture

- **React 19** + **Vite 7** + **Tailwind CSS v4**
- **Electron** — macOS desktop shell with auto-managed Ollama lifecycle
- All data stored locally (`localStorage`) — documents persist across sessions
- AI features powered by **Ollama** (local, auto-installed in Electron) or **Anthropic Claude API** (cloud) — your choice
- Fonts bundled locally (DM Sans + Lora) — works offline

## License

MIT
