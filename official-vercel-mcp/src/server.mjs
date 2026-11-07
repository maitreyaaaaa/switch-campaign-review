import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { assessSte100Subset } from './ste100.mjs';
import { FICTIONAL_DEMO_REVIEW } from './fictional-demo-review.mjs';
import {
  DEFAULT_REVIEW_URL,
  buildClaimReviewCards,
  claimQuotesSchema,
  conciseReview,
  copyTextSchema,
  readOfficialReview,
  reviewCampaignCopy,
  validateReviewUrl,
  verifyClaimQuotes,
} from './review.mjs';

const draftIdSchema = z.string().regex(/^draft-[a-z0-9-]{1,80}$/);

function toolError(error) {
  const message = error instanceof Error ? error.message : 'Unknown endpoint error.';
  return {
    content: [{ type: 'text', text: `Could not verify the campaign: ${message}` }],
    isError: true,
  };
}

export function createServer({
  reviewUrl = DEFAULT_REVIEW_URL,
  fetchImpl = fetch,
  reviewMode = process.env.CAMPAIGN_REVIEW_SOURCE ?? 'official',
} = {}) {
  const checkedReviewUrl = validateReviewUrl(reviewUrl);
  if (!['official', 'fictional-demo'].includes(reviewMode)) {
    throw new Error('CAMPAIGN_REVIEW_SOURCE must be official or fictional-demo.');
  }
  const getReview = () => reviewMode === 'fictional-demo'
    ? Promise.resolve({
      ...conciseReview(FICTIONAL_DEMO_REVIEW),
      evidenceSource: 'Fictional local campaign fixture; not live Official evidence',
      demoData: true,
    })
    : readOfficialReview({ reviewUrl: checkedReviewUrl.href, fetchImpl });
  const evidencePackets = new Map();
  const server = new McpServer({ name: 'official-campaign-review-mcp-server', version: '1.2.0' });
  server.server.onerror = (error) => console.error(error.stack ?? error.message);

  server.registerTool('check_campaign', {
    title: 'Check campaign',
    description: reviewMode === 'fictional-demo'
      ? 'Read the clearly labeled fictional local Alder & Finch demo fixture. This is not live Official evidence. It does not send draft text, record activity, or change campaign data.'
      : 'Read all current findings for the fictional Alder & Finch CSV export campaign. This calls one fixed HTTPS GET endpoint. It does not send draft text, record activity, or change campaign data.',
    inputSchema: z.object({}).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async () => {
    try {
      return { content: [{ type: 'text', text: JSON.stringify(await getReview()) }] };
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool('review_campaign_copy', {
    title: 'Review launch copy',
    description: reviewMode === 'fictional-demo'
      ? 'Prepare an evidence packet from the clearly labeled fictional local Alder & Finch demo fixture; this is not live Official evidence. Accepts up to 8,000 characters and hashes the exact copy locally. The copy is not sent or stored. This tool does not extract claims, decide matches, draft wording, record a human choice, or change or publish content.'
      : `Prepare a current evidence packet for launch copy in the Switch room. Accepts up to 8,000 characters, hashes the exact copy locally, and reads the fixed fictional campaign review with HTTPS GET. The copy text is not sent to Official or stored by this adapter. This tool does not extract claims, decide which finding matches a claim, draft new wording, record a human choice, or change or publish content. Use the returned findings as the only evidence set for the agent's claim-by-claim review.`,
    inputSchema: z.object({
      copyText: copyTextSchema.describe('The exact launch copy pasted by the person into this Switch room.'),
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ copyText }) => {
    try {
      const packet = await reviewCampaignCopy(copyText, { readReview: getReview });
      const now = Date.now();
      for (const [reference, stored] of evidencePackets) {
        if (stored.expiresAt <= now) evidencePackets.delete(reference);
      }
      evidencePackets.delete(packet.copyReference);
      evidencePackets.set(packet.copyReference, { packet, expiresAt: now + 15 * 60 * 1000 });
      while (evidencePackets.size > 10) evidencePackets.delete(evidencePackets.keys().next().value);
      return { content: [{ type: 'text', text: JSON.stringify(packet) }] };
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool('build_claim_review_card', {
    title: 'Build claim review cards',
    description: 'Build a structured result for each quoted claim using the latest review packet for the exact copy. The quote must occur in the copy and any finding ID must be present in that packet. A null finding ID returns Unknown. This validates references and exact text only; the agent must still decide whether the finding semantically matches the claim and whether every claim was extracted.',
    inputSchema: z.object({
      copyText: copyTextSchema.describe('The exact copy used in the current review.'),
      claims: z.array(z.object({
        index: z.number().int().min(1).max(50),
        quote: z.string().min(1).max(500),
        findingId: draftIdSchema.nullable(),
      }).strict()).max(50).superRefine((claims, context) => {
        claims.forEach((claim, offset) => {
          if (claim.index !== offset + 1) context.addIssue({
            code: 'custom', path: [offset, 'index'], message: 'Claim indexes must start at 1 and increase without gaps.',
          });
        });
      }).describe('Claims in order. Use null when no finding can be matched.'),
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ copyText, claims }) => {
    try {
      const checked = verifyClaimQuotes(copyText, claims.map(({ index, quote }) => ({ index, quote })));
      const stored = evidencePackets.get(checked.copyReference);
      if (!stored || stored.expiresAt <= Date.now()) evidencePackets.delete(checked.copyReference);
      const result = buildClaimReviewCards(copyText, claims, stored?.expiresAt > Date.now() ? stored.packet : null);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool('verify_claim_quotes', {
    title: 'Verify claim quotes',
    description: 'Check whether each numbered claim quote appears exactly in the launch copy and return a punctuation-based sentence map with unmatched sentence indexes. Use after extracting claims and before matching them to campaign findings. Inspect every sentence; an unmatched sentence may contain a missed claim, and a sentence with a quote may contain additional claims. This map is a review aid, not proof of completeness. The tool makes no network request and stores or returns no copy text.',
    inputSchema: z.object({
      copyText: copyTextSchema.describe('The exact copy that the person pasted into this room.'),
      claims: claimQuotesSchema.describe('Exact claim quotes in order, numbered from 1. Use an empty list only when the copy has no verifiable product claims.'),
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ copyText, claims }) => {
    try {
      return { content: [{ type: 'text', text: JSON.stringify(verifyClaimQuotes(copyText, claims)) }] };
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool('assess_ste100_subset', {
    title: 'Assess STE100 sentence length',
    description: 'Check sentence length in copy against the ASD-STE100 Issue 9 maximum for descriptive (25 words) or procedural (20 words) text. Returns the percentage of sentences within the limit and whether the project 80% target passes. This is a narrow style check, not full STE100 compliance; it does not check vocabulary, grammar, meaning, or evidence support. Makes no network request and stores no copy.',
    inputSchema: z.object({
      copyText: copyTextSchema.describe('The exact sentence or suggested copy to assess.'),
      styleType: z.enum(['descriptive', 'procedural']).default('descriptive').describe('Use descriptive for campaign claims and procedural for instructions.'),
    }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ copyText, styleType }) => {
    try {
      return { content: [{ type: 'text', text: JSON.stringify(assessSte100Subset(copyText, styleType)) }] };
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool('explain_promise', {
    title: 'Explain reviewed promise',
    description: 'Return one named draft finding and its reviewed evidence from the same read-only campaign review. Use only a draft ID returned by check_campaign or review_campaign_copy.',
    inputSchema: z.object({ draftId: draftIdSchema }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ draftId }) => {
    try {
      const review = await getReview();
      const finding = review.findings.find((item) => item.draftId === draftId);
      if (!finding) {
        return { content: [{ type: 'text', text: 'The draft was not found in the fictional campaign.' }], isError: true };
      }
      return { content: [{ type: 'text', text: JSON.stringify({ checkedAt: review.checkedAt, evidenceSource: review.evidenceSource ?? 'Official read-only review endpoint', demoData: review.demoData ?? false, finding }) }] };
    } catch (error) {
      return toolError(error);
    }
  });

  return server;
}

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  const handle = serveStdio(createServer);
  process.stdin.once('end', () => handle.close().catch(() => undefined));
  console.error('Official campaign review MCP server ready on stdio');
}
