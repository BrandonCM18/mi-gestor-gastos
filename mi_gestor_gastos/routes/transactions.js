const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getBalance,
  getTransactionsByMonth,
  exportToCSV,
  exportByDateRange,
  filterTransactions,
  getFilterStats
} = require('../data/database');

// Listar todas las transacciones
router.get('/', (req, res) => {
  const transactions = getAllTransactions();
  const categories = getCategories();
  const balance = getBalance();
  const stats = getFilterStats(transactions); // ← AÑADIDO stats aquí también
  
  res.render('transactions', {
    title: 'Todas las Transacciones',
    transactions,
    categories,
    balance,
    stats: stats, // ← AÑADIDO
    filters: {}, // ← AÑADIDO
    error: null
  });
});

// Mostrar formulario para nueva transacción
router.get('/new', (req, res) => {
  const categories = getCategories();
  res.render('new-transaction', {
    title: 'Nueva Transacción',
    categories,
    error: null,
    transaction: null
  });
});

// Procesar nueva transacción
router.post('/', (req, res) => {
  const { description, amount, type, category } = req.body;
  
  if (!description || !amount || !type || !category) {
    const categories = getCategories();
    return res.render('new-transaction', {
      title: 'Nueva Transacción',
      categories,
      error: 'Todos los campos son obligatorios',
      transaction: { description, amount, type, category }
    });
  }
  
  const newTransaction = {
    description,
    amount: parseFloat(amount),
    type,
    category
  };
  
  const result = addTransaction(newTransaction);
  
  if (result) {
    res.redirect('/transactions');
  } else {
    const categories = getCategories();
    res.render('new-transaction', {
      title: 'Nueva Transacción',
      categories,
      error: 'Error al crear la transacción',
      transaction: { description, amount, type, category }
    });
  }
});

// Mostrar formulario de edición
router.get('/:id/edit', (req, res) => {
  const transaction = getTransactionById(parseInt(req.params.id));
  const categories = getCategories();
  
  if (!transaction) {
    return res.status(404).render('error', {
      title: 'Error',
      message: 'Transacción no encontrada'
    });
  }
  
  res.render('edit-transaction', {
    title: 'Editar Transacción',
    transaction,
    categories,
    error: null
  });
});

// Actualizar transacción
router.put('/:id', (req, res) => {
  const { description, amount, type, category } = req.body;
  const transactionId = parseInt(req.params.id);
  
  if (!description || !amount || !type || !category) {
    const transaction = getTransactionById(transactionId);
    const categories = getCategories();
    return res.render('edit-transaction', {
      title: 'Editar Transacción',
      transaction: { ...transaction, description, amount, type, category },
      categories,
      error: 'Todos los campos son obligatorios'
    });
  }
  
  const updatedTransaction = {
    description,
    amount: parseFloat(amount),
    type,
    category
  };
  
  const success = updateTransaction(transactionId, updatedTransaction);
  
  if (success) {
    res.redirect('/transactions');
  } else {
    const transaction = getTransactionById(transactionId);
    const categories = getCategories();
    res.render('edit-transaction', {
      title: 'Editar Transacción',
      transaction: { ...transaction, description, amount, type, category },
      categories,
      error: 'Error al actualizar la transacción'
    });
  }
});

// Eliminar transacción
router.delete('/:id', (req, res) => {
  const success = deleteTransaction(parseInt(req.params.id));
  
  if (success) {
    res.redirect('/transactions');
  } else {
    const transactions = getAllTransactions();
    const categories = getCategories();
    const balance = getBalance();
    const stats = getFilterStats(transactions); // ← AÑADIDO
    
    res.render('transactions', {
      title: 'Todas las Transacciones',
      transactions,
      categories,
      balance,
      stats: stats, // ← AÑADIDO
      filters: {}, // ← AÑADIDO
      error: 'Error al eliminar la transacción'
    });
  }
});

// Exportar todas las transacciones a CSV
router.get('/export/all', (req, res) => {
  const csvData = exportToCSV();
  
  if (!csvData) {
    return res.status(404).render('error', {
      title: 'Error',
      message: 'No hay transacciones para exportar'
    });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transacciones-completas.csv');
  res.send(csvData);
});

// Mostrar formulario para exportar por fechas
router.get('/export', (req, res) => {
  res.render('export', {
    title: 'Exportar Transacciones',
    error: null
  });
});

// Exportar transacciones por rango de fechas
router.post('/export/range', (req, res) => {
  const { startDate, endDate } = req.body;
  
  if (!startDate || !endDate) {
    return res.render('export', {
      title: 'Exportar Transacciones',
      error: 'Ambas fechas son requeridas'
    });
  }
  
  const csvData = exportByDateRange(startDate, endDate);
  
  if (!csvData) {
    return res.render('export', {
      title: 'Exportar Transacciones',
      error: 'No hay transacciones en el rango de fechas seleccionado'
    });
  }
  
  const fileName = `transacciones-${startDate}-a-${endDate}.csv`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(csvData);
});

// Exportar transacciones filtradas
router.get('/export/filtered', (req, res) => {
  const filters = req.query;
  const filteredTransactions = filterTransactions(filters);
  const csvData = exportToCSV(filteredTransactions);
  
  if (!csvData) {
    return res.status(404).render('error', {
      title: 'Error',
      message: 'No hay transacciones para exportar'
    });
  }
  
  const fileName = 'transacciones-filtradas.csv';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.send(csvData);
});

// Filtrar transacciones
router.get('/filter', (req, res) => {
  const filters = req.query;
  const filteredTransactions = filterTransactions(filters);
  const categories = getCategories();
  const stats = getFilterStats(filteredTransactions);
  
  res.render('transactions', {
    title: 'Transacciones Filtradas',
    transactions: filteredTransactions,
    categories,
    balance: stats.balance,
    filters: filters,
    stats: stats,
    error: null
  });
});

// Limpiar filtros
router.get('/clear-filters', (req, res) => {
  res.redirect('/transactions');
});

module.exports = router;