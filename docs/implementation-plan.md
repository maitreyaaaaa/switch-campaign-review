# Campaign Claim Review: phased implementation plan

## Product goal

Help a marketing team check product claims against reviewed rollout evidence in a Switch room. A person provides the copy. The reviewer checks each claim, shows the evidence and its scope, suggests wording only when the evidence supports it, and asks the person to record a decision. The workflow does not change or publish campaign content.

## Current starting point

- The submission repository now has an isolated Switch room template and reviewer prompt.
- The submission MCP adapter exposes `review_campaign_copy`, `verify_claim_quotes`, `build_claim_review_card`, `check_campaign`, `explain_promise`, and `assess_ste100_subset` for one fictional Alder & Finch campaign.
- The adapter defaults to a fixed Official demo endpoint with HTTPS GET. It does not send the copy text or write to Official. An explicit `fictional-demo` mode supports offline integration rehearsals and labels its data as a local fixture.
- The current code implements the bounded copy input, local reference, evidence packet, and constrained agent instructions. Unit checks pass. A fresh Switch room completed the full claim-by-claim rehearsal against the explicitly labeled local fixture and stopped at the human-choice gate; live Official evidence remains unavailable.
- The old `Application/switch/` prototype remains reference material, not evidence of the hackathon run.

## Design boundaries

- Use the Switch agent to split copy into claims and compare claims with the reviewed findings. Do not add another model provider.
- Treat reviewed findings as source data. Do not invent a finding, source, date, audience, or status.
- Use `Unknown` when a claim has no matching finding or when evidence is missing, stale, or unclear.
- Keep the source endpoint read-only. Do not add a tool that edits, approves, or publishes campaign content.
- Keep the human decision in the Switch room. Use a short review reference to link the decision to the copy that was checked.
- Clearly label all Alder & Finch data as fictional.

## Six build phases

### Phase 1 — Receive the draft

**Build skills:** `product-manager` for the user job and acceptance conditions; `api-design-principles` and `agent-tool-builder` for the input contract.

**Execute/verify skills:** `javascript-testing-patterns` for empty, over-limit, valid, and repeated-input checks. Acceptance evidence is a stable local reference for identical text, rejection at the input boundaries, and no source text in the tool response. A Switch-room paste remains live-flow evidence and is not established by local tests.

**Build:** Let a person paste one launch post, email, or other copy into the Switch room. Add a bounded `review_campaign_copy` tool input. Do not store or send the copy to Official; use a local SHA-256 reference for the exact text.

**Gate:** Empty or over-limit text is rejected with a clear error. A valid draft gets a stable reference. The tool response does not include the original copy.

### Phase 2 — Extract the claims

**Build skills:** `ai-agent-development` and `autonomous-agents` for a constrained, single-agent workflow.

**Execute/verify skills:** `agent-evaluation` for claim-extraction behavior and `javascript-testing-patterns` for exact-quote presence, order, sentence mapping, unmatched sentences, and compound-claim cases. Acceptance evidence is a sample review where every sentence is classified and every quote maps to source text. A passing local quote-map test does not establish that the live agent found every semantic claim; that requires a Switch run.

**Build:** Instruct the reviewer to list each verifiable product claim as a short exact quote. Include claims about availability, audience, timing, compatibility, and outcomes. Keep opinions and calls to action out of the claim list. Use `verify_claim_quotes` to check each quote and return a punctuation-based sentence-to-quote map. The reviewer must classify unmatched sentences, check quoted sentences for additional claims, and split compound claims before `build_claim_review_card` validates selected finding IDs against the current packet. The map aids extraction review but does not prove semantic matching or completeness.

**Gate:** Every reported quote is present in the source copy and has an index; every sentence is inspected for missed or compound claims. If no verifiable claim exists, the reviewer says so. The sentence map is a review aid, not proof of complete extraction; verify the agent follows this gate in a Switch run.

### Phase 3 — Check each claim against evidence

**Build skills:** `mcp-builder`, `agent-tool-builder`, and `data-quality-frameworks` for narrow tools, clear errors, and evidence contracts.

**Execute/verify skills:** `javascript-testing-patterns` for response-contract and failure tests; `systematic-debugging` for tracing a failed source request across the endpoint and backing service before attempting a repair. Acceptance evidence is a validated current packet or an explicit fail-closed error. The current HTTP 503 is a real endpoint failure, not a test pass or evidence packet.

**Build:** Fetch the current Official review once for the draft. Return the campaign findings, their draft IDs, statuses, audiences, reasons, evidence, and the source check time. The reviewer may map a claim only to a returned finding. It must not guess a draft ID or merge unrelated findings.

**Gate:** Every claim has a matching finding or `Unknown`. A failed source request stops the review and does not produce a guessed result.

### Phase 4 — Show the evidence card

**Build skills:** `data-quality-frameworks` and `api-security-best-practices` for provenance, freshness, and bounded data exposure.

**Execute/verify skills:** `javascript-testing-patterns` for required/optional provenance fields and missing-time cases; `e2e-testing` for checking how a populated evidence card appears in the actual Switch room. Acceptance evidence is a card whose source observation time remains distinct from its check time and whose unavailable fields stay unavailable. Live rendering remains unverified while the source is down and the reviewer session cannot run.

**Build:** For each claim, show its status, audience, reason, source label and detail, evidence observation time when present, and review check time. Distinguish source observation time from check time.

**Gate:** Each non-Unknown result has a cited finding. Missing timestamps stay missing; the reviewer does not replace them with the current time.

### Phase 5 — Suggest safe wording

**Build skills:** `ai-agent-development` and `autonomous-agents` for grounded output and safe failure behavior.

**Execute/verify skills:** `agent-evaluation` for supported, unsupported, audience-mismatched, and Unknown wording cases; `javascript-testing-patterns` for deterministic evidence and card-contract checks. Acceptance evidence is that every factual phrase in a suggestion maps to cited evidence, with no suggestion for Unknown. Prompt instructions alone are not proof; this behavior needs a live agent rehearsal.

**Build:** Offer a shorter alternative only when the returned evidence supports every part of it. Preserve the evidence audience and timing. Do not add promises. Do not suggest final wording for an Unknown claim.

**Gate:** Each suggestion maps to cited evidence. Otherwise the reviewer says that it cannot suggest wording yet.

### Phase 6 — Record the human decision

**Build skills:** `autonomous-agents` and `api-security-best-practices` for human control and prevention of external side effects.

**Execute/verify skills:** `e2e-testing` for the room conversation from review reference through an explicit human choice; `agent-evaluation` for checking that the reviewer waits, repeats the selected choice, and does not treat its own recommendation as approval. Acceptance evidence is a visible `WAITING_FOR_HUMAN_CHOICE` state followed by a human-authored decision record. No successful live decision record exists yet.

**Build:** End with the review reference and one clear choice: use the suggested wording, keep the original, or request another review. After the person responds, repeat the choice and reference in the Switch room. State that no campaign changed. Add no write or publish tool.

**Gate:** The person’s own message is the decision record. The agent does not treat its suggestion as approval and does not act outside the room.

## Integration and verification phase

**Skill use:** `javascript-testing-patterns` for unit and MCP contract tests; `e2e-testing` for the Switch-room flow; `docs-architect` and `api-documentation` for setup and reproduction steps.

1. Test input limits, stable references, tool list, read-only request method, evidence fields, and failure behavior.
2. Run the full flow in a fresh Switch room: paste copy, extract claims, cite findings, suggest wording, and record the human choice.
3. Confirm the room is connected to the Switch-run agent. If the embedded Mattermost view fails, document and demonstrate the verified connected view.
4. Update the README with exact tested versions and commands. Record limitations and the fictional data boundary.
5. Record and review the demo only after the live flow passes.

## Build status

- **Built in the submission repo:** bounded copy input; local SHA-256 reference; fixed read-only evidence fetch; evidence-field validation; six read-only MCP tools, including exact quote validation, structured claim cards, and an STE100 sentence-length subset check; claim extraction, explicit workflow states, safe wording checks, and human-choice instructions; room template; phased plan; storyboard.
- **Added after the six phases:** `assess_ste100_subset` checks descriptive/procedural sentence length and reports whether at least 80% of sentences meet the selected limit. It does not assess the controlled dictionary or claim factuality.
- **Needs live proof:** The adapter is configured in the live Switch profile. Verify the full six-tool registry and rehearse all six tools against the clearly labeled fictional fixture. Repeat against Official when the evidence service is healthy to verify live source behavior. Record the actual run and label whether it uses fixture or live Official data.
- **Not part of this build:** campaign edits, approvals inside Official, publication, or claims based on real customer/product data.

### Phase evidence

| Phase | Current state | Evidence or remaining gate |
|---|---|---|
| 1. Receive the draft | Built and exercised in Switch with the local fixture | `review_campaign_copy` returned a review reference for the fictional two-sentence copy. The copy limit and local hash are covered by local checks. The separate live Official request still fails with HTTP 503. |
| 2. Extract claims | Built and exercised with simple and compound copy | In the second run, the quote tool mapped four exact claim clauses across two sentences with no unmatched quotes. The reviewer identified both sentences as compound and separated each clause. One behavioral run is useful acceptance evidence, not a statistical reliability estimate. |
| 3. Check evidence | Exercised with fictional fixture; live Official source unavailable | The reviewer classified the broad audience claim as Contradicted, the US internal tester availability claim as Supported, and the unsupported setup-time and error-reduction claims as `Unknown`. The live Official endpoint returned HTTP 503 on the last check. |
| 4. Show evidence | Built and exercised with the local fixture | The four-claim response included current findings for the two availability clauses and explicit missing-evidence explanations for the two `Unknown` clauses, with source and check times kept distinct. |
| 5. Suggest safe wording | Built and exercised with compound and unsupported claims | The reviewer suggested “Internal testers in the US can use CSV export today,” containing only the supported clause. The 10-word descriptive sentence passed the selected 25-word limit; this is not full ASD-STE100 compliance. |
| 6. Record the human choice | Built; exercised through the wait gate | Both runs stopped at `WAITING_FOR_HUMAN_CHOICE`. No choice was recorded. Only a person's explicit choice can move it to `DECISION_RECORDED`; `REVISE` starts a new review. |

### Current Switch run result


The original `campaign-review-event` room is still listed in Switch Console, but Mattermost returns `Channel Not Found` to the linked account. Its private-room settings show one agent and three people, and the linked account cannot add itself.

To make progress without changing that room's access, a private fallback room named `campaign-review-private-2026-11-07` was created from `campaign-review-private-room.yaml`. Switch confirms the linked `user` and `official-reviewer-event` are members. The isolated profile is configured to this repository's six-tool adapter in explicit `fictional-demo` mode. At 11:45 IST on November 7, 2026, all six tools completed a two-claim end-to-end rehearsal. It returned a fixture-labeled packet, exact quote mapping, two evidence cards, campaign findings, promise explanation, and sentence-length assessment. At 11:53 IST, a second behavioral run passed two compound sentences and four claim clauses through the reviewer. It marked the broad audience claim Contradicted, internal-US availability Supported, setup-time and 80% error-reduction claims `Unknown`, and suggested wording containing only the supported clause. It stopped at `WAITING_FOR_HUMAN_CHOICE`; no choice or campaign change was recorded. Both runs prove the live Switch workflow against local demo data, not live Official evidence. Fresh GET requests in this work session returned HTTP 503 from the Official endpoint and `/api/health`.

The local check on November 7, 2026 passed all 19 tests, including the STE100 79.6% boundary and sentence-map coverage cases. Two live Switch fixture runs completed through the human-choice gate; the compound-claim run explicitly kept two unsupported clauses `Unknown`. No decision was recorded because no explicit choice was made. Fresh GET requests in this work session returned HTTP 503 from the Official endpoint and `/api/health`; the connected Vercel account could not find the `official-sand` project, so runtime logs remain unavailable for repair.

On November 7, 2026, the submission repository, README, tests, setup templates, supporting documentation, and video source were committed and pushed to [maitreyaaaaa/switch-campaign-review](https://github.com/maitreyaaaaa/switch-campaign-review) at `0eea3f943f0a0f8db039827b5f53e4bd50ac49e7`. Remaining: restore and verify live Official evidence if possible, record the human choice in the private room, finish and inspect the rendered demo, then submit the repository, video, and README through the official form.

## Real-world path after the demo

Replace the fixed fictional endpoint with an authenticated, read-only connector to the company’s approved feature rollout and release records. Add campaign and audience access controls before handling real copy. Keep any CMS or publishing integration out of scope until a separate human approval gate is designed and tested.

For a concrete example, a SaaS launch claim says CSV export is available to all customers. The approved rollout record shows internal testers only. The reviewer flags the scope mismatch, cites the rollout record and its times, and proposes wording for internal testers. A product owner or marketer records the decision in team chat. See `real-world-connection.md` for the integration path and next safe extensions.
