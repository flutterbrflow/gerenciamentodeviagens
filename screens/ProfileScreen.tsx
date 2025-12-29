
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Viagens', value: '12', icon: 'explore' },
    { label: 'Países', value: '4', icon: 'public' },
    { label: 'Fotos', value: '248', icon: 'photo_library' },
  ];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in">
      <header className="flex items-center justify-between px-4 py-3 bg-surface-light dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-[16px] font-bold">Meu Perfil</h2>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><span className="material-symbols-outlined text-[20px]">settings</span></button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="flex flex-col items-center py-8 px-4 bg-surface-light dark:bg-surface-dark">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20 bg-cover bg-center shadow-lg" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200")` }}></div>
            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-md"><span className="material-symbols-outlined text-[15px]">edit</span></button>
          </div>
          <h3 className="mt-4 text-[19px] font-bold text-[#111418] dark:text-white">Alex Silva</h3>
          <p className="text-gray-500 font-bold text-[11px] uppercase tracking-tight">Viajante Enthusiasta • @alex_travels</p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4">
          {stats.map((stat) => (
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
            {[
              { label: 'Notificações', icon: 'notifications', toggle: true },
              { label: 'Modo Escuro', icon: 'dark_mode', toggle: true },
              { label: 'Privacidade', icon: 'lock', toggle: false },
              { label: 'Idioma', icon: 'language', value: 'Português', toggle: false },
            ].map((item, idx) => (
              <div key={item.label} className={`flex items-center justify-between p-4 active:bg-gray-50 transition-colors ${idx !== 0 ? 'border-t border-gray-50 dark:border-gray-800' : ''}`}>
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-500 text-[20px]">{item.icon}</span><span className="font-semibold text-[13px]">{item.label}</span></div>
                {item.toggle ? (
                  <div className="w-9 h-5 bg-primary/20 rounded-full relative"><div className="absolute top-0.5 left-4.5 w-4 h-4 bg-primary rounded-full"></div></div>
                ) : item.value ? (
                  <span className="text-[10px] font-bold text-primary uppercase">{item.value}</span>
                ) : (
                  <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-6">
           <button onClick={() => navigate('/')} className="w-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors text-[13px]">
             <span className="material-symbols-outlined text-[20px]">logout</span> Sair da Conta
           </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
