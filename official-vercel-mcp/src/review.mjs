import { createHash } from 'node:crypto';
import { z } from 'zod';
import { splitCopySentences } from './copy-analysis.mjs';

export const DEFAULT_REVIEW_URL = 'https://official-sand.vercel.app/api/campaigns/campaign-csv-launch/review';
export const MAX_COPY_CHARS = 8000;
const REVIEW_STATUSES = new Set(['Supported', 'Contradicted', 'Unknown', 'Not checked']);

export const copyTextSchema = z.string()
  .min(1, 'Paste the launch copy to review.')
  .max(MAX_COPY_CHARS, `Copy must be ${MAX_COPY_CHARS} characters or less.`)
  .refine((value) => value.trim().length > 0, 'Paste the launch copy to review.');

const claimQuoteSchema = z.object({
  index: z.number().int().min(1).max(50).describe('Claim position in the copy. Start at 1 and use each next number once.'),
  quote: z.string().min(1).max(500).describe('A short exact quote from the copy, including punctuation and capitalization.'),
}).strict();

export const claimQuotesSchema = z.array(claimQuoteSchema).max(50).superRefine((claims, context) => {
  claims.forEach((claim, offset) => {
    if (claim.index !== offset + 1) {
      context.addIssue({
        code: 'custom',
        path: [offset, 'index'],
        message: 'Claim indexes must start at 1 and increase without gaps.',
      });
    }
  });
});

export function validateReviewUrl(value = DEFAULT_REVIEW_URL) {
  const url = new URL(value);
  if (url.protocol !== 'https:'
    || url.hostname !== 'official-sand.vercel.app'
    || url.pathname !== '/api/campaigns/campaign-csv-launch/review'
    || url.search
    || url.hash) {
    throw new Error('OFFICIAL_REVIEW_URL must be the read-only Alder & Finch Vercel review endpoint.');
  }
  return url;
}

export function createCopyReference(copyText) {
  return createHash('sha256').update(copyText, 'utf8').digest('hex');
}

function countOccurrences(text, quote) {
  let count = 0;
  let offset = 0;
  while ((offset = text.indexOf(quote, offset)) !== -1) {
    count += 1;
    offset += quote.length;
  }
  return count;
}

export function verifyClaimQuotes(copyText, claims) {
  const validatedCopy = copyTextSchema.parse(copyText);
  const validatedClaims = claimQuotesSchema.parse(claims);
  const results = validatedClaims.map(({ index, quote }) => ({
    index,
    exactQuotePresent: validatedCopy.includes(quote),
    occurrenceCount: countOccurrences(validatedCopy, quote),
  }));
  const sentences = splitCopySentences(validatedCopy);
  const sentenceClaimMap = sentences.map((sentence, offset) => ({
    sentenceIndex: offset + 1,
    claimIndexes: validatedClaims
      .filter(({ quote }) => sentence.includes(quote))
      .map(({ index }) => index),
  }));

  return {
    copyReference: createCopyReference(validatedCopy),
    allQuotesPresent: results.length > 0 && results.every((claim) => claim.exactQuotePresent),
    noVerifiableClaims: results.length === 0,
    claims: results,
    sentenceAudit: {
      sentences: sentenceClaimMap,
      unmatchedSentenceIndexes: sentenceClaimMap
        .filter((sentence) => sentence.claimIndexes.length === 0)
        .map((sentence) => sentence.sentenceIndex),
      limitation: 'Sentence splitting is punctuation based. An unmatched sentence may contain a missed claim, and a sentence with a quote may contain additional claims. Review each sentence and clause; this is not proof of extraction completeness.',
    },
  };
}

export function buildClaimReviewCards(copyText, claims, packet) {
  const checked = verifyClaimQuotes(copyText, claims.map(({ index, quote }) => ({ index, quote })));
  if (packet?.copyReference !== checked.copyReference) {
    throw new Error('Run review_campaign_copy for this exact copy first; its evidence packet is missing or expired.');
  }
  const cards = claims.map((claim, offset) => {
    const quoteCheck = checked.claims[offset];
    if (!quoteCheck.exactQuotePresent) throw new Error(`Claim ${claim.index} quote is not present in the exact copy.`);
    const finding = claim.findingId === null
      ? null
      : packet.findings.find((item) => item.draftId === claim.findingId);
    if (claim.findingId !== null && !finding) throw new Error(`Claim ${claim.index} finding ID is not in the current evidence packet.`);
    return {
      index: claim.index,
      quote: claim.quote,
      exactQuotePresent: true,
      occurrenceCount: quoteCheck.occurrenceCount,
      status: finding?.status ?? 'Unknown',
      finding: finding ?? null,
    };
  });
  return {
    copyReference: checked.copyReference,
    checkedAt: packet.checkedAt,
    evidenceSource: packet.evidenceSource,
    demoData: packet.demoData,
    cards,
    limitation: 'Finding selection is not semantic proof, and these cards do not prove that every claim was extracted.',
  };
}

function conciseEvidence(evidence = []) {
  if (!Array.isArray(evidence)) return [];
  return evidence.slice(0, 3).map((item) => ({
    id: item.id,
    label: item.label,
    detail: item.detail,
    kind: item.kind,
    observedAt: item.observedAt,
    reviewedBy: item.reviewedBy,
  }));
}

function conciseFinding(finding) {
  return {
    draftId: finding.draftId,
    title: finding.title,
    kind: finding.kind,
    text: finding.text,
    promiseText: finding.promiseText,
    featureName: finding.featureName,
    audienceName: finding.audienceName,
    status: finding.status,
    reason: finding.reason,
    evidence: conciseEvidence(finding.evidence),
  };
}

export function conciseReview(review) {
  if (review?.campaign?.id !== 'campaign-csv-launch' || !Array.isArray(review.findings)) {
    throw new Error('The deployed review returned an unexpected campaign response.');
  }
  if (typeof review.checkedAt !== 'string' || Number.isNaN(Date.parse(review.checkedAt))) {
    throw new Error('The deployed review did not return a valid check time.');
  }
  for (const finding of review.findings) {
    if (typeof finding?.draftId !== 'string'
      || !/^draft-[a-z0-9-]{1,80}$/.test(finding.draftId)
      || !REVIEW_STATUSES.has(finding.status)) {
      throw new Error('The deployed review returned an invalid finding.');
    }
    if (finding.status === 'Supported' && (!Array.isArray(finding.evidence) || finding.evidence.length === 0)) {
      throw new Error('The deployed review marked a finding Supported without evidence.');
    }
  }
  return {
    campaign: {
      id: review.campaign.id,
      name: review.campaign.name,
      companyName: review.campaign.companyName,
    },
    checkedAt: review.checkedAt,
    findings: review.findings.map(conciseFinding),
  };
}

export async function readOfficialReview({
  reviewUrl = DEFAULT_REVIEW_URL,
  fetchImpl = fetch,
} = {}) {
  const url = validateReviewUrl(reviewUrl);
  const response = await fetchImpl(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Official's deployed review endpoint returned HTTP ${response.status}.`);
  }
  return conciseReview(await response.json());
}

export async function reviewCampaignCopy(copyText, { readReview = readOfficialReview } = {}) {
  const validatedCopy = copyTextSchema.parse(copyText);
  const review = await readReview();
  return {
    copyReference: createCopyReference(validatedCopy),
    copyCharacterCount: validatedCopy.length,
    checkedAt: review.checkedAt,
    evidenceSource: review.evidenceSource ?? 'Official read-only review endpoint',
    demoData: review.demoData ?? false,
    campaign: review.campaign,
    findings: review.findings,
    dataBoundary: 'The launch copy was hashed locally. The copy text was not sent to Official and was not stored by this adapter.',
  };
}
