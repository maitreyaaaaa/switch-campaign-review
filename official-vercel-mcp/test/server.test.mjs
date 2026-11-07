import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/server';

const serverPath = fileURLToPath(new URL('../src/server.mjs', import.meta.url));

test('stdio server lists all six read-only tools and completes the fictional demo flow', async () => {
  const child = spawn(process.execPath, [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, CAMPAIGN_REVIEW_SOURCE: 'fictional-demo' },
  });
  const lines = createInterface({ input: child.stdout });
  let nextId = 0;

  function request(method, params) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}.`)), 5000);
      const onLine = (line) => {
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          clearTimeout(timeout);
          lines.off('line', onLine);
          reject(new Error(`The MCP server returned invalid JSON: ${line}`));
          return;
        }
        if (message.id !== id) return;
        clearTimeout(timeout);
        lines.off('line', onLine);
        resolve(message);
      };
      lines.on('line', onLine);
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    });
  }

  try {
    const initialized = await request('initialize', {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'campaign-review-test', version: '1.0.0' },
    });
    assert.equal(initialized.error, undefined);
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);

    const listed = await request('tools/list', {});
    const names = listed.result.tools.map((tool) => tool.name).sort();
    assert.deepEqual(names, [
      'assess_ste100_subset',
      'build_claim_review_card',
      'check_campaign',
      'explain_promise',
      'review_campaign_copy',
      'verify_claim_quotes',
    ]);

    const campaign = await request('tools/call', { name: 'check_campaign', arguments: {} });
    const campaignResult = JSON.parse(campaign.result.content[0].text);
    assert.equal(campaignResult.demoData, true);
    assert.match(campaignResult.evidenceSource, /not live Official evidence/);
    assert.equal(campaignResult.findings.length, 2);

    const copyText = 'CSV export is available to every account. Internal testers in the US can use CSV export today.';
    const review = await request('tools/call', {
      name: 'review_campaign_copy',
      arguments: { copyText },
    });
    const reviewResult = JSON.parse(review.result.content[0].text);
    assert.equal(reviewResult.demoData, true);
    assert.equal(reviewResult.findings[0].status, 'Contradicted');
    assert.equal(reviewResult.findings[1].status, 'Supported');

    const quoteCheck = await request('tools/call', {
      name: 'verify_claim_quotes',
      arguments: {
        copyText,
        claims: [
          { index: 1, quote: 'CSV export is available to every account.' },
          { index: 2, quote: 'Internal testers in the US can use CSV export today.' },
        ],
      },
    });
    assert.equal(JSON.parse(quoteCheck.result.content[0].text).allQuotesPresent, true);

    const cards = await request('tools/call', {
      name: 'build_claim_review_card',
      arguments: {
        copyText,
        claims: [
          { index: 1, quote: 'CSV export is available to every account.', findingId: 'draft-all-accounts' },
          { index: 2, quote: 'Internal testers in the US can use CSV export today.', findingId: 'draft-internal-testers-us' },
        ],
      },
    });
    const cardResult = JSON.parse(cards.result.content[0].text);
    assert.equal(cardResult.demoData, true);
    assert.deepEqual(cardResult.cards.map((card) => card.status), ['Contradicted', 'Supported']);

    const promise = await request('tools/call', {
      name: 'explain_promise',
      arguments: { draftId: 'draft-internal-testers-us' },
    });
    assert.equal(JSON.parse(promise.result.content[0].text).demoData, true);

    const called = await request('tools/call', {
      name: 'verify_claim_quotes',
      arguments: {
        copyText: 'CSV export is open to everyone.',
        claims: [{ index: 1, quote: 'CSV export is open to everyone.' }],
      },
    });
    const result = JSON.parse(called.result.content[0].text);
    assert.equal(result.allQuotesPresent, true);
    assert.equal(result.claims[0].exactQuotePresent, true);
    assert.equal(called.result.isError, undefined);

    const styleCheck = await request('tools/call', {
      name: 'assess_ste100_subset',
      arguments: {
        copyText: 'Internal testers can use CSV export today.',
        styleType: 'descriptive',
      },
    });
    const styleResult = JSON.parse(styleCheck.result.content[0].text);
    assert.equal(styleResult.meetsTarget, true);
    assert.equal(styleResult.scorePercent, 100);
    assert.equal(JSON.stringify(styleResult).includes('Internal testers'), false);
    assert.equal(styleCheck.result.isError, undefined);
  } finally {
    lines.close();
    child.stdin.end();
    if (child.exitCode === null) {
      await Promise.race([
        new Promise((resolve) => child.once('close', resolve)),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    }
    if (child.exitCode === null) child.kill();
  }
});
