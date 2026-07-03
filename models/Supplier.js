const { db } = require('../config/firebase');
const COLLECTION = 'suppliers';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  await docRef.set({ ...data, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
};

const getAll = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const suppliers = [];
  snapshot.forEach(doc => suppliers.push({ id: doc.id, ...doc.data() }));
  return suppliers;
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