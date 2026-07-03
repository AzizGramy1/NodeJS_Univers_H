const { db } = require('../config/firebase');
const COLLECTION = 'orders';

const generateOrderNumber = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const count = snapshot.size;
  return `UH-${String(count + 100).padStart(4, '0')}`;
};

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  const num = await generateOrderNumber();
  const orderData = { ...data, num, date: now, createdAt: now, updatedAt: now };
  await docRef.set(orderData);
  return { id: docRef.id, ...orderData };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.type) query = query.where('type', '==', filters.type);
  if (filters.clientId) query = query.where('clientId', '==', filters.clientId);
  query = query.orderBy('date', 'desc');
  const snapshot = await query.get();
  const orders = [];
  snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
  return orders;
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

const updateStatus = async (id, status) => {
  await db.collection(COLLECTION).doc(id).update({ status, updatedAt: new Date() });
  return getById(id);
};

const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).delete();
};

module.exports = { create, getAll, getById, update, updateStatus, remove };