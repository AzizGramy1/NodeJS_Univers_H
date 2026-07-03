const { db } = require('../config/firebase');
const COLLECTION = 'clients';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  
  await docRef.set({
    // Informations de base
    name: data.name || '',
    phone: data.phone || '',
    phone2: data.phone2 || null,
    email: data.email || '',
    
    // Localisation
    city: data.city || '',
    address: data.address || '',
    zipCode: data.zipCode || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    landmark: data.landmark || null,
    
    // Type et secteur
    type: data.type || 'b2c',
    sector: data.sector || '',
    companyName: data.companyName || null,
    siret: data.siret || null,
    taxId: data.taxId || null,
    
    // Contacts
    contactName: data.contactName || null,
    contactTitle: data.contactTitle || null,
    contactPhone: data.contactPhone || null,
    contactEmail: data.contactEmail || null,
    
    // Informations commerciales
    segment: data.segment || 'standard',
    region: data.region || '',
    postalCode: data.postalCode || '',
    country: data.country || 'Tunisie',
    
    // Historique (seront mis à jour automatiquement)
    firstOrderDate: data.firstOrderDate || null,
    totalOrders: data.totalOrders || 0,
    totalSpent: data.totalSpent || 0,
    averageOrder: data.averageOrder || 0,
    lastOrderDate: data.lastOrderDate || null,
    totalProjects: data.totalProjects || 0,
    
    // Notation
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || 0,
    complaintCount: data.complaintCount || 0,
    
    // Statut
    vip: data.vip || false,
    active: data.active !== undefined ? data.active : true,
    verified: data.verified || false,
    suspended: data.suspended || false,
    blacklisted: data.blacklisted || false,
    
    // Préférences
    preferences: {
      contactMethod: data.preferences?.contactMethod || 'email',
      language: data.preferences?.language || 'fr',
      timezone: data.preferences?.timezone || 'Africa/Tunis',
      notifyNewOffers: data.preferences?.notifyNewOffers !== undefined ? data.preferences.notifyNewOffers : true,
      notifyOrderStatus: data.preferences?.notifyOrderStatus !== undefined ? data.preferences.notifyOrderStatus : true,
      notifyPromotions: data.preferences?.notifyPromotions !== undefined ? data.preferences.notifyPromotions : false
    },
    
    // Notes
    notes: data.notes || '',
    notesPrivate: data.notesPrivate || '',
    specialRequirements: data.specialRequirements || '',
    
    // Dates importantes
    birthDate: data.birthDate || null,
    companyFounded: data.companyFounded || null,
    contractEnd: data.contractEnd || null,
    
    // Abonnement
    subscriptionType: data.subscriptionType || null,
    subscriptionStart: data.subscriptionStart || null,
    subscriptionEnd: data.subscriptionEnd || null,
    
    // Marketing
    source: data.source || '',
    campaign: data.campaign || null,
    referrer: data.referrer || null,
    
    // Dates
    createdAt: now,
    updatedAt: now,
    deletedAt: data.deletedAt || null
  });
  
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  
  if (filters.type) query = query.where('type', '==', filters.type);
  if (filters.sector) query = query.where('sector', '==', filters.sector);
  if (filters.active !== undefined) query = query.where('active', '==', filters.active === 'true');
  if (filters.vip) query = query.where('vip', '==', filters.vip === 'true');
  if (filters.segment) query = query.where('segment', '==', filters.segment);
  if (filters.city) query = query.where('city', '==', filters.city);
  if (filters.region) query = query.where('region', '==', filters.region);
  
  // Recherche textuelle
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const snapshot = await query.get();
    const clients = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes(search) || 
          data.email?.toLowerCase().includes(search) || 
          data.phone?.includes(search) ||
          data.companyName?.toLowerCase().includes(search)) {
        clients.push({ id: doc.id, ...data });
      }
    });
    return clients;
  }
  
  const snapshot = await query.get();
  const clients = [];
  snapshot.forEach(doc => {
    clients.push({ id: doc.id, ...doc.data() });
  });
  return clients;
};

const getById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const update = async (id, data) => {
  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: new Date()
  });
  return getById(id);
};

const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).update({
    active: false,
    suspended: true,
    deletedAt: new Date(),
    updatedAt: new Date()
  });
};

// Mettre à jour les statistiques client
const updateStats = async (id, orderTotal) => {
  const client = await getById(id);
  if (!client) return null;
  
  const now = new Date();
  const totalOrders = (client.totalOrders || 0) + 1;
  const totalSpent = (client.totalSpent || 0) + orderTotal;
  const averageOrder = totalSpent / totalOrders;
  
  // Vérifier si c'est la première commande
  const firstOrderDate = client.firstOrderDate || now;
  
  await db.collection(COLLECTION).doc(id).update({
    totalOrders,
    totalSpent,
    averageOrder,
    lastOrderDate: now,
    firstOrderDate,
    updatedAt: now
  });
  
  // Définir automatiquement le statut VIP si totalSpent > 5000 DT
  if (totalSpent > 5000 && !client.vip) {
    await db.collection(COLLECTION).doc(id).update({ vip: true });
  }
  
  return getById(id);
};

module.exports = { create, getAll, getById, update, remove, updateStats };