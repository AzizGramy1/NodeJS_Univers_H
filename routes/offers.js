const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middleware/auth');

router.get('/', offerController.getAll);
router.get('/:id', offerController.getOne);
router.post('/', auth, offerController.create);
router.put('/:id', auth, offerController.update);
router.delete('/:id', auth, offerController.delete);

module.exports = router;