'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Swords, 
  Map, 
  ShieldAlert, 
  Box, 
  Trophy, 
  Zap, 
  Sparkles, 
  BookOpen, 
  Coins, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  Gamepad2,
  Volume2
} from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export default function GameLobbyPage() {
  const { user, isLoaded } = useUser();
  const [playerData, setPlayerData] = useState<{
    yenCoins: number;
    levelRank: number;
    title: string;
  } | null>(null);

  // Sync player data with Neon DB when logged in
  useEffect(() => {
    if (user) {
      fetch('/api/player/sync')
        .then(res => res.json())
        .then(data => {
          if (data?.avatar) {
            setPlayerData({
              yenCoins: data.avatar.yenCoins || 1000,
              levelRank: data.avatar.levelRank || 1,
              title: data.avatar.equippedTitle || 'Siswa Pemula',
            });
          }
        })
        .catch(err => console.error('Failed to sync player:', err));
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0e13] text-[#f4efe7]">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-[#16141f]/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e63946] to-[#b81424] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
              彩
            </div>
            <div>
              <div className="text-base font-black tracking-wider text-white flex items-center space-x-2">
                <span>IRODORI ARENA</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  EDU-GAME
                </span>
              </div>
              <div className="text-[10px] text-stone-400 font-medium">
                Iqbal-sensei LMS • Japan Foundation
              </div>
            </div>
          </Link>

          {/* Right Profile & Auth */}
          <div className="flex items-center space-x-4">
            {isLoaded && user ? (
              <>
                {playerData && (
                  <div className="hidden sm:flex items-center space-x-3 bg-[#1e1b29] px-3.5 py-1.5 rounded-2xl border border-white/5">
                    <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-black">
                      <Coins className="w-4 h-4 fill-current" />
                      <span>{playerData.yenCoins.toLocaleString()} ¥</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-[11px] font-extrabold text-stone-300">
                      Lv. {playerData.levelRank} • <span className="text-red-400">{playerData.title}</span>
                    </div>
                  </div>
                )}
                <UserButton />
              </>
            ) : isLoaded ? (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                    Masuk
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="game-btn-primary px-4 py-2 text-xs font-black">
                    Daftar Akun
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative px-4 sm:px-8 pt-10 pb-12 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-radial from-red-900/15 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-950/60 to-purple-950/60 border border-red-500/30 text-xs font-bold text-red-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Serverless Game Engine • Neon PostgreSQL & Clerk Auth</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Arena Belajar Bahasa Jepang <br />
            <span className="bg-gradient-to-r from-[#e63946] via-[#ffb703] to-[#e63946] bg-clip-text text-transparent">
              Interaktif, Kompetitif & 3D Voxel
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Kuasai 4,245 kosakata, 659 kanji, pola kalimat, dan audio chōkai asli The Japan Foundation dengan 4 mode game seru: duel PvP, petualangan RPG Can-Do, survival tim, dan eksplorasi ruang 360° avatar voxel.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/host"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-black flex items-center space-x-2 shadow-lg shadow-red-950/60 transition-transform hover:scale-105"
            >
              <Users className="w-4 h-4" />
              <span>Portal Sensei (Buka Lobi Kelas)</span>
            </Link>
            <Link
              href="/join"
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs sm:text-sm font-black flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Siswa: Masuk PIN Room</span>
            </Link>
            <Link
              href="/battle"
              className="game-btn-secondary px-6 py-3 text-xs sm:text-sm font-black flex items-center space-x-2"
            >
              <Swords className="w-4 h-4" />
              <span>Mulai Battle Arena</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main 4 Game Modes Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <Gamepad2 className="w-6 h-6 text-red-500" />
              <span>Pilih Mode Permainan</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Setiap mode dirancang khusus untuk mengasah kepekaan dan refleks bahasa Jepang Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MODE 1: BATTLE ARENA */}
          <div className="game-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/20 transition-all" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
                  Mode 1 • Realtime PvP
                </span>
                <span className="text-xs font-bold text-stone-400 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-red-400" />
                  <span>1 VS 1 & Room</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-white mb-2 flex items-center space-x-2">
                <span>Battle Arena</span>
                <span className="text-sm text-stone-500 font-bold">(対戦アリーナ)</span>
              </h3>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Tantang teman sekelas atau pemain lain dalam duel adu cepat dan refleks dengan 5 sub-mode pertandingan seru:
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300 flex items-center space-x-2">
                  <span className="text-red-400">❶</span>
                  <span>Kanji Speed Duel</span>
                </div>
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300 flex items-center space-x-2">
                  <span className="text-amber-400">❷</span>
                  <span>Kotoba Combo Blitz</span>
                </div>
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300 flex items-center space-x-2">
                  <span className="text-cyan-400">❸</span>
                  <span>Tebak Gambar Irodori</span>
                </div>
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300 flex items-center space-x-2">
                  <span className="text-emerald-400">❹</span>
                  <span>Susun Tata Bahasa</span>
                </div>
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300 col-span-2 flex items-center space-x-2">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Chōkai Audio Reflex (Buzzer Match)</span>
                </div>
              </div>
            </div>

            <Link
              href="/battle"
              className="game-btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2"
            >
              <Swords className="w-4 h-4" />
              <span>Masuk Lobby Battle Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MODE 2: CAN-DO ADVENTURE */}
          <div className="game-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-600/20 transition-all" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  Mode 2 • RPG Story Mode
                </span>
                <span className="text-xs font-bold text-stone-400 flex items-center space-x-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>54 Can-Do Stages</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-white mb-2 flex items-center space-x-2">
                <span>Can-Do Adventure</span>
                <span className="text-sm text-stone-500 font-bold">(冒険モード)</span>
              </h3>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Buka tahapan peta dunia dari Bab 1 hingga Bab 18 per level (A1 Nyuumon, A2.1 Shokyuu 1, dan A2.2 Shokyuu 2) sesuai standar Can-Do resmi The Japan Foundation.
              </p>

              <div className="space-y-2 mb-6">
                <div className="game-inset p-2.5 text-[11px] text-stone-300 flex items-center justify-between">
                  <span className="font-bold">Dunia 1: A1 (入門 - Tingkat Pemula)</span>
                  <span className="text-amber-400 font-extrabold">18 Stage</span>
                </div>
                <div className="game-inset p-2.5 text-[11px] text-stone-300 flex items-center justify-between">
                  <span className="font-bold">Dunia 2: A2.1 (初級1 - Tingkat Dasar 1)</span>
                  <span className="text-amber-400 font-extrabold">18 Stage</span>
                </div>
                <div className="game-inset p-2.5 text-[11px] text-stone-300 flex items-center justify-between">
                  <span className="font-bold">Dunia 3: A2.2 (初級2 - Tingkat Dasar 2)</span>
                  <span className="text-amber-400 font-extrabold">18 Stage</span>
                </div>
              </div>
            </div>

            <Link
              href="/adventure"
              className="game-btn-gold w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2"
            >
              <Map className="w-4 h-4" />
              <span>Jelajahi Peta Can-Do</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MODE 3: SURVIVAL ENDLESS */}
          <div className="game-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-600/20 transition-all" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Mode 3 • Solo & Co-Op Team
                </span>
                <span className="text-xs font-bold text-stone-400 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Endless Waves</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-white mb-2 flex items-center space-x-2">
                <span>Survival Waves</span>
                <span className="text-sm text-stone-500 font-bold">(サバイバル)</span>
              </h3>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Uji ketahanan menghadapi gelombang soal komprehensif dari materi A1 hingga A2.2. Bertahan hidup solo dengan 3 nyawa atau gabung regu Co-Op 2-4 pemain dengan shared HP bar!
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300">
                  <div className="text-emerald-400 mb-0.5">Solo Survival</div>
                  <div className="text-[10px] text-stone-400">3 Nyawa • High Score Global</div>
                </div>
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300">
                  <div className="text-cyan-400 mb-0.5">Team Co-Op (2-4 Pemain)</div>
                  <div className="text-[10px] text-stone-400">Shared HP • Power-up Revive</div>
                </div>
              </div>
            </div>

            <Link
              href="/survival"
              className="game-btn-secondary w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2 text-emerald-300 hover:text-white"
            >
              <Zap className="w-4 h-4" />
              <span>Mulai Tantangan Survival</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MODE 4: 360° VOXEL EXPLORER */}
          <div className="game-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/20 transition-all" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                  Mode 4 • 3D Three.js & Voxel
                </span>
                <span className="text-xs font-bold text-stone-400 flex items-center space-x-1">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Roblox / Minecraft Style</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-white mb-2 flex items-center space-x-2">
                <span>360° Voxel Explorer</span>
                <span className="text-sm text-stone-500 font-bold">(360度探索)</span>
              </h3>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Eksplorasi panorama 360° seperti H5P untuk mengasah kepekaan lingkungan sekitar di Jepang. Gunakan avatar balok voxel 3D yang dapat dikustomisasi kostum dan aksesorisnya.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300">
                  <div className="text-cyan-400 mb-0.5">Panorama 360°</div>
                  <div className="text-[10px] text-stone-400">Kelas, Konbini, Stasiun</div>
                </div>
                <div className="game-inset p-2.5 text-[11px] font-bold text-stone-300">
                  <div className="text-purple-400 mb-0.5">Avatar Voxel 3D</div>
                  <div className="text-[10px] text-stone-400">Skin, Kimono, Hachimaki</div>
                </div>
              </div>
            </div>

            <Link
              href="/explore"
              className="game-btn-secondary w-full py-3.5 text-xs font-black flex items-center justify-center space-x-2 text-cyan-300 hover:text-white"
            >
              <Box className="w-4 h-4" />
              <span>Masuk Dunia 360° Voxel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Info & Tech Stack */}
      <footer className="border-t border-white/10 bg-[#121019] px-4 sm:px-8 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Neon Database: <strong>LMS イクバル先生の学習教材</strong> (Connected)</span>
            <span className="text-stone-700">•</span>
            <span>Clerk: <strong>app_3KVzEvqjBswTUyHXtOkLuKHMHu6</strong></span>
          </div>
          <div>
            Data: 4,245 Kosakata • 659 Kanji • 1,129 Audio Native • 1,227 Ilustrasi
          </div>
        </div>
      </footer>
    </div>
  );
}
