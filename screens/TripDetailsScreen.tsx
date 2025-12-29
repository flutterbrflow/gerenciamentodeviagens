
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TabType, TimelineEvent, Transaction, Trip } from '../types';

const TripDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [showMenu, setShowMenu] = useState(false);
  
  // Estado para adicionar tarefa
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  
  // Modais Customizados
  const [modalType, setModalType] = useState<'edit' | 'delete' | 'booking' | 'add_itinerary' | 'none'>('none');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Dados da Viagem
  const [tripData, setTripData] = useState<Trip | null>(null);

  // Ícones disponíveis com cores vibrantes
  const availableIcons = [
    { name: 'flight_takeoff', color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'hotel', color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'restaurant', color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'attractions', color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'directions_bus', color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'local_taxi', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'shopping_bag', color: 'text-pink-500', bg: 'bg-pink-50' },
    { name: 'museum', color: 'text-amber-700', bg: 'bg-amber-50' },
    { name: 'icecream', color: 'text-pink-400', bg: 'bg-pink-50' },
    { name: 'beach_access', color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { name: 'camera_alt', color: 'text-slate-600', bg: 'bg-slate-50' },
    { name: 'train', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'theater_comedy', color: 'text-violet-500', bg: 'bg-violet-50' },
    { name: 'coffee', color: 'text-brown-500', bg: 'bg-stone-100' }
  ];

  // Estado das tarefas
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Comprar seguro viagem', completed: true },
    { id: 2, text: 'Reservar ingressos Vaticano', completed: false },
    { id: 3, text: 'Trocar Euros', completed: false },
    { id: 4, text: 'Arrumar mala', completed: false },
  ]);

  // Estado do Itinerário
  const [tripEvents, setTripEvents] = useState<TimelineEvent[]>([
    { 
      id: 'e1', 
      time: '08:30', 
      title: 'Voo para Roma (FCO)', 
      description: 'Voo AZ-402 • Terminal 3', 
      type: 'flight', 
      status: 'flight_takeoff',
      statusLabel: 'Confirmado'
    },
    { 
      id: 'e2', 
      time: '14:00', 
      title: 'Check–in Hotel Artemide', 
      description: 'Via Nazionale, 22, Roma', 
      type: 'hotel', 
      status: 'hotel',
      mapUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsSRad3ziAWcKS-3Q3icgQJbMilpimuZ5IWOPIaBew00kxl2en8XfVl7WnkUiLUbu6ZLqSPuOERtjz6H5RR-neVgHD25ejKpPy7_E2d0DXRhK6tRI-pyy6ZudC8lnk91mYrIqBkSXF-In6SmsYWaGaHI9w72s0pD6I3je75eNogBXk5P0Zh0WpDRHDbiu0ntAqmw2c-gQQlxcpVEd2Qps7xVRQW0UbS94qikYnMnbFATTJng40yY4Y-KDaZLXm-NT4NCJPKaCGdHDe' 
    },
    { 
      id: 'e3', 
      time: '16:30', 
      title: 'Visita ao Coliseu', 
      description: 'Tour guiado com acesso à arena.', 
      type: 'activity',
      status: 'attractions'
    }
  ]);

  const [newItinerary, setNewItinerary] = useState({
    time: '',
    title: '',
    description: '',
    type: 'activity' as TimelineEvent['type'],
    icon: 'attractions'
  });

  const bookings = [
    { id: 'b1', title: 'Hotel Artemide', ref: 'CONF-88291', date: '12-20 Ago', detail: 'Quarto Deluxe com Café da Manhã', type: 'hotel', icon: 'hotel' },
    { id: 'b2', title: 'Aluguel de Carro - Hertz', ref: 'RT-9921', date: '14 Ago', detail: 'Fiat 500 ou similar - Retirada FCO', type: 'car', icon: 'directions_car' },
  ];

  const tripExpenses: Transaction[] = [
    { id: 't1', title: 'Jantar Trastevere', category: 'Alimentação', amount: -65.00, date: '12 Ago', icon: 'restaurant' },
    { id: 't2', title: 'Passagens Trem', category: 'Transporte', amount: -42.00, date: '13 Ago', icon: 'train' },
    { id: 't3', title: 'Gelato Trevi', category: 'Alimentação', amount: -8.50, date: '13 Ago', icon: 'icecream' },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('travelease_trips') || '[]');
    const currentTrip = saved.find((t: Trip) => String(t.id) === String(id));
    if (currentTrip) setTripData(currentTrip);
  }, [id]);

  const handleAddItinerary = () => {
    if (!newItinerary.title || !newItinerary.time) {
      alert("Título e Horário são obrigatórios");
      return;
    }
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      time: newItinerary.time,
      title: newItinerary.title,
      description: newItinerary.description,
      type: newItinerary.type,
      status: newItinerary.icon 
    };
    setTripEvents(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
    setModalType('none');
    setNewItinerary({ time: '', title: '', description: '', type: 'activity', icon: 'attractions' });
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        completed: false
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const getEventIconColor = (type: string, status?: string) => {
    if (status) {
      const match = availableIcons.find(i => i.name === status);
      if (match) return `${match.bg} ${match.color}`;
    }
    switch(type) {
      case 'flight': return 'bg-blue-50 text-primary';
      case 'hotel': return 'bg-orange-50 text-orange-600';
      case 'dinner': return 'bg-red-50 text-red-600';
      default: return 'bg-purple-50 text-purple-600';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return (
          <div className="relative pl-0.5 space-y-6">
            {/* Linha da Timeline */}
            <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gray-100 dark:bg-gray-800" />
            
            {tripEvents.map((event) => (
              <div key={event.id} className="relative pl-16">
                {/* Ícone na Linha do Tempo */}
                <div className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center z-10 border-[4px] border-background-light dark:border-background-dark shadow-sm ${getEventIconColor(event.type, event.status)}`}>
                  <span className="material-symbols-outlined text-[20px]">{event.status || 'event'}</span>
                </div>

                {/* Cartão de Detalhes */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[14px] font-bold text-primary">{event.time}</span>
                    {event.statusLabel && (
                      <span className="bg-green-100 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {event.statusLabel}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-[15px] font-bold text-[#111418] dark:text-white leading-tight mb-1">{event.title}</h4>
                  <p className="text-[12px] text-gray-500 font-medium">{event.description}</p>
                  
                  {event.mapUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden h-28 w-full relative">
                      <img src={event.mapUrl} className="w-full h-full object-cover" alt="Map" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <div className="size-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary animate-bounce">
                          <span className="material-symbols-outlined text-[20px]">location_on</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="mt-3 w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-[12px] font-bold text-[#111418] dark:text-white flex items-center justify-center gap-2 transition-colors">
                    {event.type === 'flight' ? (
                      <><span className="material-symbols-outlined text-[16px]">airplane_ticket</span>Ver Ticket</>
                    ) : event.mapUrl ? (
                      <><span className="material-symbols-outlined text-[16px]">directions</span>Direções</>
                    ) : (
                      <><span className="material-symbols-outlined text-[16px]">visibility</span>Detalhes</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-4">
            {bookings.map(b => (
              <div 
                key={b.id} 
                onClick={() => navigate(`/trip/${id}/bookings`)} 
                className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="flex flex-col gap-0.5">
                  <h4 className="font-bold text-[14px]">{b.title}</h4>
                  <p className="text-[11px] text-gray-500">Ref: {b.ref}</p>
                  <p className="text-[11px] text-primary font-bold mt-1">{b.date}</p>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBooking(b);
                    setModalType('booking');
                  }}
                  className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">description</span>
                </div>
              </div>
            ))}
          </div>
        );
      case 'tasks':
        return (
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {tasks.map(t => (
                <div key={t.id} onClick={() => setTasks(prev => prev.map(item => item.id === t.id ? {...item, completed: !item.completed} : item))} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${t.completed ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {t.completed && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                  </div>
                  <span className={`text-[12px] font-medium ${t.completed ? 'text-gray-400 line-through' : ''}`}>{t.text}</span>
                </div>
              ))}
              
              {isAddingTask && (
                <div className="p-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 animate-fade-in">
                  <input 
                    autoFocus
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Digite a nova tarefa..."
                    className="flex-1 bg-transparent text-[12px] font-medium outline-none text-[#111418] dark:text-white"
                  />
                  <button onClick={handleAddTask} className="text-primary font-bold text-[10px] uppercase">Salvar</button>
                </div>
              )}
            </div>
            
            {!isAddingTask && (
              <button onClick={() => setIsAddingTask(true)} className="w-full p-4 text-primary text-[12px] font-bold flex items-center justify-center gap-2 border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-[17px]">add</span> Adicionar Tarefa
              </button>
            )}
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
              <div><p className="text-[7px] font-bold text-primary uppercase tracking-wider">Total Gasto</p><p className="text-lg font-extrabold">€ 115,50</p></div>
              <button onClick={() => navigate('/budget')} className="text-[9px] font-bold bg-primary text-white px-4 py-2 rounded-xl active:scale-95 transition-transform">Ver Detalhes</button>
            </div>
            <div className="space-y-3">
              {tripExpenses.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 text-[18px]">{tx.icon}</span></div>
                    <div><p className="text-[12px] font-bold leading-tight">{tx.title}</p><p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{tx.category}</p></div>
                  </div>
                  <p className="text-[12px] font-bold text-red-500">€ {Math.abs(tx.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-background-light dark:bg-background-dark animate-slide-up overflow-hidden">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center h-14 justify-between px-4">
          <button onClick={() => navigate('/home')} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined text-[20px]">arrow_back</span></button>
          <p className="text-[13px] font-bold">Detalhes da Viagem</p>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
            {showMenu && (
              <div className="absolute right-0 top-11 w-44 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-gray-100 z-50 py-2">
                <button onClick={() => { setShowMenu(false); setModalType('edit'); }} className="w-full px-4 py-2.5 text-left text-[12px] font-semibold flex items-center gap-3"><span className="material-symbols-outlined text-[17px]">edit</span> Editar</button>
                <button onClick={() => { setShowMenu(false); navigate('/memories'); }} className="w-full px-4 py-2.5 text-left text-[12px] font-semibold flex items-center gap-3"><span className="material-symbols-outlined text-[17px]">photo_library</span> Memórias</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-4 pt-4 pb-2">
          <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-lg bg-gray-200" style={{ backgroundImage: `url("${tripData?.imageUrl}")`, backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80"></div>
            <div className="absolute bottom-4 left-4"><h1 className="text-white text-[19px] font-extrabold">{tripData?.destination}</h1></div>
          </div>
        </div>

        {/* AJUSTE VISUAL CONFORME SOLICITADO */}
        <div className="px-6 py-5 flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[22px] font-black leading-none text-[#111418] dark:text-white tracking-tight">
              {tripData?.dateRange.split(',')[0].replace('-', '–')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">calendar_month</span>
              <p className="text-[14px] font-semibold text-[#637588] dark:text-[#93a5b8]">8 dias de viagem</p>
            </div>
          </div>
          
          <div className="flex items-center -space-x-3">
             <img 
               src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" 
               className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#111418] object-cover shadow-sm"
               alt="Traveler 1" 
             />
             <img 
               src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" 
               className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#111418] object-cover shadow-sm"
               alt="Traveler 2" 
             />
             <div className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#111418] bg-[#e6e8eb] dark:bg-gray-700 flex items-center justify-center text-[11px] font-bold text-[#4e5d78] dark:text-white shadow-sm">
               +2
             </div>
          </div>
        </div>

        <div className="flex border-b border-gray-100 px-4">
          {['itinerary', 'bookings', 'tasks', 'expenses'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as TabType)} className={`flex-1 pb-3 pt-2 text-[11px] font-bold transition-all ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}>
              {tab === 'itinerary' ? 'Itinerário' : tab === 'bookings' ? 'Reservas' : tab === 'tasks' ? 'Tarefas' : 'Despesas'}
            </button>
          ))}
        </div>

        <div className="px-6 py-8">
          {renderTabContent()}
        </div>
      </div>

      {/* FAB PADRONIZADO (h-11 w-11) */}
      {activeTab === 'itinerary' && (
        <div className="absolute bottom-6 right-6 z-50">
          <button onClick={() => setModalType('add_itinerary')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xl active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">add</span>
          </button>
        </div>
      )}

      {/* MODAL COM CORREÇÃO DE RECORTE (px-1 e sem overflow-hidden global no container) */}
      {modalType === 'add_itinerary' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><span className="material-symbols-outlined">event_note</span></div>
              <h3 className="text-[16px] font-bold">Novo Itinerário</h3>
            </div>
            
            <div className="space-y-4 max-h-[65vh] overflow-y-auto no-scrollbar pb-2">
              <div className="flex gap-4 px-1">
                <div className="flex-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Hora</label>
                  <input type="time" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-[12px] outline-none ring-1 ring-gray-100 focus:ring-primary" value={newItinerary.time} onChange={(e) => setNewItinerary(prev => ({...prev, time: e.target.value}))} />
                </div>
                <div className="flex-[1.5]">
                  <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Tipo</label>
                  <select className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-[12px] outline-none ring-1 ring-gray-100 focus:ring-primary" value={newItinerary.type} onChange={(e) => setNewItinerary(prev => ({...prev, type: e.target.value as any}))}>
                    <option value="activity">Atividade</option>
                    <option value="flight">Voo</option>
                    <option value="hotel">Hospedagem</option>
                    <option value="dinner">Jantar</option>
                    <option value="transport">Transporte</option>
                    <option value="leisure">Lazer</option>
                    <option value="shopping">Compras</option>
                    <option value="museum">Museu</option>
                    <option value="coffee">Café</option>
                    <option value="bar">Bar/Drinks</option>
                  </select>
                </div>
              </div>

              <div className="px-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Título</label>
                <input placeholder="Ex: Visita ao Louvre" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-[12px] outline-none ring-1 ring-gray-100 focus:ring-primary" value={newItinerary.title} onChange={(e) => setNewItinerary(prev => ({...prev, title: e.target.value}))} />
              </div>

              <div className="px-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">Selecione um Ícone</label>
                <div className="grid grid-cols-7 gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl ring-1 ring-gray-100">
                  {availableIcons.map(icon => (
                    <button key={icon.name} onClick={() => setNewItinerary(prev => ({...prev, icon: icon.name}))} className={`size-8 flex items-center justify-center rounded-lg transition-all ${newItinerary.icon === icon.name ? `${icon.bg} ${icon.color} ring-2 ring-primary/30 scale-110 shadow-sm` : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
                      <span className="material-symbols-outlined text-[18px]">{icon.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalType('none')} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-gray-400 bg-gray-100">Cancelar</button>
              <button onClick={handleAddItinerary} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-white bg-primary shadow-lg shadow-primary/20">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESERVA MELHORADO */}
      {modalType === 'booking' && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-primary p-6 text-white relative">
              <button onClick={() => setModalType('none')} className="absolute top-4 right-4 bg-white/20 rounded-full p-1 hover:bg-white/30 transition-colors">
                <span className="material-symbols-outlined text-white text-[20px]">close</span>
              </button>
              <div className="flex gap-4 items-center">
                 <div className="size-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">{selectedBooking.icon}</span>
                 </div>
                 <div>
                    <h3 className="text-[18px] font-bold leading-tight">{selectedBooking.title}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wide">Confirmado</span>
                 </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Referência</p>
                    <p className="text-[14px] font-bold">{selectedBooking.ref}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Data</p>
                    <p className="text-[14px] font-bold">{selectedBooking.date}</p>
                 </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-[12px] font-medium text-gray-600 dark:text-gray-300 leading-relaxed">{selectedBooking.detail}</p>
              </div>

              <button onClick={() => setModalType('none')} className="w-full h-12 rounded-xl text-[13px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                 Ver voucher completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailsScreen;
