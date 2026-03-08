# Clarity — PM Writing Coach

A writing coach for product managers that runs in your browser. Clarity provides 11 structured templates, real-time coaching, and AI-powered ghost text so you ship clearer PRDs, PRFAQs, one-pagers, pricing proposals, and more.

> **Other AI tools write for you. Clarity makes you think.**

## Quick Start

```bash
git clone https://github.com/udhay-ravi/clarity.git
cd clarity
npm install
npm run dev
```

Opens at **http://127.0.0.1:5181**. No account needed. All data stays in your browser.

### Requirements

- [Node.js](https://nodejs.org/) 20+
- npm 10+

## Features

- **11 PM templates** — PRD, PRFAQ, One-Pager, Product Pitch, Pricing Proposal, Packaging Recommendation, Product One-Pager, Launch Brief, Competitive Analysis, Strategy Doc, Retrospective
- **Q + R ghost text** — AI asks a thinking question (Q) then suggests a sentence (R). Press Tab to accept the recommendation.
- **Structural guidance** — ghost paragraphs show what a well-structured section looks like
- **Dimension tracking** — progress dots show which key areas you've covered in each section
- **Clarity Check** — AI-powered writing feedback per section
- **Readability scoring** — Flesch-Kincaid grade level in real time
- **Rule-based coaching** — sidebar nudges for common PM writing mistakes
- **Multi-format export** — Markdown, PDF, and Word (.docx)
- **Document library** — auto-saved locally via localStorage, documents persist across sessions
- **Product landing page** — branded home page with feature overview

## How It Works

1. Type what you want to write (e.g. "PRFAQ", "pricing proposal", "PRD")
2. Clarity detects the template and sets up structured sections with preface fields
3. As you write, ghost text appears below your cursor:
   - **Q:** A question to challenge your thinking
   - **R:** A recommended next sentence (press **Tab** to accept)
4. Progress dots track which structural elements you've covered
5. Click **Clarity Check** on any section for AI-powered feedback

## AI Setup (Optional)

Clarity works without AI — templates, structure guides, and coaching nudges are fully functional offline. To enable AI ghost text and Clarity Check:

### Option A: Local Model via Ollama (Free & Private)

1. Install [Ollama](https://ollama.com) or run `brew install ollama`
2. Pull a model: `ollama pull llama3.2:3b`
3. Start Ollama (it runs in your menu bar)
4. In Clarity, click the Settings gear icon and select **Local Model**

### Option B: Claude API (Best Quality)

1. Get an API key from [Anthropic Console](https://console.anthropic.com)
2. In Clarity Settings, select **Claude API** and enter your key

## Local Storage

- All documents, settings, and AI preferences are saved in `localStorage`
- Data persists across page reloads and browser restarts
- Documents auto-save every 10 seconds while editing
- No server or database required — everything runs client-side

## Desktop App (macOS)

Clarity also ships as a native macOS app via Electron with automatic Ollama management.

### Development

```bash
npm install
npm run electron:dev
```

### Build .dmg

```bash
npm run electron:build
```

Output: `release/Clarity-{version}-universal.dmg`

In Electron mode, selecting "Local Model" in Settings auto-downloads and configures Ollama — no manual install needed.

### macOS Unsigned App Notice

Clarity is not yet code-signed. On first launch, right-click the app → **Open** → click **Open** in the dialog.

## Architecture

- **React 19** + **Vite 7** + **Tailwind CSS v4**
- **Electron** (optional) — macOS desktop shell with auto-managed Ollama lifecycle
- All data stored locally (`localStorage`) — no server required
- AI powered by **Ollama** (local) or **Anthropic Claude API** (cloud) — your choice
- Fonts bundled locally (DM Sans + Lora) — works offline

## License

MIT
