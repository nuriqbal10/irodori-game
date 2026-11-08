"""Subset Noto Sans JP to only the characters used in the project.
Usage (from project root):  python .agents/skills/japanese-font-subset/scripts/subset_font.py
Requires: pip install fonttools brotli
"""
import glob, string, subprocess, sys
from pathlib import Path

root = Path(".")
src = root / "fonts/src/NotoSansJP-Regular.ttf"
out = root / "fonts/NotoSansJP-subset.ttf"
if not src.exists():
    sys.exit(f"Font tidak ditemukan: {src}. Taruh NotoSansJP-Regular.ttf di fonts/src/")

chars = set(string.printable)
chars |= {chr(c) for c in range(0x3040, 0x30FF + 1)}   # hiragana + katakana
chars |= set("、。「」『』（）！？・ー〜…％")
for pattern in ("data/**/*.json", "scenes/**/*.tscn", "scripts/**/*.gd", "ui/**/*.tscn"):
    for f in glob.glob(str(root / pattern), recursive=True):
        try:
            chars |= set(Path(f).read_text(encoding="utf-8"))
        except Exception:
            pass

chars = {c for c in chars if c.strip()}
text_file = root / "fonts/_chars.txt"
text_file.parent.mkdir(exist_ok=True)
text_file.write_text("".join(sorted(chars)), encoding="utf-8")

subprocess.check_call([
    sys.executable, "-m", "fontTools.subset", str(src),
    f"--text-file={text_file}", f"--output-file={out}",
    "--layout-features=*", "--no-hinting",
])
print(f"OK: {len(chars)} karakter -> {out} ({out.stat().st_size/1024:.0f} KB)")
