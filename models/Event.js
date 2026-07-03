const { db } = require('../config/firebase');
const COLLECTION = 'events';

/**
 * Créer un événement (planning)
 */
const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  await docRef.set({
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

/**
 * Récupérer tous les événements avec filtres
 * @param {Object} filters - { status, clientId, startDate, endDate }
 */
const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  if (filters.clientId) {
    query = query.where('clientId', '==', filters.clientId);
  }
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    query = query.where('date', '>=', start).where('date', '<=', end);
  }
  
  query = query.orderBy('date', 'asc');
  const snapshot = await query.get();
  const events = [];
  snapshot.forEach(doc => {
    events.push({ id: doc.id, ...doc.data() });
  });
  return events;
};

/**
 * Récupérer un événement par ID
 */
const getById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

/**
 * Mettre à jour un événement
 */
const update = async (id, data) => {
  await db.collection(COLLECTION).doc(id).update({
    ...data,
    updatedAt: new Date()
  });
  return getById(id);
};

/**
 * Supprimer un événement
 */
const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).delete();
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};