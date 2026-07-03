const Order = require('../models/Order');
const Client = require('../models/Client');

exports.getAll = async (req, res) => {
  try {
    const orders = await Order.getAll(req.query);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Récupérer les infos du client
    if (req.body.clientId) {
      const client = await Client.getById(req.body.clientId);
      if (client) {
        req.body.clientName = client.name;
        req.body.clientEmail = client.email;
        req.body.clientPhone = client.phone;
      }
    }
    
    const order = await Order.create(req.body);
    
    // Mettre à jour les statistiques du client
    if (req.body.clientId) {
      await Client.updateStats(req.body.clientId, order.total);
    }
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const order = await Order.update(req.params.id, req.body);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const userId = req.user?.id || null;
    
    const validStatus = ['attente', 'confirmee', 'expediee', 'livree', 'annulee'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    
    const order = await Order.updateStatus(req.params.id, status, note, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Order.remove(req.params.id);
    res.json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};