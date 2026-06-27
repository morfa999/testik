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
    
    const newPosition = Math.max(0, Math.min(clientX - startXRef.current, container.offsetWidth - 50));
    setPosition(newPosition);

    // Проверка достижения конца
    if (newPosition >= container.offsetWidth - 60) {
      setIsVerified(true);
      setIsDragging(false);
      setPosition(container.offsetWidth - 50);
    }
  };

  const handleEnd = () => {
    if (isVerified) return;
    setIsDragging(false);
    // Если не дотянули до конца - возврат
    const container = containerRef.current;
    if (container && position < container.offsetWidth - 60) {
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

  const progress = containerRef.current ? (position / (containerRef.current.offsetWidth - 50)) * 100 : 0;

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-[#0A0A0A] mb-2">Подтвердите, что вы не бот</p>
      <div 
        ref={containerRef}
        className={`relative h-12 rounded-xl overflow-hidden ${isVerified ? 'bg-emerald-500' : 'bg-[#F0F0F0]'} select-none transition-colors`}
      >
        {/* Progress track */}
        <div 
          className={`absolute left-0 top-0 h-full transition-all ${isVerified ? 'bg-emerald-600' : 'bg-[#E0E0E0]'}`}
          style={{ width: `${position + 50}px` }}
        />
        
        {/* Text */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ 
            opacity: isVerified ? 0 : Math.max(0.3, 1 - progress / 100),
            transition: 'opacity 0.2s'
          }}
        >
          <span className="text-[12px] font-medium text-[#999]">
            {isVerified ? '' : 'Перетащите вправо'}
          </span>
        </div>

        {/* Success text */}
        {isVerified && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[12px] font-bold text-white">Почти получилось!</span>
          </div>
        )}

        {/* Dragging text - follows slider */}
        {!isVerified && position > 10 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
            style={{ 
              left: `${Math.max(8, position - 90)}px`,
              opacity: Math.min(1, position / 50)
            }}
          >
            <span className="text-[11px] font-semibold text-[#6B6B6B]">Почти получилось!</span>
          </div>
        )}

        {/* Slider button */}
        <div
          className={`absolute top-1 left-0 w-[50px] h-[calc(100%-8px)] rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${
            isVerified ? 'bg-white' : 'bg-white shadow-md'
          }`}
          style={{ 
            left: `${position}px`,
            transform: isDragging ? 'scale(1.05)' : 'scale(1)'
          }}
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        >
          {isVerified ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
