import { CaseSettings } from '@ai-mystery-room/shared';
import { AiGenerationResult, AiProvider } from './types.js';
import { buildRepairPrompt, buildSystemInstruction, buildUserPrompt } from './prompts.js';
import { UpstreamAiError } from '../errors/appError.js';

export class GeminiAiProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly modelName: string = 'gemini-1.5-flash',
    private readonly timeoutMs: number = 30000
  ) {}

  private cleanJsonOutput(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith('```')) {
      const stripped = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      return stripped.trim();
    }
    return trimmed;
  }

  private async callGemini(contents: Array<{ role: string; parts: Array<{ text: string }> }>): Promise<string> {
    if (!this.apiKey) {
      throw new UpstreamAiError('GEMINI_API_KEY is not configured on the server');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.modelName
    )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemInstruction() }]
          },
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gemini API Error] Status ${response.status}:`, errorText);
        if (response.status === 429) {
          throw new UpstreamAiError('AI generation rate limit exceeded. Please wait a moment before trying again.');
        }
        throw new UpstreamAiError('AI mystery generation service encountered an upstream issue. Please retry.');
      }

      const data = (await response.json()) as any;
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new UpstreamAiError('AI provider returned an empty narrative response. Please retry.');
      }

      return this.cleanJsonOutput(candidateText);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new UpstreamAiError('AI generation request timed out after 30 seconds. Please try a simpler premise.');
      }
      if (err instanceof UpstreamAiError) {
        throw err;
      }
      throw new UpstreamAiError(`Failed to communicate with AI provider: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  async generateMystery(premise: string, settings: CaseSettings): Promise<AiGenerationResult> {
    const userPrompt = buildUserPrompt(premise, settings);
    const rawJson = await this.callGemini([
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ]);

    return {
      rawJson,
      model: this.modelName
    };
  }

  async repairMystery(rawJson: string, validationErrors: string[]): Promise<AiGenerationResult> {
    const repairPrompt = buildRepairPrompt(rawJson, validationErrors);
    const repairedJson = await this.callGemini([
      {
        role: 'user',
        parts: [{ text: repairPrompt }]
      }
    ]);

    return {
      rawJson: repairedJson,
      model: this.modelName
    };
  }
}
