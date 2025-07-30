const router = require('express').Router();
const orderController = require ('../controllers/order.controller');
const { isAuth } = require('../middlewares/isAuth');

router.get('/orders', [ isAuth ], orderController.getOrders)
router.post('/orders', [ isAuth ], orderController.createOrder)
router.get('/orders/:orderCode', [ isAuth ], orderController.getOrderByOrderCode)
router.put('/orders/:orderCode/shippingAddress', [ isAuth ], orderController.updateAddressByOrderCode)


module.exports = router;