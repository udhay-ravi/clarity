# Clarity — PM Writing Coach

A macOS desktop app that helps product managers write better documents. Clarity provides structured templates, real-time coaching nudges, and AI-powered feedback so you ship clearer PRDs, one-pagers, launch briefs, competitive analyses, strategy docs, and retrospectives.

## Features

- **6 PM templates** — PRD, One-Pager, Launch Brief, Competitive Analysis, Strategy Doc, Retrospective
- **Structural guidance** — ghost paragraphs show what a well-structured section looks like
- **Dimension tracking** — progress dots show which key areas you've covered
- **AI ghost text** — contextual next-sentence suggestions (Tab to accept)
- **Clarity Check** — AI-powered writing feedback per section
- **Readability scoring** — Flesch-Kincaid grade level in real time
- **Rule-based coaching** — nudges for common PM writing mistakes
- **Multi-format export** — Markdown, PDF, and Word (.docx)
- **Document library** — auto-saved locally, manage multiple docs

## Download

Download the latest `.dmg` from [GitHub Releases](../../releases).

### macOS Unsigned App Notice

Clarity is not yet code-signed. On first launch:

1. Right-click the app in Applications
2. Select **Open**
3. Click **Open** in the dialog

You only need to do this once.

## Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm 10+

### Install Dependencies

```bash
npm install
```

### Desktop Development (Electron + Hot Reload)

```bash
npm run electron:dev
```

Launches Electron pointing at Vite's dev server with hot reload.

### Build macOS .dmg

```bash
npm run electron:build
```

Output: `release/Clarity-{version}-universal.dmg`

### Web Development (Browser Only)

```bash
npm run dev
```

Opens at http://127.0.0.1:5181

## Architecture

- **React 19** + **Vite 7** + **Tailwind CSS v4**
- **Electron** — macOS desktop shell
- All data stored locally (localStorage)
- AI features use the **Anthropic Claude API** (requires your own API key)
- Fonts bundled locally (DM Sans + Lora) — works offline

## License

MIT
