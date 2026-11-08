'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  Play, 
  Copy, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { QuizRoom } from '@/lib/room-store';

export default function HostLobbyProjectorPage({
  params
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Poll room data every 1.5 seconds to get real-time joined students
  useEffect(() => {
    let isMounted = true;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/room/${roomId}`);
        const data = await res.json();
        if (data.success && isMounted) {
          setRoom(data.room);
        } else if (!data.success && isMounted) {
          setError('Room tidak ditemukan atau telah kedaluwarsa.');
        }
      } catch (err) {
        console.error('Failed to fetch room state:', err);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomId]);

  // Generate QR Code when room is loaded
  useEffect(() => {
    if (room?.pin) {
      const joinUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/join?pin=${room.pin}`
        : `https://irodori.app/join?pin=${room.pin}`;

      QRCode.toDataURL(joinUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0d0c13',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [room?.pin]);

  // Lock / Unlock Lobby
  const handleToggleLock = async () => {
    if (!room) return;
    const nextAction = room.isLocked ? 'UNLOCK' : 'LOCK';
    try {
      const res = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction })
      });
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Kick student
  const handleKickPlayer = async (playerId: string) => {
    if (!confirm('Yakin ingin mengeluarkan siswa ini dari lobi?')) return;
    try {
      await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'KICK_PLAYER', playerId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Start game countdown
  const handleStartGame = async () => {
    if (!room) return;
    setIsStarting(true);
    try {
      await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_GAME' })
      });
      // In production, router will transition to live arena
      alert('Hitung mundur permainan dimulai! Siswa akan otomatis masuk ke arena O/X.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const copyPin = () => {
    if (room?.pin) {
      navigator.clipboard.writeText(room.pin);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0c13] text-white flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold mb-2">{error}</h2>
        <Link href="/host" className="text-sm text-red-400 hover:underline">
          Kembali ke Portal Sensei
        </Link>
      </div>
    );
  }

  const playersList = room ? Object.values(room.players) : [];
  const formattedPin = room?.pin ? `${room.pin.substring(0, 4)} - ${room.pin.substring(4, 8)}` : 'Memuat...';

  return (
    <div className="min-h-screen bg-[#0a090f] text-[#f4efe7] flex flex-col justify-between selection:bg-red-500 selection:text-white">
      
      {/* Top Projector Header */}
      <header className="border-b border-white/10 bg-[#12101a]/90 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/host" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-stone-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black text-white tracking-wide">
                {room?.chapterTitle || 'Memuat Bab Kuis...'}
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {room?.gameMode === 'OX_SURVIVAL' ? '⭕❌ OX SURVIVAL' : room?.gameMode}
              </span>
            </div>
            <div className="text-xs text-stone-400 font-medium">
              Pengampu: <span className="text-stone-200 font-bold">{room?.hostName}</span> • LPK Nihongo Arena
            </div>
          </div>
        </div>

        {/* Host Live Controls */}
        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="w-10 h-10 rounded-xl bg-[#1c1926] border border-white/10 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
            title={isAudioMuted ? 'Nyalakan Musik Lobi' : 'Matikan Musik Lobi'}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Lock Door Button */}
          <button
            onClick={handleToggleLock}
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center space-x-2 transition-all ${
              room?.isLocked
                ? 'bg-red-950/40 border-red-500/60 text-red-300 shadow-md shadow-red-950/50'
                : 'bg-[#1c1926] border-white/10 text-stone-300 hover:text-white'
            }`}
          >
            {room?.isLocked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-stone-400" />}
            <span>{room?.isLocked ? 'Pintu Lobi Terkunci' : 'Kunci Pintu Lobi'}</span>
          </button>

          {/* Start Game Button (Big Prominent) */}
          <button
            onClick={handleStartGame}
            disabled={playersList.length === 0 || isStarting}
            className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/50 transition-all flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>{isStarting ? 'MEMULAI...' : 'MULAI KUIS SEKARANG'}</span>
          </button>
        </div>
      </header>

      {/* Main Projector Body */}
      <main className="max-w-7xl mx-auto px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Student Access Card (PIN & QR Code) - 5 Cols */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#181524] to-[#12101c] border border-white/10 rounded-3xl p-7 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-0 w-36 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Join Instructions */}
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-stone-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gabung Lewat Smartphone</span>
            </div>
            <div className="text-xs text-stone-400">
              Buka link berikut di browser HP Anda:
            </div>
            <div className="text-xl font-black text-white mt-0.5 tracking-wider font-mono">
              irodori.app/join
            </div>
          </div>

          {/* Big PIN Display */}
          <div 
            onClick={copyPin}
            className="bg-[#0b0a11] border-2 border-dashed border-red-500/40 hover:border-red-500 rounded-2xl p-4 cursor-pointer group transition-all"
            title="Klik untuk menyalin PIN"
          >
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center justify-center space-x-1.5">
              <span>KODE PIN ROOM KELAS</span>
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />}
            </div>
            <div className="text-4xl sm:text-5xl font-black text-red-500 font-mono tracking-wider drop-shadow-md">
              {formattedPin}
            </div>
          </div>

          {/* Dynamic QR Code */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/50 border-4 border-white/10">
              {qrCodeDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code Masuk Kuis" 
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-black text-xs font-bold">
                  Membuat QR Code...
                </div>
              )}
            </div>
            <div className="text-[11px] text-stone-400 font-medium">
              Arahkan kamera smartphone ke QR Code untuk langsung bergabung
            </div>
          </div>

        </div>

        {/* Right Side: Real-Time Joined Students Grid - 7 Cols */}
        <div className="lg:col-span-7 bg-[#12101c]/80 border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col min-h-[520px]">
          
          {/* Header & Counter */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Daftar Siswa Masuk
                </h3>
                <div className="text-xs text-stone-400">
                  Menunggu semua siswa siap di lobi arena
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <span className="text-2xl font-black text-white">
                {playersList.length}
              </span>
              <span className="text-xs text-stone-400 uppercase font-bold tracking-wider">
                Siswa
              </span>
            </div>
          </div>

          {/* Empty State vs Student Chips */}
          <div className="flex-1 py-6">
            {playersList.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-stone-500 space-y-3">
                <div className="text-5xl animate-bounce">⏳</div>
                <div className="text-sm font-bold text-stone-400">
                  Belum ada siswa yang masuk ke room ini
                </div>
                <div className="text-xs text-stone-500 max-w-sm">
                  Bagikan kode PIN di samping atau tayangkan QR code agar siswa segera bergabung.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto pr-2">
                {playersList.map((player) => (
                  <div
                    key={player.id}
                    className="group relative bg-[#1c1929] hover:bg-[#232034] border border-white/10 hover:border-red-500/40 rounded-2xl p-3.5 flex flex-col items-center text-center transition-all shadow-md animate-in fade-in zoom-in-95 duration-200"
                  >
                    {/* Kick Button on Hover */}
                    <button
                      onClick={() => handleKickPlayer(player.id)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-400 transition-opacity"
                      title="Keluarkan dari lobi"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    {/* Avatar Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-stone-800 border border-white/10 flex items-center justify-center text-2xl mb-2 shadow-inner group-hover:scale-110 transition-transform">
                      {player.avatar?.emoji || '👨‍🎓'}
                    </div>

                    {/* Nickname */}
                    <div className="text-xs font-black text-white truncate w-full">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Siap</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Room ID: <strong className="text-stone-300 font-mono">{room?.roomId}</strong></span>
            </div>
            <div>
              {playersList.length > 0 ? (
                <span className="text-emerald-400 font-bold">
                  ✓ {playersList.length} siswa siap bertanding di arena
                </span>
              ) : (
                <span>Menunggu koneksi pertama...</span>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Bottom Footer Note */}
      <footer className="px-8 py-3 bg-[#0d0c14] border-t border-white/5 text-center text-[11px] text-stone-500">
        Irodori Arena • Platform Gamifikasi & Administrasi LPK Bahasa Jepang • Japan Foundation Standard
      </footer>

    </div>
  );
}
