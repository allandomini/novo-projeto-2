import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Componente de análise integrada com dados conectados de outras partes do app
const AnalysesTab = () => {
  // Estados para controle de visualização
  const [activeSection, setActiveSection] = useState("overview");
  const [timeRange, setTimeRange] = useState("week");
  
  // Estados para armazenar dados de outras partes do app
  const [financialData, setFinancialData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [financialGoals, setFinancialGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pomodoroSessions, setPomodoroSessions] = useState([]);
  const [weekPlanData, setWeekPlanData] = useState({});
  const [calendarData, setCalendarData] = useState({});
  
  // Estados para dados calculados
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
    completionRate: 0,
    categories: {}
  });
  
  const [financialStats, setFinancialStats] = useState({
    totalPatrimony: 0,
    totalIncome: 0, 
    totalExpenses: 0,
    savingsRate: 0,
    investmentReturn: 0,
    investmentAllocation: [],
    recentTransactions: [],
    patrimonialTrend: []
  });
  
  const [timeStats, setTimeStats] = useState({
    totalFocusTime: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    completionRate: 0,
    mostProductiveDay: "",
    focusTrend: [],
    productivityByHour: []
  });
  
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0, 
    pendingTasks: 0,
    projectProgress: [],
    projectDistribution: [],
    projectTimeTrend: []
  });
  
  const [integratedStats, setIntegratedStats] = useState({
    productivityScore: 0,
    focusEfficiency: 0,
    financialHealth: 0,
    balanceIndex: 0,
    recommendations: [],
    overallTrend: []
  });

  // Carrega os dados do localStorage quando o componente monta
  useEffect(() => {
    const loadStoredData = () => {
      // Carregar dados financeiros
      const storedFinancialData = localStorage.getItem('financialData');
      if (storedFinancialData) {
        setFinancialData(JSON.parse(storedFinancialData));
      }
      
      // Carregar metas
      const storedGoals = localStorage.getItem('goals');
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
      
      // Carregar metas financeiras
      const storedFinancialGoals = localStorage.getItem('financialGoals');
      if (storedFinancialGoals) {
        setFinancialGoals(JSON.parse(storedFinancialGoals));
      }
      
      // Carregar transações
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      
      // Carregar sessões de pomodoro
      const storedPomodoroSessions = localStorage.getItem('pomodoroSessions');
      if (storedPomodoroSessions) {
        setPomodoroSessions(JSON.parse(storedPomodoroSessions));
      }
      
      // Carregar dados do planejador semanal
      const storedWeekData = localStorage.getItem('weeklyPlannerData');
      if (storedWeekData) {
        setWeekPlanData(JSON.parse(storedWeekData));
      }
      
      // Carregar dados do calendário
      const storedCalendarData = localStorage.getItem('calendarData');
      if (storedCalendarData) {
        setCalendarData(JSON.parse(storedCalendarData));
      }
    };
    
    loadStoredData();
    
    // Configurar um ouvinte para armazenamento para atualizar dados quando eles mudam
    const handleStorageChange = (e) => {
      if (e.key === 'financialData' || e.key === 'goals' || 
          e.key === 'financialGoals' || e.key === 'transactions' ||
          e.key === 'pomodoroSessions' || e.key === 'weeklyPlannerData' ||
          e.key === 'calendarData') {
        loadStoredData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Efeito para calcular estatísticas de tarefas
  useEffect(() => {
    // Usar os dados das metas carregados do localStorage
    const completedGoals = goals.filter(goal => goal.completed).length;
    const pendingGoals = goals.filter(goal => !goal.completed).length;
    const completionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;
    
    // Categorizar tarefas (baseado nos projetos do planejador semanal)
    const categories = {};
    
    // Adicionar categorias dos projetos do planejador semanal
    Object.values(weekPlanData).forEach(dayData => {
      if (dayData.projeto) {
        const projectName = dayData.projeto.split(' ')[0]; // Simplificado para o primeiro nome
        categories[projectName] = (categories[projectName] || 0) + dayData.tarefas.length;
      }
    });
    
    // Se não houver categorias, criar dados de exemplo
    if (Object.keys(categories).length === 0) {
      categories["Desenvolvimento"] = 0;
      categories["Marketing"] = 0;
      categories["Educação"] = 0;
      categories["Design"] = 0;
    }
    
    // Dados para gráfico de completude de tarefas ao longo do tempo
    const taskCompletionTrend = [
      { date: '2025-03-10', rate: 0 },
      { date: '2025-03-11', rate: 0 },
      { date: '2025-03-12', rate: 0 },
      { date: '2025-03-13', rate: 0 },
      { date: '2025-03-14', rate: 0 },
      { date: '2025-03-15', rate: 0 },
      { date: '2025-03-16', rate: 0 }
    ];
    
    setTaskStats({
      completed: completedGoals,
      pending: pendingGoals,
      completionRate,
      categories,
      taskCompletionTrend
    });
  }, [goals, weekPlanData]);
  
  // Efeito para calcular estatísticas financeiras
  useEffect(() => {
    // Cálculos financeiros
    const totalPatrimony = financialData.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Cálculo de rendimento de investimentos
    const investmentAccounts = financialData.filter(item => item.type === "investment");
    const totalInvestments = investmentAccounts.reduce((sum, item) => sum + item.amount, 0);
    const totalMonthlyYield = investmentAccounts.reduce((sum, item) => {
      const monthlyYield = item.amount * (item.yield / 100);
      return sum + monthlyYield;
    }, 0);
    const investmentReturn = totalInvestments > 0 ? (totalMonthlyYield / totalInvestments) * 100 : 0;
    
    // Alocação de investimentos
    const investmentAllocation = investmentAccounts.map(item => ({
      name: item.name,
      value: (item.amount / (totalInvestments || 1)) * 100,
      amount: item.amount,
      monthlyYield: item.amount * (item.yield / 100)
    }));
    
    // Se não houver alocações, criar dados de exemplo
    if (investmentAllocation.length === 0) {
      investmentAllocation.push({ name: "Sem investimentos", value: 100, amount: 0, monthlyYield: 0 });
    }
    
    // Transações recentes (últimas 5)
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Dados para gráfico de tendência patrimonial
    const today = new Date();
    const patrimonialTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return {
        date: date.toISOString().substring(0, 10),
        patrimony: 0 // Inicializado com zero
      };
    });
    
    setFinancialStats({
      totalPatrimony,
      totalIncome,
      totalExpenses,
      savingsRate,
      investmentReturn,
      investmentAllocation,
      recentTransactions,
      patrimonialTrend
    });
  }, [financialData, transactions]);
  
  // Efeito para calcular estatísticas de tempo
  useEffect(() => {
    const totalSessions = pomodoroSessions.length;
    const completedSessions = pomodoroSessions.filter(s => s.completed).length;
    const totalFocusTime = pomodoroSessions.reduce((sum, s) => sum + (s.completed ? s.duration : 0), 0);
    const averageSessionLength = completedSessions > 0 ? totalFocusTime / completedSessions : 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    
    // Encontrar o dia mais produtivo
    const dayProductivity = {};
    pomodoroSessions.forEach(s => {
      if (s.completed) {
        if (!dayProductivity[s.date]) {
          dayProductivity[s.date] = 0;
        }
        dayProductivity[s.date] += s.duration;
      }
    });
    
    let mostProductiveDay = "";
    let maxProductivity = 0;
    Object.entries(dayProductivity).forEach(([date, time]) => {
      if (time > maxProductivity) {
        mostProductiveDay = date;
        maxProductivity = time;
      }
    });
    
    // Criar dados de tendência para o gráfico - inicializado com zeros
    const focusTrend = [
      { day: "Seg", minutes: 0 },
      { day: "Ter", minutes: 0 },
      { day: "Qua", minutes: 0 },
      { day: "Qui", minutes: 0 },
      { day: "Sex", minutes: 0 },
      { day: "Sáb", minutes: 0 },
      { day: "Dom", minutes: 0 }
    ];
    
    // Produtividade por hora do dia - inicializado com zeros
    const productivityByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      productivity: 0
    }));
    
    setTimeStats({
      totalFocusTime,
      totalSessions,
      averageSessionLength,
      completionRate,
      mostProductiveDay,
      focusTrend,
      productivityByHour
    });
  }, [pomodoroSessions]);
  
  // Efeito para calcular estatísticas de projetos
  useEffect(() => {
    // Contar projetos e tarefas a partir dos dados do planejador semanal
    const projects = Object.values(weekPlanData).map(day => day.projeto || "");
    const uniqueProjects = [...new Set(projects.filter(p => p))];
    const totalProjects = uniqueProjects.length;
    
    // Contar tarefas por projeto
    const projectTasks = {};
    Object.values(weekPlanData).forEach(day => {
      if (day.projeto && day.tarefas) {
        if (!projectTasks[day.projeto]) {
          projectTasks[day.projeto] = {
            total: 0,
            completed: 0
          };
        }
        
        projectTasks[day.projeto].total += day.tarefas.length;
        // Como não temos dados reais de conclusão, assumimos 0 por enquanto
        projectTasks[day.projeto].completed = 0;
      }
    });
    
    // Calcular progresso dos projetos
    const projectProgress = Object.entries(projectTasks).map(([name, data]) => ({
      name,
      progress: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      completed: data.completed,
      total: data.total
    }));
    
    // Se não houver projetos, criar dados de exemplo
    if (projectProgress.length === 0) {
      projectProgress.push({ 
        name: "Sem projetos", 
        progress: 0, 
        completed: 0, 
        total: 0 
      });
    }
    
    // Distribuição de tempo por projeto (valores iniciais zerados)
    const projectDistribution = uniqueProjects.length > 0 
      ? uniqueProjects.map(name => ({ name, percentage: 0 }))
      : [
          { name: "Curso de IA para Jogos", percentage: 0 },
          { name: "Vender Sites", percentage: 0 },
          { name: "Vender Modelos 3D", percentage: 0 },
          { name: "Criar Jogo para STEAM", percentage: 0 }
        ];
    
    // Criar dados de tendência de tempo em projetos
    const today = new Date();
    const projectTimeTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return {
        date: date.toISOString().substring(0, 10),
        minutes: 0 // Inicializado com zero
      };
    });
    
    const totalTasks = Object.values(projectTasks).reduce((sum, data) => sum + data.total, 0);
    const completedTasks = Object.values(projectTasks).reduce((sum, data) => sum + data.completed, 0);
    
    setProjectStats({
      totalProjects,
      activeProjects: totalProjects,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      projectProgress,
      projectDistribution,
      projectTimeTrend
    });
  }, [weekPlanData]);
  
  // Efeito para calcular estatísticas integradas e pontuação geral
  useEffect(() => {
    // Calcular índice de produtividade (escala 0-100)
    const taskScore = taskStats.completionRate;
    const timeScore = timeStats.completionRate;
    const projectScore = projectStats.completedTasks + projectStats.pendingTasks > 0 
      ? (projectStats.completedTasks / (projectStats.completedTasks + projectStats.pendingTasks)) * 100 
      : 0;
    
    const productivityScore = (taskScore + timeScore + projectScore) / 3;
    
    // Calcular eficiência de foco
    const focusEfficiency = timeStats.completionRate;
    
    // Calcular saúde financeira (0-100)
    const savingsScore = Math.min(financialStats.savingsRate * 2, 100); // 50% savings rate = 100 score
    const investmentScore = Math.min(financialStats.investmentReturn * 10, 100); // 10% return = 100 score
    const financialHealth = (savingsScore + investmentScore) / 2;
    
    // Índice de equilíbrio - simplificado já que começamos com dados vazios
    const balanceIndex = 50; // Valor neutro inicial
    
    // Gerar recomendações iniciais
    const recommendations = [
      "Configure suas metas e comece a registrar suas tarefas completadas para obter análises personalizadas.",
      "Adicione seus ativos financeiros e transações para ativar a análise financeira completa.",
      "Use o timer Pomodoro regularmente para medir sua produtividade e melhorar o foco.",
      "Configure seu planejador semanal para distribuir melhor o tempo entre projetos."
    ];
    
    // Criar dados de tendência geral para o gráfico
    const today = new Date();
    const overallTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return {
        date: date.toISOString().substring(0, 10),
        productivity: 0,
        financial: 0,
        balance: 0
      };
    });
    
    setIntegratedStats({
      productivityScore,
      focusEfficiency,
      financialHealth,
      balanceIndex,
      recommendations,
      overallTrend
    });
  }, [taskStats, timeStats, projectStats, financialStats]);

  // Cores para gráficos
  const COLORS = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#d53f8c'];
  
  // Cores específicas para indicadores
  const INDICATOR_COLORS = {
    productivity: '#e53e3e', // Vermelho
    financial: '#38a169',    // Verde
    focus: '#3182ce',        // Azul
    balance: '#d69e2e'       // Amarelo
  };

  // Função para formatar números como porcentagem
  const formatPercent = (value) => `${value.toFixed(1)}%`;
  
  // Função para formatar valores monetários
  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  // Função para formatar datas
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho e controles */}
        <div className="bg-black rounded-2xl shadow-lg p-4 sticky top-0 z-10" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold text-red-500 mb-3 md:mb-0">Sistema de Análise de Produtividade</h1>
            
            <div className="flex space-x-2">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}
              >
                <option value="week">Últimos 7 dias</option>
                <option value="month">Último mês</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último ano</option>
              </select>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex overflow-x-auto space-x-2 mt-4 pb-1">
            <button 
              onClick={() => setActiveSection("overview")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition transform hover:scale-105 ${
                activeSection === "overview" 
                  ? "bg-red-700 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveSection("tasks")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition transform hover:scale-105 ${
                activeSection === "tasks" 
                  ? "bg-red-700 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
            >
              Análise de Tarefas
            </button>
            <button 
              onClick={() => setActiveSection("finance")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition transform hover:scale-105 ${
                activeSection === "finance" 
                  ? "bg-red-700 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
            >
              Análise Financeira
            </button>
            <button 
              onClick={() => setActiveSection("time")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition transform hover:scale-105 ${
                activeSection === "time" 
                  ? "bg-red-700 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
            >
              Gestão de Tempo
            </button>
            <button 
              onClick={() => setActiveSection("projects")}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition transform hover:scale-105 ${
                activeSection === "projects" 
                  ? "bg-red-700 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}
            >
              Projetos
            </button>
          </div>
        </div>
        
        {/* Visão Geral */}
        {activeSection === "overview" && (
          <>
            {/* Indicadores principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-2xl transform transition hover:scale-[1.02]" style={{boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)'}}>
                <h3 className="text-gray-400 text-sm">Índice de Produtividade</h3>
                <div className="flex items-end space-x-2 mt-1">
                  <span className="text-3xl font-bold text-white">{integratedStats.productivityScore.toFixed(1)}</span>
                  <span className="text-gray-400 pb-1">/100</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${integratedStats.productivityScore}%` }}></div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-2xl transform transition hover:scale-[1.02]" style={{boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)'}}>
                <h3 className="text-gray-400 text-sm">Eficiência de Foco</h3>
                <div className="flex items-end space-x-2 mt-1">
                  <span className="text-3xl font-bold text-white">{integratedStats.focusEfficiency.toFixed(1)}</span>
                  <span className="text-gray-400 pb-1">/100</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${integratedStats.focusEfficiency}%` }}></div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-2xl transform transition hover:scale-[1.02]" style={{boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)'}}>
                <h3 className="text-gray-400 text-sm">Saúde Financeira</h3>
                <div className="flex items-end space-x-2 mt-1">
                  <span className="text-3xl font-bold text-white">{integratedStats.financialHealth.toFixed(1)}</span>
                  <span className="text-gray-400 pb-1">/100</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${integratedStats.financialHealth}%` }}></div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-2xl transform transition hover:scale-[1.02]" style={{boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)'}}>
                <h3 className="text-gray-400 text-sm">Equilíbrio entre Projetos</h3>
                <div className="flex items-end space-x-2 mt-1">
                  <span className="text-3xl font-bold text-white">{integratedStats.balanceIndex.toFixed(1)}</span>
                  <span className="text-gray-400 pb-1">/100</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${integratedStats.balanceIndex}%` }}></div>
                </div>
              </div>
            </div>
            
            {/* Insights e recomendações */}
            <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
              <h2 className="text-xl font-semibold text-red-500 mb-4">Análise Integrada e Recomendações</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-white mb-2">Recomendações Personalizadas</h3>
                  <ul className="space-y-2">
                    {integratedStats.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-400 mr-2">→</span>
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-2">Insights do Período</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                      <h4 className="text-gray-300 font-medium mb-2">Progresso em Tarefas</h4>
                      <p className="text-gray-400">Você completou {taskStats.completed} de {taskStats.completed + taskStats.pending} tarefas ({taskStats.completionRate.toFixed(1)}%).</p>
                      <p className="text-gray-400 mt-1">
                        {taskStats.completed + taskStats.pending === 0 
                          ? "Comece a adicionar tarefas na aba de Ferramentas." 
                          : taskStats.completionRate > 70 
                            ? "Excelente progresso! Continue assim." 
                            : "Foque em finalizar tarefas pendentes."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                      <h4 className="text-gray-300 font-medium mb-2">Desempenho Financeiro</h4>
                      <p className="text-gray-400">Taxa de economia: {financialStats.savingsRate.toFixed(1)}%</p>
                      <p className="text-gray-400 mt-1">
                        {financialStats.totalPatrimony === 0 
                          ? "Adicione seus ativos financeiros na aba de Ferramentas." 
                          : financialStats.savingsRate > 20 
                            ? "Boa taxa de economia! Mantenha esse ritmo." 
                            : "Considere reduzir despesas para aumentar sua taxa de economia."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                      <h4 className="text-gray-300 font-medium mb-2">Gestão de Tempo</h4>
                      <p className="text-gray-400">Tempo total de foco: {timeStats.totalFocusTime} minutos</p>
                      <p className="text-gray-400 mt-1">
                        {timeStats.totalSessions === 0 
                          ? "Use o Timer Pomodoro para registrar sessões de foco." 
                          : timeStats.totalFocusTime > 300 
                            ? "Bom trabalho mantendo o foco!" 
                            : "Tente aumentar seu tempo de foco diário."}
                      </p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                      <h4 className="text-gray-300 font-medium mb-2">Progresso de Projetos</h4>
                      <p className="text-gray-400">Projetos ativos: {projectStats.activeProjects}</p>
                      <p className="text-gray-400 mt-1">
                        {projectStats.totalProjects === 0 
                          ? "Configure seus projetos no Planejador Semanal." 
                          : projectStats.activeProjects > 3 
                            ? "Considere focar em menos projetos para maior eficiência." 
                            : "Boa distribuição de projetos."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tendências */}
            <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
              <h2 className="text-xl font-semibold text-red-500 mb-4">Tendências ao Longo do Tempo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-700 rounded-xl p-4" style={{boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)'}}>
                  <h3 className="text-white font-medium mb-2">Produtividade ao Longo do Tempo</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={integratedStats.overallTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate} 
                        stroke="#999" 
                      />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} 
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Produtividade']}
                        labelFormatter={formatDate}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="productivity" 
                        name="Produtividade" 
                        stroke={INDICATOR_COLORS.productivity} 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        name="Equilíbrio" 
                        stroke={INDICATOR_COLORS.balance} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-64 bg-gray-700 rounded-xl p-4" style={{boxShadow: '5px 5px 10px rgba(0,0,0,0.3), -5px -5px 10px rgba(60,60,60,0.1)'}}>
                  <h3 className="text-white font-medium mb-2">Crescimento Financeiro</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={financialStats.patrimonialTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate} 
                        stroke="#999" 
                      />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} 
                        formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Patrimônio']}
                        labelFormatter={formatDate}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="patrimony" 
                        name="Patrimônio" 
                        stroke={INDICATOR_COLORS.financial} 
                        fill={INDICATOR_COLORS.financial} 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Análise de Tarefas */}
        {activeSection === "tasks" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Resumo de Tarefas</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Tarefas Completadas</h3>
                    <div className="text-2xl font-bold text-white">{taskStats.completed}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Tarefas Pendentes</h3>
                    <div className="text-2xl font-bold text-white">{taskStats.pending}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Taxa de Conclusão</h3>
                    <div className="text-2xl font-bold text-white">{taskStats.completionRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Tendência</h3>
                    <div className="text-2xl font-bold text-gray-300">-</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3">Conselhos para Melhorar</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Divida tarefas grandes em subtarefas menores e mais gerenciáveis.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Use a técnica Pomodoro para manter o foco em tarefas difíceis.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Priorize tarefas usando a matriz de Eisenhower (Urgente vs. Importante).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Revise suas metas regularmente e ajuste conforme necessário.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Distribuição de Tarefas</h2>
                
                <div className="h-64">
                  <h3 className="text-white font-medium mb-2">Distribuição de Tarefas</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={Object.entries(taskStats.categories).map(([name, count]) => ({ name, value: count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(taskStats.categories).map(([_, count], index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} tarefas`, '']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-white mb-3">Tarefas por Categoria</h3>
                  <div className="space-y-3">
                    {Object.entries(taskStats.categories).map(([category, count]) => (
                      <div key={category} className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                        <div className="flex justify-between items-center">
                          <span className="text-white">{category}</span>
                          <span className="text-gray-300">{count} tarefas</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${(count / Object.values(taskStats.categories).reduce((a, b) => a + b, 0) || 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
              <h2 className="text-xl font-semibold text-red-500 mb-4">Análise de Conclusão de Tarefas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <h3 className="font-medium text-white mb-2">Taxa de Conclusão ao Longo do Tempo</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={taskStats.taskCompletionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate} 
                        stroke="#999" 
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={formatPercent} 
                        stroke="#999" 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Taxa de Conclusão']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                        labelFormatter={formatDate}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        name="Taxa de Conclusão" 
                        stroke="#e53e3e" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-64">
                  <h3 className="font-medium text-white mb-2">Distribuição de Tarefas por Projeto</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={projectStats.projectProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'total' ? 'Total de Tarefas' : 'Tarefas Completadas']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total de Tarefas" fill="#3182ce" />
                      <Bar dataKey="completed" name="Tarefas Completadas" fill="#e53e3e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Análise Financeira */}
        {activeSection === "finance" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01] md:col-span-2" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Visão Geral Financeira</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Patrimônio Total</h3>
                    <div className="text-2xl font-bold text-white">R$ {financialStats.totalPatrimony.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Receita Total</h3>
                    <div className="text-2xl font-bold text-green-400">R$ {financialStats.totalIncome.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Despesas</h3>
                    <div className="text-2xl font-bold text-red-400">R$ {financialStats.totalExpenses.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Taxa de Economia</h3>
                    <div className="text-2xl font-bold text-white">{financialStats.savingsRate.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="h-64">
                  <h3 className="font-medium text-white mb-2">Crescimento Patrimonial</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={financialStats.patrimonialTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        stroke="#999" 
                      />
                      <YAxis 
                        stroke="#999"
                        tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Patrimônio']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                        labelFormatter={formatDate}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="patrimony" 
                        name="Patrimônio" 
                        stroke="#38a169" 
                        fill="#38a169" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Transações Recentes</h2>
                
                <div className="space-y-4 overflow-y-auto max-h-96">
                  {financialStats.recentTransactions.length > 0 ? (
                    financialStats.recentTransactions.map(transaction => (
                      <div key={transaction.id} className="bg-gray-700 p-3 rounded-xl flex justify-between" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                        <div>
                          <div className="font-medium text-white">{transaction.description}</div>
                          <div className="text-sm text-gray-400">{transaction.date} • {transaction.tag}</div>
                        </div>
                        <div className={transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      Nenhuma transação registrada. Adicione transações na aba de Ferramentas.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Análise de Investimentos</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-white">Rendimento Médio</h3>
                    <span className="text-green-400 font-medium">{financialStats.investmentReturn.toFixed(2)}% ao mês</span>
                  </div>
                  
                  <div className="mb-4 h-64">
                    <h3 className="font-medium text-white mb-2">Distribuição de Investimentos</h3>
                    
                    <ResponsiveContainer width="100%" height="85%">
                      <PieChart>
                        <Pie
                          data={financialStats.investmentAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {financialStats.investmentAllocation.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const item = financialStats.investmentAllocation.find(i => i.name === props.payload.name);
                            return [`${value.toFixed(1)}% (R$ ${item.amount.toLocaleString()})`, props.payload.name];
                          }}
                          contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3">Alocação de Investimentos</h3>
                  
                  <div className="space-y-3">
                    {financialStats.investmentAllocation.map(item => (
                      <div key={item.name} className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                        <div className="flex justify-between">
                          <span className="text-white">{item.name}</span>
                          <span className="text-gray-300">{item.value.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">R$ {item.amount.toLocaleString()}</span>
                          <span className="text-green-400">+R$ {item.monthlyYield.toFixed(2)}/mês</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Recomendações Financeiras</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-white mb-3">Oportunidades de Melhoria</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Aumente sua taxa de economia para pelo menos 30% da renda.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Diversifique mais seus investimentos para reduzir riscos.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Considere investir em renda fixa para ter mais segurança em seu portfólio.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        <span>Estabeleça um fundo de emergência equivalente a 6 meses de despesas.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="h-64">
                    <h3 className="font-medium text-white mb-2">Projeção de Crescimento Patrimonial</h3>
                    <ResponsiveContainer width="100%" height="85%">
                      <LineChart data={Array.from({ length: 12 }, (_, i) => ({
                        month: i + 1,
                        atual: financialStats.totalPatrimony,
                        projetado: financialStats.totalPatrimony * (1 + (financialStats.investmentReturn / 100)) ** i
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#999"
                          tickFormatter={(value) => `Mês ${value}`}
                        />
                        <YAxis 
                          stroke="#999"
                          tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`R$ ${value.toLocaleString()}`, '']}
                          labelFormatter={(label) => `Mês ${label}`}
                          contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="atual" 
                          name="Patrimônio Atual" 
                          stroke="#e53e3e" 
                          strokeWidth={2}
                          dot={{ r: 0 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="projetado" 
                          name="Projeção de Crescimento" 
                          stroke="#38a169" 
                          strokeWidth={2}
                          dot={{ r: 0 }}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Gestão de Tempo */}
        {activeSection === "time" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Análise de Tempo Focado</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Tempo Total Focado</h3>
                    <div className="text-2xl font-bold text-white">{timeStats.totalFocusTime} min</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Sessões Completadas</h3>
                    <div className="text-2xl font-bold text-white">{timeStats.totalSessions}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Duração Média</h3>
                    <div className="text-2xl font-bold text-white">{timeStats.averageSessionLength.toFixed(1)} min</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Taxa de Conclusão</h3>
                    <div className="text-2xl font-bold text-white">{timeStats.completionRate.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="h-64">
                  <h3 className="font-medium text-white mb-2">Horas Focadas por Dia</h3>
                  
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={timeStats.focusTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="day" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        formatter={(value) => [`${value} minutos`, 'Tempo Focado']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      />
                      <Bar 
                        dataKey="minutes" 
                        name="Minutos Focados" 
                        fill={INDICATOR_COLORS.focus}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Otimização de Tempo</h2>
                
                <div className="mb-6 h-64">
                  <h3 className="font-medium text-white mb-2">Produtividade por Hora do Dia</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={timeStats.productivityByHour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#999"
                        tickFormatter={(value) => `${value}h`} 
                      />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        formatter={(value) => [`${value}`, 'Produtividade']}
                        labelFormatter={(label) => `${label}:00h`}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="productivity" 
                        name="Produtividade" 
                        stroke={INDICATOR_COLORS.focus} 
                        strokeWidth={2}
                        dot={{ r: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3">Recomendações para Melhorar a Produtividade</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Reserve seus períodos de maior energia para as tarefas mais importantes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Use o método Pomodoro com períodos de 25 minutos para manter o foco.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Evite multitarefa - foque em uma tarefa por vez para melhor eficiência.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      <span>Planeje suas sessões de foco com antecedência, alinhando-as com suas metas.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
              <h2 className="text-xl font-semibold text-red-500 mb-4">Distribuição de Tempo por Projeto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <h3 className="font-medium text-white mb-2">Tempo Gasto por Projeto</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={projectStats.projectDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStats.projectDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, '']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3">Tempo por Projeto</h3>
                  
                  <div className="space-y-3">
                    {projectStats.projectDistribution.map(project => (
                      <div key={project.name} className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                        <div className="flex justify-between">
                          <span className="text-white">{project.name}</span>
                          <span className="text-gray-300">{project.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${project.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Projetos */}
        {activeSection === "projects" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Visão Geral de Projetos</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Total de Projetos</h3>
                    <div className="text-2xl font-bold text-white">{projectStats.totalProjects}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Projetos Ativos</h3>
                    <div className="text-2xl font-bold text-white">{projectStats.activeProjects}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Tarefas Completadas</h3>
                    <div className="text-2xl font-bold text-white">{projectStats.completedTasks}</div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                    <h3 className="text-gray-300 text-sm mb-1">Tarefas Pendentes</h3>
                    <div className="text-2xl font-bold text-white">{projectStats.pendingTasks}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3">Progresso dos Projetos</h3>
                  
                  <div className="space-y-4">
                    {projectStats.projectProgress.map(project => (
                      <div key={project.name} className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                        <div className="flex justify-between">
                          <span className="text-white">{project.name}</span>
                          <span className="text-gray-300">{project.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {project.completed} de {project.total} tarefas completadas
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
                <h2 className="text-xl font-semibold text-red-500 mb-4">Análise de Projetos</h2>
                
                <div className="mb-6 h-64">
                  <h3 className="font-medium text-white mb-2">Distribuição de Esforço</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart 
                      data={projectStats.projectDistribution} 
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis type="number" stroke="#999" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        stroke="#999" 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Tempo Dedicado']}
                        contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      />
                      <Bar 
                        dataKey="percentage" 
                        name="Tempo Dedicado" 
                        fill={INDICATOR_COLORS.productivity}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-3">Retorno por Projeto</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                      <div className="flex justify-between">
                        <span className="text-white">Curso de IA para Jogos</span>
                        <span className="text-green-400">Alto</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Potencial de receita mensal: R$ 2.500 - R$ 5.000
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                      <div className="flex justify-between">
                        <span className="text-white">Vender Sites</span>
                        <span className="text-green-400">Alto</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Potencial de receita por cliente: R$ 1.500 - R$ 3.000
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                      <div className="flex justify-between">
                        <span className="text-white">Vender Modelos 3D</span>
                        <span className="text-yellow-400">Médio</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Potencial de receita mensal: R$ 800 - R$ 1.200
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded-lg" style={{boxShadow: '3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(60,60,60,0.1)'}}>
                      <div className="flex justify-between">
                        <span className="text-white">Criar Jogo para STEAM</span>
                        <span className="text-blue-400">Longo Prazo</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Potencial de receita: Variável, mas potencialmente alto
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl transform transition hover:scale-[1.01]" style={{boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -8px -8px 16px rgba(50,50,50,0.1)'}}>
              <h2 className="text-xl font-semibold text-red-500 mb-4">Recomendações para Projetos</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                  <h3 className="font-medium text-white mb-2">Otimização de Projetos</h3>
                  <p className="text-gray-300">Com base na análise de tempo e retorno, considere priorizar o "Curso de IA para Jogos" e "Vender Sites" para maximizar o retorno sobre o tempo investido.</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                  <h3 className="font-medium text-white mb-2">Equilíbrio de Recursos</h3>
                  <p className="text-gray-300">Aumentar ligeiramente o tempo dedicado ao projeto "Vender Modelos 3D" pode gerar um retorno mais equilibrado com menor investimento de tempo.</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                  <h3 className="font-medium text-white mb-2">Estratégia de Longo Prazo</h3>
                  <p className="text-gray-300">Para o projeto "Criar Jogo para STEAM", considere estabelecer marcos menores e mais frequentes para manter o progresso constante neste projeto de longo prazo.</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-xl" style={{boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(60,60,60,0.1)'}}>
                  <h3 className="font-medium text-white mb-2">Próximos Passos Sugeridos</h3>
                  <ul className="space-y-1 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">→</span>
                      <span>Finalize o módulo inicial do curso de IA para estabelecer uma base de receita.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">→</span>
                      <span>Crie um pacote completo de serviços para venda de sites.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">→</span>
                      <span>Automatize parte do processo de criação de modelos 3D para aumentar a produtividade.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">→</span>
                      <span>Desenvolva um protótipo jogável do jogo STEAM para validar o conceito.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysesTab;