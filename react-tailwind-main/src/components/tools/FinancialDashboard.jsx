import React, { useState, useEffect, useRef } from 'react';

// Função de utilidade para cálculo financeiro
const calculateEstimatedYield = (amount, yieldRate, period) => {
  const monthlyYield = amount * (yieldRate / 100);
  if (period === 'anual') {
    return monthlyYield / 12;
  }
  return monthlyYield;
};

// Componente para o Dashboard Financeiro
const FinancialDashboard = ({ financialData, updateFinancialData }) => {
  // Estado para controlar a edição de card
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    name: '',
    amount: 0,
    icon: '',
    type: 'regular',
    yield: 0,
    period: 'mensal',
  });

  // Ref para evitar salvar um array vazio no início
  const isInitialMount = useRef(true);

  // Lista de ícones disponíveis
  const iconOptions = ['💰', '📈', '🎮', '🏢', '💳', '🏦', '💹', '💵', '🏆', '💻', '🚗', '🏠'];

  // Teste de funcionalidade do localStorage
  useEffect(() => {
    try {
      localStorage.setItem('testStorage', 'test');
      const testValue = localStorage.getItem('testStorage');
      if (testValue !== 'test') {
        console.error('localStorage não está funcionando corretamente!');
      } else {
        console.log('localStorage está funcionando corretamente.');
        localStorage.removeItem('testStorage'); // Limpa o teste
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
    }
  }, []);

  // Carregar dados do localStorage quando o componente monta
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('financialData');
      if (savedData && isInitialMount.current) {
        console.log('Carregando dados financeiros do localStorage:', JSON.parse(savedData));
        updateFinancialData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  }, [updateFinancialData]);

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      console.log('Salvando dados financeiros no localStorage:', financialData);
      localStorage.setItem('financialData', JSON.stringify(financialData));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }, [financialData]);

  // Função para iniciar edição de um card
  const startEditingCard = (card) => {
    setEditingCard(card.id);
    setCardFormData({
      name: card.name,
      amount: card.amount,
      icon: card.icon,
      type: card.type,
      yield: card.yield || 0,
      period: card.period || 'mensal',
    });
  };

  // Função para salvar a edição de um card
  const saveCardEdit = () => {
    const updatedData = financialData.map((card) =>
      card.id === editingCard
        ? {
            ...card,
            name: cardFormData.name,
            amount: Number(cardFormData.amount),
            icon: cardFormData.icon,
            type: cardFormData.type,
            yield: cardFormData.type === 'investment' ? Number(cardFormData.yield) : undefined,
            period: cardFormData.type === 'investment' ? cardFormData.period : undefined,
          }
        : card
    );
    updateFinancialData(updatedData);
    setEditingCard(null);
  };

  // Função para cancelar a edição de um card
  const cancelCardEdit = () => {
    setEditingCard(null);
  };

  // Função para adicionar novo card
  const addNewCard = () => {
    const newCard = {
      id: Date.now(),
      name: 'Novo Item',
      amount: 0,
      icon: '💰',
      type: 'regular',
    };

    updateFinancialData([...financialData, newCard]);
    startEditingCard(newCard);
  };

  // Calcular o total de patrimônio
  const totalPatrimony = financialData.reduce((sum, item) => sum + item.amount, 0);

  // Calcular o rendimento total mensal estimado
  const totalMonthlyYield = financialData
    .filter((item) => item.type === 'investment')
    .reduce((sum, item) => {
      return sum + calculateEstimatedYield(item.amount, item.yield, item.period);
    }, 0);

  // Função para lidar com a alteração dos campos do formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCardFormData({
      ...cardFormData,
      [name]: value,
    });
  };

  return (
    <div
      className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.01]"
      style={{ boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)' }}
    >
      <div className="bg-black p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-red-500">Dashboard Financeiro</h2>
        <button
          onClick={addNewCard}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
        >
          + Adicionar Item
        </button>
      </div>

      <div className="p-4">
        {/* Cards financeiros */}
        {financialData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {financialData.map((item) => (
              <div
                key={item.id}
                className="bg-gray-700 p-4 rounded-xl cursor-pointer transform transition hover:scale-105"
                style={{ boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)' }}
                onClick={() => startEditingCard(item)}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-white font-medium">{item.name}</h3>
                </div>
                <p className="text-xl text-white font-bold">R$ {item.amount.toLocaleString()}</p>

                {item.type === 'investment' && (
                  <div className="mt-2 text-sm">
                    <p className="text-green-400">
                      +R$ {calculateEstimatedYield(item.amount, item.yield, item.period).toFixed(2)} /mês
                    </p>
                    <p className="text-gray-400">
                      {item.yield}% {item.period}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-700 rounded-xl mb-6">
            <p className="text-gray-300 mb-4">Nenhum item financeiro adicionado</p>
            <button
              onClick={addNewCard}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
            >
              Adicionar Primeiro Item
            </button>
          </div>
        )}

        {/* Modal de edição de card */}
        {editingCard && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            style={{ overflowY: 'auto' }}
          >
            <div
              className="bg-gray-800 rounded-2xl p-6 m-4 max-w-md w-full"
              style={{ boxShadow: '10px 10px 20px rgba(0,0,0,0.5), -10px -10px 20px rgba(60,60,60,0.1)' }}
            >
              <h3 className="text-xl font-bold text-red-500 mb-4">Editar Card Financeiro</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={cardFormData.name}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    name="amount"
                    value={cardFormData.amount}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Ícone</label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCardFormData({ ...cardFormData, icon })}
                        className={`p-2 text-xl rounded-lg ${
                          cardFormData.icon === icon ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Tipo</label>
                  <select
                    name="type"
                    value={cardFormData.type}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                  >
                    <option value="regular">Regular</option>
                    <option value="investment">Investimento</option>
                  </select>
                </div>

                {cardFormData.type === 'investment' && (
                  <>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Rendimento (%)</label>
                      <input
                        type="number"
                        name="yield"
                        value={cardFormData.yield}
                        onChange={handleFormChange}
                        step="0.1"
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Período</label>
                      <select
                        name="period"
                        value={cardFormData.period}
                        onChange={handleFormChange}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                      >
                        <option value="mensal">Mensal</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={cancelCardEdit}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transform transition hover:scale-105"
                    style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveCardEdit}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                    style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)' }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sumário financeiro */}
        {financialData.length > 0 && (
          <div
            className="bg-gray-700 p-4 rounded-xl mb-6"
            style={{ boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-3 bg-gray-800 rounded-lg"
                style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(45,45,45,0.1)' }}
              >
                <h3 className="text-gray-300 text-sm mb-1">Patrimônio Total</h3>
                <p className="text-2xl font-bold text-white">R$ {totalPatrimony.toLocaleString()}</p>
              </div>
              <div
                className="p-3 bg-gray-800 rounded-lg"
                style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(45,45,45,0.1)' }}
              >
                <h3 className="text-gray-300 text-sm mb-1">Rendimento Mensal</h3>
                <p className="text-2xl font-bold text-green-400">R$ {totalMonthlyYield.toFixed(2)}</p>
              </div>
              <div
                className="p-3 bg-gray-800 rounded-lg"
                style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(45,45,45,0.1)' }}
              >
                <h3 className="text-gray-300 text-sm mb-1">Rendimento Anual Estimado</h3>
                <p className="text-2xl font-bold text-green-400">R$ {(totalMonthlyYield * 12).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;