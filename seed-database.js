// seed-database.js
const { db } = require('./config/firebase');

// ─────────────────────────────────────────────
// DONNÉES DE TEST
// ─────────────────────────────────────────────

// Fournisseurs
const SUPPLIERS = [
  {
    name: 'Tunisie Hygiène Pro',
    contact: 'M. Ahmed Ben Ali',
    phone: '+216 71 111 111',
    email: 'contact@tunisiehygiene.tn',
    address: 'Zone Industrielle, Tunis',
    active: true
  },
  {
    name: 'Clean Tech Tunisia',
    contact: 'Mme. Leila Khelil',
    phone: '+216 71 222 222',
    email: 'info@cleantech.tn',
    address: 'Route de la Marsa, Tunis',
    active: true
  },
  {
    name: 'Sanitaire Distribution',
    contact: 'M. Karim Gharbi',
    phone: '+216 71 333 333',
    email: 'commercial@sanitaire-dist.tn',
    address: 'Sfax, Tunisie',
    active: true
  }
];

// Produits
const PRODUCTS = [
  {
    name: 'Désinfectant Sol & Surface 5L',
    cat: 'desinfection',
    emoji: '🧴',
    badge: 'top',
    price: 18.50,
    old: 23.00,
    stock: 84,
    threshold: 10,
    active: true,
    desc: 'Désinfectant polyvalent à large spectre, actif contre bactéries, virus et champignons. Certifié EN 14476.'
  },
  {
    name: 'Gel Hydroalcoolique 5L',
    cat: 'desinfection',
    emoji: '🫧',
    badge: 'new',
    price: 34.90,
    old: null,
    stock: 6,
    threshold: 10,
    active: true,
    desc: 'Gel désinfectant mains 70% alcool, formule OMS. Idéal pour hôpitaux, restaurants et collectivités.'
  },
  {
    name: 'Détergent Dégraissant Pro 10L',
    cat: 'nettoyage',
    emoji: '🧹',
    badge: '',
    price: 24.90,
    old: 30.00,
    stock: 42,
    threshold: 10,
    active: true,
    desc: 'Détergent haute performance pour cuisines professionnelles, sols industriels et surfaces grasses.'
  },
  {
    name: 'Nettoyant Vitres Spray 750ml',
    cat: 'nettoyage',
    emoji: '🪟',
    badge: 'promo',
    price: 11.20,
    old: 14.00,
    stock: 120,
    threshold: 10,
    active: true,
    desc: 'Spray sans gaz propulseur pour vitres, miroirs et surfaces vitrées. Séchage ultra-rapide sans traces.'
  },
  {
    name: 'Kit Dératisation Complet',
    cat: 'nuisibles',
    emoji: '🐀',
    badge: 'agr',
    price: 89.00,
    old: null,
    stock: 3,
    threshold: 5,
    active: true,
    desc: 'Kit professionnel pour dératisation intérieure/extérieure. Agréé MSP Tunisie.'
  },
  {
    name: 'Insecticide Spray 750ml',
    cat: 'nuisibles',
    emoji: '🦟',
    badge: 'agr',
    price: 15.80,
    old: 19.00,
    stock: 57,
    threshold: 10,
    active: true,
    desc: 'Insecticide multi-insectes à action longue durée. Sans danger pour l\'homme après séchage.'
  },
  {
    name: 'Javel Concentrée 12° 5L',
    cat: 'desinfection',
    emoji: '💧',
    badge: 'top',
    price: 8.50,
    old: null,
    stock: 200,
    threshold: 20,
    active: true,
    desc: 'Eau de Javel concentrée 12° pour blanchiment, désinfection et assainissement.'
  },
  {
    name: 'Papier Hygiénique Gros Gisement x36',
    cat: 'sanitaire',
    emoji: '🧻',
    badge: '',
    price: 42.00,
    old: 50.00,
    stock: 15,
    threshold: 10,
    active: true,
    desc: 'Carton de 36 rouleaux de papier hygiénique institutionnel.'
  },
  {
    name: 'Savon Liquide Bactéricide 5L',
    cat: 'sanitaire',
    emoji: '🫙',
    badge: 'new',
    price: 19.90,
    old: null,
    stock: 8,
    threshold: 10,
    active: true,
    desc: 'Savon liquide antibactérien pour distributeurs muraux, pH neutre.'
  },
  {
    name: 'Nettoyant WC Détartrant 1L',
    cat: 'sanitaire',
    emoji: '🚽',
    badge: '',
    price: 7.90,
    old: 9.50,
    stock: 96,
    threshold: 10,
    active: true,
    desc: 'Détartrant WC à action prolongée. Élimine calcaire, urine et odeurs.'
  },
  {
    name: 'Purificateur d\'Air UV-C',
    cat: 'desinfection',
    emoji: '🌬️',
    badge: 'new',
    price: 129.00,
    old: null,
    stock: 7,
    threshold: 5,
    active: true,
    desc: 'Purificateur d\'air à lumière UV-C pour élimination des pathogènes en suspension. Idéal pour les cabinets médicaux.'
  },
  {
    name: 'Bio Nettoyant Multi-surfaces 1L',
    cat: 'nettoyage',
    emoji: '🌿',
    badge: 'top',
    price: 14.50,
    old: 18.00,
    stock: 34,
    threshold: 10,
    active: true,
    desc: 'Nettoyant écologique à base d\'agents naturels. Sans parfum ni colorant. Hypoallergénique.'
  },
  {
    name: 'Répulsif Ultrasons Souris',
    cat: 'nuisibles',
    emoji: '🔊',
    badge: '',
    price: 45.00,
    old: null,
    stock: 12,
    threshold: 5,
    active: true,
    desc: 'Répulsif à ultrasons anti-rongeurs. Couvre jusqu\'à 80m². Silencieux pour l\'humain.'
  },
  {
    name: 'Désinfectant Alimentaire Légumes 5L',
    cat: 'pro',
    emoji: '🥬',
    badge: 'agr',
    price: 22.50,
    old: null,
    stock: 0,
    threshold: 5,
    active: false,
    desc: 'Liquide chloré pour désinfection des légumes par trempage. Certifié contact alimentaire.'
  },
  {
    name: 'Balai & Set Nettoyage Pro',
    cat: 'pro',
    emoji: '🧽',
    badge: 'promo',
    price: 36.00,
    old: 48.00,
    stock: 27,
    threshold: 10,
    active: true,
    desc: 'Set complet balai ergonomique + seau doseur + mop microfibre.'
  }
];

// Services
const SERVICES = [
  {
    name: 'Désinfection complète de locaux',
    type: 'b2b',
    price: 450,
    duration: '2h',
    desc: 'Désinfection par pulvérisation de surface de tous les locaux. Protocole anti-Covid.',
    active: true
  },
  {
    name: 'Traitement anti-nuisibles (intérieur)',
    type: 'b2b',
    price: 320,
    duration: '1h30',
    desc: 'Traitement ciblé contre rongeurs et insectes. Produits certifiés.',
    active: true
  },
  {
    name: 'Nettoyage vitres en hauteur',
    type: 'b2c',
    price: 120,
    duration: '45min',
    desc: 'Nettoyage de vitres jusqu\'à 3ème étage. Équipement sécurisé.',
    active: true
  },
  {
    name: 'Service d\'hygiène alimentaire (cuisine)',
    type: 'b2b',
    price: 280,
    duration: '1h',
    desc: 'Nettoyage et désinfection des surfaces en contact alimentaire. Normes HACCP.',
    active: false
  },
  {
    name: 'Dératisation externe',
    type: 'b2b',
    price: 550,
    duration: '2h30',
    desc: 'Traitement extérieur des bâtiments. Protection longue durée.',
    active: true
  },
  {
    name: 'Nettoyage vapeur (moquettes, tissus)',
    type: 'b2c',
    price: 90,
    duration: '30min',
    desc: 'Nettoyage en profondeur par vapeur. Élimination des acariens et bactéries.',
    active: true
  }
];

// Clients
const CLIENTS = [
  {
    name: 'Amal Ben Salah',
    phone: '+216 98 123 456',
    email: 'amal.bensalah@gmail.com',
    city: 'La Marsa',
    type: 'b2c',
    address: 'Rue des Orangers, La Marsa',
    active: true
  },
  {
    name: 'Hôtel Le Palace Tunis',
    phone: '+216 71 345 678',
    email: 'contact@lepalace.tn',
    city: 'Gammarth',
    type: 'b2b',
    address: 'Boulevard de la Mer, Gammarth',
    active: true
  },
  {
    name: 'Restaurant Dar Zaghouan',
    phone: '+216 71 222 444',
    email: 'dar.zaghouan@gmail.com',
    city: 'Tunis',
    type: 'b2b',
    address: 'Avenue Habib Bourguiba, Tunis',
    active: true
  },
  {
    name: 'Sonia Ferchichi',
    phone: '+216 50 987 321',
    email: 'sonia.f@yahoo.fr',
    city: 'Ariana',
    type: 'b2c',
    address: 'Rue du Lac, Ariana',
    active: true
  },
  {
    name: 'Clinique Essalama',
    phone: '+216 71 800 100',
    email: 'achats@essalama-clinique.tn',
    city: 'Lac 2',
    type: 'b2b',
    address: 'Rue du Lac, Lac 2',
    active: true
  },
  {
    name: 'Mohamed Gharbi',
    phone: '+216 24 555 888',
    email: 'm.gharbi@outlook.com',
    city: 'Manouba',
    type: 'b2c',
    address: 'Avenue de la République, Manouba',
    active: true
  },
  {
    name: 'Société Sotétel',
    phone: '+216 71 950 600',
    email: 'logistique@sotetel.tn',
    city: 'Berges du Lac',
    type: 'b2b',
    address: 'Centre Urbain Nord, Berges du Lac',
    active: true
  },
  {
    name: 'Imen Cherif',
    phone: '+216 29 111 222',
    email: 'imen.cherif@gmail.com',
    city: 'Carthage',
    type: 'b2c',
    address: 'Rue de la Plage, Carthage',
    active: true
  },
  {
    name: 'École Primaire Les Jardins',
    phone: '+216 71 111 222',
    email: 'directeur@jardins.tn',
    city: 'Mutuelleville',
    type: 'b2b',
    address: 'Avenue des Jardins, Mutuelleville',
    active: true
  },
  {
    name: 'Laboratoire BioTech',
    phone: '+216 71 802 000',
    email: 'lab@biotech.tn',
    city: 'Ariana',
    type: 'b2b',
    address: 'Zone de Recherche, Ariana',
    active: true
  }
];

// ─────────────────────────────────────────────
// FONCTIONS D'IMPORTATION
// ─────────────────────────────────────────────

async function importCollection(collectionName, data) {
  console.log(`📥 Importation de ${data.length} documents dans '${collectionName}'...`);
  
  let count = 0;
  for (const item of data) {
    try {
      const docRef = db.collection(collectionName).doc();
      await docRef.set({
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      count++;
      process.stdout.write(`\r  ✅ ${count}/${data.length} documents importés`);
    } catch (error) {
      console.error(`\n  ❌ Erreur sur ${item.name || item.title || 'document'}:`, error.message);
    }
  }
  console.log(`\n  ✅ ${count} documents importés dans '${collectionName}'\n`);
}

async function importProductWithSupplier() {
  console.log(`📥 Importation de ${PRODUCTS.length} produits avec fournisseurs...`);
  
  // Récupérer les fournisseurs existants
  const suppliersSnapshot = await db.collection('suppliers').get();
  const suppliers = [];
  suppliersSnapshot.forEach(doc => {
    suppliers.push({ id: doc.id, ...doc.data() });
  });
  
  if (suppliers.length === 0) {
    console.log('⚠️  Aucun fournisseur trouvé. Les produits seront créés sans fournisseur.');
  }
  
  let count = 0;
  for (const product of PRODUCTS) {
    try {
      const docRef = db.collection('products').doc();
      // Assigner un fournisseur aléatoire si disponible
      const supplierId = suppliers.length > 0 ? suppliers[Math.floor(Math.random() * suppliers.length)].id : null;
      
      await docRef.set({
        ...product,
        supplierId: supplierId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      count++;
      process.stdout.write(`\r  ✅ ${count}/${PRODUCTS.length} produits importés`);
    } catch (error) {
      console.error(`\n  ❌ Erreur sur ${product.name}:`, error.message);
    }
  }
  console.log(`\n  ✅ ${count} produits importés\n`);
}

// ─────────────────────────────────────────────
// SCRIPT PRINCIPAL
// ─────────────────────────────────────────────

async function seedDatabase() {
  console.log('\n🌱 SEED DE LA BASE DE DONNÉES\n');
  console.log('═'.repeat(60));

  try {
    // 1. Importer les fournisseurs
    await importCollection('suppliers', SUPPLIERS);

    // 2. Importer les produits (avec fournisseurs)
    await importProductWithSupplier();

    // 3. Importer les services
    await importCollection('services', SERVICES);

    // 4. Importer les clients
    await importCollection('clients', CLIENTS);

    console.log('═'.repeat(60));
    console.log('\n🎉 SEED TERMINÉ AVEC SUCCÈS !\n');
    console.log(`📊 Résumé des données importées :`);
    console.log(`  🔹 Fournisseurs : ${SUPPLIERS.length}`);
    console.log(`  🔹 Produits : ${PRODUCTS.length}`);
    console.log(`  🔹 Services : ${SERVICES.length}`);
    console.log(`  🔹 Clients : ${CLIENTS.length}`);
    console.log('\n📌 Vérifiez les collections dans la console Firebase Firestore.\n');

  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
  }
}

// Exécuter le seed
seedDatabase();