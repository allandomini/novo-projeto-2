import React, { useState, useEffect } from 'react';

// Componente para a lista de metas
const GoalsList = () => {
  const [goals, setGoals] = useState([
    { id: 1, text: "Concluir curso de IA para jogos", completed: false },
    { id: 2, text: "Vender 3 sites este mês", completed: false },
    { id: 3, text: "Publicar 5 modelos 3D", completed: true },
    { id: 4, text: "Enviar protótipo do jogo para STEAM", completed: false }
  ]);
  const [newGoal, setNewGoal] = useState("");
  
  const addGoal = () => {
    if (newGoal.trim() === "") return;
    
    const newGoalItem = {
      id: Date.now(),
      text: newGoal,
      completed: false
    };
    
    setGoals([...goals, newGoalItem]);
    setNewGoal("");
  };
  
  const toggleGoal = (id) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };
  
  const removeGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // Salvar metas no localStorage
  const saveGoalsList = (data) => {
    localStorage.setItem('goals', JSON.stringify(data));
  };

  useEffect(() => {
    saveGoalsList(goals);
  }, [goals]);

  useEffect(() => {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
      <div className="bg-black p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-red-500">Lista de Metas</h2>
      </div>
      
      <div className="p-4">
        <div className="mb-4 flex">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Adicionar nova meta..."
            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button 
            onClick={addGoal}
            className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transform transition hover:scale-105"
            style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
          >
            Adicionar
          </button>
        </div>
        
        <ul className="space-y-2">
          {goals.map(goal => (
            <li 
              key={goal.id} 
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg group transform transition hover:scale-[1.02]"
              style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
            >
              <div className="flex items-center">
                <div 
                  className={`relative w-5 h-5 mr-3 rounded-md border cursor-pointer ${
                    goal.completed ? 'bg-red-600 border-red-700' : 'bg-gray-800 border-gray-600'
                  }`}
                  onClick={() => toggleGoal(goal.id)}
                  style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.2), -2px -2px 4px rgba(60,60,60,0.05)'}}
                >
                  {goal.completed && (
                    <svg className="absolute inset-0 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`${goal.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                  {goal.text}
                </span>
              </div>
              <button 
                onClick={() => removeGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transform transition hover:scale-110"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GoalsList;