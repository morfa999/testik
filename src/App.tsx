import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import SortSelect from './components/SortSelect';
import SoundCard from './components/SoundCard';
import ListSoundCard from './components/ListSoundCard';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AddModal from './components/AddModal';
import ProfileModal from './components/ProfileModal';
import PremiumModal from './components/PremiumModal';
import DownloadModal from './components/DownloadModal';
import CookieBanner from './components/CookieBanner';
import AdminPanel from './components/AdminPanel';
import SupportModal from './components/SupportModal';
import NotificationsDropdown from './components/NotificationsDropdown';
import { FilterIcon, GridIcon, ListIcon, WaveformIcon } from './components/Icons';
import { categories, sortOptions, SoundCategory } from './data/sounds';
import { useStore, UserSound } from './store/useStore';
import { useNotify } from './notify';
import { PageKey } from './data/content';
import ContentPage from './components/ContentPage';
import Pagination from './components/Pagination';

type ViewMode = 'grid' | 'list';
const TWELVE_HOURS = 12 * 60 * 60 * 1000;
const ADMIN_EMAIL = 'energoferon41@gmail.com';
const ITEMS_PER_PAGE = 9;

const App: React.FC = () => {
  const store = useStore();
  const { success: notifySuccess, info: notifyInfo } = useNotify();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Периодически проверяем обновления currentUser (для отображения новых прав админа)
  useEffect(() => {
    if (!store.currentUser) return;
    const interval = setInterval(() => {
      store.refreshCurrentUser();
    }, 30000); // каждые 30 секунд
    return () => clearInterval(interval);
  }, [store.currentUser?.id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadSound, setDownloadSound] = useState<UserSound | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contentPage, setContentPage] = useState<PageKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const openAuth = useCallback((mode: 'login' | 'register') => { setAuthMode(mode); setAuthOpen(true); }, []);
  const handleGoHome = useCallback(() => {
    setSearchQuery(''); setSelectedCategory('All'); setSortBy('newest'); setShowOnlyFree(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAdmin = (store.currentUser as any)?.isAdmin === true || store.currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const hasPremiumAccess = isAdmin || (store.currentUser?.subscription === 'hd') || (store.currentUser?.subscription === 'ultra');
  const allSounds = store.allSounds;

  const soundsWithNewFlag = useMemo(() => {
    const now = Date.now();
    return allSounds.map(s => ({ ...s, isNew: (now - new Date(s.dateAdded).getTime()) < TWELVE_HOURS }));
  }, [allSounds]);

  const categoryCounts = useMemo(() => {
    const c: Record<SoundCategory, number> = { All: soundsWithNewFlag.length, Drums: 0, Melodies: 0, '808s': 0, FX: 0, Vocals: 0, Loops: 0, 'Готовые биты': 0 };
    soundsWithNewFlag.forEach(s => { const cat = s.category as SoundCategory; if (cat in c && cat !== 'All') c[cat]++; });
    return c;
  }, [soundsWithNewFlag]);

  const filteredSounds = useMemo(() => {
    let r = [...soundsWithNewFlag];
    if (selectedCategory !== 'All') r = r.filter(s => s.category === selectedCategory);
    if (showOnlyFree) r = r.filter(s => s.isFree);
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase().trim(); r = r.filter(s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)) || s.authorName.toLowerCase().includes(q)); }
    switch (sortBy) {
      case 'newest': r.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); break;
      case 'downloads': r.sort((a, b) => ((b.plays || 0) + b.downloads) - ((a.plays || 0) + a.downloads)); break;
      case 'name': r.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return r;
  }, [soundsWithNewFlag, selectedCategory, searchQuery, sortBy, showOnlyFree]);

  // Сброс страницы при смене фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, showOnlyFree]);

  const totalPages = Math.ceil(filteredSounds.length / ITEMS_PER_PAGE);
  const pagedSounds = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSounds.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSounds, currentPage]);

  useEffect(() => {
    if (!playingId) { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setPlayProgress(0); setCurrentTime(0); return; }
    const sound = allSounds.find(s => s.id === playingId);
    if (!sound || !sound.fileData) { setPlayingId(null); return; }
    
    const audio = new Audio(); 
    audioRef.current = audio;
    
    let playCountIncremented = false;
    
    const onLoaded = () => {
      // Запускаем воспроизведение только после загрузки метаданных
      audio.play().catch((e) => { 
        console.warn('Audio play failed:', e);
        // Не сбрасываем playingId если просто нужно ждать взаимодействия
      });
    };
    
    const up = () => { 
      if (audio.duration && isFinite(audio.duration)) { 
        const progress = audio.currentTime / audio.duration;
        setPlayProgress(progress); 
        setCurrentTime(audio.currentTime); 
        
        // Инкремент прослушиваний при достижении 100% 
        if (progress >= 0.99 && !playCountIncremented) {
          playCountIncremented = true;
          fetch(`/api/sounds/${playingId}/play`, { method: 'POST' }).catch(() => {});
        }
      } 
    };
    const end = () => { setPlayingId(null); setPlayProgress(0); setCurrentTime(0); };
    const onError = (e: any) => {
      console.error('Audio error:', e);
      // Только если реальная ошибка, не сбрасываем на паузе
      if (audio.error && audio.error.code !== 0) {
        // Попробуем дать пользователю второй шанс
        setTimeout(() => {
          if (audioRef.current === audio && playingId) {
            audio.load();
            audio.play().catch(() => {});
          }
        }, 100);
      }
    };
    
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('canplay', onLoaded);
    audio.addEventListener('timeupdate', up); 
    audio.addEventListener('ended', end);
    audio.addEventListener('error', onError);
    
    // Устанавливаем src после подписки на события
    try {
      audio.src = sound.fileData;
      audio.load();
    } catch (e) {
      console.error('Audio src error:', e);
    }
    
    return () => { 
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('canplay', onLoaded);
      audio.removeEventListener('timeupdate', up); 
      audio.removeEventListener('ended', end);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [playingId, allSounds]);

  const togglePlay = useCallback((id: string) => { setPlayingId(p => p === id ? null : id); if (playingId !== id) { setPlayProgress(0); setCurrentTime(0); } }, [playingId]);
  const handleSeek = useCallback((p: number) => { if (audioRef.current?.duration) { audioRef.current.currentTime = p * audioRef.current.duration; setPlayProgress(p); setCurrentTime(audioRef.current.currentTime); } }, []);
  const handleDownloadClick = useCallback((s: UserSound) => { setDownloadSound(s); setDownloadOpen(true); }, []);
  const handleDownload = useCallback((id: string, format: string) => { store.downloadSound(id, format); notifySuccess(`Скачивание в ${format.toUpperCase()}`); }, [store, notifySuccess]);

  const handleAddSound = useCallback(async (data: Parameters<typeof store.addSound>[0]) => {
    const result = await store.addSound(data);
    if (result.ok) {
      if (result.pending) notifyInfo('Звук отправлен на модерацию');
      else notifySuccess('Звук добавлен');
    }
    return result;
  }, [store, notifySuccess, notifyInfo]);

  const pluralize = (n: number) => { if (n % 10 === 1 && n % 100 !== 11) return 'звук'; if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'звука'; return 'звуков'; };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="relative">
        <Header
          onOpenAuth={openAuth}
          user={store.currentUser}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenAddSound={() => { if (!store.currentUser) { openAuth('register'); return; } setAddOpen(true); }}
          onOpenAdmin={() => setAdminOpen(true)}
          onOpenNotifications={() => setNotifOpen(!notifOpen)}
          onOpenSupport={() => setSupportOpen(true)}
          onOpenPremium={() => setPremiumOpen(true)}
          unreadCount={unreadCount}
          onGoHome={handleGoHome}
        />
        {store.currentUser && (
          <NotificationsDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} onCountChange={setUnreadCount} />
        )}
      </div>

      <Hero totalSounds={store.totalSounds} totalDownloads={store.totalDownloads} />

      <main className="max-w-7xl mx-auto px-6 pb-8">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-[#0A0A0A] mb-1 tracking-tight">Каталог звуков</h2>
          <p className="text-[13px] text-[#B0B0B0] font-medium">{filteredSounds.length} {pluralize(filteredSounds.length)} доступно</p>
        </div>
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                onClick={() => setShowOnlyFree(!showOnlyFree)}
                className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${showOnlyFree ? 'bg-[#0A0A0A] text-white' : 'bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#D4D4D4] hover:text-[#0A0A0A]'}`}
              >
                <FilterIcon size={13} />Бесплатные
              </button>
              <SortSelect options={sortOptions} selected={sortBy} onChange={setSortBy} />
              <div className="hidden sm:flex items-center border border-[#E5E5E5] rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[#B0B0B0] hover:text-[#0A0A0A]'}`}><GridIcon size={14} /></button>
                <button onClick={() => setViewMode('list')} className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[#B0B0B0] hover:text-[#0A0A0A]'}`}><ListIcon size={14} /></button>
              </div>
            </div>
          </div>
          <CategoryFilter categories={categories} selected={selectedCategory} onChange={setSelectedCategory} counts={categoryCounts} />
        </div>

        {filteredSounds.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#F3F3F3] rounded-2xl flex items-center justify-center">
              <WaveformIcon size={24} className="text-[#B0B0B0]" />
            </div>
            <h3 className="text-base font-semibold text-[#0A0A0A] mb-1">{allSounds.length === 0 ? 'Пока нет звуков' : 'Ничего не найдено'}</h3>
            <p className="text-[13px] text-[#B0B0B0]">{allSounds.length === 0 ? 'Добавьте первый звук' : 'Попробуйте изменить параметры поиска'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {pagedSounds.map((s, i) => (
                <SoundCard key={s.id} sound={s} isPlaying={playingId === s.id} playProgress={playingId === s.id ? playProgress : 0} currentTime={playingId === s.id ? currentTime : 0} onTogglePlay={() => togglePlay(s.id)} onSeek={handleSeek} onDownloadClick={() => handleDownloadClick(s)} onPremiumClick={() => setPremiumOpen(true)} animationDelay={i * 40} hasPremiumAccess={hasPremiumAccess} audioElement={playingId === s.id ? audioRef.current : null} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              {pagedSounds.map((s, i) => (
                <ListSoundCard key={s.id} sound={s} isPlaying={playingId === s.id} playProgress={playingId === s.id ? playProgress : 0} currentTime={playingId === s.id ? currentTime : 0} onTogglePlay={() => togglePlay(s.id)} onSeek={handleSeek} onDownloadClick={() => handleDownloadClick(s)} onPremiumClick={() => setPremiumOpen(true)} animationDelay={i * 25} hasPremiumAccess={hasPremiumAccess} audioElement={playingId === s.id ? audioRef.current : null} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </main>

      <Footer onOpenPage={setContentPage} />
      <CookieBanner />

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchMode={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}
        onRegister={store.register}
        onLogin={store.login}
      />

      <AddModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAddSound={handleAddSound}
        onSuccess={() => {
          // После успешной загрузки обновляем данные
          store.refreshData();
        }}
      />

      {store.currentUser && (
        <ProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={store.currentUser}
          onUpdateName={store.updateName}
          onLogout={store.logout}
          userSounds={allSounds.filter(s => s.authorId === store.currentUser?.id)}
          onDeleteSound={async (id) => {
            const ok = await store.deleteSound(id);
            if (ok) store.refreshData();
            return ok;
          }}
        />
      )}

      <PremiumModal
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        currentSub={store.currentUser?.subscription || 'none'}
        onSubscribe={plan => store.setSubscription(plan)}
        isLoggedIn={!!store.currentUser}
        onOpenAuth={() => { setPremiumOpen(false); openAuth('register'); }}
        onOpenPage={setContentPage}
      />

      <DownloadModal
        isOpen={downloadOpen}
        onClose={() => { setDownloadOpen(false); setDownloadSound(null); }}
        sound={downloadSound}
        user={store.currentUser}
        onDownload={handleDownload}
        onOpenPremium={() => { setDownloadOpen(false); setPremiumOpen(true); }}
        onOpenAuth={() => { setDownloadOpen(false); openAuth('register'); }}
      />

      <SupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        isLoggedIn={!!store.currentUser}
        onOpenAuth={() => { setSupportOpen(false); openAuth('register'); }}
      />

      {isAdmin && (
        <AdminPanel
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          onRefresh={store.refreshData}
        />
      )}

      <ContentPage 
        isOpen={contentPage !== null} 
        onClose={() => setContentPage(null)} 
        page={contentPage || 'faq'} 
      />
    </div>
  );
};

export default App;
