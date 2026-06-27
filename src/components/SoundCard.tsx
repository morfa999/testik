import React from 'react';
import { UserSound } from '../store/useStore';
import { PlayIcon, PauseIcon, DownloadIcon } from './Icons';
import WaveformVisualizer from './WaveformVisualizer';

interface SoundCardProps {
  sound: UserSound; isPlaying: boolean; playProgress: number; currentTime: number;
  onTogglePlay: () => void; onSeek: (progress: number) => void;
  onDownloadClick: () => void; onPremiumClick?: () => void; animationDelay: number;
  hasPremiumAccess?: boolean;
  audioElement?: HTMLAudioElement | null;
}

const LockIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const SoundCard: React.FC<SoundCardProps> = ({ sound, isPlaying, playProgress, currentTime, onTogglePlay, onSeek, onDownloadClick, onPremiumClick, animationDelay, hasPremiumAccess = false, audioElement }) => {
  const fmtDl = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const isPremium = !sound.isFree;

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-4 transition-all opacity-0 animate-fade-in-up ${isPlaying ? 'border-[#0A0A0A]/15 shadow-[0_4px_20px_rgba(0,0,0,0.07)]' : 'border-[#EBEBEB] hover:border-[#D4D4D4] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]'}`}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={onTogglePlay}
          disabled={!sound.fileData}
          className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${!sound.fileData ? 'bg-[#F3F3F3] text-[#C0C0C0] cursor-not-allowed' : isPlaying ? 'bg-[#0A0A0A] text-white shadow-lg shadow-black/15' : 'bg-[#F3F3F3] text-[#0A0A0A] hover:bg-[#E8E8E8] group-hover:bg-[#E5E5E5]'}`}
        >
          {isPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-semibold text-[#0A0A0A] truncate leading-tight">{sound.title}</span>
            {sound.isNew && (
              <span className="shrink-0 px-1.5 py-0.5 bg-[#0A0A0A] text-white text-[8px] font-bold uppercase tracking-[0.08em] rounded-[3px]">New</span>
            )}
            {isPremium && (
              <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-bold uppercase tracking-[0.08em] rounded-[3px]">PRO</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#B0B0B0]">
            <span className="font-medium text-[#6B6B6B]">{sound.category}</span>
            {sound.tags.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate">{sound.tags.slice(0, 2).join(', ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <WaveformVisualizer
          waveform={sound.waveform}
          progress={isPlaying ? playProgress : 0}
          onSeek={onSeek}
          height={40}
          isPlaying={isPlaying}
          audioElement={audioElement}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-[#B0B0B0]">
          <span className="tabular-nums font-medium text-[11px]">{isPlaying ? fmtTime(currentTime) : sound.duration}</span>
          {(sound.plays || 0) > 0 && (
            <>
              <span className="text-[#C0C0C0]">·</span>
              <span className="tabular-nums">{fmtDl(sound.plays || 0)} пр.</span>
            </>
          )}
          {sound.downloads > 0 && (
            <>
              <span className="text-[#C0C0C0]">·</span>
              <span className="tabular-nums">{fmtDl(sound.downloads)} скач.</span>
            </>
          )}
          <span className="text-[#C0C0C0]">·</span>
          <span className="text-[#999] font-medium truncate max-w-[100px]">{sound.authorName}</span>
        </div>
        {isPremium && !hasPremiumAccess ? (
          <button
            onClick={onPremiumClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all bg-[#E5E5E5] text-[#999] hover:bg-[#D4D4D4]"
          >
            <LockIcon size={11} />Premium
          </button>
        ) : (
          <button
            onClick={onDownloadClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all bg-[#0A0A0A] text-white hover:bg-[#1A1A1A]"
          >
            <DownloadIcon size={11} />Скачать
          </button>
        )}
      </div>
    </div>
  );
};

export default SoundCard;
