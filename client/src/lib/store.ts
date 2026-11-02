import { CaseDocument } from '@shared';
import { SAMPLE_CASE, toPublicCaseDto } from '@shared';

export { toPublicCaseDto };

export async function generateCase(premise: string): Promise<CaseDocument> {
  await new Promise(resolve => setTimeout(resolve, 2400));
  return {
    ...SAMPLE_CASE,
    caseId: SAMPLE_CASE.caseId,
    premise,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unlockedHintLevels: [],
    submission: null
  };
}
