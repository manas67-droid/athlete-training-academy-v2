import test from 'node:test';
import assert from 'node:assert';
import {
  lookupMedicineByBarcode,
  searchMedicinesByNameOrIngredient,
  TRUSTED_MEDICINE_DATABASE,
} from '../src/services/medicineReferenceService';

test('Medicine Reference - Barcode Verification', async (t) => {
  await t.test('correctly identifies verified paracetamol by barcode', () => {
    const result = lookupMedicineByBarcode('8901234567890');
    assert.strictEqual(result.isVerified, true);
    assert.strictEqual(result.status, 'ALLOWED');
    assert.ok(result.title.includes('Crocin 500'));
    assert.ok(result.activeIngredients.some((i) => i.includes('Paracetamol [ALLOWED]')));
  });

  await t.test('correctly identifies Dolo 650 by barcode as ALLOWED', () => {
    const result = lookupMedicineByBarcode('8901148210355');
    assert.strictEqual(result.isVerified, true);
    assert.strictEqual(result.status, 'ALLOWED');
    assert.ok(result.title.includes('Dolo 650'));
  });

  await t.test('never falsely classifies an unknown barcode as allowed or safe', () => {
    const result = lookupMedicineByBarcode('9999999999999');
    assert.strictEqual(result.isVerified, false);
    assert.strictEqual(result.status, 'UNKNOWN');
    assert.ok(result.guidance.includes('No verified reference entry was found'));
    assert.ok(result.disclaimer.includes('NOT mean a medication is permitted'));
  });
});

test('Medicine Reference - Name & Active Ingredient Search', async (t) => {
  await t.test('searches by brand name (e.g. Ventolin)', () => {
    const results = searchMedicinesByNameOrIngredient('Ventolin');
    assert.ok(results.length > 0);
    const ventolin = results[0];
    assert.strictEqual(ventolin.status, 'USE_WITH_CAUTION');
    assert.ok(ventolin.activeIngredients.some((i) => i.includes('Salbutamol')));
  });

  await t.test('identifies strictly prohibited substances (Stanozolol, Furosemide/Lasix)', () => {
    const stanozololResults = searchMedicinesByNameOrIngredient('Stanozolol');
    assert.ok(stanozololResults.length > 0);
    assert.strictEqual(stanozololResults[0].status, 'PROHIBITED');

    const lasixResults = searchMedicinesByNameOrIngredient('Lasix');
    assert.ok(lasixResults.length > 0);
    assert.strictEqual(lasixResults[0].status, 'PROHIBITED');
  });

  await t.test('identifies in-competition restricted decongestants (Sudafed)', () => {
    const sudafedResults = searchMedicinesByNameOrIngredient('Sudafed');
    assert.ok(sudafedResults.length > 0);
    // Overall status is USE_WITH_CAUTION because it is prohibited In-Competition only
    assert.strictEqual(sudafedResults[0].status, 'USE_WITH_CAUTION');
    assert.strictEqual(sudafedResults[0].matchedRecord?.inCompetitionStatus, 'PROHIBITED');
    assert.strictEqual(sudafedResults[0].matchedRecord?.outOfCompetitionStatus, 'ALLOWED');
  });

  await t.test('returns empty array for single-character or blank queries without crashing', () => {
    assert.deepStrictEqual(searchMedicinesByNameOrIngredient(''), []);
    assert.deepStrictEqual(searchMedicinesByNameOrIngredient('a'), []);
    assert.deepStrictEqual(searchMedicinesByNameOrIngredient('   '), []);
  });
});

test('WADA Integrity & Active Ingredient Data Contracts', async (t) => {
  await t.test('every record in TRUSTED_MEDICINE_DATABASE has mandatory safety fields', () => {
    assert.ok(TRUSTED_MEDICINE_DATABASE.length >= 6);
    for (const record of TRUSTED_MEDICINE_DATABASE) {
      assert.ok(record.id, 'Record must have an id');
      assert.ok(record.brandName, 'Record must have a brandName');
      assert.ok(record.genericName, 'Record must have a genericName');
      assert.ok(record.overallStatus, 'Record must have an overallStatus');
      assert.ok(['ALLOWED', 'USE_WITH_CAUTION', 'PROHIBITED'].includes(record.overallStatus));
      assert.ok(Array.isArray(record.activeIngredients));
      assert.ok(record.activeIngredients.length > 0);
      assert.ok(record.officialGuidance, 'Record must have officialGuidance');
      assert.ok(record.medicalDisclaimer, 'Record must have medicalDisclaimer');
      assert.ok(record.source, 'Record must have an authoritative source citation');
    }
  });
});
