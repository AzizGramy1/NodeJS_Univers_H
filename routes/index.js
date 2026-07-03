const express = require('express');
const router = express.Router();

// Importer toutes les routes
const productRoutes = require('./products');
const serviceRoutes = require('./services');
const clientRoutes = require('./clients');
const supplierRoutes = require('./suppliers');
const orderRoutes = require('./orders');
const offerRoutes = require('./offers');
const requestRoutes = require('./requests');
const quoteRoutes = require('./quotes');
const eventRoutes = require('./events');
const authRoutes = require('./auth');

// Utiliser les routes
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/clients', clientRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/orders', orderRoutes);
router.use('/offers', offerRoutes);
router.use('/requests', requestRoutes);
router.use('/quotes', quoteRoutes);
router.use('/events', eventRoutes);
router.use('/auth', authRoutes);

// Route de test
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong', 
    timestamp: new Date().toISOString(),
    status: 'API Univers Hygiène opérationnelle'
  });
});

module.exports = router;