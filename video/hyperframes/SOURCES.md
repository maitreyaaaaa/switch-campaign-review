# Video asset sources and disclosures

## UI reference and copy
- The real desktop screenshot inspected in the session showed the Switch Console shell and a Mattermost expired-session login spinner; no room messages were captured.
- UI implementation: `index.html`, coded for this illustrative video from the observed shell layout and the project's checked-in fictional fixture documentation.
- Project facts: `../../docs/phase-six-verification.md`, `../../campaign-review-private-room.yaml`, and `../../reviewer-instructions.md`.
- On-screen notice: “UI RECREATION · ILLUSTRATIVE DEMO” plus “FICTIONAL CAMPAIGN DATA”. The room acknowledgment reflects the internally verified flow.

## Synthetic narration
- Generated locally with Kokoro-ONNX 0.6.1, Kokoro-82M v1.0, and `af_sky` at speed 1.0.
- Model: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0.
- Voice is synthetic; no user voice recording is used.
- Source script: `audio/narration.txt`; generated audio: `audio/narration.wav`.

## Music
- Track: “Infinity” by Arulo, 1:43, downloaded from [Mixkit's electronic music library](https://mixkit.co/free-stock-music/electronic/).
- Asset URL: `https://assets.mixkit.co/music/440/440.mp3`.
- License: [Mixkit Free License](https://mixkit.co/license/modal/musicFree/). The license permits online marketing / social / YouTube video use; do not redistribute the track by itself.
- Track is used as a quiet instrumental bed under narration; music credit is shown in the video.

## Captions
- Generated from the synthetic WAV using local Whisper `small.en`.
- Burned-in captions are derived from `audio/narration.srt`; the SRT is included separately.
