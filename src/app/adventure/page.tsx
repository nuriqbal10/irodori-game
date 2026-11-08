'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  Map, 
  ArrowLeft, 
  Star, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  ArrowRight, 
  Trophy, 
  Coins, 
  HelpCircle,
  MessageSquare,
  Award
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getWorldStages, getStageData, AdventureStage } from '@/lib/adventure-engine';
import DialogueBox from '@/components/DialogueBox';
import AudioListeningPlayer from '@/components/AudioListeningPlayer';

export default function AdventurePage() {
  const { user } = useUser();

  // World Tab: 'a1' | 'a2-1' | 'a2-2'
  const [selectedWorld, setSelectedWorld] = useState<'a1' | 'a2-1' | 'a2-2'>('a1');
  const [stagesList, setStagesList] = useState(getWorldStages('a1'));

  // User Progression State: map of stageId -> { isUnlocked, isCompleted, stars }
  const [progressMap, setProgressMap] = useState<Record<string, { isUnlocked: boolean; isCompleted: boolean; stars: number }>>({
    'a1-1': { isUnlocked: true, isCompleted: false, stars: 0 },
  });

  // Active Stage Journey State
  const [activeStage, setActiveStage] = useState<AdventureStage | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Explore, 2: Learn, 3: Practice, 4: Dialogue, 5: Review
  
  // Step 3 Practice State
  const [practiceIdx, setPracticeIdx] = useState<number>(0);
  const [selectedPracticeOpt, setSelectedPracticeOpt] = useState<string | null>(null);
  const [practiceScore, setPracticeScore] = useState<number>(0);

  // Step 4 Dialogue State
  const [dialogueDone, setDialogueDone] = useState<boolean>(false);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [npcReply, setNpcReply] = useState<string | null>(null);

  // Fetch Progress when World or User Changes
  useEffect(() => {
    setStagesList(getWorldStages(selectedWorld));
    fetch(`/api/adventure/progress?level=${selectedWorld}`)
      .then(res => res.json())
      .then(data => {
        if (data?.progress) {
          const map: Record<string, { isUnlocked: boolean; isCompleted: boolean; stars: number }> = {};
          data.progress.forEach((p: any) => {
            map[`${p.level}-${p.lessonNum}`] = {
              isUnlocked: p.isUnlocked ?? true,
              isCompleted: p.isCompleted ?? false,
              stars: p.stars ?? 0,
            };
          });
          // Ensure first stage is unlocked
          if (!map[`${selectedWorld}-1`]) {
            map[`${selectedWorld}-1`] = { isUnlocked: true, isCompleted: false, stars: 0 };
          }
          setProgressMap(map);
        }
      })
      .catch(err => console.error('Failed to load progress:', err));
  }, [selectedWorld, user]);

  // Open Stage Journey
  const handleOpenStage = (lesson: number) => {
    const stageData = getStageData(selectedWorld, lesson);
    setActiveStage(stageData);
    setCurrentStep(1);
    setPracticeIdx(0);
    setSelectedPracticeOpt(null);
    setPracticeScore(0);
    setDialogueDone(false);
    setSelectedChoiceIdx(null);
    setNpcReply(null);
  };

  // Close Stage Journey
  const handleCloseStage = () => {
    setActiveStage(null);
    setCurrentStep(1);
  };

  // Answer Practice Question
  const handleAnswerPractice = (opt: string) => {
    if (selectedPracticeOpt !== null || !activeStage) return;
    setSelectedPracticeOpt(opt);
    const q = activeStage.practiceQuestions[practiceIdx];
    if (opt === q.answer) {
      setPracticeScore(s => s + 1);
    }
  };

  // Next Practice Question
  const handleNextPractice = () => {
    if (!activeStage) return;
    if (practiceIdx + 1 < activeStage.practiceQuestions.length) {
      setPracticeIdx(i => i + 1);
      setSelectedPracticeOpt(null);
    } else {
      // Advance to Step 4 (Dialogue)
      setCurrentStep(4);
    }
  };

  // Handle Dialogue Choice
  const handleSelectChoice = (choiceIdx: number) => {
    if (!activeStage || dialogueDone) return;
    setSelectedChoiceIdx(choiceIdx);
    const chosen = activeStage.dialogue.choices[choiceIdx];
    setNpcReply(chosen.reply);
    setDialogueDone(true);
  };

  // Finish Stage & Claim Stars
  const handleCompleteStage = async () => {
    if (!activeStage) return;
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    const starsEarned = practiceScore >= 2 ? 3 : 2;

    // Update local state
    setProgressMap(prev => {
      const nextLesson = activeStage.lesson + 1;
      return {
        ...prev,
        [activeStage.id]: { isUnlocked: true, isCompleted: true, stars: starsEarned },
        ...(nextLesson <= 18 ? { [`${activeStage.level}-${nextLesson}`]: { isUnlocked: true, isCompleted: false, stars: 0 } } : {}),
      };
    });

    // Save to Neon DB
    try {
      await fetch('/api/adventure/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: activeStage.level,
          lessonNum: activeStage.lesson,
          canDoTitle: activeStage.titleJa,
          stars: starsEarned,
          score: 100 + practiceScore * 50,
        }),
      });
    } catch (err) {
      console.error('Error recording stage completion:', err);
    }

    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-[#0f0e13] text-[#f4efe7] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="game-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Lobby Utama</span>
          </Link>

          <div className="flex items-center space-x-3 text-xs font-black bg-[#1e1b29] px-4 py-2 rounded-2xl border border-white/5">
            <Trophy className="w-4 h-4 text-amber-400 fill-current" />
            <span>Mode 2 • Can-Do RPG Adventure</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
            <Map className="w-3.5 h-3.5" />
            <span>54 Can-Do Stages • The Japan Foundation Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Peta Petualangan Can-Do (冒険マップ)
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto">
            Selesaikan tahapan bab secara berurutan. Kuasai kosakata, asah pemahaman komunikasi, dan praktikkan percakapan langsung dengan NPC di setiap lokasi!
          </p>
        </div>

        {/* World Selection Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#161420] border border-white/10 gap-1 sm:gap-2">
            {[
              { id: 'a1', label: 'Dunia 1: A1 入門 (Pemula)', color: 'amber' },
              { id: 'a2-1', label: 'Dunia 2: A2.1 初級1 (Dasar 1)', color: 'cyan' },
              { id: 'a2-2', label: 'Dunia 3: A2.2 初級2 (Dasar 2)', color: 'emerald' },
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWorld(w.id as any)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  selectedWorld === w.id
                    ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stages Grid (18 Stages per World) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stagesList.map(st => {
            const prog = progressMap[st.id] || { isUnlocked: st.lesson === 1, isCompleted: false, stars: 0 };
            const isUnlocked = prog.isUnlocked;
            const isCompleted = prog.isCompleted;
            const stars = prog.stars || 0;

            return (
              <div
                key={st.id}
                onClick={() => isUnlocked && handleOpenStage(st.lesson)}
                className={`p-5 rounded-3xl transition-all border relative flex flex-col justify-between ${
                  !isUnlocked
                    ? 'bg-[#14121b]/60 border-white/5 opacity-60 cursor-not-allowed'
                    : isCompleted
                    ? 'game-card hover:border-amber-500/60 cursor-pointer shadow-lg shadow-amber-950/20'
                    : 'game-card hover:border-amber-400 cursor-pointer ring-1 ring-amber-500/30'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badge: Stage Num & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-white/5 text-stone-300 border border-white/10 flex items-center space-x-1.5">
                      <span>{st.locationIcon}</span>
                      <span>Bab {st.lesson}</span>
                    </span>

                    {/* Lock / Star status */}
                    {!isUnlocked ? (
                      <span className="text-stone-500 flex items-center space-x-1 text-[11px] font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Terkunci</span>
                      </span>
                    ) : isCompleted ? (
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3].map(starNum => (
                          <Star
                            key={starNum}
                            className={`w-3.5 h-3.5 ${
                              starNum <= stars ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black animate-pulse">
                        TERBUKA
                      </span>
                    )}
                  </div>

                  {/* Japanese Can-Do Title */}
                  <div>
                    <h3 className="text-sm font-black text-white leading-snug">
                      {st.titleJa}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {st.titleId}
                    </p>
                  </div>

                  {/* Location Tag */}
                  <div className="text-[11px] text-stone-500 font-bold flex items-center space-x-1">
                    <span>Lokasi:</span>
                    <span className="text-stone-300">{st.locationName}</span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500">
                    {isCompleted ? 'Selesai' : isUnlocked ? 'Mulai Misi' : 'Selesaikan bab sebelumnya'}
                  </span>
                  {isUnlocked && (
                    <span className="font-black text-amber-400 flex items-center space-x-1">
                      <span>Jelajahi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE JOURNEY MODAL (THE 5-STEP IRODORI PEDAGOGICAL LOOP) */}
      {/* ======================================================== */}
      {activeStage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#161420] border border-white/10 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activeStage.locationIcon}</span>
                <div>
                  <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    {activeStage.worldName} • Bab {activeStage.lesson}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {activeStage.titleJa}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleCloseStage}
                className="w-8 h-8 rounded-full bg-white/10 text-stone-300 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* 5-Step Stepper Progress Bar */}
            <div className="flex items-center justify-between text-[11px] font-bold px-2">
              {[
                { step: 1, label: '1. Situasi' },
                { step: 2, label: '2. Kosakata' },
                { step: 3, label: '3. Latihan' },
                { step: 4, label: '4. Percakapan' },
                { step: 5, label: '5. Selesai' },
              ].map(s => (
                <div
                  key={s.step}
                  className={`flex items-center space-x-1.5 ${
                    currentStep === s.step
                      ? 'text-amber-400 font-black'
                      : currentStep > s.step
                      ? 'text-emerald-400'
                      : 'text-stone-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      currentStep === s.step
                        ? 'bg-amber-400 text-stone-950 font-black'
                        : currentStep > s.step
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-stone-600'
                    }`}
                  >
                    {currentStep > s.step ? '✓' : s.step}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            {/* STEP 1: EXPLORE & SITUATION BRIEFING */}
            {currentStep === 1 && (
              <div className="space-y-6 py-2">
                <div className="game-inset p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Situasi & Target Can-Do</span>
                  </div>
                  <div className="text-xl font-black text-white">
                    「{activeStage.titleJa}」
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {activeStage.canDoStatement}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1c1929] border border-white/5 flex items-center space-x-4">
                  <span className="text-3xl">{activeStage.dialogue.npcAvatar}</span>
                  <div>
                    <div className="text-xs font-black text-white">
                      NPC: {activeStage.dialogue.npcName} ({activeStage.dialogue.npcRole})
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Berada di: <strong className="text-stone-300">{activeStage.location}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="game-btn-gold w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2"
                >
                  <span>Lanjut: Pelajari Kosakata Bab Ini</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: LEARN VOCABULARY ESSENTIALS */}
            {currentStep === 2 && (
              <div className="space-y-4 py-2">
                <div className="text-xs text-stone-400 font-bold">
                  Kuasai 4 kosakata utama yang dibutuhkan untuk menyelesaikan misi Can-Do ini:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStage.learnVocabs.map((vocab, i) => (
                    <div key={i} className="game-card p-4 space-y-2 border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white">{vocab.kanji}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-stone-400">
                          {vocab.partOfSpeech}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-red-400">
                        {vocab.reading}
                      </div>
                      <div className="text-xs text-stone-300 font-medium">
                        {vocab.meaningId}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="game-btn-gold w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2 mt-4"
                >
                  <span>Lanjut: Uji Pemahaman (Latihan Soal)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: PRACTICE DRILL */}
            {currentStep === 3 && (
              <div className="space-y-5 py-2">
                <div className="flex items-center justify-between text-xs text-stone-400 font-bold">
                  <span>Latihan Soal {practiceIdx + 1} dari {activeStage.practiceQuestions.length}</span>
                  <span className="text-amber-400">Skor Benar: {practiceScore}</span>
                </div>

                {activeStage.practiceQuestions[practiceIdx] && (
                  <div className="space-y-4">
                    <div className="game-inset p-5 rounded-2xl text-center space-y-1">
                      <div className="text-xs text-stone-400">
                        {activeStage.practiceQuestions[practiceIdx].prompt}
                      </div>
                      <div className="text-3xl font-black text-white">
                        {activeStage.practiceQuestions[practiceIdx].targetDisplay}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeStage.practiceQuestions[practiceIdx].options.map((opt, i) => {
                        const isCorrect = opt === activeStage.practiceQuestions[practiceIdx].answer;
                        const isSelected = opt === selectedPracticeOpt;
                        let btnStyle = 'bg-[#1e1b29] border-white/5 hover:border-amber-400 text-stone-200';

                        if (selectedPracticeOpt !== null) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-red-950/60 border-red-500 text-red-300 font-bold';
                          } else {
                            btnStyle = 'opacity-30 bg-stone-900 border-transparent text-stone-600';
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={selectedPracticeOpt !== null}
                            onClick={() => handleAnswerPractice(opt)}
                            className={`p-3.5 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {selectedPracticeOpt !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPracticeOpt !== null && (
                      <div className="p-3.5 rounded-xl bg-white/5 text-xs text-stone-400 space-y-1">
                        <span className="text-amber-400 font-bold mr-2">Penjelasan:</span>
                        <span>{activeStage.practiceQuestions[practiceIdx].explanation}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedPracticeOpt !== null && (
                  <button
                    onClick={handleNextPractice}
                    className="game-btn-gold w-full py-3 text-xs font-black flex items-center justify-center space-x-2"
                  >
                    <span>
                      {practiceIdx + 1 < activeStage.practiceQuestions.length ? 'Soal Berikutnya' : 'Lanjut: Dialog dengan NPC'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* STEP 4: APPLY DIALOGUE MISSION (INTERACTIVE NPC WITH BRANCHING CHOICES) */}
            {currentStep === 4 && (
              <div className="space-y-5 py-2">
                <div className="text-xs text-stone-400 font-bold flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Praktikkan komunikasi nyata dengan {activeStage.dialogue.npcName}:</span>
                </div>

                {/* NPC Dialogue Box with Integrated Branching Choices */}
                <DialogueBox
                  dialogue={{
                    speaker: activeStage.dialogue.npcName,
                    speakerRole: activeStage.dialogue.npcRole,
                    avatarEmoji: activeStage.dialogue.npcAvatar,
                    textJa: activeStage.dialogue.initialLines[1]?.japanese || activeStage.dialogue.initialLines[0]?.japanese || '',
                    textKana: activeStage.dialogue.initialLines[1]?.furigana || activeStage.dialogue.initialLines[0]?.furigana || '',
                    textId: activeStage.dialogue.initialLines[1]?.indonesian || activeStage.dialogue.initialLines[0]?.indonesian || '',
                    situationContext: activeStage.canDoStatement,
                    choices: activeStage.dialogue.choices.map(c => ({
                      textJa: c.text,
                      textKana: c.furigana,
                      textId: c.indonesian,
                      responseJa: c.reply,
                      responseId: c.reply,
                    })),
                  }}
                  onSelectChoice={(choice) => {
                    setDialogueDone(true);
                    setNpcReply(choice.responseJa || null);
                  }}
                />

                {dialogueDone && (
                  <button
                    onClick={handleCompleteStage}
                    className="game-btn-gold w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2 mt-4"
                  >
                    <Award className="w-4 h-4" />
                    <span>Selesaikan Bab & Ambil Bintang Can-Do ⭐</span>
                  </button>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW & CAN-DO CERTIFICATION */}
            {currentStep === 5 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/20 animate-bounce">
                  ⭐
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-amber-400">
                    STAGE BAB {activeStage.lesson} SELESAI!
                  </h3>
                  <p className="text-xs text-stone-300 max-w-md mx-auto">
                    {activeStage.canDoStatement}
                  </p>
                </div>

                {/* Star Badges */}
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3].map(s => (
                    <Star key={s} className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-md" />
                  ))}
                </div>

                {/* Rewards Earned */}
                <div className="p-4 rounded-2xl bg-[#1c1929] border border-white/5 flex items-center justify-around max-w-sm mx-auto">
                  <div className="flex items-center space-x-2 text-amber-300 font-black text-xs">
                    <Coins className="w-4 h-4 fill-current" />
                    <span>+150 Yen</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center space-x-2 text-purple-300 font-black text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>+200 EXP</span>
                  </div>
                </div>

                <button
                  onClick={handleCloseStage}
                  className="game-btn-primary px-8 py-3.5 text-xs font-black mx-auto"
                >
                  Kembali ke Peta Petualangan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
