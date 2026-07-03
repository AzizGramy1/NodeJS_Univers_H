const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

router.get('/', clientController.getAll);
router.get('/:id', clientController.getOne);
router.post('/', auth, clientController.create);
router.put('/:id', auth, clientController.update);
router.delete('/:id', auth, clientController.delete);

module.exports = router;