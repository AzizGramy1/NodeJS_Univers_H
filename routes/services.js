const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getOne);
router.post('/', auth, serviceController.create);
router.put('/:id', auth, serviceController.update);
router.delete('/:id', auth, serviceController.delete);

module.exports = router;