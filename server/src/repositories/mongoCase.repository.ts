import mongoose, { Schema, Document } from 'mongoose';
import { CaseDocument } from '@ai-mystery-room/shared';
import { CaseRepository } from '../types/repository.js';

interface MongoCaseDoc extends Document {
  caseId: string;
  data: CaseDocument;
  createdAt: Date;
  updatedAt: Date;
}

const MongoCaseSchema = new Schema<MongoCaseDoc>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true }
  },
  {
    timestamps: true
  }
);

// Auto-expire after 30 days retention policy as per SPEC Section 11
MongoCaseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const MongoCaseModel =
  mongoose.models.Case || mongoose.model<MongoCaseDoc>('Case', MongoCaseSchema);

export class MongoCaseRepository implements CaseRepository {
  async create(caseDoc: CaseDocument): Promise<CaseDocument> {
    await MongoCaseModel.create({
      caseId: caseDoc.caseId,
      data: caseDoc
    });
    return JSON.parse(JSON.stringify(caseDoc));
  }

  async findById(caseId: string): Promise<CaseDocument | null> {
    const doc = await MongoCaseModel.findOne({ caseId }).lean<MongoCaseDoc>();
    if (!doc || !doc.data) return null;
    return JSON.parse(JSON.stringify(doc.data));
  }

  async update(caseId: string, update: Partial<CaseDocument>): Promise<CaseDocument | null> {
    const existing = await this.findById(caseId);
    if (!existing) return null;

    const merged: CaseDocument = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString()
    };

    await MongoCaseModel.updateOne({ caseId }, { $set: { data: merged } });
    return merged;
  }
}
