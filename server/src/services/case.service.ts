import { randomUUID } from 'node:crypto';
import {
  CaseDocument,
  CaseDocumentSchema,
  CaseStatus,
  CreateCaseInput,
  CreateCaseInputSchema,
  HintResponseDto,
  HintTier,
  PublicCaseDto,
  RevealResultDto,
  SAMPLE_CASE,
  SubmitAnswerInput,
  SubmitAnswerInputSchema,
  toPublicCaseDto
} from '@ai-mystery-room/shared';
import { CaseRepository } from '../types/repository.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError
} from '../errors/appError.js';

import { CaseGeneratorPipeline } from '../ai/generatorPipeline.js';
import { CaseSettings } from '@ai-mystery-room/shared';

export class CaseService {
  constructor(
    private readonly repository: CaseRepository,
    private readonly aiPipeline?: CaseGeneratorPipeline
  ) {}

  /**
   * Creates and persists a new mystery case
   */
  async createCase(input: CreateCaseInput): Promise<PublicCaseDto> {
    const parsed = CreateCaseInputSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join('.')] = issue.message;
      }
      throw new BadRequestError('Validation failed for case creation input', fieldErrors);
    }

    const { premise, settings } = parsed.data;
    const now = new Date().toISOString();

    const effectiveSettings: CaseSettings = {
      genre: settings?.genre || SAMPLE_CASE.settings.genre,
      difficulty: settings?.difficulty || SAMPLE_CASE.settings.difficulty,
      evidenceTypes: settings?.evidenceTypes || SAMPLE_CASE.settings.evidenceTypes
    };

    let caseToSave: CaseDocument;
    if (this.aiPipeline) {
      caseToSave = await this.aiPipeline.generate(premise, effectiveSettings);
    } else {
      caseToSave = {
        ...SAMPLE_CASE,
        caseId: randomUUID(),
        status: 'ready',
        createdAt: now,
        updatedAt: now,
        premise,
        settings: effectiveSettings,
        unlockedHintLevels: [],
        submission: null
      };
    }

    // Strict validation against canonical CaseDocumentSchema
    const validated = CaseDocumentSchema.parse(caseToSave);
    const saved = await this.repository.create(validated);

    return toPublicCaseDto(saved);
  }

  /**
   * Gets a public case view with secrets redacted
   */
  async getCase(caseId: string): Promise<PublicCaseDto> {
    const caseDoc = await this.repository.findById(caseId);
    if (!caseDoc) {
      throw new NotFoundError(`Case with ID "${caseId}" was not found`);
    }
    return toPublicCaseDto(caseDoc);
  }

  /**
   * Retrieves case status
   */
  async getStatus(caseId: string): Promise<{ caseId: string; status: CaseStatus; progressMessage?: string }> {
    const caseDoc = await this.repository.findById(caseId);
    if (!caseDoc) {
      throw new NotFoundError(`Case with ID "${caseId}" was not found`);
    }

    const statusMessages: Record<CaseStatus, string> = {
      generating: 'Synthesizing suspects and narrative clues…',
      validating: 'Verifying case consistency and evidence timeline…',
      ready: 'Investigation is open. Case file ready for inspection.',
      answered: 'Case concluded and verdict delivered.',
      failed: 'Case generation could not be completed.'
    };

    return {
      caseId: caseDoc.caseId,
      status: caseDoc.status,
      progressMessage: statusMessages[caseDoc.status]
    };
  }

  /**
   * Requests a progressive hint without leaking culprit
   */
  async requestHint(caseId: string, level?: HintTier): Promise<HintResponseDto> {
    const caseDoc = await this.repository.findById(caseId);
    if (!caseDoc) {
      throw new NotFoundError(`Case with ID "${caseId}" was not found`);
    }

    if (caseDoc.status !== 'ready') {
      throw new BadRequestError(`Cannot request hints for case in status "${caseDoc.status}"`);
    }

    const unlocked = caseDoc.unlockedHintLevels || [];
    if (unlocked.length >= 3) {
      throw new BadRequestError('Maximum hint limit (3) reached for this case');
    }

    let targetLevel: HintTier;
    if (level !== undefined) {
      if (level < 1 || level > 3) {
        throw new BadRequestError('Hint level must be between 1 and 3');
      }
      if (unlocked.includes(level)) {
        const hint = caseDoc.hints.find((h) => h.level === level);
        return {
          hintId: hint?.hintId || `hint-${level}`,
          level,
          title: hint?.title || `Hint Level ${level}`,
          text: hint?.text || 'Review the timeline and physical evidence discrepancies.',
          remainingHints: Math.max(0, 3 - unlocked.length)
        };
      }
      targetLevel = level;
    } else {
      const candidates: HintTier[] = [1, 2, 3];
      const next = candidates.find((c) => !unlocked.includes(c));
      if (!next) {
        throw new BadRequestError('All hint tiers have already been unlocked');
      }
      targetLevel = next;
    }

    const newUnlocked = [...unlocked, targetLevel].sort() as HintTier[];
    await this.repository.update(caseId, { unlockedHintLevels: newUnlocked });

    const hint = caseDoc.hints.find((h) => h.level === targetLevel);
    return {
      hintId: hint?.hintId || `hint-${targetLevel}`,
      level: targetLevel,
      title: hint?.title || `Hint Level ${targetLevel}`,
      text: hint?.text || 'Carefully examine conflicting suspect alibis against timestamps.',
      remainingHints: Math.max(0, 3 - newUnlocked.length)
    };
  }

  /**
   * Submits an answer, evaluates culprit, and reveals case solution
   */
  async submitAnswer(caseId: string, input: SubmitAnswerInput): Promise<RevealResultDto> {
    const parsed = SubmitAnswerInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestError('Invalid answer submission', {
        selectedSuspectId: parsed.error.issues[0]?.message || 'Required'
      });
    }

    const caseDoc = await this.repository.findById(caseId);
    if (!caseDoc) {
      throw new NotFoundError(`Case with ID "${caseId}" was not found`);
    }

    if (caseDoc.submission !== null || caseDoc.status === 'answered') {
      throw new ConflictError('This mystery has already been answered. Only one attempt is permitted.');
    }

    if (caseDoc.status !== 'ready') {
      throw new BadRequestError(`Cannot submit an answer for case in "${caseDoc.status}" state`);
    }

    // Verify selected suspect actually belongs to the case
    const suspect = caseDoc.suspects.find((s) => s.suspectId === parsed.data.selectedSuspectId);
    if (!suspect) {
      throw new BadRequestError(
        `Suspect with ID "${parsed.data.selectedSuspectId}" does not exist in this case`,
        undefined,
        'INVALID_SUSPECT_ID'
      );
    }

    const isCorrect = parsed.data.selectedSuspectId === caseDoc.solution.culpritSuspectId;
    const now = new Date().toISOString();

    const submission = {
      selectedSuspectId: parsed.data.selectedSuspectId,
      rationale: parsed.data.rationale,
      submittedAt: now,
      isCorrect
    };

    const updated = await this.repository.update(caseId, {
      status: 'answered',
      submission
    });

    const culprit = caseDoc.suspects.find((s) => s.suspectId === caseDoc.solution.culpritSuspectId);

    return {
      caseId: caseDoc.caseId,
      isCorrect,
      selectedSuspectId: parsed.data.selectedSuspectId,
      solution: {
        culpritSuspectId: caseDoc.solution.culpritSuspectId,
        culpritName: culprit?.name || 'Unknown Culprit',
        motive: caseDoc.solution.motive,
        method: caseDoc.solution.method,
        summary: caseDoc.solution.summary,
        decisiveEvidenceIds: caseDoc.solution.decisiveEvidenceIds,
        alternativeEliminations: caseDoc.solution.alternativeEliminations
      },
      unlockedHints: updated?.hints || caseDoc.hints
    };
  }

  /**
   * Retrieves reveal verdict only after submission
   */
  async getResult(caseId: string): Promise<RevealResultDto> {
    const caseDoc = await this.repository.findById(caseId);
    if (!caseDoc) {
      throw new NotFoundError(`Case with ID "${caseId}" was not found`);
    }

    if (caseDoc.submission === null || caseDoc.status !== 'answered') {
      throw new ForbiddenError(
        'Case result cannot be revealed before an answer has been officially submitted',
        'NOT_YET_ANSWERED'
      );
    }

    const culprit = caseDoc.suspects.find((s) => s.suspectId === caseDoc.solution.culpritSuspectId);

    return {
      caseId: caseDoc.caseId,
      isCorrect: caseDoc.submission.isCorrect,
      selectedSuspectId: caseDoc.submission.selectedSuspectId,
      solution: {
        culpritSuspectId: caseDoc.solution.culpritSuspectId,
        culpritName: culprit?.name || 'Unknown Culprit',
        motive: caseDoc.solution.motive,
        method: caseDoc.solution.method,
        summary: caseDoc.solution.summary,
        decisiveEvidenceIds: caseDoc.solution.decisiveEvidenceIds,
        alternativeEliminations: caseDoc.solution.alternativeEliminations
      },
      unlockedHints: caseDoc.hints
    };
  }
}
