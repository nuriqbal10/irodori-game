'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, RotateCcw, Eye, EyeOff, Gauge } from 'lucide-react';

interface AudioListeningPlayerProps {
  src: string;
  label?: string;
  transcript?: string;
  maxPlays?: number;
  autoPlay?: boolean;
}

export default function AudioListeningPlayer({
  src,
  label = 'Audio Chōkai Irodori',
  transcript,
  maxPlays = 3,
  autoPlay = false,
}: AudioListeningPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (playCount >= maxPlays) {
        // Replay limit reached
        return;
      }
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setPlayCount(c => c + 1);
      }).catch(err => {
        console.error('Audio playback error (user gesture required):', err);
      });
    }
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1.0 ? 0.8 : 1.0;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);

  const playsRemaining = Math.max(0, maxPlays - playCount);

  return (
    <div className="p-4 rounded-2xl bg-[#121019] border border-white/10 space-y-3 max-w-md mx-auto">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 font-bold text-purple-400">
          <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-purple-300' : ''}`} />
          <span className="truncate max-w-[200px]">{label}</span>
        </div>

        {/* Plays counter badge */}
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
          playsRemaining > 0 
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
            : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          Sisa Putar: {playsRemaining}x
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={playsRemaining === 0 && !isPlaying}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all ${
            isPlaying
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
              : playsRemaining > 0
              ? 'game-btn-primary'
              : 'opacity-40 bg-stone-800 text-stone-500 cursor-not-allowed'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlaying ? 'Jeda Audio' : 'Putar Audio Chōkai'}</span>
        </button>

        {/* Speed Toggle (1.0x / 0.8x) */}
        <button
          onClick={toggleSpeed}
          className="px-3 py-2.5 rounded-xl bg-[#1e1b29] hover:bg-[#282436] text-stone-300 border border-white/5 text-xs font-black flex items-center space-x-1"
          title="Ubah kecepatan (1.0x Normal / 0.8x Lambat untuk pemula)"
        >
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span>{playbackRate === 1.0 ? '1.0x' : '0.8x'}</span>
        </button>

        {/* Transcript Toggle */}
        {transcript && (
          <button
            onClick={() => setShowTranscript(s => !s)}
            className="p-2.5 rounded-xl bg-[#1e1b29] hover:bg-[#282436] text-stone-300 border border-white/5"
            title="Lihat transkrip teks"
          >
            {showTranscript ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Transcript Reveal */}
      {showTranscript && transcript && (
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-stone-300 animate-in fade-in space-y-1">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Transkrip Percakapan:
          </div>
          <p className="leading-relaxed font-sans">{transcript}</p>
        </div>
      )}
    </div>
  );
}
