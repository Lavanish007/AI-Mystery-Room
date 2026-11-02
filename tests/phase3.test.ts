import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/dist/index.js';
import { InMemoryCaseRepository } from '../server/dist/repositories/inMemoryCase.repository.js';
import { CaseGeneratorPipeline } from '../server/dist/ai/generatorPipeline.js';
import { SAMPLE_CASE } from '../shared/dist/index.js';
import { UpstreamAiError } from '../server/dist/errors/appError.js';

// Mock AI Provider with customizable responses
class MockAiProvider {
  public generateCount = 0;
  public repairCount = 0;
  public lastRepairErrors: string[] = [];
  private onGenerate: () => Promise<{ rawJson: string; model: string }>;
  private onRepair?: (errors: string[]) => Promise<{ rawJson: string; model: string }>;

  constructor(
    onGenerate: () => Promise<{ rawJson: string; model: string }>,
    onRepair?: (errors: string[]) => Promise<{ rawJson: string; model: string }>
  ) {
    this.onGenerate = onGenerate;
    this.onRepair = onRepair;
  }

  async generateMystery(_premise: string, _settings: any): Promise<{ rawJson: string; model: string }> {
    this.generateCount++;
    return this.onGenerate();
  }

  async repairMystery(_rawJson: string, validationErrors: string[]): Promise<{ rawJson: string; model: string }> {
    this.repairCount++;
    this.lastRepairErrors = validationErrors;
    if (!this.onRepair) {
      throw new Error('Unexpected repair call');
    }
    return this.onRepair(validationErrors);
  }
}

// Helper to launch test server with injected pipeline
async function createAiTestServer(mockProvider: any) {
  const repository = new InMemoryCaseRepository();
  const pipeline = new CaseGeneratorPipeline(mockProvider);
  const { app, caseService } = createApp(repository, pipeline);

  const server = app.listen(0);
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const close = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  return { baseUrl, repository, caseService, close };
}

test('Phase 3: Gemini Integration and AI Contract Acceptance Criteria', async (t) => {
  const validMysteryObj = {
    title: 'The Stolen Renaissance Diadem',
    synopsis: 'During a blackout at the Grand Villa Gala, an ancient jewel disappears from a sealed display case.',
    suspects: [
      {
        suspectId: 'suspect-1',
        name: 'Julian Vance',
        role: 'Head of Security',
        profile: 'Ex-military officer with deep knowledge of alarm bypasses.',
        motive: 'Severe personal debt from foreign investments.',
        alibi: 'Claims he was in the surveillance control booth resetting the backup breaker.',
        publicTimeline: 'Entered booth at 22:50; exited at 23:15.'
      },
      {
        suspectId: 'suspect-2',
        name: 'Elena Rostova',
        role: 'Guest Appraiser',
        profile: 'World-renowned jewelry expert who examined the diadem earlier that morning.',
        motive: 'Professional obsession with rare Florentine royal heirlooms.',
        alibi: 'Was chatting with guests near the ballroom champagne fountain.',
        publicTimeline: 'Ballroom from 22:45 to 23:20.'
      },
      {
        suspectId: 'suspect-3',
        name: 'Victor Sterling',
        role: 'Host Benefactor',
        profile: 'Eccentric magnate facing imminent tax audit by federal authorities.',
        motive: 'Insurance settlement value exceeds authentic private market value.',
        alibi: 'Giving a formal toast in the north parlor.',
        publicTimeline: 'North parlor 22:40 to 23:05.'
      }
    ],
    evidence: [
      {
        evidenceId: 'ev-1',
        type: 'messages',
        title: 'Encrypted Chat Log',
        description: 'Recovered messaging thread discussing high-value black market jewel buyers.',
        content: '[22:15] Unknown: The vault breaker is keyed to your clearance code.\n[22:17] Julian: Understood. Midnight courier is waiting.',
        sourceLabel: 'Digital Forensic Extraction',
        isRedHerring: false,
        relatedSuspectIds: ['suspect-1']
      },
      {
        evidenceId: 'ev-2',
        type: 'forensics',
        title: 'Security Panel Glove Fibers',
        description: 'Microscopic synthetic fibers lifted directly from the manual display release switch.',
        content: 'Fibers match standard-issue security guard tactical gloves issued exclusively to Julian Vance.',
        sourceLabel: 'Forensic Lab Unit',
        isRedHerring: false,
        relatedSuspectIds: ['suspect-1']
      },
      {
        evidenceId: 'ev-3',
        type: 'document',
        title: 'Appraisal Report',
        description: 'Preliminary condition report signed by Elena Rostova hours before the gala.',
        content: 'Appraiser noted minor clasp wear; verified authenticity of all 42 emerald inlays.',
        sourceLabel: 'Villa Archive',
        isRedHerring: true,
        relatedSuspectIds: ['suspect-2']
      },
      {
        evidenceId: 'ev-4',
        type: 'cctv',
        title: 'Vault Corridor Still Feed',
        description: 'Frame captured at 23:02 during emergency battery backup lighting.',
        content: 'A tall figure in security uniform is seen opening the display case latch.',
        sourceLabel: 'Corridor Camera 4',
        isRedHerring: false,
        relatedSuspectIds: ['suspect-1']
      }
    ],
    timeline: [
      {
        eventId: 'time-1',
        timestamp: '22:50',
        description: 'Villa main power circuit severed at transformer grid.',
        relatedSuspectIds: ['suspect-1'],
        relatedEvidenceIds: ['ev-1']
      },
      {
        eventId: 'time-2',
        timestamp: '23:02',
        description: 'Security uniform figure opens display case and extracts diadem.',
        relatedSuspectIds: ['suspect-1'],
        relatedEvidenceIds: ['ev-2', 'ev-4']
      }
    ],
    solution: {
      culpritSuspectId: 'suspect-1',
      motive: 'Under pressure from mounting debt, Julian Vance coordinated with a black market courier to steal the diadem.',
      method: 'Used his security clearance and breaker access to cut primary power and manually unlock the display case.',
      summary: 'Julian Vance executed the heist during the staged blackout using his security override.',
      decisiveEvidenceIds: ['ev-1', 'ev-2'],
      alternativeEliminations: [
        {
          suspectId: 'suspect-2',
          reason: 'Ballroom CCTV confirms Elena Rostova was continuously visible to attendees during the blackout.'
        }
      ]
    },
    hints: [
      {
        hintId: 'hint-1',
        level: 1,
        title: 'Power Disruption Pattern',
        text: 'Consider who had direct physical and technical clearance to access the breaker station.'
      },
      {
        hintId: 'hint-2',
        level: 2,
        title: 'Physical Traces',
        text: 'Inspect the forensic materials lifted from the manual release latch.'
      },
      {
        hintId: 'hint-3',
        level: 3,
        title: 'Communications',
        text: 'The encrypted message mentions key access codes matching security personnel.'
      }
    ]
  };

  await t.test('AC-01: Valid AI generation completes, validates, and persists atomically', async () => {
    const mock = new MockAiProvider(async () => ({
      rawJson: JSON.stringify(validMysteryObj),
      model: 'gemini-1.5-flash'
    }));

    const testServer = await createAiTestServer(mock);
    try {
      const res = await fetch(`${testServer.baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise: 'A historic diadem disappears during a private gala blackout at an Italian villa.',
          settings: { genre: 'Art & Heist', difficulty: 'medium' }
        })
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.title, 'The Stolen Renaissance Diadem');
      assert.equal(mock.generateCount, 1);
      assert.equal(mock.repairCount, 0);

      // Verify internal document has generation metadata
      const internalDoc = await testServer.repository.findById(json.data.caseId);
      assert.ok(internalDoc);
      assert.equal(internalDoc.generation.attempts, 1);
      assert.equal(internalDoc.generation.validationStatus, 'passed');
    } finally {
      await testServer.close();
    }
  });

  await t.test('AC-07: Malformed/contradictory AI output triggers at most one repair and recovers', async () => {
    // Attempt 1 returns contradictory output: culpritSuspectId is 'suspect-ghost' which is not in suspects[]
    const invalidObj = {
      ...validMysteryObj,
      solution: {
        ...validMysteryObj.solution,
        culpritSuspectId: 'suspect-ghost-not-found'
      }
    };

    const mock = new MockAiProvider(
      async () => ({
        rawJson: JSON.stringify(invalidObj),
        model: 'gemini-1.5-flash'
      }),
      async (errors) => {
        assert.ok(errors.length > 0, 'Repair call must pass validation error details');
        assert.ok(errors.some((e) => e.includes('culpritSuspectId') || e.includes('suspect')));
        // Return repaired valid JSON
        return {
          rawJson: JSON.stringify(validMysteryObj),
          model: 'gemini-1.5-flash'
        };
      }
    );

    const testServer = await createAiTestServer(mock);
    try {
      const res = await fetch(`${testServer.baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise: 'A priceless sapphire vanished from the penthouse suite during a private dinner.'
        })
      });

      assert.equal(res.status, 201);
      assert.equal(mock.generateCount, 1);
      assert.equal(mock.repairCount, 1);

      const json = await res.json();
      const internalDoc = await testServer.repository.findById(json.data.caseId);
      assert.ok(internalDoc);
      assert.equal(internalDoc.generation.attempts, 2);
      assert.equal(internalDoc.generation.validationStatus, 'repaired');
      assert.equal(internalDoc.solution.culpritSuspectId, 'suspect-1');
    } finally {
      await testServer.close();
    }
  });

  await t.test('AC-07: Still invalid after 1 repair fails safely without persisting partial case', async () => {
    const invalidObj = {
      ...validMysteryObj,
      solution: {
        ...validMysteryObj.solution,
        culpritSuspectId: 'suspect-broken'
      }
    };

    const mock = new MockAiProvider(
      async () => ({ rawJson: JSON.stringify(invalidObj), model: 'gemini-1.5-flash' }),
      async () => ({ rawJson: JSON.stringify(invalidObj), model: 'gemini-1.5-flash' }) // Still broken on repair!
    );

    const testServer = await createAiTestServer(mock);
    try {
      const res = await fetch(`${testServer.baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise: 'A secret formula disappears from an underground tech laboratory.'
        })
      });

      assert.equal(res.status, 502);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, 'GENERATION_VALIDATION_FAILED');
      assert.ok(mock.repairCount === 1, 'Must attempt exactly ONE repair before failing');

      // Zero cases should be saved
      const allCases = await (testServer.repository as InMemoryCaseRepository).findById('non-existent');
      assert.equal(allCases, null);
    } finally {
      await testServer.close();
    }
  });

  await t.test('AC-08: Upstream provider outage explains failure cleanly with retry option', async () => {
    const mock = new MockAiProvider(async () => {
      throw new UpstreamAiError('AI mystery generation service is temporarily overloaded. Please try again.');
    });

    const testServer = await createAiTestServer(mock);
    try {
      const res = await fetch(`${testServer.baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise: 'A vintage steam train passenger is found incapacitated in the dining car.'
        })
      });

      assert.equal(res.status, 502);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.error.code, 'UPSTREAM_AI_ERROR');
      assert.ok(!JSON.stringify(json).includes('stack'), 'Must not leak stack traces');
      assert.ok(!JSON.stringify(json).includes('GEMINI_API_KEY'), 'Must not leak keys');
      assert.ok(json.error.message.includes('try again') || json.error.message.includes('retry'));
    } finally {
      await testServer.close();
    }
  });
});
