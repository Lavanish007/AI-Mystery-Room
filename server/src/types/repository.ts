import { CaseDocument } from '@ai-mystery-room/shared';

export interface CaseRepository {
  create(caseDoc: CaseDocument): Promise<CaseDocument>;
  findById(caseId: string): Promise<CaseDocument | null>;
  update(caseId: string, update: Partial<CaseDocument>): Promise<CaseDocument | null>;
  clear?(): Promise<void>;
}
