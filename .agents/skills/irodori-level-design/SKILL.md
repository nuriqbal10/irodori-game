---
name: irodori-level-design
description: Map Irodori chapters and topics to 3D game locations, quests, and progression with a mobile-friendly, low-poly design. Use whenever the user discusses game design, levels, maps, quests, story, progression, difficulty, rewards, or how a lesson becomes gameplay.
---

# Irodori -> game design

## Principle
One chapter = one small location (a few rooms/streets) + 4-6 quests. Learning loop:
Explore -> Learn (vocab/kanji by interacting with objects) -> Practice (quiz/dialogue) -> Apply (mission) -> Review.

## Mapping
| Skill | Gameplay |
|---|---|
| Goi (vocab) | Tap objects/signs to hear and collect words into a notebook |
| Kanji | Read signboards; matching and reading puzzles; stroke-order trace mini-game |
| Bunpou | Sentence-building door locks and shop orders |
| Choukai | Station/shop announcements, NPC speech, then answer |
| Dokkai | Menus, flyers, notes, signs needed to finish quests |
| Kaiwa | Branching NPC talks, e.g., konbini, station, restaurant |
| Hyougen | Situation cards: choose the polite/right phrase |

## Rules
- Locations are small and reusable (kitchen, konbini, station, classroom). Reuse kit pieces to keep the build small.
- Difficulty ramps inside a chapter: recognize -> recall -> produce.
- Rewards: coins, stamps, notebook pages, cosmetic items. No punishment loops; wrong answers give hints.
- Each quest lists: lesson IDs covered, location, NPCs, required items, quiz IDs, estimated minutes (3-8).
- Output a design table (markdown) per chapter in `docs/design/<chapter>.md` before coding.
