const router = require('express').Router();
const mercadoPagoController = require ('../controllers/mercadoPago.controller');

// Ruta para crear una preferencia y devolver el preferenceId
router.post('/preference', mercadoPagoController.CreatePreferenceId);

// Ruta para procesar un pago con los datos del Payment Brick
router.post('/process-payment', mercadoPagoController.createPayment);

module.exports = router;