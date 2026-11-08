'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Smile
} from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'siswa_lpk_l', name: 'Siswa LPK (L)', emoji: '👨‍🎓', desc: 'Seragam Belajar' },
  { id: 'siswi_lpk_p', name: 'Siswi LPK (P)', emoji: '👩‍🎓', desc: 'Seragam Belajar' },
  { id: 'kenshuusei', name: 'Kenshuusei Pabrik', emoji: '👷‍♂️', desc: 'Manufaktur' },
  { id: 'kaigo_care', name: 'Kaigo Caregiver', emoji: '🧑‍⚕️', desc: 'Panti Lansia' },
  { id: 'restaurant', name: 'Koki Restoran', emoji: '🧑‍🍳', desc: 'Pengolahan Makanan' },
  { id: 'nogyo', name: 'Pertanian', emoji: '👨‍🌾', desc: 'Sektor Pertanian' }
];

const EMOTE_REACTIONS = [
  { label: 'はい!', romaji: 'Hai!' },
  { label: 'がんばれ!', romaji: 'Ganbare!' },
  { label: 'よろしく!', romaji: 'Yoroshiku!' },
  { label: 'わかりました!', romaji: 'Wakarimashita!' }
];

function JoinPageContent() {
  const searchParams = useSearchParams();
  const [pin, setPin] = useState<string>(() => searchParams.get('pin') || '');
  const [name, setName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<{ chapterTitle: string; gameMode: string; roomId: string } | null>(null);
  const [joinedPlayerId, setJoinedPlayerId] = useState<string | null>(null);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin.trim() || !name.trim()) {
      setError('Kode PIN dan Nama Panggilan wajib diisi!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin.trim(),
          name: name.trim(),
          avatar: {
            skin: 1,
            gender: 'boy',
            costume: selectedAvatar.id,
            emoji: selectedAvatar.emoji
          }
        })
      });

      const data = await res.json();

      if (data.success && data.room) {
        setRoomInfo(data.room);
        setJoinedPlayerId(data.playerId);
        setHasJoined(true);
      } else {
        setError(data.error || 'Gagal masuk ke room. Periksa kembali PIN Anda.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kendala jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendReaction = (label: string) => {
    setFloatingReaction(label);
    setTimeout(() => setFloatingReaction(null), 1200);
  };

  // View: Waiting in Lobby
  if (hasJoined && roomInfo) {
    return (
      <div className="min-h-screen bg-[#0d0c13] text-[#f4efe7] flex flex-col items-center justify-between p-6 text-center select-none relative overflow-hidden">
        {/* Floating Reaction Animation */}
        {floatingReaction && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-xl px-6 py-2 rounded-full shadow-2xl animate-bounce">
            {floatingReaction}
          </div>
        )}

        {/* Header */}
        <div className="w-full max-w-sm pt-4">
          <div className="inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            ✓ Berhasil Masuk Lobi
          </div>
          <h2 className="text-base font-black text-white truncate">
            {roomInfo.chapterTitle}
          </h2>
          <div className="text-xs text-stone-400 mt-0.5">
            Mode: {roomInfo.gameMode === 'OX_SURVIVAL' ? '⭕❌ OX Survival' : roomInfo.gameMode}
          </div>
        </div>

        {/* Center: Jumping Avatar Character */}
        <div className="space-y-4 my-auto">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-b from-red-600/20 to-[#1e1b29] border-2 border-white/10 flex items-center justify-center text-6xl shadow-2xl animate-pulse">
            {selectedAvatar.emoji}
          </div>
          <div>
            <div className="text-lg font-black text-white">{name}</div>
            <div className="text-xs text-stone-400">{selectedAvatar.name}</div>
          </div>
          <div className="bg-[#181524] border border-white/10 rounded-2xl p-4 max-w-xs mx-auto space-y-3">
            <div className="text-xs font-bold text-amber-400 animate-pulse flex items-center justify-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Menunggu Sensei Memulai Kuis...</span>
            </div>
            <div className="text-[11px] text-stone-400">
              Perhatikan layar proyektor di depan kelas!
            </div>
            <Link
              href={`/play/${roomInfo.roomId || pin}?playerId=${joinedPlayerId || ''}&name=${encodeURIComponent(name)}`}
              className="w-full py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 shadow-lg shadow-red-950/60 flex items-center justify-center space-x-2 transition-all block"
            >
              <Gamepad2 className="w-4 h-4 inline-block mr-1.5" />
              <span>BUKA ARENA 12 KOTAK ➔</span>
            </Link>
          </div>
        </div>

        {/* Bottom Reaction Buttons */}
        <div className="w-full max-w-sm pb-4 space-y-2">
          <div className="text-[11px] font-bold text-stone-400 flex items-center justify-center space-x-1">
            <Smile className="w-3.5 h-3.5 text-stone-500" />
            <span>Kirim Reaksi Cepat:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EMOTE_REACTIONS.map((em, idx) => (
              <button
                key={idx}
                onClick={() => sendReaction(em.label)}
                className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-xs font-bold text-white transition-all flex flex-col items-center"
              >
                <span>{em.label}</span>
                <span className="text-[9px] text-stone-400">{em.romaji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View: Initial Join Form
  return (
    <div className="min-h-screen bg-[#0d0c13] text-[#f4efe7] flex flex-col justify-center items-center p-4 sm:p-6">
      
      <div className="w-full max-w-md bg-[#14121d] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow Decor */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-red-900/50 mb-3">
            彩
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">
            MASUK ARENA KUIS
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Irodori & Minna no Nihongo • Kelas Interaktif LPK
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          
          {/* PIN Input */}
          <div>
            <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest block mb-1.5">
              Kode PIN Room (8 Digit)
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Contoh: 78492104"
              maxLength={10}
              className="w-full px-4 py-3 rounded-2xl bg-[#0b0a11] border border-white/10 focus:border-red-500 text-white font-mono text-center text-xl font-black tracking-widest focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Nickname Input */}
          <div>
            <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest block mb-1.5">
              Nama Panggilan Siswa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              maxLength={15}
              className="w-full px-4 py-3 rounded-2xl bg-[#0b0a11] border border-white/10 focus:border-red-500 text-white text-sm font-bold focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Avatar Character Picker */}
          <div>
            <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest block mb-1.5">
              Pilih Avatar Karakter
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar.id === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-red-950/30 border-red-500 ring-2 ring-red-500/50 shadow-md shadow-red-950/50'
                        : 'bg-[#0d0c14] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.emoji}</span>
                    <span className="text-[10px] font-bold text-white truncate w-full">
                      {av.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-900/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Menghubungi Server...</span>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                <span>GABUNG KE ARENA KELAS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-[10px] text-stone-500">
          Tidak perlu login • Masukkan nama dan ikuti kuis di kelas Anda
        </div>

      </div>

    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0c13] text-white flex items-center justify-center">
        Memuat Halaman Gabung...
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
