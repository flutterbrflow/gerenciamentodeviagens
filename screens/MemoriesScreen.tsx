
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface Memory {
  id: string;
  type: 'photo' | 'video';
  url: string;
  location: string;
  date: string;
}

const MemoriesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');

  const memories: Memory[] = [
    { id: 'm1', type: 'photo', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400', location: 'Coliseu, Roma', date: 'Hoje, 14:20' },
    { id: 'm2', type: 'photo', url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&q=80&w=400', location: 'Fontana di Trevi, Roma', date: 'Ontem, 18:45' },
    { id: 'm3', type: 'video', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=400', location: 'Santorini, Grécia', date: '12 Ago, 09:15' },
    { id: 'm4', type: 'photo', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400', location: 'Alpes Suíços', date: '11 Ago, 11:30' },
    { id: 'm5', type: 'photo', url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=400', location: 'Panteão, Roma', date: '10 Ago, 10:00' },
    { id: 'm6', type: 'photo', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400', location: 'Kioto, Japão', date: '05 Ago, 16:20' }
  ];

  const handleShare = async (memory: Memory) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Minha memória em ${memory.location}`, text: `Olha esse lugar incrível!`, url: memory.url });
      } catch (err) { alert('Link copiado!'); }
    } else {
      alert('Link copiado!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in overflow-hidden">
      <header className="flex items-center justify-between bg-surface-light dark:bg-surface-dark px-4 py-3 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col"><h2 className="text-[16px] font-bold leading-tight">Memórias</h2><p className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Viagens • 15 itens</p></div>
        <div className="flex gap-2"><button className="flex size-9 items-center justify-center rounded-full active:bg-gray-100 transition-colors"><span className="material-symbols-outlined text-[20px]">search</span></button><button className="flex size-9 items-center justify-center rounded-full active:bg-gray-100 transition-colors"><span className="material-symbols-outlined text-[20px]">calendar_month</span></button></div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar p-4">
        <div className="columns-2 gap-3 space-y-3">
          {memories.map((memory) => (
            <div key={memory.id} className="relative group rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 break-inside-avoid shadow-sm active:scale-[0.98] transition-transform">
              <img src={memory.url} alt={memory.location} className="w-full object-cover min-h-[120px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 p-2.5 w-full">
                <p className="text-white text-[9px] font-bold truncate">{memory.location}</p>
                <div className="flex items-center justify-between mt-1"><p className="text-white/70 text-[7px]">{memory.date}</p><button onClick={() => handleShare(memory)} className="size-5 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">share</span></button></div>
              </div>
              {memory.type === 'video' && <div className="absolute top-2 right-2 size-5 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined text-[13px]">videocam</span></div>}
            </div>
          ))}
        </div>
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
      <BottomNav />
    </div>
  );
};

export default MemoriesScreen;
