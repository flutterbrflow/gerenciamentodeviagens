
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types';

const NewTripScreen: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!destination.trim()) {
      alert("Por favor, digite um destino.");
      return;
    }

    setLoading(true);
    
    // Simulação de criação de viagem
    const newTrip: Trip = {
      id: Date.now().toString(),
      destination: destination,
      country: destination.split(',')[1]?.trim() || 'Desconhecido',
      dateRange: '05 Jul - 15 Jul, 2024',
      imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
      status: 'upcoming',
      daysLeft: 45
    };

    const savedTrips = JSON.parse(localStorage.getItem('travelease_trips') || '[]');
    localStorage.setItem('travelease_trips', JSON.stringify([newTrip, ...savedTrips]));

    setTimeout(() => {
      setLoading(false);
      navigate('/home');
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-20 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200/50 dark:border-gray-800/50">
        <button onClick={() => navigate(-1)} className="flex w-20 items-center justify-start text-[#617589] font-medium">
          Cancelar
        </button>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold flex-1 text-center">Nova Viagem</h2>
        <button onClick={handleSave} className="flex w-20 items-center justify-end text-primary font-bold">
          {loading ? '...' : 'Salvar'}
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 pb-32 pt-4 gap-6">
        <div>
          <h2 className="text-[#111418] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight">
            Vamos planejar sua<br/>próxima aventura?
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#111418] dark:text-slate-200 text-base font-bold">Para onde você vai?</label>
          <div className="flex w-full items-center rounded-xl bg-white dark:bg-[#1A2633] border border-transparent shadow-sm overflow-hidden focus-within:ring-2 ring-primary/50 transition-all">
            <div className="flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <input 
              className="flex w-full bg-transparent p-4 h-14 text-base font-medium outline-none text-[#111418] dark:text-white" 
              placeholder="Ex: Paris, França" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-[#111418] dark:text-slate-200 text-base font-bold">Quando?</label>
            <button className="text-primary text-sm font-medium" onClick={() => {}}>Limpar</button>
          </div>
          <div className="flex gap-3 mb-2">
            <div className="flex-1 bg-white dark:bg-[#1A2633] rounded-xl p-3 border-2 border-primary shadow-sm flex flex-col gap-1">
              <span className="text-xs font-bold text-[#617589] uppercase">Ida</span>
              <span className="text-base font-bold">5 Jul, 2024</span>
            </div>
            <div className="flex-1 bg-white dark:bg-[#1A2633] rounded-xl p-3 border border-transparent shadow-sm flex flex-col gap-1">
              <span className="text-xs font-medium text-[#617589] uppercase">Volta</span>
              <span className="text-base font-medium text-slate-400">15 Jul, 2024</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1A2633] rounded-2xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="material-symbols-outlined text-[#111418] dark:text-white cursor-pointer">chevron_left</span>
              <p className="text-[#111418] dark:text-white text-base font-bold">Julho 2024</p>
              <span className="material-symbols-outlined text-[#111418] dark:text-white cursor-pointer">chevron_right</span>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-slate-400">
              <p>D</p><p>S</p><p>T</p><p>Q</p><p>Q</p><p>S</p><p>S</p>
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = day >= 5 && day <= 15;
                const isEdge = day === 5 || day === 15;
                return (
                  <button 
                    key={i} 
                    className={`h-10 w-full flex items-center justify-center text-sm font-medium ${
                      isEdge ? 'bg-primary text-white rounded-full font-bold' : 
                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 rounded-full'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-[#111418] dark:text-slate-200 text-lg font-bold">Quem vai com você?</h3>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="Me" />
                <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">Eu</div>
              </div>
              <span className="text-xs font-medium">Você</span>
            </div>
            <button className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className="text-xs font-medium text-slate-400">Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 z-20 max-w-[430px] mx-auto">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-lg h-14 rounded-full shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
             <span className="animate-spin material-symbols-outlined">sync</span>
          ) : (
            <>
              <span className="material-symbols-outlined">flight_takeoff</span>
              Criar Viagem
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewTripScreen;
