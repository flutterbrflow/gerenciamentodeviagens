
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { Trip, Traveler } from '../types';

const NewTripScreen: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [notes, setNotes] = useState('');
  
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [newTravelerName, setNewTravelerName] = useState('');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<'ida' | 'volta'>('ida');

  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 'me', name: 'Você', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', isMe: true }
  ]);

  useEffect(() => {
    const fetchAiSuggestion = async () => {
        if (destination.length < 4) { setAiSuggestion(''); return; }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: `Write a very short, exciting, 1-sentence tagline (max 10 words) for a trip to ${destination}. In Portuguese.` });
            if (response.text) setAiSuggestion(response.text);
        } catch (e) {}
    };
    const timeoutId = setTimeout(fetchAiSuggestion, 800);
    return () => clearTimeout(timeoutId);
  }, [destination]);

  const handleAddTraveler = () => {
    if (newTravelerName.trim()) {
      const newId = `traveler-${Date.now()}`;
      setTravelers(prev => [...prev, { id: newId, name: newTravelerName.trim(), image: `https://i.pravatar.cc/150?u=${newId}` }]);
      setNewTravelerName('');
      setShowTravelerModal(false);
    }
  };

  const handleInvite = () => {
      if (navigator.share) navigator.share({ title: 'Vamos viajar?', text: `Estou planejando uma viagem para ${destination || 'um lugar incrível'}. Vamos nessa?`, url: 'https://travelease.app/join/123' }).catch(console.error);
      else alert('Link de convite copiado!');
  };

  const handleSave = () => {
    if (!destination.trim()) { alert("Por favor, digite um destino."); return; }
    if (!startDate) { alert("Selecione pelo menos a data de ida."); return; }

    setLoading(true);
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const year = currentDate.getFullYear();
    const formattedDateRange = `${startDate} de ${monthName}${endDate ? ` - ${endDate} de ${monthName}` : ''}, ${year}`;

    const newTrip: Trip = {
      id: Date.now().toString(),
      destination: destination,
      country: destination.split(',')[1]?.trim() || 'Destino',
      dateRange: formattedDateRange,
      imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
      status: 'upcoming',
      daysLeft: 45,
      travelers: travelers,
      mediaCount: 0,
      notes: notes
    };

    const savedTrips = JSON.parse(localStorage.getItem('travelease_trips') || '[]');
    localStorage.setItem('travelease_trips', JSON.stringify([newTrip, ...savedTrips]));

    setTimeout(() => { setLoading(false); navigate('/home'); }, 600);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(1); // FIX: Ensure date is 1st to prevent skipping Feb
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
    setStartDate(null);
    setEndDate(null);
  };

  const handleDayClick = (day: number) => {
    if (!startDate || (startDate && endDate) || (day < startDate)) {
      setStartDate(day);
      setEndDate(null);
      setActiveInput('volta');
    } else {
      setEndDate(day);
      setActiveInput('ida');
    }
  };

  const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const shortMonthName = currentDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in overflow-y-auto no-scrollbar relative">
      <div className="sticky top-0 z-20 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100/50">
        <button onClick={() => navigate(-1)} className="flex w-20 items-center justify-start text-gray-400 font-medium text-sm">Cancelar</button>
        <h2 className="text-[#111418] dark:text-white text-base font-bold flex-1 text-center">Nova Viagem</h2>
        <button onClick={handleSave} className="w-20 text-right text-primary font-bold text-sm hover:opacity-70 active:scale-95 transition-all">Salvar</button>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-32 pt-4 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[#111418] dark:text-slate-200 text-lg font-bold">Para onde você vai?</label>
          <div className="flex flex-col w-full bg-white dark:bg-[#1A2633] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm focus-within:ring-2 ring-primary/30 transition-all overflow-hidden">
             <div className="flex items-center"><div className="pl-4 pr-1"><span className="material-symbols-outlined text-primary text-[20px]">location_on</span></div><input className="flex w-full bg-transparent p-3.5 text-[15px] font-medium outline-none text-[#111418] dark:text-white" placeholder="Ex: Roma, Itália" value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
             {aiSuggestion && (<div className="bg-primary/5 px-4 py-2 border-t border-primary/10 flex items-start gap-2 animate-fade-in"><span className="material-symbols-outlined text-primary text-[14px] mt-0.5">auto_awesome</span><p className="text-[11px] text-primary font-bold italic">"{aiSuggestion}"</p></div>)}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center"><h3 className="text-[#111418] dark:text-white text-lg font-bold">Quando?</h3><button className="text-primary text-sm font-semibold px-2 py-1" onClick={() => { setStartDate(null); setEndDate(null); setActiveInput('ida'); }}>Limpar</button></div>
          <div className="flex gap-3">
            <button onClick={() => setActiveInput('ida')} className={`flex-1 bg-white dark:bg-[#1A2633] rounded-2xl p-4 border-2 transition-all flex flex-col gap-1 items-start text-left ${activeInput === 'ida' ? 'border-primary shadow-md' : 'border-transparent shadow-sm'}`}><span className={`text-[10px] font-bold uppercase tracking-wider ${activeInput === 'ida' ? 'text-primary' : 'text-gray-400'}`}>Ida</span><span className="text-[15px] font-bold">{startDate ? `${startDate} de ${shortMonthName}` : '--'}</span></button>
            <button onClick={() => setActiveInput('volta')} className={`flex-1 bg-white dark:bg-[#1A2633] rounded-2xl p-4 border-2 transition-all flex flex-col gap-1 items-start text-left ${activeInput === 'volta' ? 'border-primary shadow-md' : 'border-transparent shadow-sm'}`}><span className={`text-[10px] font-bold uppercase tracking-wider ${activeInput === 'volta' ? 'text-primary' : 'text-gray-400'}`}>Volta</span><span className="text-[15px] font-bold">{endDate ? `${endDate} de ${shortMonthName}` : '--'}</span></button>
          </div>
          <div className="bg-white dark:bg-[#1A2633] rounded-[24px] p-6 shadow-sm w-full border border-gray-50 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6 px-1"><button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><span className="material-symbols-outlined text-[#111418] dark:text-white font-bold">chevron_left</span></button><p className="text-[#111418] dark:text-white text-base font-bold capitalize">{currentMonthName}</p><button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><span className="material-symbols-outlined text-[#111418] dark:text-white font-bold">chevron_right</span></button></div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (<p key={d} className="text-[11px] font-bold text-gray-400 mb-4">{d}</p>))}
              {[...Array(31)].map((_, i) => { const day = i + 1; const isSelected = startDate !== null && endDate !== null && day >= startDate && day <= endDate; const isStart = startDate === day; const isEnd = endDate === day; return (<div key={i} className={`relative flex items-center justify-center h-10 w-full ${isSelected && !isStart && !isEnd ? 'bg-primary/10' : ''} ${isStart && endDate ? 'bg-primary/10 rounded-l-full' : ''} ${isEnd && startDate ? 'bg-primary/10 rounded-r-full' : ''}`}><button onClick={() => handleDayClick(day)} className={`h-9 w-9 flex items-center justify-center text-[13px] font-bold transition-all z-10 ${isStart || isEnd ? 'bg-primary text-white rounded-full' : isSelected ? 'text-primary' : 'text-gray-400 hover:bg-gray-50 rounded-full'}`}>{day}</button></div>); })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center"><h3 className="text-[#111418] dark:text-white text-lg font-bold">Quem vai com você?</h3><button onClick={handleInvite} className="flex items-center gap-1.5 text-primary active:opacity-70"><span className="material-symbols-outlined text-[18px]">share</span><span className="text-[13px] font-bold">Convidar</span></button></div>
          <div className="flex items-center gap-6 py-2 overflow-x-auto no-scrollbar min-h-[90px] px-1">
            {travelers.map((traveler) => (<div key={traveler.id} className="flex flex-col items-center gap-2 shrink-0"><div className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-800 shadow-md overflow-hidden bg-gray-200"><img src={traveler.image} className="w-full h-full object-cover" alt={traveler.name} /></div><span className="text-[12px] font-bold text-[#111418] dark:text-white truncate max-w-[65px]">{traveler.name}</span></div>))}
            <div className="flex flex-col items-center gap-2 shrink-0"><button onClick={() => setShowTravelerModal(true)} className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-primary active:scale-95 transition-all"><span className="material-symbols-outlined text-[24px]">add</span></button><span className="text-[12px] font-bold text-gray-400">Adicionar</span></div>
          </div>
        </div>

        <div className="flex flex-col gap-2"><label className="text-[#111418] dark:text-slate-200 text-lg font-bold">Notas ou Descrição</label><div className="w-full bg-white dark:bg-[#1A2633] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm focus-within:ring-2 ring-primary/30 transition-all p-4"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Escreva algo sobre a viagem..." className="w-full h-24 bg-transparent text-[14px] font-medium outline-none text-[#111418] dark:text-white resize-none" /></div></div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl z-20 max-w-[430px] mx-auto">
        <button onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-base h-14 rounded-3xl shadow-xl flex items-center justify-center gap-3">{loading ? <span className="animate-spin material-symbols-outlined">sync</span> : <><span className="material-symbols-outlined">flight_takeoff</span>Criar Viagem</>}</button>
      </div>

      {showTravelerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-slide-up">
            <h3 className="text-[16px] font-bold mb-4">Adicionar Acompanhante</h3>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nome</label><input autoFocus value={newTravelerName} onChange={(e) => setNewTravelerName(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddTraveler()} /></div>
              <div className="flex gap-3 mt-4"><button onClick={() => setShowTravelerModal(false)} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-gray-400 bg-gray-100">Cancelar</button><button onClick={handleAddTraveler} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-white bg-primary">Adicionar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTripScreen;
