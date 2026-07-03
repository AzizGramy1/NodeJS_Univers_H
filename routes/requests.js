const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.get('/', requestController.getAll);
router.get('/:id', requestController.getOne);
router.post('/', auth, requestController.create);
router.put('/:id', auth, requestController.update);
router.delete('/:id', auth, requestController.delete);

module.exports = router;