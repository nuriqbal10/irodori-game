import vocabData from '@/data/vocabulary.json';
import audioData from '@/data/audio.json';
import bunpouData from '@/data/bunpou.json';
import kanjiData from '@/data/kanji.json';
import { CAN_DO_SITUATIONS } from './battle-engine';

export interface StageLearnVocab {
  kanji: string;
  reading: string;
  meaningId: string;
  partOfSpeech?: string;
  audioSrc?: string;
}

export interface StagePracticeQuestion {
  id: string;
  prompt: string;
  targetDisplay: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface DialogueChoice {
  text: string;
  furigana?: string;
  indonesian: string;
  isCorrect: boolean;
  reply: string;
}

export interface StageDialogue {
  npcName: string;
  npcRole: string;
  npcAvatar: string;
  initialLines: {
    speaker: string;
    japanese: string;
    furigana?: string;
    indonesian: string;
    audioSrc?: string;
  }[];
  choices: DialogueChoice[];
}

export interface AdventureStage {
  id: string; // e.g. 'a1-1'
  level: 'a1' | 'a2-1' | 'a2-2';
  lesson: number;
  worldName: string;
  titleJa: string;
  titleId: string;
  location: string;
  locationIcon: string;
  learnVocabs: StageLearnVocab[];
  practiceQuestions: StagePracticeQuestion[];
  dialogue: StageDialogue;
  canDoStatement: string;
}

const WORLD_NAMES: Record<string, string> = {
  'a1': 'Dunia 1: Nyūmon (入門 - Pemula)',
  'a2-1': 'Dunia 2: Shokyū 1 (初級1 - Dasar 1)',
  'a2-2': 'Dunia 3: Shokyū 2 (初級2 - Dasar 2)',
};

const STAGE_LOCATIONS: Record<number, { name: string; icon: string; npc: string; role: string; avatar: string }> = {
  1: { name: 'Kelas Bahasa (教室)', icon: '🏫', npc: '田中さん', role: 'Teman Sekelas', avatar: '👨‍🎓' },
  2: { name: 'Kantin Sekolah (食堂)', icon: '🍱', npc: 'マイさん', role: 'Siswa Internasional', avatar: '👩‍🎓' },
  3: { name: 'Lobi Kantor (オフィス)', icon: '🏢', npc: '佐藤部長', role: 'Atasan Kantor', avatar: '👨‍💼' },
  4: { name: 'Rumah Warga (住宅街)', icon: '🏡', npc: '木村さん', role: 'Tetangga Ramah', avatar: '👵' },
  5: { name: 'Restoran Keluarga (ファミレス)', icon: '🍽️', npc: '店員さん', role: 'Pelayan Restoran', avatar: '🧑‍🍳' },
  6: { name: 'Kedai Cepat Saji (ファストフード)', icon: '🍔', npc: 'レジ係', role: 'Kasir Restoran', avatar: '🧑‍🍳' },
  7: { name: 'Apartemen Kamar (アパート)', icon: '🛋️', npc: '大家さん', role: 'Pemilik Kos', avatar: '👴' },
  8: { name: 'Pabrik / Tempat Kerja (作業場)', icon: '🏭', npc: 'リーダー', role: 'Mandor Pabrik', avatar: '👷' },
  9: { name: 'Papan Pengumuman (掲示板)', icon: '📋', npc: '同僚の鈴木', role: 'Rekan Kerja', avatar: '👨‍💻' },
  10: { name: 'Ruang Perlengkapan (備品室)', icon: '✂️', npc: '事務員さん', role: 'Staf Logistik', avatar: '👩‍💼' },
  11: { name: 'Taman Kota (公園)', icon: '🌳', npc: '健太くん', role: 'Teman Komunitas', avatar: '🏃' },
  12: { name: 'Pusat Perbelanjaan (モール)', icon: '🛍️', npc: '案内係', role: 'Pusat Informasi', avatar: '💁' },
  13: { name: 'Halte Bus Kota (バス停)', icon: '🚌', npc: '運転手さん', role: 'Sopir Bus', avatar: '👮' },
  14: { name: 'Depan Stasiun (駅前)', icon: '🚉', npc: '駅員さん', role: 'Petugas Stasiun', avatar: '🧑‍✈️' },
  15: { name: 'Supermarket (スーパー)', icon: '🛒', npc: '売り場担当', role: 'Pramuniaga', avatar: '🧑‍🌾' },
  16: { name: 'Toko Pakaian (洋服屋)', icon: '👕', npc: '店長', role: 'Pemilik Toko', avatar: '🤵' },
  17: { name: 'Kedai Ramen (ラーメン屋)', icon: '🍜', npc: '大将', role: 'Koki Ramen', avatar: '🧑‍🍳' },
  18: { name: 'Penginapan Onsen (温泉宿)', icon: '♨️', npc: '女将さん', role: 'Tuan Rumah Ryokan', avatar: '👘' },
};

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

// Generate full metadata for a specific stage
export function getStageData(level: 'a1' | 'a2-1' | 'a2-2', lesson: number): AdventureStage {
  const stageKey = `${level}-${lesson}`;
  const situation = CAN_DO_SITUATIONS[stageKey] || {
    ja: `第${lesson}課のコミュニケーションを行う`,
    id: `Melakukan komunikasi praktis Bab ${lesson}`,
  };

  const locConfig = STAGE_LOCATIONS[lesson] || {
    name: 'Tempat Percakapan (街中)',
    icon: '📍',
    npc: '案内人',
    role: 'Pemandu Lokal',
    avatar: '🧑',
  };

  // 1. Target Vocabulary (Strictly 4 solid words without tildes from this level & lesson)
  const solidLessonVocabs = vocabData.filter(v => {
    if (v.level !== level || v.lesson !== lesson) return false;
    const k = v.kanji || '';
    const r = v.reading || '';
    const m = v.meaningId || '';
    if (hasTilde(k) || hasTilde(r) || hasTilde(m)) return false;
    if (m.startsWith('-') || m.startsWith('...')) return false;
    if (m.length < 2) return false;
    return true;
  });

  const learnVocabs: StageLearnVocab[] = solidLessonVocabs.slice(0, 4).map(v => {
    // Find matching audio if available
    const matchedAudio = audioData.find(a => a.level === level && a.lesson === lesson);
    return {
      kanji: cleanBrackets(v.kanji || v.reading),
      reading: cleanBrackets(v.reading),
      meaningId: cleanIndonesian(v.meaningId),
      partOfSpeech: v.partOfSpeech || 'N',
      audioSrc: matchedAudio?.src,
    };
  });

  // If fewer than 4, fill from adjacent lessons of the same level
  if (learnVocabs.length < 4) {
    const fallbackVocabs = vocabData.filter(v => {
      if (v.level !== level) return false;
      const k = v.kanji || '';
      const r = v.reading || '';
      const m = v.meaningId || '';
      return !hasTilde(k) && !hasTilde(r) && !hasTilde(m) && m.length >= 2;
    });
    const extra = fallbackVocabs.slice(0, 4 - learnVocabs.length).map(v => ({
      kanji: cleanBrackets(v.kanji || v.reading),
      reading: cleanBrackets(v.reading),
      meaningId: cleanIndonesian(v.meaningId),
      partOfSpeech: v.partOfSpeech || 'N',
    }));
    learnVocabs.push(...extra);
  }

  // 2. Practice Questions (3 pedagogical questions)
  const practiceQuestions: StagePracticeQuestion[] = learnVocabs.slice(0, 3).map((target, idx) => {
    const distractors = vocabData
      .filter(v => v.level === level && cleanIndonesian(v.meaningId) !== target.meaningId && !hasTilde(v.meaningId))
      .map(v => cleanIndonesian(v.meaningId))
      .slice(0, 3);

    const options = [...distractors, target.meaningId].sort(() => 0.5 - Math.random());

    return {
      id: `adv-drill-${level}-${lesson}-${idx}`,
      prompt: `Apa arti bahasa Indonesia yang tepat untuk kata berikut?`,
      targetDisplay: target.kanji !== target.reading ? `${target.kanji} (${target.reading})` : target.kanji,
      options,
      answer: target.meaningId,
      explanation: `「${target.kanji}」(${target.reading}) berarti "${target.meaningId}".`,
    };
  });

  // 3. Stage Dialogue Mission (Authentic Can-Do dialogue with branching choices)
  const sampleAudio = audioData.find(a => a.level === level && a.lesson === lesson);
  
  // Custom branching dialogue per chapter based on real Can-Do situations
  const stageDialogue: StageDialogue = {
    npcName: locConfig.npc,
    npcRole: locConfig.role,
    npcAvatar: locConfig.avatar,
    initialLines: [
      {
        speaker: locConfig.npc,
        japanese: `こんにちは！いらっしゃいませ。`,
        furigana: 'こんにちは！いらっしゃいませ。',
        indonesian: 'Halo! Selamat datang.',
        audioSrc: sampleAudio?.src,
      },
      {
        speaker: locConfig.npc,
        japanese: `${situation.ja}について、お伺いしてもよろしいですか？`,
        furigana: `${situation.ja}について、おうかがいしてもよろしいですか？`,
        indonesian: `Mengenai ${situation.id}, bolehkah saya bertanya?`,
      },
    ],
    choices: [
      {
        text: `はい、よろしくお願いします！`,
        furigana: 'はい、よろしくおねがいします！',
        indonesian: 'Ya, mohon bantuannya!',
        isCorrect: true,
        reply: `素晴らしいですね！とても上手な日本語です。`,
      },
      {
        text: `いいえ、まだ準備ができていません。`,
        furigana: 'いいえ、まだじゅんびができていません。',
        indonesian: 'Tidak, saya belum siap.',
        isCorrect: false,
        reply: `焦らなくて大丈夫ですよ。もう一度確認してみましょう！`,
      },
      {
        text: `すみません、もう一度言ってください。`,
        furigana: 'すみません、もういちどいってください。',
        indonesian: 'Maaf, tolong katakan sekali lagi.',
        isCorrect: false,
        reply: `ゆっくり話しますね。一緒にもう一度やってみましょう。`,
      },
    ],
  };

  return {
    id: stageKey,
    level,
    lesson,
    worldName: WORLD_NAMES[level] || 'Irodori World',
    titleJa: situation.ja,
    titleId: situation.id,
    location: locConfig.name,
    locationIcon: locConfig.icon,
    learnVocabs,
    practiceQuestions,
    dialogue: stageDialogue,
    canDoStatement: `Saya dapat melakukan komunikasi nyata: "${situation.id}" (「${situation.ja}」).`,
  };
}

// Generate summary list of all 18 stages for a given world
export function getWorldStages(level: 'a1' | 'a2-1' | 'a2-2') {
  const stages = [];
  for (let l = 1; l <= 18; l++) {
    const stageKey = `${level}-${l}`;
    const situation = CAN_DO_SITUATIONS[stageKey] || {
      ja: `第${l}課のCan-Do`,
      id: `Situasi Can-Do Bab ${l}`,
    };
    const loc = STAGE_LOCATIONS[l] || { name: 'Area Komunikasi', icon: '📍' };

    stages.push({
      id: stageKey,
      lesson: l,
      titleJa: situation.ja,
      titleId: situation.id,
      locationName: loc.name,
      locationIcon: loc.icon,
    });
  }
  return stages;
}
