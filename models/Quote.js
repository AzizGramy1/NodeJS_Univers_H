const { db } = require('../config/firebase');
const COLLECTION = 'quotes';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  const total = data.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  await docRef.set({ ...data, total, date: now, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, total, date: now, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.clientId) query = query.where('clientId', '==', filters.clientId);
  query = query.orderBy('date', 'desc');
  const snapshot = await query.get();
  const quotes = [];
  snapshot.forEach(doc => quotes.push({ id: doc.id, ...doc.data() }));
  return quotes;
};

const getById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const update = async (id, data) => {
  if (data.items) {
    const total = data.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    data.total = total;
  }
  await db.collection(COLLECTION).doc(id).update({ ...data, updatedAt: new Date() });
  return getById(id);
};

const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).delete();
};

module.exports = { create, getAll, getById, update, remove };