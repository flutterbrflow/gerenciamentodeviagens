
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TabType, TimelineEvent, Transaction, Trip, Traveler } from '../types';

const TripDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');
  const [showMenu, setShowMenu] = useState(false);
  
  // Estado para adicionar tarefa
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  
  // Modais Customizados
  const [modalType, setModalType] = useState<'edit_trip' | 'delete' | 'booking' | 'full_voucher' | 'add_itinerary' | 'event_ticket' | 'event_map' | 'event_details' | 'none'>('none');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Estados para o Calendário de Edição
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editStartDate, setEditStartDate] = useState<number | null>(null);
  const [editEndDate, setEditEndDate] = useState<number | null>(null);
  const [activeDateInput, setActiveDateInput] = useState<'ida' | 'volta'>('ida');
  
  // Estados para Edição da Viagem
  const [editDestination, setEditDestination] = useState('');
  const [editTravelers, setEditTravelers] = useState<Traveler[]>([]);
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [newTravelerName, setNewTravelerName] = useState('');

  // Dados da Viagem e Reservas
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [bookingsList, setBookingsList] = useState<any[]>([]);

  // Ícones disponíveis
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
  const [tasks, setTasks] = useState<{ id: number, text: string, completed: boolean }[]>([]);

  // Estado do Itinerário
  const [tripEvents, setTripEvents] = useState<TimelineEvent[]>([]);

  const [newItinerary, setNewItinerary] = useState({
    time: '',
    title: '',
    description: '',
    type: 'activity' as TimelineEvent['type'],
    icon: 'attractions'
  });

  const tripExpenses: Transaction[] = [
    { id: 't1', title: 'Jantar Trastevere', category: 'Alimentação', amount: -325.00, date: '12 Ago', icon: 'restaurant' },
    { id: 't2', title: 'Passagens Trem', category: 'Transporte', amount: -210.00, date: '13 Ago', icon: 'train' },
    { id: 't3', title: 'Gelato Trevi', category: 'Alimentação', amount: -42.50, date: '13 Ago', icon: 'icecream' },
  ];

  useEffect(() => {
    // Carregar Viagem
    const saved = JSON.parse(localStorage.getItem('travelease_trips') || '[]');
    const currentTrip = saved.find((t: Trip) => String(t.id) === String(id));
    if (currentTrip) {
        setTripData(currentTrip);
    }

    // Carregar Reservas sincronizadas com BookingsScreen
    const allBookings = JSON.parse(localStorage.getItem('travelease_bookings') || '[]');
    
    // Filtrar reservas que pertencem a esta viagem (pelo destino/nome da viagem)
    if (currentTrip) {
        const tripBookings = allBookings.filter((b: any) => b.tripName === currentTrip.destination);
        setBookingsList(tripBookings);
    }

    // Carregar Itinerários e Tarefas Reais
    if (id) {
        // MOCK DE DADOS REAIS POR VIAGEM
        const MOCK_DETAILS: any = {
            '1': { // Paris
                events: [
                    { id: 'e1', time: '08:30', title: 'Chegada em Paris (CDG)', description: 'Transfer para o hotel.', type: 'flight', status: 'flight_takeoff', statusLabel: 'Confirmado' },
                    { id: 'e2', time: '14:00', title: 'Check-in Hotel', description: 'ibis Styles Paris Eiffel Cambronne', type: 'hotel', status: 'hotel' },
                    { id: 'e3', time: '16:00', title: 'Torre Eiffel', description: 'Subida ao topo no pôr do sol.', type: 'activity', status: 'attractions' },
                    { id: 'e4', time: '20:00', title: 'Jantar no Le Jules Verne', description: 'Reserva confirmada.', type: 'dinner', status: 'restaurant' }
                ],
                tasks: [
                    { id: 1, text: 'Comprar bilhetes do Louvre', completed: true },
                    { id: 2, text: 'Reservar cruzeiro no Sena', completed: false },
                    { id: 3, text: 'Levar adaptador de tomada', completed: false }
                ]
            },
            '2': { // Tóquio
                events: [
                    { id: 'e1', time: '15:00', title: 'Chegada em Haneda', description: 'Pegar JR Pass e Pocket Wifi.', type: 'flight', status: 'flight_takeoff' },
                    { id: 'e2', time: '17:30', title: 'Shibuya Crossing', description: 'Ver o cruzamento mais famoso do mundo.', type: 'activity', status: 'camera_alt' },
                    { id: 'e3', time: '19:30', title: 'Jantar em Izakaya', description: 'Rua Omoide Yokocho.', type: 'dinner', status: 'restaurant' }
                ],
                tasks: [
                    { id: 1, text: 'Comprar JR Pass', completed: true },
                    { id: 2, text: 'Reservar Pocket Wifi', completed: true },
                    { id: 3, text: 'Baixar mapa offline', completed: false }
                ]
            },
            '3': { // Rio
                events: [
                    { id: 'e1', time: '09:00', title: 'Cristo Redentor', description: 'Trem do Corcovado.', type: 'activity', status: 'attractions' },
                    { id: 'e2', time: '13:00', title: 'Almoço em Santa Teresa', description: 'Aprazível Restaurante.', type: 'dinner', status: 'restaurant' },
                    { id: 'e3', time: '16:00', title: 'Pão de Açúcar', description: 'Bondinho no fim de tarde.', type: 'activity', status: 'camera_alt' }
                ],
                tasks: [
                    { id: 1, text: 'Comprar ingresso Cristo', completed: true },
                    { id: 2, text: 'Separar protetor solar', completed: false },
                    { id: 3, text: 'Reservar restaurante', completed: false }
                ]
            },
            '4': { // Londres
                events: [
                    { id: 'e1', time: '10:00', title: 'Troca da Guarda', description: 'Palácio de Buckingham.', type: 'activity', status: 'attractions' },
                    { id: 'e2', time: '14:00', title: 'British Museum', description: 'Ver a Pedra de Roseta.', type: 'museum', status: 'museum' },
                    { id: 'e3', time: '17:00', title: 'Chá da Tarde', description: 'The Ritz London.', type: 'dinner', status: 'coffee' }
                ],
                tasks: [
                    { id: 1, text: 'Comprar Oyster Card', completed: false },
                    { id: 2, text: 'Levar guarda-chuva', completed: true },
                    { id: 3, text: 'Agendar London Eye', completed: false }
                ]
            },
            '5': { // Bali
                events: [
                    { id: 'e1', time: '08:00', title: 'Yoga em Ubud', description: 'Aula matinal no Yoga Barn.', type: 'activity', status: 'self_improvement' },
                    { id: 'e2', time: '11:00', title: 'Floresta dos Macacos', description: 'Sacred Monkey Forest Sanctuary.', type: 'activity', status: 'park' },
                    { id: 'e3', time: '16:00', title: 'Tanah Lot', description: 'Pôr do sol no templo.', type: 'activity', status: 'temple_hindu' }
                ],
                tasks: [
                    { id: 1, text: 'Alugar scooter', completed: false },
                    { id: 2, text: 'Trocar dinheiro', completed: true },
                    { id: 3, text: 'Comprar repelente', completed: false }
                ]
            },
            '6': { // NY
                events: [
                    { id: 'e1', time: '09:00', title: 'Estátua da Liberdade', description: 'Ferry para Liberty Island.', type: 'activity', status: 'attractions' },
                    { id: 'e2', time: '13:00', title: 'Almoço no Chelsea Market', description: 'Várias opções gastronômicas.', type: 'dinner', status: 'restaurant' },
                    { id: 'e3', time: '20:00', title: 'Show na Broadway', description: 'O Rei Leão.', type: 'activity', status: 'theater_comedy' }
                ],
                tasks: [
                    { id: 1, text: 'Emitir Visto/ESTA', completed: true },
                    { id: 2, text: 'Comprar ingressos Broadway', completed: true },
                    { id: 3, text: 'Seguro viagem EUA', completed: true }
                ]
            },
            '7': { // Cairo
                events: [
                    { id: 'e1', time: '08:00', title: 'Pirâmides de Gizé', description: 'Tour com guia egiptólogo.', type: 'activity', status: 'attractions' },
                    { id: 'e2', time: '12:00', title: 'Esfinge', description: 'Visita ao complexo da Esfinge.', type: 'activity', status: 'camera_alt' },
                    { id: 'e3', time: '15:00', title: 'Museu Egípcio', description: 'Ver o tesouro de Tutankamon.', type: 'museum', status: 'museum' }
                ],
                tasks: [
                    { id: 1, text: 'Visto para o Egito', completed: false },
                    { id: 2, text: 'Contratar guia local', completed: true },
                    { id: 3, text: 'Roupas leves e cobrindo ombros', completed: false }
                ]
            },
            '8': { // Sidney
                events: [
                    { id: 'e1', time: '10:00', title: 'Opera House Tour', description: 'Visita interna guiada.', type: 'activity', status: 'theater_comedy' },
                    { id: 'e2', time: '13:00', title: 'Almoço em Darling Harbour', description: 'Frutos do mar.', type: 'dinner', status: 'restaurant' },
                    { id: 'e3', time: '15:00', title: 'Bondi Beach', description: 'Caminhada Coogee to Bondi.', type: 'activity', status: 'beach_access' }
                ],
                tasks: [
                    { id: 1, text: 'Visto Austrália', completed: false },
                    { id: 2, text: 'Protetor solar fator alto', completed: false },
                    { id: 3, text: 'Reservar aula de surf', completed: false }
                ]
            }
        };

        const details = MOCK_DETAILS[id] || { events: [], tasks: [] };
        
        // Se não tiver eventos carregados (primeira vez), usa o mock. 
        // Em um app real, persistiriamos isso no localStorage individualmente por viagem.
        setTripEvents(details.events);
        setTasks(details.tasks);
    }

  }, [id, tripData?.destination]); // Recalcular se o id ou destino mudar

  // Sync Edit Form with Trip Data when Modal Opens
  useEffect(() => {
    if (modalType === 'edit_trip' && tripData) {
        setEditDestination(tripData.destination);
        
        const parts = tripData.dateRange.match(/(\d+)/g);
        if (parts && parts.length >= 1) setEditStartDate(parseInt(parts[0]));
        else setEditStartDate(null);
        
        if (parts && parts.length >= 2) setEditEndDate(parseInt(parts[parts.length - 2]));
        else setEditEndDate(null);

        setEditTravelers(tripData.travelers || []);
    }
  }, [modalType, tripData]);

  // Função para calcular dias de viagem
  const calculateDuration = (dateRange?: string) => {
    if (!dateRange) return '0 dias de viagem';
    try {
        const parts = dateRange.match(/(\d+) (\w+) - (\d+) (\w+), (\d+)/);
        if (parts) {
            const monthsMap: {[key: string]: number} = { 'Jan':0, 'Fev':1, 'Mar':2, 'Abr':3, 'Mai':4, 'Jun':5, 'Jul':6, 'Ago':7, 'Set':8, 'Out':9, 'Nov':10, 'Dez':11 };
            
            const startDay = parseInt(parts[1]);
            const startMonth = monthsMap[parts[2]];
            const endDay = parseInt(parts[3]);
            const endMonth = monthsMap[parts[4]];
            const year = parseInt(parts[5]);

            const start = new Date(year, startMonth, startDay);
            const end = new Date(year, endMonth, endDay);
            
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia de início
            
            return `${diffDays} dias de viagem`;
        }
        return '8 dias de viagem'; // Fallback
    } catch (e) {
        return '8 dias de viagem';
    }
  };

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
  
  const handleAddTraveler = () => {
    if (newTravelerName.trim()) {
        const newId = `traveler-${Date.now()}`;
        setEditTravelers(prev => [...prev, { 
            id: newId, 
            name: newTravelerName.trim(), 
            image: `https://i.pravatar.cc/150?u=${newId}` 
        }]);
        setNewTravelerName('');
        setShowAddTravelerModal(false);
    }
  };

  const handleSaveEdit = () => {
      if (!tripData) return;
      
      const monthName = currentDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const year = currentDate.getFullYear();
      let newDateRange = tripData.dateRange;
      
      if (editStartDate && editEndDate) {
          newDateRange = `${editStartDate} de ${monthName} - ${editEndDate} de ${monthName}, ${year}`;
      } else if (editStartDate) {
            newDateRange = `${editStartDate} de ${monthName}, ${year}`;
      }

      const updatedTrip: Trip = {
          ...tripData,
          destination: editDestination,
          dateRange: newDateRange,
          travelers: editTravelers
      };
      
      setTripData(updatedTrip);
      
      // Persistir no LocalStorage
      const allTrips = JSON.parse(localStorage.getItem('travelease_trips') || '[]');
      const updatedTrips = allTrips.map((t: Trip) => t.id === updatedTrip.id ? updatedTrip : t);
      localStorage.setItem('travelease_trips', JSON.stringify(updatedTrips));
      
      setModalType('none');
  };

  const handleEventAction = (event: TimelineEvent) => {
    setSelectedEvent(event);
    if (event.type === 'flight') {
        setModalType('event_ticket');
    } else if (event.mapUrl) {
        setModalType('event_map');
    } else {
        setModalType('event_details');
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

  // Funções Calendário Edição
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
    setEditStartDate(null); setEditEndDate(null); // Limpar ao mudar mês na edição para simplificar
  };
  const handleDayClick = (day: number) => {
    if (!editStartDate || (editStartDate && editEndDate) || (day < editStartDate)) {
      setEditStartDate(day);
      setEditEndDate(null);
      setActiveDateInput('volta');
    } else {
      setEditEndDate(day);
      setActiveDateInput('ida');
    }
  };
  const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const shortMonthName = currentDate.toLocaleString('pt-BR', { month: 'short' }).replace('.','');


  const renderTabContent = () => {
    switch (activeTab) {
      case 'itinerary':
        return (
          <div className="relative pl-0.5 space-y-6">
            <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gray-100 dark:bg-gray-800" />
            {tripEvents.length > 0 ? tripEvents.map((event) => (
              <div key={event.id} className="relative pl-16">
                <div className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center z-10 border-[4px] border-background-light dark:border-background-dark shadow-sm ${getEventIconColor(event.type, event.status)}`}>
                  <span className="material-symbols-outlined text-[20px]">{event.status || 'event'}</span>
                </div>
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[14px] font-bold text-primary">{event.time}</span>
                    {event.statusLabel && (<span className="bg-green-100 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-bold">{event.statusLabel}</span>)}
                  </div>
                  <h4 className="text-[15px] font-bold text-[#111418] dark:text-white leading-tight mb-1">{event.title}</h4>
                  <p className="text-[12px] text-gray-500 font-medium">{event.description}</p>
                  {event.mapUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden h-28 w-full relative">
                      <img src={event.mapUrl} className="w-full h-full object-cover" alt="Map" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <div className="size-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary animate-bounce"><span className="material-symbols-outlined text-[20px]">location_on</span></div>
                      </div>
                    </div>
                  )}
                  <button onClick={() => handleEventAction(event)} className="mt-3 w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-[12px] font-bold text-[#111418] dark:text-white flex items-center justify-center gap-2 transition-colors">
                    {event.type === 'flight' ? (<><span className="material-symbols-outlined text-[16px]">airplane_ticket</span>Ver Ticket</>) : event.mapUrl ? (<><span className="material-symbols-outlined text-[16px]">directions</span>Direções</>) : (<><span className="material-symbols-outlined text-[16px]">visibility</span>Detalhes</>)}
                  </button>
                </div>
              </div>
            )) : (
                <div className="pl-10 text-center py-10">
                    <p className="text-gray-400 text-sm">Nenhum itinerário cadastrado.</p>
                </div>
            )}
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-4">
            {bookingsList.map(b => {
              // Mapeamento de propriedades para exibição simples no card
              const title = b.data?.name || (b.data?.origin && b.data?.dest ? `${b.data.origin} -> ${b.data.dest}` : b.title);
              const ref = b.data?.ref || b.ref || 'N/A';
              const date = b.tripDate || b.date;
              const icon = b.type === 'flights' ? 'flight' : b.type === 'hotels' ? 'hotel' : b.type === 'cars' ? 'directions_car' : 'local_activity';
              
              return (
                <div key={b.id} onClick={() => navigate(`/trip/${id}/bookings`)} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer group">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-bold text-[14px]">{title}</h4>
                    <p className="text-[11px] text-gray-500">Ref: {ref}</p>
                    <p className="text-[11px] text-primary font-bold mt-1">{date}</p>
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); setSelectedBooking({ ...b, title, ref, date, icon, detail: 'Detalhes da reserva...' }); setModalType('booking'); }} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                </div>
              );
            })}
            {bookingsList.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                    <p className="text-xs">Nenhuma reserva encontrada</p>
                </div>
            )}
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
                  <input autoFocus value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Digite a nova tarefa..." className="flex-1 bg-transparent text-[12px] font-medium outline-none text-[#111418] dark:text-white" />
                  <button onClick={handleAddTask} className="text-primary font-bold text-[10px] uppercase">Salvar</button>
                </div>
              )}
            </div>
            {!isAddingTask && (<button onClick={() => setIsAddingTask(true)} className="w-full p-4 text-primary text-[12px] font-bold flex items-center justify-center gap-2 border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><span className="material-symbols-outlined text-[17px]">add</span> Adicionar Tarefa</button>)}
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
              <div><p className="text-[7px] font-bold text-primary uppercase tracking-wider">Total Gasto</p><p className="text-lg font-extrabold">R$ 577,50</p></div>
              <button onClick={() => navigate('/budget')} className="text-[9px] font-bold bg-primary text-white px-4 py-2 rounded-xl active:scale-95 transition-transform">Ver Detalhes</button>
            </div>
            <div className="space-y-3">
              {tripExpenses.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center"><span className="material-symbols-outlined text-gray-500 text-[18px]">{tx.icon}</span></div>
                    <div><p className="text-[12px] font-bold leading-tight">{tx.title}</p><p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{tx.category}</p></div>
                  </div>
                  <p className="text-[12px] font-bold text-red-500">R$ {Math.abs(tx.amount).toFixed(2)}</p>
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
                <button onClick={() => { setShowMenu(false); setModalType('edit_trip'); }} className="w-full px-4 py-2.5 text-left text-[12px] font-semibold flex items-center gap-3 hover:bg-gray-50"><span className="material-symbols-outlined text-[17px]">edit</span> Editar</button>
                <button onClick={() => { setShowMenu(false); navigate('/memories'); }} className="w-full px-4 py-2.5 text-left text-[12px] font-semibold flex items-center gap-3 hover:bg-gray-50"><span className="material-symbols-outlined text-[17px]">photo_library</span> Memórias</button>
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

        <div className="px-6 py-5 flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[16px] font-black leading-none text-[#111418] dark:text-white tracking-tight">
              {tripData?.dateRange.split(',')[0].replace('-', '–')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">calendar_month</span>
              <p className="text-[14px] font-semibold text-[#637588] dark:text-[#93a5b8]">
                {calculateDuration(tripData?.dateRange)}
              </p>
            </div>
          </div>
          
          {/* Exibição Dinâmica dos Viajantes */}
          <div className="flex items-center -space-x-3">
             {tripData?.travelers && tripData.travelers.length > 0 ? (
                <>
                  {tripData.travelers.slice(0, 3).map((traveler) => (
                     <img key={traveler.id} src={traveler.image} className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#111418] object-cover shadow-sm" alt={traveler.name} />
                  ))}
                  {tripData.travelers.length > 3 && (
                     <div className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#111418] bg-[#e6e8eb] dark:bg-gray-700 flex items-center justify-center text-[11px] font-bold text-[#4e5d78] dark:text-white shadow-sm">
                       +{tripData.travelers.length - 3}
                     </div>
                  )}
                </>
             ) : (
                <div className="w-10 h-10 rounded-full border-[3px] border-white dark:border-[#111418] bg-[#e6e8eb] flex items-center justify-center">
                   <span className="material-symbols-outlined text-gray-400 text-[18px]">person</span>
                </div>
             )}
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

      {activeTab === 'itinerary' && (
        <div className="absolute bottom-6 right-6 z-50">
          <button onClick={() => setModalType('add_itinerary')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xl active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[26px]">add</span>
          </button>
        </div>
      )}

      {/* MODAL ADICIONAR ITINERARIO */}
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

      {/* MODAL EDITAR VIAGEM (COM CALENDÁRIO E VIAJANTES) */}
      {modalType === 'edit_trip' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar relative">
              <h3 className="text-[18px] font-bold mb-4">Editar Viagem</h3>
              <div className="space-y-4 mb-6">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Destino</label>
                    <input 
                      value={editDestination} 
                      onChange={(e) => setEditDestination(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" 
                    />
                 </div>
                 
                 {/* Calendário Integrado no Editar */}
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Datas</label>
                    <div className="flex gap-2 mb-3">
                        <div className={`flex-1 p-2 rounded-xl border-2 text-left items-start flex flex-col cursor-pointer ${activeDateInput === 'ida' ? 'border-primary bg-primary/5' : 'border-gray-100'}`} onClick={() => setActiveDateInput('ida')}>
                            <span className="text-[9px] font-bold uppercase block text-gray-400">Ida</span>
                            <span className="text-[12px] font-bold">{editStartDate ? `${editStartDate} ${shortMonthName}` : '--'}</span>
                        </div>
                        <div className={`flex-1 p-2 rounded-xl border-2 text-left items-start flex flex-col cursor-pointer ${activeDateInput === 'volta' ? 'border-primary bg-primary/5' : 'border-gray-100'}`} onClick={() => setActiveDateInput('volta')}>
                            <span className="text-[9px] font-bold uppercase block text-gray-400">Volta</span>
                            <span className="text-[12px] font-bold">{editEndDate ? `${editEndDate} ${shortMonthName}` : '--'}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                         <div className="flex items-center justify-between mb-2">
                             <button onClick={() => changeMonth(-1)} className="p-1"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                             {/* Ajuste Mês Capitalizado */}
                             <span className="text-[13px] font-bold capitalize">{currentMonthName}</span>
                             <button onClick={() => changeMonth(1)} className="p-1"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                         </div>
                         <div className="grid grid-cols-7 gap-y-1 text-center">
                              {['D','S','T','Q','Q','S','S'].map(d=><span key={d} className="text-[9px] text-gray-400 font-bold">{d}</span>)}
                              {[...Array(31)].map((_, i) => {
                                  const day = i + 1;
                                  const isSelected = editStartDate !== null && editEndDate !== null && day >= editStartDate && day <= editEndDate;
                                  const isStart = editStartDate === day;
                                  const isEnd = editEndDate === day;
                                  return (
                                    <div key={i} className={`h-8 flex items-center justify-center ${isSelected && !isStart && !isEnd ? 'bg-primary/10' : ''} ${isStart && editEndDate ? 'bg-primary/10 rounded-l-full' : ''} ${isEnd && editStartDate ? 'bg-primary/10 rounded-r-full' : ''}`}>
                                        <button onClick={() => handleDayClick(day)} className={`size-7 rounded-full text-[11px] font-bold flex items-center justify-center ${isStart || isEnd ? 'bg-primary text-white' : isSelected ? 'text-primary' : 'text-gray-600 hover:bg-gray-200'}`}>{day}</button>
                                    </div>
                                  );
                              })}
                         </div>
                    </div>
                 </div>

                 {/* Seção Quem vai com você */}
                 <div className="mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Quem vai com você?</label>
                    <div className="flex items-center gap-4 py-2 overflow-x-auto no-scrollbar">
                        {editTravelers.map((traveler) => (
                        <div key={traveler.id} className="flex flex-col items-center gap-2 shrink-0">
                            <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden bg-gray-200">
                            <img src={traveler.image} className="w-full h-full object-cover" alt={traveler.name} />
                            </div>
                            <span className="text-[10px] font-bold text-[#111418] dark:text-white truncate max-w-[50px]">{traveler.name}</span>
                        </div>
                        ))}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                        <button 
                            onClick={() => setShowAddTravelerModal(true)} 
                            className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-primary active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                        <span className="text-[10px] font-bold text-gray-400">Adicionar</span>
                        </div>
                    </div>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setModalType('none')} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-gray-400 bg-gray-100">Cancelar</button>
                 <button onClick={handleSaveEdit} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-white bg-primary">Salvar</button>
              </div>

              {/* MODAL ANINHADO PARA ADICIONAR VIAJANTE */}
              {showAddTravelerModal && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-md rounded-3xl">
                    <div className="bg-white dark:bg-[#1A2633] p-5 rounded-2xl w-[85%] shadow-2xl animate-scale-in">
                        <h4 className="text-[14px] font-bold mb-3">Nome do Acompanhante</h4>
                        <input 
                            autoFocus
                            value={newTravelerName}
                            onChange={(e) => setNewTravelerName(e.target.value)}
                            placeholder="Ex: Ana Souza"
                            className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none border border-gray-100 dark:border-gray-700 mb-4"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTraveler()}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddTravelerModal(false)} className="flex-1 h-10 rounded-lg text-[12px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200">Cancelar</button>
                            <button onClick={handleAddTraveler} className="flex-1 h-10 rounded-lg text-[12px] font-bold text-white bg-primary">Adicionar</button>
                        </div>
                    </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* MODAL VOUCHER COMPLETO */}
      {modalType === 'full_voucher' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl relative animate-slide-up h-[500px] flex flex-col">
                 <button onClick={() => setModalType('none')} className="absolute top-4 right-4 z-10 size-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                 </button>
                 <div className="bg-gray-100 p-6 flex items-center justify-center border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700">Voucher Oficial</h3>
                 </div>
                 <div className="flex-1 p-8 bg-white flex flex-col items-center justify-center text-center space-y-4">
                     <span className="material-symbols-outlined text-green-500 text-[64px]">check_circle</span>
                     <h2 className="text-xl font-bold">Reserva Confirmada</h2>
                     <p className="text-sm text-gray-500">Apresente este documento na recepção.</p>
                     <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-left mt-4">
                        <p className="text-xs text-gray-400 font-bold uppercase">Código</p>
                        <p className="text-lg font-mono font-bold">{selectedBooking?.ref || 'CONF-1234'}</p>
                     </div>
                 </div>
                 <div className="p-6 bg-gray-50">
                    <button className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">download</span> Baixar PDF
                    </button>
                 </div>
              </div>
          </div>
      )}

      {/* Demais Modais mantidos (Tickets, Mapas, Detalhes...) */}
      {/* ... [Código dos outros modais idêntico ao anterior, omitido para brevidade, mas o booking modal chama setModalType('full_voucher')] ... */}

      {modalType === 'booking' && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl">
            {/* Header Modal Booking */}
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
            {/* Body Modal Booking */}
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
              <button onClick={() => setModalType('full_voucher')} className="w-full h-12 rounded-xl text-[13px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                 Ver voucher completo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... [Modais event_ticket, event_map, event_details mantidos conforme código anterior] ... */}
      {/* Para garantir que o código funcione, replico os modais faltantes aqui rapidamnete para não quebrar a lógica */}
       {modalType === 'event_ticket' && selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl relative animate-slide-up">
              <button onClick={() => setModalType('none')} className="absolute top-4 right-4 z-10 size-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"><span className="material-symbols-outlined text-white text-[18px]">close</span></button>
              <div className="bg-blue-600 p-6 text-white text-center pt-10 pb-8"><h3 className="text-[18px] font-bold mb-1">Cartão de Embarque</h3><p className="opacity-80 text-[12px]">{selectedEvent.description}</p></div>
              <div className="p-6 bg-white dark:bg-surface-dark relative">
                  <div className="flex justify-between items-center mb-6">
                      <div className="text-center"><h1 className="text-3xl font-black text-primary">GRU</h1><p className="text-[10px] text-gray-500">São Paulo</p></div>
                      <span className="material-symbols-outlined text-gray-300 rotate-90">flight</span>
                      <div className="text-center"><h1 className="text-3xl font-black text-primary">FCO</h1><p className="text-[10px] text-gray-500">Roma</p></div>
                   </div>
                   <div className="mt-4 flex justify-center"><div className="h-12 w-full bg-gray-200 flex items-center justify-center text-[10px] font-mono tracking-[4px]">||| || ||| || |||| ||</div></div>
              </div>
           </div>
        </div>
      )}
      {modalType === 'event_map' && selectedEvent && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
             <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl relative animate-slide-up h-[400px] flex flex-col">
                <div className="flex-1 bg-gray-200 relative">
                  <img src={selectedEvent.mapUrl || "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"} className="w-full h-full object-cover" alt="Map" />
                  <div className="absolute inset-0 flex items-center justify-center"><span className="material-symbols-outlined text-red-500 text-[48px] drop-shadow-md">location_on</span></div>
                  <button onClick={() => setModalType('none')} className="absolute top-4 right-4 z-10 size-8 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-colors"><span className="material-symbols-outlined text-white text-[18px]">close</span></button>
                </div>
                <div className="p-5 bg-white dark:bg-surface-dark">
                  <h3 className="font-bold text-[14px]">{selectedEvent.title}</h3>
                  <p className="text-[11px] text-gray-500 mt-1">{selectedEvent.description}</p>
                  <button className="mt-3 w-full bg-primary text-white font-bold py-3 rounded-xl text-[12px] flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[16px]">navigation</span> Iniciar Navegação</button>
                </div>
             </div>
         </div>
      )}
      {modalType === 'event_details' && selectedEvent && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl relative animate-slide-up">
               <button onClick={() => setModalType('none')} className="absolute top-4 right-4 z-10 size-8 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
               <div className="mt-2">
                  <div className={`size-14 rounded-2xl flex items-center justify-center mb-4 ${getEventIconColor(selectedEvent.type, selectedEvent.status)}`}><span className="material-symbols-outlined text-[28px]">{selectedEvent.status || 'event'}</span></div>
                  <h3 className="text-[18px] font-bold mb-2">{selectedEvent.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-6">{selectedEvent.description}</p>
                  <div className="flex gap-4 mb-6">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl"><p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Horário</p><p className="font-bold text-[13px]">{selectedEvent.time}</p></div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl"><p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Status</p><p className="font-bold text-[13px] text-green-600">{selectedEvent.statusLabel || 'Confirmado'}</p></div>
                  </div>
                  <button onClick={() => setModalType('none')} className="w-full h-12 bg-primary text-white font-bold rounded-xl text-[13px]">OK</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default TripDetailsScreen;
