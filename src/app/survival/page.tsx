'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Heart, 
  Zap, 
  Users, 
  Clock, 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  XCircle,
  Flame,
  Volume2,
  Undo2
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { BattleQuestion } from '@/lib/battle-engine';
import AudioListeningPlayer from '@/components/AudioListeningPlayer';

interface LeaderboardItem {
  id: string;
  mode: string;
  waveReached: number;
  score: number;
  accuracyPercent: number;
  userName: string | null;
}

export default function SurvivalPage() {
  const { user } = useUser();

  // Mode: 'solo' | 'team'
  const [survivalMode, setSurvivalMode] = useState<'solo' | 'team'>('solo');
  // State: 'lobby' | 'playing' | 'game_over'
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'game_over'>('lobby');

  // Survival Stats
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [currentLives, setCurrentLives] = useState<number>(3); // Solo Mode
  const [teamHp, setTeamHp] = useState<number>(100); // Team Co-Op Mode
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);

  // Current Wave Questions
  const [waveQuestions, setWaveQuestions] = useState<BattleQuestion[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sentenceBuilt, setSentenceBuilt] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Global Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  // Sound Synthesizer
  const playSound = (type: 'hit' | 'damage' | 'combo' | 'gameover') => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'hit') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'damage') {
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'combo') {
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'gameover') {
        osc.frequency.setValueAtTime(261.63, audioCtx.currentTime);
        osc.frequency.setValueAtTime(196.00, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(130.81, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch {}
  };

  // Fetch Leaderboard on Lobby
  useEffect(() => {
    fetch('/api/survival/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data?.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch(e => console.error('Error fetching leaderboard:', e));
  }, [gameState]);

  // Start Survival Session
  const startSurvival = async (mode: 'solo' | 'team') => {
    setSurvivalMode(mode);
    setCurrentWave(1);
    setCurrentLives(3);
    setTeamHp(100);
    setScore(0);
    setCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    await loadWave(1);
    setGameState('playing');
  };

  // Load Questions for Wave
  const loadWave = async (wave: number) => {
    try {
      const res = await fetch(`/api/survival/questions?wave=${wave}&count=5`);
      const data = await res.json();
      if (data?.questions && data.questions.length > 0) {
        setWaveQuestions(data.questions);
        setQIndex(0);
        setIsAnswered(false);
        setSelectedOption(null);
        setSentenceBuilt([]);
        setTimeLeft(Math.max(8, 14 - Math.floor(wave / 2)));
      }
    } catch (e) {
      console.error('Failed to load survival wave:', e);
    }
  };

  // Timer Tick
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
      handleTimeOut();
    }
  }, [gameState, timeLeft, isAnswered]);

  // Timeout Handler
  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setCombo(0);
    setWrongCount(w => w + 1);
    playSound('damage');

    if (survivalMode === 'solo') {
      const remainingLives = currentLives - 1;
      setCurrentLives(remainingLives);
      if (remainingLives <= 0) {
        setTimeout(handleGameOver, 1500);
        return;
      }
    } else {
      const remainingHp = Math.max(0, teamHp - 25);
      setTeamHp(remainingHp);
      if (remainingHp <= 0) {
        setTimeout(handleGameOver, 1500);
        return;
      }
    }

    setTimeout(advanceQuestion, 1800);
  };

  // Submit Answer
  const handleSelectOption = (chosen: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(chosen);

    const currentQ = waveQuestions[qIndex];
    const isCorrect = chosen === currentQ.answer;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setCorrectCount(c => c + 1);
      const points = 100 + timeLeft * 10 + (newCombo > 1 ? newCombo * 20 : 0);
      setScore(s => s + points);

      if (survivalMode === 'team') {
        setTeamHp(prev => Math.min(100, prev + 10)); // Heal team
      }

      if (newCombo >= 3) {
        playSound('combo');
      } else {
        playSound('hit');
      }
    } else {
      setCombo(0);
      setWrongCount(w => w + 1);
      playSound('damage');

      if (survivalMode === 'solo') {
        const remaining = currentLives - 1;
        setCurrentLives(remaining);
        if (remaining <= 0) {
          setTimeout(handleGameOver, 1800);
          return;
        }
      } else {
        const remaining = Math.max(0, teamHp - 25);
        setTeamHp(remaining);
        if (remaining <= 0) {
          setTimeout(handleGameOver, 1800);
          return;
        }
      }
    }

    setTimeout(advanceQuestion, 1800);
  };

  // Advance Question or Wave
  const advanceQuestion = () => {
    if (qIndex + 1 < waveQuestions.length) {
      setQIndex(q => q + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setSentenceBuilt([]);
      setTimeLeft(Math.max(8, 14 - Math.floor(currentWave / 2)));
    } else {
      // Wave Completed! Next Wave!
      const nextWave = currentWave + 1;
      setCurrentWave(nextWave);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      loadWave(nextWave);
    }
  };

  // Game Over Handler
  const handleGameOver = async () => {
    setGameState('game_over');
    playSound('gameover');

    const total = correctCount + wrongCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    try {
      const res = await fetch('/api/survival/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: survivalMode,
          waveReached: currentWave,
          score,
          accuracyPercent: accuracy,
          correctCount,
          wrongCount,
          teammates: survivalMode === 'team' ? ['Riku', 'Aoi'] : [],
        }),
      });
      const data = await res.json();
      if (data?.leaderboard) setLeaderboard(data.leaderboard);
    } catch (e) {
      console.error('Error submitting survival score:', e);
    }
  };

  const currentQ = waveQuestions[qIndex];

  // ==========================================
  // VIEW 1: SURVIVAL LOBBY & MODE SELECTION
  // ==========================================
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="game-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Lobby Utama</span>
            </Link>

            <div className="flex items-center space-x-2 text-xs font-black text-emerald-400 bg-[#1e1b29] px-3.5 py-1.5 rounded-xl border border-white/5">
              <ShieldAlert className="w-4 h-4 fill-current" />
              <span>Survival Endless Mode</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Mode 3 • Komprehensif Materi A1 - A2.2</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Tantangan Survival (サバイバル)
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
              Hadapi gelombang soal tanpa batas yang menguji seluruh materi bahasa Jepang dari tingkat dasar hingga mahir.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Solo Mode */}
            <div className="game-card p-6 flex flex-col justify-between space-y-4 border-emerald-500/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥋</span>
                  <div className="flex items-center space-x-1 text-red-500">
                    <Heart className="w-4 h-4 fill-current" />
                    <Heart className="w-4 h-4 fill-current" />
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white">Solo Survival</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Bermain mandiri dengan 3 nyawa. Setiap jawaban salah atau waktu habis akan mengurangi 1 hati. Raih gelombang tertinggi di papan peringkat global!
                </p>
              </div>

              <button
                onClick={() => startSurvival('solo')}
                className="game-btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2"
              >
                <span>Mulai Solo Survival (3 Nyawa)</span>
                <Zap className="w-4 h-4" />
              </button>
            </div>

            {/* Team Co-Op Mode */}
            <div className="game-card p-6 flex flex-col justify-between space-y-4 border-cyan-500/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🛡️</span>
                  <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black">
                    CO-OP TEAM
                  </div>
                </div>
                <h3 className="text-xl font-black text-white">Team Co-Op (Regu)</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Bekerjasama dalam regu 2-4 pemain dengan Bar HP tim bersama (100 HP). Jawaban tepat meregenerasi HP tim, jawaban salah memberi damage.
                </p>
              </div>

              <button
                onClick={() => startSurvival('team')}
                className="game-btn-gold w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2"
              >
                <span>Mulai Team Co-Op (Shared HP)</span>
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Global Leaderboard Section */}
          <div className="game-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-sm font-black text-white">
                <Trophy className="w-4 h-4 text-amber-400 fill-current" />
                <span>Papan Peringkat Survival Global</span>
              </div>
              <span className="text-xs text-stone-500">Top 10 Rekor Tertinggi</span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500">
                Belum ada rekor survival. Jadilah yang pertama mencapai Wave tertinggi!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-stone-500">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Pemain</th>
                      <th className="py-2 px-3">Mode</th>
                      <th className="py-2 px-3">Wave</th>
                      <th className="py-2 px-3">Akurasi</th>
                      <th className="py-2 px-3 text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-3 font-bold text-amber-400">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {item.userName || 'Pemain Anonim'}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-stone-400 font-bold">
                          {item.mode}
                        </td>
                        <td className="py-2.5 px-3 text-stone-300 font-bold">
                          Wave {item.waveReached}
                        </td>
                        <td className="py-2.5 px-3 text-stone-400">
                          {item.accuracyPercent}%
                        </td>
                        <td className="py-2.5 px-3 font-black text-right text-amber-300">
                          {item.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: GAME OVER SCREEN
  // ==========================================
  if (gameState === 'game_over') {
    return (
      <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] py-12 px-4 flex items-center justify-center">
        <div className="game-card p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto text-3xl animate-bounce">
            💀
          </div>

          <div>
            <h2 className="text-3xl font-black text-red-400">SURVIVAL SELESAI</h2>
            <p className="text-xs text-stone-400 mt-1">
              Ketahanan Anda terhenti di <strong className="text-white">Wave {currentWave}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="game-inset p-3">
              <div className="text-[10px] text-stone-500 uppercase font-bold">Total Skor</div>
              <div className="text-xl font-black text-amber-400">{score.toLocaleString()}</div>
            </div>
            <div className="game-inset p-3">
              <div className="text-[10px] text-stone-500 uppercase font-bold">Akurasi Soal</div>
              <div className="text-xl font-black text-emerald-400">
                {correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1c1929] border border-white/5 flex items-center justify-around">
            <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-bold">
              <Coins className="w-4 h-4 fill-current" />
              <span>+{Math.floor(score / 10)} Yen</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center space-x-1.5 text-purple-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>+{Math.floor(score / 5)} EXP</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => startSurvival(survivalMode)}
              className="game-btn-primary w-full py-3 text-xs font-black flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi (Retry)</span>
            </button>
            <button
              onClick={() => setGameState('lobby')}
              className="game-btn-secondary w-full py-2.5 text-xs font-bold"
            >
              Kembali ke Menu Survival
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ACTIVE SURVIVAL COMBAT HUD
  // ==========================================
  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] py-6 px-4 sm:px-8 flex flex-col justify-between max-w-4xl mx-auto space-y-6">
      {/* Top HUD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>WAVE {currentWave}</span>
            </div>

            {combo > 1 && (
              <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black flex items-center space-x-1 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>x{combo} COMBO!</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs font-black text-amber-400">{score.toLocaleString()} PTS</div>
            <div className="text-[10px] text-stone-500 font-bold">
              Soal {qIndex + 1} / {waveQuestions.length}
            </div>
          </div>
        </div>

        {/* Health / Lives Bar */}
        <div className="flex items-center justify-between px-1">
          {survivalMode === 'solo' ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-stone-400 mr-1">Nyawa:</span>
              {[1, 2, 3].map(heartIdx => (
                <Heart
                  key={heartIdx}
                  className={`w-5 h-5 ${
                    heartIdx <= currentLives ? 'text-red-500 fill-red-500 drop-shadow-md' : 'text-stone-700'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-cyan-400">Team Shared HP</span>
                <span className="text-white">{teamHp} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-[#14121b] rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${teamHp}%` }}
                />
              </div>
            </div>
          )}

          <div className={`px-3 py-1 rounded-xl font-black text-xs flex items-center space-x-1 ${
            timeLeft <= 4 ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'text-stone-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="game-card p-6 sm:p-8 space-y-6 my-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-stone-400 border border-white/10">
            {currentQ.mode.toUpperCase()}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-stone-300">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Centerpiece */}
        {currentQ.mode === 'choukai' && currentQ.audioSrc ? (
          <AudioListeningPlayer
            src={currentQ.audioSrc}
            label={currentQ.audioLabel}
            transcript={currentQ.explanation}
            maxPlays={3}
          />
        ) : (
          <div className="game-inset p-6 sm:p-8 rounded-3xl text-center space-y-2 max-w-lg mx-auto">
            <div className="text-3xl sm:text-4xl font-black text-white">
              {currentQ.targetDisplay}
            </div>
            {currentQ.reading && (
              <div className="text-sm font-bold text-red-400">
                ({currentQ.reading})
              </div>
            )}
            {currentQ.context && (
              <div className="text-xs text-stone-500 italic">
                {currentQ.context}
              </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((opt, i) => {
            const isCorrect = opt === currentQ.answer;
            const isChosen = opt === selectedOption;

            let btnClass = 'bg-[#201d2c] border-white/10 text-stone-200 hover:border-emerald-500 hover:bg-[#282436]';
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

        {/* Explanation */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-[#121019] border border-white/10 text-xs text-stone-400 animate-in fade-in">
            <span className="font-black text-amber-400 mr-2">Penjelasan:</span>
            <span>{currentQ.explanation}</span>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-stone-500">
        Survival Komprehensif • Materi A1, A2.1, A2.2 Irodori Japan Foundation
      </div>
    </div>
  );
}
