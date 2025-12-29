
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Trip } from '../types';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [trips, setTrips] = useState<Trip[]>([]);

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
          daysLeft: 15
        },
        {
          id: '2',
          destination: 'Tóquio, Japão',
          country: 'Japão',
          dateRange: '15 Dez - 30 Dez, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          timeframe: 'Em 2 meses'
        },
        {
          id: '3',
          destination: 'Rio de Janeiro, Brasil',
          country: 'Brasil',
          dateRange: '20 Fev - 28 Fev, 2025',
          imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          timeframe: 'Em 4 meses'
        },
        {
          id: '4',
          destination: 'Londres, Reino Unido',
          country: 'Reino Unido',
          dateRange: '12 Jul - 20 Jul, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          daysLeft: 5
        },
        {
          id: '5',
          destination: 'Bali, Indonésia',
          country: 'Indonésia',
          dateRange: '05 Set - 15 Set, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          timeframe: 'Em 1 mês'
        },
        {
          id: '6',
          destination: 'Nova York, EUA',
          country: 'EUA',
          dateRange: '01 Jun - 10 Jun, 2024',
          imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
          status: 'past'
        }
      ];
      setTrips(initialTrips);
      localStorage.setItem('travelease_trips', JSON.stringify(initialTrips));
    }
  }, []);

  const filteredTrips = trips.filter(t => activeTab === 'upcoming' ? t.status !== 'past' : t.status === 'past');

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-[#111418] animate-fade-in">
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-[#111418]/95 backdrop-blur-sm pb-2">
        <div className="flex flex-col gap-2 p-4 pb-2">
          <div className="flex items-center h-12 justify-between">
            <div className="flex size-9 shrink-0 items-center">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 border-2 border-white dark:border-[#22303e] shadow-sm cursor-pointer"
                style={{ backgroundImage: `url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100")` }}
                onClick={() => navigate('/profile')}
              ></div>
            </div>
            <button className="flex items-center justify-center rounded-full size-9 text-[#111418] dark:text-white bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
          </div>
          <h1 className="text-[#111418] dark:text-white tracking-tight text-[24px] font-extrabold leading-tight">Minhas Viagens</h1>
        </div>
        
        <div className="px-4 pb-2">
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
                <div className="absolute bottom-3 left-4">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-primary/90 px-2 py-0.5 text-[7px] font-bold text-white backdrop-blur-md border border-white/20 uppercase tracking-wide">
                    {trip.daysLeft ? `Faltam ${trip.daysLeft} dias` : trip.timeframe || 'Em breve'}
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
