const Quote = require('../models/Quote');

exports.getAll = async (req, res) => {
  try {
    const quotes = await Quote.getAll(req.query);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const quote = await Quote.getById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Devis non trouvé' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const quote = await Quote.create(req.body);
    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const quote = await Quote.update(req.params.id, req.body);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Devis non trouvé' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Quote.remove(req.params.id);
    res.json({ success: true, message: 'Devis supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};