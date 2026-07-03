// scripts/seed.js
const { db } = require('../config/firebase');

const seedData = async () => {
  try {
    console.log('🌱 Début du seed...');

    // --- Produits ---
    const products = [
      {
        name: 'Désinfectant Sol & Surface',
        cat: 'desinfection',
        emoji: '🧴',
        badge: 'top',
        price: 18.5,
        old: 23,
        stock: 84,
        threshold: 10,
        supplierId: null,
        active: true,
        desc: 'Désinfectant polyvalent à large spectre.'
      },
      {
        name: 'Gel Hydroalcoolique 5L',
        cat: 'desinfection',
        emoji: '🫧',
        badge: 'new',
        price: 34.9,
        old: null,
        stock: 6,
        threshold: 10,
        supplierId: null,
        active: true,
        desc: 'Gel désinfectant mains 70% alcool.'
      }
    ];

    for (const product of products) {
      const docRef = db.collection('products').doc();
      await docRef.set({ ...product, createdAt: new Date(), updatedAt: new Date() });
      console.log(`✅ Produit créé : ${product.name}`);
    }

    // --- Services ---
    const services = [
      {
        name: 'Désinfection complète de locaux',
        type: 'b2b',
        price: 450,
        duration: '2h',
        desc: 'Désinfection par pulvérisation de surface.',
        active: true
      },
      {
        name: 'Traitement anti-nuisibles (intérieur)',
        type: 'b2b',
        price: 320,
        duration: '1h30',
        desc: 'Traitement ciblé contre rongeurs et insectes.',
        active: true
      }
    ];

    for (const service of services) {
      const docRef = db.collection('services').doc();
      await docRef.set({ ...service, createdAt: new Date(), updatedAt: new Date() });
      console.log(`✅ Service créé : ${service.name}`);
    }

    // --- Clients ---
    const clients = [
      {
        name: 'Amal Ben Salah',
        phone: '+216 98 123 456',
        email: 'amal.bensalah@gmail.com',
        city: 'La Marsa',
        type: 'b2c',
        active: true
      },
      {
        name: 'Hôtel Le Palace',
        phone: '+216 71 345 678',
        email: 'contact@lepalace.tn',
        city: 'Gammarth',
        type: 'b2b',
        active: true
      }
    ];

    for (const client of clients) {
      const docRef = db.collection('clients').doc();
      await docRef.set({ ...client, createdAt: new Date(), updatedAt: new Date() });
      console.log(`✅ Client créé : ${client.name}`);
    }

    console.log('🎉 Seed terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
    process.exit(1);
  }
};

seedData();