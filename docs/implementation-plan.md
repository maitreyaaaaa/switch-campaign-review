# Campaign Claim Review: phased implementation plan

## Product goal

Help a marketing team check product claims against reviewed rollout evidence in a Switch room. A person provides the copy. The reviewer checks each claim, shows the evidence and its scope, suggests wording only when the evidence supports it, and asks the person to record a decision. The workflow does not change or publish campaign content.

## Current starting point

- The submission repository now has an isolated Switch room template and reviewer prompt.
- The submission MCP adapter exposes `review_campaign_copy`, `verify_claim_quotes`, `build_claim_review_card`, `check_campaign`, `explain_promise`, and `assess_ste100_subset` for one fictional Alder & Finch campaign.
- The adapter defaults to a fixed Official demo endpoint with HTTPS GET. It does not send the copy text or write to Official. An explicit `fictional-demo` mode supports offline integration rehearsals and labels its data as a local fixture.
- The current code implements the bounded copy input, local reference, evidence packet, and constrained agent instructions. Earlier rehearsals stopped at the human-choice gate; internal follow-up verified the reviewer echo and `DECISION_RECORDED` state. The deployed Official demo endpoint is connected and serves fictional campaign data.
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

**Execute/verify skills:** `javascript-testing-patterns` for response-contract and failure tests; `systematic-debugging` for tracing a failed source request across the endpoint and backing service before attempting a repair. Acceptance evidence is a validated current packet or an explicit fail-closed error.

**Build:** Fetch the current Official review once for the draft. Return the campaign findings, their draft IDs, statuses, audiences, reasons, evidence, and the source check time. The reviewer may map a claim only to a returned finding. It must not guess a draft ID or merge unrelated findings.

**Gate:** Every claim has a matching finding or `Unknown`. A failed source request stops the review and does not produce a guessed result.

### Phase 4 — Show the evidence card

**Build skills:** `data-quality-frameworks` and `api-security-best-practices` for provenance, freshness, and bounded data exposure.

**Execute/verify skills:** `javascript-testing-patterns` for required/optional provenance fields and missing-time cases; `e2e-testing` for checking how a populated evidence card appears in the actual Switch room. Acceptance evidence is a card whose source observation time remains distinct from its check time and whose unavailable fields stay unavailable. Internal verification confirmed the full review and decision exchange in the Switch room.

**Build:** For each claim, show its status, audience, reason, source label and detail, evidence observation time when present, and review check time. Distinguish source observation time from check time.

**Gate:** Each non-Unknown result has a cited finding. Missing timestamps stay missing; the reviewer does not replace them with the current time.

### Phase 5 — Suggest safe wording

**Build skills:** `ai-agent-development` and `autonomous-agents` for grounded output and safe failure behavior.

**Execute/verify skills:** `agent-evaluation` for supported, unsupported, audience-mismatched, and Unknown wording cases; `javascript-testing-patterns` for deterministic evidence and card-contract checks. Acceptance evidence is that every factual phrase in a suggestion maps to cited evidence, with no suggestion for Unknown. Prompt instructions alone are not proof; this behavior needs a live agent rehearsal.

**Build:** Offer a shorter alternative only when the returned evidence supports every part of it. Preserve the evidence audience and timing. Do not add promises. Do not suggest final wording for an Unknown claim.

**Gate:** Each suggestion maps to cited evidence. Otherwise the reviewer says that it cannot suggest wording yet.

### Phase 6 — Record the human decision

**Build skills:** `autonomous-agents` and `api-security-best-practices` for human control and prevention of external side effects.

**Execute/verify skills:** `e2e-testing` for the room conversation from review reference through an explicit human choice; `agent-evaluation` for checking that the reviewer waits, repeats the selected choice, and does not treat its own recommendation as approval. Acceptance evidence is a visible `WAITING_FOR_HUMAN_CHOICE` state, followed by the person's explicit choice and a reviewer echo with `DECISION_RECORDED` visible in the Switch room. This flow was internally verified.

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
- **Verified internally:** The adapter is configured in the live Switch profile. All six review tools completed the claim-by-claim workflow; the person made an explicit choice and the reviewer echoed it with `DECISION_RECORDED` visible in the room. The deployed Official demo endpoint returned its fictional campaign findings with HTTP 200.
- **Not part of this build:** campaign edits, approvals inside Official, publication, or claims based on real customer/product data.

### Phase evidence

| Phase | Current state | Evidence or remaining gate |
|---|---|---|
| 1. Receive the draft | Built and exercised in Switch with fictional demo data | `review_campaign_copy` returned a review reference for the fictional two-sentence copy. The copy limit and local hash are covered by local checks. The deployed Official review route returned HTTP 200. |
| 2. Extract claims | Built and exercised with simple and compound copy | In the second run, the quote tool mapped four exact claim clauses across two sentences with no unmatched quotes. The reviewer identified both sentences as compound and separated each clause. One behavioral run is useful acceptance evidence, not a statistical reliability estimate. |
| 3. Check evidence | Exercised against connected fictional Official demo data | The reviewer classified the broad audience claim as Contradicted, the US internal tester availability claim as Supported, and the unsupported setup-time and error-reduction claims as `Unknown`. |
| 4. Show evidence | Built and internally verified in the Switch room | The four-claim response included current findings for the two availability clauses and explicit missing-evidence explanations for the two `Unknown` clauses, with source and check times kept distinct. |
| 5. Suggest safe wording | Built and exercised with compound and unsupported claims | The reviewer suggested “Internal testers in the US can use CSV export today,” containing only the supported clause. The 10-word descriptive sentence passed the selected 25-word limit; this is not full ASD-STE100 compliance. |
| 6. Record the human choice | Complete and internally verified | The person posted `USE SUGGESTION` with the review reference; the reviewer echoed the choice in the Switch room and showed `DECISION_RECORDED`. No campaign content changed or was published. See `phase-six-verification.md`. |

### Current Switch run result

The initial November 7 rehearsals stopped at `WAITING_FOR_HUMAN_CHOICE`. In the internal follow-up, the person posted `USE SUGGESTION` with the review reference; the reviewer echoed the choice and showed `DECISION_RECORDED` in the Switch room. The deployed Official review endpoint returned HTTP 200 with fictional demo findings. The room decision records the person's choice; it does not edit or publish campaign content.

The local check on November 7, 2026 passed all 19 tests, including the STE100 79.6% boundary and sentence-map coverage cases. Two earlier Switch rehearsals stopped at `WAITING_FOR_HUMAN_CHOICE`; after those runs, the team internally verified the explicit choice, reviewer echo, and visible `DECISION_RECORDED` state in the room. The live Official endpoint later returned HTTP 200 with the connected synthetic campaign findings. The project owner confirmed the completed room flow; no campaign content changed or was published.

The submission repository, README, setup templates, supporting documentation, and video source are published at [maitreyaaaaa/switch-campaign-review](https://github.com/maitreyaaaaa/switch-campaign-review). Phase six is complete and internally verified. The rendered demo includes the verified acknowledgment. The original submission has already been made; review the rendered MP4 before using it as the final submission video.

## Real-world path after the demo

Replace the fixed fictional endpoint with an authenticated, read-only connector to the company’s approved feature rollout and release records. Add campaign and audience access controls before handling real copy. Keep any CMS or publishing integration out of scope until a separate human approval gate is designed and tested.

For a concrete example, a SaaS launch claim says CSV export is available to all customers. The approved rollout record shows internal testers only. The reviewer flags the scope mismatch, cites the rollout record and its times, and proposes wording for internal testers. A product owner or marketer records the decision in team chat. See `real-world-connection.md` for the integration path and next safe extensions.
