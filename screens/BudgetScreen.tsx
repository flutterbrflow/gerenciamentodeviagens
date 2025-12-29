
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Transaction } from '../types';

const BudgetScreen: React.FC = () => {
  const navigate = useNavigate();

  const transactions: Transaction[] = [
    { id: 't1', title: 'Starbucks', category: 'Alimentação', amount: -25.00, date: 'Hoje', icon: 'coffee' },
    { id: 't2', title: 'Uber Trip', category: 'Transporte', amount: -45.00, date: 'Ontem', icon: 'local_taxi' },
    { id: 't3', title: 'Booking.com', category: 'Hospedagem', amount: -400.00, date: 'Ontem', icon: 'hotel' },
    { id: 't4', title: 'Museu do Louvre', category: 'Lazer', amount: -120.00, date: 'Ontem', icon: 'museum' },
  ];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in">
      <header className="flex items-center justify-between bg-surface-light dark:bg-surface-dark px-4 py-3 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-base font-bold leading-tight flex-1 text-center">Orçamento Global</h2>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-2xl">tune</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="px-4 pt-6 pb-2">
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-7 shadow-sm border border-gray-50 dark:border-gray-800">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Saldo Disponível</p>
                <h1 className="text-[32px] font-black tracking-tight mt-1">R$ 3.750,00</h1>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-between text-[13px] font-bold">
                <span className="text-gray-500">Utilizado: <span className="text-[#111418] dark:text-white font-black">R$ 1.250,00</span></span>
                <span className="text-gray-400">Total: R$ 5k</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden p-[2px]">
                <div className="h-full rounded-full bg-primary transition-all duration-700 shadow-sm shadow-primary/20" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[11px] text-right text-primary font-black uppercase tracking-tighter mt-1">25% do orçamento total</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar">
          {[
            { label: 'Alimentação', value: 'R$ 375', icon: 'restaurant', color: 'orange' },
            { label: 'Transporte', value: 'R$ 625', icon: 'directions_bus', color: 'blue' },
            { label: 'Lazer', value: 'R$ 250', icon: 'attractions', color: 'purple' },
          ].map((stat) => (
            <div key={stat.label} className="flex min-w-[150px] flex-col gap-4 rounded-2xl bg-surface-light dark:bg-surface-dark p-5 shadow-sm border border-gray-50 dark:border-gray-800">
              <div className={`flex size-11 items-center justify-center rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
                <p className="text-[17px] font-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-lg font-bold">Distribuição</h3>
            <button className="text-[13px] font-bold text-primary">Configurar</button>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-50 dark:border-gray-800 flex flex-col gap-6">
            {[
              { label: 'Transporte', percent: 50, color: 'bg-blue-500' },
              { label: 'Alimentação', percent: 30, color: 'bg-orange-500' },
              { label: 'Lazer', percent: 20, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[13px] font-bold">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="text-[#111418] dark:text-white font-black">{item.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 mb-10">
          <h3 className="text-lg font-bold mb-5 px-1">Transações</h3>
          <div className="flex flex-col gap-3">
            {transactions.map((tx, idx) => (
              <React.Fragment key={tx.id}>
                {(idx === 0 || transactions[idx - 1].date !== tx.date) && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-4 mb-2">{tx.date}</p>
                )}
                <div className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-transparent shadow-sm hover:border-gray-100 transition-all cursor-pointer active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-[24px] text-gray-500">{tx.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[15px] font-bold text-[#111418] dark:text-white leading-tight">{tx.title}</p>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{tx.category}</p>
                    </div>
                  </div>
                  <p className="text-[15px] font-black text-red-500">
                    - R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      <div className="absolute bottom-28 right-5 z-20">
        <button 
          onClick={() => alert('Adicionar nova transação...')}
          className="flex items-center justify-center size-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[32px]">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default BudgetScreen;
