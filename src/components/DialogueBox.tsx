'use client';

import React, { useState } from 'react';
import { Languages, BookOpen, Volume2, ArrowRight, MessageSquare, Check, Sparkles } from 'lucide-react';

export interface DialogueChoice {
  textJa: string;
  textKana?: string;
  textId?: string;
  score?: number;
  responseJa?: string;
  responseId?: string;
}

export interface DialogueNode {
  speaker: string;
  speakerRole?: string;
  avatarEmoji?: string;
  textJa: string;
  textKana?: string;
  textId: string; // Indonesian translation
  choices?: DialogueChoice[];
  situationContext?: string;
}

interface DialogueBoxProps {
  dialogue: DialogueNode;
  onSelectChoice?: (choice: DialogueChoice) => void;
  onNext?: () => void;
}

export default function DialogueBox({
  dialogue,
  onSelectChoice,
  onNext,
}: DialogueBoxProps) {
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<DialogueChoice | null>(null);

  const handleChoice = (c: DialogueChoice) => {
    setSelectedChoice(c);
    if (onSelectChoice) onSelectChoice(c);
  };

  return (
    <div className="game-card p-6 sm:p-7 space-y-5 max-w-2xl mx-auto border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Speaker info & Toggles */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
            {dialogue.avatarEmoji || '👨‍💼'}
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center space-x-2">
              <span>{dialogue.speaker}</span>
              {dialogue.speakerRole && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-stone-400">
                  {dialogue.speakerRole}
                </span>
              )}
            </div>
            {dialogue.situationContext && (
              <div className="text-[10px] text-amber-400 font-medium">
                {dialogue.situationContext}
              </div>
            )}
          </div>
        </div>

        {/* Toggles according to dialogue-system skill */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setShowFurigana(f => !f)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all border ${
              showFurigana
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-white/5 text-stone-500 border-white/5'
            }`}
            title="Aktifkan / Nonaktifkan Furigana (Cara Baca)"
          >
            Furigana
          </button>
          <button
            onClick={() => setShowTranslation(t => !t)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all border ${
              showTranslation
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-white/5 text-stone-500 border-white/5'
            }`}
            title="Aktifkan / Nonaktifkan Terjemahan Indonesia"
          >
            Arti (ID)
          </button>
        </div>
      </div>

      {/* NPC Speech Balloon */}
      <div className="game-inset p-5 rounded-2xl space-y-2">
        {/* Japanese Speech */}
        <div className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {showFurigana && dialogue.textKana ? (
            <ruby>
              {dialogue.textJa}
              <rt className="text-[10px] text-amber-400 font-mono font-medium">{dialogue.textKana}</rt>
            </ruby>
          ) : (
            dialogue.textJa
          )}
        </div>

        {/* Indonesian Translation */}
        {showTranslation && (
          <div className="text-xs text-stone-400 pt-1 border-t border-white/5 font-sans leading-relaxed">
            "{dialogue.textId}"
          </div>
        )}
      </div>

      {/* Choices or Advance */}
      {dialogue.choices && dialogue.choices.length > 0 && !selectedChoice ? (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilih Respon Percakapan Anda:</span>
          </div>

          <div className="space-y-2">
            {dialogue.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice)}
                className="w-full p-3.5 rounded-xl bg-[#201d2c] hover:bg-[#2a263a] border border-white/10 hover:border-amber-500 text-left transition-all text-xs sm:text-sm font-bold text-stone-200 hover:text-white flex items-center justify-between group"
              >
                <span>{choice.textJa}</span>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ) : selectedChoice ? (
        /* Selected choice feedback */
        <div className="space-y-3 pt-1 animate-in fade-in">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
            <div className="font-black text-amber-300">Respon Anda:</div>
            <div className="text-white font-bold">{selectedChoice.textJa}</div>
            {selectedChoice.textId && <div className="text-stone-400 italic">"{selectedChoice.textId}"</div>}
          </div>

          {selectedChoice.responseJa && (
            <div className="p-3.5 rounded-xl bg-[#121019] border border-white/10 text-xs space-y-1">
              <div className="font-bold text-stone-400">{dialogue.speaker}:</div>
              <div className="text-stone-200 font-bold">{selectedChoice.responseJa}</div>
              {selectedChoice.responseId && <div className="text-stone-500 italic">"{selectedChoice.responseId}"</div>}
            </div>
          )}

          {onNext && (
            <button
              onClick={onNext}
              className="game-btn-gold w-full py-3 text-xs font-black flex items-center justify-center space-x-2"
            >
              <span>Lanjutkan Percakapan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        onNext && (
          <button
            onClick={onNext}
            className="game-btn-primary w-full py-3 text-xs font-black flex items-center justify-center space-x-2"
          >
            <span>Lanjut</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )
      )}
    </div>
  );
}
