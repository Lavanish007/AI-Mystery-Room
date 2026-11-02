import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CaseDocumentSchema,
  CreateCaseInputSchema,
  PublicCaseDtoSchema,
  toPublicCaseDto,
  SAMPLE_CASE
} from '../shared/dist/index.js';

describe('Phase 0: Shared Schemas and Verification', () => {
  it('should validate the canonical sampleCase fixture against CaseDocumentSchema', () => {
    const parseResult = CaseDocumentSchema.safeParse(SAMPLE_CASE);
    assert.equal(parseResult.success, true, `Validation failed: ${JSON.stringify(parseResult)}`);
    if (parseResult.success) {
      assert.equal(parseResult.data.caseId, SAMPLE_CASE.caseId);
      assert.equal(parseResult.data.suspects.length, 3);
      assert.equal(parseResult.data.solution.culpritSuspectId, 'suspect-3');
    }
  });

  it('should reject a premise shorter than 30 characters', () => {
    const shortInput = { premise: 'Too short' };
    const result = CreateCaseInputSchema.safeParse(shortInput);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /at least 30 characters/i);
    }
  });

  it('should reject a premise longer than 1500 characters', () => {
    const longInput = { premise: 'a'.repeat(1501) };
    const result = CreateCaseInputSchema.safeParse(longInput);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /cannot exceed 1,500 characters/i);
    }
  });

  it('should enforce that the canonical culprit exists in the suspects list', () => {
    const invalidCase = {
      ...SAMPLE_CASE,
      solution: {
        ...SAMPLE_CASE.solution,
        culpritSuspectId: 'non-existent-suspect-id'
      }
    };
    const result = CaseDocumentSchema.safeParse(invalidCase);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /Canonical culprit must match one of the suspects/);
    }
  });

  it('should enforce that all decisive evidence IDs exist in evidence items', () => {
    const invalidCase = {
      ...SAMPLE_CASE,
      solution: {
        ...SAMPLE_CASE.solution,
        decisiveEvidenceIds: ['ev-3', 'ghost-evidence-id']
      }
    };
    const result = CaseDocumentSchema.safeParse(invalidCase);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0].message, /All decisive evidence IDs cited in solution must exist/);
    }
  });

  it('toPublicCaseDto should strictly redact culprit, solution, and isRedHerring flag', () => {
    const publicDto = toPublicCaseDto(SAMPLE_CASE);

    // Validate against PublicCaseDtoSchema
    const parseResult = PublicCaseDtoSchema.safeParse(publicDto);
    assert.equal(parseResult.success, true, `Public DTO validation failed: ${JSON.stringify(parseResult)}`);

    // Ensure solution does not exist on public DTO
    assert.equal('solution' in publicDto, false);

    // Ensure none of the evidence items leak isRedHerring
    for (const ev of publicDto.evidence) {
      assert.equal('isRedHerring' in ev, false);
    }

    // Ensure remaining hints is accurate
    assert.equal(publicDto.remainingHints, 3);
    assert.equal(publicDto.hasSubmitted, false);
  });
});
