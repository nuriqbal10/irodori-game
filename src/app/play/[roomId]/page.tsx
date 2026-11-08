'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  X,
  Star,
  Flame,
  Lock,
  Smile,
  Cog,
  FileCheck,
  MapPin,
  ChevronRight
} from 'lucide-react';

// Web Audio API Synthesizer (No external mp3 assets needed)
class SoundFx {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTap() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }

  playGear() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [400, 600, 800].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.08);
    });
  }

  playWrong() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  playFanfare() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0.1 },
      { f: 659.25, t: 0.1 },
      { f: 783.99, t: 0.1 },
      { f: 1046.5, t: 0.35 }
    ];
    let offset = 0;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.005, now + offset + note.t);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + note.t);
      offset += note.t * 0.85;
    });
  }

  playEmote() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.15);
  }
}

const sfx = new SoundFx();

// 12 Authentic Mystery Boxes for Japanese Classroom & Workplace
export interface MysteryBoxData {
  id: number;
  boxKanji: string;
  itemEmoji: string;
  itemKanji: string;
  itemFurigana: string;
  itemRomaji: string;
  itemIndonesian: string;
  locationLabel: string;
  stage1: {
    clue: string;
    options: { text: string; sub: string; isCorrect: boolean }[];
    explanation: string;
  };
  stage2: {
    verbKanji: string;
    verbFurigana: string;
    verbMeaning: string;
    targetGrammar: string;
    missionPrompt: string;
    options: { form: string; romaji: string; explanation: string; isCorrect: boolean }[];
  };
  stage3: {
    targetIndonesian: string;
    sentenceRuby: { kanji: string; rt?: string }[];
    correctTokens: string[];
    tokenPool: string[];
  };
}

const MYSTERY_BOXES: MysteryBoxData[] = [
  {
    id: 1,
    boxKanji: '壱',
    itemEmoji: '✏️',
    itemKanji: '鉛筆',
    itemFurigana: 'えんぴつ',
    itemRomaji: 'Enpitsu',
    itemIndonesian: 'Pensil',
    locationLabel: 'Meja Belajar 1',
    stage1: {
      clue: 'Alat tulis berkarbon untuk mencatat kanji dan kosakata di buku catatan LPK.',
      options: [
        { text: 'えんぴつ', sub: 'enpitsu', isCorrect: true },
        { text: 'けしゴム', sub: 'keshigomu', isCorrect: false },
        { text: 'はさみ', sub: 'hasami', isCorrect: false },
        { text: 'じしょ', sub: 'jisho', isCorrect: false }
      ],
      explanation: '鉛筆 (えんぴつ) berarti pensil, perkakas penting dalam mencatat huruf Jepang!'
    },
    stage2: {
      verbKanji: '書く',
      verbFurigana: 'かく',
      verbMeaning: 'Menulis (Kakimasu)',
      targetGrammar: '~てください (Perintah Sopan)',
      missionPrompt: 'Ubahlah kata kerja 書きます (Kakimasu) menjadi instruksi sopan "Silakan tulis"!',
      options: [
        { form: 'かいてください', romaji: 'kaite kudasai', explanation: 'Bentuk Te-form (Kaku -> Kaite) + kudasai', isCorrect: true },
        { form: 'かかないでください', romaji: 'kakanaide kudasai', explanation: 'Bentuk larangan: Tolong jangan tulis', isCorrect: false },
        { form: 'かきました', romaji: 'kakimashita', explanation: 'Bentuk lampau: Sudah menulis', isCorrect: false },
        { form: 'かきましょう', romaji: 'kakimashou', explanation: 'Bentuk ajakan: Mari menulis', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Silakan tulis nama Anda dengan pensil.',
      sentenceRuby: [
        { kanji: '鉛筆', rt: 'えんぴつ' },
        { kanji: 'で' },
        { kanji: '名前', rt: 'なまえ' },
        { kanji: 'を' },
        { kanji: '書', rt: 'か' },
        { kanji: 'いてください。' }
      ],
      correctTokens: ['えんぴつで', 'なまえを', 'かいて', 'ください'],
      tokenPool: ['えんぴつで', 'なまえを', 'かいて', 'ください', 'よんで']
    }
  },
  {
    id: 2,
    boxKanji: '弐',
    itemEmoji: '📖',
    itemKanji: '辞書',
    itemFurigana: 'じしょ',
    itemRomaji: 'Jisho',
    itemIndonesian: 'Kamus',
    locationLabel: 'Rak Buku Pojok',
    stage1: {
      clue: 'Buku tebal referensi untuk mencari arti kata dan cara baca kanji yang sulit.',
      options: [
        { text: 'きょうかしょ', sub: 'kyoukasho', isCorrect: false },
        { text: 'じしょ', sub: 'jisho', isCorrect: true },
        { text: 'しんぶん', sub: 'shinbun', isCorrect: false },
        { text: 'ざっし', sub: 'zasshi', isCorrect: false }
      ],
      explanation: '辞書 (じしょ) adalah kamus yang selalu menemani siswa LPK belajar bahasa.'
    },
    stage2: {
      verbKanji: '調べる',
      verbFurigana: 'しらべる',
      verbMeaning: 'Mencari tahu / Menyelidiki',
      targetGrammar: '~てください (Instruksi Kerja)',
      missionPrompt: 'Ubahlah kata kerja 調べます (Shirabemasu) menjadi bentuk perintah "Silakan cari/periksa"!',
      options: [
        { form: 'しらべてください', romaji: 'shirabete kudasai', explanation: 'Grup 2 (Shiraberu -> Shirabete) + kudasai', isCorrect: true },
        { form: 'しらべます', romaji: 'shirabemasu', explanation: 'Bentuk Masu standar', isCorrect: false },
        { form: 'しらべないで', romaji: 'shirabenaide', explanation: 'Bentuk kasual larangan', isCorrect: false },
        { form: 'しらべた', romaji: 'shirabeta', explanation: 'Bentuk Ta lampau santai', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Silakan cari arti kata ini di dalam kamus.',
      sentenceRuby: [
        { kanji: '辞書', rt: 'じしょ' },
        { kanji: 'で' },
        { kanji: '言葉', rt: 'ことば' },
        { kanji: 'の' },
        { kanji: '意味', rt: 'いみ' },
        { kanji: 'を' },
        { kanji: '調', rt: 'しら' },
        { kanji: 'べてください。' }
      ],
      correctTokens: ['じしょで', 'ことばの', 'いみを', 'しらべて', 'ください'],
      tokenPool: ['じしょで', 'ことばの', 'いみを', 'しらべて', 'ください', 'かいて']
    }
  },
  {
    id: 3,
    boxKanji: '参',
    itemEmoji: '🧹',
    itemKanji: '箒',
    itemFurigana: 'ほうき',
    itemRomaji: 'Houki',
    itemIndonesian: 'Sapu Lantai',
    locationLabel: 'Sudut Kebersihan 5S',
    stage1: {
      clue: 'Alat pembersih bergagang untuk menyapu debu dan remah di lantai ruangan (Seiso 5S).',
      options: [
        { text: 'ぞうきん', sub: 'zoukin', isCorrect: false },
        { text: 'ほうき', sub: 'houki', isCorrect: true },
        { text: 'モップ', sub: 'moppu', isCorrect: false },
        { text: 'ちりとり', sub: 'chiritori', isCorrect: false }
      ],
      explanation: 'ほうき adalah sapu tradisional maupun modern untuk pembersihan berkala.'
    },
    stage2: {
      verbKanji: '掃く',
      verbFurigana: 'はく',
      verbMeaning: 'Menyapu (Hakimasu)',
      targetGrammar: '~ましょう (Ajakan)',
      missionPrompt: 'Ubahlah kata kerja 掃きます (Hakimasu) menjadi bentuk ajakan "Mari menyapu bersama"!',
      options: [
        { form: 'はきましょう', romaji: 'hakimashou', explanation: 'Bentuk ajakan positif: Mari kita menyapu', isCorrect: true },
        { form: 'はいてください', romaji: 'haite kudasai', explanation: 'Bentuk instruksi: Silakan sapu', isCorrect: false },
        { form: 'はきません', romaji: 'hakimasen', explanation: 'Bentuk negatif: Tidak menyapu', isCorrect: false },
        { form: 'はいた', romaji: 'haita', explanation: 'Bentuk lampau: Sudah menyapu', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Mari kita sapu ruang kelas ini bersama-sama!',
      sentenceRuby: [
        { kanji: '教室', rt: 'きょうしつ' },
        { kanji: 'を' },
        { kanji: '一緒', rt: 'いっしょ' },
        { kanji: 'に' },
        { kanji: '掃', rt: 'は' },
        { kanji: 'きましょう！' }
      ],
      correctTokens: ['きょうしつを', 'いっしょに', 'はきましょう'],
      tokenPool: ['きょうしつを', 'いっしょに', 'はきましょう', 'たべましょう']
    }
  },
  {
    id: 4,
    boxKanji: '四',
    itemEmoji: '🗑️',
    itemKanji: 'ごみ箱',
    itemFurigana: 'ごみばこ',
    itemRomaji: 'Gomibako',
    itemIndonesian: 'Tempat Sampah',
    locationLabel: 'Pintu Samping',
    stage1: {
      clue: 'Wadah khusus penampung sisa makanan/kertas yang dipilah secara disiplin.',
      options: [
        { text: 'ロッカー', sub: 'rokkaa', isCorrect: false },
        { text: 'つくえ', sub: 'tsukue', isCorrect: false },
        { text: 'ごみばこ', sub: 'gomibako', isCorrect: true },
        { text: 'かばん', sub: 'kaban', isCorrect: false }
      ],
      explanation: 'ごみ箱 (ごみばこ) memegang peranan krusial dalam budaya pemilahan sampah Jepang!'
    },
    stage2: {
      verbKanji: '捨てる',
      verbFurigana: 'すてる',
      verbMeaning: 'Membuang (Sutemasu)',
      targetGrammar: '~ないでください (Larangan Halus)',
      missionPrompt: 'Ubahlah kata kerja 捨てます (Sutemasu) menjadi kalimat larangan: "Tolong jangan buang"!',
      options: [
        { form: 'すてないでください', romaji: 'sutenaide kudasai', explanation: 'Nai-form (Sutenai) + de kudasai', isCorrect: true },
        { form: 'すててください', romaji: 'sutete kudasai', explanation: 'Instruksi: Silakan buang', isCorrect: false },
        { form: 'すてましょう', romaji: 'sutemashou', explanation: 'Ajakan: Mari membuang', isCorrect: false },
        { form: 'すてます', romaji: 'sutemasu', explanation: 'Pernyataan biasa: Membuang', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Tolong jangan buang sampah di sini.',
      sentenceRuby: [
        { kanji: 'ここ' },
        { kanji: 'に' },
        { kanji: 'ごみ' },
        { kanji: 'を' },
        { kanji: '捨', rt: 'す' },
        { kanji: 'てないで' },
        { kanji: 'ください。' }
      ],
      correctTokens: ['ここに', 'ごみを', 'すてないで', 'ください'],
      tokenPool: ['ここに', 'ごみを', 'すてないで', 'ください', 'おいて']
    }
  },
  {
    id: 5,
    boxKanji: '五',
    itemEmoji: '🪑',
    itemKanji: '椅子',
    itemFurigana: 'いす',
    itemRomaji: 'Isu',
    itemIndonesian: 'Kursi',
    locationLabel: 'Baris Depan',
    stage1: {
      clue: 'Perabot berkaki empat tempat duduk siswa saat menyimak penjelasan instruktur.',
      options: [
        { text: 'いす', sub: 'isu', isCorrect: true },
        { text: 'つくえ', sub: 'tsukue', isCorrect: false },
        { text: 'ドア', sub: 'doa', isCorrect: false },
        { text: 'まど', sub: 'mado', isCorrect: false }
      ],
      explanation: '椅子 (いす) adalah tempat duduk yang tertata rapi di kelas.'
    },
    stage2: {
      verbKanji: '座る',
      verbFurigana: 'すわる',
      verbMeaning: 'Duduk (Suwarimasu)',
      targetGrammar: '~てください (Instruksi Sopan)',
      missionPrompt: 'Ubahlah kata kerja 座ります (Suwarimasu) menjadi perintah sopan "Silakan duduk"!',
      options: [
        { form: 'すわってください', romaji: 'suwatte kudasai', explanation: 'Grup 1 (Suwaru -> Suwatte [sokuon]) + kudasai', isCorrect: true },
        { form: 'すわりてください', romaji: 'suwarite kudasai', explanation: 'Bentuk salah (tidak ada pergeseran r -> tte)', isCorrect: false },
        { form: 'すわらないで', romaji: 'suwaranaide', explanation: 'Larangan: Jangan duduk', isCorrect: false },
        { form: 'すわります', romaji: 'suwarimasu', explanation: 'Bentuk standar', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Silakan duduk di kursi ini.',
      sentenceRuby: [
        { kanji: 'この' },
        { kanji: '椅子', rt: 'いす' },
        { kanji: 'に' },
        { kanji: '座', rt: 'すわ' },
        { kanji: 'ってください。' }
      ],
      correctTokens: ['この', 'いすに', 'すわって', 'ください'],
      tokenPool: ['この', 'いすに', 'すわって', 'ください', 'たって']
    }
  },
  {
    id: 6,
    boxKanji: '六',
    itemEmoji: '📱',
    itemKanji: '携帯電話',
    itemFurigana: 'スマホ',
    itemRomaji: 'Sumaho',
    itemIndonesian: 'Smartphone',
    locationLabel: 'Saku Siswa',
    stage1: {
      clue: 'Gawai genggam pintar yang harus diset silent mode saat jam simulasi ujian.',
      options: [
        { text: 'スマホ', sub: 'sumaho', isCorrect: true },
        { text: 'パソコン', sub: 'pasokon', isCorrect: false },
        { text: 'テレビ', sub: 'terebi', isCorrect: false },
        { text: 'ラジオ', sub: 'rajio', isCorrect: false }
      ],
      explanation: 'スマホ (Smartphone) digunakan untuk mengakses kamus digital dan aplikasi kuis.'
    },
    stage2: {
      verbKanji: '使う',
      verbFurigana: 'つかう',
      verbMeaning: 'Menggunakan (Tsukaimasu)',
      targetGrammar: '~てもいいですか (Meminta Izin)',
      missionPrompt: 'Ubahlah 使います (Tsukaimasu) menjadi bentuk minta izin: "Bolehkah saya memakai...?"',
      options: [
        { form: 'つかってもいいですか', romaji: 'tsukatte mo ii desu ka', explanation: 'Te-form + mo ii desu ka untuk izin', isCorrect: true },
        { form: 'つかわないでください', romaji: 'tsukawanaide kudasai', explanation: 'Larangan: Tolong jangan pakai', isCorrect: false },
        { form: 'つかいますか', romaji: 'tsukaimasu ka', explanation: 'Pertanyaan: Apakah Anda memakai?', isCorrect: false },
        { form: 'つかいました', romaji: 'tsukaimashita', explanation: 'Lampau: Sudah memakai', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Bolehkah saya memakai kamus smartphone?',
      sentenceRuby: [
        { kanji: 'スマホ' },
        { kanji: 'の' },
        { kanji: '辞書', rt: 'じしょ' },
        { kanji: 'を' },
        { kanji: '使', rt: 'つか' },
        { kanji: 'っても' },
        { kanji: 'いいですか？' }
      ],
      correctTokens: ['スマホの', 'じしょを', 'つかっても', 'いいですか'],
      tokenPool: ['スマホの', 'じしょを', 'つかっても', 'いいですか', 'のみます']
    }
  },
  {
    id: 7,
    boxKanji: '七',
    itemEmoji: '🕰️',
    itemKanji: '時計',
    itemFurigana: 'とけい',
    itemRomaji: 'Tokei',
    itemIndonesian: 'Jam Dinding',
    locationLabel: 'Dinding Tengah',
    stage1: {
      clue: 'Penunjuk waktu berputar untuk mengontrol durasi pengerjaan soal dan istirahat.',
      options: [
        { text: 'カレンダー', sub: 'karendaa', isCorrect: false },
        { text: 'とけい', sub: 'tokei', isCorrect: true },
        { text: 'ポスター', sub: 'posutaa', isCorrect: false },
        { text: 'でんき', sub: 'denki', isCorrect: false }
      ],
      explanation: '時計 (とけい) melambangkan disiplin waktu ketat bangsa Jepang.'
    },
    stage2: {
      verbKanji: '見る',
      verbFurigana: 'みる',
      verbMeaning: 'Melihat (Mimasu)',
      targetGrammar: '~てください (Instruksi)',
      missionPrompt: 'Ubahlah kata kerja 見ます (Mimasu) menjadi instruksi sopan "Silakan lihat"!',
      options: [
        { form: 'みてください', romaji: 'mite kudasai', explanation: 'Grup 2 (Miru -> Mite) + kudasai', isCorrect: true },
        { form: 'みないでください', romaji: 'minaide kudasai', explanation: 'Tolong jangan melihat', isCorrect: false },
        { form: 'みました', romaji: 'mimashita', explanation: 'Sudah melihat', isCorrect: false },
        { form: 'みましょう', romaji: 'mimashou', explanation: 'Mari melihat', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Silakan lihat jam dinding dan periksa waktunya.',
      sentenceRuby: [
        { kanji: '時計', rt: 'とけい' },
        { kanji: 'を' },
        { kanji: '見', rt: 'み' },
        { kanji: 'て' },
        { kanji: '時間', rt: 'じかん' },
        { kanji: 'を' },
        { kanji: '確認', rt: 'かくにん' },
        { kanji: 'してください。' }
      ],
      correctTokens: ['とけいを', 'みて', 'じかんを', 'かくにんして', 'ください'],
      tokenPool: ['とけいを', 'みて', 'じかんを', 'かくにんして', 'ください', 'きいて']
    }
  },
  {
    id: 8,
    boxKanji: '八',
    itemEmoji: '📋',
    itemKanji: '出席簿',
    itemFurigana: 'しゅっせきぼ',
    itemRomaji: 'Shussekibo',
    itemIndonesian: 'Buku Presensi',
    locationLabel: 'Meja Sensei',
    stage1: {
      clue: 'Buku daftar nama siswa untuk mengecek presensi kehadiran dan ketepatan waktu.',
      options: [
        { text: 'しゅっせきぼ', sub: 'shussekibo', isCorrect: true },
        { text: 'きょうかしょ', sub: 'kyoukasho', isCorrect: false },
        { text: 'ノート', sub: 'nooto', isCorrect: false },
        { text: 'めも', sub: 'memo', isCorrect: false }
      ],
      explanation: '出席簿 (しゅっせきぼ) digunakan saat roll call (tenko) tiap pagi di LPK.'
    },
    stage2: {
      verbKanji: '呼ぶ',
      verbFurigana: 'よぶ',
      verbMeaning: 'Memanggil (Yobimasu)',
      targetGrammar: '~ます (Bentuk Sopan Standar)',
      missionPrompt: 'Ubahlah kata dasar 呼ぶ (Yobu) menjadi bentuk sopan present "~ます"!',
      options: [
        { form: 'よびます', romaji: 'yobimasu', explanation: 'Bentuk Masu present positif', isCorrect: true },
        { form: 'よびました', romaji: 'yobimashita', explanation: 'Bentuk lampau: sudah memanggil', isCorrect: false },
        { form: 'よんでください', romaji: 'yonde kudasai', explanation: 'Bentuk perintah: silakan panggil', isCorrect: false },
        { form: 'よばない', romaji: 'yobanai', explanation: 'Bentuk negatif kasual', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Sensei memanggil nama siswa satu per satu.',
      sentenceRuby: [
        { kanji: '先生', rt: 'せんせい' },
        { kanji: 'が' },
        { kanji: '名前', rt: 'なまえ' },
        { kanji: 'を' },
        { kanji: '順番', rt: 'じゅんばん' },
        { kanji: 'に' },
        { kanji: '呼', rt: 'よ' },
        { kanji: 'びます。' }
      ],
      correctTokens: ['せんせいが', 'なまえを', 'じゅんばんに', 'よびます'],
      tokenPool: ['せんせいが', 'なまえを', 'じゅんばんに', 'よびます', 'かえります']
    }
  },
  {
    id: 9,
    boxKanji: '九',
    itemEmoji: '💡',
    itemKanji: '電気',
    itemFurigana: 'でんき',
    itemRomaji: 'Denki',
    itemIndonesian: 'Lampu Penerangan',
    locationLabel: 'Plafon Kelas',
    stage1: {
      clue: 'Penerangan di langit-langit yang dinyalakan saat kelas mulai gelap.',
      options: [
        { text: 'エアコン', sub: 'eakon', isCorrect: false },
        { text: 'でんき', sub: 'denki', isCorrect: true },
        { text: 'スイッチ', sub: 'suitchi', isCorrect: false },
        { text: 'まど', sub: 'mado', isCorrect: false }
      ],
      explanation: '電気 (でんき) adalah listrik penerangan ruangan.'
    },
    stage2: {
      verbKanji: '消す',
      verbFurigana: 'けす',
      verbMeaning: 'Memadamkan / Mematikan',
      targetGrammar: '~てください (Instruksi Penghematan)',
      missionPrompt: 'Ubahlah 消します (Keshimasu) menjadi instruksi hemat energi "Tolong matikan"!',
      options: [
        { form: 'けしてください', romaji: 'keshite kudasai', explanation: 'Grup 1 (Kesu -> Keshite) + kudasai', isCorrect: true },
        { form: 'けさないでください', romaji: 'kesanaide kudasai', explanation: 'Tolong jangan matikan', isCorrect: false },
        { form: 'けしました', romaji: 'keshimashita', explanation: 'Sudah dimatikan', isCorrect: false },
        { form: 'けしましょう', romaji: 'keshimashou', explanation: 'Mari kita matikan', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Tolong matikan lampu saat keluar ruangan.',
      sentenceRuby: [
        { kanji: '部屋', rt: 'へや' },
        { kanji: 'を' },
        { kanji: '出', rt: 'で' },
        { kanji: 'る' },
        { kanji: '時', rt: 'とき' },
        { kanji: 'に' },
        { kanji: '電気', rt: 'でんき' },
        { kanji: 'を' },
        { kanji: '消', rt: 'け' },
        { kanji: 'してください。' }
      ],
      correctTokens: ['へやを', 'でるときに', 'でんきを', 'けして', 'ください'],
      tokenPool: ['へやを', 'でるときに', 'でんきを', 'けして', 'ください', 'あけて']
    }
  },
  {
    id: 10,
    boxKanji: '十',
    itemEmoji: '🚪',
    itemKanji: '扉',
    itemFurigana: 'ドア',
    itemRomaji: 'Doa',
    itemIndonesian: 'Pintu Ruangan',
    locationLabel: 'Pintu Masuk Utama',
    stage1: {
      clue: 'Pintu masuk ruangan kelas yang wajib diketuk 2 kali sebelum mengucap Shitsurei shimasu.',
      options: [
        { text: 'ドア', sub: 'doa', isCorrect: true },
        { text: 'かべ', sub: 'kabe', isCorrect: false },
        { text: 'ゆか', sub: 'yuka', isCorrect: false },
        { text: 'てんじょう', sub: 'tenjou', isCorrect: false }
      ],
      explanation: 'ドア (Doa) adalah etiket utama tata krama masuk kantor di Jepang.'
    },
    stage2: {
      verbKanji: '閉める',
      verbFurigana: 'しめる',
      verbMeaning: 'Menutup (Shimemasu)',
      targetGrammar: '~てください (Instruksi Sopan)',
      missionPrompt: 'Ubahlah 閉めます (Shimemasu) menjadi perintah tenang: "Tolong tutup"!',
      options: [
        { form: 'しめてください', romaji: 'shimete kudasai', explanation: 'Grup 2 (Shimeru -> Shimete) + kudasai', isCorrect: true },
        { form: 'しめないでください', romaji: 'shimenaide kudasai', explanation: 'Tolong jangan ditutup', isCorrect: false },
        { form: 'しめました', romaji: 'shimemashita', explanation: 'Sudah ditutup', isCorrect: false },
        { form: 'しめましょう', romaji: 'shimemashou', explanation: 'Mari menutup', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Tolong tutup pintu itu dengan tenang.',
      sentenceRuby: [
        { kanji: 'その' },
        { kanji: 'ドア' },
        { kanji: 'を' },
        { kanji: '静', rt: 'しず' },
        { kanji: 'かに' },
        { kanji: '閉', rt: 'し' },
        { kanji: 'めてください。' }
      ],
      correctTokens: ['その', 'ドアを', 'しずかに', 'しめて', 'ください'],
      tokenPool: ['その', 'ドアを', 'しずかに', 'しめて', 'ください', 'のんで']
    }
  },
  {
    id: 11,
    boxKanji: '十一',
    itemEmoji: '🧴',
    itemKanji: '消毒液',
    itemFurigana: 'しょうどくえき',
    itemRomaji: 'Shoudokueki',
    itemIndonesian: 'Disinfektan Tangan',
    locationLabel: 'Meja Wastafel',
    stage1: {
      clue: 'Cairan pembersih kuman untuk menjaga higienitas tangan sebelum bekerja atau makan.',
      options: [
        { text: 'せっけん', sub: 'sekken', isCorrect: false },
        { text: 'しょうどくえき', sub: 'shoudokueki', isCorrect: true },
        { text: 'みず', sub: 'mizu', isCorrect: false },
        { text: 'おゆ', sub: 'oyu', isCorrect: false }
      ],
      explanation: '消毒液 (しょうどくえき) adalah standar kebersihan wajib di pabrik makanan & panti kaigo.'
    },
    stage2: {
      verbKanji: '洗う',
      verbFurigana: 'あらう',
      verbMeaning: 'Mencuci (Araimasu)',
      targetGrammar: '~てから (Urutan Tindakan: Setelah...)',
      missionPrompt: 'Ubahlah 洗います (Araimasu) menjadi pola urutan "Setelah mencuci..."!',
      options: [
        { form: 'あらってから', romaji: 'aratte kara', explanation: 'Te-form + kara untuk menyatakan urutan kegiatan', isCorrect: true },
        { form: 'あらいます', romaji: 'araimasu', explanation: 'Bentuk present biasa', isCorrect: false },
        { form: 'あらわないで', romaji: 'arawanaide', explanation: 'Tanpa mencuci', isCorrect: false },
        { form: 'あらいましょう', romaji: 'araimashou', explanation: 'Mari mencuci', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Setelah mencuci tangan, silakan gunakan disinfektan.',
      sentenceRuby: [
        { kanji: '手', rt: 'て' },
        { kanji: 'を' },
        { kanji: '洗', rt: 'あら' },
        { kanji: 'ってから' },
        { kanji: '消毒', rt: 'しょうどく' },
        { kanji: 'を' },
        { kanji: 'して' },
        { kanji: 'ください。' }
      ],
      correctTokens: ['てを', 'あらってから', 'しょうどくを', 'して', 'ください'],
      tokenPool: ['てを', 'あらってから', 'しょうどくを', 'して', 'ください', 'たべて']
    }
  },
  {
    id: 12,
    boxKanji: '十二',
    itemEmoji: '☕',
    itemKanji: 'お茶',
    itemFurigana: 'おちゃ',
    itemRomaji: 'Ocha',
    itemIndonesian: 'Teh Hangat',
    locationLabel: 'Pantry Istirahat',
    stage1: {
      clue: 'Minuman hangat khas Jepang yang dinikmati bersama saat jeda istirahat 10 menit.',
      options: [
        { text: 'コーラ', sub: 'koora', isCorrect: false },
        { text: 'おちゃ', sub: 'ocha', isCorrect: true },
        { text: 'ジュース', sub: 'juusu', isCorrect: false },
        { text: 'ビール', sub: 'biiru', isCorrect: false }
      ],
      explanation: 'お茶 (おちゃ) adalah sajian keramahan dan relaksasi khas budaya Jepang.'
    },
    stage2: {
      verbKanji: '飲む',
      verbFurigana: 'のむ',
      verbMeaning: 'Minum (Nomimasu)',
      targetGrammar: '~ましょう (Ajakan Hangat)',
      missionPrompt: 'Ubahlah 飲みます (Nomimasu) menjadi ajakan santai "Mari kita minum!"',
      options: [
        { form: 'のみましょう', romaji: 'nomimashou', explanation: 'Bentuk ajakan sopan: Mari minum', isCorrect: true },
        { form: 'のんでください', romaji: 'nonde kudasai', explanation: 'Perintah: Silakan minum', isCorrect: false },
        { form: 'のまないで', romaji: 'nomanaide', explanation: 'Jangan minum', isCorrect: false },
        { form: 'のみました', romaji: 'nomimashita', explanation: 'Sudah minum', isCorrect: false }
      ]
    },
    stage3: {
      targetIndonesian: 'Mari kita minum teh bersama saat waktu istirahat.',
      sentenceRuby: [
        { kanji: '休', rt: 'やす' },
        { kanji: 'み' },
        { kanji: '時間', rt: 'じかん' },
        { kanji: 'に' },
        { kanji: '一緒', rt: 'いっしょ' },
        { kanji: 'に' },
        { kanji: 'お茶', rt: 'ちゃ' },
        { kanji: 'を' },
        { kanji: '飲', rt: 'の' },
        { kanji: 'みましょう！' }
      ],
      correctTokens: ['やすみじかんに', 'いっしょに', 'おちゃを', 'のみましょう'],
      tokenPool: ['やすみじかんに', 'いっしょに', 'おちゃを', 'のみましょう', 'かきましょう']
    }
  }
];

const JAPANESE_EMOTES = [
  { kanji: 'はい！', romaji: 'Hai!', soundText: 'Hai! Siap!' },
  { kanji: 'いいえ', romaji: 'Iie', soundText: 'Iie, bukan' },
  { kanji: 'わかりました！', romaji: 'Wakarimashita!', soundText: 'Wakarimashita! Paham!' },
  { kanji: 'がんばれ！', romaji: 'Ganbare!', soundText: 'Ganbare! Semangat!' },
  { kanji: 'おつかれさま！', romaji: 'Otsukaresama!', soundText: 'Otsukaresama! Kerja bagus!' }
];

function PlayPageContent({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const playerIdParam = searchParams.get('playerId');
  const playerNameParam = searchParams.get('name');

  // Player state
  const [playerId] = useState<string>(() => {
    return playerIdParam || `p_guest_${Math.random().toString(36).substring(2, 8)}`;
  });
  const [playerName] = useState<string>(() => {
    return playerNameParam || 'Siswa LPK (Peserta)';
  });
  const [unlockedBoxIds, setUnlockedBoxIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`irodori_unlocked_${roomId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [score, setScore] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(`irodori_unlocked_${roomId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length * 100;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [streak, setStreak] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Active Challenge Modal State
  const [activeBox, setActiveBox] = useState<MysteryBoxData | null>(null);
  const [modalStage, setModalStage] = useState<1 | 2 | 3>(1);

  // Stage 1 State
  const [stage1SelectedIdx, setStage1SelectedIdx] = useState<number | null>(null);
  const [stage1IsCorrect, setStage1IsCorrect] = useState<boolean | null>(null);

  // Stage 2 State
  const [stage2SelectedIdx, setStage2SelectedIdx] = useState<number | null>(null);
  const [stage2IsCorrect, setStage2IsCorrect] = useState<boolean | null>(null);

  // Stage 3 State (Sentence Builder)
  const [sentenceWorkspace, setSentenceWorkspace] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [stage3Error, setStage3Error] = useState<string | null>(null);
  const [stage3Success, setStage3Success] = useState<boolean>(false);

  // Emote Wheel / Bubble
  const [isEmoteDrawerOpen, setIsEmoteDrawerOpen] = useState<boolean>(false);
  const [floatingEmote, setFloatingEmote] = useState<{ kanji: string; romaji: string } | null>(null);

  // Victory State (All 12 Solved)
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);


  // Sync mute state
  useEffect(() => {
    sfx.isMuted = isAudioMuted;
  }, [isAudioMuted]);

  // Open Challenge Modal for a box
  const handleOpenBox = (box: MysteryBoxData) => {
    sfx.playTap();
    setActiveBox(box);

    if (unlockedBoxIds.includes(box.id)) {
      // If already solved, open in review mode at stage 3
      setModalStage(3);
      setStage3Success(true);
      setSentenceWorkspace(box.stage3.correctTokens);
      setAvailableTokens([]);
      return;
    }

    // New attempt
    setModalStage(1);
    setStage1SelectedIdx(null);
    setStage1IsCorrect(null);
    setStage2SelectedIdx(null);
    setStage2IsCorrect(null);
    setSentenceWorkspace([]);
    // Shuffle tokens for fresh puzzle
    const shuffled = [...box.stage3.tokenPool].sort(() => Math.random() - 0.5);
    setAvailableTokens(shuffled);
    setStage3Error(null);
    setStage3Success(false);
  };

  const handleCloseModal = () => {
    sfx.playTap();
    setActiveBox(null);
  };

  // Stage 1: Object Guessing
  const handleStage1Answer = (idx: number) => {
    if (!activeBox || stage1IsCorrect === true) return;
    setStage1SelectedIdx(idx);
    const chosen = activeBox.stage1.options[idx];

    if (chosen.isCorrect) {
      sfx.playCorrect();
      setStage1IsCorrect(true);
    } else {
      sfx.playWrong();
      setStage1IsCorrect(false);
    }
  };

  // Stage 2: Conjugation Engine
  const handleStage2Answer = (idx: number) => {
    if (!activeBox || stage2IsCorrect === true) return;
    setStage2SelectedIdx(idx);
    const chosen = activeBox.stage2.options[idx];

    if (chosen.isCorrect) {
      sfx.playGear();
      setStage2IsCorrect(true);
    } else {
      sfx.playWrong();
      setStage2IsCorrect(false);
    }
  };

  // Stage 3: Sentence Builder Workspace Actions
  const handleAddTokenToWorkspace = (token: string, tokenIndexInAvailable: number) => {
    sfx.playTap();
    setStage3Error(null);
    setSentenceWorkspace((prev) => [...prev, token]);
    setAvailableTokens((prev) => prev.filter((_, idx) => idx !== tokenIndexInAvailable));
  };

  const handleRemoveTokenFromWorkspace = (token: string, tokenIndexInWorkspace: number) => {
    sfx.playTap();
    setStage3Error(null);
    setSentenceWorkspace((prev) => prev.filter((_, idx) => idx !== tokenIndexInWorkspace));
    setAvailableTokens((prev) => [...prev, token]);
  };

  const handleResetSentence = () => {
    if (!activeBox) return;
    sfx.playTap();
    setSentenceWorkspace([]);
    setAvailableTokens([...activeBox.stage3.tokenPool].sort(() => Math.random() - 0.5));
    setStage3Error(null);
  };

  // Stage 3: Verification & API Solve Trigger
  const handleVerifySentence = async () => {
    if (!activeBox) return;

    const isMatch =
      sentenceWorkspace.length === activeBox.stage3.correctTokens.length &&
      sentenceWorkspace.every((val, index) => val === activeBox.stage3.correctTokens[index]);

    if (!isMatch) {
      sfx.playWrong();
      setStage3Error('Urutan kartu kata belum tepat. Perhatikan posisi partikel dan kata kerja di akhir kalimat!');
      return;
    }

    // Success!
    sfx.playFanfare();
    setStage3Success(true);

    // Trigger Confetti Blast
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const isAlreadySolved = unlockedBoxIds.includes(activeBox.id);
    if (!isAlreadySolved) {
      const nextUnlocked = [...unlockedBoxIds, activeBox.id];
      setUnlockedBoxIds(nextUnlocked);
      setScore((prev) => prev + 100);
      setStreak((prev) => prev + 1);

      try {
        localStorage.setItem(`irodori_unlocked_${roomId}`, JSON.stringify(nextUnlocked));
      } catch (e) {
        console.warn(e);
      }

      // API Call to /api/room/[roomId]/solve
      try {
        await fetch(`/api/room/${roomId}/solve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            playerName,
            boxId: activeBox.id,
            scoreToAdd: 100,
            stage: 3,
            isCorrect: true,
            answer: sentenceWorkspace.join(' ')
          })
        });
      } catch (err) {
        console.error('Failed to report solve to server:', err);
      }

      // Check if all 12 boxes are unlocked
      if (nextUnlocked.length === 12) {
        setTimeout(() => {
          setIsVictoryModalOpen(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.4 }
          });
        }, 1200);
      }
    }
  };

  // Emote Trigger
  const handleTriggerEmote = (em: { kanji: string; romaji: string }) => {
    sfx.playEmote();
    setFloatingEmote(em);
    setIsEmoteDrawerOpen(false);
    setTimeout(() => {
      setFloatingEmote(null);
    }, 1800);
  };

  const solvedCount = unlockedBoxIds.length;
  const progressPercent = Math.round((solvedCount / 12) * 100);

  return (
    <div className="min-h-screen bg-[#0d0c14] text-[#f4efe7] flex flex-col justify-between selection:bg-red-500 selection:text-white relative overflow-x-hidden">
      
      {/* Floating Japanese Emote Bubble Notification */}
      {floatingEmote && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 border-2 border-white text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center space-x-2">
            <span className="text-xl font-black">{floatingEmote.kanji}</span>
            <span className="text-xs font-mono font-bold text-red-200">({floatingEmote.romaji})</span>
          </div>
        </div>
      )}

      {/* TOP FLOATING HUD HEADER */}
      <header className="sticky top-0 z-40 bg-[#14121f]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          
          {/* Room Title with Furigana */}
          <div className="flex items-center space-x-2 min-w-0">
            <Link
              href={`/join?pin=${roomId.replace('-', '')}`}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-stone-300 shrink-0"
              title="Kembali ke Lobi"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="truncate">
              <div className="flex items-baseline space-x-1.5 truncate">
                <span className="text-sm font-black text-white tracking-wide flex items-center">
                  <ruby>
                    教室
                    <rt className="text-[9px] text-red-400 font-normal">きょうしつ</rt>
                  </ruby>
                </span>
                <span className="text-xs text-stone-400 font-bold hidden xs:inline">• Ruang Kelas</span>
              </div>
              <div className="text-[10px] text-stone-400 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">Fasilitas LPK • Room {roomId}</span>
              </div>
            </div>
          </div>

          {/* Player Score & Combos */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Score Pill */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-amber-300 font-mono">
                {score} <span className="text-[10px] text-amber-400/80">Pts</span>
              </span>
            </div>

            {/* Streak Pill */}
            {streak > 1 && (
              <div className="bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span className="text-[10px] font-black text-red-300">{streak}x</span>
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-300 hover:text-white"
              title={isAudioMuted ? 'Nyalakan Efek Suara' : 'Matikan Efek Suara'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

          </div>

        </div>

        {/* Progress Bar (0/12 Benda Terbuka) */}
        <div className="max-w-2xl mx-auto mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-400 font-bold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Progres Eksplorasi:</span>
            </span>
            <span className="font-mono font-black text-emerald-400">
              {solvedCount} / 12 Benda Terbuka ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#0b0a11] rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </header>

      {/* MAIN BODY: 12 INTERACTIVE MYSTERY BOXES GRID */}
      <main className="max-w-2xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-start">
        
        {/* Sub-header Clue */}
        <div className="mb-4 text-center">
          <h2 className="text-base font-black text-white flex items-center justify-center space-x-2">
            <span>12 Kotak Fasilitas Kelas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40">
              Can-Do Misi
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Ketuk kotak kayu misterius, pecahkan tebakan benda, konjugasikan kata kerja, dan rangkai kalimat Irodori!
          </p>
        </div>

        {/* 12-Box Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {MYSTERY_BOXES.map((box) => {
            const isUnlocked = unlockedBoxIds.includes(box.id);

            return (
              <div
                key={box.id}
                onClick={() => handleOpenBox(box)}
                className={`relative aspect-square rounded-2xl p-2.5 flex flex-col items-center justify-between text-center select-none cursor-pointer transition-all duration-300 active:scale-95 group shadow-lg ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-emerald-950/40 via-[#132219] to-[#0c1812] border-2 border-emerald-500/50 shadow-emerald-950/50 hover:border-emerald-400'
                    : 'bg-gradient-to-b from-[#4a2e18] via-[#331c0e] to-[#201007] border-2 border-amber-600/60 shadow-amber-950/60 hover:border-amber-400 hover:shadow-amber-600/20'
                }`}
              >
                
                {/* Shiny Sparkle on Locked Box */}
                {!isUnlocked && (
                  <div className="absolute top-1.5 right-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse opacity-80 group-hover:scale-125 transition-transform" />
                  </div>
                )}

                {/* Top Kanji / Number Badge */}
                <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold">
                  <span
                    className={`px-1.5 py-0.5 rounded-md ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                    }`}
                  >
                    #{box.id}
                  </span>

                  {isUnlocked ? (
                    <span className="flex items-center text-emerald-400 font-bold space-x-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-black" />
                    </span>
                  ) : (
                    <span className="text-amber-500/80 text-[11px] font-serif">
                      {box.boxKanji}
                    </span>
                  )}
                </div>

                {/* Center Graphic: Wooden Chest vs Transformed Real Object */}
                <div className="my-auto flex flex-col items-center justify-center">
                  {isUnlocked ? (
                    <div className="animate-in zoom-in-75 duration-300 flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl drop-shadow-md group-hover:scale-110 transition-transform">
                        {box.itemEmoji}
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center group-hover:-translate-y-0.5 transition-transform">
                      {/* Wooden Chest Graphic */}
                      <div className="w-12 h-10 rounded-lg bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-500/80 flex items-center justify-center shadow-md relative">
                        <div className="w-full h-1 bg-amber-400/50 absolute top-3" />
                        <Lock className="w-4 h-4 text-amber-300 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-black text-amber-200 mt-1 uppercase tracking-wider">
                        Misteri
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Label: Kanji with Furigana vs Location Clue */}
                <div className="w-full">
                  {isUnlocked ? (
                    <div className="truncate">
                      <ruby className="text-xs font-black text-white">
                        {box.itemKanji}
                        <rt className="text-[8px] text-emerald-400">{box.itemFurigana}</rt>
                      </ruby>
                      <div className="text-[9px] text-stone-400 truncate">
                        {box.itemIndonesian}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-stone-400 font-medium truncate">
                      {box.locationLabel}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* FLOATING ACTION BUTTON FOR JAPANESE EMOTE WHEEL */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsEmoteDrawerOpen(!isEmoteDrawerOpen)}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl shadow-red-950/60 border border-white/20 flex items-center justify-center active:scale-95 hover:scale-105 transition-all"
          title="Kirim Reaksi Emote Bahasa Jepang"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Emote Drawer Popover */}
        {isEmoteDrawerOpen && (
          <div className="absolute bottom-16 right-0 w-56 bg-[#161324] border border-white/15 rounded-2xl p-2.5 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <div className="text-[10px] font-bold text-stone-400 px-2 py-0.5 uppercase tracking-wider">
              Kirim Emote Reaksi:
            </div>
            {JAPANESE_EMOTES.map((em, idx) => (
              <button
                key={idx}
                onClick={() => handleTriggerEmote(em)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-left flex items-center justify-between transition-all"
              >
                <span className="text-xs font-black text-white">{em.kanji}</span>
                <span className="text-[10px] font-mono text-stone-400">{em.romaji}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3-STEP CHALLENGE MODAL */}
      {activeBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          
          <div className="w-full max-w-lg bg-[#14121f] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-xs font-black border border-amber-500/30">
                  Kotak #{activeBox.id}
                </span>
                <span className="text-xs font-bold text-stone-300">
                  {activeBox.locationLabel}
                </span>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators [1. Benda] -> [2. Konjugasi] -> [3. Susun Kalimat] */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-5">
              
              {/* Step 1 */}
              <button
                disabled={modalStage === 1}
                onClick={() => setModalStage(1)}
                className={`py-2 px-1.5 rounded-xl text-center border text-[11px] font-bold transition-all flex flex-col items-center ${
                  modalStage === 1
                    ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-950/50'
                    : stage1IsCorrect || unlockedBoxIds.includes(activeBox.id)
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-stone-400 border-white/5'
                }`}
              >
                <span className="text-[10px] opacity-75">Tahap 1</span>
                <span className="truncate">📦 Tebak Benda</span>
              </button>

              {/* Step 2 */}
              <button
                disabled={!stage1IsCorrect && !unlockedBoxIds.includes(activeBox.id)}
                onClick={() => setModalStage(2)}
                className={`py-2 px-1.5 rounded-xl text-center border text-[11px] font-bold transition-all flex flex-col items-center ${
                  modalStage === 2
                    ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-950/50'
                    : stage2IsCorrect || unlockedBoxIds.includes(activeBox.id)
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-stone-400 border-white/5 disabled:opacity-40'
                }`}
              >
                <span className="text-[10px] opacity-75">Tahap 2</span>
                <span className="truncate">⚙️ Konjugasi</span>
              </button>

              {/* Step 3 */}
              <button
                disabled={(!stage2IsCorrect && !unlockedBoxIds.includes(activeBox.id))}
                onClick={() => setModalStage(3)}
                className={`py-2 px-1.5 rounded-xl text-center border text-[11px] font-bold transition-all flex flex-col items-center ${
                  modalStage === 3
                    ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-950/50'
                    : stage3Success || unlockedBoxIds.includes(activeBox.id)
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-stone-400 border-white/5 disabled:opacity-40'
                }`}
              >
                <span className="text-[10px] opacity-75">Tahap 3</span>
                <span className="truncate">🧩 Susun Kalimat</span>
              </button>

            </div>

            {/* STAGE 1: TEBAK BENDA */}
            {modalStage === 1 && (
              <div className="space-y-4">
                
                {/* Clue Prompt */}
                <div className="bg-[#1b1828] border border-white/10 rounded-2xl p-4 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    {stage1IsCorrect ? activeBox.itemEmoji : '❓'}
                  </div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Teka-Teki Benda:
                  </div>
                  <p className="text-sm font-medium text-stone-200">
                    &ldquo;{activeBox.stage1.clue}&rdquo;
                  </p>
                </div>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-2 gap-2.5">
                  {activeBox.stage1.options.map((opt, idx) => {
                    const isSelected = stage1SelectedIdx === idx;
                    let btnStyle = 'bg-[#1a1727] border-white/10 text-white hover:border-white/20';

                    if (isSelected) {
                      if (opt.isCorrect) {
                        btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
                      } else {
                        btnStyle = 'bg-red-950/50 border-red-500 text-red-200 ring-2 ring-red-500/40';
                      }
                    } else if (stage1IsCorrect && opt.isCorrect) {
                      btnStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleStage1Answer(idx)}
                        disabled={stage1IsCorrect === true}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center active:scale-95 ${btnStyle}`}
                      >
                        <span className="text-sm font-black tracking-wide">{opt.text}</span>
                        <span className="text-[10px] font-mono text-stone-400">{opt.sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Next Button */}
                {stage1IsCorrect === true && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs font-black text-emerald-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>正解！ (Benar!) Kotak bertransformasi jadi {activeBox.itemEmoji} {activeBox.itemKanji}!</span>
                    </div>
                    <div className="text-[11px] text-stone-300">
                      {activeBox.stage1.explanation}
                    </div>
                    <button
                      onClick={() => {
                        sfx.playTap();
                        setModalStage(2);
                      }}
                      className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-lg shadow-red-950/50 flex items-center justify-center space-x-1.5 hover:from-red-500"
                    >
                      <span>Lanjut Tahap 2: Mesin Konjugasi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {stage1IsCorrect === false && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-center">
                    Kurang tepat. Baca kembali deskripsi penggunaan benda di atas dan coba lagi!
                  </div>
                )}

              </div>
            )}

            {/* STAGE 2: MESIN KONJUGASI */}
            {modalStage === 2 && (
              <div className="space-y-4">
                
                {/* Engine Header Box */}
                <div className="bg-[#1b1828] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                      <Cog className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Mesin Konjugasi Kata Kerja (動詞)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 font-mono text-stone-300">
                      Target: {activeBox.stage2.targetGrammar}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-lg">
                      動
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <ruby className="text-base font-black text-white">
                          {activeBox.stage2.verbKanji}
                          <rt className="text-[9px] text-red-400">{activeBox.stage2.verbFurigana}</rt>
                        </ruby>
                        <span className="text-xs text-stone-300">({activeBox.stage2.verbMeaning})</span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold mt-0.5">
                        Misi: {activeBox.stage2.missionPrompt}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Conjugation Options */}
                <div className="space-y-2">
                  {activeBox.stage2.options.map((opt, idx) => {
                    const isSelected = stage2SelectedIdx === idx;
                    let cardStyle = 'bg-[#1a1727] border-white/10 text-white hover:border-white/20';

                    if (isSelected) {
                      if (opt.isCorrect) {
                        cardStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40';
                      } else {
                        cardStyle = 'bg-red-950/50 border-red-500 text-red-200 ring-2 ring-red-500/40';
                      }
                    } else if (stage2IsCorrect && opt.isCorrect) {
                      cardStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleStage2Answer(idx)}
                        disabled={stage2IsCorrect === true}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.98] ${cardStyle}`}
                      >
                        <div>
                          <div className="text-sm font-black text-white">{opt.form}</div>
                          <div className="text-[10px] font-mono text-stone-400">{opt.romaji}</div>
                        </div>
                        <div className="text-[11px] text-stone-300 text-right max-w-[180px]">
                          {opt.explanation}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Next Button */}
                {stage2IsCorrect === true && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in fade-in duration-200">
                    <div className="text-xs font-black text-emerald-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Konjugasi Sempurna! Bentuk kata kerja siap dimasukkan ke kalimat.</span>
                    </div>
                    <button
                      onClick={() => {
                        sfx.playTap();
                        setModalStage(3);
                      }}
                      className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-lg shadow-red-950/50 flex items-center justify-center space-x-1.5 hover:from-red-500"
                    >
                      <span>Lanjut Tahap 3: Susun Kalimat Irodori</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {stage2IsCorrect === false && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-center">
                    Bentuk konjugasi belum sesuai dengan misi target. Coba periksa aturan perubahan bentuknya!
                  </div>
                )}

              </div>
            )}

            {/* STAGE 3: SENTENCE BUILDER */}
            {modalStage === 3 && (
              <div className="space-y-4">
                
                {/* Target Indonesian Sentence */}
                <div className="bg-[#1b1828] border border-white/10 rounded-2xl p-4">
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1 flex items-center space-x-1">
                    <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Misi Susun Kalimat Utuh (文作成):</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    &ldquo;{activeBox.stage3.targetIndonesian}&rdquo;
                  </div>
                </div>

                {/* Workspace: Assembled Sentence Tokens */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 mb-1.5 px-1">
                    <span>Kotak Kalimat Anda (Ketuk kartu untuk mengembalikan):</span>
                    {sentenceWorkspace.length > 0 && !stage3Success && (
                      <button
                        onClick={handleResetSentence}
                        className="text-stone-400 hover:text-red-400 flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  <div className="min-h-[64px] bg-[#0c0a13] border-2 border-dashed border-white/20 rounded-2xl p-2.5 flex flex-wrap gap-2 items-center">
                    {sentenceWorkspace.length === 0 ? (
                      <div className="w-full text-center text-xs text-stone-500 italic py-2">
                        Pilih kartu kata di bawah secara berurutan...
                      </div>
                    ) : (
                      sentenceWorkspace.map((tok, idx) => (
                        <button
                          key={idx}
                          disabled={stage3Success}
                          onClick={() => handleRemoveTokenFromWorkspace(tok, idx)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-md border transition-all active:scale-90 flex items-center space-x-1 ${
                            stage3Success
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-red-600 text-white border-red-400 hover:bg-red-700'
                          }`}
                        >
                          <span>{tok}</span>
                          {!stage3Success && <span className="text-[10px] text-red-200">×</span>}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Token Pool: Available Clickable Cards */}
                {!stage3Success && (
                  <div>
                    <div className="text-[11px] font-bold text-stone-400 mb-1.5 px-1">
                      Pilihan Kartu Kata (Ketuk untuk memasukkan):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableTokens.map((tok, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddTokenToWorkspace(tok, idx)}
                          className="px-3.5 py-2 rounded-xl bg-[#201c30] hover:bg-[#28233d] border border-white/15 text-stone-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
                        >
                          {tok}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {stage3Error && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                    {stage3Error}
                  </div>
                )}

                {/* Success Banner & Full Furigana Sentence */}
                {stage3Success && (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-[#0e1d15] border border-emerald-500/50 space-y-3 animate-in fade-in duration-300">
                    <div className="text-xs font-black text-emerald-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>HEBAT! Kalimat berhasil dirangkai dengan tata bahasa baku Irodori!</span>
                    </div>

                    {/* Target Full Japanese Sentence with Ruby Tags */}
                    <div className="bg-black/40 p-3 rounded-xl border border-emerald-500/30 text-center">
                      <div className="text-base sm:text-lg font-black text-white leading-relaxed">
                        {activeBox.stage3.sentenceRuby.map((item, idx) => (
                          <React.Fragment key={idx}>
                            {item.rt ? (
                              <ruby className="mx-0.5">
                                {item.kanji}
                                <rt className="text-[10px] text-emerald-400 font-bold">{item.rt}</rt>
                              </ruby>
                            ) : (
                              <span>{item.kanji}</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-xs text-stone-400 mt-1">
                        {activeBox.stage3.targetIndonesian}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs font-black text-amber-400 flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>+100 Poin Didapatkan!</span>
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center space-x-1.5"
                      >
                        <span>Tutup & Jelajahi Benda Lain</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Check & Verify Button */}
                {!stage3Success && (
                  <button
                    onClick={handleVerifySentence}
                    disabled={sentenceWorkspace.length === 0}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-950/60 disabled:opacity-40 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PERIKSA & SELESAIKAN KALIMAT</span>
                  </button>
                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* VICTORY MODAL (12/12 COMPLETE) */}
      {isVictoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#161324] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black text-4xl mb-4 shadow-xl shadow-amber-500/30">
              <Trophy className="w-10 h-10 fill-current" />
            </div>

            <div className="inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              ✓ Eksplorasi Fasilitas Selesai 100%
            </div>

            <h3 className="text-xl font-black text-white">
              おめでとうございます！
            </h3>
            <p className="text-xs text-stone-300 mt-1">
              Selamat {playerName}! Seluruh 12 benda di fasilitas ruang kelas telah berhasil Anda buka dan kuasai dengan standar can-do Irodori!
            </p>

            <div className="my-5 bg-[#0e0c16] border border-white/10 rounded-2xl p-4 grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-[10px] text-stone-400 font-bold uppercase">Total Skor</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{score} Pts</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400 font-bold uppercase">Benda Terbuka</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">12 / 12</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setIsVictoryModalOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs shadow-lg shadow-red-950/50"
              >
                Lihat Kembali Peta Ruangan
              </button>
              <Link
                href={`/join?pin=${roomId.replace('-', '')}`}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-bold text-xs border border-white/10 block"
              >
                Kembali ke Lobi Kelas
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="px-4 py-3 bg-[#0a0910] border-t border-white/5 text-center text-[10px] text-stone-500">
        Irodori Nihongo Quest • Ruang Kelas Interaktif Siswa LPK • Standard The Japan Foundation
      </footer>

    </div>
  );
}

export default function StudentPlayPage({
  params
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0c14] text-white flex items-center justify-center text-sm font-bold">
          Memuat Arena Fasilitas Kelas...
        </div>
      }
    >
      <PlayPageContent roomId={roomId} />
    </Suspense>
  );
}
