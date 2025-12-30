
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NewBookingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeType, setActiveType] = useState<'flight' | 'hotel' | 'car'>('flight');
  const [loading, setLoading] = useState(false);

  // States genéricos para capturar dados
  const [formData, setFormData] = useState({
    // Flight
    origin: '', originCode: '', destination: '', destCode: '', airline: '', flightNum: '',
    // Hotel
    hotelName: '', address: '',
    // Car
    rentalCompany: '', carModel: '', pickupLoc: '', dropoffLoc: '',
  });

  // States específicos de data/hora para evitar conflito
  const [flightDates, setFlightDates] = useState({ startDate: '', startTime: '12:00', endDate: '', endTime: '12:00' });
  const [hotelDates, setHotelDates] = useState({ startDate: '', startTime: '14:00', endDate: '', endTime: '11:00' });
  const [carDates, setCarDates] = useState({ startDate: '', startTime: '09:00', endDate: '', endTime: '18:00' });

  // Estados para o Modal de Data/Hora
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingField, setEditingField] = useState<'start' | 'end'>('start');
  
  // Estados internos do calendário
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [tempDate, setTempDate] = useState<string>(''); // YYYY-MM-DD
  const [tempTime, setTempTime] = useState<string>(''); // HH:mm

  // Preencher dados vindos da IA
  useEffect(() => {
      if (location.state && location.state.aiData) {
          const data = location.state.aiData;
          if (data.type) setActiveType(data.type);
          
          setFormData(prev => ({
              ...prev,
              origin: data.origin || prev.origin,
              destination: data.destination || prev.destination,
              hotelName: data.hotelName || prev.hotelName,
              rentalCompany: data.rentalCompany || prev.rentalCompany,
              // Auto generate codes just for show
              originCode: data.origin ? data.origin.substring(0,3).toUpperCase() : prev.originCode,
              destCode: data.destination ? data.destination.substring(0,3).toUpperCase() : prev.destCode,
          }));

          if (data.startDate) {
              if (data.type === 'flight') setFlightDates(prev => ({ ...prev, startDate: data.startDate, startTime: data.startTime || prev.startTime, endDate: data.endDate || prev.endDate, endTime: data.endTime || prev.endTime }));
              if (data.type === 'hotel') setHotelDates(prev => ({ ...prev, startDate: data.startDate, startTime: data.startTime || prev.startTime, endDate: data.endDate || prev.endDate, endTime: data.endTime || prev.endTime }));
              if (data.type === 'car') setCarDates(prev => ({ ...prev, startDate: data.startDate, startTime: data.startTime || prev.startTime, endDate: data.endDate || prev.endDate, endTime: data.endTime || prev.endTime }));
          }
      }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getActiveDateState = () => {
      switch(activeType) {
          case 'flight': return flightDates;
          case 'hotel': return hotelDates;
          case 'car': return carDates;
      }
  };

  const handleOpenDateModal = (field: 'start' | 'end') => {
    setEditingField(field);
    
    const currentDates = getActiveDateState();
    const dateValue = field === 'start' ? currentDates.startDate : currentDates.endDate;
    const timeValue = field === 'start' ? currentDates.startTime : currentDates.endTime;
    
    const initialDate = dateValue ? new Date(dateValue + 'T12:00:00') : new Date();
    
    setCurrentMonthDate(initialDate);
    setTempDate(dateValue || initialDate.toISOString().split('T')[0]);
    setTempTime(timeValue || '12:00');
    
    setShowDateModal(true);
  };

  const handleConfirmDateTime = () => {
    if (activeType === 'flight') {
        if (editingField === 'start') setFlightDates(prev => ({ ...prev, startDate: tempDate, startTime: tempTime }));
        else setFlightDates(prev => ({ ...prev, endDate: tempDate, endTime: tempTime }));
    } else if (activeType === 'hotel') {
        if (editingField === 'start') setHotelDates(prev => ({ ...prev, startDate: tempDate, startTime: tempTime }));
        else setHotelDates(prev => ({ ...prev, endDate: tempDate, endTime: tempTime }));
    } else {
        if (editingField === 'start') setCarDates(prev => ({ ...prev, startDate: tempDate, startTime: tempTime }));
        else setCarDates(prev => ({ ...prev, endDate: tempDate, endTime: tempTime }));
    }
    setShowDateModal(false);
  };

  // Funções de Calendário
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonthDate);
    newDate.setDate(1); 
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonthDate(newDate);
  };

  const handleDayClick = (day: number) => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth() + 1;
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setTempDate(formattedDate);
  };

  const formatDisplayDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) return 'Selecionar Data';
    try {
        const parts = dateStr.split('-');
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const day = date.getDate();
        const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        return `${day} ${month} • ${timeStr}`;
    } catch (e) {
        return dateStr;
    }
  };

  const handleSave = () => {
    setLoading(true);
    
    let newBooking: any = {
      id: Date.now().toString(),
      status: 'upcoming',
      tripName: 'Brasília, Brasil', 
      tripDate: 'Em breve',
      data: {
         statusText: 'Confirmado'
      }
    };

    if (activeType === 'flight') {
        newBooking.type = 'flights';
        newBooking.data = {
            ...newBooking.data,
            origin: formData.origin || 'Origem',
            dest: formData.destination || 'Destino',
            originCode: formData.originCode || formData.origin?.substring(0,3).toUpperCase() || 'ORG',
            destCode: formData.destCode || formData.destination?.substring(0,3).toUpperCase() || 'DST',
            flightNum: formData.flightNum || 'VOO 000',
            departureTime: flightDates.startTime || '00:00',
            departureDate: formatDisplayDateTime(flightDates.startDate, '').split('•')[0].trim(),
            arrivalTime: flightDates.endTime || '00:00',
            arrivalDate: formatDisplayDateTime(flightDates.endDate, '').split('•')[0].trim(),
            duration: 'Calculando...',
            isDirect: true,
            airline: formData.airline || 'Companhia'
        };
    } else if (activeType === 'hotel') {
        newBooking.type = 'hotels';
        newBooking.data = {
            ...newBooking.data,
            name: formData.hotelName || 'Novo Hotel',
            checkIn: formatDisplayDateTime(hotelDates.startDate, hotelDates.startTime),
            checkOut: formatDisplayDateTime(hotelDates.endDate, hotelDates.endTime),
            image: 'hotel',
            rating: 0,
            reviews: 0
        };
    } else if (activeType === 'car') {
        newBooking.type = 'cars';
        newBooking.data = {
            ...newBooking.data,
            name: formData.rentalCompany || 'Locadora',
            model: formData.carModel || 'Carro',
            pickupDate: formatDisplayDateTime(carDates.startDate, ''),
            pickupLoc: formData.pickupLoc || 'Local de Retirada',
            dropoffDate: formatDisplayDateTime(carDates.endDate, ''),
            dropoffLoc: formData.dropoffLoc || 'Local de Devolução',
            statusText: 'Reservado'
        };
    }

    const savedBookings = JSON.parse(localStorage.getItem('travelease_bookings') || '[]');
    savedBookings.unshift(newBooking);
    localStorage.setItem('travelease_bookings', JSON.stringify(savedBookings));

    setTimeout(() => {
      setLoading(false);
      navigate(-1);
    }, 800);
  };

  const currentMonthName = currentMonthDate.toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const calendarTitle = `${capitalizedMonth} de ${currentMonthDate.getFullYear()}`;

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const DateTrigger = ({ label, icon, date, time, onClick }: { label: string, icon: string, date: string, time: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left group"
    >
        <div className="flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[14px] text-gray-400 group-hover:text-primary transition-colors">{icon}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-[13px] font-bold text-[#111418] dark:text-white truncate">
            {date ? formatDisplayDateTime(date, time) : <span className="text-gray-400 font-normal">Selecionar...</span>}
        </p>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in relative">
      <header className="flex items-center justify-between bg-white dark:bg-surface-dark px-4 py-3 sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="flex size-7 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-[16px] font-bold leading-tight flex-1 text-center text-[#111418] dark:text-white">Nova Reserva</h2>
        <div className="size-7"></div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="p-4">
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
            {[
              { id: 'flight', label: 'Voo', icon: 'flight' },
              { id: 'hotel', label: 'Hotel', icon: 'hotel' },
              { id: 'car', label: 'Carro', icon: 'directions_car' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-[13px] font-bold transition-all ${
                  activeType === type.id 
                    ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' 
                    : 'text-gray-500'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 flex flex-col gap-5">
          {activeType === 'flight' && (
            <>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">flight_takeoff</span> Origem & Destino</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cidade Origem</label><input name="origin" value={formData.origin} placeholder="Ex: São Paulo" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sigla</label><input name="originCode" value={formData.originCode} placeholder="GRU" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none text-center font-black uppercase" onChange={handleChange} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cidade Destino</label><input name="destination" value={formData.destination} placeholder="Ex: Paris" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sigla</label><input name="destCode" value={formData.destCode} placeholder="CDG" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none text-center font-black uppercase" onChange={handleChange} /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">calendar_month</span> Datas e Horários</h3>
                <div className="flex gap-3"><DateTrigger label="Ida" icon="flight_takeoff" date={flightDates.startDate} time={flightDates.startTime} onClick={() => handleOpenDateModal('start')} /><DateTrigger label="Volta" icon="flight_land" date={flightDates.endDate} time={flightDates.endTime} onClick={() => handleOpenDateModal('end')} /></div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">airplane_ticket</span> Detalhes do Voo</h3>
                <div className="flex gap-3"><div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Companhia Aérea</label><input name="airline" value={formData.airline} placeholder="Ex: Latam" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div><div className="w-24"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nº Voo</label><input name="flightNum" value={formData.flightNum} placeholder="LA304" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none uppercase font-bold" onChange={handleChange} /></div></div>
              </div>
            </>
          )}
          {activeType === 'hotel' && (
             <>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">apartment</span> Dados do Hotel</h3>
                <div className="mb-3"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nome do Hotel</label><input name="hotelName" value={formData.hotelName} placeholder="Ex: Copacabana Palace" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Endereço</label><input name="address" value={formData.address} placeholder="Av. Atlântica, 1702" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">date_range</span> Estadia</h3>
                <div className="flex gap-3"><DateTrigger label="Check-in" icon="login" date={hotelDates.startDate} time={hotelDates.startTime} onClick={() => handleOpenDateModal('start')} /><DateTrigger label="Check-out" icon="logout" date={hotelDates.endDate} time={hotelDates.endTime} onClick={() => handleOpenDateModal('end')} /></div>
              </div>
            </>
          )}
          {activeType === 'car' && (
             <>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">directions_car</span> Veículo</h3>
                <div className="mb-3"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Locadora</label><input name="rentalCompany" value={formData.rentalCompany} placeholder="Ex: Localiza" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Modelo / Categoria</label><input name="carModel" value={formData.carModel} placeholder="Ex: SUV Automático" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">key</span> Retirada</h3>
                <div className="mb-3"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Local</label><input name="pickupLoc" value={formData.pickupLoc} placeholder="Ex: Aeroporto GRU" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
                <DateTrigger label="Data e Hora da Retirada" icon="event_available" date={carDates.startDate} time={carDates.startTime} onClick={() => handleOpenDateModal('start')} />
              </div>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">no_crash</span> Devolução</h3>
                <div className="mb-3"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Local</label><input name="dropoffLoc" value={formData.dropoffLoc} placeholder="Ex: Aeroporto GRU" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} /></div>
                <DateTrigger label="Data e Hora da Devolução" icon="event_busy" date={carDates.endDate} time={carDates.endTime} onClick={() => handleOpenDateModal('end')} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md z-20 max-w-[430px] mx-auto border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-base h-12 rounded-2xl shadow-lg flex items-center justify-center gap-2">{loading ? <span className="animate-spin material-symbols-outlined">sync</span> : 'Salvar Reserva'}</button>
      </div>

      {showDateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[16px] font-bold">
                    {editingField === 'start' ? (activeType === 'hotel' ? 'Data do Check-in' : 'Data de Partida') : (activeType === 'hotel' ? 'Data do Check-out' : 'Data de Volta')}
                 </h3>
                 <button onClick={() => setShowDateModal(false)} className="size-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"><span className="material-symbols-outlined text-[18px]">close</span></button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                   <div className="flex items-center justify-between mb-2">
                       <button onClick={() => changeMonth(-1)} className="p-1"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                       <span className="text-[13px] font-bold">{calendarTitle}</span>
                       <button onClick={() => changeMonth(1)} className="p-1"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
                   </div>
                   <div className="grid grid-cols-7 gap-y-1 text-center">
                        {['D','S','T','Q','Q','S','S'].map(d=><span key={d} className="text-[9px] text-gray-400 font-bold">{d}</span>)}
                        {[...Array(getDaysInMonth(currentMonthDate))].map((_, i) => {
                            const day = i + 1;
                            const year = currentMonthDate.getFullYear();
                            const month = currentMonthDate.getMonth() + 1;
                            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                            const isSelected = tempDate === dateStr;
                            return (<div key={i} className="h-8 flex items-center justify-center"><button onClick={() => handleDayClick(day)} className={`size-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{day}</button></div>);
                        })}
                   </div>
              </div>
              <div className="mb-6">
                 <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Horário</label>
                 <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700">
                    <span className="material-symbols-outlined text-gray-400 ml-2">schedule</span>
                    <input type="time" value={tempTime} onChange={(e) => setTempTime(e.target.value)} className="w-full bg-transparent p-2 text-center text-[18px] font-bold outline-none text-[#111418] dark:text-white" />
                 </div>
              </div>
              <button onClick={handleConfirmDateTime} className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform">Confirmar Data e Hora</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default NewBookingScreen;
