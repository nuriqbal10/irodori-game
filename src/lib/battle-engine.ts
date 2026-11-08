import vocabData from '@/data/vocabulary.json';
import kanjiData from '@/data/kanji.json';
import bunpouData from '@/data/bunpou.json';
import audioData from '@/data/audio.json';
import illustrationsData from '@/data/illustrations.json';

export type BattleMode = 
  | 'kanji' 
  | 'kotoba' 
  | 'image' 
  | 'sentence' 
  | 'choukai' 
  | 'all' 
  | 'tebak-gambar' 
  | 'susun-kalimat' 
  | 'kosakata';

export interface BattleQuestion {
  id: string;
  mode: BattleMode;
  prompt: string;
  targetDisplay: string;
  reading?: string; // Pure kana furigana, NO ROMAJI
  context?: string; // Pure Japanese or Indonesian context, NO ROMAJI
  imageSrc?: string;
  audioSrc?: string;
  audioLabel?: string;
  options: string[]; // Options in pure Japanese or Indonesian, NO ROMAJI
  scrambledWords?: string[]; // Word chunks for sentence ordering
  answer: string;
  explanation: string;
}

// -------------------------------------------------------------
// HELPER UTILITIES: STRICT PEDAGOGICAL CLEANING (NO ROMAJI, NO TILDE)
// -------------------------------------------------------------
function cleanBrackets(text: string): string {
  return (text || '').replace(/[（）()]/g, '').trim();
}

function cleanIndonesian(text: string): string {
  return (text || '')
    .replace(/[（）()]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasTilde(text: string): boolean {
  return text.includes('～') || text.includes('〜') || text.includes('~');
}

// Check if vocabulary is clean, solid, and educational
function isSolidVocab(v: any): boolean {
  if (!v.meaningId) return false;
  const k = v.kanji || '';
  const r = v.reading || '';
  const m = v.meaningId || '';

  // 1. REJECT ANY TILDE (user requirement: jangan memakan kosakata yang ada tanda ”～” nya)
  if (hasTilde(k) || hasTilde(r) || hasTilde(m)) return false;

  // 2. Reject prefix dashes or ellipses
  if (m.startsWith('-') || m.startsWith('...') || k.startsWith('-') || r.startsWith('-')) return false;

  // 3. Reject single-letter particles/counters unless full substantive word
  if (k.length <= 1 && r.length <= 1 && (!v.partOfSpeech || v.partOfSpeech === '')) return false;

  // 4. Must have meaningful length
  if (m.length < 2) return false;

  return true;
}

// -------------------------------------------------------------
// CAN-DO SITUATION DICTIONARY FOR AUTHENTIC CHOUKAI (NO ROMAJI)
// -------------------------------------------------------------
export const CAN_DO_SITUATIONS: Record<string, { ja: string; id: string }> = {
  // Level A1 (Nyuumon)
  'a1-1': { ja: '自己紹介をして挨拶している', id: 'Memperkenalkan nama diri dan memberi salam' },
  'a1-2': { ja: '出身の国や話せる言葉を伝えている', id: 'Menyebutkan asal negara dan bahasa yang dikuasai' },
  'a1-3': { ja: '自分の仕事や職業を話している', id: 'Membicarakan pekerjaan atau profesi' },
  'a1-4': { ja: '住んでいる場所や家族を話している', id: 'Membicarakan tempat tinggal dan keluarga' },
  'a1-5': { ja: '好きな食べ物や飲み物を話している', id: 'Membicarakan makanan dan minuman kesukaan' },
  'a1-6': { ja: 'ファストフード店で注文している', id: 'Memesan makanan di restoran cepat saji' },
  'a1-7': { ja: '部屋の様子や家具を説明している', id: 'Menjelaskan ruangan dan perabotan kamar' },
  'a1-8': { ja: '職場の人や物の居場所を聞いている', id: 'Menanyakan keberadaan orang atau barang di kantor' },
  'a1-9': { ja: '勤務時間や昼休み・休日を話している', id: 'Membicarakan jam kerja, jam istirahat, dan hari libur' },
  'a1-10': { ja: '職場で文房具や備品を借りている', id: 'Meminjam peralatan kantor atau perlengkapan kerja' },
  'a1-11': { ja: '趣味や好きなマンガ・音楽を話している', id: 'Membicarakan hobi, musik, dan waktu luang' },
  'a1-12': { ja: '休日に一緒に出かけようと誘っている', id: 'Mengajak teman pergi bersama di akhir pekan' },
  'a1-13': { ja: 'バスや電車の行き先を確認している', id: 'Memastikan rute tujuan bus atau kereta' },
  'a1-14': { ja: '建物や駅への道順を尋ねている', id: 'Menanyakan arah jalan menuju gedung atau stasiun' },
  'a1-15': { ja: '店で探している商品の場所を聞いている', id: 'Menanyakan letak barang yang dicari di toko' },
  'a1-16': { ja: '服や商品の値段を聞いて買っている', id: 'Menanyakan harga barang dan berbelanja' },
  'a1-17': { ja: '週末の外出や観光の思い出を話している', id: 'Menceritakan pengalaman liburan akhir pekan' },
  'a1-18': { ja: '温泉や旅行でやりたいことを話している', id: 'Mengungkapkan keinginan saat berwisata onsen' },

  // Level A2.1 (Shokyuu 1)
  'a2-1-1': { ja: '職場の仕事内容や経験を話している', id: 'Menceritakan tugas dan pengalaman kerja saat ini' },
  'a2-1-2': { ja: '休日の過ごし方やゲームの趣味を話している', id: 'Menceritakan hobi bermain game dan waktu luang' },
  'a2-1-3': { ja: '季節の気候や寒さ・暑さを話している', id: 'Membicarakan perubahan cuaca dan musim di Jepang' },
  'a2-1-4': { ja: '大雨や台風・地震の状況を話している', id: 'Membicarakan cuaca buruk, hujan lebat, atau gempa' },
  'a2-1-5': { ja: '自分の町の様子や便利さを説明している', id: 'Menjelaskan fasilitas dan suasana kota tempat tinggal' },
  'a2-1-6': { ja: '郵便局や銀行への詳しい道案内をしている', id: 'Memberikan petunjuk jalan ke kantor pos atau bank' },
  'a2-1-7': { ja: '道に迷って遅刻することを連絡している', id: 'Mengabari rekan bahwa tersesat dan terlambat' },
  'a2-1-8': { ja: 'スポーツや日本文化の体験を話している', id: 'Menceritakan pengalaman olahraga atau aktivitas budaya' },
  'a2-1-9': { ja: '漢字の読み方や書類の書き方を教わっている', id: 'Meminta tolong diajarkan cara baca kanji atau mengisi form' },
  'a2-1-10': { ja: '日本語教室や地域の交流会に申し込んでいる', id: 'Mendaftar kegiatan kursus bahasa Jepang atau komunitas' },
  'a2-1-11': { ja: 'バーベキューの買い出しを分担している', id: 'Membagi tugas belanja bahan makanan pesta' },
  'a2-1-12': { ja: 'お弁当のおかずやご当地グルメを話している', id: 'Membicarakan bekal makan siang dan kuliner khas daerah' },
  'a2-1-13': { ja: '作業の進捗状況と終了時間を伝えている', id: 'Menyampaikan progres kerja dan perkiraan selesai' },
  'a2-1-14': { ja: '会社で有給休暇や休みをお願いしている', id: 'Meminta izin cuti kerja kepada atasan' },
  'a2-1-15': { ja: '病院で熱や風邪の症状を医者に伝えている', id: 'Menjelaskan gejala demam atau sakit kepada dokter' },
  'a2-1-16': { ja: '健康管理や食事の工夫について話している', id: 'Membicarakan pola makan sehat dan menjaga kebugaran' },
  'a2-1-17': { ja: '家族からもらった大切な物を紹介している', id: 'Menceritakan barang berharga atau jimat pemberian keluarga' },
  'a2-1-18': { ja: '同僚への送別プレゼントを相談している', id: 'Membahas hadiah kenang-kenangan untuk rekan kerja' },

  // Level A2.2 (Shokyuu 2)
  'a2-2-1': { ja: '日本に来た時期や来日のきっかけを話している', id: 'Menceritakan waktu kedatangan dan alasan ke Jepang' },
  'a2-2-2': { ja: '同僚や知人の性格・人柄について話している', id: 'Menceritakan kepribadian dan sifat rekan kerja' },
  'a2-2-3': { ja: '食物アレルギーや食べられない物を伝えている', id: 'Menyampaikan alergi makanan atau pantangan di restoran' },
  'a2-2-4': { ja: '日本料理の美味しい食べ方を教えている', id: 'Menjelaskan etiket dan cara menikmati kuliner Jepang' },
  'a2-2-5': { ja: '旅行のチケットや宿の予約を勧めている', id: 'Menyarankan pemesanan tiket liburan atau penginapan' },
  'a2-2-6': { ja: '旅行先で楽しかった体験の感想を話している', id: 'Memberikan ulasan dan kesan perjalanan wisata' },
  'a2-2-7': { ja: '雨天時のイベント変更予定を案内している', id: 'Mengumumkan perubahan rencana acara jika turun hujan' },
  'a2-2-8': { ja: '夏祭りで屋台の場所や食べ物を案内している', id: 'Menjelaskan stan makanan di festival musim panas' },
  'a2-2-9': { ja: '成人の日や年中行事の過ごし方を話している', id: 'Membicarakan tradisi perayaan hari libur nasional' },
  'a2-2-10': { ja: '冠婚葬祭やパーティーの服装を相談している', id: 'Menanyakan etiket busana untuk acara resmi' },
  'a2-2-11': { ja: 'レジでポイントカードや袋の有無をやり取りしている', id: 'Interaksi kasir mengenai kartu poin dan kantong belanja' },
  'a2-2-12': { ja: '家電量販店で商品の機能や値段を比較している', id: 'Membandingkan spesifikasi dan harga produk elektronik' },
  'a2-2-13': { ja: '資料館や展示会で展示物の説明を聞いている', id: 'Mendengarkan panduan informasi pameran atau museum' },
  'a2-2-14': { ja: '美容院で希望のヘアスタイルを伝えている', id: 'Menjelaskan model potongan rambut di salon' },
  'a2-2-15': { ja: '職場で電気の消し忘れや施錠を確認している', id: 'Mengecek lampu atau fasilitas kantor yang lupa dimatikan' },
  'a2-2-16': { ja: '避難訓練や地震発生時の行動を確認している', id: 'Menyimak instruksi evakuasi saat bencana gempa bumi' },
  'a2-2-17': { ja: '日本語の上達やこれからの目標を語り合っている', id: 'Menceritakan peningkatan bahasa Jepang dan target baru' },
  'a2-2-18': { ja: '将来の夢や起業のプランについて話している', id: 'Menceritakan cita-cita mendirikan perusahaan sendiri' },
};

// -------------------------------------------------------------
// 1. KANJI SPEED DUEL (NO ROMAJI - PURE KANA READING OR MEANING)
// -------------------------------------------------------------
export function generateKanjiQuestions(level: string = 'all', count: number = 5): BattleQuestion[] {
  const filtered = level === 'all' 
    ? kanjiData.filter(k => k.kanji && k.reading && k.word)
    : kanjiData.filter(k => k.level === level && k.kanji && k.reading && k.word);

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((k, idx) => {
    // Mode A: Pick correct reading in Kana (No romaji)
    const isReadingPick = idx % 2 === 0;

    if (isReadingPick) {
      const otherReadings = kanjiData
        .filter(item => item.reading !== k.reading && item.reading && !hasTilde(item.reading))
        .map(item => cleanBrackets(item.reading));

      const distractors = Array.from(new Set(otherReadings))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const correctReading = cleanBrackets(k.reading);
      const options = [...distractors, correctReading].sort(() => 0.5 - Math.random());

      return {
        id: `bq-kanji-${idx}-${Date.now()}`,
        mode: 'kanji',
        prompt: `Bagaimana cara membaca Kanji 「${k.kanji}」 pada kata 「${k.word}」?`,
        targetDisplay: k.kanji,
        context: `Kata: 「${k.word}」 (${cleanIndonesian(k.meaning || 'Bahasa Jepang')})`,
        options,
        answer: correctReading,
        explanation: `Kanji 「${k.kanji}」 pada kata 「${k.word}」 dibaca 「${correctReading}」 (${cleanIndonesian(k.meaning)}).`,
      };
    } else {
      // Mode B: Pick meaning in Indonesian
      const otherMeanings = kanjiData
        .filter(item => item.meaning && item.meaning !== k.meaning && !hasTilde(item.meaning))
        .map(item => cleanIndonesian(item.meaning));

      const distractors = Array.from(new Set(otherMeanings))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const correctMeaning = cleanIndonesian(k.meaning);
      const options = [...distractors, correctMeaning].sort(() => 0.5 - Math.random());

      return {
        id: `bq-kanji-${idx}-${Date.now()}`,
        mode: 'kanji',
        prompt: `Apa arti dari Kanji 「${k.kanji}」 (${k.kunyomi || k.reading}) berikut?`,
        targetDisplay: k.kanji,
        context: `Contoh kata: 「${k.word}」`,
        options,
        answer: correctMeaning,
        explanation: `Kanji 「${k.kanji}」 dibaca 「${k.kunyomi || k.reading}」 dan memiliki arti "${correctMeaning}".`,
      };
    }
  });
}

// -------------------------------------------------------------
// 2. KOTOBA COMBO BLITZ (NO TILDE, MATCHING PART OF SPEECH, NO ROMAJI)
// -------------------------------------------------------------
export function generateKotobaQuestions(level: string = 'all', count: number = 5): BattleQuestion[] {
  const filtered = vocabData.filter(v => {
    if (level !== 'all' && v.level !== level) return false;
    return isSolidVocab(v);
  });

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((v, idx) => {
    const isJpToId = idx % 2 === 0;
    const cleanWord = cleanBrackets(v.kanji || v.reading);
    const cleanReading = cleanBrackets(v.reading);
    const cleanMeaning = cleanIndonesian(v.meaningId);

    // Group distractors by the same part of speech for authentic pedagogical quality
    const samePosVocabs = filtered.filter(item => 
      item.partOfSpeech === v.partOfSpeech && 
      cleanIndonesian(item.meaningId) !== cleanMeaning
    );
    const fallbackVocabs = filtered.filter(item => cleanIndonesian(item.meaningId) !== cleanMeaning);
    const candidateVocabs = samePosVocabs.length >= 3 ? samePosVocabs : fallbackVocabs;

    if (isJpToId) {
      // JP -> ID (Question shows Kanji + Furigana in kana, options in Indonesian)
      const otherMeanings = candidateVocabs.map(item => cleanIndonesian(item.meaningId));
      const distractors = Array.from(new Set(otherMeanings))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [...distractors, cleanMeaning].sort(() => 0.5 - Math.random());

      return {
        id: `bq-kotoba-${idx}-${Date.now()}`,
        mode: 'kotoba',
        prompt: `Pilih arti bahasa Indonesia yang tepat:`,
        targetDisplay: cleanWord,
        reading: cleanReading !== cleanWord ? cleanReading : undefined,
        context: v.partOfSpeech ? `[Kelas Kata: ${v.partOfSpeech}]` : undefined,
        options,
        answer: cleanMeaning,
        explanation: `「${cleanWord}」 (${cleanReading}) berarti "${cleanMeaning}".`,
      };
    } else {
      // ID -> JP (Question shows Indonesian, options in pure Japanese Kanji + Furigana)
      const otherWords = candidateVocabs.map(item => {
        const cw = cleanBrackets(item.kanji || item.reading);
        const cr = cleanBrackets(item.reading);
        return cw !== cr ? `${cw} (${cr})` : cw;
      });

      const distractors = Array.from(new Set(otherWords))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const correctChoice = cleanWord !== cleanReading ? `${cleanWord} (${cleanReading})` : cleanWord;
      const options = [...distractors, correctChoice].sort(() => 0.5 - Math.random());

      return {
        id: `bq-kotoba-${idx}-${Date.now()}`,
        mode: 'kotoba',
        prompt: `Pilih kosakata bahasa Jepang yang tepat:`,
        targetDisplay: cleanMeaning,
        context: v.partOfSpeech ? `[Kelas Kata: ${v.partOfSpeech}]` : undefined,
        options,
        answer: correctChoice,
        explanation: `"${cleanMeaning}" dalam bahasa Jepang adalah 「${correctChoice}」.`,
      };
    }
  });
}

// -------------------------------------------------------------
// 3. TEBAK GAMBAR IRODORI (AUTHENTIC KANJI/KANA + MEANING, NO ROMAJI)
// -------------------------------------------------------------
export function generateImageQuestions(level: string = 'all', count: number = 5): BattleQuestion[] {
  // Build high-confidence image-vocab pairs
  const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z]/g, '').replace(/oo/g, 'o').replace(/ou/g, 'o').replace(/ee/g, 'e');

  const solidVocabs = vocabData.filter(v => isSolidVocab(v));
  
  const verifiedPairs: {
    imgSrc: string;
    kanji: string;
    reading: string;
    meaning: string;
    lesson: number;
    level: string;
  }[] = [];

  illustrationsData.forEach(img => {
    if (level !== 'all' && img.level !== level) return;
    const normT = normalize(img.title);
    if (!normT || normT.length < 3) return;

    const matchedVocab = solidVocabs.find(v => {
      const normR = normalize(v.romaji || '');
      return normR === normT && normR.length >= 3;
    });

    if (matchedVocab) {
      verifiedPairs.push({
        imgSrc: img.src,
        kanji: cleanBrackets(matchedVocab.kanji || matchedVocab.reading),
        reading: cleanBrackets(matchedVocab.reading),
        meaning: cleanIndonesian(matchedVocab.meaningId),
        lesson: img.lesson,
        level: img.level,
      });
    }
  });

  const shuffled = [...verifiedPairs].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((pair, idx) => {
    const correctLabel = pair.kanji !== pair.reading 
      ? `${pair.kanji} (${pair.reading}) — ${pair.meaning}`
      : `${pair.kanji} — ${pair.meaning}`;

    // Generate 3 distractors from other verified pairs
    const otherOptions = solidVocabs
      .filter(v => cleanIndonesian(v.meaningId) !== pair.meaning)
      .map(v => {
        const cw = cleanBrackets(v.kanji || v.reading);
        const cr = cleanBrackets(v.reading);
        const cm = cleanIndonesian(v.meaningId);
        return cw !== cr ? `${cw} (${cr}) — ${cm}` : `${cw} — ${cm}`;
      });

    const distractors = Array.from(new Set(otherOptions))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const options = [...distractors, correctLabel].sort(() => 0.5 - Math.random());

    return {
      id: `bq-img-${idx}-${Date.now()}`,
      mode: 'image',
      prompt: `Tebak Gambar Irodori: Kosakata yang tepat untuk gambar situasi ini adalah:`,
      targetDisplay: `Ilustrasi Situasi Bab ${pair.lesson}`,
      imageSrc: pair.imgSrc,
      options,
      answer: correctLabel,
      explanation: `Gambar ini mengilustrasikan 「${pair.kanji}」 (${pair.reading}) yang berarti "${pair.meaning}".`,
    };
  });
}

// -------------------------------------------------------------
// 4. SUSUN KALIMAT (PURE JAPANESE CHUNKS, NO ROMAJI)
// -------------------------------------------------------------
export function generateSentenceQuestions(level: string = 'all', count: number = 5): BattleQuestion[] {
  const filtered = level === 'all' 
    ? bunpouData.filter(b => b.example && b.pattern)
    : bunpouData.filter(b => b.level === level && b.example && b.pattern);

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((b, idx) => {
    const lines = b.example.split(/[\r\n]+/).filter(l => l.trim().length > 0);
    const targetSentence = cleanBrackets(lines[0] || '私は日本語を勉強します。');

    // Split sentence into 3 to 4 natural Japanese chunks by particles
    let chunks: string[] = [];
    if (targetSentence.includes('は') || targetSentence.includes('が') || targetSentence.includes('を') || targetSentence.includes('に') || targetSentence.includes('で') || targetSentence.includes('と')) {
      chunks = targetSentence
        .split(/(?<=[はがをにでへと、])/g)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    } else {
      chunks = targetSentence.split(/\s+/).filter(s => s.length > 0);
    }

    if (chunks.length < 3) {
      const len = targetSentence.length;
      const p1 = Math.floor(len / 3);
      const p2 = Math.floor((len * 2) / 3);
      chunks = [
        targetSentence.slice(0, p1),
        targetSentence.slice(p1, p2),
        targetSentence.slice(p2)
      ];
    }

    const scrambledWords = [...chunks].sort(() => 0.5 - Math.random());
    if (scrambledWords.join('') === chunks.join('') && scrambledWords.length > 1) {
      const temp = scrambledWords[0];
      scrambledWords[0] = scrambledWords[1];
      scrambledWords[1] = temp;
    }

    return {
      id: `bq-sent-${idx}-${Date.now()}`,
      mode: 'sentence',
      prompt: `Susun balok-balok kata acak menjadi kalimat tata bahasa yang benar!`,
      targetDisplay: `Pola: 「${b.pattern}」`,
      context: `Topik: ${b.topic} (${b.lessonTitle})`,
      scrambledWords,
      options: [],
      answer: chunks.join(''),
      explanation: `Susunan kalimat yang tepat: 「${chunks.join('')}」. Menggunakan pola tata bahasa 「${b.pattern}」.`,
    };
  });
}

// -------------------------------------------------------------
// 5. CHOUKAI AUDIO REFLEX (REAL CAN-DO CONTEXT IN JAPANESE + ID, NO ROMAJI)
// -------------------------------------------------------------
export function generateChoukaiQuestions(level: string = 'all', count: number = 5): BattleQuestion[] {
  const filtered = level === 'all' 
    ? audioData.filter(a => a.src && a.lesson > 0)
    : audioData.filter(a => a.level === level && a.src && a.lesson > 0);

  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((a, idx) => {
    const key = `${a.level}-${a.lesson}`;
    const situation = CAN_DO_SITUATIONS[key] || {
      ja: `Bab ${a.lesson} の会話を行っている`,
      id: `Melakukan percakapan situasi Bab ${a.lesson}`,
    };

    const correctOption = `${situation.ja} (${situation.id})`;

    // Pick 3 realistic distractors from other chapters
    const otherKeys = Object.keys(CAN_DO_SITUATIONS).filter(k => k !== key);
    const shuffledKeys = otherKeys.sort(() => 0.5 - Math.random()).slice(0, 3);
    const distractors = shuffledKeys.map(k => {
      const s = CAN_DO_SITUATIONS[k];
      return `${s.ja} (${s.id})`;
    });

    const options = [...distractors, correctOption].sort(() => 0.5 - Math.random());

    return {
      id: `bq-choukai-${idx}-${Date.now()}`,
      mode: 'choukai',
      prompt: `Chōkai Reflex: Dengarkan percakapan audio dan tentukan situasi yang sedang dibicarakan:`,
      targetDisplay: `Audio Percakapan Bab ${a.lesson}`,
      audioSrc: a.src,
      audioLabel: `Audio Percakapan Native (${a.label || 'Trek ' + (a.trackNum || idx + 1)})`,
      options,
      answer: correctOption,
      explanation: `Percakapan ini merupakan materi audio resmi Bab ${a.lesson} mengenai situasi: "${situation.id}" (「${situation.ja}」).`,
    };
  });
}

// -------------------------------------------------------------
// MASTER DISPATCHER WITH NORMALIZATION & HYBRID MIX FOR 'all'
// -------------------------------------------------------------
export function generateBattleQuestions(mode: BattleMode, level: string = 'all', count: number = 5): BattleQuestion[] {
  const normalized = (mode || '').toLowerCase().trim();

  if (normalized === 'kanji') {
    return generateKanjiQuestions(level, count);
  }
  if (normalized === 'kotoba' || normalized === 'kosakata') {
    return generateKotobaQuestions(level, count);
  }
  if (normalized === 'image' || normalized === 'tebak-gambar' || normalized === 'gambar') {
    return generateImageQuestions(level, count);
  }
  if (normalized === 'sentence' || normalized === 'susun-kalimat' || normalized === 'kalimat') {
    return generateSentenceQuestions(level, count);
  }
  if (normalized === 'choukai' || normalized === 'listening' || normalized === 'menyimak') {
    return generateChoukaiQuestions(level, count);
  }

  // If 'all' or undefined, create a balanced mix across all 5 modes
  const perMode = Math.max(1, Math.floor(count / 5));
  const kanjiList = generateKanjiQuestions(level, perMode);
  const kotobaList = generateKotobaQuestions(level, perMode);
  const imageList = generateImageQuestions(level, perMode);
  const sentenceList = generateSentenceQuestions(level, perMode);
  const choukaiList = generateChoukaiQuestions(level, perMode);

  const combined = [...kanjiList, ...kotobaList, ...imageList, ...sentenceList, ...choukaiList];
  return combined.sort(() => 0.5 - Math.random()).slice(0, count);
}
