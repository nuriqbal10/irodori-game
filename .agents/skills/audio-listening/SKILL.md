---
name: audio-listening
description: Handle listening (choukai) audio in Godot 4 for the web build: playback controls, replay limits, loading on demand, compression, transcript reveal, and Safari autoplay restrictions. Use whenever the task involves audio, sound effects, music, listening questions, text-to-speech, announcements, or "no sound on iPhone".
---

# Listening audio

## Playback
- `AudioStreamPlayer` managed by `AudioManager` (autoload). Buses: Master, Music, SFX, Voice. Settings sliders per bus.
- Listening question UI: Play button, replay counter (default 2 plays), speed toggle (1.0x / 0.8x via `pitch_scale` with a pitch-shift effect, or pre-rendered slow clips), transcript hidden until answered.
- Always provide the transcript as accessibility fallback.

## Web/Safari rules
- Audio context starts only after user gesture: first scene must be `TapToStart` which calls a first play on tap.
- Use `.ogg` (Vorbis) at mono, 22-32 kHz for voice, 64-96 kbps. Keep clips short.
- Load audio on demand per chapter (`ResourceLoader.load_threaded_request` or load when entering a location). Do not preload all chapters.
- Keep total build under per-file limits (see skill `godot-web-cloudflare`).

## Sources
- Only use audio the user has rights to. If none exists, mark `audio: null` in JSON and show text; later generate voice with a licensed Japanese TTS and save as .ogg.
- Name files `a1/ch01/l001.ogg` matching the `audio` field in JSON.

## Background music/SFX
Few loops, low volume, ducking while Voice plays (`AudioEffectCompressor` sidechain or manual volume tween).
