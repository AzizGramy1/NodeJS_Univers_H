const Supplier = require('../models/Supplier');

exports.getAll = async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const supplier = await Supplier.update(req.params.id, req.body);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé' });
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Supplier.remove(req.params.id);
    res.json({ success: true, message: 'Fournisseur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};