
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
          dateRange: '10 Out - 24 Out, 2023',
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          daysLeft: 15
        },
        {
          id: '2',
          destination: 'Tóquio, Japão',
          country: 'Japão',
          dateRange: '15 Dez - 30 Dez, 2023',
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800',
          status: 'upcoming',
          timeframe: 'Em 2 meses'
        }
      ];
      setTrips(initialTrips);
      localStorage.setItem('travelease_trips', JSON.stringify(initialTrips));
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-[#111418] animate-fade-in">
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-[#111418]/95 backdrop-blur-sm pb-2">
        <div className="flex flex-col gap-2 p-4 pb-2">
          <div className="flex items-center h-12 justify-between">
            <div className="flex size-12 shrink-0 items-center">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-11 border-2 border-white dark:border-[#22303e] shadow-sm cursor-pointer"
                style={{ backgroundImage: `url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100")` }}
                onClick={() => navigate('/profile')}
              ></div>
            </div>
            <button className="flex items-center justify-center rounded-full size-11 text-[#111418] dark:text-white bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
          <h1 className="text-[#111418] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight">Minhas Viagens</h1>
        </div>
        
        <div className="px-4 pb-2">
          <div className="flex h-11 w-full items-center rounded-2xl bg-gray-200/50 dark:bg-[#1e2a36] p-1 relative">
            <div 
              className={`absolute w-[calc(50%-4px)] h-9 bg-white dark:bg-[#2c3b4a] rounded-xl shadow-sm transition-all duration-300 ease-in-out ${activeTab === 'upcoming' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
            ></div>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center text-[14px] font-bold transition-colors ${activeTab === 'upcoming' ? 'text-[#111418] dark:text-white' : 'text-[#617589]'}`}
            >
              Próximas
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`relative z-10 flex-1 h-full flex items-center justify-center text-[14px] font-bold transition-colors ${activeTab === 'past' ? 'text-[#111418] dark:text-white' : 'text-[#617589]'}`}
            >
              Passadas
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 space-y-5 pt-4 no-scrollbar">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <div 
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="group relative flex flex-col items-stretch justify-start rounded-3xl bg-white dark:bg-[#1e2a36] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
            >
              <div 
                className="w-full h-44 bg-center bg-no-repeat bg-cover relative"
                style={{ backgroundImage: `url("${trip.imageUrl}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-primary/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20">
                    {trip.daysLeft ? `Faltam ${trip.daysLeft} dias` : trip.timeframe || 'Em breve'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight">{trip.destination}</h3>
                    <p className="text-[#617589] dark:text-[#9ba8b8] text-[13px] font-medium mt-1">{trip.dateRange}</p>
                  </div>
                  <div className="size-9 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-medium">Nenhuma viagem encontrada.</p>
          </div>
        )}

        <button 
          onClick={() => navigate('/new-trip')}
          className="w-full border-2 border-dashed border-gray-200 dark:border-[#2c3b4a] rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-center hover:bg-gray-50 dark:hover:bg-[#1a232e] transition-colors group"
        >
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[32px]">add_location_alt</span>
          </div>
          <div>
            <p className="text-[#111418] dark:text-white font-bold text-base">Planejar nova aventura</p>
            <p className="text-[#617589] dark:text-[#9ba8b8] text-[13px] font-medium">Crie seu próximo roteiro personalizado</p>
          </div>
        </button>
      </main>

      <div className="absolute bottom-28 right-5 z-20">
        <button 
          onClick={() => navigate('/new-trip')}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[32px]">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;
