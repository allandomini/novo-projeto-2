import React, { useState, useEffect, useRef } from 'react';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FinanceCalculator = ({ financialData, updateFinancialData, transactions, setTransactions }) => {
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    description: '',
    tag: '',
    date: formatDate(new Date()),
    account: '', // Novo campo para a conta
  });

  const isInitialMount = useRef(true);

  const tags = [
    'Freelance', 'Modelo 3D', 'STEAM', 'Curso', 
    'Alimentação', 'Transporte', 'Ferramentas', 'Educação'
  ];

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    });
  };

  const addTransaction = () => {
    if (
      newTransaction.amount === '' ||
      parseFloat(newTransaction.amount) <= 0 ||
      newTransaction.description === '' ||
      newTransaction.tag === '' ||
      newTransaction.account === ''
    ) {
      alert("Por favor, preencha todos os campos com valores válidos");
      return;
    }

    const transaction = {
      id: Date.now(),
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      tag: newTransaction.tag,
      date: newTransaction.date,
      account: newTransaction.account,
    };

    // Atualizar o saldo da conta no financialData
    const updatedFinancialData = financialData.map((account) => {
      if (account.id === parseInt(newTransaction.account)) {
        const newAmount =
          newTransaction.type === 'income'
            ? account.amount + parseFloat(newTransaction.amount)
            : account.amount - parseFloat(newTransaction.amount);
        return { ...account, amount: newAmount };
      }
      return account;
    });

    setTransactions([...transactions, transaction]);
    updateFinancialData(updatedFinancialData); // Atualiza o dashboard

    setNewTransaction({
      type: 'expense',
      amount: '',
      description: '',
      tag: '',
      date: formatDate(new Date()),
      account: '',
    });
  };

  const removeTransaction = (id) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.01]" style={{ boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)' }}>
      <div className="bg-black p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-red-500">Calculadora de Finanças</h2>
      </div>
      <div className="p-4">
        {/* Totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-xl transform transition hover:scale-105" style={{ boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)' }}>
            <h3 className="text-gray-300 text-sm mb-1">Receitas</h3>
            <p className="text-green-400 text-2xl font-bold">R$ {totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-xl transform transition hover:scale-105" style={{ boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)' }}>
            <h3 className="text-gray-300 text-sm mb-1">Despesas</h3>
            <p className="text-red-400 text-2xl font-bold">R$ {totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-xl transform transition hover:scale-105" style={{ boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)' }}>
            <h3 className="text-gray-300 text-sm mb-1">Balanço</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-gray-700 p-4 rounded-xl mb-6" style={{ boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)' }}>
          <h3 className="text-lg font-medium text-white mb-3">Nova Transação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tipo</label>
              <select
                name="type"
                value={newTransaction.type}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Valor (R$)</label>
              <input
                type="number"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
                min="0"
                step="0.01"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-gray-300 text-sm mb-1">Descrição</label>
              <input
                type="text"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tag</label>
              <select
                name="tag"
                value={newTransaction.tag}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
              >
                <option value="">Selecione</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Conta</label>
              <select
                name="account"
                value={newTransaction.account}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
              >
                <option value="">Selecione uma conta</option>
                {financialData.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} (R$ {account.amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4">
              <label className="block text-gray-300 text-sm mb-1">Data</label>
              <input
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleInputChange}
                className="p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)' }}
              />
            </div>
            <div className="lg:col-span-1">
              <button
                onClick={addTransaction}
                className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                style={{ boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)' }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de transações */}
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Descrição</th>
                  <th className="p-3 text-left">Tag</th>
                  <th className="p-3 text-left">Conta</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3 text-gray-300">{transaction.date}</td>
                    <td className="p-3 text-white">{transaction.description}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-700 text-sm rounded-lg text-gray-300" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.2), -2px -2px 4px rgba(60,60,60,0.05)' }}>
                        {transaction.tag}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {financialData.find((acc) => acc.id === parseInt(transaction.account))?.name || 'N/A'}
                    </td>
                    <td className={`p-3 text-right ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => removeTransaction(transaction.id)}
                        className="text-gray-400 hover:text-red-500 transform transition hover:scale-110"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-700 rounded-xl">
            <p className="text-gray-300">Nenhuma transação registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceCalculator;