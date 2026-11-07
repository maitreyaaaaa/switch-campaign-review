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
- [x] Restore the live Official evidence source. On November 8, `/api/health` returned HTTP 200 with FalkorDB connected and the campaign-review GET returned HTTP 200 with four synthetic fixture findings. This verifies the deployed API path; it does not turn the fictional records into real-world evidence.
- [x] Mark the final phase complete in the offline fixture mock record. The person posted `USE SUGGESTION` with the review reference. `phase-six-mock-record.md` records `DECISION_RECORDED (MOCK)` and the private-room instructions define the simulated acknowledgment. The mock response was not run in Mattermost; no real reviewer reply or persistent decision record is claimed.
- [ ] Verify a real reviewer echo and live `DECISION_RECORDED` state in Mattermost. The embedded room view is stuck loading and the local Mattermost endpoint timed out. Repeat with live Official evidence only after its source recovers.
- [x] Render the 66-second 16:9 demo and add captions at `video/hyperframes/audio/narration.srt`. The submission README identifies the demo as a labeled Switch UI recreation using fictional data; inspect the final playback and narration timing before submission.
- [x] Record observed local versions: Switch Console 0.40.1, Node.js v24.13.1, npm 11.8.0, and Docker 29.9.2. Mattermost's local status endpoint is healthy but omits its version.
- [ ] Rehearse the documented setup from a clean checkout and record exact Mattermost version and integration steps.
- [ ] Review the repo, README, and video together. The official submission route currently renders only “Pulling up this hackathon,” so the actual form is not verified. A person must submit from the entrant's own account: the [official rules](https://www.wemakedevs.org/hackathons/switch/rules) prohibit submission by bots, scripts, macros, or automated agents. Do not treat the page shell as a completed submission.

## Submission deadline

The official schedule says submissions close **November 7, 2026 at 11:59 PM IST**. It asks for a repository, demo video, and README: [official schedule](https://www.wemakedevs.org/hackathons/switch/schedule).
