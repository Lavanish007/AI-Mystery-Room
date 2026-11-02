import { CaseDocument } from '@ai-mystery-room/shared';
import { CaseRepository } from '../types/repository.js';

export class InMemoryCaseRepository implements CaseRepository {
  private cases: Map<string, CaseDocument> = new Map();

  async create(caseDoc: CaseDocument): Promise<CaseDocument> {
    // Deep clone to preserve immutability
    const clone = JSON.parse(JSON.stringify(caseDoc)) as CaseDocument;
    this.cases.set(clone.caseId, clone);
    return JSON.parse(JSON.stringify(clone));
  }

  async findById(caseId: string): Promise<CaseDocument | null> {
    const found = this.cases.get(caseId);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  }

  async update(caseId: string, update: Partial<CaseDocument>): Promise<CaseDocument | null> {
    const existing = this.cases.get(caseId);
    if (!existing) return null;

    const updated: CaseDocument = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString()
    };

    this.cases.set(caseId, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  async clear(): Promise<void> {
    this.cases.clear();
  }
}
