const fs = require('fs');
const path = require('path');

// Configuración del path para producción y desarrollo
const dataPath = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'transactions.json')
  : path.join(__dirname, 'transactions.json');

// Función para inicializar datos en producción
const initializeProductionData = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Inicializando datos para entorno de producción...');
    const initialData = {
      transactions: [],
      categories: [
        { id: 1, name: 'Comida', type: 'gasto', color: '#FF6384' },
        { id: 2, name: 'Transporte', type: 'gasto', color: '#36A2EB' },
        { id: 3, name: 'Entretenimiento', type: 'gasto', color: '#FFCE56' },
        { id: 4, name: 'Salario', type: 'ingreso', color: '#4BC0C0' },
        { id: 5, name: 'Freelance', type: 'ingreso', color: '#9966FF' },
        { id: 6, name: 'Otros', type: 'mixto', color: '#FF9F40' }
      ],
      nextId: 1
    };
    
    try {
      if (!fs.existsSync(dataPath)) {
        console.log('📁 Creando archivo de datos inicial en producción...');
        // Crear directorio /tmp si no existe
        const tmpDir = path.dirname(dataPath);
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
        console.log('✅ Archivo de datos creado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error al inicializar datos en producción:', error);
    }
  }
};

// Inicializar datos inmediatamente
initializeProductionData();

// Función para leer transacciones
const readTransactions = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      // Si el archivo no existe, crear uno con datos iniciales
      const initialData = {
        transactions: [],
        categories: [
          { id: 1, name: 'Comida', type: 'gasto', color: '#FF6384' },
          { id: 2, name: 'Transporte', type: 'gasto', color: '#36A2EB' },
          { id: 3, name: 'Entretenimiento', type: 'gasto', color: '#FFCE56' },
          { id: 4, name: 'Salario', type: 'ingreso', color: '#4BC0C0' },
          { id: 5, name: 'Freelance', type: 'ingreso', color: '#9966FF' },
          { id: 6, name: 'Otros', type: 'mixto', color: '#FF9F40' }
        ],
        nextId: 1
      };
      
      // Asegurarse de que el directorio existe
      const dir = path.dirname(dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading transactions:', error);
    // Devolver estructura vacía pero válida
    return { transactions: [], categories: [], nextId: 1 };
  }
};

// Función para guardar transacciones
const saveTransactions = (data) => {
  try {
    // Asegurarse de que el directorio existe
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
};

// Obtener todas las transacciones
const getAllTransactions = () => {
  const data = readTransactions();
  return data.transactions;
};

// Obtener transacción por ID
const getTransactionById = (id) => {
  const data = readTransactions();
  return data.transactions.find(transaction => transaction.id === id);
};

// Añadir nueva transacción
const addTransaction = (transaction) => {
  const data = readTransactions();
  const newTransaction = {
    id: data.nextId++,
    ...transaction,
    date: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
  };
  
  data.transactions.push(newTransaction);
  const success = saveTransactions(data);
  return success ? newTransaction : null;
};

// Actualizar transacción
const updateTransaction = (id, updatedTransaction) => {
  const data = readTransactions();
  const index = data.transactions.findIndex(transaction => transaction.id === id);
  
  if (index === -1) return false;
  
  data.transactions[index] = { ...data.transactions[index], ...updatedTransaction };
  return saveTransactions(data);
};

// Eliminar transacción
const deleteTransaction = (id) => {
  const data = readTransactions();
  data.transactions = data.transactions.filter(transaction => transaction.id !== id);
  return saveTransactions(data);
};

// Obtener todas las categorías
const getCategories = () => {
  const data = readTransactions();
  return data.categories;
};

// Obtener balance total
const getBalance = () => {
  const transactions = getAllTransactions();
  let balance = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'ingreso') {
      balance += parseFloat(transaction.amount);
    } else {
      balance -= parseFloat(transaction.amount);
    }
  });
  
  return balance.toFixed(2);
};

// Obtener transacciones por mes
const getTransactionsByMonth = (year, month) => {
  const transactions = getAllTransactions();
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === year && 
           transactionDate.getMonth() === month - 1;
  });
};

// Obtener categoría por ID
const getCategoryById = (id) => {
  const data = readTransactions();
  return data.categories.find(category => category.id === id);
};

// Añadir nueva categoría
const addCategory = (categoryData) => {
  const data = readTransactions();
  const newCategory = {
    id: data.nextId++,
    ...categoryData
  };
  
  data.categories.push(newCategory);
  const success = saveTransactions(data);
  return success ? newCategory : null;
};

// Actualizar categoría
const updateCategory = (id, updatedData) => {
  const data = readTransactions();
  const index = data.categories.findIndex(category => category.id === id);
  
  if (index === -1) return false;
  
  data.categories[index] = { ...data.categories[index], ...updatedData };
  return saveTransactions(data);
};

// Eliminar categoría (solo si no tiene transacciones asociadas)
const deleteCategory = (id) => {
  const data = readTransactions();
  
  // Verificar si hay transacciones usando esta categoría
  const categoryToDelete = data.categories.find(c => c.id === id);
  if (!categoryToDelete) {
    return { success: false, message: 'Categoría no encontrada' };
  }
  
  const transactionsWithCategory = data.transactions.filter(
    transaction => transaction.category === categoryToDelete.name
  );
  
  if (transactionsWithCategory.length > 0) {
    return { success: false, message: 'No se puede eliminar: hay transacciones usando esta categoría' };
  }
  
  data.categories = data.categories.filter(category => category.id !== id);
  const success = saveTransactions(data);
  return { success, message: success ? 'Categoría eliminada' : 'Error al eliminar' };
};

// Verificar si una categoría existe por nombre
const categoryExists = (name) => {
  const data = readTransactions();
  return data.categories.some(category => 
    category.name.toLowerCase() === name.toLowerCase()
  );
};

// Obtener datos para gráficos
const getChartData = () => {
  const transactions = getAllTransactions();
  const categories = getCategories();
  const now = new Date();
  
  // Filtrar transacciones del mes actual
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });
  
  // Datos para gráfico de doughnut (gastos por categoría)
  const expenseData = {};
  const incomeData = {};
  
  currentMonthTransactions.forEach(transaction => {
    if (transaction.type === 'gasto') {
      expenseData[transaction.category] = (expenseData[transaction.category] || 0) + transaction.amount;
    } else if (transaction.type === 'ingreso') {
      incomeData[transaction.category] = (incomeData[transaction.category] || 0) + transaction.amount;
    }
  });
  
  // Preparar datos para el gráfico
  const expenseLabels = Object.keys(expenseData);
  const expenseValues = Object.values(expenseData);
  const incomeLabels = Object.keys(incomeData);
  const incomeValues = Object.values(incomeData);
  
  // Obtener colores para las categorías
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#6c757d';
  };
  
  return {
    expenseLabels,
    expenseValues,
    expenseColors: expenseLabels.map(getCategoryColor),
    incomeLabels,
    incomeValues,
    incomeColors: incomeLabels.map(getCategoryColor),
    currentMonthTransactions
  };
};

// Obtener datos para gráfico de evolución mensual
const getMonthlyTrendData = () => {
  const transactions = getAllTransactions();
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'ingreso') {
      monthlyData[monthYear].income += transaction.amount;
    } else {
      monthlyData[monthYear].expense += transaction.amount;
    }
  });
  
  // Ordenar por fecha
  const sortedMonths = Object.keys(monthlyData).sort();
  
  return {
    labels: sortedMonths,
    incomeData: sortedMonths.map(month => monthlyData[month].income),
    expenseData: sortedMonths.map(month => monthlyData[month].expense)
  };
};

// Exportar transacciones a CSV
const exportToCSV = (transactions = null) => {
  const dataToExport = transactions || getAllTransactions();
  
  if (dataToExport.length === 0) {
    return null;
  }
  
  // Encabezados CSV
  let csv = 'Fecha,Descripción,Categoría,Tipo,Monto\n';
  
  // Datos
  dataToExport.forEach(transaction => {
    csv += `"${transaction.date}","${transaction.description}","${transaction.category}","${transaction.type}","${transaction.amount}"\n`;
  });
  
  return csv;
};

// Exportar transacciones por rango de fechas
const exportByDateRange = (startDate, endDate) => {
  const transactions = getAllTransactions();
  
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Incluir todo el día final
    
    return transactionDate >= start && transactionDate <= end;
  });
  
  return exportToCSV(filteredTransactions);
};

// Filtrar transacciones con múltiples criterios
const filterTransactions = (filters = {}) => {
  let transactions = getAllTransactions();
  
  // Filtrar por categoría
  if (filters.category && filters.category !== 'todas') {
    transactions = transactions.filter(transaction => 
      transaction.category === filters.category
    );
  }
  
  // Filtrar por tipo
  if (filters.type && filters.type !== 'todos') {
    transactions = transactions.filter(transaction => 
      transaction.type === filters.type
    );
  }
  
  // Filtrar por rango de fechas
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    
    transactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }
  
  // Filtrar por descripción (búsqueda)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    transactions = transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filtrar por rango de montos
  if (filters.minAmount) {
    transactions = transactions.filter(transaction =>
      transaction.amount >= parseFloat(filters.minAmount)
    );
  }
  
  if (filters.maxAmount) {
    transactions = transactions.filter(transaction =>
      transaction.amount <= parseFloat(filters.maxAmount)
    );
  }
  
  // Ordenar (nuevo primero por defecto)
  const sortField = filters.sortField || 'date';
  const sortOrder = filters.sortOrder || 'desc';
  
  transactions.sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];
    
    if (sortField === 'date') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  return transactions;
};

// Obtener estadísticas de filtros
const getFilterStats = (transactions) => {
  const total = transactions.length;
  const totalIncome = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  return {
    total,
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    balance: balance.toFixed(2)
  };
};

// Sistema de Presupuestos
const setBudget = (categoryId, amount) => {
  const data = readTransactions();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) return false;
  
  data.categories[categoryIndex].budget = parseFloat(amount);
  return saveTransactions(data);
};

const getCategorySpending = (categoryName, month = null, year = null) => {
  const transactions = getAllTransactions();
  const now = new Date();
  const targetMonth = month !== null ? month : now.getMonth() + 1;
  const targetYear = year !== null ? year : now.getFullYear();
  
  const categoryTransactions = transactions.filter(transaction => {
    if (transaction.category !== categoryName) return false;
    
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() + 1 === targetMonth && 
           transactionDate.getFullYear() === targetYear &&
           transaction.type === 'gasto';
  });
  
  return categoryTransactions.reduce((total, transaction) => total + transaction.amount, 0);
};

const getBudgetStatus = () => {
  const categories = getCategories();
  const now = new Date();
  
  return categories
    .filter(category => category.budget && category.type === 'gasto')
    .map(category => {
      const spent = getCategorySpending(category.name);
      const budget = category.budget;
      const remaining = budget - spent;
      const percentage = (spent / budget) * 100;
      
      let status = 'success';
      if (percentage >= 80) status = 'warning';
      if (percentage >= 100) status = 'danger';
      
      return {
        id: category.id,
        name: category.name,
        budget: budget,
        spent: spent,
        remaining: remaining,
        percentage: percentage,
        status: status,
        color: category.color
      };
    });
};

const getBudgetAlerts = () => {
  const budgetStatus = getBudgetStatus();
  return budgetStatus.filter(item => item.status === 'warning' || item.status === 'danger');
};

// Analytics y métricas avanzadas
const getMonthlySummary = (year = null, month = null) => {
  const transactions = getAllTransactions();
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || now.getMonth() + 1;
  
  const monthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === targetYear && 
           transactionDate.getMonth() + 1 === targetMonth;
  });
  
  const income = monthTransactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = monthTransactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expense;
  
  // Comparación con mes anterior
  let prevMonthIncome = 0;
  let prevMonthExpense = 0;
  let incomeTrend = 'neutral';
  let expenseTrend = 'neutral';
  
  if (targetMonth > 1) {
    const prevMonthData = getMonthlySummary(targetYear, targetMonth - 1);
    prevMonthIncome = prevMonthData.income;
    prevMonthExpense = prevMonthData.expense;
    
    incomeTrend = income > prevMonthIncome ? 'up' : income < prevMonthIncome ? 'down' : 'neutral';
    expenseTrend = expense > prevMonthExpense ? 'up' : expense < prevMonthExpense ? 'down' : 'neutral';
  }
  
  return {
    year: targetYear,
    month: targetMonth,
    income: income,
    expense: expense,
    balance: balance,
    transactionCount: monthTransactions.length,
    incomeTrend: incomeTrend,
    expenseTrend: expenseTrend,
    incomeChange: income - prevMonthIncome,
    expenseChange: expense - prevMonthExpense
  };
};

const getCategoryAnalysis = () => {
  const categories = getCategories();
  const now = new Date();
  
  const analysis = categories.map(category => {
    const spent = getCategorySpending(category.name);
    const budget = category.budget || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    let status = 'within-budget';
    if (percentage >= 80) status = 'near-limit';
    if (percentage >= 100) status = 'over-budget';
    
    // Tendencia mensual
    const currentMonthSpent = getCategorySpending(category.name, now.getMonth() + 1, now.getFullYear());
    const prevMonthSpent = now.getMonth() > 0 ? 
      getCategorySpending(category.name, now.getMonth(), now.getFullYear()) : 0;
    
    const trend = currentMonthSpent > prevMonthSpent ? 'up' : 
                 currentMonthSpent < prevMonthSpent ? 'down' : 'stable';
    
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color,
      spent: spent,
      budget: budget,
      percentage: percentage,
      status: status,
      trend: trend,
      monthlySpent: currentMonthSpent
    };
  });
  
  return analysis;
};

const getFinancialGoals = () => {
  return [
    { id: 1, name: 'Ahorro de emergencia', target: 10000, current: 2500, progress: 25 },
    { id: 2, name: 'Vacaciones', target: 5000, current: 1500, progress: 30 },
    { id: 3, name: 'Inversiones', target: 20000, current: 8000, progress: 40 }
  ];
};

const getUpcomingBills = () => {
  return [
    { id: 1, name: 'Internet', amount: 45, dueDate: '2024-01-15', category: 'Servicios' },
    { id: 2, name: 'Teléfono', amount: 35, dueDate: '2024-01-18', category: 'Servicios' },
    { id: 3, name: 'Netflix', amount: 15, dueDate: '2024-01-20', category: 'Entretenimiento' }
  ].filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return dueDate <= nextWeek;
  });
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  categoryExists,
  getBalance,
  getTransactionsByMonth,
  getChartData,
  getMonthlyTrendData,
  exportToCSV,
  exportByDateRange,
  filterTransactions,
  getFilterStats,
  setBudget,
  getCategorySpending,
  getBudgetStatus,
  getBudgetAlerts,
  getMonthlySummary,
  getCategoryAnalysis,
  getFinancialGoals,
  getUpcomingBills
};