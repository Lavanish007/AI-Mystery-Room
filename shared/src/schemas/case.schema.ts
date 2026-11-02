import { z } from 'zod';

export const CaseStatusEnum = z.enum([
  'generating',
  'validating',
  'ready',
  'answered',
  'failed'
]);
export type CaseStatus = z.infer<typeof CaseStatusEnum>;

export const DifficultyEnum = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const EvidenceTypeEnum = z.enum([
  'messages',
  'cctv',
  'forensics',
  'document',
  'audio_transcript',
  'photograph'
]);
export type EvidenceType = z.infer<typeof EvidenceTypeEnum>;

export const SettingsSchema = z.object({
  genre: z.string().default('contemporary mystery'),
  difficulty: DifficultyEnum.default('medium'),
  evidenceTypes: z.array(EvidenceTypeEnum).default(['messages', 'cctv', 'forensics', 'document'])
});
export type CaseSettings = z.infer<typeof SettingsSchema>;

export const CreateCaseInputSchema = z.object({
  premise: z
    .string()
    .trim()
    .min(30, 'Premise must be at least 30 characters long')
    .max(1500, 'Premise cannot exceed 1,500 characters'),
  settings: SettingsSchema.partial().optional()
});
export type CreateCaseInput = z.infer<typeof CreateCaseInputSchema>;

export const SuspectSchema = z.object({
  suspectId: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  profile: z.string().min(10),
  motive: z.string().min(5),
  alibi: z.string().min(5),
  publicTimeline: z.string().min(5)
});
export type Suspect = z.infer<typeof SuspectSchema>;

export const EvidenceSchema = z.object({
  evidenceId: z.string().min(1),
  type: EvidenceTypeEnum,
  title: z.string().min(3),
  description: z.string().min(5),
  content: z.string().min(5),
  inWorldTimestamp: z.string().optional(),
  sourceLabel: z.string().min(2),
  relatedSuspectIds: z.array(z.string()).default([]),
  relatedTimelineEventIds: z.array(z.string()).default([]),
  assetUrl: z.string().url().optional(),
  isRedHerring: z.boolean().default(false)
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const TimelineEventSchema = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().min(1),
  description: z.string().min(5),
  relatedSuspectIds: z.array(z.string()).default([]),
  relatedEvidenceIds: z.array(z.string()).default([])
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const AlternativeEliminationSchema = z.object({
  suspectId: z.string().min(1),
  reason: z.string().min(5)
});
export type AlternativeElimination = z.infer<typeof AlternativeEliminationSchema>;

export const SolutionSchema = z.object({
  culpritSuspectId: z.string().min(1),
  motive: z.string().min(10),
  method: z.string().min(10),
  summary: z.string().min(20),
  decisiveEvidenceIds: z.array(z.string()).min(2, 'Solution must cite at least two decisive clues'),
  alternativeEliminations: z.array(AlternativeEliminationSchema).min(1, 'Must eliminate at least one alternative suspect')
});
export type Solution = z.infer<typeof SolutionSchema>;

export const HintTierEnum = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type HintTier = z.infer<typeof HintTierEnum>;

export const HintSchema = z.object({
  hintId: z.string().min(1),
  level: HintTierEnum,
  title: z.string().min(3),
  text: z.string().min(10)
});
export type Hint = z.infer<typeof HintSchema>;

export const SubmissionSchema = z.object({
  selectedSuspectId: z.string().min(1),
  rationale: z.string().max(1000).optional(),
  submittedAt: z.string().datetime(),
  isCorrect: z.boolean()
});
export type Submission = z.infer<typeof SubmissionSchema>;

export const GenerationMetadataSchema = z.object({
  provider: z.string().default('gemini'),
  model: z.string(),
  promptVersion: z.string().default('1.0.0'),
  schemaVersion: z.string().default('1.0.0'),
  attempts: z.number().int().min(1).default(1),
  validationStatus: z.enum(['passed', 'repaired', 'failed']).default('passed'),
  errorMessage: z.string().optional()
});
export type GenerationMetadata = z.infer<typeof GenerationMetadataSchema>;

/**
 * Full Internal Case Document Schema (Saved in Database)
 */
export const CaseDocumentSchema = z
  .object({
    caseId: z.string().uuid(),
    status: CaseStatusEnum,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    premise: z.string().min(30).max(1500),
    settings: SettingsSchema,
    title: z.string().min(3),
    synopsis: z.string().min(20),
    suspects: z.array(SuspectSchema).min(3, 'A mystery must have at least 3 suspects for fairness'),
    evidence: z.array(EvidenceSchema).min(3, 'A mystery must provide at least 3 items of evidence'),
    timeline: z.array(TimelineEventSchema).min(2, 'A mystery must have at least 2 timeline events'),
    solution: SolutionSchema,
    hints: z.array(HintSchema).max(3).default([]),
    unlockedHintLevels: z.array(HintTierEnum).default([]),
    submission: SubmissionSchema.nullable().default(null),
    generation: GenerationMetadataSchema
  })
  .refine(
    (data) => {
      const suspectIds = new Set(data.suspects.map((s) => s.suspectId));
      return suspectIds.has(data.solution.culpritSuspectId);
    },
    {
      message: 'Canonical culprit must match one of the suspects',
      path: ['solution', 'culpritSuspectId']
    }
  )
  .refine(
    (data) => {
      const evidenceIds = new Set(data.evidence.map((e) => e.evidenceId));
      return data.solution.decisiveEvidenceIds.every((id) => evidenceIds.has(id));
    },
    {
      message: 'All decisive evidence IDs cited in solution must exist in the evidence list',
      path: ['solution', 'decisiveEvidenceIds']
    }
  );

export type CaseDocument = z.infer<typeof CaseDocumentSchema>;

/**
 * Public Evidence Schema (Strips isRedHerring)
 */
export const PublicEvidenceSchema = EvidenceSchema.omit({ isRedHerring: true });
export type PublicEvidence = z.infer<typeof PublicEvidenceSchema>;

/**
 * Public Case DTO (Returned to frontend prior to answering)
 * Strictly omits solution, isRedHerring flags, and internal generation secrets
 */
export const PublicCaseDtoSchema = z.object({
  caseId: z.string().uuid(),
  status: CaseStatusEnum,
  createdAt: z.string().datetime(),
  premise: z.string(),
  settings: SettingsSchema,
  title: z.string(),
  synopsis: z.string(),
  suspects: z.array(SuspectSchema),
  evidence: z.array(PublicEvidenceSchema),
  timeline: z.array(TimelineEventSchema),
  hasSubmitted: z.boolean(),
  unlockedHints: z.array(
    z.object({
      hintId: z.string(),
      level: HintTierEnum,
      title: z.string(),
      text: z.string()
    })
  ),
  remainingHints: z.number().int().min(0).max(3)
});
export type PublicCaseDto = z.infer<typeof PublicCaseDtoSchema>;

/**
 * Answer Submission Input
 */
export const SubmitAnswerInputSchema = z.object({
  selectedSuspectId: z.string().min(1, 'A suspect must be chosen'),
  rationale: z.string().max(1000).optional()
});
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>;

/**
 * Post-Submission Reveal DTO
 */
export const RevealResultDtoSchema = z.object({
  caseId: z.string().uuid(),
  isCorrect: z.boolean(),
  selectedSuspectId: z.string(),
  solution: z.object({
    culpritSuspectId: z.string(),
    culpritName: z.string(),
    motive: z.string(),
    method: z.string(),
    summary: z.string(),
    decisiveEvidenceIds: z.array(z.string()),
    alternativeEliminations: z.array(AlternativeEliminationSchema)
  }),
  unlockedHints: z.array(HintSchema)
});
export type RevealResultDto = z.infer<typeof RevealResultDtoSchema>;

/**
 * Request Hint Input & Response
 */
export const RequestHintInputSchema = z.object({
  level: HintTierEnum.optional()
});
export type RequestHintInput = z.infer<typeof RequestHintInputSchema>;

export const HintResponseDtoSchema = z.object({
  hintId: z.string(),
  level: HintTierEnum,
  title: z.string(),
  text: z.string(),
  remainingHints: z.number().int().min(0).max(3)
});
export type HintResponseDto = z.infer<typeof HintResponseDtoSchema>;
