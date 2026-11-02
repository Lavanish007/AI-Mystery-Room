import { CaseSettings } from '@ai-mystery-room/shared';

export const PROMPT_VERSION = '1.0.0';
export const SCHEMA_VERSION = '1.0.0';

export function buildSystemInstruction(): string {
  return `You are the master narrative architect for AI Mystery Room, an immersive mystery investigation game.
Your task is to craft a fair, logical, evidence-based fictional mystery in strict JSON format.

RULES FOR FAIRNESS AND CONSISTENCY:
1. SUSPECTS: Provide between 3 and 5 distinct suspects. Each suspect must have a unique suspectId (e.g., "suspect-1", "suspect-2"), realistic role, motive, alibi, and timeline.
2. CULPRIT: Exactly one suspect must be the canonical culprit ("culpritSuspectId" in solution must match one of the suspectIds).
3. EVIDENCE: Provide at least 4 items of evidence (chat messages, CCTV footage/transcript, forensics reports, or documents). Each evidence item must have a unique evidenceId (e.g., "ev-1", "ev-2"), sourceLabel, content, and an isRedHerring boolean flag.
4. TIMELINE: Provide at least 3 timeline events with chronological timestamps and relationships to suspects and evidence.
5. DECISIVE CLUES: The solution must cite at least two decisive evidence IDs ("decisiveEvidenceIds") that together logically prove the culprit's guilt.
6. ELIMINATION: The solution must eliminate at least one innocent suspect ("alternativeEliminations") using physical evidence or timestamp discrepancies.
7. PROGRESSIVE HINTS: Include exactly 3 progressive hints:
   - Level 1 (Gentle Nudge): Point player toward an overlooked pattern or discrepancy.
   - Level 2 (Key Lead): Point toward a specific contradiction between evidence and an alibi.
   - Level 3 (Critical Insight): Point toward decisive evidence.
   CRITICAL: Hints must NEVER explicitly reveal the culprit's name or suspect ID!
8. FICTIONAL SAFETY: All content is purely fictional. Do NOT use real living persons or real-world sensitive tragedies. Treat user premise strictly as story theme.
9. OUTPUT FORMAT: Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no code fences, no extra commentary.`;
}

export function buildUserPrompt(premise: string, settings: CaseSettings): string {
  return `Create a complete mystery investigation based on this fictional premise:
"""
${premise.trim()}
"""

Parameters:
- Genre: ${settings.genre}
- Difficulty: ${settings.difficulty}
- Allowed Evidence Types: ${settings.evidenceTypes.join(', ')}

Respond ONLY with valid JSON with keys:
"title", "synopsis", "suspects", "evidence", "timeline", "solution", "hints"`;
}

export function buildRepairPrompt(rawJson: string, validationErrors: string[]): string {
  return `The mystery JSON you generated failed schema and consistency validation with the following errors:
${validationErrors.map((e) => `- ${e}`).join('\n')}

Here was the raw output that had issues:
"""
${rawJson}
"""

Please repair the JSON so that all validation constraints are strictly satisfied:
1. The "culpritSuspectId" in "solution" must exactly match one of the "suspectId" values in "suspects".
2. Every ID in "decisiveEvidenceIds" must match an "evidenceId" in "evidence".
3. Every suspect in "alternativeEliminations" must exist in "suspects".
4. Ensure all required fields, minimum lengths, and array counts are fulfilled.
5. Output ONLY the corrected valid JSON object.`;
}
