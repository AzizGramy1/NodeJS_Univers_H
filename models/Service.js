const { db } = require('../config/firebase');
const COLLECTION = 'services';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  
  await docRef.set({
    // Informations de base
    name: data.name || '',
    type: data.type || 'b2b',
    subType: data.subType || '',
    category: data.category || '',
    emoji: data.emoji || '🧹',
    badge: data.badge || '',
    
    // Tarification
    price: data.price || 0,
    hourlyRate: data.hourlyRate || null,
    pricePerM2: data.pricePerM2 || null,
    pricePerVisit: data.pricePerVisit || null,
    travelCost: data.travelCost || null,
    minPrice: data.minPrice || null,
    maxPrice: data.maxPrice || null,
    discountRate: data.discountRate || null,
    
    // Durée et planning
    duration: data.duration || '1h',
    durationMinutes: data.durationMinutes || 60,
    minDuration: data.minDuration || null,
    maxDuration: data.maxDuration || null,
    serviceTime: data.serviceTime || '09:00-17:00',
    
    // Équipement et personnel
    staffNeeded: data.staffNeeded || 1,
    equipmentList: data.equipmentList || [],
    productsUsed: data.productsUsed || [],
    vehicleRequired: data.vehicleRequired || false,
    specialTools: data.specialTools || false,
    
    // Zone de service
    coverageArea: data.coverageArea || [],
    maxDistance: data.maxDistance || null,
    remoteService: data.remoteService || false,
    
    // Conditions
    minArea: data.minArea || null,
    maxArea: data.maxArea || null,
    minRooms: data.minRooms || null,
    requirements: data.requirements || '',
    
    // Documentation
    desc: data.desc || '',
    longDesc: data.longDesc || '',
    benefits: data.benefits || [],
    processSteps: data.processSteps || [],
    includes: data.includes || [],
    notIncludes: data.notIncludes || [],
    terms: data.terms || '',
    
    // Certifications
    certifications: data.certifications || [],
    insurance: data.insurance || '',
    guarantee: data.guarantee || '',
    
    // Image et médias
    images: data.images || [],
    video: data.video || null,
    
    // Statut
    active: data.active !== undefined ? data.active : true,
    availableForBooking: data.availableForBooking !== undefined ? data.availableForBooking : true,
    emergencyService: data.emergencyService || false,
    onDemand: data.onDemand || false,
    
    // SEO
    slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
    metaTitle: data.metaTitle || null,
    metaDesc: data.metaDesc || null,
    tags: data.tags || [],
    
    // Statistiques
    ordersCount: data.ordersCount || 0,
    rating: data.rating || 0,
    reviewsCount: data.reviewsCount || 0,
    completionRate: data.completionRate || 0,
    
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
  if (filters.subType) query = query.where('subType', '==', filters.subType);
  if (filters.active !== undefined) query = query.where('active', '==', filters.active === 'true');
  if (filters.category) query = query.where('category', '==', filters.category);
  if (filters.availableForBooking) query = query.where('availableForBooking', '==', filters.availableForBooking === 'true');
  if (filters.emergencyService) query = query.where('emergencyService', '==', filters.emergencyService === 'true');
  
  // Filtres de prix
  if (filters.minPrice) {
    query = query.where('price', '>=', parseFloat(filters.minPrice));
  }
  if (filters.maxPrice) {
    query = query.where('price', '<=', parseFloat(filters.maxPrice));
  }
  
  // Recherche textuelle
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const snapshot = await query.get();
    const services = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes(search) || 
          data.desc?.toLowerCase().includes(search) ||
          data.tags?.some(tag => tag.toLowerCase().includes(search))) {
        services.push({ id: doc.id, ...data });
      }
    });
    return services;
  }
  
  const snapshot = await query.get();
  const services = [];
  snapshot.forEach(doc => {
    services.push({ id: doc.id, ...doc.data() });
  });
  return services;
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
    deletedAt: new Date(),
    updatedAt: new Date()
  });
};

// Mettre à jour la note
const updateRating = async (id, newRating) => {
  const service = await getById(id);
  if (!service) return null;
  const totalRating = service.rating * service.reviewsCount + newRating;
  const newCount = service.reviewsCount + 1;
  const avgRating = totalRating / newCount;
  await db.collection(COLLECTION).doc(id).update({
    rating: avgRating,
    reviewsCount: newCount,
    updatedAt: new Date()
  });
  return getById(id);
};

module.exports = { create, getAll, getById, update, remove, updateRating };