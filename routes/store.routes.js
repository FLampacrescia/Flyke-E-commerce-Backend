const router = require('express').Router();
const storeController = require('../controllers/store.controller');

router.get('/stores', storeController.getStores);
router.post('/stores', [ isAuth, isAdmin ],storeController.addStore);
router.delete('/stores/:id', [ isAuth, isAdmin ],storeController.deleteStoreById);
router.put('/stores/:id', [ isAuth, isAdmin ], storeController.updateStoreById);

module.exports = router;