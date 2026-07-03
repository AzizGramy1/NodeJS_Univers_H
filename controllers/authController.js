const { admin } = require('../config/firebase');
const User = require('../models/User');

// POST /api/auth/verify - Vérifie un token ID Firebase et crée/retourne l'utilisateur
exports.verifyToken = async (req, res) => {
  try {
    const token = req.body.token || req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    let user = await User.getByEmail(decoded.email);

    if (!user) {
      // Créer l'utilisateur s'il n'existe pas
      const newUser = await User.create({
        name: decoded.name || decoded.email,
        email: decoded.email,
        role: 'viewer',
        active: true
      });
      await User.updateLastLogin(newUser.id);
      return res.json({ success: true, data: newUser });
    }

    await User.updateLastLogin(user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide: ' + error.message });
  }
};

// GET /api/auth/me - Récupère l'utilisateur courant (protégé)
exports.getMe = async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};