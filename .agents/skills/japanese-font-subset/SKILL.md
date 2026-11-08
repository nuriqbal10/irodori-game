---
name: japanese-font-subset
description: Create a small subset of a Japanese font (Noto Sans JP) containing only the characters used in the game's data, and set it up as the Godot theme font. Use whenever Japanese text looks like squares/tofu, builds are too large, fonts are mentioned, or new kanji/lessons are added.
---

# Japanese font subset

Full Noto Sans JP is many MB. The web build must stay small, so subset it.

## Steps
1. Put the original font in `fonts/src/NotoSansJP-Regular.ttf` (and Bold if needed). Use only fonts with an open license (Noto Sans JP is SIL OFL).
2. Run: `python scripts/subset_font.py` (requires `pip install fonttools brotli`).
   It scans `data/**/*.json` and `scenes/**/*.tscn`, collects every character, adds kana, ASCII, punctuation, and writes `fonts/NotoSansJP-subset.ttf` (and `.woff2` for reference).
3. In Godot import `NotoSansJP-subset.ttf`, set it as default font in `ui/theme.tres` and as fallback for the project (Project Settings > GUI > Theme > Fallback font if needed).
4. Re-run the script every time new lessons or kanji are added. Missing glyph = new data not covered.

## Notes
- Keep full hiragana, katakana, and a safe set of common kanji (e.g., JLPT N5-N4 list) even if unused yet, so new content rarely breaks.
- Check size: target < 2 MB for the font file.
