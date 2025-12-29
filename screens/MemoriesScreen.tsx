
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface Memory {
  id: string;
  type: 'photo' | 'video';
  url: string;
  location: string;
  date: string; // Ex: "12 Ago" ou "Hoje"
  itemsCount: number; // Novo campo para contagem
}

const MemoriesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  
  // Estados de Filtro
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  // Estado Modal Visualização
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const memories: Memory[] = [
    { id: 'm1', type: 'photo', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400', location: 'Paris, França', date: 'Hoje', itemsCount: 124 },
    { id: 'm2', type: 'photo', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400', location: 'Tóquio, Japão', date: 'Ontem', itemsCount: 45 },
    { id: 'm3', type: 'video', url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=400', location: 'Rio de Janeiro, Brasil', date: '20 Fev', itemsCount: 15 },
    { id: 'm9', type: 'photo', url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&q=80&w=400', location: 'Brasília, Brasil', date: '12 Fev', itemsCount: 12 },
    { id: 'm4', type: 'photo', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400', location: 'Londres, Reino Unido', date: '12 Jul', itemsCount: 89 },
    { id: 'm5', type: 'photo', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400', location: 'Bali, Indonésia', date: '05 Set', itemsCount: 62 },
    { id: 'm6', type: 'photo', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400', location: 'Nova York, EUA', date: '01 Jun', itemsCount: 342 },
    { id: 'm7', type: 'photo', url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=400', location: 'Cairo, Egito', date: '10 Mar', itemsCount: 20 },
    { id: 'm8', type: 'video', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=400', location: 'Sidney, Austrália', date: '15 Nov', itemsCount: 8 }
  ];

  const filteredMemories = memories.filter(m => {
      const matchSearch = m.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = dateFilter ? m.date.toLowerCase().includes(dateFilter.toLowerCase()) : true; 
      return matchSearch && matchDate;
  });

  const handleShare = async (e: React.MouseEvent, memory: Memory) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: `Minha memória em ${memory.location}`, text: `Olha esse lugar incrível!`, url: memory.url });
      } catch (err) { alert('Link copiado!'); }
    } else {
      alert('Link copiado!');
    }
  };

  const toggleDateFilter = (val: string) => {
    if (dateFilter === val) {
      setDateFilter(''); // Desmarcar se já estiver selecionado
    } else {
      setDateFilter(val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in overflow-hidden relative">
      <header className="flex items-center justify-between bg-surface-light dark:bg-surface-dark px-4 py-3 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col"><h2 className="text-[16px] font-bold leading-tight">Memórias</h2><p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Viagens • {filteredMemories.length} itens</p></div>
        <div className="flex gap-2">
            <button 
                onClick={() => { setShowSearch(!showSearch); setShowDateFilter(false); }} 
                className={`flex size-9 items-center justify-center rounded-full transition-colors ${showSearch ? 'bg-primary text-white' : 'active:bg-gray-100'}`}
            >
                <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <button 
                onClick={() => { setShowDateFilter(!showDateFilter); setShowSearch(false); }}
                className={`flex size-9 items-center justify-center rounded-full transition-colors ${showDateFilter ? 'bg-primary text-white' : 'active:bg-gray-100'}`}
            >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </button>
        </div>
      </header>

      {/* SEARCH BAR */}
      {showSearch && (
          <div className="px-4 py-2 bg-white dark:bg-surface-dark border-b border-gray-100 animate-slide-up">
              <div className="relative">
                <input 
                    autoFocus
                    placeholder="Buscar por local..." 
                    className="w-full bg-gray-100 dark:bg-gray-800 p-2.5 pr-10 rounded-xl text-sm outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                )}
              </div>
          </div>
      )}

      {/* DATE FILTER */}
      {showDateFilter && (
          <div className="px-4 py-2 bg-white dark:bg-surface-dark border-b border-gray-100 animate-slide-up flex gap-2 overflow-x-auto no-scrollbar">
              {['Hoje', 'Ontem', 'Agora'].map(d => (
                  <button 
                    key={d} 
                    onClick={() => toggleDateFilter(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${dateFilter === d ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                  >
                      {d}
                  </button>
              ))}
          </div>
      )}

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar p-4">
        {filteredMemories.length > 0 ? (
            <div className="columns-2 gap-3 space-y-3">
            {filteredMemories.map((memory) => (
                <div key={memory.id} onClick={() => setSelectedMemory(memory)} className="relative group rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 break-inside-avoid shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                <img src={memory.url} alt={memory.location} className="w-full object-cover min-h-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity"></div>
                
                {/* Contador de Mídia (Novo) */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-white text-[10px]">
                        {memory.type === 'video' ? 'videocam' : 'photo_library'}
                    </span>
                    <span className="text-[9px] text-white font-bold">{memory.itemsCount}</span>
                </div>

                <div className="absolute bottom-0 left-0 p-2.5 w-full">
                    <p className="text-white text-[9px] font-bold truncate">{memory.location}</p>
                    <div className="flex items-center justify-between mt-1"><p className="text-white/70 text-[7px]">{memory.date}</p><button onClick={(e) => handleShare(e, memory)} className="size-5 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">share</span></button></div>
                </div>
                {memory.type === 'video' && <div className="absolute top-2 right-2 size-5 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined text-[13px]">videocam</span></div>}
                </div>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                 <span className="material-symbols-outlined text-[32px] mb-2">image_not_supported</span>
                 <p className="text-xs">Nenhuma memória encontrada</p>
            </div>
        )}
      </main>

      {!isCapturing && (
        <div className="absolute bottom-24 right-4 z-20"><button onClick={() => setIsCapturing(true)} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-transform"><span className="material-symbols-outlined text-[28px]">photo_camera</span></button></div>
      )}

      {isCapturing && (
        <div className="absolute inset-0 z-50 bg-black animate-in fade-in">
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800")` }}></div>
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <button onClick={() => setIsCapturing(false)} className="text-white"><span className="material-symbols-outlined text-[24px]">close</span></button>
            <div className="flex gap-4"><span className="material-symbols-outlined text-white text-[20px]">flash_off</span><span className="material-symbols-outlined text-white text-[20px]">settings</span></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-6 mb-6">
              <button onClick={() => setCaptureMode('video')} className={`text-[10px] font-bold uppercase tracking-widest ${captureMode === 'video' ? 'text-primary' : 'text-white/60'}`}>Vídeo</button>
              <button onClick={() => setCaptureMode('photo')} className={`text-[10px] font-bold uppercase tracking-widest ${captureMode === 'photo' ? 'text-primary' : 'text-white/60'}`}>Foto</button>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="size-10 rounded-lg border border-white/30 overflow-hidden bg-gray-800"><img src={memories[0].url} className="w-full h-full object-cover opacity-50" /></div>
              <button onClick={() => setIsCapturing(false)} className="size-16 rounded-full border-4 border-white flex items-center justify-center p-1"><div className={`size-full rounded-full ${captureMode === 'photo' ? 'bg-white' : 'bg-red-500'}`}></div></button>
              <button className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"><span className="material-symbols-outlined text-[22px]">cameraswitch</span></button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FULL SCREEN MEMORY */}
      {selectedMemory && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
              <button onClick={() => setSelectedMemory(null)} className="absolute top-6 right-6 z-10 size-10 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                  <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
              <img src={selectedMemory.url} className="max-w-full max-h-full object-contain" alt={selectedMemory.location} />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-lg font-bold">{selectedMemory.location}</h3>
                  <p className="text-sm opacity-80">{selectedMemory.date} • {selectedMemory.itemsCount} itens</p>
              </div>
          </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MemoriesScreen;
