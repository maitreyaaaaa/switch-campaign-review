---
format: 1920x1080
duration: 90s
message: "A person and an agent review fictional campaign claims in a Switch room using a clearly labeled local fixture, then wait for the person's decision."
arc: "Four clauses → Shared room → Contradicted, Supported, and Unknown → Evidence-based suggestion → Human-choice gate → Real-world path"
audience: "Flip the Switch Track 01 evaluators"
mode: autonomous
---

## Frame 1 — The claim

- status: outline
- src: compositions/frames/01-claim.html
- duration: 8s
- transition_in: cut
- scene: The actual compound sample opens the story; a fictional-data label is visible.
- voiceover: "Marketing copy can reach farther than a product rollout."

Use the real chat message. Do not recreate the prompt or product interface.

## Frame 2 — The shared room

- status: outline
- src: compositions/frames/02-room.html
- duration: 10s
- transition_in: cut
- scene: Switch room header, real reviewer participant, and the test request.
- voiceover: "In this fictional rehearsal, a campaign says CSV export is available to every account, takes seconds to set up, and reduces manual errors by 80%. A teammate asks the reviewer to check the claims in a Switch room."

Show the actual room. Hide unrelated message history, account details, and old error output.

## Frame 3 — Evidence scope

- status: outline
- src: compositions/frames/03-check.html
- duration: 18s
- transition_in: cut
- scene: The actual response table shows one Contradicted claim, one Supported claim, and two Unknown claims.
- voiceover: "The local fixture supports CSV export for internal testers in the US today. It contradicts access for every account. It has no evidence for setup time or error reduction, so the reviewer marks those claims Unknown."

Keep the fixture marker and evidence times visible. Do not say this is live Official evidence.

## Frame 4 — Compound claims

- status: outline
- src: compositions/frames/04-result.html
- duration: 14s
- transition_in: cut
- scene: The actual review explains that each sentence contains two factual claims.
- voiceover: "The exact quote check maps four clauses across two sentences. The broad audience claim is contradicted. The setup-time and 80% outcome claims stay Unknown."

Use the actual room text. Do not add evidence for the Unknown claims.

## Frame 5 — Supported wording and STE100 subset

- status: outline
- src: compositions/frames/05-wording.html
- duration: 12s
- transition_in: cut
- scene: The actual suggestion and its 10-word descriptive sentence-length result.
- voiceover: "The reviewer suggests one sentence that keeps only the supported audience and timing: Internal testers in the US can use CSV export today."

Show the sentence-length result and state that it is not full ASD-STE100 compliance.

## Frame 6 — The human-choice gate

- status: outline
- src: compositions/frames/06-decision.html
- duration: 13s
- transition_in: cut
- scene: The actual `WAITING_FOR_HUMAN_CHOICE` state and three choices remain visible.
- voiceover: "This run uses fictional local demo data because the live Official evidence service is unavailable. The reviewer now waits for a person's choice. No choice was recorded. No campaign content changed or was published."

Do not imply a choice was made or stage one for the recording.

## Frame 7 — Real-world path

- status: outline
- src: compositions/frames/07-roles.html
- duration: 9s
- transition_in: cut
- scene: The real room stays visible while text describes a read-only connection to approved rollout records.
- voiceover: "In a real marketing team, connect the review to approved rollout records. Switch keeps the discussion with the team, and a person decides what copy to use."

These are explanatory overlays around the actual product view, not app controls.

## Frame 8 — Close

- status: outline
- src: compositions/frames/08-close.html
- duration: 6s
- transition_in: cut
- scene: Return to the actual room with a short truthful closing statement.
- voiceover: "No draft changed. Nothing was published."

End with the label “Fictional local fixture. Live Official source unavailable.”
