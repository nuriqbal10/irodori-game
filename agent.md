# Project: Nihongo Quest (3D Japanese learning game)

## Goal
Educational 3D game that teaches Japanese using the Irodori curriculum:
kanji, vocabulary (goi), grammar (bunpou), listening (choukai), reading (dokkai),
conversation (kaiwa), and expressions (hyougen). Each Irodori chapter becomes a 3D location.

## Tech stack (do not change without asking)
- Engine: Godot 4.x (latest stable), language: GDScript ONLY (no C#, C# cannot export to web)
- Renderer: Compatibility (gl_compatibility)
- Target: Web (HTML5), hosted on Cloudflare Pages. Must run in iPhone Safari and Android Chrome.
- Dev machine: Windows laptop
- Orientation: landscape, touch-first. Mouse must also work (emulated touch) for PC testing.

## Hard rules
1. Lesson content lives in JSON under `res://data/`, never hardcoded in scripts.
2. 3D style: low-poly, small textures, simple lighting. Budget is mobile web.
3. Japanese text uses the subset font (see skill `japanese-font-subset`).
4. All UI tap targets >= 64 px tall at 1080x1920 base; test with mouse-as-touch.
5. Audio must start only after a user tap ("Tap to start" screen) because of Safari.
6. No plugins/addons without asking the user first.
7. Keep every exported file under 25 MiB (Cloudflare Pages per-file limit; verify current limit).
8. Do not copy Irodori text/audio/illustrations into the repo unless the user confirms
   they have permission. Default: use placeholder or self-written content at Irodori level.
9. Prefer small, working increments. After each feature: run the game, then export to web and test.

## Folder layout
res://scenes/   res://scripts/   res://data/lessons/   res://data/kanji/
res://audio/    res://fonts/     res://ui/           res://tools/

## Skills (in .agents/skills)
godot-web-cloudflare, godot-mobile-ui, japanese-content-data, dialogue-system,
quiz-system, audio-listening, japanese-font-subset, irodori-level-design,
playtest-qa, web-performance

## Agent roles (in docs/agent-roles)
game-designer, gameplay-programmer, content-builder, qa-playtester, art-audio-planner

## Communication
Reply to the user in Indonesian. Code, comments, and file names in English.
The user is a beginner: explain steps simply, give exact menu paths in Godot.
