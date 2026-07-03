const { db } = require('../config/firebase');
const COLLECTION = 'services';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  await docRef.set({ ...data, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.type) query = query.where('type', '==', filters.type);
  if (filters.active !== undefined) query = query.where('active', '==', filters.active === 'true');
  const snapshot = await query.get();
  const services = [];
  snapshot.forEach(doc => services.push({ id: doc.id, ...doc.data() }));
  return services;
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