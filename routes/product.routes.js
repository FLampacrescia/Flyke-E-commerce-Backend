const router = require("express").Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/uploadFile');
const { isAuth, isAdmin } = require("../middlewares/isAuth");

// Ruta para obtener todos los productos
router.get('/products', productController.getProducts);

// Ruta para obtener un producto por ID
router.get('/products/:id', productController.getProductById);

// Ruta para crear un nuevo producto
router.post('/products', [ isAuth, isAdmin ], [upload], productController.createProduct);

// Ruta para eliminar un producto por ID
router.delete('/products/:id', [ isAuth, isAdmin ], productController.deleteProductById);

// Ruta para actualizar un producto por ID
router.put('/products/:id', [ isAuth, isAdmin ], [upload], productController.updateProductById);

// Ruta para actualizar la descripción de un producto por ID
router.patch('/products/:id', [ isAuth, isAdmin ], productController.updateProductById);

// Ruta para obtener wishlist del usuario
router.get('/wishlist', isAuth, productController.getUserWishlist);

// Ruta para agregar producto a la wishlist
router.post('/wishlist/:productId', isAuth, productController.addToWishlist);

// Ruta para eliminar producto de la wishlist
router.delete('/wishlist/:productId', isAuth, productController.removeFromWishlist);

module.exports = router