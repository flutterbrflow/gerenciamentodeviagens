
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewBookingScreen: React.FC = () => {
  const navigate = useNavigate();
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
    // Common
    startDate: '', startTime: '', endDate: '', endTime: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setLoading(true);
    // Simulação de salvamento
    setTimeout(() => {
      setLoading(false);
      navigate(-1);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center bg-white dark:bg-surface-dark p-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center size-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors">
           <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h2 className="text-[#111418] dark:text-white text-[16px] font-bold flex-1 text-center pr-9">Nova Reserva</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Type Selector */}
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
          {/* FLIGHT FORM */}
          {activeType === 'flight' && (
            <>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">flight_takeoff</span> Origem & Destino</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cidade Origem</label>
                     <input name="origin" placeholder="Ex: São Paulo" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sigla</label>
                     <input name="originCode" placeholder="GRU" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none text-center font-black uppercase" onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cidade Destino</label>
                     <input name="destination" placeholder="Ex: Paris" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sigla</label>
                     <input name="destCode" placeholder="CDG" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none text-center font-black uppercase" onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">calendar_clock</span> Datas e Horários</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data Ida</label>
                     <input type="date" name="startDate" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário</label>
                     <input type="time" name="startTime" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data Chegada</label>
                     <input type="date" name="endDate" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário</label>
                     <input type="time" name="endTime" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">airplane_ticket</span> Detalhes do Voo</h3>
                <div className="flex gap-3">
                   <div className="flex-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Companhia Aérea</label>
                     <input name="airline" placeholder="Ex: Latam" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                   </div>
                   <div className="w-24">
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nº Voo</label>
                     <input name="flightNum" placeholder="LA304" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none uppercase font-bold" onChange={handleChange} />
                   </div>
                </div>
              </div>
            </>
          )}

          {/* HOTEL FORM */}
          {activeType === 'hotel' && (
             <>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">apartment</span> Dados do Hotel</h3>
                <div className="mb-3">
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nome do Hotel</label>
                   <input name="hotelName" placeholder="Ex: Copacabana Palace" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Endereço</label>
                   <input name="address" placeholder="Av. Atlântica, 1702" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">date_range</span> Estadia</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Check-in Data</label>
                     <input type="date" name="startDate" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário</label>
                     <input type="time" name="startTime" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Check-out Data</label>
                     <input type="date" name="endDate" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário</label>
                     <input type="time" name="endTime" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CAR FORM */}
          {activeType === 'car' && (
             <>
              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">directions_car</span> Veículo</h3>
                <div className="mb-3">
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Locadora</label>
                   <input name="rentalCompany" placeholder="Ex: Localiza" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Modelo / Categoria</label>
                   <input name="carModel" placeholder="Ex: SUV Automático" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">key</span> Retirada</h3>
                <div className="mb-3">
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Local</label>
                   <input name="pickupLoc" placeholder="Ex: Aeroporto GRU" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data</label>
                     <input type="date" name="startDate" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário</label>
                     <input type="time" name="startTime" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">no_crash</span> Devolução</h3>
                <div className="mb-3">
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Local</label>
                   <input name="dropoffLoc" placeholder="Ex: Aeroporto GRU" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none" onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data</label>
                     <input type="date" name="endDate" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Horário</label>
                     <input type="time" name="endTime" className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[12px] outline-none" onChange={handleChange} />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md z-20 max-w-[430px] mx-auto border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white font-bold text-base h-12 rounded-2xl shadow-lg flex items-center justify-center gap-2">
          {loading ? <span className="animate-spin material-symbols-outlined">sync</span> : 'Salvar Reserva'}
        </button>
      </div>
    </div>
  );
};

export default NewBookingScreen;
