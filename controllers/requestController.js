// controllers/requestController.js
const ServiceRequest = require('../models/ServiceRequest');

// GET /api/requests - Récupère toutes les demandes (avec filtres)
exports.getAll = async (req, res) => {
  try {
    const { status, priority, clientId } = req.query;
    const filters = {};
    
    // Appliquer les filtres correctement
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (clientId) filters.clientId = clientId;
    
    const requests = await ServiceRequest.getAll(filters);
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Erreur getAll requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/requests/:id - Récupère une demande par ID
exports.getOne = async (req, res) => {
  try {
    const request = await ServiceRequest.getById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Erreur getOne request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/requests - Crée une demande
exports.create = async (req, res) => {
  try {
    const request = await ServiceRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Erreur create request:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/requests/:id - Met à jour une demande
exports.update = async (req, res) => {
  try {
    const request = await ServiceRequest.update(req.params.id, req.body);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Erreur update request:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/requests/:id - Supprime une demande
exports.delete = async (req, res) => {
  try {
    await ServiceRequest.remove(req.params.id);
    res.json({ success: true, message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};