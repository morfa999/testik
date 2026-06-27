import React from 'react';
import { User } from '../store/useStore';

const ADMIN_EMAIL = 'energoferon41@gmail.com';

const BellIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void; user: User | null; onOpenProfile: () => void;
  onOpenAddSound: () => void; onOpenAdmin?: () => void; onOpenNotifications?: () => void; unreadCount?: number;
  onOpenSupport?: () => void; onOpenPremium?: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth, user, onOpenProfile, onOpenAddSound, onOpenAdmin, onOpenNotifications, onOpenSupport, onOpenPremium, unreadCount, onGoHome }) => {
  const initial = user ? user.name.charAt(0).toUpperCase() : '';
  const isAdmin = user?.email === ADMIN_EMAIL || user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA] border-b border-[#EBEBEB]">
      <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🎵</span>
          <span className="text-[16px] font-extrabold tracking-[-0.02em] text-[#0A0A0A]">KITSTUDIO</span>
        </button>
        
        <nav className="hidden md:flex items-center gap-3 h-full">
          {/* Кнопки для всех */}
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
          
          {/* Кнопки только для залогиненных */}
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
              <button onClick={() => onOpenAuth('login')} className="hidden sm:flex px-4 py-2 text-[13px] font-medium text-[#525252] hover:text-[#0A0A0A] transition-colors rounded-lg hover:bg-[#F0F0F0]">Войти</button>
              <button onClick={() => onOpenAuth('register')} className="px-5 py-2 bg-[#0A0A0A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1A1A1A] transition-all active:scale-[0.97]">Начать</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
