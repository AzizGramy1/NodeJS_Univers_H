const Product = require('../models/Product');

exports.getAll = async (req, res) => {
  try {
    const products = await Product.getAll(req.query);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.getLowStock();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    // Incrémenter les vues (avec gestion d'erreur)
    try {
      await Product.incrementViews(req.params.id);
    } catch (viewError) {
      // Ne pas bloquer la réponse si l'incrémentation échoue
      console.warn('Erreur incrementViews:', viewError.message);
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Erreur getOne product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Générer le slug si non fourni
    if (!req.body.slug && req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Product.remove(req.params.id);
    res.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ajouter une note au produit
exports.addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Note invalide (0-5)' });
    }
    const product = await Product.updateRating(req.params.id, rating);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};