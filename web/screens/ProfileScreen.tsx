
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Trip } from '../types';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'privacy' | 'language' | 'settings'>('none');
  const [language, setLanguage] = useState('Português');
  
  // Estados de Privacidade
  const [publicProfile, setPublicProfile] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);

  // Estados de Estatísticas
  const [stats, setStats] = useState({ trips: '0', countries: '0', photos: '0' });

  useEffect(() => {
    // Check initial dark mode
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }

    // Calculate Stats
    const savedTrips: Trip[] = JSON.parse(localStorage.getItem('travelease_trips') || '[]');
    const uniqueCountries = new Set(savedTrips.map(t => t.country)).size;
    const totalMedia = savedTrips.reduce((acc, t) => acc + (t.mediaCount || 0), 0);

    setStats({
        trips: savedTrips.length.toString(),
        countries: uniqueCountries.toString(),
        photos: totalMedia.toString()
    });

  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleLogout = () => {
    // Aqui limparia o auth token se houvesse
    navigate('/');
  };

  const handleLanguageSelect = (lang: string) => {
      setLanguage(lang);
      setActiveModal('none');
  };

  const statItems = [
    { label: 'Viagens', value: stats.trips, icon: 'explore' },
    { label: 'Países', value: stats.countries, icon: 'public' },
    { label: 'Fotos', value: stats.photos, icon: 'photo_library' },
  ];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in relative">
      <header className="flex items-center justify-between px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <button onClick={() => navigate('/home')} className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-[16px] font-bold flex-1 text-center">Meu Perfil</h2>
        <button onClick={() => setActiveModal('settings')} className="flex size-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="flex flex-col items-center py-8 px-4 bg-surface-light dark:bg-surface-dark">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20 bg-cover bg-center shadow-lg" style={{ backgroundImage: `url("${profileImage}")` }}></div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-[#1e2a36] shadow-md hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h3 className="mt-4 text-[19px] font-bold text-[#111418] dark:text-white">Alex Silva</h3>
          <p className="text-gray-500 font-bold text-[11px] uppercase tracking-tight">Viajante Enthusiasta • @alex_travels</p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-[#1e2a36] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[20px] mb-1">{stat.icon}</span>
              <span className="text-[15px] font-bold">{stat.value}</span>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 py-2 space-y-3">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Preferências</h4>
          <div className="bg-white dark:bg-[#1e2a36] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            
            {/* Notificações */}
            <div 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-500 text-[20px]">notifications</span><span className="font-semibold text-[13px]">Notificações</span></div>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${notificationsEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${notificationsEnabled ? 'left-5' : 'left-1'}`}></div>
                </div>
            </div>

            {/* Modo Escuro */}
            <div 
              onClick={toggleDarkMode}
              className="flex items-center justify-between p-4 border-t border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-500 text-[20px]">dark_mode</span><span className="font-semibold text-[13px]">Modo Escuro</span></div>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${darkMode ? 'left-5' : 'left-1'}`}></div>
                </div>
            </div>

            {/* Privacidade */}
            <div 
              onClick={() => setActiveModal('privacy')}
              className="flex items-center justify-between p-4 border-t border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-500 text-[20px]">lock</span><span className="font-semibold text-[13px]">Privacidade</span></div>
                <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
            </div>

            {/* Idioma */}
            <div 
              onClick={() => setActiveModal('language')}
              className="flex items-center justify-between p-4 border-t border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-500 text-[20px]">language</span><span className="font-semibold text-[13px]">Idioma</span></div>
                <span className="text-[10px] font-bold text-primary uppercase">{language}</span>
            </div>

          </div>
        </div>

        <div className="px-4 py-6">
           <button onClick={handleLogout} className="w-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors text-[13px]">
             <span className="material-symbols-outlined text-[20px]">logout</span> Sair da Conta
           </button>
        </div>
      </main>

      {/* GENERIC MODAL */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-slide-up relative">
             <button onClick={() => setActiveModal('none')} className="absolute top-4 right-4 z-10 size-8 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
               <span className="material-symbols-outlined text-[18px]">close</span>
             </button>

             {activeModal === 'settings' && (
                 <>
                    <h3 className="text-[18px] font-bold mb-4">Configurações</h3>
                    <p className="text-gray-500 text-sm mb-4">Configurações avançadas do aplicativo estariam aqui.</p>
                    <button onClick={() => setActiveModal('none')} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm">OK</button>
                 </>
             )}

             {activeModal === 'privacy' && (
                 <>
                    <h3 className="text-[18px] font-bold mb-4">Privacidade</h3>
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setPublicProfile(!publicProfile)}>
                            <span className="text-sm">Perfil Público</span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${publicProfile ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${publicProfile ? 'left-5' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShareLocation(!shareLocation)}>
                            <span className="text-sm">Compartilhar localização</span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${shareLocation ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${shareLocation ? 'left-5' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setActiveModal('none')} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm">Salvar</button>
                 </>
             )}

             {activeModal === 'language' && (
                 <>
                    <h3 className="text-[18px] font-bold mb-4">Selecione o Idioma</h3>
                    <div className="space-y-2 mb-6">
                        {['Português', 'English', 'Español', 'Français'].map(lang => (
                            <button 
                                key={lang} 
                                onClick={() => handleLanguageSelect(lang)}
                                className={`w-full p-3 rounded-xl text-left font-medium flex justify-between ${language === lang ? 'bg-primary/10 text-primary' : 'bg-gray-50 dark:bg-gray-800'}`}
                            >
                                {lang}
                                {language === lang && <span className="material-symbols-outlined">check</span>}
                            </button>
                        ))}
                    </div>
                 </>
             )}

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
