import React, { useState } from 'react';
import { CloseIcon, TrashIcon } from './Icons';
import { User, UserSound } from '../store/useStore';
import { useNotify } from '../notify';

interface ProfileModalProps {
  isOpen: boolean; onClose: () => void; user: User;
  onUpdateName: (name: string) => void; onLogout: () => void;
  userSounds?: UserSound[];
  onDeleteSound?: (id: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateName, onLogout, userSounds = [], onDeleteSound }) => {
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);
  const [tab, setTab] = useState<'info' | 'music'>('info');
  const { success, error: notifyError } = useNotify();

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (nameVal.trim() && nameVal.trim() !== user.name) onUpdateName(nameVal.trim());
    setEditName(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!onDeleteSound) return;
    if (!confirm(`Удалить звук "${title}"?`)) return;
    try {
      await onDeleteSound(id);
      success('Звук удалён');
    } catch (e) {
      notifyError('Ошибка при удалении');
    }
  };

  const subLabel = user.subscription === 'none' ? 'Free' : user.subscription === 'hd' ? 'Sound HD' : 'Sound Ultra';
  const subColor = user.subscription === 'none' ? 'bg-[#F3F3F3] text-[#999]' : user.subscription === 'hd' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

  const isDirector = user.email === 'energoferon41@gmail.com';
  const isAdmin = (user as any).isAdmin === true;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/20 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/8 animate-scale-in p-6 my-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-[#B0B0B0] hover:text-[#0A0A0A] transition-colors"><CloseIcon size={18} /></button>
        
        <div className="flex items-start gap-3 mb-4 pr-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: user.avatarColor }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {editName ? (
                <input 
                  autoFocus 
                  value={nameVal} 
                  onChange={e => setNameVal(e.target.value)} 
                  onBlur={handleSaveName}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditName(false); setNameVal(user.name); } }}
                  style={{ width: `${Math.max(nameVal.length + 1, 3)}ch` }}
                  className="px-2 py-1 bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg text-[15px] font-bold text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-all" 
                />
              ) : (
                <span 
                  className="text-[15px] font-bold text-[#0A0A0A] truncate cursor-pointer hover:opacity-70 transition-opacity" 
                  onClick={() => setEditName(true)} 
                  title="Нажмите чтобы редактировать"
                >
                  {user.name}
                </span>
              )}
              {isDirector ? (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#0A0A0A] text-white px-2 py-0.5 rounded">Директор</span>
              ) : isAdmin ? (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded">Администратор</span>
              ) : null}
            </div>
            <div className="text-[11px] text-[#999] truncate mt-0.5">{user.email}</div>
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
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#F8F8F8] rounded-xl">
                <span className="text-[12px] text-[#6B6B6B]">Скачиваний в этом месяце</span>
                <span className="text-[11px] font-semibold text-[#0A0A0A] tabular-nums">
                  {user.monthlyDownloads || 0}
                  {user.subscription === 'hd' ? '/50' : user.subscription === 'ultra' ? ' ∞' : ''}
                </span>
              </div>
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
              userSounds.map((sound) => (
                <div key={sound.id} className="flex items-center gap-3 p-3 bg-[#F8F8F8] rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#0A0A0A] truncate">{sound.title}</div>
                    <div className="text-[10px] text-[#999]">
                      {sound.category} · {sound.downloads} скач. · {sound.plays || 0} пр. · {sound.duration}
                    </div>
                  </div>
                  {!sound.isFree && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-bold uppercase tracking-[0.08em] rounded-[3px]">
                      PRO
                    </span>
                  )}
                  {onDeleteSound && (
                    <button
                      onClick={() => handleDelete(sound.id, sound.title)}
                      className="shrink-0 p-2 text-[#999] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Удалить звук"
                    >
                      <TrashIcon size={14} />
                    </button>
                  )}
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
