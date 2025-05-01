const router = require('express').Router();
const categoryController = require('../controllers/category.controller');

// Obtener categoría
router.get('/categories', categoryController.getCategories);

// Crear categorías
router.post('/categories', categoryController.createCategory);

module.exports = router;