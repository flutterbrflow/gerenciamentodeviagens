
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
    {
      id: 'm1',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400',
      location: 'Coliseu, Roma',
      date: 'Hoje, 14:20'
    },
    {
      id: 'm2',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&q=80&w=400',
      location: 'Fontana di Trevi, Roma',
      date: 'Ontem, 18:45'
    },
    {
      id: 'm3',
      type: 'video',
      url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=400',
      location: 'Vaticano',
      date: '12 Ago, 09:15'
    },
    {
      id: 'm4',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1515542641795-85edde8ca67a?auto=format&fit=crop&q=80&w=400',
      location: 'Panteão',
      date: '11 Ago, 11:30'
    }
  ];

  const handleShare = async (memory: Memory) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Minha memória em ${memory.location}`,
          text: `Olha esse lugar incrível que visitei em Roma!`,
          url: memory.url,
        });
      } catch (err) {
        console.log('Erro ao compartilhar', err);
      }
    } else {
      alert('Compartilhamento não suportado neste navegador. Link copiado!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between bg-surface-light dark:bg-surface-dark px-4 py-3 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold leading-tight">Memórias</h2>
          <p className="text-xs text-gray-500 font-medium">Roma • 12 memórias</p>
        </div>
        <div className="flex gap-2">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </button>
        </div>
      </header>

      {/* Gallery */}
      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar p-4">
        <div className="columns-2 gap-4 space-y-4">
          {memories.map((memory) => (
            <div 
              key={memory.id} 
              className="relative group rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 break-inside-avoid shadow-sm"
            >
              <img 
                src={memory.url} 
                alt={memory.location} 
                className="w-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 p-3 w-full">
                <p className="text-white text-[10px] font-bold truncate">{memory.location}</p>
                <div className="flex items-center justify-between mt-1">
                   <p className="text-white/70 text-[8px]">{memory.date}</p>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleShare(memory)}
                       className="size-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                     >
                       <span className="material-symbols-outlined text-[14px]">share</span>
                     </button>
                   </div>
                </div>
              </div>

              {/* Video Indicator */}
              {memory.type === 'video' && (
                <div className="absolute top-2 right-2 size-6 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State placeholder if needed */}
        {memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <div className="size-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-gray-400">add_a_photo</span>
            </div>
            <h3 className="text-lg font-bold">Nenhuma memória ainda</h3>
            <p className="text-sm text-gray-500 mt-2">Comece a registrar os lugares incríveis por onde você passar.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {!isCapturing && (
        <div className="absolute bottom-24 right-4 z-20">
          <button 
            onClick={() => setIsCapturing(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[32px]">photo_camera</span>
          </button>
        </div>
      )}

      {/* Camera Capture Overlay (Simulated) */}
      {isCapturing && (
        <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-300">
          {/* Camera Viewfinder Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800")` }}
          ></div>
          
          {/* Top Bar */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <button onClick={() => setIsCapturing(false)} className="text-white">
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-white text-[24px]">flash_off</span>
              <span className="material-symbols-outlined text-white text-[24px]">settings</span>
            </div>
          </div>

          {/* Bottom Bar Controls */}
          <div className="absolute bottom-0 left-0 w-full p-10 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent">
            {/* Mode Selector */}
            <div className="flex gap-8 mb-8">
              <button 
                onClick={() => setCaptureMode('video')}
                className={`text-sm font-bold uppercase tracking-widest ${captureMode === 'video' ? 'text-primary' : 'text-white/60'}`}
              >
                Vídeo
              </button>
              <button 
                onClick={() => setCaptureMode('photo')}
                className={`text-sm font-bold uppercase tracking-widest ${captureMode === 'photo' ? 'text-primary' : 'text-white/60'}`}
              >
                Foto
              </button>
            </div>

            {/* Shutter row */}
            <div className="flex items-center justify-between w-full">
              <div className="size-12 rounded-lg border-2 border-white/50 overflow-hidden bg-gray-800">
                <img src={memories[0].url} className="w-full h-full object-cover opacity-50" alt="Last capture" />
              </div>
              
              <button 
                onClick={() => {
                  alert(captureMode === 'photo' ? 'Foto capturada!' : 'Vídeo gravado!');
                  setIsCapturing(false);
                }}
                className={`size-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform`}
              >
                <div className={`size-full rounded-full ${captureMode === 'photo' ? 'bg-white' : 'bg-red-500'}`}></div>
              </button>

              <button className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[28px]">cameraswitch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MemoriesScreen;
