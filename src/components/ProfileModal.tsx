import React, { useState } from 'react';
import { CloseIcon } from './Icons';
import { User, UserSound } from '../store/useStore';

interface ProfileModalProps {
  isOpen: boolean; onClose: () => void; user: User;
  onUpdateName: (name: string) => void; onLogout: () => void;
  userSounds?: UserSound[];
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateName, onLogout, userSounds = [] }) => {
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);
  const [tab, setTab] = useState<'info' | 'music'>('info');

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (nameVal.trim() && nameVal.trim() !== user.name) onUpdateName(nameVal.trim());
    setEditName(false);
  };

  const subLabel = user.subscription === 'none' ? 'Free' : user.subscription === 'hd' ? 'Sound HD' : 'Sound Ultra';
  const subColor = user.subscription === 'none' ? 'bg-[#F3F3F3] text-[#999]' : user.subscription === 'hd' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/20 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/8 animate-scale-in p-6 my-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-[#B0B0B0] hover:text-[#0A0A0A] transition-colors"><CloseIcon size={18} /></button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: user.avatarColor }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editName ? (
              <div className="flex items-center gap-2">
                <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditName(false); setNameVal(user.name); } }}
                  className="flex-1 px-2 py-1 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-all" />
                <button onClick={handleSaveName} className="px-2 py-1 text-[11px] font-semibold bg-[#0A0A0A] text-white rounded-lg">OK</button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-[#0A0A0A] truncate">{user.name}</span>
                <button onClick={() => setEditName(true)} className="p-0.5 text-[#B0B0B0] hover:text-[#0A0A0A] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
              </div>
            )}
            <div className="text-[11px] text-[#999] truncate">{user.email}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-[#EBEBEB]">
          <button onClick={() => setTab('info')} className={`relative pb-2 text-[13px] font-medium transition-all ${tab === 'info' ? 'text-[#0A0A0A]' : 'text-[#999] hover:text-[#6B6B6B]'}`}>
            Информация
            {tab === 'info' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] rounded-full" />}
          </button>
          <button onClick={() => setTab('music')} className={`relative pb-2 text-[13px] font-medium transition-all ${tab === 'music' ? 'text-[#0A0A0A]' : 'text-[#999] hover:text-[#6B6B6B]'}`}>
            Моя музыка ({userSounds.length})
            {tab === 'music' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] rounded-full" />}
          </button>
        </div>

        {tab === 'info' ? (
          <>
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#F8F8F8] rounded-xl">
                <span className="text-[12px] text-[#6B6B6B]">Подписка</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${subColor}`}>{subLabel}</span>
              </div>
              {user.subscription !== 'none' && (
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#F8F8F8] rounded-xl">
                  <span className="text-[12px] text-[#6B6B6B]">Скачиваний в месяц</span>
                  <span className="text-[11px] font-semibold text-[#0A0A0A]">{user.monthlyDownloads}{user.subscription === 'hd' ? '/50' : ''}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#F8F8F8] rounded-xl">
                <span className="text-[12px] text-[#6B6B6B]">Аккаунт создан</span>
                <span className="text-[11px] font-medium text-[#999]">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
            <button onClick={() => { onLogout(); onClose(); }} className="w-full py-2.5 border border-[#E5E5E5] text-[13px] font-semibold text-[#6B6B6B] rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
              Выйти из аккаунта
            </button>
          </>
        ) : (
          <div className="space-y-2">
            {userSounds.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-[#999] mb-1">Вы еще не загрузили звуки</p>
                <p className="text-[11px] text-[#C0C0C0]">Нажмите "Загрузить" чтобы добавить первый трек</p>
              </div>
            ) : (
              userSounds.map((sound, i) => (
                <div key={sound.id} className="flex items-center gap-3 p-3 bg-[#F8F8F8] rounded-xl" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#0A0A0A] truncate">{sound.title}</div>
                    <div className="text-[10px] text-[#999]">{sound.category} · {sound.downloads} скач. · {sound.duration}</div>
                  </div>
                  {!sound.isFree && <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-bold uppercase tracking-[0.08em] rounded-[3px]">PRO</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
