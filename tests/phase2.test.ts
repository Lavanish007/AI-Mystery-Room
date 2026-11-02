import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/dist/index.js';
import { InMemoryCaseRepository } from '../server/dist/repositories/inMemoryCase.repository.js';

// Helper to start the test server on an ephemeral port
async function createTestServer() {
  const repository = new InMemoryCaseRepository();
  const { app, caseService } = createApp(repository);

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

test('Phase 2: API and Persistence Acceptance Criteria', async (t) => {
  const testEnv = await createTestServer();

  t.after(async () => {
    await testEnv.close();
  });

  const validPremise = 'A renowned art collector was found poisoned inside his locked gallery vault after an exclusive midnight viewing.';

  let createdCaseId: string;

  await t.test('AC-01: Valid premise creates and persists case with suspects and evidence', async () => {
    const res = await fetch(`${testEnv.baseUrl}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        premise: validPremise,
        settings: {
          genre: 'contemporary mystery',
          difficulty: 'medium'
        }
      })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.caseId);
    assert.equal(json.data.status, 'ready');
    assert.equal(json.data.premise, validPremise);
    assert.ok(Array.isArray(json.data.suspects));
    assert.ok(json.data.suspects.length >= 3, 'Must have at least 3 suspects');
    assert.ok(Array.isArray(json.data.evidence));
    assert.ok(json.data.evidence.length >= 3, 'Must have at least 3 items of evidence');
    assert.ok(Array.isArray(json.data.timeline));
    assert.ok(json.data.timeline.length >= 2, 'Must have at least 2 timeline events');

    createdCaseId = json.data.caseId;
  });

  await t.test('AC-02: Invalid or empty premise rejects with 400 and inline validation', async () => {
    // Too short (< 30 chars)
    const shortRes = await fetch(`${testEnv.baseUrl}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ premise: 'Too short' })
    });
    assert.equal(shortRes.status, 400);
    const shortJson = await shortRes.json();
    assert.equal(shortJson.success, false);
    assert.ok(shortJson.error.fieldErrors?.premise);

    // Empty premise
    const emptyRes = await fetch(`${testEnv.baseUrl}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ premise: '   ' })
    });
    assert.equal(emptyRes.status, 400);
  });

  await t.test('AC-03: Refresh / Subsequent GET retains identical case and solution', async () => {
    const res1 = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}`);
    assert.equal(res1.status, 200);
    const json1 = await res1.json();

    const res2 = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}`);
    assert.equal(res2.status, 200);
    const json2 = await res2.json();

    assert.deepEqual(json1.data, json2.data);
    assert.equal(json1.data.caseId, createdCaseId);
  });

  await t.test('AC-04: Pre-answer public API strictly redacts culprit and isRedHerring flag', async () => {
    const res = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}`);
    const bodyText = await res.text();

    // Verify secret fields are not leaked in JSON string
    assert.ok(!bodyText.includes('"solution"'), 'Body must not contain "solution"');
    assert.ok(!bodyText.includes('"culpritSuspectId"'), 'Body must not contain "culpritSuspectId"');
    assert.ok(!bodyText.includes('"isRedHerring"'), 'Body must not leak "isRedHerring"');

    const json = JSON.parse(bodyText);
    assert.equal(json.data.hasSubmitted, false);
    for (const ev of json.data.evidence) {
      assert.equal((ev as any).isRedHerring, undefined);
    }
  });

  await t.test('Pre-submission guard: GET /cases/:caseId/result returns 403', async () => {
    const res = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/result`);
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, 'NOT_YET_ANSWERED');
  });

  await t.test('AC-05: Progressive hint unlock does not disclose culprit and limits to 3', async () => {
    // Hint 1
    const h1 = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 1 })
    });
    assert.equal(h1.status, 200);
    const j1 = await h1.json();
    assert.equal(j1.data.level, 1);
    assert.equal(j1.data.remainingHints, 2);

    // Hint 2
    const h2 = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(h2.status, 200);
    const j2 = await h2.json();
    assert.equal(j2.data.level, 2);
    assert.equal(j2.data.remainingHints, 1);

    // Hint 3
    const h3 = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(h3.status, 200);
    const j3 = await h3.json();
    assert.equal(j3.data.level, 3);
    assert.equal(j3.data.remainingHints, 0);

    // Exceeding 3 hints should be rejected
    const h4 = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/hints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(h4.status, 400);

    // Verify unlockedHints reflected on public case view
    const caseRes = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}`);
    const caseJson = await caseRes.json();
    assert.equal(caseJson.data.unlockedHints.length, 3);
    assert.equal(caseJson.data.remainingHints, 0);
  });

  await t.test('AC-06: Invalid suspect ID is rejected with 400 without revealing answer', async () => {
    const res = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedSuspectId: 'suspect-non-existent-999',
        rationale: 'I think it was them!'
      })
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, 'INVALID_SUSPECT_ID');
  });

  await t.test('AC-06: Valid answer scores against canonical solution and reveals verdict', async () => {
    // Fetch suspect list to choose a suspect
    const caseRes = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}`);
    const caseData = (await caseRes.json()).data;
    const chosenSuspect = caseData.suspects[0];

    const answerRes = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedSuspectId: chosenSuspect.suspectId,
        rationale: 'The timeline contradicts their alibi statement.'
      })
    });

    assert.equal(answerRes.status, 200);
    const answerJson = await answerRes.json();
    assert.equal(answerJson.success, true);
    assert.equal(typeof answerJson.data.isCorrect, 'boolean');
    assert.ok(answerJson.data.solution.culpritSuspectId);
    assert.ok(answerJson.data.solution.motive);
    assert.ok(answerJson.data.solution.method);
    assert.ok(Array.isArray(answerJson.data.solution.decisiveEvidenceIds));

    // Duplicate answer submission is rejected with 409
    const dupRes = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedSuspectId: chosenSuspect.suspectId
      })
    });
    assert.equal(dupRes.status, 409);

    // Post-submission GET /result succeeds now
    const resultRes = await fetch(`${testEnv.baseUrl}/cases/${createdCaseId}/result`);
    assert.equal(resultRes.status, 200);
    const resultJson = await resultRes.json();
    assert.equal(resultJson.success, true);
    assert.equal(resultJson.data.caseId, createdCaseId);
  });
});
