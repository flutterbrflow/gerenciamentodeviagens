
import React from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full justify-between animate-fade-in">
      <div className="flex flex-col flex-grow">
        <div className="w-full px-4 pt-4 pb-2">
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl shadow-md">
            <div 
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYyVqIFpNYUjJtcdcceKc_PHMmRIoL0PXPoSR5iuMUx3bZVqJiF7IZmVT-KtAl7ktCM194QjD2vNDrYVFjBPIHM8YRsh1HkrxKR9Zk37YzX0THowct91UYyKu3D81M1Q1NxuneUn8px2TuPRaHT2GWiDzTvsZ_XwqzVn2z5tH9vnAFKfARQWgmLRSyjGXwOZkgt_fDgL9fp0BjsrGLWdMkapUCO1VRBr0XHmcZ6KHiQJSZI5t05h0rKuIS3a1VHZuwq-hZPd_vaYGI")` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/30 dark:to-black/50"></div>
          </div>
        </div>

        <div className="flex flex-col items-center px-6 pt-6 text-center">
          <h1 className="text-[#111418] dark:text-white tracking-tight text-3xl font-extrabold leading-tight mb-3">
            Explore o Mundo <br/> sem Estresse
          </h1>
          <p className="text-[#637588] dark:text-[#93a5b8] text-base font-normal leading-relaxed max-w-xs mx-auto">
            Organize roteiros, controle gastos e guarde memórias incríveis em um só lugar.
          </p>

          <div className="flex items-center justify-center gap-6 mt-8 opacity-80">
            <div className="flex flex-col items-center gap-1 text-[#111418] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">map</span>
              <span className="text-xs font-medium">Roteiros</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[#111418] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              <span className="text-xs font-medium">Gastos</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[#111418] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">photo_library</span>
              <span className="text-xs font-medium">Memórias</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full px-4 pt-6 pb-8 bg-background-light dark:bg-background-dark">
        <div className="flex w-full flex-row items-center justify-center gap-2 mb-6">
          <div className="h-2 w-6 rounded-full bg-primary"></div>
          <div className="h-2 w-2 rounded-full bg-[#dbe0e6] dark:bg-[#3e4a56]"></div>
          <div className="h-2 w-2 rounded-full bg-[#dbe0e6] dark:bg-[#3e4a56]"></div>
        </div>

        <button 
          onClick={() => navigate('/home')}
          className="flex w-full items-center justify-center rounded-xl h-14 px-5 bg-primary hover:bg-blue-600 active:bg-blue-700 transition-colors text-white text-base font-bold shadow-lg shadow-blue-500/20"
        >
          <span className="truncate">Começar Agora</span>
          <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
        </button>

        <div className="text-center mt-6">
          <p className="text-[#637588] dark:text-[#93a5b8] text-sm font-medium">
            Já tem uma conta? 
            <button onClick={() => navigate('/home')} className="text-primary font-bold hover:underline ml-1">Entrar</button>
          </p>
        </div>
        <div className="h-2"></div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
