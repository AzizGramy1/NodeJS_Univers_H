const { db } = require('../config/firebase');
const COLLECTION = 'users';

const create = async (data) => {
  const docRef = db.collection(COLLECTION).doc();
  const now = new Date();
  const userData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    lastLogin: null,
    active: true
  };
  await docRef.set(userData);
  return { id: docRef.id, ...userData };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  if (filters.role) query = query.where('role', '==', filters.role);
  if (filters.active !== undefined) query = query.where('active', '==', filters.active === 'true');
  const snapshot = await query.get();
  const users = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    delete data.password;
    users.push({ id: doc.id, ...data });
  });
  return users;
};

const getById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  delete data.password;
  return { id: doc.id, ...data };
};

const getByEmail = async (email) => {
  const snapshot = await db.collection(COLLECTION).where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  delete data.password;
  return { id: doc.id, ...data };
};

const update = async (id, data) => {
  await db.collection(COLLECTION).doc(id).update({ ...data, updatedAt: new Date() });
  return getById(id);
};

const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).delete();
};

const updateLastLogin = async (id) => {
  await db.collection(COLLECTION).doc(id).update({ lastLogin: new Date(), updatedAt: new Date() });
};

module.exports = {
  create, getAll, getById, getByEmail, update, remove, updateLastLogin
};