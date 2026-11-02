import { randomUUID } from 'node:crypto';
import {
  CaseDocument,
  CaseDocumentSchema,
  CaseSettings,
  Hint
} from '@ai-mystery-room/shared';
import { AiProvider } from './types.js';
import { PROMPT_VERSION, SCHEMA_VERSION } from './prompts.js';
import { AiGenerationFailedError } from '../errors/appError.js';

export class CaseGeneratorPipeline {
  constructor(private readonly provider: AiProvider) {}

  private assembleDocument(
    rawObj: any,
    premise: string,
    settings: CaseSettings,
    model: string,
    attempts: number,
    validationStatus: 'passed' | 'repaired'
  ): CaseDocument {
    const now = new Date().toISOString();

    const hints: Hint[] = Array.isArray(rawObj.hints)
      ? rawObj.hints.map((h: any, idx: number) => ({
          hintId: h.hintId || `hint-${idx + 1}`,
          level: (idx + 1) as 1 | 2 | 3,
          title: h.title || `Hint Level ${idx + 1}`,
          text: h.text || ''
        }))
      : [];

    return {
      caseId: randomUUID(),
      status: 'ready',
      createdAt: now,
      updatedAt: now,
      premise,
      settings,
      title: rawObj.title || 'The Unsolved Enigma',
      synopsis: rawObj.synopsis || '',
      suspects: rawObj.suspects || [],
      evidence: rawObj.evidence || [],
      timeline: rawObj.timeline || [],
      solution: rawObj.solution || {
        culpritSuspectId: '',
        motive: '',
        method: '',
        summary: '',
        decisiveEvidenceIds: [],
        alternativeEliminations: []
      },
      hints,
      unlockedHintLevels: [],
      submission: null,
      generation: {
        provider: 'gemini',
        model,
        promptVersion: PROMPT_VERSION,
        schemaVersion: SCHEMA_VERSION,
        attempts,
        validationStatus
      }
    };
  }

  async generate(premise: string, settings: CaseSettings): Promise<CaseDocument> {
    // Attempt 1: Initial AI Generation
    const attempt1 = await this.provider.generateMystery(premise, settings);

    let parsed1: any;
    let jsonParseError = false;
    try {
      parsed1 = JSON.parse(attempt1.rawJson);
    } catch {
      jsonParseError = true;
    }

    if (!jsonParseError) {
      const candidate1 = this.assembleDocument(
        parsed1,
        premise,
        settings,
        attempt1.model,
        1,
        'passed'
      );
      const validation1 = CaseDocumentSchema.safeParse(candidate1);
      if (validation1.success) {
        return validation1.data;
      }
    }

    // Attempt 2: Exactly ONE constrained repair attempt (AC-07)
    const errors: string[] = [];
    if (jsonParseError) {
      errors.push('Response was not valid JSON syntax.');
    } else {
      const tempDoc = this.assembleDocument(parsed1, premise, settings, attempt1.model, 1, 'passed');
      const testValidation = CaseDocumentSchema.safeParse(tempDoc);
      if (!testValidation.success) {
        for (const issue of testValidation.error.issues) {
          errors.push(`[${issue.path.join('.')}] ${issue.message}`);
        }
      }
    }

    const attempt2 = await this.provider.repairMystery(attempt1.rawJson, errors);

    let parsed2: any;
    try {
      parsed2 = JSON.parse(attempt2.rawJson);
    } catch {
      throw new AiGenerationFailedError('AI repair attempt produced malformed JSON. Generation aborted.');
    }

    const candidate2 = this.assembleDocument(
      parsed2,
      premise,
      settings,
      attempt2.model,
      2,
      'repaired'
    );
    const validation2 = CaseDocumentSchema.safeParse(candidate2);

    if (validation2.success) {
      return validation2.data;
    }

    // Still invalid after 1 repair -> fail safely without saving (AC-07)
    const remainingErrors = validation2.error.issues.map((i) => `[${i.path.join('.')}] ${i.message}`).join(', ');
    throw new AiGenerationFailedError(
      `Case generation failed validation after repair attempt: ${remainingErrors}`
    );
  }
}
