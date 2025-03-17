// Arquivo: src/utils/dateUtils.js

// Função para obter o dia atual da semana
export function obterDiaAtual() {
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const hoje = new Date().getDay();
    return dias[hoje];
  }
  
  // Função para formatar data no formato YYYY-MM-DD
  export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Função para obter o primeiro dia do mês
  export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
  }
  
  // Função para obter o último dia do mês
  export function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0);
  }
  
  // Função para sincronizar os dados da semana com o calendário
  export function syncWeekDataToCalendar(weekData, calendarData) {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Ajuste para começar no domingo
    
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const newCalendarData = { ...calendarData };
    
    // Para cada dia da semana, sincronize com a data correspondente no calendário
    dias.forEach((dia, index) => {
      if (weekData[dia]) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const dateStr = formatDate(date);
        
        newCalendarData[dateStr] = {
          projeto: weekData[dia].projeto,
          tarefas: [...weekData[dia].tarefas]
        };
      }
    });
    
    return newCalendarData;
  }
  
  // Função para obter a data correspondente a um dia da semana
  export function getDateFromWeekday(weekday) {
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const today = new Date();
    const currentDayIndex = today.getDay();
    
    const targetDayIndex = dias.indexOf(weekday);
    if (targetDayIndex === -1) return null;
    
    const diff = targetDayIndex - currentDayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    
    return targetDate;
  }
  
  // Função para obter o dia da semana de uma data
  export function getWeekdayFromDate(date) {
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dateObj = new Date(date);
    return dias[dateObj.getDay()];
  }
  
  // Função para verificar se duas datas são do mesmo dia
  export function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  // Função para formatar data no formato legível (DD/MM/YYYY)
  export function formatDateDisplay(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // Função para adicionar dias a uma data
  export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  // Função para calcular a diferença de dias entre duas datas
  export function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milisegundos
    const diffTime = Math.abs(date2 - date1);
    return Math.round(diffTime / oneDay);
  }
  
  // Função para obter o início da semana atual (domingo)
  export function getStartOfWeek(date = new Date()) {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    return result;
  }
  
  // Função para obter o final da semana atual (sábado)
  export function getEndOfWeek(date = new Date()) {
    const result = new Date(date);
    const day = result.getDay();
    result.setDate(result.getDate() + (6 - day));
    return result;
  }
  
  // Função para verificar se uma data está entre duas datas
  export function isDateBetween(date, startDate, endDate) {
    return date >= startDate && date <= endDate;
  }
  
  // Função para obter o nome do mês
  export function getMonthName(monthIndex) {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 
      'Maio', 'Junho', 'Julho', 'Agosto', 
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return monthNames[monthIndex];
  }