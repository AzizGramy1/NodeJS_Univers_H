// models/Event.js
const { db } = require('../config/firebase');
const COLLECTION = 'events';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  await docRef.set({ ...data, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  try {
    let query = db.collection(COLLECTION);
    
    if (filters.status && filters.status !== 'all') {
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
  } catch (error) {
    console.error('Erreur getAll Event:', error);
    // Si l'index n'existe pas, faire une requête sans orderBy
    let query = db.collection(COLLECTION);
    if (filters.status && filters.status !== 'all') {
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
    const snapshot = await query.get();
    const events = [];
    snapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  }
};

const getById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const update = async (id, data) => {
  await db.collection(COLLECTION).doc(id).update({ ...data, updatedAt: new Date() });
  return getById(id);
};

const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).delete();
};

module.exports = { create, getAll, getById, update, remove };