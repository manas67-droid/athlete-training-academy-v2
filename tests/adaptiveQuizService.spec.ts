import test from 'node:test';
import assert from 'node:assert';
import {
  generateAdaptiveQuizSession,
  getAllQuestionBank,
  getQuestionsByTopic,
} from '../src/services/adaptiveQuizService';

test('Adaptive Quiz Engine - Question Bank Integrity', async (t) => {
  await t.test('loads curriculum question bank with valid option counts', () => {
    const allQuestions = getAllQuestionBank();
    assert.ok(allQuestions.length >= 10, 'Question bank should contain at least 10 curriculum questions');
    for (const q of allQuestions) {
      assert.ok(q.id, 'Question must have an id');
      assert.ok(q.question, 'Question must have prompt text');
      assert.ok(Array.isArray(q.options) && q.options.length >= 2, 'Question must have at least 2 options');
      assert.strictEqual(typeof q.correctOptionIndex, 'number', 'Question must have an integer correctOptionIndex');
      assert.ok(q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length);
    }
  });

  await t.test('retrieves questions specific to a module topic', () => {
    const tueQuestions = getQuestionsByTopic('tue');
    assert.ok(tueQuestions.length > 0, 'TUE module must contain quiz questions');
    assert.ok(tueQuestions.every((q) => q.question.length > 5));
  });
});

test('Adaptive Quiz Engine - Session Generation', async (t) => {
  await t.test('generates rapid_fire session with requested question count', () => {
    const session = generateAdaptiveQuizSession({}, { mode: 'rapid_fire', targetQuestionCount: 5 });
    assert.strictEqual(session.questions.length, 5);
    assert.strictEqual(session.title, 'Rapid-Fire Quiz Arena');
    assert.ok(session.timeLimitSeconds > 0);
    assert.ok(session.possibleXP > 0);
  });

  await t.test('generates adaptive_revision session prioritizing weak topics (score < 80%)', () => {
    const quizScores = {
      tue: 60, // Weak topic
      'anti-doping-basics': 95, // Strong topic
    };

    const session = generateAdaptiveQuizSession(quizScores, {
      mode: 'adaptive_revision',
      targetQuestionCount: 5,
    });

    assert.strictEqual(session.title, 'Adaptive Revision Challenge');
    assert.ok(session.targetTopics.includes('tue'), 'Adaptive revision session should target weak topic tue');
    assert.strictEqual(session.questions.length, 5);
  });

  await t.test('generates topic_challenge session for specific target module', () => {
    const session = generateAdaptiveQuizSession({}, {
      mode: 'topic_challenge',
      targetModuleKey: 'supplements',
      targetQuestionCount: 2,
    });

    assert.ok(session.title.includes('Challenge'));
    assert.ok(session.questions.length > 0);
    assert.ok(session.questions.length <= 2);
  });
});
