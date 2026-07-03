const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.get('/', orderController.getAll);
router.get('/:id', orderController.getOne);
router.post('/', auth, orderController.create);
router.put('/:id', auth, orderController.update);
router.put('/:id/status', auth, orderController.updateStatus);
router.delete('/:id', auth, orderController.delete);

module.exports = router;