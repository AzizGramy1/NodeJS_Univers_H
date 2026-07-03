// middleware/auth.js
const { admin } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
      role: decodedToken.role || 'viewer'
    };
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

auth.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès refusé, droits admin requis' });
  }
  next();
};

module.exports = auth;