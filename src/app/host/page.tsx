'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Sparkles, 
  Gamepad2, 
  Play, 
  FileText, 
  ShieldCheck, 
  Flame, 
  School,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { LPK_TEXTBOOKS, LPK_CHAPTERS } from '@/data/lpk-curriculum-catalog';

export default function SenseiHostPortal() {
  const router = useRouter();
  const [selectedTextbook, setSelectedTextbook] = useState<string>('IRODORI_A1');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('irodori_a1_ch1');
  const [selectedGameMode, setSelectedGameMode] = useState<'OX_SURVIVAL' | 'PARTICLE_HUNTER' | 'KOTOBA_RUNNER'>('OX_SURVIVAL');
  const [hostName, setHostName] = useState<string>('Iqbal Sensei');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Filter chapters based on active textbook
  const chapters = LPK_CHAPTERS.filter(c => c.textbook === selectedTextbook);
  const activeChapter = LPK_CHAPTERS.find(c => c.id === selectedChapterId) || chapters[0] || LPK_CHAPTERS[0];

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: activeChapter.id,
          gameMode: selectedGameMode,
          hostName
        })
      });

      const data = await res.json();
      if (data.success && data.room) {
        router.push(`/host/lobby/${data.room.roomId}`);
      } else {
        alert('Gagal membuat room. Silakan coba lagi.');
        setIsCreating(false);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0c13] text-[#f4efe7] flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#14121d]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-900/40">
              彩
            </Link>
            <div>
              <div className="text-base font-black tracking-wider text-white flex items-center space-x-2">
                <span>IRODORI HOST PORTAL</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  SENSEI CONSOLE
                </span>
              </div>
              <div className="text-xs text-stone-400">
                Pusat Kendali Game Arena & Administrasi Kelas LPK
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <School className="w-4 h-4 text-red-400" />
              <input 
                type="text" 
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none w-28"
                placeholder="Nama Sensei"
              />
            </div>
            <Link 
              href="/" 
              className="text-xs text-stone-400 hover:text-white px-3 py-1.5 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Textbook & Chapter Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section: Pilih Buku */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-red-400" />
                <span>1. Pilih Buku Pegangan LPK</span>
              </label>
              <span className="text-xs text-red-400 font-semibold">Japan Foundation / 3A Network</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LPK_TEXTBOOKS.map((tb) => {
                const isActive = selectedTextbook === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => {
                      setSelectedTextbook(tb.id);
                      const firstCh = LPK_CHAPTERS.find(c => c.textbook === tb.id);
                      if (firstCh) setSelectedChapterId(firstCh.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-red-600/20 to-red-950/40 border-red-500/60 shadow-lg shadow-red-950/50' 
                        : 'bg-[#181622]/80 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-black text-white">{tb.name}</div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="text-xs text-stone-400 mb-2">{tb.tag}</div>
                    <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-stone-300">
                      {tb.level}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Pilih Bab Pembelajaran */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>2. Pilih Bab / Topik Kelas</span>
              </label>
              <span className="text-xs text-stone-400">{chapters.length} Bab Siap Game</span>
            </div>

            <div className="space-y-3">
              {chapters.map((ch) => {
                const isSelected = selectedChapterId === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#221c2d] border-red-500 shadow-md shadow-red-950/40 ring-1 ring-red-500/50'
                        : 'bg-[#15131f] border-white/5 hover:border-white/15 hover:bg-[#1a1726]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600/20 text-red-400 border border-red-500/30">
                            Bab {ch.chapterNumber}
                          </span>
                          <span className="text-sm font-black text-white tracking-wide">
                            {ch.titleJapanese}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-300">
                          {ch.titleIndonesian}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-stone-300">
                          {ch.jlptLevel}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-white/5 text-xs text-stone-400 flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>~{ch.recommendedDurationMin} Mnt</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Flame className="w-3.5 h-3.5 text-stone-500" />
                        <span>{ch.questionCount} Soal O/X & Drill</span>
                      </div>
                      <div className="text-[11px] text-stone-400 italic truncate max-w-xs">
                        Can-Do: {ch.targetCanDo}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Mode Permainan */}
          <div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center space-x-1.5 mb-3">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>3. Pilih Mode Permainan Game</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* O/X Survival */}
              <button
                onClick={() => setSelectedGameMode('OX_SURVIVAL')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedGameMode === 'OX_SURVIVAL'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-[#15131f] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">⭕❌</div>
                <div className="text-xs font-black text-white">OX Survival</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Siswa berlari ke zona Maru atau Batsu. Cepat & seru untuk apersepsi.
                </div>
              </button>

              {/* Particle Hunter */}
              <button
                onClick={() => setSelectedGameMode('PARTICLE_HUNTER')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedGameMode === 'PARTICLE_HUNTER'
                    ? 'bg-amber-950/30 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-[#15131f] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-black text-white">Partikel Hunter</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Menginjak zona partikel は, が, を, に, で yang sesuai konteks.
                </div>
              </button>

              {/* Kotoba Runner */}
              <button
                onClick={() => setSelectedGameMode('KOTOBA_RUNNER')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedGameMode === 'KOTOBA_RUNNER'
                    ? 'bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-[#15131f] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">🏃‍♂️</div>
                <div className="text-xs font-black text-white">Kotoba Runner</div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Balapan cepat tepat menebak arti kanji & kosakata bab ini.
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Launch Summary & Action Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Room Preview Card */}
          <div className="bg-gradient-to-b from-[#1c1926] to-[#14121d] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Ringkasan Sesi Kelas</span>
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              {activeChapter.titleJapanese}
            </h3>
            <p className="text-sm font-semibold text-stone-300 mb-4">
              {activeChapter.titleIndonesian}
            </p>

            {/* Meta Tags */}
            <div className="space-y-3 bg-[#0d0c13]/70 border border-white/5 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Buku Pegangan:</span>
                <span className="font-bold text-white">{activeChapter.textbookName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Target Kurikulum:</span>
                <span className="font-bold text-amber-400">{activeChapter.jlptLevel}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Mode Permainan:</span>
                <span className="font-bold text-emerald-400">
                  {selectedGameMode === 'OX_SURVIVAL' ? '⭕❌ OX Survival' : selectedGameMode === 'PARTICLE_HUNTER' ? '🎯 Partikel Hunter' : '🏃‍♂️ Kotoba Runner'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Tema Map Arena:</span>
                <span className="font-bold text-stone-200">{activeChapter.mapTheme}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Sensei Pengampu:</span>
                <span className="font-bold text-white">{hostName}</span>
              </div>
            </div>

            {/* Can-Do Descriptor */}
            <div className="mb-6 p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl">
              <div className="text-[11px] font-black text-red-300 uppercase tracking-wider mb-1">
                Target Can-Do Bab Ini:
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                &ldquo;{activeChapter.targetCanDo}&rdquo;
              </p>
            </div>

            {/* Launch Game Button */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 shadow-xl shadow-red-900/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isCreating ? (
                <span>Menyiapkan Room Proyektor...</span>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>BUKA ARENA PROYEKTOR KELAS</span>
                </>
              )}
            </button>

            {/* Admin Docx Button */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-stone-400">
                Administrasi Siap Cetak:
              </div>
              <button 
                onClick={() => alert(`Mengunduh Draf RPP Can-Do LPK untuk ${activeChapter.titleIndonesian}...`)}
                className="text-xs font-bold text-stone-300 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Unduh RPP Can-Do (.docx)</span>
              </button>
            </div>

          </div>

          {/* Tips for Sensei */}
          <div className="bg-[#14121d] border border-white/5 rounded-2xl p-4 text-xs text-stone-400 space-y-2">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>Petunjuk Penggunaan di Kelas:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px] leading-relaxed">
              <li>Sorotkan layar berikutnya ke <strong>Proyektor / Smart TV Kelas</strong>.</li>
              <li>Minta siswa membuka link di HP atau memindai <strong>QR Code</strong> di layar.</li>
              <li>Siswa tidak butuh login, cukup masukkan nama dan pilih avatar karakter.</li>
              <li>Gunakan tombol <em>&ldquo;Kunci Pintu&rdquo;</em> setelah semua siswa masuk sebelum kuis dimulai.</li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
}
