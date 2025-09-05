// Configuración de entorno
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Importar rutas
const transactionsRoutes = require('./routes/transactions');
const categoriesRoutes = require('./routes/categories');

// Importar funciones de base de datos UNA SOLA VEZ
const {
  getChartData,
  getMonthlyTrendData,
  getBalance,
  getCategories,
  getMonthlySummary,
  getCategoryAnalysis,
  getFinancialGoals,
  getUpcomingBills,
  getBudgetAlerts
} = require('./data/database');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de seguridad para producción
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Confía en el proxy de Railway
  console.log('🚀 Modo producción activado');
}

// Configuración de express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Configuración de middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para pasar alertas de presupuesto a todas las vistas
app.use((req, res, next) => {
  res.locals.budgetAlerts = getBudgetAlerts();
  next();
});

// Usar rutas
app.use('/transactions', transactionsRoutes);
app.use('/categories', categoriesRoutes);

// Ruta principal - Dashboard
app.get('/', (req, res) => {
  try {
    const chartData = getChartData();
    const trendData = getMonthlyTrendData();
    const balance = getBalance();
    const categories = getCategories();
    const monthlySummary = getMonthlySummary();
    const categoryAnalysis = getCategoryAnalysis();
    const financialGoals = getFinancialGoals();
    const upcomingBills = getUpcomingBills();
    const budgetAlerts = getBudgetAlerts();
    
    res.render('index', { 
      title: 'Dashboard - Gestor de Gastos Personales',
      transactions: chartData.currentMonthTransactions,
      balance,
      categories,
      chartData,
      trendData,
      monthlySummary,
      categoryAnalysis,
      financialGoals,
      upcomingBills,
      budgetAlerts
    });
  } catch (error) {
    console.error('Error en ruta principal:', error);
    // Página de error amigable
    res.status(500).render('error', {
      title: 'Error',
      message: 'Ocurrió un error al cargar el dashboard. Por favor, intenta nuevamente.'
    });
  }
});

// Ruta de salud para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página No Encontrada',
    message: 'La página que buscas no existe.'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).render('error', {
    title: 'Error del Servidor',
    message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${port}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Iniciado: ${new Date().toLocaleString()}`);
});

// Manejo graceful de shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Apagando servidor gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal de terminación...');
  process.exit(0);
});// Último intento deploy: viernes,  5 de septiembre de 2025, 15:22:24 CST
