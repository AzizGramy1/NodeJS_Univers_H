const { db } = require('../config/firebase');
const COLLECTION = 'serviceRequests';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  await docRef.set({ ...data, date: now, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, date: now, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.priority) query = query.where('priority', '==', filters.priority);
  if (filters.clientId) query = query.where('clientId', '==', filters.clientId);
  query = query.orderBy('date', 'desc');
  const snapshot = await query.get();
  const requests = [];
  snapshot.forEach(doc => requests.push({ id: doc.id, ...doc.data() }));
  return requests;
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