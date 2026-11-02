# Architecture Decision Log (ADR)

This document tracks significant design, architectural, and requirement decisions made during the development of AI Mystery Room in accordance with Section 18 of the specification.

---

## ADR-001: Monorepo Architecture with TypeScript Workspaces
- **Date:** 2026-11-01
- **Status:** Accepted
- **Context:** Section 9 of [docs/SPEC.md](file:///docs/SPEC.md) recommends a monorepo containing `client/`, `server/`, `shared/`, `docs/`, and `tests/`.
- **Decision:** Use npm workspaces with three main packages:
  - `@ai-mystery-room/shared`: Type definitions, Zod validation schemas, and domain constants shared between server and client.
  - `@ai-mystery-room/server`: Node.js + Express backend service with Gemini SDK integration, MongoDB persistence, and strict DTO redaction.
  - `@ai-mystery-room/client`: React 18+ Single Page Application built with Vite and TypeScript.
- **Rationale:** Ensures unified data contract enforcement across front-end and back-end, zero code duplication for validation logic, and decoupled deployability.
- **Affected Requirements:** Section 7 (Proposed case JSON shape), Section 8 (API specification), Section 9 (Architecture and repository layout).

---

## ADR-002: Validation Strategy via Zod
- **Date:** 2026-11-01
- **Status:** Accepted
- **Context:** Section 6 and 7 require strict runtime validation of Gemini AI outputs, API request payloads, and safe DTO projections.
- **Decision:** Standardize on [Zod](https://github.com/colinhacks/zod) for all runtime schema validation and static TypeScript type inference in `shared/`.
- **Rationale:** Zod provides type inference (`z.infer<T>`), composable schemas, custom refinements (essential for validating cross-field consistency like checking that culpritSuspectId exists in suspects[] and all decisiveEvidenceIds exist in evidence[]), and produces user-friendly validation error messages.
- **Affected Requirements:** FR-03, FR-04, FR-06, FR-10, AI generation contract (Section 6), Schema definitions (Section 7).

---

## ADR-003: Progressive Hint System and Secret Redaction
- **Date:** 2026-11-01
- **Status:** Accepted
- **Context:** Section 5 (FR-09, FR-11) and Section 12 (Security and Answer Secrecy) dictate that the canonical solution and culprit ID must never leak prior to answer submission, while hints must be progressive and grounded in the case.
- **Decision:**
  - `GET /api/v1/cases/:caseId` strictly projects a `PublicCaseDto` where `solution`, `isRedHerring`, and internal generation parameters are stripped.
  - Progressive hints (up to 3 levels: gentle nudge, moderate lead, strong clue) are pre-calculated or securely derived server-side without ever exposing the canonical culprit ID before answer submission.
- **Rationale:** Prevents client inspection / browser devtools snooping while delivering a smooth, engaging mystery investigation gameplay loop.
- **Affected Requirements:** FR-09, FR-11, AC-04, AC-05, Security (Section 12).

---

## ADR-004: Case Repository Abstraction with In-Memory Test Support
- **Date:** 2026-11-01
- **Status:** Accepted
- **Context:** Section 9 and 13 require clean persistence boundaries and hermetic unit/integration tests that do not depend on external live infrastructure like a running MongoDB cluster during development or CI test suites.
- **Decision:** Implement a clean `CaseRepository` interface with two interchangeable implementations:
  1. `MongoCaseRepository`: Uses Mongoose schemas to persist cases into the MongoDB `cases` collection with unique indexing on `caseId`.
  2. `InMemoryCaseRepository`: In-memory Map-backed implementation for hermetic test execution and zero-dependency local dev offline mode.
  - The repository factory automatically resolves `MongoCaseRepository` when `MONGODB_URI` connects or can be explicitly injected into `CaseService`.
- **Rationale:** Enables fast, deterministic automated test suites (AC-01 through AC-06) that run in milliseconds without requiring MongoDB process management, while supporting production MongoDB persistence.
- **Affected Requirements:** Section 9 (Suggested server modules), Section 11 (Data model and persistence), Section 13 (Integration tests).

---

## ADR-005: Gemini Provider Adapter and AI Verification Pipeline
- **Date:** 2026-11-01
- **Status:** Accepted
- **Context:** Section 6 (AI generation contract), Section 8, and Section 13 require calling Gemini with structured JSON output, validating schema and cross-field consistency via Zod, performing at most one constrained repair attempt (AC-07), and handling upstream outages cleanly with 502/503 errors and safe retry messages (AC-08).
- **Decision:**
  - Implement `GeminiAiProvider` using the official Google Gemini REST API (`generateContent`) with `responseMimeType: "application/json"`.
  - Encapsulate the provider behind an `AiProvider` interface with a configurable mock implementation for contract and failure injection tests.
  - Implement a two-step validation & repair pipeline:
    1. Initial generation call using versioned developer system prompts.
    2. Parse and validate against `CaseDocumentSchema`.
    3. If validation fails, dispatch exactly one repair prompt containing the raw invalid JSON and the specific Zod validation errors to allow the model to fix inconsistencies.
    4. If repair still fails, throw `AiGenerationFailedError` (502/503) without saving broken cases into persistence.
- **Rationale:** Guarantees zero unhandled model hallucinations reach player screens, protects game fairness, enforces strict timeout bounds (30s), and preserves deterministic automated testing without live API keys.
- **Affected Requirements:** FR-03, FR-04, FR-06, AC-01, AC-07, AC-08, Section 6.
