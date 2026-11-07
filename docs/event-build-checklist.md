# Event build checklist

## Built in the submission repository

- [x] Create an isolated reviewer room template and instructions.
- [x] Add the read-only MCP adapter and multi-claim copy flow.
- [x] Add an 80% STE100-inspired sentence-length target for copy suggestions. This checks sentence length only, not full standard compliance.
- [x] Add automated checks for input, hashing, quote integrity, sentence-to-claim coverage hints, endpoint scope, evidence fields, and failure handling.
- [x] Write a README, phased plan, real-world integration note, and demo storyboard.

## Still needs live proof

- [x] Create the local reviewer agent and private room. The Switch-linked Mattermost login is `user`; its sign-in details were opened from Switch Console and used to sign in.
- [x] Create an accessible private fallback room. The original `campaign-review-event` channel still returns "Channel Not Found" to the linked account. Imported and used `campaign-review-private-2026-11-07.yaml` to create `campaign-review-private-2026-11-07`, bridged to Local Mattermost with `official-reviewer-event` and the linked `user` account. The room is private.
- [x] Authenticate the isolated Switch reviewer profile. A fresh tagged request started a Codex session after sign-in.
- [x] Point the isolated profile's `official-campaign-review` MCP entry to this repository's six-tool adapter. The live fixture run invoked all six tools: `review_campaign_copy`, `verify_claim_quotes`, `build_claim_review_card`, `check_campaign`, `explain_promise`, and `assess_ste100_subset`.
- [ ] Restore the evidence source for a live Official review. A fresh GET on November 7, 2026 returned HTTP 503: `FalkorDB could not complete this check. Drafts have not changed.` Fixture mode can verify Switch workflow behavior, but it is not live Official evidence.
- [x] Run the fixture chat rehearsals in the private fallback room. The six-tool run verified quote checks, finding IDs, audience scope, evidence times, wording suggestion, STE100 sentence-length result, and explicit fixture labeling. A second behavioral run split two compound sentences into four claims and left two unsupported claims `Unknown`. Both stopped at `WAITING_FOR_HUMAN_CHOICE`. The person later posted `USE SUGGESTION` with the review reference. The reviewer echo and `DECISION_RECORDED` state remain unverified because the embedded Mattermost room view is stuck loading. Repeat with Official if its source recovers.
- [ ] Record the actual run and narration. Add captions and an `.srt`, render the 16:9 video, and inspect the final video. Label the fixture mode in the video if the live source remains unavailable.
- [x] Record observed local versions: Switch Console 0.40.1, Node.js v24.13.1, npm 11.8.0, and Docker 29.9.2. Mattermost's local status endpoint is healthy but omits its version.
- [ ] Rehearse the documented setup from a clean checkout and record exact Mattermost version and integration steps.
- [ ] Review the repo, README, and video together. The official submission route currently renders only “Pulling up this hackathon,” so the actual form is not verified. A person must submit from the entrant's own account: the [official rules](https://www.wemakedevs.org/hackathons/switch/rules) prohibit submission by bots, scripts, macros, or automated agents. Do not treat the page shell as a completed submission.

## Submission deadline

The official schedule says submissions close **November 7, 2026 at 11:59 PM IST**. It asks for a repository, demo video, and README: [official schedule](https://www.wemakedevs.org/hackathons/switch/schedule).
