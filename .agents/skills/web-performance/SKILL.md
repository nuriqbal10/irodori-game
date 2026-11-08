---
name: web-performance
description: Optimize a Godot 4 web (HTML5) 3D game for phones: draw calls, textures, lights, shadows, audio size, load time, memory. Use whenever the game is slow, laggy, heats up the phone, loads slowly, the build is too large, or before shipping a new level.
---

# Web performance budget (mobile)

## Targets
- 30+ FPS on mid-range phones; first load < 15 s on 4G; total build as small as possible.
- Per scene: < 150k triangles visible, < 100 draw calls, <= 1-2 lights, no real-time shadows unless essential (use baked/fake blob shadows).

## Techniques
- Renderer Compatibility only. Disable SSAO, glow, SDFGI, volumetric fog.
- Textures: <= 512x512 (1024 only for hero assets), use atlases, shared materials; compress lossless -> VRAM compressed where supported.
- Use `MultiMeshInstance3D` for repeated props; `VisibilityNotifier`/occlusion by splitting areas; unload locations when leaving.
- Audio: mono ogg, load per chapter. Fonts: subset. Avoid huge `.pck`; split content if needed.
- Avoid per-frame allocations and `get_node` in `_process`; cache references.
- Limit physics: simple collision shapes, few rigid bodies.

## Measure
Use Godot Monitors (FPS, draw calls, memory) in a debug overlay toggled by a hidden gesture. Profile on a real phone, not only PC.
Report before/after numbers for each optimization.
