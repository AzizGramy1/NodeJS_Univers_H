// models/Product.js
const { db, admin } = require('../config/firebase'); // ✅ Ajouter admin ici
const COLLECTION = 'products';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  
  // Calculer la marge si costPrice est fourni
  let margin = null;
  if (data.costPrice && data.price) {
    margin = ((data.price - data.costPrice) / data.price) * 100;
  }
  
  await docRef.set({
    // Informations de base
    name: data.name || '',
    cat: data.cat || 'desinfection',
    subCat: data.subCat || '',
    emoji: data.emoji || '📦',
    badge: data.badge || '',
    
    // Prix et tarification
    price: data.price || 0,
    old: data.old || null,
    costPrice: data.costPrice || null,
    wholesalePrice: data.wholesalePrice || null,
    margin: margin,
    
    // Stock et inventaire
    stock: data.stock || 0,
    threshold: data.threshold || 10,
    reservedStock: data.reservedStock || 0,
    incomingStock: data.incomingStock || 0,
    location: data.location || '',
    batchNumber: data.batchNumber || null,
    expirationDate: data.expirationDate || null,
    
    // Fournisseur
    supplierId: data.supplierId || null,
    supplierIds: data.supplierIds || [],
    supplierPrice: data.supplierPrice || null,
    deliveryDelay: data.deliveryDelay || '48h',
    
    // Caractéristiques techniques
    unit: data.unit || 'unité',
    weight: data.weight || 0,
    volume: data.volume || 0,
    concentration: data.concentration || null,
    ph: data.ph || null,
    certification: data.certification || [],
    
    // Composition
    activeIngredients: data.activeIngredients || '',
    composition: data.composition || '',
    usageType: data.usageType || 'mixte',
    
    // Documentation
    desc: data.desc || '',
    longDesc: data.longDesc || '',
    instructions: data.instructions || '',
    precautions: data.precautions || '',
    safetyDataSheet: data.safetyDataSheet || null,
    
    // Image et médias
    images: data.images || [],
    video: data.video || null,
    gallery: data.gallery || [],
    
    // Statut et visibilité
    active: data.active !== undefined ? data.active : true,
    featured: data.featured || false,
    bestseller: data.bestseller || false,
    newProduct: data.newProduct || false,
    
    // SEO
    slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
    metaTitle: data.metaTitle || null,
    metaDesc: data.metaDesc || null,
    tags: data.tags || [],
    
    // Statistiques
    views: data.views || 0,
    ordersCount: data.ordersCount || 0,
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || 0,
    
    // Dates
    createdAt: now,
    updatedAt: now,
    deletedAt: data.deletedAt || null
  });
  
  return { id: docRef.id, ...data, margin, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  
  // Filtres de base
  if (filters.cat) query = query.where('cat', '==', filters.cat);
  if (filters.subCat) query = query.where('subCat', '==', filters.subCat);
  if (filters.active !== undefined) query = query.where('active', '==', filters.active === 'true');
  if (filters.supplierId) query = query.where('supplierId', '==', filters.supplierId);
  if (filters.featured) query = query.where('featured', '==', filters.featured === 'true');
  if (filters.bestseller) query = query.where('bestseller', '==', filters.bestseller === 'true');
  if (filters.badge) query = query.where('badge', '==', filters.badge);
  if (filters.usageType) query = query.where('usageType', '==', filters.usageType);
  
  // Filtres de stock
  if (filters.lowStock) {
    query = query.where('stock', '<', filters.threshold || 10);
  }
  if (filters.inStock) {
    query = query.where('stock', '>', 0);
  }
  if (filters.outOfStock) {
    query = query.where('stock', '==', 0);
  }
  
  // Filtres de prix
  if (filters.minPrice) {
    query = query.where('price', '>=', parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    query = query.where('price', '<=', parseFloat(filters.maxPrice));
  }
  
  // Recherche textuelle (simplifiée)
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const snapshot = await query.get();
    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes(search) || 
          data.desc?.toLowerCase().includes(search) ||
          data.tags?.some(tag => tag.toLowerCase().includes(search))) {
        products.push({ id: doc.id, ...data });
      }
    });
    return products;
  }
  
  const snapshot = await query.get();
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
};

const getById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const update = async (id, data) => {
  const updateData = { ...data, updatedAt: new Date() };
  
  // Recalculer la marge si price ou costPrice change
  if (data.price || data.costPrice) {
    const existing = await getById(id);
    if (existing) {
      const price = data.price || existing.price;
      const costPrice = data.costPrice || existing.costPrice;
      if (price && costPrice) {
        updateData.margin = ((price - costPrice) / price) * 100;
      }
    }
  }
  
  await db.collection(COLLECTION).doc(id).update(updateData);
  return getById(id);
};

const remove = async (id) => {
  // Soft delete : marquer comme supprimé
  await db.collection(COLLECTION).doc(id).update({
    active: false,
    deletedAt: new Date(),
    updatedAt: new Date()
  });
};

const getLowStock = async () => {
  const snapshot = await db.collection(COLLECTION)
    .where('active', '==', true)
    .get();
  const products = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.stock < data.threshold) {
      products.push({ id: doc.id, ...data });
    }
  });
  return products;
};

// Incrémenter les vues - version avec gestion d'erreur
const incrementViews = async (id) => {
  try {
    const docRef = db.collection(COLLECTION).doc(id);
    await docRef.update({
      views: admin.firestore.FieldValue.increment(1)
    });
    return true;
  } catch (error) {
    console.error('Erreur incrementViews:', error);
    return false;
  }
};

// Mettre à jour la note - version avec gestion d'erreur
const updateRating = async (id, newRating) => {
  try {
    const product = await getById(id);
    if (!product) return null;
    const totalRating = (product.rating || 0) * (product.reviewsCount || 0) + newRating;
    const newCount = (product.reviewsCount || 0) + 1;
    const avgRating = totalRating / newCount;
    await db.collection(COLLECTION).doc(id).update({
      rating: avgRating,
      reviewsCount: newCount,
      updatedAt: new Date()
    });
    return getById(id);
  } catch (error) {
    console.error('Erreur updateRating:', error);
    return null;
  }
};

module.exports = { 
  create, 
  getAll, 
  getById, 
  update, 
  remove, 
  getLowStock,
  incrementViews,
  updateRating
};