const Offer = require('../models/Offer');

// GET /api/offers - Récupère toutes les offres (avec filtres)
exports.getAll = async (req, res) => {
  try {
    const offers = await Offer.getAll(req.query);
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Erreur getAll offers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/offers/:id - Récupère une offre par ID
exports.getOne = async (req, res) => {
  try {
    const offer = await Offer.getById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offre non trouvée' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    console.error('Erreur getOne offer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/offers - Crée une offre
exports.create = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    console.error('Erreur create offer:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/offers/:id - Met à jour une offre
exports.update = async (req, res) => {
  try {
    const offer = await Offer.update(req.params.id, req.body);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offre non trouvée' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    console.error('Erreur update offer:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/offers/:id - Supprime une offre
exports.delete = async (req, res) => {
  try {
    await Offer.remove(req.params.id);
    res.json({ success: true, message: 'Offre supprimée avec succès' });
  } catch (error) {
    console.error('Erreur delete offer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};