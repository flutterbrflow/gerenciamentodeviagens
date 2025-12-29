
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Viagens', icon: 'airplane_ticket', path: '/home' },
    { label: 'Memórias', icon: 'photo_library', path: '/memories' },
    { label: 'Orçamento', icon: 'payments', path: '/budget' },
    { label: 'Perfil', icon: 'person', path: '/profile' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 w-full bg-white dark:bg-[#111418] border-t border-gray-100 dark:border-[#22303e] pb-safe pt-2 px-2 z-30">
      <div className="flex justify-around items-center h-16 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 w-16 transition-all duration-200 ${
                isActive ? 'text-primary scale-110' : 'text-[#9ba8b8] hover:text-gray-600 dark:hover:text-gray-400'
              }`}
            >
              <span className={`material-symbols-outlined text-[26px] ${isActive ? 'material-symbols-filled' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-4 sm:h-0"></div>
    </nav>
  );
};

export default BottomNav;
