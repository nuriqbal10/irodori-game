'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  Swords, 
  ArrowLeft, 
  Trophy, 
  Zap, 
  Volume2, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Shield, 
  Clock, 
  Users, 
  Bot, 
  Sparkles,
  Coins,
  Undo2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { BattleMode, BattleQuestion } from '@/lib/battle-engine';
import AudioListeningPlayer from '@/components/AudioListeningPlayer';

export default function BattleArenaPage() {
  const { user } = useUser();

  // Match Configuration State
  const [selectedMode, setSelectedMode] = useState<BattleMode>('kotoba');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [opponentType, setOpponentType] = useState<'ai' | 'room'>('ai');
  const [roomCode, setRoomCode] = useState<string>('BATTLE-777');
  
  // Game Flow State: 'lobby' | 'countdown' | 'playing' | 'round_result' | 'match_finished'
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'playing' | 'round_result' | 'match_finished'>('lobby');
  const [countdown, setCountdown] = useState<number>(3);

  // Match Data State
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Combat Stats
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [opponentHp, setOpponentHp] = useState<number>(100);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [combatLog, setCombatLog] = useState<string>('Pertandingan dimulai! Bersiaplah...');

  // Current Round Player Input
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sentenceBuilt, setSentenceBuilt] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [roundWinner, setRoundWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);

  // Web Audio SFX Synthesizer
  const playSound = (type: 'hit' | 'damage' | 'combo' | 'win') => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'hit') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'damage') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.1); // E3
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'combo') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'win') {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    } catch {}
  };

  // START MATCH
  const startMatch = async () => {
    try {
      const res = await fetch(`/api/battle/questions?mode=${selectedMode}&level=${selectedLevel}&count=5`);
      const data = await res.json();
      if (data?.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentRound(0);
        setPlayerHp(100);
        setOpponentHp(100);
        setPlayerScore(0);
        setOpponentScore(0);
        setComboStreak(0);
        setMaxCombo(0);
        setCombatLog('3... 2... 1... BERTARUNG!');
        setGameState('countdown');
        setCountdown(3);
      }
    } catch (e) {
      console.error('Failed to load battle questions:', e);
    }
  };

  // COUNTDOWN EFFECT
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 1) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setGameState('playing');
          initRound(0);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, countdown]);

  // INITIALIZE ROUND
  const initRound = (roundIdx: number) => {
    setCurrentRound(roundIdx);
    setSelectedOption(null);
    setSentenceBuilt([]);
    setIsAnswered(false);
    setRoundWinner(null);
    setTimeLeft(15);
  };

  // ROUND TIMER & AI SIMULATION
  useEffect(() => {
    if (gameState !== 'playing' || isAnswered) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      // Time ran out!
      handleTimeOut();
    }
  }, [gameState, timeLeft, isAnswered]);

  // TIME OUT HANDLER
  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setComboStreak(0);
    setCombatLog('Waktu habis! Anda terkena serangan balik dari lawan!');
    playSound('damage');
    
    // Player takes damage
    setPlayerHp(prev => Math.max(0, prev - 25));
    setRoundWinner('opponent');

    setTimeout(advanceToNextRound, 2500);
  };

  // SUBMIT MULTIPLE CHOICE ANSWER
  const handleSelectOption = (chosen: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(chosen);

    const currentQ = questions[currentRound];
    const isCorrect = chosen === currentQ.answer;

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 10);
      const newCombo = comboStreak + 1;
      setComboStreak(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      const damage = 25 + (newCombo > 1 ? 15 : 0);
      setOpponentHp(prev => Math.max(0, prev - damage));
      setPlayerScore(prev => prev + 100 + timeBonus);

      if (newCombo >= 2) {
        setCombatLog(`⚡ CRITICAL STRIKE! Combo x${newCombo}! -${damage} HP ke Lawan!`);
        playSound('combo');
      } else {
        setCombatLog(`Serangan tepat! -${damage} HP ke Lawan!`);
        playSound('hit');
      }
      setRoundWinner('player');
    } else {
      setComboStreak(0);
      setPlayerHp(prev => Math.max(0, prev - 20));
      setCombatLog(`Jawaban meleset! Anda terkena counter-attack -20 HP!`);
      playSound('damage');
      setRoundWinner('opponent');
    }

    setTimeout(advanceToNextRound, 2500);
  };

  // SENTENCE ORDER BUILDER HANDLER
  const handleToggleWord = (word: string) => {
    if (isAnswered) return;
    if (sentenceBuilt.includes(word)) {
      setSentenceBuilt(prev => prev.filter(w => w !== word));
    } else {
      setSentenceBuilt(prev => [...prev, word]);
    }
  };

  const handleCheckSentence = () => {
    if (isAnswered) return;
    const currentQ = questions[currentRound];
    const builtText = sentenceBuilt.join('');
    const isCorrect = builtText === currentQ.answer;

    handleSelectOption(isCorrect ? currentQ.answer : 'WRONG_SENTENCE');
  };

  // ADVANCE ROUND OR FINISH MATCH
  const advanceToNextRound = async () => {
    const nextRound = currentRound + 1;
    const isOver = nextRound >= questions.length || playerHp <= 0 || opponentHp <= 0;

    if (isOver) {
      setGameState('match_finished');
      const isWinner = playerHp > opponentHp;
      if (isWinner) playSound('win');

      // Record match to Neon DB
      try {
        await fetch('/api/battle/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: selectedMode,
            level: selectedLevel,
            isWinner,
            score: playerScore,
            accuracy: Math.round((playerScore / (questions.length * 150)) * 100),
            coinsEarned: isWinner ? 150 : 50,
            expEarned: isWinner ? 250 : 100,
          }),
        });
      } catch (err) {
        console.error('Error saving battle finish:', err);
      }
    } else {
      initRound(nextRound);
    }
  };

  const currentQ = questions[currentRound];

  // ==========================================
  // VIEW 1: LOBBY & MODE SELECTION
  // ==========================================
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="game-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Lobby Utama</span>
            </Link>

            <div className="flex items-center space-x-2 text-xs font-black text-amber-400 bg-[#1e1b29] px-3.5 py-1.5 rounded-xl border border-white/5">
              <Trophy className="w-4 h-4 fill-current" />
              <span>Battle Arena Season 1</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-black uppercase tracking-wider">
              <Swords className="w-3.5 h-3.5" />
              <span>Mode 1 • Realtime User vs User & AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Battle Arena (対戦アリーナ)
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
              Pilih sub-mode duel bahasa Jepang favorit Anda, tentukan tingkat kesulitan, dan uji ketangkasan refleks Anda!
            </p>
          </div>

          {/* Sub-modes Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400">
              1. Pilih Sub-Mode Pertandingan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Kanji */}
              <button
                onClick={() => setSelectedMode('kanji')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                  selectedMode === 'kanji'
                    ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/50'
                    : 'bg-[#181622] border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-2xl font-black text-red-400 mb-1">漢</div>
                  <div className="text-sm font-black text-white">Kanji Speed Duel</div>
                  <div className="text-xs text-stone-400 mt-1">
                    Adu cepat membaca kanji & arti dari 659 huruf Irodori.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-red-400 uppercase">
                  {selectedMode === 'kanji' ? '✓ Terpilih' : 'Pilih'}
                </div>
              </button>

              {/* Kotoba */}
              <button
                onClick={() => setSelectedMode('kotoba')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                  selectedMode === 'kotoba'
                    ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50'
                    : 'bg-[#181622] border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-2xl font-black text-amber-400 mb-1">語</div>
                  <div className="text-sm font-black text-white">Kotoba Combo Blitz</div>
                  <div className="text-xs text-stone-400 mt-1">
                    Streak kombo kosakata Jepang ↔ Indonesia berhadiah damage kritis!
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-amber-400 uppercase">
                  {selectedMode === 'kotoba' ? '✓ Terpilih' : 'Pilih'}
                </div>
              </button>

              {/* Tebak Gambar */}
              <button
                onClick={() => setSelectedMode('image')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                  selectedMode === 'image'
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                    : 'bg-[#181622] border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-2xl font-black text-cyan-400 mb-1">図</div>
                  <div className="text-sm font-black text-white">Tebak Gambar Irodori</div>
                  <div className="text-xs text-stone-400 mt-1">
                    Tebak objek situasi dari 1,227 ilustrasi resmi per bab.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-cyan-400 uppercase">
                  {selectedMode === 'image' ? '✓ Terpilih' : 'Pilih'}
                </div>
              </button>

              {/* Susun Kalimat */}
              <button
                onClick={() => setSelectedMode('sentence')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                  selectedMode === 'sentence'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-[#181622] border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-2xl font-black text-emerald-400 mb-1">文</div>
                  <div className="text-sm font-black text-white">Susun Kalimat Tata Bahasa</div>
                  <div className="text-xs text-stone-400 mt-1">
                    Rakit balok-balok kata menjadi pola kalimat Irodori yang utuh.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-emerald-400 uppercase">
                  {selectedMode === 'sentence' ? '✓ Terpilih' : 'Pilih'}
                </div>
              </button>

              {/* Chōkai Audio Reflex */}
              <button
                onClick={() => setSelectedMode('choukai')}
                className={`p-4 rounded-2xl text-left transition-all flex flex-col justify-between border ${
                  selectedMode === 'choukai'
                    ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50'
                    : 'bg-[#181622] border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-2xl font-black text-purple-400 mb-1">聴</div>
                  <div className="text-sm font-black text-white">Chōkai Audio Reflex</div>
                  <div className="text-xs text-stone-400 mt-1">
                    Dengarkan audio dialog native dan tangkap maksud pembicara!
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-purple-400 uppercase">
                  {selectedMode === 'choukai' ? '✓ Terpilih' : 'Pilih'}
                </div>
              </button>
            </div>
          </div>

          {/* Settings: Level & Opponent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level Difficulty */}
            <div className="game-card p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                2. Tingkat Level Soal
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'Acak / Semua' },
                  { id: 'a1', label: 'A1 (入門)' },
                  { id: 'a2-1', label: 'A2.1 (初級1)' },
                  { id: 'a2-2', label: 'A2.2 (初級2)' },
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                      selectedLevel === lvl.id
                        ? 'bg-red-600 text-white border-red-400 shadow-md'
                        : 'bg-[#121019] text-stone-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opponent Selection */}
            <div className="game-card p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                3. Lawan Tanding
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOpponentType('ai')}
                  className={`p-3 rounded-xl text-left border flex items-center space-x-2.5 transition-all ${
                    opponentType === 'ai'
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'bg-[#121019] border-white/5 text-stone-400'
                  }`}
                >
                  <Bot className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-xs font-black">AI Sensei</div>
                    <div className="text-[10px] text-stone-400">Instan tanpa antre</div>
                  </div>
                </button>

                <button
                  onClick={() => setOpponentType('room')}
                  className={`p-3 rounded-xl text-left border flex items-center space-x-2.5 transition-all ${
                    opponentType === 'room'
                      ? 'bg-amber-600/20 border-amber-500 text-white'
                      : 'bg-[#121019] border-white/5 text-stone-400'
                  }`}
                >
                  <Users className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-black">PvP Room Code</div>
                    <div className="text-[10px] text-stone-400">Main bareng teman</div>
                  </div>
                </button>
              </div>

              {opponentType === 'room' && (
                <div className="pt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Kode Room (Contoh: IRO-101)"
                    className="flex-1 px-3 py-2 bg-[#121019] border border-white/10 rounded-xl text-xs font-mono font-bold text-amber-300"
                  />
                  <span className="text-[10px] text-stone-400">Siap bergabung!</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              onClick={startMatch}
              className="game-btn-primary w-full py-4 text-sm sm:text-base font-black flex items-center justify-center space-x-3 tracking-wider"
            >
              <Swords className="w-5 h-5" />
              <span>MASUK KE ARENA BERTARUNG SEKARANG</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: COUNTDOWN ANIMATION
  // ==========================================
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-[#0f0e13] flex flex-col items-center justify-center text-center p-4">
        <div className="w-24 h-24 rounded-3xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-6 animate-pulse">
          <Swords className="w-12 h-12 text-red-400" />
        </div>
        <div className="text-7xl font-black text-white text-glow-crimson animate-bounce mb-2">
          {countdown}
        </div>
        <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
          {combatLog}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: MATCH FINISHED (RESULT)
  // ==========================================
  if (gameState === 'match_finished') {
    const isWinner = playerHp > opponentHp;
    return (
      <div className="min-h-screen bg-[#0f0e13] flex items-center justify-center p-4">
        <div className="max-w-md w-full game-card p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${
            isWinner ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className={`text-3xl font-black ${isWinner ? 'text-amber-400 text-glow-gold' : 'text-red-400 text-glow-crimson'}`}>
              {isWinner ? 'KEMENANGAN TELAK! (勝利)' : 'PERTARUNGAN SELESAI'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {isWinner ? 'Luar biasa! Refleks bahasa Jepang Anda sangat tajam!' : 'Tetap semangat! Asah kembali kecepatan kosakata Anda.'}
            </p>
          </div>

          {/* Stats Wells */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="game-inset p-3">
              <div className="text-[10px] text-stone-400 font-bold uppercase">Total Skor</div>
              <div className="text-lg font-black text-white">{playerScore.toLocaleString()}</div>
            </div>
            <div className="game-inset p-3">
              <div className="text-[10px] text-stone-400 font-bold uppercase">Combo Tertinggi</div>
              <div className="text-lg font-black text-amber-400">x{maxCombo} Streak</div>
            </div>
            <div className="game-inset p-3">
              <div className="text-[10px] text-stone-400 font-bold uppercase">Sisa HP Anda</div>
              <div className="text-lg font-black text-emerald-400">{playerHp} / 100</div>
            </div>
            <div className="game-inset p-3">
              <div className="text-[10px] text-stone-400 font-bold uppercase">Sisa HP Lawan</div>
              <div className="text-lg font-black text-red-400">{opponentHp} / 100</div>
            </div>
          </div>

          {/* Rewards */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/30 flex items-center justify-around">
            <div className="flex items-center space-x-2 text-amber-300 font-black text-sm">
              <Coins className="w-5 h-5 fill-current" />
              <span>+{isWinner ? '150' : '50'} Yen</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center space-x-2 text-purple-300 font-black text-sm">
              <Sparkles className="w-5 h-5" />
              <span>+{isWinner ? '250' : '100'} EXP</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={startMatch}
              className="game-btn-primary py-3 text-xs font-black flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tanding Ulang (Rematch)</span>
            </button>
            <button
              onClick={() => setGameState('lobby')}
              className="game-btn-secondary py-2.5 text-xs font-bold"
            >
              Pilih Sub-Mode Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: LIVE BATTLE ARENA (PLAYING)
  // ==========================================
  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] py-6 px-4 sm:px-8 flex flex-col justify-between max-w-4xl mx-auto space-y-6">
      {/* TOP COMBAT HUD */}
      <div className="space-y-4">
        {/* Players HP & Stats Bar */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player (Left) */}
          <div className="game-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-xs font-black">
                  🥋
                </div>
                <div>
                  <div className="text-xs font-black text-white">{user?.fullName || 'Pemain'}</div>
                  <div className="text-[10px] text-stone-400 font-bold">{playerScore} PTS</div>
                </div>
              </div>

              {comboStreak > 1 && (
                <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black flex items-center space-x-1 animate-bounce">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>x{comboStreak} COMBO</span>
                </div>
              )}
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-stone-400">HP</span>
                <span className="text-emerald-400 font-extrabold">{playerHp} / 100</span>
              </div>
              <div className="w-full h-3 bg-[#121019] rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Opponent (Right) */}
          <div className="game-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-stone-400 font-bold">{opponentScore} PTS</div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-xs font-black text-red-400">
                    {opponentType === 'ai' ? 'AI Sensei' : 'Lawan PvP'}
                  </div>
                  <div className="text-[10px] text-stone-500">BOT Lv. 5</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500 flex items-center justify-center text-xs font-black">
                  👺
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-red-400 font-extrabold">{opponentHp} / 100</span>
                <span className="text-stone-400">HP</span>
              </div>
              <div className="w-full h-3 bg-[#121019] rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-pink-500 rounded-full transition-all duration-300 ml-auto"
                  style={{ width: `${opponentHp}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Round Counter & Combat Notification */}
        <div className="flex items-center justify-between text-xs px-2">
          <div className="font-bold text-stone-400">
            Ronde <strong className="text-white">{currentRound + 1}</strong> dari {questions.length}
          </div>
          
          <div className={`font-black text-xs px-3 py-1 rounded-full ${
            timeLeft <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'text-stone-300'
          } flex items-center space-x-1.5`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>

          <div className="text-[11px] font-extrabold text-stone-400 truncate max-w-[200px]">
            {combatLog}
          </div>
        </div>
      </div>

      {/* QUESTION ARENA CARD */}
      <div className="game-card p-6 sm:p-8 space-y-6 my-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-stone-400 border border-white/10">
            {currentQ.mode.toUpperCase()} DUEL
          </span>
          <h3 className="text-sm sm:text-base font-bold text-stone-300">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Display Centerpiece depending on mode */}
        {currentQ.mode === 'image' && currentQ.imageSrc ? (
          <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <img
              src={currentQ.imageSrc}
              alt="Tebak Gambar"
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : currentQ.mode === 'choukai' && currentQ.audioSrc ? (
          <div className="py-2">
            <AudioListeningPlayer
              src={currentQ.audioSrc}
              label={currentQ.audioLabel}
              transcript={currentQ.explanation}
              maxPlays={3}
            />
          </div>
        ) : (
          <div className="game-inset p-6 sm:p-8 rounded-3xl text-center space-y-2 max-w-lg mx-auto">
            <div className="text-4xl sm:text-5xl font-black text-white tracking-wider">
              {currentQ.targetDisplay}
            </div>
            {currentQ.reading && (
              <div className="text-sm font-bold text-red-400">
                ({currentQ.reading})
              </div>
            )}
            {currentQ.context && (
              <div className="text-xs text-stone-400 italic">
                {currentQ.context}
              </div>
            )}
          </div>
        )}

        {/* ANSWER AREA */}
        {currentQ.mode === 'sentence' && currentQ.scrambledWords ? (
          /* Sentence Builder Mode */
          <div className="space-y-4">
            {/* Built Sentence Slot */}
            <div className="p-4 rounded-2xl bg-[#121019] border border-white/10 min-h-14 flex flex-wrap items-center justify-center gap-2">
              {sentenceBuilt.length === 0 ? (
                <span className="text-xs text-stone-600 font-medium italic">
                  Klik balok kata di bawah untuk merangkai kalimat...
                </span>
              ) : (
                sentenceBuilt.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => handleToggleWord(w)}
                    className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-red-700"
                  >
                    {w}
                  </button>
                ))
              )}
            </div>

            {/* Word Chunks Selection */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {currentQ.scrambledWords.map((word, idx) => {
                const isSelected = sentenceBuilt.includes(word);
                return (
                  <button
                    key={idx}
                    disabled={isAnswered || isSelected}
                    onClick={() => handleToggleWord(word)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'opacity-30 bg-stone-900 border-transparent text-stone-600'
                        : 'bg-[#201d2c] border-white/10 text-stone-200 hover:border-red-500 hover:text-white'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {/* Actions for Sentence */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={isAnswered || sentenceBuilt.length === 0}
                onClick={() => setSentenceBuilt([])}
                className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 flex items-center space-x-1"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                disabled={isAnswered || sentenceBuilt.length === 0}
                onClick={handleCheckSentence}
                className="game-btn-primary px-6 py-2.5 text-xs font-black"
              >
                Serang Lawan! ⚔️
              </button>
            </div>
          </div>
        ) : (
          /* Multiple Choice Options (Kanji, Kotoba, Image, Choukai) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, i) => {
              const isCorrect = opt === currentQ.answer;
              const isChosen = opt === selectedOption;

              let btnClass = 'bg-[#201d2c] border-white/10 text-stone-200 hover:border-red-500 hover:bg-[#282436]';
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-black';
                } else if (isChosen && !isCorrect) {
                  btnClass = 'bg-red-950/60 border-red-500 text-red-300 font-black';
                } else {
                  btnClass = 'opacity-30 bg-stone-900 border-transparent text-stone-600';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all border flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                  {isAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        )}

        {/* EXPLANATION BOX ON SUBMIT */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-[#121019] border border-white/10 text-xs text-stone-400 animate-in fade-in">
            <span className="font-black text-amber-400 mr-2">Penjelasan:</span>
            <span>{currentQ.explanation}</span>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
        <span>Battle Arena Mode: <strong>{selectedMode.toUpperCase()}</strong></span>
        <span>Target: <strong>Level {selectedLevel.toUpperCase()}</strong></span>
      </div>
    </div>
  );
}
