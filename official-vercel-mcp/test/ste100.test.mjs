import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSte100Subset } from '../src/ste100.mjs';

test('scores descriptive sentences against the 25-word limit and an 80% target', () => {
  const text = 'CSV export is ready for internal testers today. '
    + 'The feature is available to approved internal tester accounts in the US during the preview.';
  const result = assessSte100Subset(text);

  assert.equal(result.sentenceLimit, 25);
  assert.equal(result.sentenceCount, 2);
  assert.equal(result.scorePercent, 100);
  assert.equal(result.meetsTarget, true);
  assert.match(result.limitation, /sentence length only/);
});

test('uses the 20-word limit for procedural text', () => {
  const text = 'Open the settings page. '
    + 'Select CSV export, choose the accounts that need access, and save the change.';
  const result = assessSte100Subset(text, 'procedural');

  assert.equal(result.sentenceLimit, 20);
  assert.deepEqual(result.sentences.map((sentence) => sentence.withinLimit), [true, true]);
});

test('reports the percentage when some sentences exceed the limit', () => {
  const longSentence = `CSV export ${'supports many different account groups '.repeat(7)}today.`;
  const result = assessSte100Subset(`Short claim. ${longSentence}`);

  assert.equal(result.scorePercent, 50);
  assert.equal(result.meetsTarget, false);
  assert.equal(result.sentences[1].withinLimit, false);
});

test('passes when exactly 80% of sentences meet the selected limit', () => {
  const text = [
    'One short claim.',
    'Two short claims.',
    'Three short claims.',
    'Four short claims.',
    `Long claim ${'with several extra words '.repeat(7)}today.`,
  ].join(' ');
  const result = assessSte100Subset(text);

  assert.equal(result.scorePercent, 80);
  assert.equal(result.meetsTarget, true);
});

test('does not pass a score that rounds to 80% but is below the target', () => {
  const shortSentences = Array.from({ length: 43 }, () => 'Short claim.');
  const longSentence = `Long claim ${'with several extra words '.repeat(7)}today.`;
  const text = [...shortSentences, ...Array.from({ length: 11 }, () => longSentence)].join(' ');
  const result = assessSte100Subset(text);

  assert.equal(result.sentenceCount, 54);
  assert.equal(result.passingSentences, 43);
  assert.equal(result.scorePercent, 79.6);
  assert.equal(result.meetsTarget, false);
});

test('rejects empty, over-limit, and unsupported style input', () => {
  assert.throws(() => assessSte100Subset('   '));
  assert.throws(() => assessSte100Subset('x'.repeat(8001)));
  assert.throws(() => assessSte100Subset('Short sentence.', 'technical'));
});
