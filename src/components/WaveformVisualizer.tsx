import React, { useRef, useCallback, useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  waveform: number[];
  progress: number;
  isPlaying?: boolean;
  onSeek: (progress: number) => void;
  height?: number;
  barWidth?: number;
  barGap?: number;
  audioElement?: HTMLAudioElement | null;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  waveform, progress, isPlaying, onSeek, height = 48, audioElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [liveData, setLiveData] = useState<number[] | null>(null);

  const totalBars = waveform.length;

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, [onSeek]);

  // Подключаем AnalyserNode к audio элементу
  useEffect(() => {
    if (!isPlaying || !audioElement) {
      setLiveData(null);
      return;
    }
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      if (!sourceRef.current || (sourceRef.current as any).mediaElement !== audioElement) {
        if (sourceRef.current) {
          try { sourceRef.current.disconnect(); } catch {}
        }
        sourceRef.current = ctx.createMediaElementSource(audioElement);
        sourceRef.current.connect(ctx.destination);
      }
      
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 128;
      }
      sourceRef.current.connect(analyserRef.current);
    } catch (e) {
      console.warn('Failed to setup analyser:', e);
    }
    
    return () => {
      if (sourceRef.current && analyserRef.current) {
        try { sourceRef.current.disconnect(analyserRef.current); } catch {}
      }
    };
  }, [isPlaying, audioElement]);

  // Анимация реального времени
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Преобразуем частотные данные в бары (60 баров)
      const bars: number[] = [];
      const step = Math.floor(bufferLength / totalBars) || 1;
      for (let i = 0; i < totalBars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j] || 0;
        }
        bars.push(sum / step / 255); // нормализуем 0-1
      }
      setLiveData(bars);
      animationRef.current = requestAnimationFrame(tick);
    };
    
    animationRef.current = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, totalBars]);

  // Рисуем на canvas для плавности
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const barW = w / totalBars;
    
    ctx.clearRect(0, 0, w, h);
    
    for (let i = 0; i < totalBars; i++) {
      // Используем liveData если играет, иначе waveform (статический)
      const value = isPlaying && liveData ? liveData[i] : waveform[i];
      const barHeight = Math.max(2, value * h * 0.88);
      const x = i * barW;
      const y = (h - barHeight) / 2;
      const isPast = (i / totalBars) <= progress;
      
      ctx.fillStyle = isPast ? '#0A0A0A' : '#DCDCDC';
      ctx.globalAlpha = isPast ? 0.9 : 0.5;
      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(1, barW - 0.5), barHeight, barW / 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [waveform, progress, isPlaying, liveData, totalBars]);

  return (
    <div ref={containerRef} className="cursor-pointer group relative select-none" onClick={handleClick} style={{ height, width: '100%' }}>
      <canvas ref={canvasRef} width="100%" height={height} className="block" />
    </div>
  );
};

export default WaveformVisualizer;
