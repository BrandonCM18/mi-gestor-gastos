const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  categoryExists,
  setBudget,
  getBudgetStatus,
  getBudgetAlerts,
  getCategorySpending
} = require('../data/database');

// Listar todas las categorías
router.get('/', (req, res) => {
  const categories = getCategories();
  res.render('categories', {
    title: 'Gestión de Categorías',
    categories,
    error: null
  });
});

// Mostrar formulario para nueva categoría
router.get('/new', (req, res) => {
  res.render('new-category', {
    title: 'Nueva Categoría',
    error: null,
    category: null
  });
});

// Procesar nueva categoría
router.post('/', (req, res) => {
  const { name, type, color } = req.body;
  
  if (!name || !type) {
    return res.render('new-category', {
      title: 'Nueva Categoría',
      error: 'Nombre y tipo son obligatorios',
      category: { name, type, color }
    });
  }
  
  // Verificar si la categoría ya existe
  if (categoryExists(name)) {
    return res.render('new-category', {
      title: 'Nueva Categoría',
      error: 'Ya existe una categoría con este nombre',
      category: { name, type, color }
    });
  }
  
  const newCategory = {
    name: name.trim(),
    type,
    color: color || '#6c757d'
  };
  
  const result = addCategory(newCategory);
  
  if (result) {
    res.redirect('/categories');
  } else {
    res.render('new-category', {
      title: 'Nueva Categoría',
      error: 'Error al crear la categoría',
      category: { name, type, color }
    });
  }
});

// Mostrar formulario de edición
router.get('/:id/edit', (req, res) => {
  const category = getCategoryById(parseInt(req.params.id));
  
  if (!category) {
    return res.status(404).render('error', {
      title: 'Error',
      message: 'Categoría no encontrada'
    });
  }
  
  res.render('edit-category', {
    title: 'Editar Categoría',
    category,
    error: null
  });
});

// Actualizar categoría
router.put('/:id', (req, res) => {
  const { name, type, color } = req.body;
  const categoryId = parseInt(req.params.id);
  
  if (!name || !type) {
    const category = getCategoryById(categoryId);
    return res.render('edit-category', {
      title: 'Editar Categoría',
      error: 'Nombre y tipo son obligatorios',
      category: { ...category, name, type, color }
    });
  }
  
  // Verificar si el nombre ya existe (excluyendo la categoría actual)
  const existingCategory = getCategories().find(c => 
    c.name.toLowerCase() === name.toLowerCase() && c.id !== categoryId
  );
  
  if (existingCategory) {
    const category = getCategoryById(categoryId);
    return res.render('edit-category', {
      title: 'Editar Categoría',
      error: 'Ya existe otra categoría con este nombre',
      category: { ...category, name, type, color }
    });
  }
  
  const updatedData = {
    name: name.trim(),
    type,
    color: color || '#6c757d'
  };
  
  const success = updateCategory(categoryId, updatedData);
  
  if (success) {
    res.redirect('/categories');
  } else {
    const category = getCategoryById(categoryId);
    res.render('edit-category', {
      title: 'Editar Categoría',
      error: 'Error al actualizar la categoría',
      category: { ...category, name, type, color }
    });
  }
});

// Eliminar categoría
router.delete('/:id', (req, res) => {
  const result = deleteCategory(parseInt(req.params.id));
  
  if (result.success) {
    res.redirect('/categories');
  } else {
    const categories = getCategories();
    res.render('categories', {
      title: 'Gestión de Categorías',
      categories,
      error: result.message
    });
  }
});

// Actualizar presupuesto de categoría
router.post('/:id/budget', (req, res) => {
  const { budget } = req.body;
  const categoryId = parseInt(req.params.id);
  
  if (!budget || isNaN(parseFloat(budget))) {
    return res.status(400).json({ success: false, message: 'Presupuesto inválido' });
  }
  
  const success = setBudget(categoryId, parseFloat(budget));
  
  if (success) {
    res.json({ success: true, message: 'Presupuesto actualizado' });
  } else {
    res.status(500).json({ success: false, message: 'Error al actualizar presupuesto' });
  }
});

// Obtener estado de presupuestos (API)
router.get('/budgets/status', (req, res) => {
  const budgetStatus = getBudgetStatus();
  res.json(budgetStatus);
});

// Obtener alertas de presupuestos (API)
router.get('/budgets/alerts', (req, res) => {
  const alerts = getBudgetAlerts();
  res.json(alerts);
});

// Página de gestión de presupuestos
router.get('/budgets/manage', (req, res) => {
  const categories = getCategories();
  const budgetAlerts = getBudgetAlerts();
  
  res.render('budgets', {
    title: 'Gestión de Presupuestos',
    categories,
    getCategorySpending,
    budgetAlerts: budgetAlerts  // ← ESTA ES LA CORRECCIÓN PRINCIPAL
  });
});

module.exports = router;