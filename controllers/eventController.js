// controllers/eventController.js
const Event = require('../models/Event');

// GET /api/events - Récupère tous les événements (avec filtres)
exports.getAll = async (req, res) => {
  try {
    const { status, clientId, startDate, endDate } = req.query;
    const filters = {};
    
    // Appliquer les filtres correctement
    if (status) filters.status = status;
    if (clientId) filters.clientId = clientId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const events = await Event.getAll(filters);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Erreur getAll events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/events/:id - Récupère un événement par ID
exports.getOne = async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur getOne event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events - Crée un événement
exports.create = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur create event:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/events/:id - Met à jour un événement
exports.update = async (req, res) => {
  try {
    const event = await Event.update(req.params.id, req.body);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur update event:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/events/:id - Supprime un événement
exports.delete = async (req, res) => {
  try {
    await Event.remove(req.params.id);
    res.json({ success: true, message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur delete event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};