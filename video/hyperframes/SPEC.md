# Video spec — Campaign Review Room

## Goal
Show Flip the Switch Track 01 evaluators one useful, reproducible team workflow: a teammate brings a fictional campaign draft to a reviewer agent in Switch, the agent checks each claim against connected read-only evidence, and the person decides what to do. Message: **Review launch claims against evidence in a shared Switch room, then let the person decide what to use.** The UI is recreated from the observed Switch Console shell; keep it labeled as an illustrative UI recreation.

## Story and duration
- Arc: risky promise → shared review → evidence narrows the claim → human choice → safer launch workflow.
- Target: about 90 seconds, 1920×1080, 30 fps. The clean user-recorded narration sets the final duration.
- New information or an editorial change every 2–5 seconds. Hold each evidence row 3–5 seconds; extend holds if needed instead of speeding speech.
- Hook appears on frame one. Switch appears within 5 seconds and its role is clear within 15 seconds.
- No black slates, blank frames, empty audio gaps, or waits for an interface. Reading holds show evidence and sit over narration or the music bed.

## Visual language
- Recreated Switch-like UI, based on the observed console shell and verified campaign-review text. Persistent `UI RECREATION · ILLUSTRATIVE DEMO` and `FICTIONAL CAMPAIGN DATA` labels are required. Show the verified reviewer echo and `DECISION_RECORDED` room state.
- Landscape 16:9; crop to the relevant evidence/action while preserving legibility.
- Existing measured colors: warm ground #fffefa, ink #20342e, green #31583d and #557a5c, muted gold #b49c67. Use only for annotations; keep app status colors untouched.
- Existing typography: Georgia 500 display; DM Sans 400/700 body/captions. Keep text in the center 80% safe area. Minimum 28 px at 1080p for overlays.
- One active proof point at a time. Keep editorial labels short and outside the app's text.

## Motion
- Open on the real draft with a decisive crop and the question “What does the evidence support?”
- Explain the workflow using a flat editorial rail: Person → Switch room → Existing agent → Read-only adapter → Evidence. Label it as a workflow map.
- Advance one restrained crop/outline across the four actual findings. Each row lands, reads, then joins the complete result.
- Match-cut once from the supported row to the exact suggested sentence. Hold it still while read.
- Show the human-authored choice and the internally verified reviewer acknowledgment.
- Close with one sentence and the project name.
- Use deterministic, finite HyperFrames/GSAP motion: smooth 0.25–0.45s moves, direct cuts, one semantic match cut. Avoid fake cursor, bounce, loops, ornamental depth, flashes, glow, grain, and empty transitions.

## Audio and captions
- Natural user-recorded English, target 130–140 words per minute. Keep narration above the bed.
- Quiet, licensed, lyric-free instrumental music under the whole cut, including proof holds.
- Add sound cues only for actual recorded actions or neutral transitions; no fake clicks or typing.
- Burn in synchronized captions and provide a separate .srt. At most two lines; split at natural clauses; target at or below 17 characters per second. This is a conservative target below Netflix's adult English guideline of 20 cps: https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide
- Captions and editorial labels must not duplicate a complete sentence already legible in the interface.

## Assets
Needed: coded UI reconstruction, verified fictional campaign copy, synthetic Kokoro narration, licensed Mixkit music, and Whisper captions. The video is an illustrative explainer, not a Switch screen recording. Keep the UI-recreation and fictional-data labels visible. A vector workflow rail is built as motion graphics. See SOURCES.md for provenance and licensing.

## Skills
- product-launch-video: story arc, spoken copy, storyboard.
- hyperframes + hyperframes-core + hyperframes-animation: composition, deterministic motion, timing, render checks.
- hyperframes-creative: visual hierarchy and design system.
- media-use: voice, licensed audio, captions, genuine media treatment.
- launch-film-critique: post-render check for pacing, legibility, dead time, and claim accuracy.
- The supplied motion-design-skills pack informs hook craft, beat maps, pacing, restrained sound, and critique. Its After Effects connection requirement is reference-pack guidance, not a requirement for this HyperFrames project. No reference videos were supplied, so motion-reference-analysis is unnecessary for this planning pass.
