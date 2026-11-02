AI Mystery Room
Product Specification & Source of Truth for Spec-Driven Development

Version 1.0 | Status: Draft baseline | Date: 1 November 2026
Status note: This is a build-ready baseline. Items marked as proposed defaults are recommendations, not confirmed owner decisions.

1. Document purpose and authority
Purpose
This document defines the product, behavior, architecture, data contracts, security boundaries, and acceptance criteria for AI Mystery Room. It is the primary source of truth for implementation by Codex.
Authority rules
If code, tickets, prompts, or informal notes conflict with this specification, follow this specification unless a decision is explicitly recorded in the Decision Log. Do not silently invent product behavior. If a requirement is ambiguous, implement the safest minimal interpretation and record the assumption.
Requirement labels
Confirmed = directly stated by the project owner. Proposed default = recommended baseline to make the project buildable; revise if the owner decides otherwise. Open question = requires a product decision.
2. Product overview
Confirmed concept
AI Mystery Room is an AI-powered web application where users create and solve mysteries generated using Gemini. A user supplies a short scenario or story; the backend creates a fictional investigation with suspects, a canonical culprit, and AI-created evidence such as WhatsApp-style messages, images, and CCTV-style material. Players investigate suspects, discover clues, request hints, and identify the culprit. The project objective is to plan from this specification, build the application, deploy it, and demonstrate the complete mystery-solving experience on the live website.
Product promise
Turn a user-provided premise into a coherent, playable, evidence-based mystery that rewards careful reasoning rather than guessing.
Target experience
A browser-based, responsive mystery-solving experience. A player can create a case, inspect its case file and evidence, submit a culprit selection, and receive a verdict with an explanation grounded in the generated evidence.
Stack confirmed
MERN: MongoDB, Express.js, React, and Node.js. Gemini is the AI provider.
Proposed default
Single-player MVP; no public user-generated case gallery, multiplayer, payments, or social features in v1.
3. Goals, non-goals, and success criteria
Goals
Generate playable cases from short premises; maintain consistency between suspects, timeline, clues, and solution; present evidence in distinct formats; let players submit one final answer; explain the result without changing the solution after the case is created; provide useful loading, retry, and error states.
Non-goals for v1
Real criminal investigation; real surveillance ingestion; live WhatsApp or camera integrations; real people identification; multiplayer; user-to-user messaging; open-ended agent access to the internet; autonomous publication of generated media.
Proposed success criteria
A valid case can be created and played end-to-end; all evidence belongs to the same fictional case; exactly one canonical culprit exists unless a future mode explicitly allows otherwise; the solution is stable after generation; invalid AI output is rejected or repaired; API secrets never reach the browser; core flows pass automated tests.
4. Personas and primary user journey
Primary persona
A curious player who wants to solve a fictional mystery from clues and evidence.
Flow A — create case
Open the landing page → enter a short premise → choose optional genre, difficulty, and evidence types → submit → see generation progress → arrive at the case room when the server validates and saves the case.
Flow B — investigate
Review case summary and suspects → open each evidence item → inspect its content and metadata → compare timestamps, claims, and contradictions → optionally request a progressive hint → return to the suspect board.
Flow C — solve
Select a suspect → optionally provide a short rationale → confirm submission → server evaluates against the saved canonical solution → show correct/incorrect result, explanation, decisive clues, and a replay/new-case action.
Flow D — recover
If generation fails, show a safe error and retry option; if a case is already generated, do not regenerate or mutate its culprit merely because the user refreshes the page.
5. Functional requirements
FR-01 Premise input
The user can enter a scenario/story. Proposed limits: 30–1,500 characters after trimming. Reject empty input and show inline validation.
FR-02 Optional configuration
Proposed defaults: genre = contemporary mystery; difficulty = medium; evidence types = messages, image descriptions/images, and CCTV-style transcript/clip representation. Users can change these before generation.
FR-03 Case generation
The backend calls Gemini using a versioned prompt and a structured output schema. The browser must never call Gemini directly or contain the API key.
FR-04 Canonical solution
Every case stores a canonical culprit ID, motive, opportunity, method, timeline, and evidence-to-conclusion rationale. These fields are server-only until the player submits an answer.
FR-05 Suspects
Each suspect has a stable ID, name, role/relationship, public profile, plausible motive, and alibi or timeline statement. Avoid making a suspect guilty solely because of a protected or sensitive trait.
FR-06 Evidence
Each item has a stable ID, type, title, display content or asset reference, in-world timestamp if relevant, source label, and at least one explicit relationship to the timeline or a suspect. Evidence may be direct, contextual, or misleading, but the full set must support a fair solution.
FR-07 Evidence formats
Messages are fictional chat transcripts, not actual messages from a connected service. CCTV can be represented in v1 as a generated still image, a sequence of frames, or a textual clip summary/transcript. Do not imply a real video exists if only a text description is stored.
FR-08 Case room
Show the case title, premise, objectives, suspects, evidence list, evidence detail view, and progress state. The UI must distinguish unread/reviewed evidence if review tracking is implemented.
FR-09 Hint system
The player can request hints from the case room. Hints must be progressive, grounded only in the already-generated case, and must not directly reveal the culprit before answer submission. Proposed default: three hint levels per case, from a gentle nudge to a strong clue; store hint usage so refreshes do not reset limits. The server must never regenerate or alter the case solution when producing a hint.
FR-10 Answer submission
The player selects one suspect and confirms. The server checks the selected suspect ID against the canonical culprit ID. A case may be submitted only once in v1, unless the owner later enables multiple attempts.
FR-11 Reveal
After submission, reveal correctness, culprit identity, motive, method, timeline, and the specific evidence that supports the conclusion. Never expose the hidden solution before submission through the API.
FR-12 Persistence
Persist cases in MongoDB so refreshes do not alter a generated mystery. Proposed v1 can use anonymous case IDs without accounts; anyone possessing the unguessable case URL may access that case.
FR-13 States and errors
Handle idle, validating, generating, generated, submitting, solved, failed, and expired/not-found states. Errors must be actionable and must not leak prompts, keys, stack traces, or internal reasoning.
FR-14 Accessibility and responsive UI
Keyboard-accessible controls, visible focus states, labels for form fields, semantic headings, adequate contrast, and layouts usable on mobile and desktop.
FR-15 Content notice
Clearly label the experience and all evidence as AI-generated fiction. Do not present generated messages, images, or surveillance-style material as authentic records.
6. AI generation contract
Generation pipeline
1. Validate and normalize premise. 2) Build a bounded generation request from the premise and selected options. 3) Call Gemini server-side. 4) Parse structured output. 5) Validate schema and cross-field consistency. 6) If validation fails, perform at most one constrained repair attempt. 7) If still invalid, fail safely and offer retry. 8) Persist the validated case and canonical solution atomically.
Structured output
Prefer Gemini structured JSON output with a server-validated JSON Schema or equivalent runtime validator. Never trust model output simply because it is valid JSON.
Consistency rules
The culprit must be one of the suspects; all evidence suspect references must resolve; IDs must be unique; timestamps must be parseable; the timeline must be possible; the final explanation must cite evidence IDs that exist; the evidence set must contain enough clues to infer the culprit; red herrings must not make another suspect equally or more strongly supported.
Fairness rules
At least three suspects are recommended. Include at least two meaningful clues supporting the culprit and at least one clue that eliminates or weakens a plausible alternative. The final explanation must be derivable from evidence shown to the player. Do not use arbitrary hidden facts as the decisive reason.
Prompt-injection boundary
Treat the user premise as untrusted story content, not as instructions to change system behavior, reveal secrets, bypass validation, or request external actions. Keep fixed developer instructions separate from the user premise.
Model versioning
Record provider, model identifier, prompt version, schema version, generation timestamp, and validation outcome. Use environment configuration to select the Gemini model; do not hard-code a model name throughout the codebase.
Generated media
MVP may store evidence as text plus optional image assets. If image generation is not available through the selected Gemini capability, use a separate approved image-generation adapter or clearly labeled textual visual descriptions. Do not fabricate a playable video asset from a text-only response.
No chain-of-thought exposure
Store and display concise, evidence-grounded explanations only. Do not request, store, or expose private chain-of-thought; use structured rationale fields tied to visible clues.
7. Proposed case JSON shape
Case object
The implementation should define a validated TypeScript/Joi/Zod schema equivalent to the conceptual object below. Exact library choice is an implementation decision; keep one authoritative schema.
Fields
caseId, status, createdAt, updatedAt, premise, settings{genre,difficulty,evidenceTypes}, title, synopsis, suspects[], evidence[], timeline[], solution{culpritSuspectId,motive,method,summary,decisiveEvidenceIds,alternativeEliminations}, submission{selectedSuspectId,submittedAt,isCorrect} (submission is null until answered), generation{provider,model,promptVersion,schemaVersion,attempts,validationStatus}.
Suspect
suspectId, name, role, profile, motive, alibi, publicTimeline.
Evidence
evidenceId, type, title, description, content, inWorldTimestamp, sourceLabel, relatedSuspectIds[], relatedTimelineEventIds[], assetUrl (optional), isRedHerring (server-only; do not reveal this flag before answer).
Timeline event
eventId, timestamp, description, relatedSuspectIds[], relatedEvidenceIds[].
Security note
Keep solution and hidden generation metadata separate from the public response DTO. Do not return the raw MongoDB document to the client.
8. API specification
Base path
Proposed base path: /api/v1. Return JSON for API responses and a consistent error envelope.
POST /cases
Request: { premise: string, settings?: { genre?: string, difficulty?: 'easy'|'medium'|'hard', evidenceTypes?: string[] } }. Validate size and allowed enum values. Response 202 or 201 with { caseId, status, statusUrl }. If generation is synchronous, use 201 after validation; if asynchronous, use 202 and expose status polling.
GET /cases/:caseId
Returns only the public case view: title, premise/synopsis, settings, suspects, evidence, timeline, status, and whether the user has submitted. Must omit solution, culprit ID, hidden red-herring flags, private prompts, provider metadata not intended for clients, and secrets.
GET /cases/:caseId/status
Returns { caseId, status, progressMessage? }. Do not expose internal model reasoning or stack traces.
POST /cases/:caseId/hints
Request: { level?: 1 | 2 | 3 }. Validate that the case is ready and that the requested level is available. Return { hintId, level, text, remainingHints }. Hints must be generated from the saved case data and must not disclose the canonical culprit ID or solution fields. Enforce a maximum of three hints per case by default.

POST /cases/:caseId/answer

Request: { selectedSuspectId: string, rationale?: string }. Validate suspect membership and case status. Enforce one submission in v1. Response includes correctness and the post-submission reveal DTO.
GET /cases/:caseId/result
Returns the reveal only after a submission exists. Before submission, return 403 or a generic not-yet-submitted response; do not leak whether a particular suspect is correct.
DELETE /cases/:caseId
Optional for v1. If provided, use a signed owner token or equivalent capability; never allow arbitrary deletion by guessable ID.
Error format
{ error: { code: string, message: string, fieldErrors?: Record<string,string> } }. Use suitable HTTP status codes: 400 validation, 404 missing case, 409 invalid state/duplicate answer, 413 payload too large, 429 rate limit, 502/503 upstream AI failure, 500 unexpected server error.
API implementation rules
Validate request and response schemas; set timeouts; limit request bodies; use rate limiting on case creation; do not log full user prompts or generated sensitive content by default.
9. Architecture and repository layout
Architecture
React client → Express REST API → case service → AI provider adapter (Gemini) and validator → MongoDB. Optional asset storage adapter for generated images. The server owns all secrets, canonical answers, validation, persistence, and scoring.
Suggested monorepo
client/ (React, Vite, TypeScript); server/ (Node.js, Express, TypeScript); shared/ (schemas, enums, public DTO types); docs/ (this specification, decisions, API examples); tests/ (unit, integration, e2e if not colocated).
Suggested server modules
routes, controllers, services, repositories, ai/geminiProvider, ai/prompts, validation, middleware, config, errors, logging.
Suggested client modules
pages, components, features/create-case, features/case-room, features/answer, api client, hooks, types, styles.
Implementation defaults
TypeScript across client and server is recommended despite MERN being the only confirmed stack requirement. Use a maintained React setup, Express, the official Google Gemini SDK appropriate to the chosen API, MongoDB/Mongoose or the official MongoDB driver, and a runtime validation library. Record package choices in the README.
Environment variables
MONGODB_URI, GEMINI_API_KEY, GEMINI_MODEL, PORT, CLIENT_ORIGIN, NODE_ENV, RATE_LIMIT settings, and optional asset-storage credentials. Provide .env.example with placeholders only. Never commit real secrets.
Operational requirements
Structured logs with request/case correlation IDs; health endpoint; graceful handling of MongoDB or AI-provider outages; timeouts and bounded retries; no unbounded generation loops.
10. UI and visual design
Pages
Landing/create page; generation/loading state; case room; evidence detail modal or page; answer confirmation; result/reveal page; not-found/error state.
Landing page
Explain the concept, show a prominent scenario textarea, character count, optional difficulty/genre/evidence controls, a generate button, and a concise fictional-content notice.
Case room
Use a detective-board visual language without sacrificing readability. Suggested layout: case overview at top; suspect cards in one panel; evidence cards in a separate panel; timeline accessible as a tab or section; persistent solve action.
Evidence components
Each evidence card displays type, title, in-world timestamp if applicable, source label, and a clear open/inspect action. Chat transcripts should be readable and distinguish speakers. Image assets need descriptive alt text. CCTV-style material must state whether it is a still, transcript, or summary.
Result view
Show the user's selection, outcome, culprit, short explanation, decisive clues linked to evidence cards, timeline reconstruction, and buttons for a new mystery or reviewing the case.
Design principles
Responsive first; restrained dark investigative theme is a proposed style, not a requirement. Avoid excessive animations, avoid using color alone to indicate correctness, provide loading skeletons and clear empty/error states.
11. Data model and persistence
MongoDB collection: cases
Store public case data and private solution separately in the document or separate collections with strict projection. Index caseId uniquely and createdAt for retention/cleanup.
IDs
Use UUIDs or cryptographically strong opaque IDs for case and nested entity identifiers. Never rely on sequential IDs for anonymous case access.
Lifecycle
Proposed states: generating → validating → ready → answered; failures use failed. Only ready cases accept answers. A failed generation must not leave a partially playable case.
Retention
Proposed default: anonymous cases expire after 30 days, subject to owner approval. Do not store real personal data unnecessarily. Provide a retention cleanup strategy.
Atomicity
Persist the fully validated case as one logical operation. Ensure answer submission is atomic so duplicate requests cannot create multiple conflicting results.
12. Security, privacy, and abuse prevention
Secrets
Gemini API keys and database credentials are server-side only. Exclude .env from version control. Redact secrets from logs and error responses.
Input controls
Apply length limits, schema validation, request rate limits, timeouts, and output-size limits. Treat all generated strings as untrusted display content; render as text by default and sanitize any explicitly supported rich text.
AI safety
Generated cases are fictional. Avoid generating realistic accusations about identifiable real people, instructions for real-world violence, sexual content involving minors, or actionable wrongdoing. If a premise targets a real person, ask the model to fictionalize names and details or reject the request with a safe message.
Media
Do not use real private photos, real chat exports, or actual surveillance footage by default. Label synthetic assets as AI-generated. If image assets are added, validate file type and size and use safe storage URLs.
Answer secrecy
Never include canonical culprit IDs, solution text, private prompt content, or red-herring labels in pre-answer endpoints, HTML, hydration data, client bundles, or logs exposed to users.
Abuse prevention
Rate-limit generation, cap concurrent AI requests, set provider budgets, and prevent a client from forcing unlimited regeneration. Consider CAPTCHA only if abuse warrants it.
Privacy
Collect the minimum data required. Anonymous MVP should not require email or account registration. Document retention and deletion behavior.
13. Testing and quality gates
Unit tests
Validate request schemas, generated-case schema, suspect/evidence references, unique IDs, culprit membership, timeline consistency checks, public DTO redaction, and answer scoring.
Integration tests
Create a case with a mocked Gemini provider; verify persistence; fetch public case and assert solution is absent; submit correct and incorrect answers; verify duplicate submission behavior and failure cleanup.
AI contract tests
Use deterministic fixtures for valid, malformed, contradictory, incomplete, prompt-injection, and provider-error outputs. Do not depend on live Gemini calls in the default CI test suite.
End-to-end tests
Create a scenario, wait for generation, inspect evidence, request a hint, submit an answer, and view the reveal. Include mobile viewport and keyboard-only checks for core interactions.
Security tests
Check API key leakage, unauthorized solution access, rate limiting, input size, XSS via generated text, invalid case IDs, and duplicate answer races.
Definition of done
All acceptance criteria below pass; lint/typecheck/tests pass; .env.example and README exist; API contracts are documented; no known critical security issue remains; user-facing content labels the mystery as fiction.
14. Acceptance criteria
AC-01
Given a valid premise, when the user generates a case, then a persisted case is created with suspects, evidence, timeline, and exactly one canonical culprit.
AC-02
Given an invalid or empty premise, when submitted, then the UI shows validation and no AI generation occurs.
AC-03
Given a generated case, when the user refreshes, then the same case and solution remain unchanged.
AC-04
Before answering, no public API response or client asset reveals the culprit or solution.
AC-05
Given a user requests a hint before answering, then the server returns a progressive, evidence-grounded hint without revealing the culprit.

AC-06 Given a selected suspect that belongs to the case, when the user submits, then the server scores it against the canonical culprit and returns the reveal.
AC-06
Given a suspect ID not in the case, when submitted, then the server rejects the request without revealing the correct answer.
AC-07
Given malformed or contradictory AI output, when validation fails, then the server attempts no more than one repair and otherwise fails safely without saving a playable partial case.
AC-08
Given an AI provider outage, then the UI explains that generation failed and offers retry without exposing internal details.
AC-09
All evidence is visibly fictional/AI-generated, and CCTV-style items are accurately labeled as still, transcript, summary, or actual generated clip.
AC-10
Core flows work on mobile and desktop, and core controls are keyboard accessible.
15. Phased implementation plan
Phase 0 — specification and scaffolding
Create repository, README, .env.example, shared schemas, linting, typechecking, test runner, and this specification in docs/SPEC.md. Do not implement unapproved features.
Phase 1 — static playable prototype
Build landing page, case room, suspect/evidence cards, answer flow, and result page using a fixed fixture case. Validate the UX before AI integration.
Phase 2 — API and persistence
Implement Express API, MongoDB repository, DTO projection, state machine, answer submission, and tests.
Phase 3 — Gemini integration
Implement provider adapter, versioned prompt, structured output, validation, one repair attempt, timeouts, and failure handling.
Phase 4 — hints, media, and polish
Implement progressive hint generation and per-case hint limits. Add image generation/storage only if the selected provider and budget support it; otherwise keep text descriptions. Complete responsive styling, accessibility, and evidence viewers.
Phase 5 — deployment and hardening
Deploy the client and API to the chosen hosting platforms, configure production environment variables and MongoDB, verify the live URL end-to-end, run security/load/rate-limit tests, document deployment and rollback steps, review costs and retention, and fix release blockers.
16. Codex implementation instructions
Source of truth
Read this entire spec before changing code. Keep docs/SPEC.md as the canonical in-repository copy. If implementation discovers a conflict or missing decision, stop and document it in docs/DECISIONS.md rather than silently changing requirements.
Working style
Implement in small, testable phases. Before each phase, state the planned files and acceptance criteria. After each phase, run formatting, lint, typecheck, and relevant tests; report commands and results accurately.
Scope control
Do not add authentication, payments, social sharing, multiplayer, live third-party integrations, or real-world investigation features without explicit approval.
Model and IDE
Recommended IDE/tool: VS Code with Codex for repository-aware implementation. Use the strongest available Codex coding model for architecture and multi-file changes; use a faster coding model for routine edits and test fixes. Gemini is the product's runtime case-generation provider, not a substitute for Codex's coding role.
No false completion
Do not claim a test, build, deployment, API call, or asset generation succeeded unless it was actually run and its result observed.
17. Proposed defaults and open questions
Proposed defaults
Single-player anonymous MVP; one answer per case; 3–5 suspects; medium difficulty by default; text evidence first; optional generated images later; 30-day retention; English UI; no sign-in; one bounded AI repair attempt; fictional names and settings.
Open question 1
Should the website generate actual images and video, or is text-based evidence (including CCTV transcripts and image descriptions) sufficient for the first release? Video generation may significantly increase cost and complexity.
Open question 2
Should users be allowed multiple guesses, or only one final answer? This spec assumes one submission.
Open question 3
Should cases be shareable by URL, private to a browser session, or attached to accounts? This spec assumes an unguessable anonymous case URL.
Open question 4
What is the target deployment platform and monthly budget for Gemini and media generation?
Open question 5
Should the user choose genre, difficulty, evidence types, case length, and language, or should v1 use fixed defaults?
Open question 6
Hint system is now included. Proposed default: three progressive hint levels per case, with no direct culprit reveal before answer submission.
Open question 7
Should there be user accounts, saved history, moderation/reporting, or an admin dashboard? Not included in v1.
18. Decision log and change control
Decision log
Record every approved change with date, decision, rationale, and affected requirements in docs/DECISIONS.md.
Change rule
A change to behavior, data contracts, API shape, security boundaries, or acceptance criteria must update this specification and relevant tests in the same change set.
Versioning
Use semantic document versions: patch for clarification, minor for backward-compatible requirements, major for breaking product or API changes.