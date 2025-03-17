import React, { useState, useEffect } from 'react';

const PatrimonialGoals = ({
  financialData,
  transactions = [],
  goals = [],
  setGoals,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', amount: '', account: '' });
  const [editingGoal, setEditingGoal] = useState(null);

  // Atualiza o valor atual das metas com base na conta vinculada e transações
  useEffect(() => {
    if (goals.length === 0) return;

    let hasChanges = false;
    const updatedGoals = goals.map((goal) => {
      if (goal.account) {
        // Pega o valor inicial da conta vinculada
        const account = financialData.find((acc) => acc.id === parseInt(goal.account));
        let current = account ? account.amount : 0;

        // Ajusta o current com base nas transações
        if (transactions.length > 0) {
          const accountTransactions = transactions.filter(
            (t) => t.account === goal.account
          );
          const totalIncome = accountTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const totalExpense = accountTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          current = current + totalIncome - totalExpense;
        }

        // Limita o current ao valor alvo
        const newCurrent = Math.min(current, goal.amount);

        // Verifica se o current mudou
        if (newCurrent !== goal.current) {
          hasChanges = true;
          return { ...goal, current: newCurrent };
        }
      }
      return goal;
    });

    // Só atualiza o estado se houver mudanças
    if (hasChanges) {
      setGoals(updatedGoals);
    }
  }, [financialData, transactions, goals, setGoals]);

  // Adicionar nova meta
  const addGoal = () => {
    if (newGoal.name.trim() === '' || !newGoal.amount) return;

    // Inicializa o current com o valor da conta vinculada, se existir
    const account = financialData.find((acc) => acc.id === parseInt(newGoal.account));
    const initialCurrent = account ? account.amount : 0;

    setGoals([
      ...goals,
      {
        id: Date.now(),
        name: newGoal.name,
        amount: Number(newGoal.amount),
        current: initialCurrent,
        account: newGoal.account || '',
      },
    ]);

    setNewGoal({ name: '', amount: '', account: '' });
    setShowAddForm(false);
  };

  const startEditingGoal = (goal) => {
    setEditingGoal({
      id: goal.id,
      name: goal.name,
      amount: goal.amount,
      current: goal.current,
      account: goal.account || '',
    });
  };

  const saveGoalEdit = () => {
    if (!editingGoal) return;

    // Atualiza o current com base na conta vinculada ao salvar
    const account = financialData.find((acc) => acc.id === parseInt(editingGoal.account));
    const updatedCurrent = account ? account.amount : editingGoal.current;

    setGoals(
      goals.map((goal) =>
        goal.id === editingGoal.id
          ? { ...editingGoal, current: Math.min(updatedCurrent, editingGoal.amount) }
          : goal
      )
    );

    setEditingGoal(null);
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setNewGoal({
      ...newGoal,
      [name]: name === 'amount' ? Number(value) : value,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingGoal({
      ...editingGoal,
      [name]: name === 'name' || name === 'account' ? value : Number(value),
    });
  };

  return (
    <div
      className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.01]"
      style={{ boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)' }}
    >
      <div className="bg-black p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-red-500">Metas de Patrimônio</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transform transition hover:scale-105"
          style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
        >
          {showAddForm ? 'Cancelar' : 'Nova Meta'}
        </button>
      </div>

      <div className="p-4">
        {showAddForm && (
          <div
            className="mb-4 p-4 bg-gray-700 rounded-xl"
            style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)' }}
          >
            <h3 className="text-lg font-medium text-white mb-3">Nova Meta de Patrimônio</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nome da Meta</label>
                <input
                  type="text"
                  name="name"
                  value={newGoal.name}
                  onChange={handleAddFormChange}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Valor Alvo (R$)</label>
                <input
                  type="number"
                  name="amount"
                  value={newGoal.amount}
                  onChange={handleAddFormChange}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Conta Vinculada (Opcional)</label>
                <select
                  name="account"
                  value={newGoal.account}
                  onChange={handleAddFormChange}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                >
                  <option value="">Nenhuma conta</option>
                  {financialData.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (R$ {account.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={addGoal}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                  style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal) => {
            const progressPercentage = Math.min(100, (goal.current / goal.amount) * 100);

            return (
              <div
                key={goal.id}
                className="p-4 bg-gray-700 rounded-xl transform transition hover:scale-[1.01]"
                style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)' }}
              >
                {editingGoal && editingGoal.id === goal.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Nome da Meta</label>
                      <input
                        type="text"
                        name="name"
                        value={editingGoal.name}
                        onChange={handleEditFormChange}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Valor Alvo (R$)</label>
                      <input
                        type="number"
                        name="amount"
                        value={editingGoal.amount}
                        onChange={handleEditFormChange}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Valor Atual (R$)</label>
                      <input
                        type="number"
                        name="current"
                        value={editingGoal.current}
                        onChange={handleEditFormChange}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                        disabled={editingGoal.account} // Desabilita se vinculado a uma conta
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Conta Vinculada (Opcional)</label>
                      <select
                        name="account"
                        value={editingGoal.account}
                        onChange={handleEditFormChange}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                      >
                        <option value="">Nenhuma conta</option>
                        {financialData.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} (R$ {account.amount.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingGoal(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transform transition hover:scale-105"
                        style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveGoalEdit}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                        style={{ boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)' }}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-white">
                        {goal.name}
                        {goal.account && (
                          <span className="text-sm text-gray-400 ml-2">
                            ({financialData.find((acc) => acc.id === parseInt(goal.account))?.name || 'N/A'})
                          </span>
                        )}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditingGoal(goal)}
                          className="p-1 text-gray-300 hover:text-white transform transition hover:scale-110"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-gray-300 hover:text-red-500 transform transition hover:scale-110"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">
                        R$ {goal.current.toLocaleString()} / R$ {goal.amount.toLocaleString()}
                      </span>
                      <span className="text-gray-300">{progressPercentage.toFixed(1)}%</span>
                    </div>

                    <div
                      className="w-full bg-gray-600 rounded-full h-3 overflow-hidden"
                      style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(60,60,60,0.1)' }}
                    >
                      <div
                        className="bg-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-gray-400">
                        Faltam: R$ {(goal.amount - goal.current).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatrimonialGoals;