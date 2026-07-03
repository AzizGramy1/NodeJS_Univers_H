const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/', eventController.getAll);
router.get('/:id', eventController.getOne);
router.post('/', auth, eventController.create);
router.put('/:id', auth, eventController.update);
router.delete('/:id', auth, eventController.delete);

module.exports = router;