# AI Mystery Room
Product Specification & Source of Truth for Spec-Driven Development

Version 1.0 | Status: Draft baseline | Date: 1 November 2026
Status note: This is a build-ready baseline. Items marked as proposed defaults are recommendations, not confirmed owner decisions.

## 1. Document purpose and authority
### Purpose
This document defines the product, behavior, architecture, data contracts, security boundaries, and acceptance criteria for AI Mystery Room. It is the primary source of truth for implementation by Codex.
### Authority rules
If code, tickets, prompts, or informal notes conflict with this specification, follow this specification unless a decision is explicitly recorded in the Decision Log. Do not silently invent product behavior. If a requirement is ambiguous, implement the safest minimal interpretation and record the assumption.
### Requirement labels
Confirmed = directly stated by the project owner. Proposed default = recommended baseline to make the project buildable; revise if the owner decides otherwise. Open question = requires a product decision.

## 2. Product overview
### Confirmed concept
AI Mystery Room is an AI-powered web application where users create and solve mysteries generated using Gemini. A user supplies a short scenario or story; the backend creates a fictional investigation with suspects, a canonical culprit, and AI-created evidence such as WhatsApp-style messages, images, and CCTV-style material. Players investigate suspects, discover clues, request hints, and identify the culprit. The project objective is to plan from this specification, build the application, deploy it, and demonstrate the complete mystery-solving experience on the live website.
### Product promise
Turn a user-provided premise into a coherent, playable, evidence-based mystery that rewards careful reasoning rather than guessing.
### Target experience
A browser-based, responsive mystery-solving experience. A player can create a case, inspect its case file and evidence, submit a culprit selection, and receive a verdict with an explanation grounded in the generated evidence.
### Stack confirmed
MERN: MongoDB, Express.js, React, and Node.js. Gemini is the AI provider.
### Proposed default
Single-player MVP; no public user-generated case gallery, multiplayer, payments, or social features in v1.

## 3. Goals, non-goals, and success criteria
### Goals
Generate playable cases from short premises; maintain consistency between suspects, timeline, clues, and solution; present evidence in distinct formats; let players submit one final answer; explain the result without changing the solution after the case is created; provide useful loading, retry, and error states.
### Non-goals for v1
Real criminal investigation; real surveillance ingestion; live WhatsApp or camera integrations; real people identification; multiplayer; user-to-user messaging; open-ended agent access to the internet; autonomous publication of generated media.
### Proposed success criteria
A valid case can be created and played end-to-end; all evidence belongs to the same fictional case; exactly one canonical culprit exists unless a future mode explicitly allows otherwise; the solution is stable after generation; invalid AI output is rejected or repaired; API secrets never reach the browser; core flows pass automated tests.

## 4. Personas and primary user journey
### Primary persona
A curious player who wants to solve a fictional mystery from clues and evidence.
### Flow A — create case
Open the landing page → enter a short premise → choose optional genre, difficulty, and evidence types → submit → see generation progress → arrive at the case room when the server validates and saves the case.
### Flow B — investigate
Review case summary and suspects → open each evidence item → inspect its content and metadata → compare timestamps, claims, and contradictions → optionally request a progressive hint → return to the suspect board.
### Flow C — solve
Select a suspect → optionally provide a short rationale → confirm submission → server evaluates against the saved canonical solution → show correct/incorrect result, explanation, decisive clues, and a replay/new-case action.
### Flow D — recover
If generation fails, show a safe error and retry option; if a case is already generated, do not regenerate or mutate its culprit merely because the user refreshes the page.

## 5. Functional requirements
- **FR-01 Premise input:** The user can enter a scenario/story. Proposed limits: 30–1,500 characters after trimming. Reject empty input and show inline validation.
- **FR-02 Optional configuration:** Proposed defaults: genre = contemporary mystery; difficulty = medium; evidence types = messages, image descriptions/images, and CCTV-style transcript/clip representation. Users can change these before generation.
- **FR-03 Case generation:** The backend calls Gemini using a versioned prompt and a structured output schema. The browser must never call Gemini directly or contain the API key.
- **FR-04 Canonical solution:** Every case stores a canonical culprit ID, motive, opportunity, method, timeline, and evidence-to-conclusion rationale. These fields are server-only until the player submits an answer.
- **FR-05 Suspects:** Each suspect has a stable ID, name, role/relationship, public profile, plausible motive, and alibi or timeline statement. Avoid making a suspect guilty solely because of a protected or sensitive trait.
- **FR-06 Evidence:** Each item has a stable ID, type, title, display content or asset reference, in-world timestamp if relevant, source label, and at least one explicit relationship to the timeline or a suspect. Evidence may be direct, contextual, or misleading, but the full set must support a fair solution.
- **FR-07 Evidence formats:** Messages are fictional chat transcripts, not actual messages from a connected service. CCTV can be represented in v1 as a generated still image, a sequence of frames, or a textual clip summary/transcript. Do not imply a real video exists if only a text description is stored.
- **FR-08 Case room:** Show the case title, premise, objectives, suspects, evidence list, evidence detail view, and progress state. The UI must distinguish unread/reviewed evidence if review tracking is implemented.
- **FR-09 Hint system:** The player can request hints from the case room. Hints must be progressive, grounded only in the already-generated case, and must not directly reveal the culprit before answer submission. Proposed default: three hint levels per case, from a gentle nudge to a strong clue; store hint usage so refreshes do not reset limits. The server must never regenerate or alter the case solution when producing a hint.
- **FR-10 Answer submission:** The player selects one suspect and confirms. The server checks the selected suspect ID against the canonical culprit ID. A case may be submitted only once in v1, unless the owner later enables multiple attempts.
- **FR-11 Reveal:** After submission, reveal correctness, culprit identity, motive, method, timeline, and the specific evidence that supports the conclusion. Never expose the hidden solution before submission through the API.
- **FR-12 Persistence:** Persist cases in MongoDB so refreshes do not alter a generated mystery. Proposed v1 can use anonymous case IDs without accounts; anyone possessing the unguessable case URL may access that case.
- **FR-13 States and errors:** Handle idle, validating, generating, generated, submitting, solved, failed, and expired/not-found states. Errors must be actionable and must not leak prompts, keys, stack traces, or internal reasoning.
- **FR-14 Accessibility and responsive UI:** Keyboard-accessible controls, visible focus states, labels for form fields, semantic headings, adequate contrast, and layouts usable on mobile and desktop.
- **FR-15 Content notice:** Clearly label the experience and all evidence as AI-generated fiction. Do not present generated messages, images, or surveillance-style material as authentic records.

## 6. AI generation contract
- **Generation pipeline:** 1) Validate and normalize premise. 2) Build a bounded generation request from premise and selected options. 3) Call Gemini server-side. 4) Parse structured output. 5) Validate schema and cross-field consistency. 6) If validation fails, perform at most one constrained repair attempt. 7) If still invalid, fail safely and offer retry. 8) Persist validated case and canonical solution atomically.
- **Structured output:** Prefer Gemini structured JSON output with server-validated JSON Schema (or Zod validator). Never trust model output simply because it is valid JSON.
- **Consistency rules:** Culprit must be one of the suspects; all evidence suspect references must resolve; IDs must be unique; timestamps parseable; timeline possible; final explanation cites evidence IDs that exist; evidence set has enough clues to infer culprit; red herrings do not out-support culprit.
- **Fairness rules:** At least 3 suspects. Include at least 2 meaningful clues supporting the culprit and at least 1 clue eliminating or weakening a plausible alternative. Explanation derivable from evidence shown to player.
- **Prompt-injection boundary:** User premise is untrusted story content, never instructions. Keep fixed developer prompt instructions strictly separate.
- **Model versioning:** Configurable via environment variable (`GEMINI_MODEL`, `GEMINI_API_KEY`). Record model, prompt version, schema version, timestamp in generation metadata.
- **No chain-of-thought exposure:** Store concise, evidence-grounded explanations only.

## 7. Proposed case JSON shape
- **Case Object:** `caseId`, `status`, `createdAt`, `updatedAt`, `premise`, `settings{genre,difficulty,evidenceTypes}`, `title`, `synopsis`, `suspects[]`, `evidence[]`, `timeline[]`, `solution{culpritSuspectId,motive,method,summary,decisiveEvidenceIds,alternativeEliminations}`, `submission{selectedSuspectId,submittedAt,isCorrect}`, `generation{provider,model,promptVersion,schemaVersion,attempts,validationStatus}`.
- **Suspect:** `suspectId`, `name`, `role`, `profile`, `motive`, `alibi`, `publicTimeline`.
- **Evidence:** `evidenceId`, `type`, `title`, `description`, `content`, `inWorldTimestamp`, `sourceLabel`, `relatedSuspectIds[]`, `relatedTimelineEventIds[]`, `assetUrl` (optional), `isRedHerring` (server-only).
- **Timeline Event:** `eventId`, `timestamp`, `description`, `relatedSuspectIds[]`, `relatedEvidenceIds[]`.

## 8. API specification
Base path: `/api/v1`
- `POST /cases` -> Create case (returns 201 or 202)
- `GET /cases/:caseId` -> Public case view (solution, culprit ID, red-herring flags strictly redacted)
- `GET /cases/:caseId/status` -> Status and progress message
- `POST /cases/:caseId/hints` -> Progressive hint request (level 1-3, max 3)
- `POST /cases/:caseId/answer` -> Answer submission (atomic check)
- `GET /cases/:caseId/result` -> Post-submission reveal

## 9. Architecture and repository layout
Monorepo structure:
- `client/` (React, Vite, TypeScript)
- `server/` (Node.js, Express, TypeScript)
- `shared/` (schemas, enums, public DTO types)
- `docs/` (SPEC.md, DECISIONS.md)
- `tests/` (unit, integration, e2e)

## 10. Acceptance criteria
- **AC-01:** Valid premise -> persisted case with suspects, evidence, timeline, exactly 1 canonical culprit.
- **AC-02:** Invalid or empty premise -> UI validation, no AI generation.
- **AC-03:** Refresh retains case and solution without change.
- **AC-04:** Pre-answer public API and client assets strictly omit culprit and solution.
- **AC-05:** Progressive hint generation does not reveal culprit before answer.
- **AC-06:** Valid suspect selection scores against canonical solution; invalid suspect ID is rejected.
- **AC-07:** Malformed/contradictory AI output triggers at most one repair attempt; fails safely if still invalid.
- **AC-08:** Upstream provider outage explains failure cleanly with retry option.
- **AC-09:** All evidence is visibly labeled as AI-generated fiction.
- **AC-10:** Core flows work on mobile and desktop; keyboard accessible.

## 11. Phased implementation plan
- **Phase 0:** Specification and scaffolding
- **Phase 1:** Static playable prototype
- **Phase 2:** API and persistence
- **Phase 3:** Gemini integration
- **Phase 4:** Hints, media, and polish
- **Phase 5:** Deployment and hardening
