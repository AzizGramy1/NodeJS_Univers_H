const { db } = require('../config/firebase');
const COLLECTION = 'products';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  await docRef.set({ ...data, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.cat) query = query.where('cat', '==', filters.cat);
  if (filters.active !== undefined) query = query.where('active', '==', filters.active === 'true');
  if (filters.supplierId) query = query.where('supplierId', '==', filters.supplierId);
  const snapshot = await query.get();
  const products = [];
  snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
  return products;
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

const getLowStock = async () => {
  const snapshot = await db.collection(COLLECTION).where('active', '==', true).get();
  const products = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.stock < data.threshold) products.push({ id: doc.id, ...data });
  });
  return products;
};

module.exports = { create, getAll, getById, update, remove, getLowStock };