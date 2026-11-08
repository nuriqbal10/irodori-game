---
name: playtest-qa
description: Test and QA the Godot web game on desktop and mobile: scripted checks for lesson data, quiz logic, UI touch, performance, and a manual iPhone Safari checklist. Use whenever the user says test, bug, crash, error, lag, "it doesn't work on iPhone", before every release, or after adding content.
---

# QA and playtest

## Automated checks (run often)
1. Data validation: `res://tools/validate_lessons.gd` (required keys, unique IDs, answer in choices, audio exists, kana present).
2. Quiz smoke test scene: 10 items per type, no errors.
3. Dialogue graph test: every node reachable, no dead ends, `end` exists.
4. Export test: web export succeeds and file sizes under limits.

## Manual device checklist (iPhone Safari + Android Chrome)
- [ ] Loads in under ~15 s on mobile data; progress bar visible.
- [ ] Tap-to-start works; audio plays.
- [ ] Buttons reachable with thumbs; nothing under notch.
- [ ] Joystick/camera drag does not scroll the page or zoom.
- [ ] Japanese text renders (no squares); furigana aligned.
- [ ] Rotate device: layout stays usable.
- [ ] Save/load progress after refresh.
- [ ] 10 minutes of play without memory crash.

## Bug report format
Title, device/browser, steps, expected, actual, build/commit, screenshot/console log.
Fix workflow: reproduce -> smallest fix -> re-test on same device -> add a check so it cannot regress.
