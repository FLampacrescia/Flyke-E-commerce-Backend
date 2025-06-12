const router = require('express').Router();
const storeController = require('../controllers/store.controller');

router.get('/stores', storeController.getStores);
router.post('/stores', storeController.addStore);
router.delete('/stores', storeController.deleteStore);
router.put('/stores/:id', storeController.updateStore);

module.exports = router;