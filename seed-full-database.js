// seed-full-database.js
const { db } = require('./config/firebase');

// ─────────────────────────────────────────────
// DONNÉES DE TEST
// ─────────────────────────────────────────────

// 1. COMMANDES
const generateOrders = (products, services, clients) => {
  const orders = [];
  const statuses = ['attente', 'confirmee', 'expediee', 'livree', 'annulee'];
  const statusWeights = [0.15, 0.20, 0.25, 0.30, 0.10]; // Probabilités

  const randomStatus = () => {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < statusWeights.length; i++) {
      cumulative += statusWeights[i];
      if (rand <= cumulative) return statuses[i];
    }
    return statuses[0];
  };

  const orderLines = [
    // [produitId, quantite]
    [0, 2, 1],
    [1, 3, 1],
    [2, 1, 3],
    [3, 2, 2],
    [4, 1, 1],
    [5, 1, 2],
    [6, 4, 1],
    [7, 2, 1],
    [8, 1, 3],
    [9, 2, 2],
    [10, 1, 1],
    [11, 3, 1],
    [12, 2, 2],
  ];

  for (let i = 0; i < 25; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const status = randomStatus();
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    const numLines = 1 + Math.floor(Math.random() * 3);
    const lines = [];
    const usedIndices = new Set();
    
    for (let j = 0; j < numLines; j++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * orderLines.length);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);
      
      const [prodIdx, qty, serviceIdx] = orderLines[idx];
      const isProduct = Math.random() > 0.3;
      
      if (isProduct && products[prodIdx]) {
        const p = products[prodIdx];
        lines.push({
          type: 'product',
          id: p.id,
          name: p.name,
          price: p.price,
          qty: qty,
          emoji: p.emoji || '📦'
        });
      } else if (services[serviceIdx]) {
        const s = services[serviceIdx];
        lines.push({
          type: 'service',
          id: s.id,
          name: s.name,
          price: s.price,
          qty: 1,
          emoji: '🧹'
        });
      }
    }
    
    if (lines.length === 0) continue;
    
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const livraison = subtotal >= 100 ? 0 : 7;
    const total = subtotal + livraison;
    
    orders.push({
      clientId: client.id,
      clientName: client.name,
      type: lines.some(l => l.type === 'service') ? 'service' : 'product',
      lines: lines,
      subtotal: subtotal,
      livraison: livraison,
      total: total,
      status: status,
      date: date,
      notes: Math.random() > 0.7 ? 'Commande avec notes supplémentaires' : '',
      num: `UH-${String(100 + i).padStart(4, '0')}`
    });
  }
  return orders;
};

// 2. DEMANDES DE SERVICES
const generateRequests = (clients, services) => {
  const requests = [];
  const statuses = ['nouveau', 'en_cours', 'traite', 'annule'];
  const priorities = ['normal', 'urgent'];
  
  const descriptions = [
    'Besoin de désinfection complète des locaux suite à un cas de grippe',
    'Présence de souris dans la réserve. Demande de traitement rapide',
    'Nettoyage des vitres de la façade et des fenêtres intérieures',
    'Demande de dératisation externe du bâtiment',
    'Nettoyage vapeur des moquettes et canapés du salon',
    'Désinfection des chambres après départ de clients',
    'Traitement anti-insectes dans les cuisines',
    'Nettoyage en profondeur des sanitaires',
    'Dératisation du sous-sol et des parkings',
    'Désinfection des espaces communs dans une résidence'
  ];
  
  for (let i = 0; i < 15; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const service = Math.random() > 0.3 ? services[Math.floor(Math.random() * services.length)] : null;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    requests.push({
      clientId: client.id,
      serviceId: service ? service.id : null,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      priority: priority,
      status: status,
      date: date,
      notes: Math.random() > 0.8 ? 'À traiter en priorité' : ''
    });
  }
  return requests;
};

// 3. DEVIS - Version corrigée (gère les undefined)
const generateQuotes = (clients, requests, products, services) => {
  const quotes = [];
  const statuses = ['brouillon', 'envoye', 'accepte', 'refuse'];
  
  for (let i = 0; i < 12; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const request = Math.random() > 0.5 ? requests[Math.floor(Math.random() * requests.length)] : null;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 45));
    
    const validUntil = new Date(date);
    validUntil.setDate(validUntil.getDate() + 30);
    
    const numItems = 1 + Math.floor(Math.random() * 3);
    const items = [];
    const usedIds = new Set();
    
    for (let j = 0; j < numItems; j++) {
      const isProduct = Math.random() > 0.4;
      let item;
      let attempts = 0;
      do {
        if (isProduct && products.length > 0) {
          item = products[Math.floor(Math.random() * products.length)];
        } else if (services.length > 0) {
          item = services[Math.floor(Math.random() * services.length)];
        }
        attempts++;
      } while ((usedIds.has(item?.id) || !item) && attempts < 20);
      
      if (item && !usedIds.has(item.id)) {
        usedIds.add(item.id);
        items.push({
          type: isProduct ? 'product' : 'service',
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1 + Math.floor(Math.random() * 3)
        });
      }
    }
    
    if (items.length === 0) continue;
    
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    quotes.push({
      clientId: client.id,
      requestId: request ? request.id : null, // ✅ CORRIGÉ : null au lieu de undefined
      items: items,
      total: total,
      status: status,
      date: date,
      validUntil: validUntil,
      notes: Math.random() > 0.7 ? 'Devis valable 30 jours' : ''
    });
  }
  return quotes;
};

// 4. ÉVÉNEMENTS (Planning)
const generateEvents = (clients, services) => {
  const events = [];
  const statuses = ['planifie', 'en_cours', 'termine', 'annule'];
  const titles = [
    'Désinfection hôtel',
    'Traitement anti-nuisibles',
    'Nettoyage vitres en hauteur',
    'Service hygiène alimentaire',
    'Dératisation externe',
    'Nettoyage vapeur',
    'Désinfection des locaux',
    'Traitement insectes',
    'Nettoyage des sanitaires'
  ];
  
  for (let i = 0; i < 20; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date();
    date.setDate(date.getDate() + (Math.floor(Math.random() * 30) - 15));
    date.setHours(8 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
    
    events.push({
      title: `${titles[Math.floor(Math.random() * titles.length)]} - ${client.name.split(' ').slice(0,2).join(' ')}`,
      clientId: client.id,
      serviceId: service.id,
      date: date,
      status: status,
      notes: Math.random() > 0.7 ? 'À confirmer avec le client' : ''
    });
  }
  return events;
};

// 5. OFFRES
const generateOffers = (products, services) => {
  const offers = [];
  const targets = ['product', 'service'];
  const types = ['percent', 'fixed'];
  
  const offerNames = [
    'Soldes d\'été',
    'Offre rentrée',
    'Promo spéciale',
    'Pack découverte',
    'Offre fidélité',
    'Réduction exceptionnelle',
    'Promo du mois',
    'Offre flash',
    'Pack anniversaire',
    'Offre groupée'
  ];
  
  for (let i = 0; i < 8; i++) {
    const target = targets[Math.floor(Math.random() * targets.length)];
    const items = target === 'product' ? products : services;
    if (items.length === 0) continue;
    
    const item = items[Math.floor(Math.random() * items.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const value = type === 'percent' ? 10 + Math.floor(Math.random() * 40) : 5 + Math.floor(Math.random() * 50);
    const start = new Date();
    start.setDate(start.getDate() + Math.floor(Math.random() * 15) - 30);
    const end = new Date(start);
    end.setDate(end.getDate() + 15 + Math.floor(Math.random() * 45));
    
    offers.push({
      name: offerNames[Math.floor(Math.random() * offerNames.length)],
      target: target,
      itemId: item.id,
      type: type,
      value: value,
      start: start,
      end: end,
      active: Math.random() > 0.4,
      desc: `${type === 'percent' ? value + '%' : value + ' DT'} de réduction sur ${item.name}`
    });
  }
  return offers;
};

// ─────────────────────────────────────────────
// FONCTION D'IMPORTATION AVEC FILTRAGE DES UNDEFINED
// ─────────────────────────────────────────────

async function importCollection(collectionName, data, additionalData = {}) {
  if (data.length === 0) {
    console.log(`⚠️  Aucune donnée à importer pour '${collectionName}'`);
    return 0;
  }
  
  console.log(`📥 Importation de ${data.length} documents dans '${collectionName}'...`);
  
  let count = 0;
  for (const item of data) {
    try {
      // Nettoyer les données : supprimer les champs undefined
      const cleanItem = {};
      for (const [key, value] of Object.entries(item)) {
        if (value !== undefined) {
          cleanItem[key] = value;
        }
      }
      
      const docRef = db.collection(collectionName).doc();
      await docRef.set({
        ...cleanItem,
        ...additionalData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      count++;
      process.stdout.write(`\r  ✅ ${count}/${data.length} documents importés`);
    } catch (error) {
      console.error(`\n  ❌ Erreur sur un document:`, error.message);
    }
  }
  console.log(`\n  ✅ ${count} documents importés dans '${collectionName}'\n`);
  return count;
}

// ─────────────────────────────────────────────
// RÉCUPÉRATION DES DONNÉES EXISTANTES
// ─────────────────────────────────────────────

async function getCollectionData(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}

// ─────────────────────────────────────────────
// SCRIPT PRINCIPAL
// ─────────────────────────────────────────────

async function seedFullDatabase() {
  console.log('\n🌱 SEED COMPLET DE LA BASE DE DONNÉES\n');
  console.log('═'.repeat(60));

  try {
    // 1. Récupérer les données existantes
    console.log('📋 Récupération des données existantes...');
    const products = await getCollectionData('products');
    const services = await getCollectionData('services');
    const clients = await getCollectionData('clients');
    const suppliers = await getCollectionData('suppliers');
    
    console.log(`  ✅ Produits: ${products.length}`);
    console.log(`  ✅ Services: ${services.length}`);
    console.log(`  ✅ Clients: ${clients.length}`);
    console.log(`  ✅ Fournisseurs: ${suppliers.length}\n`);

    if (products.length === 0 || services.length === 0 || clients.length === 0) {
      console.log('⚠️  Données manquantes !');
      console.log('   Veuillez d\'abord exécuter: node seed-database.js');
      console.log('   Ou assurez-vous que les collections existent.\n');
      return;
    }

    // 2. Générer les commandes
    console.log('🛒 Génération des commandes...');
    const orders = generateOrders(products, services, clients);
    await importCollection('orders', orders);
    
    // 3. Générer les demandes de services
    console.log('📩 Génération des demandes de services...');
    const requests = generateRequests(clients, services);
    await importCollection('serviceRequests', requests);
    
    // 4. Générer les devis (version corrigée)
    console.log('📄 Génération des devis...');
    const quotes = generateQuotes(clients, requests, products, services);
    await importCollection('quotes', quotes);
    
    // 5. Générer les événements
    console.log('📅 Génération des événements...');
    const events = generateEvents(clients, services);
    await importCollection('events', events);
    
    // 6. Générer les offres
    console.log('🏷️ Génération des offres...');
    const offers = generateOffers(products, services);
    await importCollection('offers', offers);

    // ─────────────────────────────────────────────
    // RÉSULTATS
    // ─────────────────────────────────────────────
    
    console.log('═'.repeat(60));
    console.log('\n🎉 SEED COMPLET TERMINÉ AVEC SUCCÈS !\n');
    console.log('📊 RÉSUMÉ DES DONNÉES IMPORTÉES :');
    console.log(`  🔹 Fournisseurs : ${suppliers.length}`);
    console.log(`  🔹 Produits : ${products.length}`);
    console.log(`  🔹 Services : ${services.length}`);
    console.log(`  🔹 Clients : ${clients.length}`);
    console.log(`  🔹 Commandes : ${orders.length}`);
    console.log(`  🔹 Demandes de services : ${requests.length}`);
    console.log(`  🔹 Devis : ${quotes.length}`);
    console.log(`  🔹 Événements : ${events.length}`);
    console.log(`  🔹 Offres : ${offers.length}`);
    console.log(`  📝 TOTAL : ${suppliers.length + products.length + services.length + clients.length + orders.length + requests.length + quotes.length + events.length + offers.length} documents`);
    
    console.log('\n📌 Vérifiez les collections dans la console Firebase Firestore.');
    console.log('   Collections créées : suppliers, products, services, clients, orders, serviceRequests, quotes, events, offers\n');

  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
  }
}

// ─────────────────────────────────────────────
// EXÉCUTION
// ─────────────────────────────────────────────

seedFullDatabase();