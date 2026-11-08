---
name: japanese-content-data
description: Define and validate the JSON data format for Japanese lessons (kanji, vocabulary, grammar, listening, reading, conversation, expressions) organized by Irodori chapter. Use whenever the user adds lessons, chapters, vocab lists, kanji, dialogues, quiz items, or asks where to store learning content.
---

# Lesson data format

Content is data, not code. One file per chapter: `res://data/lessons/<level>_<chapter>.json`
(example: `a1_ch01.json`). Kanji master list: `res://data/kanji/kanji.json`.
See `references/lesson_example.json` for a full sample.

## Top-level schema
```
{
  "id": "a1_ch01",
  "level": "A1",
  "title_id": "Perkenalan diri",
  "title_ja": "はじめまして",
  "location": "station",
  "vocab": [ {id, kanji, kana, romaji, meaning_id, pos, audio?} ],
  "kanji": [ {id, char, onyomi[], kunyomi[], meaning_id, examples[]} ],
  "grammar": [ {id, pattern, explanation_id, examples[ {ja, kana, id_translation} ]} ],
  "listening": [ {id, audio, transcript_ja, questions[ quiz_item ]} ],
  "reading": [ {id, text_ja, text_kana?, questions[ quiz_item ]} ],
  "conversation": [ dialogue_graph ],
  "expressions": [ {id, situation_id, options[], correct, explanation_id} ]
}
```
`quiz_item`: `{id, type, prompt, choices[], answer, explanation_id, tags[]}`.
Valid `type`: `multiple_choice`, `reading_pick`, `sentence_order`, `fill_blank`, `listening_pick`, `match_pairs`.

## Rules
- Meanings and explanations are in Indonesian (`*_id` keys). Japanese keys end with `_ja`.
- Always store kana reading for every kanji word (needed for furigana and TTS).
- IDs are unique and stable (`a1_ch01_v001`). Never renumber, progress saves refer to them.
- Audio paths relative to `res://audio/`. Missing audio is allowed; fall back to TTS or text.
- Validate with `res://tools/validate_lessons.gd` (create it if missing): check required keys, duplicate IDs, answer in choices, audio file exists.

## Copyright note
Do not paste Irodori's copyrighted text, audio, or illustrations unless the user states they have permission.
Default: write original sentences at the same level and topic, and reference Irodori chapter/topic only by number and title.
Ask the user once at the start of a content task and remember the answer in `agent.md`.
