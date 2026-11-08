---
name: godot-mobile-ui
description: Build touch-friendly, responsive Godot 4 UI and controls for phones (landscape) that also work with a mouse on PC. Use whenever the task involves menus, HUD, buttons, virtual joystick, touch input, screen scaling, safe area, or "UI looks too small/cut off on phone".
---

# Mobile-first Godot UI

## Layout rules
- Use `Control` nodes with anchors and containers (`MarginContainer`, `VBoxContainer`, `HBoxContainer`, `GridContainer`). Never position by pixels.
- Base resolution 1920x1080, stretch `canvas_items` / `expand`.
- Minimum tap target 64 px height (prefer 96 px for answer buttons). Spacing between buttons >= 16 px.
- Keep important UI away from screen edges (notch/rounded corners): wrap in `MarginContainer` with 48 px margin. Use `DisplayServer.get_display_safe_area()` when available.
- Use a single `Theme` resource (`res://ui/theme.tres`) for fonts, colors, button styles.

## Controls
- Movement: virtual joystick (left thumb). Interact: large button (right thumb). Camera: drag on right half.
- Implement input through `InputEventScreenTouch` / `InputEventScreenDrag`. With "Emulate Touch From Mouse" ON the same code works on PC.
- Also map keyboard (WASD/arrows, E/Space) to the same actions in Input Map for desktop testing.
- Provide a `Pause` button always visible.

## Text
- Body text >= 32 px, furigana >= 20 px. Use the subset Japanese font (skill `japanese-font-subset`).
- Use `RichTextLabel` for furigana or colored grammar highlights.

## Pattern: reusable scenes
`ui/AnswerButton.tscn`, `ui/DialogueBox.tscn`, `ui/Joystick.tscn`, `ui/TapToStart.tscn`. Each scene exposes signals, not direct references to game logic.

## Checklist before finishing a UI task
1. Runs at 1920x1080, 1280x720, and portrait-rotated sanity check.
2. All buttons usable with mouse-as-touch.
3. No text overflow with the longest Japanese string in data.
