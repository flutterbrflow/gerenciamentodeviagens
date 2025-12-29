
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Transaction } from '../types';

const BudgetScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'none' | 'config'>('none');
  
  // States para configuração e filtro
  const [totalBudget, setTotalBudget] = useState(5000);
  const [dateFilter, setDateFilter] = useState('all');

  const [newTransaction, setNewTransaction] = useState({ title: '', amount: '', category: 'Alimentação' });
  
  // Lista expandida de transações iniciais
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([
    { id: 't1', title: 'Starbucks', category: 'Alimentação', amount: -25.00, date: 'Hoje', icon: 'coffee' },
    { id: 't2', title: 'Uber Trip', category: 'Transporte', amount: -45.00, date: 'Hoje', icon: 'local_taxi' },
    { id: 't3', title: 'Farmácia', category: 'Saúde', amount: -85.50, date: 'Hoje', icon: 'local_pharmacy' },
    { id: 't4', title: 'Booking.com', category: 'Hospedagem', amount: -400.00, date: 'Ontem', icon: 'hotel' },
    { id: 't5', title: 'Museu do Louvre', category: 'Passeios', amount: -120.00, date: 'Ontem', icon: 'museum' },
    { id: 't6', title: 'Jantar Bistrô', category: 'Alimentação', amount: -150.00, date: 'Ontem', icon: 'restaurant' },
    { id: 't7', title: 'Souvenirs', category: 'Presentes', amount: -60.00, date: '12 Out', icon: 'card_giftcard' },
    { id: 't8', title: 'Metrô Paris', category: 'Transporte', amount: -12.00, date: '12 Out', icon: 'train' },
    { id: 't9', title: 'Seguro Viagem', category: 'Saúde', amount: -250.00, date: '10 Out', icon: 'health_and_safety' },
    { id: 't10', title: 'Chip Celular', category: 'Outros', amount: -30.00, date: '10 Out', icon: 'sim_card' },
  ]);

  const handleAddTransaction = () => {
    if (!newTransaction.title || !newTransaction.amount) return;

    const iconsMap: Record<string, string> = {
      'Alimentação': 'restaurant',
      'Transporte': 'directions_bus',
      'Hospedagem': 'hotel',
      'Lazer': 'attractions',
      'Compras': 'shopping_bag',
      'Saúde': 'local_pharmacy',
      'Presentes': 'card_giftcard',
      'Passeios': 'tour',
      'Outros': 'receipt'
    };

    const tx: Transaction = {
      id: Date.now().toString(),
      title: newTransaction.title,
      amount: -parseFloat(newTransaction.amount),
      category: newTransaction.category,
      date: 'Hoje',
      icon: iconsMap[newTransaction.category] || 'payments'
    };

    setLocalTransactions([tx, ...localTransactions]);
    setShowAddModal(false);
    setNewTransaction({ title: '', amount: '', category: 'Alimentação' });
  };

  // Lógica de filtro
  const filteredTransactions = localTransactions.filter(tx => {
    if (dateFilter === 'today') return tx.date === 'Hoje';
    if (dateFilter === 'week') return ['Hoje', 'Ontem', '12 Out'].includes(tx.date); // Simulação
    if (dateFilter === 'month') return true; // Simulação
    return true;
  });

  // 1. Saldo Disponível (Baseado em TUDO o que foi gasto, independente do filtro)
  const totalUsedGlobal = Math.abs(localTransactions.reduce((acc, curr) => acc + curr.amount, 0));
  const remainingGlobal = totalBudget - totalUsedGlobal;

  // 2. Utilizado (Baseado no filtro atual para mostrar quanto foi gasto no período)
  const usedAmountFiltered = Math.abs(filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0));
  
  // Porcentagem global para a barra de progresso
  const percentUsedGlobal = totalBudget > 0 ? Math.min(100, (totalUsedGlobal / totalBudget) * 100) : 0;

  // 3. Totais por Categoria (Baseado nos filtros selecionados)
  const getCategoryTotal = (cat: string) => {
    const total = filteredTransactions
        .filter(t => t.category === cat)
        .reduce((acc, curr) => acc + curr.amount, 0);
    return Math.abs(total);
  };

  const categoryStats = [
    { label: 'Alimentação', value: getCategoryTotal('Alimentação'), icon: 'restaurant', color: 'orange' },
    { label: 'Transporte', value: getCategoryTotal('Transporte'), icon: 'directions_bus', color: 'blue' },
    { label: 'Lazer', value: getCategoryTotal('Lazer') + getCategoryTotal('Passeios'), icon: 'attractions', color: 'purple' }, // Somando lazer e passeios
  ];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in relative">
      <header className="flex items-center justify-between bg-surface-light dark:bg-surface-dark px-4 py-3 sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate('/home')} className="flex size-7 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-[16px] font-bold leading-tight flex-1 text-center text-[#111418] dark:text-white">Orçamento Global</h2>
        <button 
          onClick={() => setModalType('config')}
          className={`flex size-7 items-center justify-center rounded-full transition-colors hover:bg-gray-100`}
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </header>

      {/* FILTROS (CHIPS) */}
      <div className="bg-white dark:bg-surface-dark px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-[53px] z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todo o Período' },
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mês' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setDateFilter(filter.id)}
              className={`flex items-center justify-center h-8 px-4 rounded-full border text-[12px] font-bold whitespace-nowrap transition-colors ${
                dateFilter === filter.id 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700 text-[#111418] dark:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="px-4 pt-4 pb-2">
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-50 dark:border-gray-800">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Saldo Disponível (Global)</p>
                <h1 className="text-[28px] font-black tracking-tight mt-1">R$ {remainingGlobal.toFixed(2).replace('.', ',')}</h1>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-gray-500">Utilizado (Vista): <span className="text-[#111418] dark:text-white font-black">R$ {usedAmountFiltered.toFixed(2).replace('.', ',')}</span></span>
                <span className="text-gray-400">Total: R$ {(totalBudget/1000).toFixed(0)}k</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {/* Barra de progresso baseada no uso GLOBAL para ter noção do todo */}
                <div className="h-full rounded-full bg-primary shadow-sm shadow-primary/20 transition-all duration-500" style={{ width: `${percentUsedGlobal}%` }}></div>
              </div>
              <p className="text-[7px] text-right text-primary font-black uppercase tracking-tighter mt-1">{percentUsedGlobal.toFixed(0)}% do orçamento total</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar">
          {categoryStats.map((stat) => (
            <div key={stat.label} className="flex min-w-[130px] flex-col gap-3 rounded-2xl bg-surface-light dark:bg-surface-dark p-4 shadow-sm border border-gray-50 dark:border-gray-800">
              <div className={`flex size-8 items-center justify-center rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
                <p className="text-[13px] font-black">R$ {stat.value.toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[14px] font-bold">Distribuição</h3>
            <button onClick={() => setModalType('config')} className="text-[9px] font-bold text-primary uppercase hover:underline">Configurar</button>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-gray-50 dark:border-gray-800 flex flex-col gap-5">
            {[
              { label: 'Transporte', percent: 50, color: 'bg-blue-500' },
              { label: 'Alimentação', percent: 30, color: 'bg-orange-500' },
              { label: 'Lazer', percent: 20, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color}`}></span>
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="text-[#111418] dark:text-white font-black">{item.percent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 mb-10">
          <h3 className="text-[14px] font-bold mb-4 px-1">Transações</h3>
          <div className="flex flex-col gap-2.5">
            {filteredTransactions.map((tx, idx) => (
              <React.Fragment key={tx.id}>
                {(idx === 0 || filteredTransactions[idx - 1].date !== tx.date) && (
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-3 mb-1">{tx.date}</p>
                )}
                <div className="flex items-center justify-between p-3.5 bg-surface-light dark:bg-surface-dark rounded-2xl border border-transparent shadow-sm hover:border-gray-100 active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <span className="material-symbols-outlined text-[20px] text-gray-500">{tx.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[12px] font-bold text-[#111418] dark:text-white leading-tight">{tx.title}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{tx.category}</p>
                    </div>
                  </div>
                  <p className="text-[12px] font-black text-red-500">
                    - R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </React.Fragment>
            ))}
            {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-300 text-[32px] mb-1">receipt_long</span>
                    <p className="text-[11px] text-gray-400">Sem transações para o filtro selecionado</p>
                </div>
            )}
          </div>
        </div>
      </main>

      <div className="absolute bottom-28 right-5 z-20">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center size-11 rounded-2xl bg-primary text-white shadow-xl active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      </div>

      {/* MODAL ADICIONAR */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-slide-up">
            <h3 className="text-[16px] font-bold mb-4">Nova Transação</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Título</label>
                <input 
                  value={newTransaction.title}
                  onChange={e => setNewTransaction({...newTransaction, title: e.target.value})}
                  placeholder="Ex: Almoço"
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Valor (R$)</label>
                <input 
                  type="number"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0,00"
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Categoria</label>
                <select 
                  value={newTransaction.category}
                  onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none"
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Hospedagem">Hospedagem</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Compras">Compras</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Presentes">Presentes</option>
                  <option value="Passeios">Passeios</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-gray-400 bg-gray-100">Cancelar</button>
                <button onClick={handleAddTransaction} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-white bg-primary">Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURAR */}
      {modalType === 'config' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-2xl animate-slide-up">
            <h3 className="text-[16px] font-bold mb-4">Configurar Orçamento</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Limite Total (R$)</label>
                <input 
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-[13px] outline-none font-bold"
                />
              </div>
              
              <div className="pt-2">
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Alertas</p>
                 <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className="text-[12px] font-medium">Avisar quando atingir 80%</span>
                    <div className="w-9 h-5 bg-primary rounded-full relative"><div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                 </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setModalType('none')} className="flex-1 h-12 rounded-xl text-[12px] font-bold text-white bg-primary">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default BudgetScreen;
