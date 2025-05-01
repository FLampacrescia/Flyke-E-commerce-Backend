const router = require("express").Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/uploadFile');

// Ruta para obtener todos los productos
router.get('/products', productController.getProducts);

// Ruta para obtener un producto por ID
router.get('/products/:id', productController.getProductById);

// Ruta para crear un nuevo producto
router.post('/products', [upload], productController.createProduct);

// Ruta para eliminar un producto por ID
router.delete('/products/:id', productController.deleteProductById);

// Ruta para actualizar un producto por ID
router.put('/products/:id', [upload], productController.updateProductById);

module.exports = router