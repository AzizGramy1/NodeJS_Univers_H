const express = require('express');
const router = express.Router();

// Route de test pour vérifier que le routage fonctionne
router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Plus tard, nous ajouterons :
// router.use('/products', require('./products'));
// router.use('/services', require('./services'));
// etc.

module.exports = router;