import React from 'react';
import { User } from '../store/useStore';

const ADMIN_EMAIL = 'energoferon41@gmail.com';

const BellIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);

// SVG иконки для мобильной верхней панели (без фона)
const UploadIconMobile: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const ShieldIconMobile: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const CrownIconMobile: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 17l2-9 5 4 2-7 2 7 5-4 2 9z" />
    <path d="M3 17v3h18v-3" />
    <circle cx="5" cy="8" r="1.2" fill="currentColor" />
    <circle cx="12" cy="5" r="1.2" fill="currentColor" />
    <circle cx="19" cy="8" r="1.2" fill="currentColor" />
  </svg>
);
const SupportIconMobile: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void; user: User | null; onOpenProfile: () => void;
  onOpenAddSound: () => void; onOpenAdmin?: () => void; onOpenNotifications?: () => void; unreadCount?: number;
  onOpenSupport?: () => void; onOpenPremium?: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth, user, onOpenProfile, onOpenAddSound, onOpenAdmin, onOpenNotifications, onOpenSupport, onOpenPremium, unreadCount, onGoHome }) => {
  const initial = user ? user.name.charAt(0).toUpperCase() : '';
  const isAdmin = user?.email === ADMIN_EMAIL || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA] border-b border-[#EBEBEB]">
      {/* Desktop */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 h-[56px] items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/images/logov.png" alt="KITSTUDIO" className="h-9 w-auto object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          <span className="text-[16px] font-extrabold tracking-[-0.02em] text-[#0A0A0A]">KITSTUDIO</span>
        </button>
        
        <nav className="flex items-center gap-3 h-full">
          {onOpenSupport && (
            <button onClick={onOpenSupport} className="relative group h-full flex items-center px-3 text-[13px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
              Тех.поддержка
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
            </button>
          )}
          {onOpenPremium && (
            <button onClick={onOpenPremium} className="relative group h-full flex items-center px-3 text-[13px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
              Подписка
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
            </button>
          )}
          {user && (
            <>
              <button onClick={onOpenAddSound} className="relative group h-full flex items-center px-3 text-[13px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
                Загрузить
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
              </button>
              {isAdmin && onOpenAdmin && (
                <button onClick={onOpenAdmin} className="relative group h-full flex items-center px-3 text-[13px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
                  Админ меню
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                </button>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {onOpenNotifications && (
                <button onClick={onOpenNotifications} className="relative p-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors">
                  <BellIcon size={16} />
                  {(unreadCount || 0) > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              )}
              <button onClick={onOpenProfile} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold transition-transform hover:scale-105" style={{ backgroundColor: user.avatarColor }}>{initial}</button>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} className="px-4 py-2 text-[13px] font-medium text-[#525252] hover:text-[#0A0A0A] transition-colors rounded-lg hover:bg-[#F0F0F0]">Войти</button>
              <button onClick={() => onOpenAuth('register')} className="px-5 py-2 bg-[#0A0A0A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A1A1A] transition-all active:scale-[0.97]">Начать</button>
            </>
          )}
        </div>
      </div>

      {/* Mobile - только верхняя панель, без нижней */}
      <div className="md:hidden flex items-center justify-between h-[56px] px-3 gap-1">
        <button onClick={onGoHome} className="flex items-center gap-2 shrink-0">
          <img src="/images/logov.png" alt="KITSTUDIO" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          <span className="text-[14px] font-extrabold tracking-[-0.02em] text-[#0A0A0A]">KITSTUDIO</span>
        </button>
        <div className="flex items-center gap-0.5">
          {/* SVG иконки в верхней панели (без фона) */}
          {onOpenSupport && (
            <button onClick={onOpenSupport} className="p-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors" title="Тех.поддержка">
              <SupportIconMobile size={20} />
            </button>
          )}
          {onOpenPremium && (
            <button onClick={onOpenPremium} className="p-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors" title="Подписка">
              <CrownIconMobile size={20} />
            </button>
          )}
          {user && (
            <button onClick={onOpenAddSound} className="p-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors" title="Загрузить">
              <UploadIconMobile size={20} />
            </button>
          )}
          {/* Админ иконка только если есть права */}
          {isAdmin && onOpenAdmin && user && (
            <button onClick={onOpenAdmin} className="p-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors" title="Админ меню">
              <ShieldIconMobile size={20} />
            </button>
          )}
          {/* Колокольчик уведомлений - левее аватара */}
          {onOpenNotifications && (
            <button onClick={onOpenNotifications} className="relative p-2 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors" title="Уведомления">
              <BellIcon size={18} />
              {(unreadCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          )}
          {user ? (
            <button onClick={onOpenProfile} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold ml-1 shrink-0" style={{ backgroundColor: user.avatarColor }}>{initial}</button>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} className="px-2.5 py-1.5 text-[12px] font-medium text-[#525252]">Войти</button>
              <button onClick={() => onOpenAuth('register')} className="px-3 py-1.5 bg-[#0A0A0A] text-white text-[12px] font-semibold rounded-lg">Начать</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
