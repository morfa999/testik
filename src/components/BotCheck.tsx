import { useState, useRef, useEffect } from 'react';

interface Props { onVerify: (token: string) => void; }

export default function BotCheck({ onVerify }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  useEffect(() => {
    if (isVerified) {
      onVerify('slider_verified_' + Date.now().toString(36));
    }
  }, [isVerified, onVerify]);

  const handleStart = (clientX: number) => {
    if (isVerified) return;
    setIsDragging(true);
    startXRef.current = clientX - position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isVerified) return;
    const container = containerRef.current;
    if (!container) return;
    
    const newPosition = Math.max(0, Math.min(clientX - startXRef.current, container.offsetWidth - 48));
    setPosition(newPosition);

    if (newPosition >= container.offsetWidth - 58) {
      setIsVerified(true);
      setIsDragging(false);
      setPosition(container.offsetWidth - 48);
    }
  };

  const handleEnd = () => {
    if (isVerified) return;
    setIsDragging(false);
    const container = containerRef.current;
    if (container && position < container.offsetWidth - 58) {
      setPosition(0);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, position]);

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-[#0A0A0A] mb-2">Подтвердите, что вы не бот</p>
      <div 
        ref={containerRef}
        className={`relative h-11 rounded-xl overflow-hidden select-none transition-colors ${isVerified ? 'bg-emerald-500' : 'bg-[#F0F0F0]'}`}
      >
        {/* Progress track */}
        <div 
          className={`absolute left-0 top-0 h-full transition-all ${isVerified ? 'bg-emerald-600' : 'bg-[#E0E0E0]'}`}
          style={{ width: `${position + 48}px` }}
        />
        
        {/* Static text */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none pl-12"
        >
          <span className={`text-[12px] font-semibold transition-opacity ${isVerified ? 'text-white opacity-100' : 'text-[#999] opacity-100'}`}>
            {isVerified ? 'Подтверждено' : 'Перетащите вправо →'}
          </span>
        </div>

        {/* Slider button - with 6px left margin (на 3px меньше чем было) */}
        <div
          className={`absolute top-1 w-[44px] h-[calc(100%-8px)] rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${
            isVerified ? 'bg-white' : 'bg-white shadow-md'
          }`}
          style={{ 
            left: `${6 + position}px`,
            transform: isDragging ? 'scale(1.05)' : 'scale(1)'
          }}
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        >
          {/* Стрелка без всяких галочек */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </div>
  );
}
