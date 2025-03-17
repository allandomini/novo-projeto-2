import React, { useState, useEffect } from 'react';
import { 
  formatDate, 
  obterDiaAtual, 
  getPlanejamentoSemanal,
  getDiaSemana,
  saveToCalendar,
  getCalendarDataForDate,
  generateCalendarDays,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  monthNames,
  weekdayNames,
  reloadCalendarData
} from '../../data/CalendarData';

// Componente do planejador semanal
const WeeklyPlannerApp = () => {
  // Estado para armazenar os dados dos projetos
  const [weekData, setWeekData] = useState({});
  // Estado para armazenar os dados do calendário
  const [calendarData, setCalendarData] = useState({});
  // Estado para controlar o dia atual
  const [currentDay, setCurrentDay] = useState(obterDiaAtual());
  // Estado para controlar a data selecionada no calendário
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  // Estado para controlar o modo de visualização (semanal ou calendário)
  const [viewMode, setViewMode] = useState("week"); // "week" ou "calendar"
  // Estado para controlar a edição do projeto
  const [editingProject, setEditingProject] = useState(false);
  // Estado para armazenar o novo nome do projeto durante a edição
  const [newProjectName, setNewProjectName] = useState("");
  // Estado para controlar a tarefa que está sendo editada
  const [editingTaskIndex, setEditingTaskIndex] = useState(-1);
  // Estado para armazenar o novo texto da tarefa durante a edição
  const [newTaskText, setNewTaskText] = useState("");
  // Estado para nova tarefa sendo adicionada
  const [newTask, setNewTask] = useState("");
  // Estado para controlar o mês atual do calendário
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Estado para controlar a necessidade de atualização
  const [needsUpdate, setNeedsUpdate] = useState(true);
  
  // Carregar dados iniciais
  useEffect(() => {
    if (needsUpdate) {
      // Recarregar dados do localStorage
      reloadCalendarData();
      
      // Buscar dados do planejamento semanal
      const planejamento = getPlanejamentoSemanal();
      setWeekData(planejamento);
      
      // Buscar dados do calendário
      const calendarDays = generateCalendarDays(
        currentMonth.getFullYear(), 
        currentMonth.getMonth()
      );
      
      // Construir objeto de dados do calendário
      const calData = {};
      calendarDays.forEach(day => {
        const data = getCalendarDataForDate(day.dateStr);
        if (data) {
          calData[day.dateStr] = data;
        }
      });
      
      setCalendarData(calData);
      setNeedsUpdate(false);
    }
  }, [needsUpdate, currentMonth]);

  // Função para verificar se uma data tem tarefas no calendário
  function hasTasksForDate(date) {
    const dateStr = formatDate(date);
    return getCalendarDataForDate(dateStr) !== null;
  }

  // Função para alternar o estado de conclusão de uma tarefa
  const toggleTaskCompletion = (index) => {
    if (viewMode === "week") {
      if (weekData[currentDay] && weekData[currentDay].tarefas) {
        const updatedTasks = [...weekData[currentDay].tarefas];
        updatedTasks[index] = {
          ...updatedTasks[index],
          completed: !updatedTasks[index].completed
        };
        
        // Atualizar weekData local
        setWeekData({
          ...weekData,
          [currentDay]: {
            ...weekData[currentDay],
            tarefas: updatedTasks
          }
        });
        
        // Sincronizar com o calendário - pegar a data correspondente ao dia da semana
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const currentDayIndex = diasSemana.indexOf(currentDay);
        const diff = currentDayIndex - diaSemana;
        
        const targetDate = new Date(hoje);
        targetDate.setDate(hoje.getDate() + diff);
        const dateStr = formatDate(targetDate);
        
        // Salvar no CalendarData e localStorage
        saveToCalendar(dateStr, {
          projeto: weekData[currentDay].projeto,
          tarefas: updatedTasks
        });
      }
    } else {
      // No modo calendário
      const dateData = getCalendarDataForDate(selectedDate);
      if (dateData && dateData.tarefas) {
        const updatedTasks = [...dateData.tarefas];
        updatedTasks[index] = {
          ...updatedTasks[index],
          completed: !updatedTasks[index].completed
        };
        
        // Salvar no CalendarData e localStorage
        saveToCalendar(selectedDate, {
          ...dateData,
          tarefas: updatedTasks
        });
        
        // Atualizar estado local
        setCalendarData({
          ...calendarData,
          [selectedDate]: {
            ...dateData,
            tarefas: updatedTasks
          }
        });
        
        // Sincronizar com weekData se for da semana atual
        const diaSemana = getDiaSemana(selectedDate);
        if (weekData[diaSemana]) {
          setWeekData({
            ...weekData,
            [diaSemana]: {
              ...weekData[diaSemana],
              tarefas: updatedTasks
            }
          });
        }
      }
    }
  };

  // Função para navegar para o mês anterior
  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setNeedsUpdate(true);
  }

  // Função para navegar para o próximo mês
  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setNeedsUpdate(true);
  }

  // Função para iniciar a edição do projeto
  const startEditingProject = () => {
    if (viewMode === "week") {
      setEditingProject(true);
      setNewProjectName(weekData[currentDay]?.projeto || "");
    } else {
      // Modo calendário
      const dateData = getCalendarDataForDate(selectedDate);
      if (dateData) {
        setEditingProject(true);
        setNewProjectName(dateData.projeto || "");
      } else {
        // Se não existir dados para esta data, criar um projeto vazio
        setEditingProject(true);
        setNewProjectName("Novo Projeto");
      }
    }
  };

  // Função para salvar o novo nome do projeto
  const saveProjectEdit = () => {
    if (newProjectName.trim() === "") return;
    
    if (viewMode === "week") {
      // Atualizar weekData local
      setWeekData({
        ...weekData,
        [currentDay]: {
          ...weekData[currentDay],
          projeto: newProjectName
        }
      });
      
      // Sincronizar com o calendário
      const hoje = new Date();
      const diaSemana = hoje.getDay();
      const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      const currentDayIndex = diasSemana.indexOf(currentDay);
      const diff = currentDayIndex - diaSemana;
      
      const targetDate = new Date(hoje);
      targetDate.setDate(hoje.getDate() + diff);
      const dateStr = formatDate(targetDate);
      
      // Salvar no CalendarData e localStorage
      const dateData = getCalendarDataForDate(dateStr) || { tarefas: [] };
      saveToCalendar(dateStr, {
        ...dateData,
        projeto: newProjectName
      });
    } else {
      // Modo calendário
      const dateData = getCalendarDataForDate(selectedDate) || { tarefas: [] };
      
      // Salvar no CalendarData e localStorage
      saveToCalendar(selectedDate, {
        ...dateData,
        projeto: newProjectName
      });
      
      // Atualizar estado local
      setCalendarData({
        ...calendarData,
        [selectedDate]: {
          ...dateData,
          projeto: newProjectName
        }
      });
      
      // Sincronizar com weekData se for da semana atual
      const diaSemana = getDiaSemana(selectedDate);
      if (weekData[diaSemana]) {
        setWeekData({
          ...weekData,
          [diaSemana]: {
            ...weekData[diaSemana],
            projeto: newProjectName
          }
        });
      }
    }
    
    setEditingProject(false);
    setNeedsUpdate(true);
  };

  // Função para cancelar a edição do projeto
  const cancelProjectEdit = () => {
    setEditingProject(false);
  };

  // Função para iniciar a edição de uma tarefa
  const startEditingTask = (index) => {
    if (viewMode === "week" && weekData[currentDay]?.tarefas) {
      setEditingTaskIndex(index);
      setNewTaskText(weekData[currentDay].tarefas[index].text);
    } else if (viewMode === "calendar") {
      const dateData = getCalendarDataForDate(selectedDate);
      if (dateData && dateData.tarefas && dateData.tarefas[index]) {
        setEditingTaskIndex(index);
        setNewTaskText(dateData.tarefas[index].text);
      }
    }
  };

  // Função para salvar a edição de uma tarefa
  const saveTaskEdit = () => {
    if (newTaskText.trim() === "") return;
    
    if (viewMode === "week" && weekData[currentDay]?.tarefas) {
      const updatedTasks = [...weekData[currentDay].tarefas];
      updatedTasks[editingTaskIndex] = {
        ...updatedTasks[editingTaskIndex],
        text: newTaskText
      };
      
      // Atualizar weekData local
      setWeekData({
        ...weekData,
        [currentDay]: {
          ...weekData[currentDay],
          tarefas: updatedTasks
        }
      });
      
      // Sincronizar com o calendário
      const hoje = new Date();
      const diaSemana = hoje.getDay();
      const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      const currentDayIndex = diasSemana.indexOf(currentDay);
      const diff = currentDayIndex - diaSemana;
      
      const targetDate = new Date(hoje);
      targetDate.setDate(hoje.getDate() + diff);
      const dateStr = formatDate(targetDate);
      
      // Salvar no CalendarData e localStorage
      const dateData = getCalendarDataForDate(dateStr) || { projeto: "Novo Projeto", tarefas: [] };
      saveToCalendar(dateStr, {
        ...dateData,
        tarefas: updatedTasks
      });
    } else if (viewMode === "calendar") {
      const dateData = getCalendarDataForDate(selectedDate) || { projeto: "Novo Projeto", tarefas: [] };
      const updatedTasks = [...(dateData.tarefas || [])];
      
      if (updatedTasks[editingTaskIndex]) {
        updatedTasks[editingTaskIndex] = {
          ...updatedTasks[editingTaskIndex],
          text: newTaskText
        };
      }
      
      // Salvar no CalendarData e localStorage
      saveToCalendar(selectedDate, {
        ...dateData,
        tarefas: updatedTasks
      });
      
      // Atualizar estado local
      setCalendarData({
        ...calendarData,
        [selectedDate]: {
          ...dateData,
          tarefas: updatedTasks
        }
      });
      
      // Sincronizar com weekData se for da semana atual
      const diaSemana = getDiaSemana(selectedDate);
      if (weekData[diaSemana]) {
        setWeekData({
          ...weekData,
          [diaSemana]: {
            ...weekData[diaSemana],
            tarefas: updatedTasks
          }
        });
      }
    }
    
    setEditingTaskIndex(-1);
    setNeedsUpdate(true);
  };

  // Função para cancelar a edição de uma tarefa
  const cancelTaskEdit = () => {
    setEditingTaskIndex(-1);
  };

  // Função para adicionar uma nova tarefa
  const addTask = () => {
    if (newTask.trim() === "") return;
    
    const task = {
      text: newTask,
      completed: false
    };
    
    if (viewMode === "week") {
      const currentDayData = weekData[currentDay] || { projeto: "Novo Projeto", tarefas: [] };
      const updatedTasks = [...(currentDayData.tarefas || []), task];
      
      // Atualizar weekData local
      setWeekData({
        ...weekData,
        [currentDay]: {
          ...currentDayData,
          tarefas: updatedTasks
        }
      });
      
      // Sincronizar com o calendário
      const hoje = new Date();
      const diaSemana = hoje.getDay();
      const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      const currentDayIndex = diasSemana.indexOf(currentDay);
      const diff = currentDayIndex - diaSemana;
      
      const targetDate = new Date(hoje);
      targetDate.setDate(hoje.getDate() + diff);
      const dateStr = formatDate(targetDate);
      
      // Salvar no CalendarData e localStorage
      const dateData = getCalendarDataForDate(dateStr) || { projeto: currentDayData.projeto || "Novo Projeto", tarefas: [] };
      saveToCalendar(dateStr, {
        ...dateData,
        tarefas: updatedTasks
      });
    } else if (viewMode === "calendar") {
      const dateData = getCalendarDataForDate(selectedDate) || { projeto: "Novo Projeto", tarefas: [] };
      const updatedTasks = [...(dateData.tarefas || []), task];
      
      // Salvar no CalendarData e localStorage
      saveToCalendar(selectedDate, {
        ...dateData,
        tarefas: updatedTasks
      });
      
      // Atualizar estado local
      setCalendarData({
        ...calendarData,
        [selectedDate]: {
          ...dateData,
          tarefas: updatedTasks
        }
      });
      
      // Sincronizar com weekData se for da semana atual
      const diaSemana = getDiaSemana(selectedDate);
      if (weekData[diaSemana]) {
        setWeekData({
          ...weekData,
          [diaSemana]: {
            ...weekData[diaSemana],
            tarefas: updatedTasks
          }
        });
      }
    }
    
    setNewTask("");
    setNeedsUpdate(true);
  };

  // Função para remover uma tarefa
  const removeTask = (index) => {
    if (viewMode === "week" && weekData[currentDay]?.tarefas) {
      const updatedTasks = [...weekData[currentDay].tarefas];
      updatedTasks.splice(index, 1);
      
      // Atualizar weekData local
      setWeekData({
        ...weekData,
        [currentDay]: {
          ...weekData[currentDay],
          tarefas: updatedTasks
        }
      });
      
      // Sincronizar com o calendário
      const hoje = new Date();
      const diaSemana = hoje.getDay();
      const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
      const currentDayIndex = diasSemana.indexOf(currentDay);
      const diff = currentDayIndex - diaSemana;
      
      const targetDate = new Date(hoje);
      targetDate.setDate(hoje.getDate() + diff);
      const dateStr = formatDate(targetDate);
      
      // Salvar no CalendarData e localStorage
      const dateData = getCalendarDataForDate(dateStr) || { projeto: weekData[currentDay].projeto, tarefas: [] };
      saveToCalendar(dateStr, {
        ...dateData,
        tarefas: updatedTasks
      });
    } else if (viewMode === "calendar") {
      const dateData = getCalendarDataForDate(selectedDate);
      if (dateData && dateData.tarefas) {
        const updatedTasks = [...dateData.tarefas];
        updatedTasks.splice(index, 1);
        
        // Salvar no CalendarData e localStorage
        saveToCalendar(selectedDate, {
          ...dateData,
          tarefas: updatedTasks
        });
        
        // Atualizar estado local
        setCalendarData({
          ...calendarData,
          [selectedDate]: {
            ...dateData,
            tarefas: updatedTasks
          }
        });
        
        // Sincronizar com weekData se for da semana atual
        const diaSemana = getDiaSemana(selectedDate);
        if (weekData[diaSemana]) {
          setWeekData({
            ...weekData,
            [diaSemana]: {
              ...weekData[diaSemana],
              tarefas: updatedTasks
            }
          });
        }
      }
    }
    
    setNeedsUpdate(true);
  };

  // Calcular os dias do calendário para o mês atual
  const calendarDaysData = generateCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );
  
  // Preparar dados para o modo calendário
  const selectedDateData = viewMode === "calendar" ? getCalendarDataForDate(selectedDate) : null;

  return (
    <div className="p-4 md:p-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Seletor de modo de visualização */}
        <div className="flex justify-end mb-4">
          <div className="flex rounded-lg overflow-hidden" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 ${
                viewMode === "week" 
                  ? "bg-red-700 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Planejador Semanal
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 ${
                viewMode === "calendar" 
                  ? "bg-red-700 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Calendário
            </button>
          </div>
        </div>
        
        {/* Visualização Semanal */}
        {viewMode === "week" && (
          <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
            <div className="bg-black p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-red-500">Planejador Semanal</h2>
            </div>
            
            {/* Navegação dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 p-2 bg-gray-800">
              {["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"].map((day) => (
                <button
                  key={day}
                  onClick={() => setCurrentDay(day)}
                  className={`p-2 text-center rounded-lg transition transform hover:scale-105 ${
                    currentDay === day 
                      ? "bg-red-700 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                >
                  {day.split('-')[0]}
                </button>
              ))}
            </div>
            
            {/* Conteúdo do dia selecionado */}
            <div className="p-4">
              {/* Cabeçalho do projeto */}
              <div className="flex justify-between items-center mb-4">
                {editingProject ? (
                  <div className="flex flex-1 items-center">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                    />
                    <div className="flex ml-2">
                      <button
                        onClick={saveProjectEdit}
                        className="mr-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform transition hover:scale-105"
                        style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelProjectEdit}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                        style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-white">
                      {weekData[currentDay]?.projeto || "Sem projeto definido"}
                    </h3>
                    <button 
                      onClick={startEditingProject}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-400 transform transition hover:scale-110"
                      style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              
              {/* Lista de tarefas */}
              <ul className="space-y-2 mb-4">
                {weekData[currentDay]?.tarefas?.map((task, index) => (
                  <li 
                    key={index} 
                    className="flex items-center bg-gray-700 p-3 rounded-lg group transform transition hover:scale-[1.02]"
                    style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                  >
                    <div 
                      className={`relative w-5 h-5 mr-3 rounded-md border cursor-pointer ${
                        task.completed ? 'bg-red-600 border-red-700' : 'bg-gray-800 border-gray-600'
                      }`}
                      onClick={() => toggleTaskCompletion(index)}
                      style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.2), -2px -2px 4px rgba(60,60,60,0.05)'}}
                    >
                      {task.completed && (
                        <svg className="absolute inset-0 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    {editingTaskIndex === index ? (
                      <div className="flex flex-1 items-center">
                        <input
                          type="text"
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                        />
                        <div className="flex ml-2">
                          <button
                            onClick={saveTaskEdit}
                            className="mr-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform transition hover:scale-105"
                            style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelTaskEdit}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                            style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.text}
                        </span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => startEditingTask(index)}
                            className="text-gray-400 hover:text-yellow-400 transform transition hover:scale-110"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => removeTask(index)}
                            className="text-gray-400 hover:text-red-500 transform transition hover:scale-110"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Adicionar nova tarefa */}
              <div className="flex">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Adicionar nova tarefa..."
                  className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <button 
                  onClick={addTask}
                  className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transform transition hover:scale-105"
                  style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Visualização do Calendário (código omitido para brevidade) */}
        {viewMode === "calendar" && (
          <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
            <div className="bg-black p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-red-500">Calendário</h2>
            </div>
            
            {/* Navegação do calendário */}
            <div className="flex justify-between items-center p-4 bg-gray-800">
              <button 
                onClick={previousMonth}
                className="p-2 rounded-lg text-gray-300 hover:text-red-400 transform transition hover:scale-110"
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                ◀
              </button>
              <h3 className="text-lg font-medium text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-lg text-gray-300 hover:text-red-400 transform transition hover:scale-110"
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                ▶
              </button>
            </div>
            
            {/* Grade do calendário */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekdayNames.map((day, index) => (
                  <div key={index} className="text-center text-gray-400 font-medium">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarDaysData.map((day, index) => {
                  const dateStr = day.dateStr;
                  const isToday = dateStr === formatDate(new Date());
                  const isSelected = dateStr === selectedDate;
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        h-20 p-1 rounded-lg cursor-pointer transform transition hover:scale-105
                        ${!day.isCurrentMonth ? 'opacity-40' : ''}
                        ${isSelected ? 'ring-2 ring-red-500' : ''}
                        ${isToday ? 'bg-gray-700' : 'bg-gray-700'}
                      `}
                      style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                    >
                      <div className="text-right">
                        <span className={`
                          inline-block w-6 h-6 rounded-full text-center leading-6
                          ${isToday ? 'bg-red-600 text-white' : 'text-gray-300'}
                        `}>
                          {day.date.getDate()}
                        </span>
                      </div>
                      
                      {day.hasTasks && (
                        <div className="mt-1 text-xs text-gray-300 truncate">
                          {getCalendarDataForDate(dateStr)?.projeto}
                        </div>
                      )}
                      
                      {day.hasTasks && (
                        <div className="mt-1">
                          <div className="h-1 bg-red-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Detalhes do dia selecionado */}
            <div className="p-4 bg-gray-700 m-4 rounded-lg" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
              {/* Cabeçalho do projeto */}
              <div className="flex justify-between items-center mb-4">
                {editingProject ? (
                  <div className="flex flex-1 items-center">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                    />
                    <div className="flex ml-2">
                      <button
                        onClick={saveProjectEdit}
                        className="mr-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform transition hover:scale-105"
                        style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelProjectEdit}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                        style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-white">
                      {selectedDateData?.projeto || "Sem projeto para esta data"}
                    </h3>
                    <button 
                      onClick={startEditingProject}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-400 transform transition hover:scale-110"
                      style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              
              {/* Lista de tarefas */}
              <ul className="space-y-2 mb-4">
                {selectedDateData?.tarefas?.map((task, index) => (
                  <li 
                    key={index} 
                    className="flex items-center bg-gray-800 p-3 rounded-lg group transform transition hover:scale-[1.02]"
                    style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                  >
                    <div 
                      className={`relative w-5 h-5 mr-3 rounded-md border cursor-pointer ${
                        task.completed ? 'bg-red-600 border-red-700' : 'bg-gray-700 border-gray-600'
                      }`}
                      onClick={() => toggleTaskCompletion(index)}
                      style={{boxShadow: '2px 2px 4px rgba(0,0,0,0.2), -2px -2px 4px rgba(60,60,60,0.05)'}}
                    >
                      {task.completed && (
                        <svg className="absolute inset-0 w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    {editingTaskIndex === index ? (
                      <div className="flex flex-1 items-center">
                        <input
                          type="text"
                          value={newTaskText}
                          onChange={(e) => setNewTaskText(e.target.value)}
                          className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                        />
                        <div className="flex ml-2">
                          <button
                            onClick={saveTaskEdit}
                            className="mr-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transform transition hover:scale-105"
                            style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelTaskEdit}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition hover:scale-105"
                            style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.text}
                        </span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => startEditingTask(index)}
                            className="text-gray-400 hover:text-yellow-400 transform transition hover:scale-110"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => removeTask(index)}
                            className="text-gray-400 hover:text-red-500 transform transition hover:scale-110"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
                
                {(!selectedDateData || !selectedDateData.tarefas || selectedDateData.tarefas.length === 0) && (
                  <li className="p-3 text-gray-400 text-center">
                    Nenhuma tarefa para esta data
                  </li>
                )}
              </ul>
              
              {/* Adicionar nova tarefa */}
              <div className="flex">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Adicionar nova tarefa..."
                  className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  style={{boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(60,60,60,0.1)'}}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <button 
                  onClick={addTask}
                  className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transform transition hover:scale-105"
                  style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlannerApp;