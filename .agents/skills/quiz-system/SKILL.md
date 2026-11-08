---
name: quiz-system
description: Build the Godot 4 quiz engine for kanji, vocabulary, grammar, listening, and reading questions with feedback, retries, scoring, and spaced-repetition review. Use whenever the user asks about quizzes, questions, tests, scoring, flashcards, review, progress, or mini-games that check answers.
---

# Quiz system

## Components
- `scripts/quiz/QuizManager.gd`: loads `quiz_item`s from lesson JSON, filters by `type`/`tags`, shuffles choices, tracks results.
- `scripts/quiz/QuizItemView.tscn`: one scene per type (multiple_choice, reading_pick, sentence_order, fill_blank, listening_pick, match_pairs).
- `scripts/save/ProgressStore.gd`: saves progress with `FileAccess` to `user://progress.json` (works on web via IndexedDB).

## Types
- `multiple_choice`, `reading_pick` (pick the kana reading of a kanji), `fill_blank` (particle/verb form), `sentence_order` (drag/tap word chips), `listening_pick` (audio then choices), `match_pairs`.

## Feedback
- Correct: short positive feedback + sound. Wrong: show correct answer + `explanation_id` + the grammar/vocab ID it relates to.
- Offer "Coba lagi" for wrong items at the end of a session.

## Spaced repetition (simple Leitner)
Store per item: `box` (1-5), `next_due` (unix day). Correct -> box+1, wrong -> box 1. Intervals: 1, 2, 4, 8, 16 days.
A "Review" mode picks due items across chapters.

## Game integration
Quizzes unlock doors, give coins, or complete quests. QuizManager emits `session_finished(correct, total)`; the world reacts, quiz code never edits world state directly.

## Tests
Add a debug scene that runs 10 random items per type and prints the results table.
