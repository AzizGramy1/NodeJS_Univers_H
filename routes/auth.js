const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Vérifier un token Firebase (sans auth car c'est public)
router.post('/verify', authController.verifyToken);

// Récupérer l'utilisateur courant (nécessite d'être authentifié)
router.get('/me', auth, authController.getMe);

module.exports = router;