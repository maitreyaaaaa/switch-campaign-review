import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_REVIEW_URL,
  MAX_COPY_CHARS,
  buildClaimReviewCards,
  claimQuotesSchema,
  conciseReview,
  copyTextSchema,
  createCopyReference,
  readOfficialReview,
  reviewCampaignCopy,
  validateReviewUrl,
  verifyClaimQuotes,
} from '../src/review.mjs';

const reviewFixture = {
  campaign: { id: 'campaign-csv-launch', name: 'CSV export launch', companyName: 'Alder & Finch' },
  checkedAt: '2026-11-07T00:00:00.000Z',
  findings: [{
    draftId: 'draft-all-accounts',
    title: 'CSV export availability',
    kind: 'availability',
    text: 'CSV export is available to every account.',
    promiseText: 'available to every account',
    featureName: 'CSV export',
    audienceName: 'every account',
    status: 'Contradicted',
    reason: 'The reviewed rollout is limited to internal testers.',
    evidence: [{
      id: 'evidence-s2',
      label: 'S2 rollout',
      detail: 'CSV export is enabled for internal tester accounts only.',
      kind: 'rollout',
      observedAt: '2026-11-06T10:00:00.000Z',
      reviewedBy: 'Product',
    }],
  }],
};

test('accepts non-empty copy up to the configured limit', () => {
  assert.equal(copyTextSchema.parse('CSV export is ready.'), 'CSV export is ready.');
  assert.equal(copyTextSchema.parse('x'.repeat(MAX_COPY_CHARS)).length, MAX_COPY_CHARS);
  assert.throws(() => copyTextSchema.parse('  '));
  assert.throws(() => copyTextSchema.parse('x'.repeat(MAX_COPY_CHARS + 1)));
});

test('copy references are stable and include exact whitespace', () => {
  const text = 'CSV export is ready.';
  assert.equal(createCopyReference(text), createCopyReference(text));
  assert.notEqual(createCopyReference(text), createCopyReference(`${text} `));
  assert.match(createCopyReference(text), /^[a-f0-9]{64}$/);
});

test('claim quote check accepts exact copy and reports missing quotes', () => {
  const copyText = 'PRIVATE-COPY-MARKER-7f09. CSV export is ready today. Only internal testers can use it.';
  const result = verifyClaimQuotes(copyText, [
    { index: 1, quote: 'CSV export is ready today.' },
    { index: 2, quote: 'Only internal testers can use it.' },
    { index: 3, quote: 'All customers can use it.' },
  ]);

  assert.equal(result.copyReference, createCopyReference(copyText));
  assert.equal(result.allQuotesPresent, false);
  assert.deepEqual(result.claims.map((claim) => claim.exactQuotePresent), [true, true, false]);
  assert.deepEqual(result.claims.map((claim) => claim.occurrenceCount), [1, 1, 0]);
  assert.deepEqual(result.sentenceAudit.sentences, [
    { sentenceIndex: 1, claimIndexes: [] },
    { sentenceIndex: 2, claimIndexes: [1] },
    { sentenceIndex: 3, claimIndexes: [2] },
  ]);
  assert.deepEqual(result.sentenceAudit.unmatchedSentenceIndexes, [1]);
  assert.equal(JSON.stringify(result).includes('PRIVATE-COPY-MARKER-7f09'), false);
});

test('sentence audit maps multiple quoted claims in one sentence without returning copy', () => {
  const copyText = 'CSV export is ready for internal testers, and every account can request access.';
  const result = verifyClaimQuotes(copyText, [
    { index: 1, quote: 'CSV export is ready for internal testers' },
    { index: 2, quote: 'every account can request access' },
  ]);

  assert.deepEqual(result.sentenceAudit.sentences, [{ sentenceIndex: 1, claimIndexes: [1, 2] }]);
  assert.deepEqual(result.sentenceAudit.unmatchedSentenceIndexes, []);
  assert.equal(JSON.stringify(result).includes(copyText), false);
});

test('claim quote indexes must be ordered and gaps are rejected', () => {
  assert.throws(() => claimQuotesSchema.parse([
    { index: 1, quote: 'First claim.' },
    { index: 3, quote: 'Third claim.' },
  ]));
});

test('empty claim list is reported as no verifiable claims', () => {
  const result = verifyClaimQuotes('A pleasant launch day.', []);
  assert.equal(result.noVerifiableClaims, true);
  assert.equal(result.allQuotesPresent, false);
  assert.deepEqual(result.claims, []);
  assert.deepEqual(result.sentenceAudit.unmatchedSentenceIndexes, [1]);
});

test('only the fixed HTTPS campaign review URL is accepted', () => {
  assert.equal(validateReviewUrl().href, DEFAULT_REVIEW_URL);
  assert.throws(() => validateReviewUrl('http://official-sand.vercel.app/api/campaigns/campaign-csv-launch/review'));
  assert.throws(() => validateReviewUrl('https://example.com/api/campaigns/campaign-csv-launch/review'));
  assert.throws(() => validateReviewUrl(`${DEFAULT_REVIEW_URL}?campaign=other`));
});

test('official review fetch uses GET and returns the reviewed evidence fields', async () => {
  let request;
  const review = await readOfficialReview({
    fetchImpl: async (url, options) => {
      request = { url: url.href, options };
      return { ok: true, json: async () => reviewFixture };
    },
  });

  assert.equal(request.url, DEFAULT_REVIEW_URL);
  assert.equal(request.options.method, 'GET');
  assert.equal(request.options.redirect, 'error');
  assert.equal('body' in request.options, false);
  assert.equal(review.checkedAt, reviewFixture.checkedAt);
  assert.equal(review.findings[0].evidence[0].observedAt, reviewFixture.findings[0].evidence[0].observedAt);
  assert.equal(review.findings[0].audienceName, 'every account');
});

test('review packet returns a local hash and evidence but does not echo copy text', async () => {
  const copyText = 'Draft marker: PRIVATE-COPY-MARKER-7f09. CSV export is available to every account.';
  const packet = await reviewCampaignCopy(copyText, { readReview: async () => conciseReview(reviewFixture) });

  assert.equal(packet.copyReference, createCopyReference(copyText));
  assert.equal(packet.copyCharacterCount, copyText.length);
  assert.equal(packet.checkedAt, reviewFixture.checkedAt);
  assert.equal(packet.findings[0].status, 'Contradicted');
  assert.equal(packet.findings[0].evidence[0].label, 'S2 rollout');
  assert.equal(JSON.stringify(packet).includes(copyText), false);
});

test('claim cards attach only current findings and preserve Unknown claims', () => {
  const copyText = 'CSV export is open to every account. The launch starts today.';
  const packet = {
    ...conciseReview(reviewFixture),
    copyReference: createCopyReference(copyText),
  };
  const result = buildClaimReviewCards(copyText, [
    { index: 1, quote: 'CSV export is open to every account.', findingId: 'draft-all-accounts' },
    { index: 2, quote: 'The launch starts today.', findingId: null },
  ], packet);

  assert.deepEqual(result.cards.map(({ status }) => status), ['Contradicted', 'Unknown']);
  assert.equal(result.cards[0].finding.evidence[0].label, 'S2 rollout');
  assert.match(result.limitation, /not semantic proof/);
  assert.equal(JSON.stringify(result).includes(copyText), false);
});

test('claim cards reject missing packets, unmatched quotes, and unreviewed finding IDs', () => {
  const copyText = 'CSV export is open to every account.';
  const packet = { ...conciseReview(reviewFixture), copyReference: createCopyReference(copyText) };
  const claim = [{ index: 1, quote: copyText, findingId: 'draft-all-accounts' }];
  assert.throws(() => buildClaimReviewCards(copyText, claim, null), /packet is missing or expired/);
  assert.throws(() => buildClaimReviewCards(copyText, [{ ...claim[0], quote: 'All accounts can export CSV.' }], packet), /not present/);
  assert.throws(() => buildClaimReviewCards(copyText, [{ ...claim[0], findingId: 'draft-guessed' }], packet), /not in the current evidence packet/);
});

test('invalid official review response fails closed', () => {
  assert.throws(() => conciseReview({ campaign: { id: 'other' }, findings: [], checkedAt: '2026-11-07T00:00:00Z' }));
  assert.throws(() => conciseReview({ campaign: { id: 'campaign-csv-launch' }, findings: [], checkedAt: 'unknown' }));
  assert.throws(() => conciseReview({
    ...reviewFixture,
    findings: [{ ...reviewFixture.findings[0], status: 'Probably supported' }],
  }));
  assert.throws(() => conciseReview({
    ...reviewFixture,
    findings: [{ ...reviewFixture.findings[0], status: 'Supported', evidence: [] }],
  }));
});
