const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { admin } = require('./config/firebase');
const errorHandler = require('./middleware/errorHandler');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://univers-hygiene.web.app', 'https://univers-hygiene.firebaseapp.com']
    : '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes'));

// Route de santé (pour vérifier que le serveur tourne)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des erreurs (doit être après les routes)
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Environnement: ${process.env.NODE_ENV || 'development'}`);
});