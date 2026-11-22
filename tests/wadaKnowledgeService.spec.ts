import test from 'node:test';
import assert from 'node:assert';
import {
  searchWadaKnowledge,
  WADA_PROHIBITED_CLASSES,
  WADA_RULE_TOPICS,
  buildWadaSystemPrompt,
} from '../src/services/wadaKnowledgeService';

test('WADA Knowledge Engine - Prohibited List Classes', async (t) => {
  await t.test('contains all official WADA 2026 classifications (S0-S9, M1-M3, P1)', () => {
    const codes = WADA_PROHIBITED_CLASSES.map((c) => c.code);
    assert.ok(codes.includes('S0'), 'Must include S0 Non-approved substances');
    assert.ok(codes.includes('S1'), 'Must include S1 Anabolic Agents');
    assert.ok(codes.includes('S2'), 'Must include S2 Peptides & Growth Factors');
    assert.ok(codes.includes('S3'), 'Must include S3 Beta-2 Agonists');
    assert.ok(codes.includes('S4'), 'Must include S4 Hormone Modulators');
    assert.ok(codes.includes('S5'), 'Must include S5 Diuretics & Masking Agents');
    assert.ok(codes.includes('S6'), 'Must include S6 Stimulants');
    assert.ok(codes.includes('S7'), 'Must include S7 Narcotics');
    assert.ok(codes.includes('S8'), 'Must include S8 Cannabinoids');
    assert.ok(codes.includes('S9'), 'Must include S9 Glucocorticoids');
    assert.ok(codes.includes('M1-M3'), 'Must include M1-M3 Prohibited Methods');
    assert.ok(codes.includes('P1'), 'Must include P1 Beta-Blockers');
  });

  await t.test('searches and identifies Tramadol under S7 Narcotics', () => {
    const result = searchWadaKnowledge('tramadol');
    assert.ok(result.matchedClasses.length > 0, 'Should match prohibited class for Tramadol');
    const s7 = result.matchedClasses.find((c) => c.code === 'S7');
    assert.ok(s7, 'Tramadol must match S7 Narcotics');
    assert.strictEqual(s7.prohibitedWhen, 'IN_COMPETITION');
  });

  await t.test('searches and identifies Salbutamol dosage limits under S3 Beta-2 Agonists', () => {
    const result = searchWadaKnowledge('salbutamol');
    assert.ok(result.matchedClasses.length > 0);
    const s3 = result.matchedClasses.find((c) => c.code === 'S3');
    assert.ok(s3, 'Salbutamol must match S3 Beta-2 Agonists');
    assert.ok(s3.keyRules.some((r) => r.includes('1,600 micrograms')), 'Must state 1,600 mcg limit');
  });

  await t.test('searches and identifies Beta-blockers (P1) for precision sports like archery and shooting', () => {
    const result = searchWadaKnowledge('archery');
    assert.ok(result.matchedClasses.length > 0);
    const p1 = result.matchedClasses.find((c) => c.code === 'P1');
    assert.ok(p1, 'Archery must match P1 Beta-blockers');
  });
});

test('WADA Knowledge Engine - Core Regulatory Topics', async (t) => {
  await t.test('identifies Strict Liability principle under WADA Code Article 2.1', () => {
    const result = searchWadaKnowledge('strict liability');
    assert.ok(result.matchedTopics.length > 0);
    const topic = result.matchedTopics.find((t) => t.id === 'strict-liability');
    assert.ok(topic, 'Must find strict liability topic');
    assert.ok(topic.wadaCodeReference.includes('2.1'));
  });

  await t.test('identifies Therapeutic Use Exemptions (TUE) 30-day advance guideline', () => {
    const result = searchWadaKnowledge('tue');
    assert.ok(result.matchedTopics.length > 0);
    const topic = result.matchedTopics.find((t) => t.id === 'tue-regulations');
    assert.ok(topic, 'Must find TUE topic');
    assert.ok(topic.practicalAdviceEn.includes('30 days'));
  });

  await t.test('identifies Whereabouts and ADAMS 60-minute window rules', () => {
    const result = searchWadaKnowledge('whereabouts');
    assert.ok(result.matchedTopics.length > 0);
    const topic = result.matchedTopics.find((t) => t.id === 'whereabouts-adams');
    assert.ok(topic, 'Must find Whereabouts topic');
    assert.ok(topic.summaryEn.includes('60-minute'));
  });

  await t.test('generates valid grounded system prompt for Gemini LLM', () => {
    const prompt = buildWadaSystemPrompt({
      name: 'Manas',
      sport: 'Swimming',
      level: 'Competitor',
      xp: 220,
      language: 'en',
    });
    assert.ok(prompt.includes('Manas'));
    assert.ok(prompt.includes('Swimming'));
    assert.ok(prompt.includes('Strict Liability'));
    assert.ok(prompt.includes('WADA 2026 Prohibited List'));
  });
});
