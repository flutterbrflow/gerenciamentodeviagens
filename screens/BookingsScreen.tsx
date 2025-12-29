
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface BookingItem {
  id: string;
  type: 'flights' | 'hotels' | 'cars' | 'activities';
  status: 'upcoming' | 'past' | 'cancelled';
  tripName: string;
  tripDate: string;
  data: any; 
}

const BookingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalType, setModalType] = useState<'none' | 'boardingPass' | 'map' | 'details' | 'voucher'>('none');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('travelease_bookings') || '[]');
    setBookings(savedBookings);
  }, []);

  const handleDelete = (e: React.MouseEvent, bookingId: string) => {
      e.stopPropagation();
      if(window.confirm('Tem certeza que deseja excluir esta reserva?')) {
          // 1. Filter local state
          const updated = bookings.filter(b => b.id !== bookingId);
          setBookings(updated);
          
          // 2. Persist to localStorage immediately
          localStorage.setItem('travelease_bookings', JSON.stringify(updated));
      }
  };

  const filteredBookings = bookings.filter(item => {
    const matchesTab = item.status === activeTab;
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    
    let matchesSearch = true;
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const d = item.data;
        matchesSearch = (
            (item.tripName && item.tripName.toLowerCase().includes(query)) ||
            (d.name && d.name.toLowerCase().includes(query)) ||
            (d.origin && d.origin.toLowerCase().includes(query)) ||
            (d.dest && d.dest.toLowerCase().includes(query))
        );
    }

    return matchesTab && matchesFilter && matchesSearch;
  });

  const groupedBookings: Record<string, BookingItem[]> = {};
  filteredBookings.forEach(item => {
    if (!groupedBookings[item.tripName]) {
      groupedBookings[item.tripName] = [];
    }
    groupedBookings[item.tripName].push(item);
  });

  const handleBack = () => {
    if (id) {
      navigate(`/trip/${id}`);
    } else {
      navigate('/home');
    }
  };

  const openBoardingPass = (item: any) => { setSelectedItem(item); setModalType('boardingPass'); };
  const openMap = (e: React.MouseEvent, item: any) => { 
      e.stopPropagation();
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`, '_blank');
  };
  const openDetails = (item: any) => { setSelectedItem(item); setModalType('details'); };
  const openVoucher = (e: React.MouseEvent, item: any) => {
      e.stopPropagation();
      setSelectedItem(item);
      setModalType('voucher');
  };

  return (
    <div className="flex flex-col h-full bg-[#F6F7F8] dark:bg-background-dark animate-slide-up relative">
      <header className="flex items-center justify-between bg-white dark:bg-surface-dark px-4 py-3 sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={handleBack} className="flex size-7 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-[16px] font-bold leading-tight flex-1 text-center text-[#111418] dark:text-white">Reservas</h2>
        <div className="flex items-center gap-1">
            <button onClick={() => { setShowSearch(!showSearch); if(showSearch) setSearchQuery(''); }} className={`flex size-8 items-center justify-center rounded-full transition-colors ${showSearch ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>
                <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex size-8 items-center justify-center rounded-full transition-colors ${!showFilters ? 'bg-gray-100' : 'bg-primary text-white'}`}>
                <span className="material-symbols-outlined text-[22px]">tune</span>
            </button>
        </div>
      </header>

      <div className="bg-white dark:bg-surface-dark px-4 pb-2 pt-2 border-b border-gray-100 dark:border-gray-800 sticky top-[53px] z-10">
        {showSearch && (
            <div className="relative mb-3 animate-fade-in">
                <div className="absolute left-3 top-2.5 text-gray-400"><span className="material-symbols-outlined text-[20px]">search</span></div>
                <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar reserva..." className="w-full h-10 pl-10 pr-10 bg-gray-100 dark:bg-gray-800 rounded-xl text-[13px] outline-none font-medium placeholder-gray-400 focus:ring-2 ring-primary/20 transition-all" />
                {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined text-[20px]">close</span></button>)}
            </div>
        )}

        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex mb-3">
          {[{ id: 'upcoming', label: 'Próximas' }, { id: 'past', label: 'Passadas' }, { id: 'cancelled', label: 'Canceladas' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 h-8 rounded-lg text-[12px] font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-surface-dark shadow-sm text-black dark:text-white' : 'text-gray-400'}`}>{tab.label}</button>
          ))}
        </div>

        {showFilters && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 animate-fade-in">
            {[{ id: 'all', label: 'Todos', icon: '' }, { id: 'flights', label: 'Voos', icon: 'flight' }, { id: 'hotels', label: 'Hotéis', icon: 'hotel' }, { id: 'cars', label: 'Carros', icon: 'directions_car' }].map((filter) => (
                <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`flex items-center gap-1.5 h-9 px-4 rounded-full border text-[12px] font-bold whitespace-nowrap transition-colors ${activeFilter === filter.id ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-[#111418] dark:text-white'}`}>{filter.icon && <span className="material-symbols-outlined text-[16px]">{filter.icon}</span>}{filter.label}</button>
            ))}
            </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar pt-4 space-y-6">
        {Object.keys(groupedBookings).length > 0 ? (
          Object.keys(groupedBookings).map(tripName => (
            <div key={tripName}>
              <div className="flex justify-between items-end mb-3 px-1">
                <h3 className="text-[16px] font-bold text-[#111418] dark:text-white">{tripName}</h3>
                <span className="text-[12px] font-medium text-gray-400">{groupedBookings[tripName][0].tripDate}</span>
              </div>

              <div className="flex flex-col gap-3">
                {groupedBookings[tripName].map(booking => {
                  const d = booking.data;
                  return (
                      <div key={booking.id} className="relative group">
                          {/* Botão de Exclusão (Fixed z-index and click) */}
                          <button 
                            onClick={(e) => handleDelete(e, booking.id)} 
                            className="absolute top-3 right-3 z-20 p-2 bg-white/80 dark:bg-black/50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shadow-sm"
                          >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>

                          {booking.type === 'flights' && (
                            <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-6 pr-8">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-orange-50 flex items-center justify-center"><span className="material-symbols-outlined text-orange-500">flight_takeoff</span></div>
                                    <div><div className="flex items-center gap-1.5"><span className="text-[13px] font-bold text-[#111418] dark:text-white">{d.origin}</span><span className="material-symbols-outlined text-[14px] text-gray-400">arrow_forward</span><span className="text-[13px] font-bold text-[#111418] dark:text-white">{d.dest}</span></div><p className="text-[10px] text-gray-400 font-medium">{d.airline} • {d.flightNum}</p></div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${booking.status === 'upcoming' ? 'border-green-200 bg-green-50 text-green-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>{d.statusText}</span>
                                </div>
                                <div className="flex justify-between items-center relative mb-6">
                                <div className="absolute left-[50px] right-[50px] top-1/2 h-[1px] bg-gray-200"></div>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2"><span className="material-symbols-outlined text-gray-400 text-[16px] rotate-90">flight</span><p className="text-[9px] text-center text-gray-400 font-bold mt-1">{d.isDirect ? 'Direto' : 'Escala'}</p></div>
                                <div className="absolute top-[calc(50%-15px)] text-[9px] text-gray-400 font-bold left-[calc(50%-15px)] -translate-y-full">{d.duration}</div>
                                <div className="text-center relative z-10 bg-white dark:bg-surface-dark pl-2"><p className="text-[20px] font-black text-[#111418] dark:text-white leading-none">{d.departureTime}</p><p className="text-[11px] font-bold text-gray-400 uppercase">{d.originCode}</p><p className="text-[10px] text-gray-400 mt-1">{d.departureDate}</p></div>
                                <div className="text-center relative z-10 bg-white dark:bg-surface-dark pr-2"><p className="text-[20px] font-black text-[#111418] dark:text-white leading-none">{d.arrivalTime}</p><p className="text-[11px] font-bold text-gray-400 uppercase">{d.destCode}</p><p className="text-[10px] text-gray-400 mt-1">{d.arrivalDate}</p></div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center"><button onClick={() => openBoardingPass(d)} className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition-colors">Ver Cartão de Embarque</button></div>
                            </div>
                          )}

                          {booking.type === 'hotels' && (
                            <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex gap-4 mb-4 pr-8"><div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-purple-500">hotel</span></div><div><h4 className="text-[13px] font-bold text-[#111418] dark:text-white leading-tight">{d.name}</h4><div className="flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-yellow-400 text-[12px] material-symbols-filled">star</span><span className="text-[10px] text-gray-400 font-medium">{d.rating ? `${d.rating} (${d.reviews} reviews)` : 'Novo'}</span></div></div></div>
                                <div className="flex gap-3 mb-4"><div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5"><p className="text-[8px] font-bold text-gray-400 uppercase">CHECK-IN</p><p className="text-[11px] font-bold text-[#111418] dark:text-white">{d.checkIn}</p></div><div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5"><p className="text-[8px] font-bold text-gray-400 uppercase">CHECK-OUT</p><p className="text-[11px] font-bold text-[#111418] dark:text-white">{d.checkOut}</p></div></div>
                                <div className="flex items-center gap-1 text-blue-500"><span className="material-symbols-outlined text-[16px] material-symbols-filled">map</span><button onClick={(e) => openMap(e, d)} className="text-[11px] font-bold hover:underline">Ver no mapa</button></div>
                            </div>
                          )}

                          {booking.type === 'activities' && (
                            <div onClick={() => openDetails(d)} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all pr-12">
                                <div className="flex gap-4"><div className="size-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-red-500">local_activity</span></div><div className="flex flex-col justify-center"><h4 className="text-[13px] font-bold text-[#111418] dark:text-white">{d.name}</h4><p className="text-[10px] text-gray-500 mt-0.5">{d.date}</p><p className="text-[10px] text-gray-400 mt-0.5">{d.details}</p></div></div><span className="material-symbols-outlined text-gray-300">chevron_right</span>
                            </div>
                          )}

                          {booking.type === 'cars' && (
                            <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-4 pr-8"><div className="flex gap-4"><div className="size-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-blue-600">directions_car</span></div><div><h4 className="text-[13px] font-bold text-[#111418] dark:text-white">{d.name}</h4><p className="text-[11px] text-gray-500">{d.model}</p></div></div><span className="px-2.5 py-1 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 text-[10px] font-bold">{d.statusText}</span></div>
                                <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold text-[#111418] dark:text-white">Retirada: {d.pickupDate}</p><p className="text-[10px] text-gray-400 leading-tight max-w-[80px] truncate">{d.pickupLoc}</p></div><span className="material-symbols-outlined text-gray-300">arrow_forward</span><div className="text-right"><p className="text-[11px] font-bold text-[#111418] dark:text-white">Devolução: {d.dropoffDate}</p><p className="text-[10px] text-gray-400 leading-tight max-w-[80px] truncate ml-auto">{d.dropoffLoc}</p></div></div>
                            </div>
                          )}
                      </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20"><span className="material-symbols-outlined text-gray-300 text-[48px] mb-2">event_busy</span><p className="text-gray-400 font-bold text-sm">Nenhuma reserva encontrada</p></div>
        )}
      </main>

      <div className="absolute bottom-24 right-5 z-20">
        <button onClick={() => navigate('/new-booking')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 active:scale-90 transition-transform"><span className="material-symbols-outlined text-[26px]">add</span></button>
      </div>

      {modalType !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-2xl relative animate-slide-up">
            <button onClick={() => setModalType('none')} className="absolute top-4 right-4 z-10 size-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
            
            {modalType === 'boardingPass' && selectedItem && (<div className="flex flex-col"><div className="bg-blue-600 p-6 text-white text-center pt-10 pb-8"><h3 className="text-[18px] font-bold mb-1">Cartão de Embarque</h3><p className="opacity-80 text-[12px]">{selectedItem.airline}</p></div><div className="p-6 bg-white dark:bg-surface-dark relative"><div className="absolute -top-3 left-0 w-full flex justify-center"><div className="w-[90%] border-t-2 border-dashed border-gray-300"></div></div><div className="flex justify-between items-center mb-6"><div className="text-center"><h1 className="text-3xl font-black text-primary">{selectedItem.originCode}</h1><p className="text-[10px] text-gray-500">{selectedItem.origin}</p></div><span className="material-symbols-outlined text-gray-300">flight_takeoff</span><div className="text-center"><h1 className="text-3xl font-black text-primary">{selectedItem.destCode}</h1><p className="text-[10px] text-gray-500">{selectedItem.dest}</p></div></div><div className="space-y-4"><div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-400 font-bold">Voo</span><span className="text-[13px] font-bold">{selectedItem.flightNum}</span></div><div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-400 font-bold">Embarque</span><span className="text-[13px] font-bold">{selectedItem.departureTime}</span></div><div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-400 font-bold">Portão</span><span className="text-[13px] font-bold">B12</span></div></div><div className="mt-8 flex justify-center"><div className="h-12 w-full bg-gray-200 flex items-center justify-center text-[10px] font-mono tracking-[4px]">||| || ||| || |||| ||</div></div></div></div>)}
            
            {modalType === 'voucher' && selectedItem && (<div className="flex flex-col"><div className="bg-primary p-6 text-white text-center pt-10 pb-8"><h3 className="text-[18px] font-bold mb-1">Voucher Confirmado</h3><p className="opacity-80 text-[12px]">{selectedItem.name}</p></div><div className="p-6 bg-white dark:bg-surface-dark relative"><div className="space-y-4"><div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-400 font-bold">Data</span><span className="text-[13px] font-bold">{selectedItem.date || selectedItem.checkIn}</span></div><div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-[11px] text-gray-400 font-bold">Detalhes</span><span className="text-[13px] font-bold">{selectedItem.details || 'N/A'}</span></div><div className="bg-gray-50 p-3 rounded-xl"><p className="text-[10px] text-gray-500">{selectedItem.description || 'Apresente este voucher na entrada.'}</p></div></div><div className="mt-6 flex justify-center"><div className="h-16 w-3/4 bg-gray-800 text-white flex items-center justify-center text-[12px] font-mono rounded-lg">QR CODE SIMULATION</div></div></div></div>)}

            {modalType === 'details' && selectedItem && (<div className="p-6 pt-10"><div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 mx-auto"><span className="material-symbols-outlined text-red-500 text-[32px]">local_activity</span></div><h3 className="text-[18px] font-bold text-center mb-2">{selectedItem.name}</h3><p className="text-[12px] text-gray-500 text-center mb-6">{selectedItem.details}</p><div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6"><p className="text-[12px] leading-relaxed text-gray-600 dark:text-gray-300">{selectedItem.description}</p></div><button onClick={(e) => openVoucher(e, selectedItem)} className="w-full h-12 bg-primary text-white font-bold rounded-xl text-[13px]">Ver Voucher</button></div>)}
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default BookingsScreen;
