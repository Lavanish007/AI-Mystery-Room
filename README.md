# AI Mystery Room 🔍🕵️‍♂️

An AI-powered web application where users generate and solve rich, evidence-based fictional mysteries using Google Gemini.

---

## 🌟 Overview

AI Mystery Room turns any short premise or storyline into a fully coherent, playable, evidence-grounded investigation. Players inspect suspect profiles, review WhatsApp-style chat transcripts, analyze forensic reports and CCTV summaries, track timelines, request progressive hints, and submit their final deduction to reveal the truth.

### Key Features
- **Generative Mystery Engine:** Powered by Google Gemini with structured JSON output, schema validation, and automatic cross-consistency checks.
- **Fair Deductive Gameplay:** Every mystery has exactly one canonical culprit, grounded by consistent clues, alibis, and verifiable timeline evidence.
- **Progressive Hint System:** Up to three progressive tiers of assistance (nudge, moderate lead, key observation) without spoiling the culprit.
- **Strict Answer Secrecy:** Pre-answer public APIs strictly redact the culprit ID, canonical solution, and misleading red-herring flags.
- **Responsive Detective Board:** Sleek dark-mode crime board UI with suspect dossiers, evidence inspection drawers, and interactive timeline reconstruction.

---

## 🏗️ Repository Layout (Monorepo)

```
ai-mystery-room/
├── docs/
│   ├── SPEC.md         # Product specification and source of truth
│   └── DECISIONS.md    # Architecture decision log
├── shared/             # Domain schemas (Zod), TypeScript types, and fixtures
│   ├── src/
│   │   ├── schemas/    # Case, suspect, evidence, submission schemas
│   │   ├── types/      # Public DTOs and internal case types
│   │   └── fixtures/   # Deterministic playable fixture cases
├── server/             # Node.js + Express backend service
│   ├── src/
│   │   ├── ai/         # Gemini provider adapter and prompt contracts
│   │   ├── controllers/# API route controllers
│   │   ├── services/   # Case generation, scoring, and hint logic
│   │   ├── models/     # MongoDB persistence models
│   │   └── middleware/ # Validation, error handling, rate limiting
├── client/             # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/ # Detective board, cards, modals, timeline
│   │   ├── features/   # Case creation, investigation, solving
│   │   └── services/   # Client API consumer
├── .env.example        # Environment variable template
└── package.json        # Monorepo workspaces configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection string
- **Gemini API Key**: From Google AI Studio

### Installation

1. Clone the repository and navigate into the workspace:
   ```bash
   cd "ai room ins"
   ```

2. Install dependencies across all workspaces:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your GEMINI_API_KEY and MONGODB_URI
   ```

### Running Locally

- **Run Server:**
  ```bash
  npm run dev:server
  ```
- **Run Client:**
  ```bash
  npm run dev:client
  ```
- **Run Tests:**
  ```bash
  npm test
  ```
- **Run Typecheck:**
  ```bash
  npm run typecheck
  ```

---

## 🔒 Security & AI Safety
- Fictional content disclaimer clearly displayed across all evidence.
- Gemini API keys and canonical case solutions remain strictly server-side.
- Prompt injection boundary isolates user-provided premises from system prompt directives.
- Rate limiting and payload size restrictions prevent generation abuse.

---

## 📄 License & Specification
Refer to [docs/SPEC.md](file:///docs/SPEC.md) for full product specifications, acceptance criteria, and API contracts.
