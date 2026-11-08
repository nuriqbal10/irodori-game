/**
 * ============================================================================
 * IRODORI QUEST - GAME CLIENT ASSET & SYNTHETIC AUDIO EFFECTS ENGINE
 * File: src/lib/game-asset-effects.ts
 *
 * Provides:
 * 1. Zero-dependency Web Audio API Synthetic Sound Generator (60 FPS Mobile-Ready,
 *    ultra-lightweight, no external sound assets or MP3 downloading required).
 *    - playBoxOpenSound()
 *    - playTransformationSound()
 *    - playVerbCorrectSound()
 *    - playSentenceCompleteSound()
 *    - playWrongBuzzer()
 * 2. Visual & Sprite Mapping for Kyoushitsu (Ruang Kelas) and Shokudou (Kantin)
 *    items, including emojis, palettes, animation classes, and mystery box states.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// TYPES & INTERFACES
// ---------------------------------------------------------------------------

export type FacilityType = 'kyoushitsu' | 'shokudou';

export type MysteryBoxVisualState = 'LOCKED' | 'OPENING' | 'TRANSFORMED' | 'SOLVED';

export interface GameItemAsset {
  id: string; // e.g. "box_kyo_01", "box_sho_01"
  facility: FacilityType;
  word: string; // Hiragana/Katakana e.g. "えんぴつ"
  kanji: string; // e.g. "鉛筆"
  meaning: string; // Indonesian e.g. "Pensil"
  englishName: string; // e.g. "Pencil"
  emoji: string; // Primary Emoji e.g. "✏️"
  secondaryEmoji: string; // Secondary / Effect Emoji e.g. "📝"
  themeColor: string; // Hex color code
  bgGradient: string; // Tailwind gradient or CSS gradient
  badgeClass: string; // Tailwind badge styling
  spriteKey: string; // Phaser/Canvas asset key
  category: 'stationery' | 'furniture' | 'facility' | 'electronics' | 'tableware' | 'food' | 'drink' | 'hygiene' | 'currency';
  sparkleColor: string; // Color for particle effects
  animationHint: 'float' | 'bounce' | 'pulse' | 'glow' | 'spin-subtle';
  soundProfile?: 'wood' | 'magic' | 'paper' | 'metallic' | 'liquid';
}

export interface MysteryBoxVisualInfo {
  state: MysteryBoxVisualState;
  emoji: string;
  labelIndonesian: string;
  glowColor: string;
  borderClass: string;
  bgClass: string;
  particleEffect: string;
}

// ---------------------------------------------------------------------------
// 1. SYNTHETIC AUDIO GENERATOR (WEB AUDIO API)
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;
let globalMasterVolume: number = 0.7;

/**
 * Safely initialize or retrieve the browser's AudioContext.
 * Automatically handles SSR (Node/Next.js) and resumes suspended contexts.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      // Browsers require a user gesture before starting audio
      audioCtx.resume().catch(() => {
        // Ignored until user interaction occurs
      });
    }

    return audioCtx;
  } catch (err) {
    console.warn('[AudioEffects] Web Audio API initialization failed:', err);
    return null;
  }
}

/** Check if global game audio is currently muted */
export function isAudioMuted(): boolean {
  return isMuted;
}

/** Set master mute status */
export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
}

/** Toggle mute status */
export function toggleAudioMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

/** Set master volume level (0.0 to 1.0) */
export function setMasterVolume(vol: number): void {
  globalMasterVolume = Math.max(0, Math.min(1, vol));
}

export function getMasterVolume(): number {
  return globalMasterVolume;
}

/**
 * Internal helper to schedule cleanup for AudioNodes to prevent memory leaks.
 */
function cleanupNodes(nodes: (AudioNode | null | undefined)[], delayMs: number) {
  setTimeout(() => {
    nodes.forEach(node => {
      if (node) {
        try {
          node.disconnect();
        } catch {
          // ignore already disconnected nodes
        }
      }
    });
  }, delayMs);
}

/**
 * 1. playBoxOpenSound()
 * Suara buka kotak kayu misteri / chiptune pop.
 * Snappy upward chirp pitch-sweep digabung dengan woody thunk click.
 */
export function playBoxOpenSound(options?: { volume?: number }): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options?.volume ?? 1) * globalMasterVolume;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol * 0.45, now);
  masterGain.connect(ctx.destination);

  // Oscillator 1: Snappy Chiptune pop sweep (180 Hz -> 580 Hz)
  const oscPop = ctx.createOscillator();
  const gainPop = ctx.createGain();

  oscPop.type = 'triangle';
  oscPop.frequency.setValueAtTime(180, now);
  oscPop.frequency.exponentialRampToValueAtTime(580, now + 0.08);

  gainPop.gain.setValueAtTime(0.001, now);
  gainPop.gain.linearRampToValueAtTime(1.0, now + 0.015);
  gainPop.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  oscPop.connect(gainPop);
  gainPop.connect(masterGain);

  oscPop.start(now);
  oscPop.stop(now + 0.17);

  // Oscillator 2: High wood creak spring chirp (740 Hz -> 1180 Hz)
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();

  oscClick.type = 'sine';
  oscClick.frequency.setValueAtTime(740, now + 0.04);
  oscClick.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

  gainClick.gain.setValueAtTime(0.001, now);
  gainClick.gain.setValueAtTime(0.001, now + 0.04);
  gainClick.gain.linearRampToValueAtTime(0.7, now + 0.06);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  oscClick.connect(gainClick);
  gainClick.connect(masterGain);

  oscClick.start(now + 0.04);
  oscClick.stop(now + 0.23);

  cleanupNodes([oscPop, gainPop, oscClick, gainClick, masterGain], 400);
}

/**
 * 2. playTransformationSound()
 * Suara kilau magis saat kotak berubah wujud menjadi benda asli (pencil, plate, dll.).
 * 6 nada arpeggio tinggi berkilau (sparkle/shimmer chime) bergaya Zelda / RPG Item Reveal.
 */
export function playTransformationSound(options?: { volume?: number }): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options?.volume ?? 1) * globalMasterVolume;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol * 0.38, now);
  masterGain.connect(ctx.destination);

  // Arpeggio frequencies: C6, E6, G6, B6, C7, E7 (Sparkle chord)
  const sparkleFreqs = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0, 2637.02];
  const stepTime = 0.042; // delay between sparkle notes

  const trackedNodes: AudioNode[] = [masterGain];

  sparkleFreqs.forEach((freq, idx) => {
    const startTime = now + idx * stepTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Dual sound: sine with high sparkle shimmer
    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    // Subtle vibrato shimmer
    osc.frequency.linearRampToValueAtTime(freq * 1.015, startTime + 0.15);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.85, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.3);

    trackedNodes.push(osc, gain);
  });

  cleanupNodes(trackedNodes, 800);
}

/**
 * 3. playVerbCorrectSound()
 * Suara nada katsuyou berhasil (perubahan kata kerja -te / -nai de berhasil).
 * Nada 3 tingkat ceria dan mantap (E5 -> G#5 -> B5 / Major Triad Power Up).
 */
export function playVerbCorrectSound(options?: { volume?: number }): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options?.volume ?? 1) * globalMasterVolume;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol * 0.42, now);
  masterGain.connect(ctx.destination);

  // Upward progression: F5 (698.46Hz) -> A5 (880Hz) -> C6 (1046.50Hz)
  const notes = [
    { freq: 698.46, time: 0.0, dur: 0.09 },
    { freq: 880.0, time: 0.08, dur: 0.09 },
    { freq: 1046.5, time: 0.16, dur: 0.24 },
  ];

  const trackedNodes: AudioNode[] = [masterGain];

  notes.forEach(({ freq, time, dur }) => {
    const startTime = now + time;

    // Main tone (triangle)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.9, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + dur + 0.02);

    // Warm harmonic overtone (sine)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 0.5, startTime);

    subGain.gain.setValueAtTime(0.001, startTime);
    subGain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

    subOsc.connect(subGain);
    subGain.connect(masterGain);

    subOsc.start(startTime);
    subOsc.stop(startTime + dur + 0.02);

    trackedNodes.push(osc, gain, subOsc, subGain);
  });

  cleanupNodes(trackedNodes, 600);
}

/**
 * 4. playSentenceCompleteSound()
 * Fanfar kemenangan mini saat kalimat utuh 100% berhasil dirangkai.
 * Melodi jingle triunfal bergaya chiptune arcade yang memuaskan dan bersemangat!
 */
export function playSentenceCompleteSound(options?: { volume?: number }): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options?.volume ?? 1) * globalMasterVolume;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol * 0.45, now);
  masterGain.connect(ctx.destination);

  // Fanfare Melody: G4 -> C5 -> E5 -> G5 -> Victory Chord (C6 + E6 + G6)
  const leadNotes = [
    { freq: 392.0, time: 0.0, dur: 0.1 }, // G4
    { freq: 523.25, time: 0.1, dur: 0.1 }, // C5
    { freq: 659.25, time: 0.2, dur: 0.1 }, // E5
    { freq: 783.99, time: 0.3, dur: 0.18 }, // G5
  ];

  const trackedNodes: AudioNode[] = [masterGain];

  // Play melodic intro
  leadNotes.forEach(({ freq, time, dur }) => {
    const startTime = now + time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.85, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + dur + 0.02);

    trackedNodes.push(osc, gain);
  });

  // Final Triumphant Chord at t = 0.48s
  const chordTime = now + 0.48;
  const chordFreqs = [523.25, 659.25, 1046.5, 1318.51]; // C5, E5, C6, E6

  chordFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx >= 2 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, chordTime);

    gain.gain.setValueAtTime(0.001, chordTime);
    gain.gain.linearRampToValueAtTime(0.7 / chordFreqs.length, chordTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.75);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(chordTime);
    osc.stop(chordTime + 0.78);

    trackedNodes.push(osc, gain);
  });

  cleanupNodes(trackedNodes, 1500);
}

/**
 * 5. playWrongBuzzer()
 * Nada salah lembut (gentle error boop / warm bonk).
 * Didesain tidak menyakitkan telinga dan ramah pembelajar (soft low-pass filtered two-tone).
 */
export function playWrongBuzzer(options?: { volume?: number }): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = (options?.volume ?? 1) * globalMasterVolume;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol * 0.38, now);

  // Lowpass filter to make it mellow and soft, avoiding harsh piercing buzzers
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(480, now);

  masterGain.connect(filter);
  filter.connect(ctx.destination);

  // Soft descending two-step: Eb4 (311.13 Hz) -> B3 (246.94 Hz)
  const tones = [
    { freq: 311.13, time: 0.0, dur: 0.12 },
    { freq: 246.94, time: 0.12, dur: 0.22 },
  ];

  const trackedNodes: AudioNode[] = [masterGain, filter];

  tones.forEach(({ freq, time, dur }) => {
    const startTime = now + time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + dur + 0.02);

    trackedNodes.push(osc, gain);
  });

  cleanupNodes(trackedNodes, 600);
}

// ---------------------------------------------------------------------------
// 2. EMOJI & SPRITE MAPPINGS FOR FACILITY PACKS
// ---------------------------------------------------------------------------

/**
 * KYOUSHITSU (教室 - Ruang Kelas) Asset Registry
 * Berisi 12 item benda kelas yang ada di dalam kyoushitsu-pack.json
 */
export const KYOUSHITSU_ASSETS: Record<string, GameItemAsset> = {
  box_kyo_01: {
    id: 'box_kyo_01',
    facility: 'kyoushitsu',
    word: 'えんぴつ',
    kanji: '鉛筆',
    meaning: 'Pensil',
    englishName: 'Pencil',
    emoji: '✏️',
    secondaryEmoji: '📝',
    themeColor: '#F59E0B',
    bgGradient: 'from-amber-400 to-yellow-500',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    spriteKey: 'item_pencil',
    category: 'stationery',
    sparkleColor: '#FBBF24',
    animationHint: 'bounce',
    soundProfile: 'wood',
  },
  box_kyo_02: {
    id: 'box_kyo_02',
    facility: 'kyoushitsu',
    word: 'けしごむ',
    kanji: '消しゴム',
    meaning: 'Penghapus Karet',
    englishName: 'Eraser',
    emoji: '🧼',
    secondaryEmoji: '🧽',
    themeColor: '#EC4899',
    bgGradient: 'from-pink-400 to-rose-500',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
    spriteKey: 'item_eraser',
    category: 'stationery',
    sparkleColor: '#F472B6',
    animationHint: 'pulse',
    soundProfile: 'paper',
  },
  box_kyo_03: {
    id: 'box_kyo_03',
    facility: 'kyoushitsu',
    word: 'きょうかしょ',
    kanji: '教科書',
    meaning: 'Buku Pelajaran / Teks',
    englishName: 'Textbook',
    emoji: '📕',
    secondaryEmoji: '📖',
    themeColor: '#3B82F6',
    bgGradient: 'from-blue-500 to-indigo-600',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    spriteKey: 'item_textbook',
    category: 'stationery',
    sparkleColor: '#60A5FA',
    animationHint: 'float',
    soundProfile: 'paper',
  },
  box_kyo_04: {
    id: 'box_kyo_04',
    facility: 'kyoushitsu',
    word: 'こくばん',
    kanji: '黒板',
    meaning: 'Papan Tulis',
    englishName: 'Blackboard',
    emoji: '📋',
    secondaryEmoji: '🏫',
    themeColor: '#059669',
    bgGradient: 'from-emerald-600 to-teal-700',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    spriteKey: 'item_blackboard',
    category: 'facility',
    sparkleColor: '#34D399',
    animationHint: 'glow',
    soundProfile: 'wood',
  },
  box_kyo_05: {
    id: 'box_kyo_05',
    facility: 'kyoushitsu',
    word: 'いす',
    kanji: '椅子',
    meaning: 'Kursi',
    englishName: 'Chair',
    emoji: '🪑',
    secondaryEmoji: '🧎',
    themeColor: '#8B5CF6',
    bgGradient: 'from-purple-500 to-indigo-600',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    spriteKey: 'item_chair',
    category: 'furniture',
    sparkleColor: '#A78BFA',
    animationHint: 'bounce',
    soundProfile: 'wood',
  },
  box_kyo_06: {
    id: 'box_kyo_06',
    facility: 'kyoushitsu',
    word: 'つくえ',
    kanji: '机',
    meaning: 'Meja Belajar',
    englishName: 'Desk',
    emoji: '🪵',
    secondaryEmoji: '🗄️',
    themeColor: '#D97706',
    bgGradient: 'from-amber-600 to-orange-700',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-400',
    spriteKey: 'item_desk',
    category: 'furniture',
    sparkleColor: '#FBBF24',
    animationHint: 'pulse',
    soundProfile: 'wood',
  },
  box_kyo_07: {
    id: 'box_kyo_07',
    facility: 'kyoushitsu',
    word: 'ドア',
    kanji: '扉',
    meaning: 'Pintu Kelas',
    englishName: 'Classroom Door',
    emoji: '🚪',
    secondaryEmoji: '🔑',
    themeColor: '#6B7280',
    bgGradient: 'from-gray-500 to-slate-700',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    spriteKey: 'item_door',
    category: 'facility',
    sparkleColor: '#9CA3AF',
    animationHint: 'glow',
    soundProfile: 'wood',
  },
  box_kyo_08: {
    id: 'box_kyo_08',
    facility: 'kyoushitsu',
    word: 'まど',
    kanji: '窓',
    meaning: 'Jendela Kelas',
    englishName: 'Window',
    emoji: '🪟',
    secondaryEmoji: '🌤️',
    themeColor: '#06B6D4',
    bgGradient: 'from-cyan-400 to-sky-500',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    spriteKey: 'item_window',
    category: 'facility',
    sparkleColor: '#38BDF8',
    animationHint: 'float',
    soundProfile: 'magic',
  },
  box_kyo_09: {
    id: 'box_kyo_09',
    facility: 'kyoushitsu',
    word: 'スマホ',
    kanji: '携帯電話',
    meaning: 'Smartphone / HP',
    englishName: 'Smartphone',
    emoji: '📱',
    secondaryEmoji: '📶',
    themeColor: '#6366F1',
    bgGradient: 'from-indigo-500 to-blue-600',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    spriteKey: 'item_smartphone',
    category: 'electronics',
    sparkleColor: '#818CF8',
    animationHint: 'pulse',
    soundProfile: 'magic',
  },
  box_kyo_10: {
    id: 'box_kyo_10',
    facility: 'kyoushitsu',
    word: 'ノート',
    kanji: '帳面',
    meaning: 'Buku Catatan',
    englishName: 'Notebook',
    emoji: '📓',
    secondaryEmoji: '📒',
    themeColor: '#EAB308',
    bgGradient: 'from-yellow-400 to-amber-500',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    spriteKey: 'item_notebook',
    category: 'stationery',
    sparkleColor: '#FDE047',
    animationHint: 'float',
    soundProfile: 'paper',
  },
  box_kyo_11: {
    id: 'box_kyo_11',
    facility: 'kyoushitsu',
    word: 'はさみ',
    kanji: '鋏',
    meaning: 'Gunting Kertas',
    englishName: 'Scissors',
    emoji: '✂️',
    secondaryEmoji: '📄',
    themeColor: '#EF4444',
    bgGradient: 'from-red-500 to-rose-600',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    spriteKey: 'item_scissors',
    category: 'stationery',
    sparkleColor: '#F87171',
    animationHint: 'bounce',
    soundProfile: 'metallic',
  },
  box_kyo_12: {
    id: 'box_kyo_12',
    facility: 'kyoushitsu',
    word: 'ごみばこ',
    kanji: '塵箱',
    meaning: 'Tempat Sampah',
    englishName: 'Trash Bin',
    emoji: '🗑️',
    secondaryEmoji: '♻️',
    themeColor: '#64748B',
    bgGradient: 'from-slate-500 to-zinc-600',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    spriteKey: 'item_trashbin',
    category: 'facility',
    sparkleColor: '#94A3B8',
    animationHint: 'pulse',
    soundProfile: 'wood',
  },
};

/**
 * SHOKUDOU (食堂 - Kantin & Ruang Makan) Asset Registry
 * Berisi 12 item perlengkapan kantin yang ada di dalam shokudou-pack.json
 */
export const SHOKUDOU_ASSETS: Record<string, GameItemAsset> = {
  box_sho_01: {
    id: 'box_sho_01',
    facility: 'shokudou',
    word: 'はし',
    kanji: '箸',
    meaning: 'Sumpit',
    englishName: 'Chopsticks',
    emoji: '🥢',
    secondaryEmoji: '🍱',
    themeColor: '#F97316',
    bgGradient: 'from-orange-500 to-amber-600',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    spriteKey: 'item_chopsticks',
    category: 'tableware',
    sparkleColor: '#FB923C',
    animationHint: 'bounce',
    soundProfile: 'wood',
  },
  box_sho_02: {
    id: 'box_sho_02',
    facility: 'shokudou',
    word: 'おさら',
    kanji: 'お皿',
    meaning: 'Piring Makan',
    englishName: 'Plate',
    emoji: '🍽️',
    secondaryEmoji: '🥣',
    themeColor: '#6366F1',
    bgGradient: 'from-indigo-400 to-blue-500',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    spriteKey: 'item_plate',
    category: 'tableware',
    sparkleColor: '#A5B4FC',
    animationHint: 'pulse',
    soundProfile: 'metallic',
  },
  box_sho_03: {
    id: 'box_sho_03',
    facility: 'shokudou',
    word: 'コップ',
    kanji: '杯',
    meaning: 'Gelas Kaca/Plastik',
    englishName: 'Drinking Cup',
    emoji: '🥛',
    secondaryEmoji: '🥤',
    themeColor: '#0EA5E9',
    bgGradient: 'from-sky-400 to-cyan-500',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    spriteKey: 'item_cup',
    category: 'tableware',
    sparkleColor: '#38BDF8',
    animationHint: 'float',
    soundProfile: 'liquid',
  },
  box_sho_04: {
    id: 'box_sho_04',
    facility: 'shokudou',
    word: 'スプーン',
    kanji: '匙',
    meaning: 'Sendok',
    englishName: 'Spoon',
    emoji: '🥄',
    secondaryEmoji: '🍛',
    themeColor: '#94A3B8',
    bgGradient: 'from-slate-400 to-gray-500',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    spriteKey: 'item_spoon',
    category: 'tableware',
    sparkleColor: '#CBD5E1',
    animationHint: 'bounce',
    soundProfile: 'metallic',
  },
  box_sho_05: {
    id: 'box_sho_05',
    facility: 'shokudou',
    word: 'ていしょく',
    kanji: '定食',
    meaning: 'Paket Makanan Lengkap',
    englishName: 'Teishoku Set Meal',
    emoji: '🍱',
    secondaryEmoji: '🍲',
    themeColor: '#F59E0B',
    bgGradient: 'from-amber-500 to-yellow-600',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    spriteKey: 'item_teishoku',
    category: 'food',
    sparkleColor: '#FBBF24',
    animationHint: 'glow',
    soundProfile: 'magic',
  },
  box_sho_06: {
    id: 'box_sho_06',
    facility: 'shokudou',
    word: 'おちゃ',
    kanji: 'お茶',
    meaning: 'Teh Hijau Panas/Dingin',
    englishName: 'Green Tea',
    emoji: '🍵',
    secondaryEmoji: '🍃',
    themeColor: '#16A34A',
    bgGradient: 'from-green-500 to-emerald-600',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    spriteKey: 'item_greentea',
    category: 'drink',
    sparkleColor: '#4ADE80',
    animationHint: 'float',
    soundProfile: 'liquid',
  },
  box_sho_07: {
    id: 'box_sho_07',
    facility: 'shokudou',
    word: 'て',
    kanji: '手',
    meaning: 'Tangan',
    englishName: 'Hands (Wash Hands)',
    emoji: '✋',
    secondaryEmoji: '🧼',
    themeColor: '#FB923C',
    bgGradient: 'from-orange-400 to-rose-400',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    spriteKey: 'item_hands',
    category: 'hygiene',
    sparkleColor: '#FDBA74',
    animationHint: 'pulse',
    soundProfile: 'liquid',
  },
  box_sho_08: {
    id: 'box_sho_08',
    facility: 'shokudou',
    word: 'たばこ',
    kanji: '煙草',
    meaning: 'Rokok',
    englishName: 'Cigarette',
    emoji: '🚬',
    secondaryEmoji: '🚭',
    themeColor: '#78716C',
    bgGradient: 'from-stone-500 to-neutral-600',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    spriteKey: 'item_tobacco',
    category: 'hygiene',
    sparkleColor: '#A8A29E',
    animationHint: 'pulse',
    soundProfile: 'paper',
  },
  box_sho_09: {
    id: 'box_sho_09',
    facility: 'shokudou',
    word: 'しお',
    kanji: '塩',
    meaning: 'Garam Dapur',
    englishName: 'Salt Shaker',
    emoji: '🧂',
    secondaryEmoji: '✨',
    themeColor: '#0284C7',
    bgGradient: 'from-sky-500 to-blue-600',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    spriteKey: 'item_salt',
    category: 'tableware',
    sparkleColor: '#BAE6FD',
    animationHint: 'bounce',
    soundProfile: 'magic',
  },
  box_sho_10: {
    id: 'box_sho_10',
    facility: 'shokudou',
    word: 'おかね',
    kanji: 'お金',
    meaning: 'Uang Pembayaran',
    englishName: 'Money (Yen)',
    emoji: '💴',
    secondaryEmoji: '🪙',
    themeColor: '#EAB308',
    bgGradient: 'from-yellow-400 to-amber-500',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    spriteKey: 'item_money',
    category: 'currency',
    sparkleColor: '#FDE047',
    animationHint: 'glow',
    soundProfile: 'metallic',
  },
  box_sho_11: {
    id: 'box_sho_11',
    facility: 'shokudou',
    word: 'せき',
    kanji: '席',
    meaning: 'Kursi Tempat Duduk',
    englishName: 'Cafeteria Seat',
    emoji: '🪑',
    secondaryEmoji: '🏷️',
    themeColor: '#A855F7',
    bgGradient: 'from-purple-500 to-violet-600',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    spriteKey: 'item_seat',
    category: 'furniture',
    sparkleColor: '#C084FC',
    animationHint: 'bounce',
    soundProfile: 'wood',
  },
  box_sho_12: {
    id: 'box_sho_12',
    facility: 'shokudou',
    word: 'ティッシュ',
    kanji: '薄紙',
    meaning: 'Tissue Pembersih Meja',
    englishName: 'Table Tissue',
    emoji: '🧻',
    secondaryEmoji: '📦',
    themeColor: '#64748B',
    bgGradient: 'from-slate-400 to-zinc-500',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    spriteKey: 'item_tissue',
    category: 'hygiene',
    sparkleColor: '#CBD5E1',
    animationHint: 'float',
    soundProfile: 'paper',
  },
};

/**
 * Mystery Box Visual Progression Metadata
 */
export const MYSTERY_BOX_VISUALS: Record<MysteryBoxVisualState, MysteryBoxVisualInfo> = {
  LOCKED: {
    state: 'LOCKED',
    emoji: '📦',
    labelIndonesian: 'Kotak Misteri Terkunci',
    glowColor: '#D97706',
    borderClass: 'border-amber-500/60 shadow-amber-500/20',
    bgClass: 'bg-amber-950/40',
    particleEffect: 'none',
  },
  OPENING: {
    state: 'OPENING',
    emoji: '💥',
    labelIndonesian: 'Membuka Kotak...',
    glowColor: '#F59E0B',
    borderClass: 'border-yellow-400 shadow-yellow-400/50 animate-pulse',
    bgClass: 'bg-yellow-900/50',
    particleEffect: 'smoke-burst',
  },
  TRANSFORMED: {
    state: 'TRANSFORMED',
    emoji: '✨',
    labelIndonesian: 'Benda Berhasil Terbuka!',
    glowColor: '#38BDF8',
    borderClass: 'border-sky-400 shadow-sky-400/50',
    bgClass: 'bg-sky-950/40',
    particleEffect: 'sparkle-stars',
  },
  SOLVED: {
    state: 'SOLVED',
    emoji: '⭐',
    labelIndonesian: 'Tuntas & Terkuasai!',
    glowColor: '#10B981',
    borderClass: 'border-emerald-400 shadow-emerald-400/60',
    bgClass: 'bg-emerald-950/40',
    particleEffect: 'golden-glitter',
  },
};

// ---------------------------------------------------------------------------
// 3. LOOKUP & HELPER UTILITIES
// ---------------------------------------------------------------------------

/**
 * Find game item asset by Box ID (e.g. "box_kyo_01") or Japanese word (e.g. "えんぴつ").
 */
export function getItemAsset(query: string): GameItemAsset | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  // Try direct ID lookup
  if (KYOUSHITSU_ASSETS[q]) return KYOUSHITSU_ASSETS[q];
  if (SHOKUDOU_ASSETS[q]) return SHOKUDOU_ASSETS[q];

  // Search by word or kanji in Kyoushitsu
  const kyoFound = Object.values(KYOUSHITSU_ASSETS).find(
    item => item.word === q || item.kanji === q || item.meaning.toLowerCase() === q || item.englishName.toLowerCase() === q
  );
  if (kyoFound) return kyoFound;

  // Search by word or kanji in Shokudou
  const shoFound = Object.values(SHOKUDOU_ASSETS).find(
    item => item.word === q || item.kanji === q || item.meaning.toLowerCase() === q || item.englishName.toLowerCase() === q
  );
  return shoFound;
}

/**
 * Get all assets for a specific facility pack.
 */
export function getFacilityItems(facility: FacilityType): GameItemAsset[] {
  if (facility === 'kyoushitsu') {
    return Object.values(KYOUSHITSU_ASSETS);
  }
  return Object.values(SHOKUDOU_ASSETS);
}

/**
 * Get all available game items from all facilities.
 */
export function getAllGameItems(): GameItemAsset[] {
  return [...Object.values(KYOUSHITSU_ASSETS), ...Object.values(SHOKUDOU_ASSETS)];
}

/**
 * Get visual details for a mystery box state.
 */
export function getMysteryBoxVisual(state: MysteryBoxVisualState): MysteryBoxVisualInfo {
  return MYSTERY_BOX_VISUALS[state] || MYSTERY_BOX_VISUALS.LOCKED;
}

/**
 * Combined sound effects collection object for clean imports.
 */
export const soundEffects = {
  playBoxOpenSound,
  playTransformationSound,
  playVerbCorrectSound,
  playSentenceCompleteSound,
  playWrongBuzzer,
  getAudioContext,
  isAudioMuted,
  setAudioMuted,
  toggleAudioMute,
  setMasterVolume,
  getMasterVolume,
};

export default soundEffects;
