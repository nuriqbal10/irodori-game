import kyoushitsuFallback from '../data/facility-packs/kyoushitsu-pack.json' with { type: 'json' };
import shokudouFallback from '../data/facility-packs/shokudou-pack.json' with { type: 'json' };

export type VerbGroup = 'GROUP_1' | 'GROUP_2' | 'GROUP_3';
export type StepNumber = 1 | 2 | 3;

export interface Step1Noun {
  word: string;
  kanji?: string;
  meaning?: string;
  clue?: string;
  options: string[];
  correctAnswer?: string;
}

export interface Step2Verb {
  dictionaryForm?: string;
  masuForm: string;
  verbGroup?: VerbGroup | string;
  missionPrompt: string;
  targetConjugated: string;
  options: string[];
  explanation?: string;
  correctAnswer?: string;
}

export interface Step3Sentence {
  targetSentence: string;
  meaningIndonesian: string;
  tokens: string[];
  distractors?: string[];
}

export interface FacilityBox {
  boxId: string;
  position?: { x: number; y: number };
  step1_noun: Step1Noun;
  step2_verb: Step2Verb;
  step3_sentence: Step3Sentence;
}

export interface GateQuiz {
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export interface FacilityPack {
  facilityId: string;
  facilityNameJapanese: string;
  facilityNameIndonesian: string;
  theme: string;
  totalBoxes: number;
  gateQuiz?: GateQuiz;
  boxes: FacilityBox[];
}

export const STEP_POINTS = {
  1: 100,
  2: 150,
  3: 250,
} as const;

export interface StepValidationResult {
  isValid: boolean;
  correct: boolean;
  pointsEarned: number;
  expectedAnswer?: string | string[];
  explanation?: string;
  feedback?: string;
  boxId?: string;
  facilityId?: string;
}

// In-memory cache for loaded facility packs
const packCache: Map<string, FacilityPack> = new Map();

// Built-in fallback packs
const BUILTIN_PACKS: Record<string, FacilityPack> = {
  fac_kyoushitsu: kyoushitsuFallback as unknown as FacilityPack,
  fac_shokudou: shokudouFallback as unknown as FacilityPack,
};

/**
 * Normalizes string for comparative matching:
 * trims, removes repeated internal whitespace, and lowers case.
 */
function normalizeString(val: string): string {
  return (val || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Strips all whitespace, dashes, and underscores for tight character matching.
 */
function cleanNoSpace(val: string): string {
  return (val || '').replace(/[\s\-_]/g, '').toLowerCase();
}

/**
 * Loads a facility pack by identifier or keyword.
 * Uses bundled facility packs with in-memory caching (edge-safe, serverless-ready).
 *
 * @param facilityId - e.g. 'fac_kyoushitsu', 'kyoushitsu', 'fac_shokudou', 'shokudou'
 */
export function getFacilityPack(facilityId: string): FacilityPack | null {
  if (!facilityId) return null;

  const rawId = facilityId.trim();
  const searchLower = rawId.toLowerCase();
  const withPrefix = searchLower.startsWith('fac_') ? searchLower : `fac_${searchLower}`;
  const withoutPrefix = searchLower.replace(/^fac_/, '').replace(/-pack$/, '');

  // 1. Check memory cache first
  if (packCache.has(withPrefix)) {
    return packCache.get(withPrefix)!;
  }
  if (packCache.has(rawId)) {
    return packCache.get(rawId)!;
  }

  // 2. Match against built-in packs directly
  if (BUILTIN_PACKS[withPrefix]) {
    packCache.set(withPrefix, BUILTIN_PACKS[withPrefix]);
    return BUILTIN_PACKS[withPrefix];
  }

  for (const [id, pack] of Object.entries(BUILTIN_PACKS)) {
    const normId = id.toLowerCase();
    if (normId === withPrefix || normId.replace(/^fac_/, '') === withoutPrefix) {
      packCache.set(normId, pack);
      return pack;
    }
  }

  // 4. Search by name/theme match
  for (const pack of Object.values(BUILTIN_PACKS)) {
    if (
      pack.facilityId.toLowerCase() === searchLower ||
      pack.facilityNameJapanese.toLowerCase().includes(searchLower) ||
      pack.facilityNameIndonesian.toLowerCase().includes(searchLower) ||
      pack.theme.toLowerCase() === searchLower
    ) {
      return pack;
    }
  }

  return null;
}

/**
 * Returns all available facility packs from disk or built-in assets.
 */
export function getAllFacilities(): FacilityPack[] {
  const packs: FacilityPack[] = [];

  const kyo = getFacilityPack('kyoushitsu');
  if (kyo) packs.push(kyo);

  const sho = getFacilityPack('shokudou');
  if (sho && !packs.some(p => p.facilityId === sho.facilityId)) packs.push(sho);

  return packs.length > 0 ? packs : Object.values(BUILTIN_PACKS);
}

/**
 * Finds a specific box within a facility pack, or across all facilities.
 */
export function getFacilityBox(
  facilityId: string | undefined | null,
  boxId: string
): { facility: FacilityPack; box: FacilityBox } | null {
  if (!boxId) return null;

  // Try targeted facility first
  if (facilityId) {
    const facility = getFacilityPack(facilityId);
    if (facility) {
      const box = facility.boxes.find(b => b.boxId === boxId);
      if (box) {
        return { facility, box };
      }
    }
  }

  // Search across all loaded facilities
  for (const pack of getAllFacilities()) {
    const box = pack.boxes.find(b => b.boxId === boxId);
    if (box) {
      return { facility: pack, box };
    }
  }

  return null;
}

/**
 * Helper function to validate Step 1 Noun Answer.
 *
 * @param facilityId - The facility ID (e.g. 'fac_kyoushitsu' or 'kyoushitsu')
 * @param boxId - The box identifier (e.g. 'box_kyo_01')
 * @param answer - The user's selected noun answer
 */
export function validateNounAnswer(
  facilityId: string,
  boxId: string,
  answer: string
): StepValidationResult {
  const boxData = getFacilityBox(facilityId, boxId);
  if (!boxData) {
    return {
      isValid: false,
      correct: false,
      pointsEarned: 0,
      boxId,
      facilityId,
      feedback: `Kotak "${boxId}" atau fasilitas "${facilityId}" tidak ditemukan.`,
    };
  }

  const result = validateStepAnswer(boxData.box, 1, answer);
  return {
    ...result,
    boxId,
    facilityId: boxData.facility.facilityId,
  };
}

/**
 * Helper function to validate Step 2 Verb Conjugation Answer.
 *
 * @param facilityId - The facility ID (e.g. 'fac_kyoushitsu' or 'kyoushitsu')
 * @param boxId - The box identifier (e.g. 'box_kyo_01')
 * @param conjugatedAnswer - The user's conjugated verb answer (e.g. 'かいて')
 */
export function validateVerbAnswer(
  facilityId: string,
  boxId: string,
  conjugatedAnswer: string
): StepValidationResult {
  const boxData = getFacilityBox(facilityId, boxId);
  if (!boxData) {
    return {
      isValid: false,
      correct: false,
      pointsEarned: 0,
      boxId,
      facilityId,
      feedback: `Kotak "${boxId}" atau fasilitas "${facilityId}" tidak ditemukan.`,
    };
  }

  const result = validateStepAnswer(boxData.box, 2, conjugatedAnswer);
  return {
    ...result,
    boxId,
    facilityId: boxData.facility.facilityId,
  };
}

/**
 * Helper function to validate Step 3 Sentence Assembly Answer.
 *
 * @param facilityId - The facility ID (e.g. 'fac_kyoushitsu' or 'kyoushitsu')
 * @param boxId - The box identifier (e.g. 'box_kyo_01')
 * @param tokens - The user's assembled sentence tokens (e.g. ['えんぴつ', 'で', 'なまえ', 'を', 'かいて ください'])
 */
export function validateSentenceAssembly(
  facilityId: string,
  boxId: string,
  tokens: string[]
): StepValidationResult {
  const boxData = getFacilityBox(facilityId, boxId);
  if (!boxData) {
    return {
      isValid: false,
      correct: false,
      pointsEarned: 0,
      boxId,
      facilityId,
      feedback: `Kotak "${boxId}" atau fasilitas "${facilityId}" tidak ditemukan.`,
    };
  }

  const result = validateStepAnswer(boxData.box, 3, tokens);
  return {
    ...result,
    boxId,
    facilityId: boxData.facility.facilityId,
  };
}

/**
 * Core validation function for Step 1, Step 2, or Step 3.
 */
export function validateStepAnswer(
  box: FacilityBox,
  step: StepNumber,
  answer: string | string[]
): StepValidationResult {
  if (!box) {
    return {
      isValid: false,
      correct: false,
      pointsEarned: 0,
      feedback: 'Data box tidak ditemukan.',
    };
  }

  // --- STEP 1: Noun Vocabulary ---
  if (step === 1) {
    if (!box.step1_noun) {
      return {
        isValid: false,
        correct: false,
        pointsEarned: 0,
        feedback: 'Step 1 tidak tersedia pada box ini.',
      };
    }

    const targetWord = (box.step1_noun.correctAnswer || box.step1_noun.word || '').trim();
    const targetKanji = (box.step1_noun.kanji || '').trim();
    const targetMeaning = (box.step1_noun.meaning || '').trim();

    const ansStr = Array.isArray(answer) ? answer.join(' ') : String(answer ?? '');
    const inputNorm = normalizeString(ansStr);
    const inputClean = cleanNoSpace(ansStr);

    const isMatch: boolean =
      inputNorm === normalizeString(targetWord) ||
      inputClean === cleanNoSpace(targetWord) ||
      Boolean(targetKanji && (inputNorm === normalizeString(targetKanji) || inputClean === cleanNoSpace(targetKanji))) ||
      Boolean(targetMeaning && inputNorm === normalizeString(targetMeaning));

    return {
      isValid: isMatch,
      correct: isMatch,
      pointsEarned: isMatch ? STEP_POINTS[1] : 0,
      expectedAnswer: targetWord,
      explanation: `Kosakata: ${targetWord}${targetKanji ? ` (${targetKanji})` : ''} - ${targetMeaning}`,
      feedback: isMatch
        ? `Benar! Kosakata "${targetWord}" berhasil dijawab (+${STEP_POINTS[1]} Poin).`
        : `Jawaban belum tepat. Pilihlah kosakata benda yang sesuai dengan petunjuk.`,
    };
  }

  // --- STEP 2: Verb Conjugation ---
  if (step === 2) {
    if (!box.step2_verb) {
      return {
        isValid: false,
        correct: false,
        pointsEarned: 0,
        feedback: 'Step 2 tidak tersedia pada box ini.',
      };
    }

    const targetConjugated = (box.step2_verb.correctAnswer || box.step2_verb.targetConjugated || '').trim();
    const ansStr = Array.isArray(answer) ? answer.join(' ') : String(answer ?? '');
    const inputNorm = normalizeString(ansStr);
    const inputClean = cleanNoSpace(ansStr);
    const targetClean = cleanNoSpace(targetConjugated);

    const isMatch: boolean =
      inputNorm === normalizeString(targetConjugated) ||
      inputClean === targetClean ||
      inputClean.startsWith(targetClean);

    return {
      isValid: isMatch,
      correct: isMatch,
      pointsEarned: isMatch ? STEP_POINTS[2] : 0,
      expectedAnswer: targetConjugated,
      explanation: box.step2_verb.explanation,
      feedback: isMatch
        ? `Tepat sekali! Bentuk konjugasi "${targetConjugated}" benar (+${STEP_POINTS[2]} Poin).`
        : `Konjugasi kata kerja belum tepat. ${box.step2_verb.explanation || 'Perhatikan pola perubahan bentuk kata kerja.'}`,
    };
  }

  // --- STEP 3: Sentence Reassembly ---
  if (step === 3) {
    if (!box.step3_sentence) {
      return {
        isValid: false,
        correct: false,
        pointsEarned: 0,
        feedback: 'Step 3 tidak tersedia pada box ini.',
      };
    }

    const targetSentence = (box.step3_sentence.targetSentence || '').trim();
    const targetWithSpace = targetSentence.replace(/\s+/g, ' ').trim();
    const targetNoSpace = cleanNoSpace(targetSentence);

    let inputWithSpace = '';
    let inputNoSpace = '';

    if (Array.isArray(answer)) {
      inputWithSpace = answer.join(' ').replace(/\s+/g, ' ').trim();
      inputNoSpace = cleanNoSpace(answer.join(''));
    } else {
      const rawStr = String(answer ?? '').trim();
      if (rawStr.startsWith('[') && rawStr.endsWith(']')) {
        try {
          const parsed = JSON.parse(rawStr);
          if (Array.isArray(parsed)) {
            inputWithSpace = parsed.join(' ').replace(/\s+/g, ' ').trim();
            inputNoSpace = cleanNoSpace(parsed.join(''));
          }
        } catch {
          // not json array, proceed with raw string
        }
      }

      if (!inputNoSpace) {
        inputWithSpace = rawStr.replace(/\s+/g, ' ').trim();
        inputNoSpace = cleanNoSpace(rawStr);
      }
    }

    const isMatch: boolean =
      inputWithSpace === targetWithSpace ||
      inputNoSpace === targetNoSpace;

    return {
      isValid: isMatch,
      correct: isMatch,
      pointsEarned: isMatch ? STEP_POINTS[3] : 0,
      expectedAnswer: targetSentence,
      explanation: `Arti: "${box.step3_sentence.meaningIndonesian}"`,
      feedback: isMatch
        ? `Luar biasa! Seluruh kalimat berhasil dirangkai sempurna (+${STEP_POINTS[3]} Poin). Box selesai!`
        : `Susunan kalimat belum tepat. Susunlah kata dan partikel sesuai kaidah tata bahasa.`,
    };
  }

  return {
    isValid: false,
    correct: false,
    pointsEarned: 0,
    feedback: `Step tidak valid (${step}). Hanya step 1, 2, atau 3 yang didukung.`,
  };
}
