export * from './schemas/case.schema.js';
export * from './types/index.js';
export * from './fixtures/sampleCase.js';

/**
 * Utility helper to safely transform an internal CaseDocument into a PublicCaseDto
 * Ensures strict redaction of culprit, solution, and red-herring flags
 */
import { CaseDocument, PublicCaseDto } from './schemas/case.schema.js';

export function toPublicCaseDto(caseDoc: CaseDocument): PublicCaseDto {
  const unlocked = (caseDoc.unlockedHintLevels || []).map((lvl) => {
    const hint = caseDoc.hints.find((h) => h.level === lvl);
    return {
      hintId: hint?.hintId || `hint-${lvl}`,
      level: lvl,
      title: hint?.title || `Hint Level ${lvl}`,
      text: hint?.text || ''
    };
  });

  return {
    caseId: caseDoc.caseId,
    status: caseDoc.status,
    createdAt: caseDoc.createdAt,
    premise: caseDoc.premise,
    settings: caseDoc.settings,
    title: caseDoc.title,
    synopsis: caseDoc.synopsis,
    suspects: caseDoc.suspects,
    // Redact isRedHerring flag from every evidence item
    evidence: caseDoc.evidence.map(({ isRedHerring, ...publicItem }) => publicItem),
    timeline: caseDoc.timeline,
    hasSubmitted: caseDoc.submission !== null,
    unlockedHints: unlocked,
    remainingHints: Math.max(0, 3 - (caseDoc.unlockedHintLevels?.length || 0))
  };
}
