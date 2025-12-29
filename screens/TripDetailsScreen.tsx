
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TabType, TimelineEvent, Transaction } from '../types';

const TripDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');

  // Estado dinâmico para as tarefas
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Comprar seguro viagem', completed: true },
    { id: 2, text: 'Reservar ingressos Vaticano', completed: false },
    { id: 3, text: 'Trocar Euros', completed: false },
    { id: 4, text: 'Arrumar mala', completed: false },
  ]);

  const events: TimelineEvent[] = [
    {
      id: 'e1',
      time: '08:30',
      title: 'Voo para Roma (FCO)',
      description: 'Voo AZ-402 • Terminal 3',
      type: 'flight',
      status: 'Confirmado'
    },
    {
      id: 'e2',
      time: '14:00',
      title: 'Check–in Hotel Artemide',
      description: 'Via Nazionale, 22, Roma',
      type: 'hotel',
      location: 'Roma',
      mapUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsSRad3ziAWcKS-3Q3icgQJbMilpimuZ5IWOPIaBew00kxl2en8XfVl7WnkUiLUbu6ZLqSPuOERtjz6H5RR-neVgHD25ejKpPy7_E2d0DXRhK6tRI-pyy6ZudC8lnk91mYrIqBkSXF-In6SmsYWaGaHI9w72s0pD6I3je75eNogBXk5P0Zh0WpDRHDbiu0ntAqmw2c-gQQlxcpVEd2Qps7xVRQW0UbS94qikYnMnbFATTJng40yY4Y-KDaZLXm-NT4NCJPKaCGdHDe'
    },
    {
      id: 'e3',
      time: '16:30',
      title: 'Visita ao Coliseu',
      description: 'Tour guiado com acesso à arena.',
      type: 'activity'
    }
  ];

  const bookings = [
    { id: 'b1', title: 'Hotel Artemide', ref: 'CONF-88291', date: '12-20 Ago' },
    { id: 'b2', title: 'Aluguel de Carro - Hertz', ref: 'RT-9921', date: '14 Ago' },
  ];

  const tripExpenses: Transaction[] = [
    { id: 't1', title: 'Jantar Trastevere', category: 'Alimentação', amount: -65.00, date: '12 Ago', icon: 'restaurant' },
    { id: 't2', title: 'Passagens Trem', category: 'Transporte', amount: -42.00, date: '13 Ago', icon: 'train' },
    { id: 't3', title: 'Gelato Trevi', category: 'Alimentação', amount: -8.50, date: '13 Ago', icon: 'icecream' },
  ];

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = () => {
    const taskText = prompt("Qual tarefa deseja adicionar?");
    if (taskText && taskText.trim() !== "") {
      const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return (
          <div className="relative pl-6 space-y-10 before:content-[''] before:absolute before:left-[23px] before:top-2 before:bottom-0 before:w-[1px] before:bg-gray-200 dark:before:bg-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {events.map((event) => (
              <div key={event.id} className="relative pl-16">
                <div className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-gray-800 z-10 shadow-sm overflow-hidden">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    event.type === 'flight' ? 'bg-blue-50 text-primary' : 
                    event.type === 'hotel' ? 'bg-orange-50 text-orange-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {event.type === 'flight' ? 'flight_takeoff' : event.type === 'hotel' ? 'hotel' : 'attractions'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-0.5 pt-1.5">
                  <span className="text-base font-bold text-primary leading-none">{event.time}</span>
                  <h4 className="text-[17px] font-bold text-[#111418] dark:text-white leading-tight mt-1">{event.title}</h4>
                  <p className="text-sm text-[#617589] dark:text-gray-400 font-medium leading-relaxed">{event.description}</p>
                  
                  {event.mapUrl && (
                    <div className="mt-4 w-full h-24 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                      <img src={event.mapUrl} className="w-full h-full object-cover" alt="Mapa" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {bookings.map(b => (
              <div key={b.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-transform">
                <div className="flex flex-col gap-0.5">
                  <h4 className="font-bold text-[17px] text-[#111418] dark:text-white">{b.title}</h4>
                  <p className="text-sm text-[#617589] font-medium">Ref: {b.ref}</p>
                  <p className="text-sm text-primary font-bold mt-1">{b.date}</p>
                </div>
                <button 
                  onClick={() => alert(`Abrindo documento de reserva: ${b.title}`)}
                  className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </button>
              </div>
            ))}
          </div>
        );
      case 'tasks':
        return (
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {tasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => toggleTask(t.id)}
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div 
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      t.completed ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {t.completed && <span className="material-symbols-outlined text-white text-[18px] font-bold">check</span>}
                  </div>
                  <span className={`text-[15px] font-medium transition-all ${
                    t.completed ? 'text-gray-400 line-through' : 'text-[#111418] dark:text-gray-200'
                  }`}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddTask}
              className="w-full p-5 text-primary text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-50 dark:border-gray-800"
            >
              <span className="material-symbols-outlined text-[20px]">add</span> Adicionar Tarefa
            </button>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Total Gasto</p>
                <p className="text-2xl font-extrabold text-[#111418] dark:text-white">€ 115,50</p>
              </div>
              <button onClick={() => navigate('/budget')} className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl shadow-md">Ver Detalhes</button>
            </div>
            <div className="space-y-3">
              {tripExpenses.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-500 text-[22px]">{tx.icon}</span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#111418] dark:text-white">{tx.title}</p>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">{tx.category}</p>
                    </div>
                  </div>
                  <p className="text-[15px] font-bold text-red-500">€ {Math.abs(tx.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-slide-up overflow-y-auto no-scrollbar pb-10">
      <div className="sticky top-0 z-20 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center h-14 justify-between px-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <p className="text-base font-bold leading-tight">Detalhes da Viagem</p>
          <button className="w-10 h-10 flex items-center justify-center rounded-full">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-md group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url("https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800")` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Itália</p>
                <h1 className="text-white text-2xl font-extrabold leading-tight">Férias em Roma</h1>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 py-2 flex flex-col items-center">
                <span className="text-white text-[9px] font-bold uppercase tracking-wider">Faltam</span>
                <span className="text-white text-lg font-black leading-none">5d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[56px] z-20 bg-background-light dark:bg-background-dark pt-2">
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 justify-between overflow-x-auto no-scrollbar">
          {(['itinerary', 'bookings', 'tasks', 'expenses'] as TabType[]).map((tab) => {
            const label = tab === 'itinerary' ? 'Itinerário' : tab === 'bookings' ? 'Reservas' : tab === 'tasks' ? 'Tarefas' : 'Despesas';
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 px-2 min-w-[80px] transition-all duration-200 ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-[#617589]'
                }`}
              >
                <p className={`text-sm tracking-wide whitespace-nowrap ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-4 py-8">
        {activeTab === 'itinerary' && (
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 w-fit px-2 py-0.5 rounded-md">Dia 1</span>
              <h3 className="text-[20px] font-bold text-[#111418] dark:text-white">Segunda, 12 Agosto</h3>
            </div>
            <button 
              onClick={() => alert("Mostrando visualização do roteiro no mapa...")}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-[#617589] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[26px]">map</span>
            </button>
          </div>
        )}
        
        <div className="px-2">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsScreen;
