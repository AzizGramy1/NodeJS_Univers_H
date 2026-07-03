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
  
  // Calculer les totaux
  let subtotal = 0;
  let discountTotal = 0;
  
  const lines = data.lines.map(line => {
    const lineTotal = line.price * line.qty;
    const discount = (line.discount || 0) / 100 * lineTotal;
    const finalTotal = lineTotal - discount;
    
    subtotal += lineTotal;
    discountTotal += discount;
    
    return {
      ...line,
      total: finalTotal,
      discount: line.discount || 0,
      discountType: line.discountType || 'percent'
    };
  });
  
  const taxRate = data.taxRate || 19;
  const taxAmount = (subtotal - discountTotal) * (taxRate / 100);
  const total = (subtotal - discountTotal) + taxAmount + (data.livraison || 0) + (data.serviceFee || 0);
  
  // Calculer la marge si costTotal est fourni
  let profit = null;
  let profitMargin = null;
  if (data.costTotal !== undefined) {
    profit = total - data.costTotal;
    profitMargin = (profit / total) * 100;
  }
  
  await docRef.set({
    // Informations de base
    num: num,
    clientId: data.clientId || '',
    clientName: data.clientName || '',
    clientEmail: data.clientEmail || '',
    clientPhone: data.clientPhone || '',
    
    // Type
    type: data.type || 'product',
    orderType: data.orderType || 'online',
    
    // Lignes
    lines: lines,
    
    // Totaux
    subtotal: subtotal,
    discountTotal: discountTotal,
    taxRate: taxRate,
    taxAmount: taxAmount,
    livraison: data.livraison || 0,
    serviceFee: data.serviceFee || 0,
    total: total,
    
    // Adresses
    billingAddress: data.billingAddress || {},
    deliveryAddress: data.deliveryAddress || {},
    sameAddress: data.sameAddress !== undefined ? data.sameAddress : true,
    
    // Livraison
    deliveryMethod: data.deliveryMethod || 'delivery',
    deliveryDate: data.deliveryDate || null,
    deliveryTime: data.deliveryTime || null,
    deliveryStatus: data.deliveryStatus || 'pending',
    trackingNumber: data.trackingNumber || null,
    
    // Statut
    status: data.status || 'attente',
    statusHistory: [
      {
        status: data.status || 'attente',
        date: now,
        note: data.notes || 'Commande créée',
        userId: data.createdBy || null
      }
    ],
    
    // Paiement
    paymentStatus: data.paymentStatus || 'pending',
    paymentMethod: data.paymentMethod || 'cash',
    paymentDate: data.paymentDate || null,
    paymentReference: data.paymentReference || null,
    transactionId: data.transactionId || null,
    
    // Dates
    date: now,
    confirmedDate: data.confirmedDate || null,
    shippedDate: data.shippedDate || null,
    deliveredDate: data.deliveredDate || null,
    cancelledDate: data.cancelledDate || null,
    
    // Notes
    notes: data.notes || '',
    internalNotes: data.internalNotes || '',
    specialInstructions: data.specialInstructions || '',
    
    // Personnel
    assignedTo: data.assignedTo || null,
    handledBy: data.handledBy || null,
    
    // Marge
    costTotal: data.costTotal || null,
    profit: profit,
    profitMargin: profitMargin,
    
    // Évaluations
    rating: data.rating || null,
    feedback: data.feedback || null,
    
    // Dates
    createdAt: now,
    updatedAt: now,
    deletedAt: data.deletedAt || null
  });
  
  return { id: docRef.id, ...data, num, total, createdAt: now, updatedAt: now };
};

const getAll = async (filters = {}) => {
  let query = db.collection(COLLECTION);
  
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.type) query = query.where('type', '==', filters.type);
  if (filters.clientId) query = query.where('clientId', '==', filters.clientId);
  if (filters.paymentStatus) query = query.where('paymentStatus', '==', filters.paymentStatus);
  if (filters.deliveryStatus) query = query.where('deliveryStatus', '==', filters.deliveryStatus);
  if (filters.orderType) query = query.where('orderType', '==', filters.orderType);
  
  // Filtres de dates
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    query = query.where('date', '>=', start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    query = query.where('date', '<=', end);
  }
  
  // Filtres de montant
  if (filters.minTotal) {
    query = query.where('total', '>=', parseFloat(filters.minTotal));
  }
  if (filters.maxTotal) {
    query = query.where('total', '<=', parseFloat(filters.maxTotal));
  }
  
  query = query.orderBy('date', 'desc');
  
  // Recherche textuelle
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const snapshot = await query.get();
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.num?.toLowerCase().includes(search) || 
          data.clientName?.toLowerCase().includes(search) ||
          data.clientEmail?.toLowerCase().includes(search)) {
        orders.push({ id: doc.id, ...data });
      }
    });
    return orders;
  }
  
  const snapshot = await query.get();
  const orders = [];
  snapshot.forEach(doc => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  return orders;
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

const updateStatus = async (id, status, note = '', userId = null) => {
  const order = await getById(id);
  if (!order) return null;
  
  const statusHistory = order.statusHistory || [];
  statusHistory.push({
    status: status,
    date: new Date(),
    note: note,
    userId: userId
  });
  
  // Mettre à jour les dates spécifiques selon le statut
  const updateData = {
    status: status,
    statusHistory: statusHistory,
    updatedAt: new Date()
  };
  
  if (status === 'confirmee') {
    updateData.confirmedDate = new Date();
  } else if (status === 'expediee') {
    updateData.shippedDate = new Date();
    updateData.deliveryStatus = 'in-progress';
  } else if (status === 'livree') {
    updateData.deliveredDate = new Date();
    updateData.deliveryStatus = 'delivered';
  } else if (status === 'annulee') {
    updateData.cancelledDate = new Date();
    updateData.deliveryStatus = 'cancelled';
  }
  
  await db.collection(COLLECTION).doc(id).update(updateData);
  return getById(id);
};

const remove = async (id) => {
  await db.collection(COLLECTION).doc(id).update({
    status: 'annulee',
    deletedAt: new Date(),
    updatedAt: new Date()
  });
};

module.exports = { create, getAll, getById, update, updateStatus, remove };