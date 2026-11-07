# Video spec

**GOAL:** Show that Switch connects a person and an existing agent in a shared campaign-review workflow. The current recording plan shows a fictional local fixture run and its human-choice gate. It does not claim live Official evidence or a completed human decision.

**OUTPUT:** HyperFrames, 1920×1080, 30 fps, H.264 MP4; aim for 90 seconds, with final duration driven by the user's real voice recording.

**LOOK:** Use real Switch team-chat capture as the picture. Official-inspired values from the existing UI: ground `#fffefa`, ink `#20342e`, primary green `#31583d`, supporting green `#557a5c`, and one muted-gold accent `#b49c67`. Display face Georgia 500; body face DM Sans 400/700. Overlay and caption text at least 28 px at 1080p; keep captions within the centre 80% title-safe area. No gradients, grain, glow, or fabricated UI.

**OBJECTS:** the actual private fallback room; the actual Official Reviewer participant; the fictional four-clause sample; Contradicted, Supported, and Unknown results; the local fixture marker; exact suggested wording; and the visible `WAITING_FOR_HUMAN_CHOICE` state.

**MOTION:** One main move per shot. Hold the real UI for 7–10 seconds when evidence is read. Use a click-led match cut from Console setup to the actual room, one 0.4–0.6 second push-in on the evidence, and cuts caused by real interface actions. Land overlay titles still; do not animate while they are read.

**SHOTS:** See `STORYBOARD.md`; eight outlined frames target 90 seconds before the real voice length is applied. Captions are synchronized to the user recording, burned in, and delivered as `.srt`. Audio is user-recorded voice; no music by default.

**BANNED:** invented app screens or chat messages; simulated agent results; unsupported claims; unlabeled fictional data; visible credentials or account details; unrelated feature tours; dark voids, glow, floating UI cards, repeated fade-and-slide entrances, decorative cursor effects, and logo-only openings. Do not show a choice that the person did not record.

**QA:** Check each statement against the actual Switch fixture response; keep the `demoData` marker visible; review every caption at 1080p; verify audio intelligibility; inspect scene midpoints and the end card; confirm no credentials, old error logs, or failed setup screens appear.
