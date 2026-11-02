import { CaseSettings } from '@ai-mystery-room/shared';

export interface AiGenerationResult {
  rawJson: string;
  model: string;
}

export interface AiProvider {
  generateMystery(premise: string, settings: CaseSettings): Promise<AiGenerationResult>;
  repairMystery(rawJson: string, validationErrors: string[]): Promise<AiGenerationResult>;
}
