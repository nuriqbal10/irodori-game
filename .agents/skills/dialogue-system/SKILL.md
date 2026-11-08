---
name: dialogue-system
description: Implement branching NPC dialogue in Godot 4 for Japanese conversation (kaiwa) and expression (hyougen) practice, driven by JSON dialogue graphs, with furigana, translation toggle, and scoring. Use whenever the task involves NPCs, conversation, choices, dialogue boxes, roleplay, or situational expressions.
---

# Dialogue system (kaiwa / hyougen)

## Data
Dialogue graphs come from lesson JSON (`conversation` array, see skill `japanese-content-data`).
Each node: `speaker`, `ja`, `kana`, `id` (Indonesian translation), then either `choices[]` (each with `next`, `score`) or `next`, or `end: true`.

## Scripts
- `scripts/dialogue/DialogueRunner.gd` (autoload-free `Node`): loads a graph, exposes `signal node_shown(node)`, `signal finished(total_score, max_score)`, methods `start(graph)`, `choose(index)`, `advance()`.
- `ui/DialogueBox.tscn`: shows speaker name, Japanese text (with optional furigana), translation toggle button, and big choice buttons.
- NPC scenes call `DialogueRunner.start()` on interact; the player controller is frozen while a dialogue is open.

## Behavior
- Toggle buttons: [Furigana on/off], [Terjemahan on/off]. Remember preference.
- Wrong choice: NPC reacts naturally (confused reply) and returns to the same node; show a short hint in Indonesian after 2 wrong tries. Never hard-fail the player.
- Score is stored per dialogue ID for review and spaced repetition.
- Hyougen mode: present a situation card (`situation_id`) then choose the right expression.
- Voice input is NOT in v1. Design the runner so a `SpeechInput` source can later replace `choose()`.

## Quality bar
- Politeness level consistent with the lesson (です/ます unless chapter says otherwise).
- At most 3 choices per node, similar length.
- Test: run a graph end to end with mouse-as-touch and confirm score, hint, and finish signal.
