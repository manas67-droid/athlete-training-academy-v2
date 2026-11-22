import test from 'node:test';
import assert from 'node:assert';
import {
  calculateLevel,
  getLevelRank,
  getNextLevelThreshold,
  getXpProgressPercent,
  normalizeMonthlyXP,
  getTotalMonthlyXP,
  LEVEL_THRESHOLDS,
} from '../src/firebase/xpUtils';

test('XP Level Calculations', async (t) => {
  await t.test('calculates correct level for rookie athletes (< 100 XP)', () => {
    assert.strictEqual(calculateLevel(0), 'Rookie');
    assert.strictEqual(calculateLevel(50), 'Rookie');
    assert.strictEqual(calculateLevel(99), 'Rookie');
  });

  await t.test('calculates correct level for competitor athletes (100 - 299 XP)', () => {
    assert.strictEqual(calculateLevel(100), 'Competitor');
    assert.strictEqual(calculateLevel(250), 'Competitor');
    assert.strictEqual(calculateLevel(299), 'Competitor');
  });

  await t.test('calculates correct level for champions (300 - 999 XP)', () => {
    assert.strictEqual(calculateLevel(300), 'Champion');
    assert.strictEqual(calculateLevel(500), 'Champion');
    assert.strictEqual(calculateLevel(999), 'Champion');
  });

  await t.test('calculates correct level for elite athletes (>= 1000 XP)', () => {
    assert.strictEqual(calculateLevel(1000), 'Elite Athlete');
    assert.strictEqual(calculateLevel(2500), 'Elite Athlete');
  });
});

test('Level Rank Weights', async (t) => {
  await t.test('returns appropriate numerical ranks for comparison and sorting', () => {
    assert.strictEqual(getLevelRank('Rookie'), 1);
    assert.strictEqual(getLevelRank('Competitor'), 2);
    assert.strictEqual(getLevelRank('Champion'), 3);
    assert.strictEqual(getLevelRank('Elite Athlete'), 4);
    assert.strictEqual(getLevelRank('Unknown'), 1);
  });
});

test('Next Level Thresholds & Progress Percentages', async (t) => {
  await t.test('returns next target threshold correctly', () => {
    assert.strictEqual(getNextLevelThreshold(50), LEVEL_THRESHOLDS.competitor); // 100
    assert.strictEqual(getNextLevelThreshold(150), LEVEL_THRESHOLDS.champion); // 300
    assert.strictEqual(getNextLevelThreshold(400), LEVEL_THRESHOLDS.elite); // 1000
    assert.strictEqual(getNextLevelThreshold(1200), 1500); // 1000 + 500
  });

  await t.test('computes percentage progression cleanly within brackets', () => {
    // 50 XP in rookie (0 to 100) -> 50%
    assert.strictEqual(getXpProgressPercent(50), 50);

    // 200 XP in competitor (100 to 300 range is 200, 200 - 100 = 100) -> 50%
    assert.strictEqual(getXpProgressPercent(200), 50);

    // 0 XP -> 0%
    assert.strictEqual(getXpProgressPercent(0), 0);
  });
});

test('Monthly XP Aggregations', async (t) => {
  await t.test('normalizes missing monthly week buckets without crashing', () => {
    const normalized = normalizeMonthlyXP({ w1: 100, w2: 50 });
    assert.strictEqual(normalized.w1, 100);
    assert.strictEqual(normalized.w2, 50);
    assert.strictEqual(normalized.w3, 0);
    assert.strictEqual(normalized.w4, 0);
  });

  await t.test('sums total monthly XP correctly', () => {
    const total = getTotalMonthlyXP({
      w1: 150,
      w2: 200,
      w3: 50,
      w4: 100,
      w5: 0,
      w6: 0,
      w7: 0,
    });
    assert.strictEqual(total, 500);
  });
});
