const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const auth = require('../middleware/auth');

router.get('/', quoteController.getAll);
router.get('/:id', quoteController.getOne);
router.post('/', auth, quoteController.create);
router.put('/:id', auth, quoteController.update);
router.delete('/:id', auth, quoteController.delete);

module.exports = router;