import React from 'react';
import { User } from '../store/useStore';

const ADMIN_EMAIL = 'energoferon41@gmail.com';

const BellIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);

// SVG иконки для мобильной версии (без фона, без текста)
const UploadIconMobile: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const ShieldIconMobile: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const CrownIconMobile: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l10 4 10-4-10-4L2 8z" /><path d="M12 16V8" /><path d="M22 20H2l2-12 8 4 8-4 2 12z" /></svg>
);
const SupportIconMobile: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const HomeIconMobile: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
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
          <img src="/images/logov.png" alt="KITSTUDIO" className="h-7 w-auto object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
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

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between h-[56px] px-4">
        <button onClick={onGoHome} className="flex items-center gap-2">
          <img src="/images/logov.png" alt="KITSTUDIO" className="h-6 w-auto object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          <span className="text-[14px] font-extrabold tracking-[-0.02em] text-[#0A0A0A]">KITSTUDIO</span>
        </button>
        <div className="flex items-center gap-1">
          {user ? (
            <>
              {onOpenNotifications && (
                <button onClick={onOpenNotifications} className="relative p-2 text-[#6B6B6B]">
                  <BellIcon size={18} />
                  {(unreadCount || 0) > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              )}
              <button onClick={onOpenProfile} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold ml-1" style={{ backgroundColor: user.avatarColor }}>{initial}</button>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} className="px-3 py-1.5 text-[12px] font-medium text-[#525252]">Войти</button>
              <button onClick={() => onOpenAuth('register')} className="px-4 py-1.5 bg-[#0A0A0A] text-white text-[12px] font-semibold rounded-lg">Начать</button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar - SVG icons */}
      <div className="md:hidden border-t border-[#EBEBEB] bg-[#FAFAFA]">
        <div className="flex items-center justify-around h-[52px] px-2">
          <button onClick={onGoHome} className="flex flex-col items-center justify-center gap-0.5 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors p-2" title="Главная">
            <HomeIconMobile size={22} />
          </button>
          {onOpenSupport && (
            <button onClick={onOpenSupport} className="flex flex-col items-center justify-center gap-0.5 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors p-2" title="Тех.поддержка">
              <SupportIconMobile size={22} />
            </button>
          )}
          {onOpenPremium && (
            <button onClick={onOpenPremium} className="flex flex-col items-center justify-center gap-0.5 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors p-2" title="Подписка">
              <CrownIconMobile size={22} />
            </button>
          )}
          {user && (
            <button onClick={onOpenAddSound} className="flex flex-col items-center justify-center gap-0.5 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors p-2" title="Загрузить">
              <UploadIconMobile size={22} />
            </button>
          )}
          {isAdmin && onOpenAdmin && user && (
            <button onClick={onOpenAdmin} className="flex flex-col items-center justify-center gap-0.5 text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors p-2" title="Админ меню">
              <ShieldIconMobile size={22} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
