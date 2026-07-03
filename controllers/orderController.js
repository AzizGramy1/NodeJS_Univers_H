// controllers/orderController.js
const Order = require('../models/Order');

// GET /api/orders - Récupère toutes les commandes
exports.getAll = async (req, res) => {
  try {
    const orders = await Order.getAll(req.query);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Erreur getAll orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id - Récupère une commande par ID
exports.getOne = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur getOne order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/orders - Crée une commande
exports.create = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur create order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id - Met à jour une commande
exports.update = async (req, res) => {
  try {
    const order = await Order.update(req.params.id, req.body);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur update order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/status - Change le statut
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ['attente', 'confirmee', 'expediee', 'livree', 'annulee'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    const order = await Order.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Erreur updateStatus order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/orders/:id - Supprime une commande
exports.delete = async (req, res) => {
  try {
    await Order.remove(req.params.id);
    res.json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};