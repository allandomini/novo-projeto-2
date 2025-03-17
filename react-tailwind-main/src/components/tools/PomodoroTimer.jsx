import React, { useState, useEffect } from 'react';

// Função para formatar data no formato YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Componente para o timer Pomodoro
const PomodoroTimer = () => {
  // Estados para o timer
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  
  // Estado para o projeto atual e histórico de sessões
  const [currentProject, setCurrentProject] = useState("");
  const [pomodoroSessions, setPomodoroSessions] = useState([]);
  
  // Configurações personalizáveis
  const [pomodoroSettings, setPomodoroSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });
  
  // Estado para modo de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({...pomodoroSettings});
  
  // Carregue as sessões salvas e configurações ao iniciar
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      setPomodoroSessions(JSON.parse(savedSessions));
    }
    
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setPomodoroSettings(settings);
      setEditValues(settings);
      
      // Ajustar o timer de acordo com o modo atual
      if (mode === 'pomodoro') {
        setMinutes(settings.pomodoro);
      } else if (mode === 'shortBreak') {
        setMinutes(settings.shortBreak);
      } else {
        setMinutes(settings.longBreak);
      }
    }
    
    // Buscar o projeto atual do planejador semanal se disponível
    const today = new Date();
    const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const currentDay = weekdays[today.getDay()];
    
    const savedWeekData = localStorage.getItem('weeklyPlannerData');
    if (savedWeekData) {
      const weekData = JSON.parse(savedWeekData);
      if (weekData[currentDay] && weekData[currentDay].projeto) {
        setCurrentProject(weekData[currentDay].projeto);
      }
    }
  }, []);
  
  // Salvar sessões e configurações no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(pomodoroSessions));
  }, [pomodoroSessions]);
  
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);
  
  // Controle do timer
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            // Play sound or notification
            setIsActive(false);
            
            // Registrar a sessão completa
            if (mode === 'pomodoro') {
              const newSession = {
                date: formatDate(new Date()),
                duration: pomodoroSettings.pomodoro,
                completed: true,
                project: currentProject || "Sem projeto",
                timestamp: new Date().toISOString()
              };
              
              setPomodoroSessions(prev => [...prev, newSession]);
            }
            
            // Auto switch mode
            if (mode === 'pomodoro') {
              setMode('shortBreak');
              setMinutes(pomodoroSettings.shortBreak);
            } else if (mode === 'shortBreak') {
              setMode('pomodoro');
              setMinutes(pomodoroSettings.pomodoro);
            } else if (mode === 'longBreak') {
              setMode('pomodoro');
              setMinutes(pomodoroSettings.pomodoro);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, pomodoroSettings, currentProject]);
  
  // Resetar o timer
  const resetTimer = () => {
    // Se estamos em um pomodoro ativo e cancelamos, registramos como sessão incompleta
    if (isActive && mode === 'pomodoro') {
      const newSession = {
        date: formatDate(new Date()),
        duration: pomodoroSettings.pomodoro - minutes,
        completed: false,
        project: currentProject || "Sem projeto",
        timestamp: new Date().toISOString()
      };
      
      setPomodoroSessions(prev => [...prev, newSession]);
    }
    
    setIsActive(false);
    if (mode === 'pomodoro') {
      setMinutes(pomodoroSettings.pomodoro);
    } else if (mode === 'shortBreak') {
      setMinutes(pomodoroSettings.shortBreak);
    } else {
      setMinutes(pomodoroSettings.longBreak);
    }
    setSeconds(0);
  };

  // Iniciar/pausar o timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Mudar o modo do timer
  const setTimerMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    
    if (newMode === 'pomodoro') {
      setMinutes(pomodoroSettings.pomodoro);
    } else if (newMode === 'shortBreak') {
      setMinutes(pomodoroSettings.shortBreak);
    } else {
      setMinutes(pomodoroSettings.longBreak);
    }
    setSeconds(0);
  };
  
  // Gerenciar mudanças nas configurações
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setEditValues({
      ...editValues,
      [name]: Number(value)
    });
  };
  
  // Salvar novas configurações
  const saveSettings = () => {
    setPomodoroSettings(editValues);
    // Atualizar o timer atual se necessário
    if (mode === 'pomodoro') {
      setMinutes(editValues.pomodoro);
    } else if (mode === 'shortBreak') {
      setMinutes(editValues.shortBreak);
    } else {
      setMinutes(editValues.longBreak);
    }
    setSeconds(0);
    setIsEditing(false);
  };

  // Função para carregar projetos do planejador semanal
  const loadProjects = () => {
    const savedWeekData = localStorage.getItem('calendarDatabase');
    if (!savedWeekData) return [];
    
    const calendarData = JSON.parse(savedWeekData);
    const projects = Object.values(calendarData)
      .filter(day => day && day.projeto)
      .map(day => day.projeto);
    
    // Remover duplicados
    return [...new Set(projects)];
  };

  // Cálculo da porcentagem para o círculo de progresso
  const calculateProgress = () => {
    let totalSeconds;
    if (mode === 'pomodoro') {
      totalSeconds = pomodoroSettings.pomodoro * 60;
    } else if (mode === 'shortBreak') {
      totalSeconds = pomodoroSettings.shortBreak * 60;
    } else {
      totalSeconds = pomodoroSettings.longBreak * 60;
    }
    
    const currentSeconds = minutes * 60 + seconds;
    return (1 - currentSeconds / totalSeconds) * 100;
  };

  // Variáveis para SVG do círculo de progresso
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progress = calculateProgress();
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Lista de projetos disponíveis
  const availableProjects = loadProjects();
  
  // Filtrar sessões de hoje
  const todaySessions = pomodoroSessions.filter(s => s.date === formatDate(new Date()));
  const completedSessions = todaySessions.filter(s => s.completed);
  const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
      <div className="bg-black p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-red-500">Pomodoro Timer</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="p-2 rounded-lg text-gray-300 hover:text-red-400 transform transition hover:scale-110"
          style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
        >
          ⚙️
        </button>
      </div>
      
      <div className="p-6 flex flex-col items-center bg-gray-800">
        {isEditing ? (
          <div className="w-full space-y-4 mb-6">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Pomodoro (minutos)</label>
              <input 
                type="number" 
                name="pomodoro"
                value={editValues.pomodoro}
                onChange={handleSettingsChange}
                min="1"
                max="60"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Pausa Curta (minutos)</label>
              <input 
                type="number" 
                name="shortBreak"
                value={editValues.shortBreak}
                onChange={handleSettingsChange}
                min="1"
                max="30"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Pausa Longa (minutos)</label>
              <input 
                type="number" 
                name="longBreak"
                value={editValues.longBreak}
                onChange={handleSettingsChange}
                min="1"
                max="60"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
              />
            </div>
            <div className="flex justify-end">
              <button 
                onClick={saveSettings}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Timer Mode Selector */}
            <div className="flex space-x-2 mb-6">
              <button 
                onClick={() => setTimerMode('pomodoro')}
                className={`px-3 py-1 rounded-lg text-sm transform transition hover:scale-105 ${
                  mode === 'pomodoro' 
                    ? 'bg-red-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                Pomodoro
              </button>
              <button 
                onClick={() => setTimerMode('shortBreak')}
                className={`px-3 py-1 rounded-lg text-sm transform transition hover:scale-105 ${
                  mode === 'shortBreak' 
                    ? 'bg-red-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                Pausa Curta
              </button>
              <button 
                onClick={() => setTimerMode('longBreak')}
                className={`px-3 py-1 rounded-lg text-sm transform transition hover:scale-105 ${
                  mode === 'longBreak' 
                    ? 'bg-red-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                Pausa Longa
              </button>
            </div>
            
            {/* Seletor de Projeto */}
            {mode === 'pomodoro' && (
              <div className="mb-4 w-full">
                <label className="block text-gray-300 text-sm mb-1">Projeto Atual</label>
                <select
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                >
                  <option value="">Selecione um projeto</option>
                  {availableProjects.map((project, index) => (
                    <option key={index} value={project}>{project}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Timer Display com círculo de progresso */}
            <div className="mb-8 relative w-48 h-48 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {/* Círculo de fundo */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  fill="none" 
                  stroke="#444" 
                  strokeWidth="10"
                />
                {/* Círculo de progresso */}
                <circle 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  fill="none" 
                  stroke="#e11d48" 
                  strokeWidth="10" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <div className="text-6xl font-bold text-white">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-gray-400 text-sm mt-2 uppercase">{mode}</div>
              </div>
            </div>
            
            {/* Timer Controls */}
            <div className="flex space-x-4">
              <button 
                onClick={toggleTimer}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition transform hover:scale-110 ${
                  isActive ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
              >
                {isActive ? 
                  <span className="text-white text-2xl">⏸</span> : 
                  <span className="text-white text-2xl">▶️</span>
                }
              </button>
              <button 
                onClick={resetTimer}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 transition transform hover:scale-110"
                style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
              >
                <span className="text-white text-2xl">↺</span>
              </button>
            </div>
            
            {/* Contador de sessões */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                <span className="font-medium">{completedSessions.length}</span> sessões completas hoje
              </p>
              <p className="text-gray-500 text-sm">
                Total de tempo focado: {totalFocusTime} minutos
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;