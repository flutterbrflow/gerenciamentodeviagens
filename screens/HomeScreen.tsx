
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Trip } from '../types';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const savedTrips = localStorage.getItem('travelease_trips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    } else {
      const initialTrips: Trip[] = [
        {
          id: '1',
          destination: 'Paris, França',
          country: 'França',
          dateRange: '10 Out - 24 Out, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          mediaCount: 124
        },
        {
          id: '2',
          destination: 'Tóquio, Japão',
          country: 'Japão',
          dateRange: '15 Dez - 30 Dez, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          mediaCount: 45
        },
        // Nova Viagem Brasília com imagem real
        {
          id: '30',
          destination: 'Brasília, Brasil',
          country: 'Brasil',
          dateRange: '10 Fev - 15 Fev, 2025',
          imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          mediaCount: 12
        },
        {
          id: '3',
          destination: 'Rio de Janeiro, Brasil',
          country: 'Brasil',
          dateRange: '20 Fev - 28 Fev, 2025',
          imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
        },
        {
          id: '4',
          destination: 'Londres, Reino Unido',
          country: 'Reino Unido',
          dateRange: '12 Jul - 20 Jul, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          mediaCount: 89
        },
        {
          id: '5',
          destination: 'Bali, Indonésia',
          country: 'Indonésia',
          dateRange: '05 Set - 15 Set, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
        },
        {
          id: '6',
          destination: 'Nova York, EUA',
          country: 'EUA',
          dateRange: '01 Jun - 10 Jun, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
          status: 'past',
          mediaCount: 342
        },
        {
          id: '7',
          destination: 'Cairo, Egito',
          country: 'Egito',
          dateRange: '10 Mar - 20 Mar, 2026',
          imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          mediaCount: 0
        },
        {
          id: '8',
          destination: 'Sidney, Austrália',
          country: 'Austrália',
          dateRange: '15 Nov - 30 Nov, 2026',
          imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          mediaCount: 0
        }
      ];
      setTrips(initialTrips);
      localStorage.setItem('travelease_trips', JSON.stringify(initialTrips));
    }
  }, []);

  const filteredTrips = trips.filter(t => activeTab === 'upcoming' ? t.status !== 'past' : t.status === 'past');

  // Função para calcular status baseado nas datas
  const getTripTiming = (dateRange: string) => {
    try {
        const parts = dateRange.match(/(\d+) (\w+) - (\d+) (\w+), (\d+)/);
        // Tenta formato "10 Out - 24 Out, 2024"
        if (!parts) return "Em breve";

        const monthsMap: {[key: string]: number} = { 'Jan':0, 'Fev':1, 'Mar':2, 'Abr':3, 'Mai':4, 'Jun':5, 'Jul':6, 'Ago':7, 'Set':8, 'Out':9, 'Nov':10, 'Dez':11 };
        
        const dayStart = parseInt(parts[1]);
        const monthStart = monthsMap[parts[2]];
        const dayEnd = parseInt(parts[3]);
        const monthEnd = monthsMap[parts[4]];
        const year = parseInt(parts[5]);

        const startDate = new Date(year, monthStart, dayStart);
        const endDate = new Date(year, monthEnd, dayEnd);
        const today = new Date();
        
        // Zera horas para comparação de dias apenas
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Duração total da viagem em dias
        const durationTime = Math.abs(endDate.getTime() - startDate.getTime());
        const durationDays = Math.ceil(durationTime / (1000 * 60 * 60 * 24)) + 1;

        if (today > endDate) return "Finalizada";
        if (today >= startDate && today <= endDate) return `${durationDays} dias`; // Mostra duração total se estiver em andamento
        if (diffDays === 0) return "É hoje!";
        if (diffDays <= 60) return `Faltam ${diffDays} dias`;
        
        const diffMonths = Math.round(diffDays / 30);
        return `Em ${diffMonths} meses`;
    } catch (e) {
        return "Em breve";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-[#111418] animate-fade-in relative">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-[#111418]/95 backdrop-blur-sm pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex size-9 shrink-0 items-center">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border-2 border-white dark:border-[#22303e] shadow-sm cursor-pointer active:scale-95 transition-transform"
                style={{ backgroundImage: `url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100")` }}
                onClick={() => navigate('/profile')}
              ></div>
            </div>
            
            <h1 className="text-[#111418] dark:text-white tracking-tight text-[16px] font-extrabold leading-tight text-center">Minhas Viagens</h1>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`flex items-center justify-center rounded-full size-9 text-[#111418] dark:text-white bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800 transition-colors ${showNotifications ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${showNotifications ? 'material-symbols-filled' : ''}`}>notifications</span>
                <span className="absolute top-0 right-0 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#111418]"></span>
              </button>

              {/* Notificações Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 animate-slide-up z-50">
                  <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-800">
                    <h3 className="text-[12px] font-bold">Notificações</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto no-scrollbar">
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
                      <div className="flex gap-3">
                         <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                           <span className="material-symbols-outlined text-blue-500 text-[16px]">flight</span>
                         </div>
                         <div>
                           <p className="text-[11px] font-bold leading-tight">Check-in disponível</p>
                           <p className="text-[10px] text-gray-400 mt-0.5">Voo para Paris em 24h</p>
                         </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
                       <div className="flex gap-3">
                         <div className="size-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                           <span className="material-symbols-outlined text-orange-500 text-[16px]">wb_sunny</span>
                         </div>
                         <div>
                           <p className="text-[11px] font-bold leading-tight">Clima em Tóquio</p>
                           <p className="text-[10px] text-gray-400 mt-0.5">Previsão de sol para sua viagem</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
        
        <div className="px-4 pb-2 mt-1">
          <div className="flex h-8 w-full items-center rounded-2xl bg-gray-200/50 dark:bg-[#1e2a36] p-1 relative">
            <div 
              className={`absolute w-[calc(50%-4px)] h-6 bg-white dark:bg-[#2c3b4a] rounded-xl shadow-sm transition-all duration-300 ease-in-out ${activeTab === 'upcoming' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
            ></div>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center text-[10px] font-bold transition-colors ${activeTab === 'upcoming' ? 'text-[#111418] dark:text-white' : 'text-[#617589]'}`}
            >
              Próximas
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center text-[10px] font-bold transition-colors ${activeTab === 'past' ? 'text-[#111418] dark:text-white' : 'text-[#617589]'}`}
            >
              Passadas
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-4 pt-4 no-scrollbar">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <div 
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="group relative flex flex-col items-stretch justify-start rounded-3xl bg-white dark:bg-[#1e2a36] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
            >
              <div 
                className="w-full h-36 bg-center bg-no-repeat bg-cover relative"
                style={{ backgroundImage: `url("${trip.imageUrl}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                
                {/* Contador de Mídias (Canto Superior Esquerdo) */}
                {(trip.mediaCount !== undefined) && (
                  <div className="absolute top-3 left-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md border border-white/10">
                      <span className="material-symbols-outlined text-[12px]">photo_library</span>
                      {trip.mediaCount}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-primary/90 px-2 py-0.5 text-[7px] font-bold text-white backdrop-blur-md border border-white/20 uppercase tracking-wide">
                    {activeTab === 'past' ? 'Finalizada' : getTripTiming(trip.dateRange)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[#111418] dark:text-white text-[14px] font-bold leading-tight">{trip.destination}</h3>
                    <p className="text-[#617589] dark:text-[#9ba8b8] text-[9px] font-medium mt-1 uppercase tracking-tight">{trip.dateRange}</p>
                  </div>
                  <div className="size-7 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-[11px] text-gray-500 font-medium">Nenhuma viagem encontrada.</p>
          </div>
        )}

        <button 
          onClick={() => navigate('/new-trip')}
          className="w-full border-2 border-dashed border-gray-200 dark:border-[#2c3b4a] rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-50 dark:hover:bg-[#1a232e] transition-colors group"
        >
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[26px]">add_location_alt</span>
          </div>
          <div>
            <p className="text-[#111418] dark:text-white font-bold text-[13px]">Planejar nova aventura</p>
            <p className="text-[#617589] dark:text-[#9ba8b8] text-[9px] font-medium">Crie seu próximo roteiro personalizado</p>
          </div>
        </button>
      </main>

      <div className="absolute bottom-28 right-5 z-20">
        <button 
          onClick={() => navigate('/new-trip')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;
