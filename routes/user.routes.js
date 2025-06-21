const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { isAuth, isAdmin, canEditUser } = require("../middlewares/isAuth");

// Ruta para obtener todos los usuarios
router.get("/users", userController.getUsers);

// Ruta para obtener un usuario por ID
router.get("/users/:id", userController.getUserById);

// Ruta pública para registrarse como usuario
router.post("/register", userController.createUser);

// Ruta para crear un nuevo usuario desde el panel de administración
router.post("/users", [ isAdmin ], userController.createUser);

// Ruta para eliminar un usuario por ID (admin o dueño)
router.delete("/users/:id", [isAuth, canEditUser], userController.deleteUserById);

// Ruta para actualizar/editar un usuario por ID (admin o dueño)
router.put("/users/:id", [isAuth, canEditUser], userController.updateUserById);

// Ruta para agregar una dirección
router.post("/users/:userId/addresses", [ isAuth ], userController.addAddress);

// Ruta para eliminar una dirección
router.put("/users/:userId/addresses/:addressId", [ isAuth ], userController.updateAddressById);

// Ruta para eliminar una dirección
router.delete("/users/:userId/addresses/:addressId", [ isAuth ], userController.deleteAddress);

// Ruta para establecer una dirección como principal o "default"
router.put("/users/:userId/addresses/:addressId/set-default", [ isAuth ], userController.setDefaultAddress);

// Ruta para realizar login de un usuario
router.post("/login", userController.loginUser)

// Ruta para modificar la contraseña de un usuario

module.exports = router