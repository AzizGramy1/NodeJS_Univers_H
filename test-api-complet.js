// test-api-complet.js
const axios = require('axios');
const { db } = require('./config/firebase');

const BASE_URL = 'http://localhost:5000/api';
const FIREBASE_API_KEY = 'AIzaSyBn_eRdxrPgL3SF7Dskz4qYfagYCg4KJXg';
const EMAIL = 'admin@univershygiene.tn';
const PASSWORD = 'admin123';

let TOKEN = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// ─────────────────────────────────────────────
// 🔐 AUTHENTIFICATION
// ─────────────────────────────────────────────
async function getToken() {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      { email: EMAIL, password: PASSWORD, returnSecureToken: true }
    );
    return response.data.idToken;
  } catch (error) {
    console.error('❌ Erreur token:', error.response?.data || error.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// 📊 HELPERS DE TEST
// ─────────────────────────────────────────────
function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${icon} ${status} - ${name} ${details}`);
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testGet(url, name) {
  try {
    const response = await axios.get(`${BASE_URL}${url}`);
    logTest(name, true, `(${response.data.data?.length || 0} éléments)`);
    return response.data;
  } catch (error) {
    logTest(name, false, `❌ ${error.response?.status || error.message}`);
    return null;
  }
}

async function testPost(url, data, name) {
  try {
    const response = await axios.post(`${BASE_URL}${url}`, data, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
    });
    logTest(name, true, `✅ ID: ${response.data.data?.id || 'créé'}`);
    return response.data.data;
  } catch (error) {
    logTest(name, false, `❌ ${error.response?.status || error.message}`);
    return null;
  }
}

async function testPut(url, data, name) {
  try {
    const response = await axios.put(`${BASE_URL}${url}`, data, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
    });
    logTest(name, true, `✅ mis à jour`);
    return response.data.data;
  } catch (error) {
    logTest(name, false, `❌ ${error.response?.status || error.message}`);
    return null;
  }
}

async function testDelete(url, name) {
  try {
    await axios.delete(`${BASE_URL}${url}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    logTest(name, true, `✅ supprimé`);
    return true;
  } catch (error) {
    logTest(name, false, `❌ ${error.response?.status || error.message}`);
    return false;
  }
}

// ─────────────────────────────────────────────
// 🧪 TESTS COMPLETS
// ─────────────────────────────────────────────
async function runTests() {
  console.log('\n🚀 DÉBUT DES TESTS COMPLETS\n');
  console.log('═'.repeat(60));

  // 1. Obtenir le token
  TOKEN = await getToken();
  if (!TOKEN) {
    console.error('❌ Impossible de continuer sans token');
    return;
  }
  console.log('✅ Token obtenu\n');

  // ─────────────────────────────────────────────
  // 2. TEST PING
  // ─────────────────────────────────────────────
  console.log('📡 2. TEST PING');
  try {
    const ping = await axios.get(`${BASE_URL}/ping`);
    logTest('Ping', true, `✅ ${ping.data.message}`);
  } catch (error) {
    logTest('Ping', false, `❌ ${error.message}`);
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 3. TEST PRODUITS
  // ─────────────────────────────────────────────
  console.log('📦 3. TEST PRODUITS');
  
  await testGet('/products', 'GET /products');
  
  const productData = {
    name: 'Produit Test ' + Date.now(),
    cat: 'desinfection',
    subCat: 'spray',
    emoji: '🧪',
    badge: 'new',
    price: 29.99,
    old: 39.99,
    costPrice: 15.00,
    wholesalePrice: 22.50,
    stock: 100,
    threshold: 10,
    location: 'Entrepôt A-12',
    deliveryDelay: '24h',
    unit: 'L',
    weight: 1.2,
    volume: 1,
    concentration: 5,
    ph: 7.2,
    certification: ['ISO 9001', 'EN 14476'],
    activeIngredients: 'Alcool 70%',
    composition: 'Ethanol, eau, agents épaississants',
    usageType: 'professionnel',
    desc: 'Désinfectant professionnel haute performance',
    longDesc: 'Désinfectant professionnel à large spectre...',
    instructions: 'Pulvériser sur la surface, laisser agir 5 minutes',
    precautions: 'Ne pas ingérer, éviter le contact avec les yeux',
    featured: true,
    tags: ['desinfection', 'professionnel', 'certifié']
  };
  const product = await testPost('/products', productData, 'POST /products (enrichi)');
  let productId = product?.id;
  
  if (productId) {
    await testGet(`/products/${productId}`, 'GET /products/:id');
    await testGet('/products/low-stock', 'GET /products/low-stock');
    await testPut(`/products/${productId}`, { price: 34.99, stock: 80 }, 'PUT /products/:id');
    
    // Ajouter une note
    await testPost(`/products/${productId}/rating`, { rating: 4.5 }, 'POST /products/:id/rating');
    
    await testDelete(`/products/${productId}`, 'DELETE /products/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 4. TEST SERVICES (enrichi)
  // ─────────────────────────────────────────────
  console.log('🧹 4. TEST SERVICES');
  
  await testGet('/services', 'GET /services');
  
  const serviceData = {
    name: 'Service Test ' + Date.now(),
    type: 'b2b',
    subType: 'desinfection',
    category: 'Nettoyage',
    emoji: '🧹',
    badge: 'certified',
    price: 450,
    hourlyRate: 150,
    pricePerM2: 2.50,
    travelCost: 50,
    minPrice: 200,
    maxPrice: 800,
    duration: '2h',
    durationMinutes: 120,
    staffNeeded: 2,
    equipmentList: ['Pulvérisateur', 'Équipement de protection'],
    productsUsed: ['Désinfectant pro'],
    vehicleRequired: true,
    coverageArea: ['Tunis', 'Ariana', 'La Marsa', 'Gammarth'],
    maxDistance: 50,
    minArea: 20,
    maxArea: 500,
    requirements: 'Accès à l\'eau, surface dégagée',
    desc: 'Service de désinfection professionnelle',
    benefits: ['Protection certifiée', 'Personnel qualifié'],
    processSteps: ['Évaluation', 'Désinfection', 'Contrôle'],
    includes: ['Produits', 'Main d\'œuvre'],
    certifications: ['Certifié MSP'],
    insurance: 'Assurance responsabilité civile',
    availableForBooking: true,
    emergencyService: true,
    tags: ['desinfection', 'urgence']
  };
  const service = await testPost('/services', serviceData, 'POST /services (enrichi)');
  let serviceId = service?.id;
  
  if (serviceId) {
    await testGet(`/services/${serviceId}`, 'GET /services/:id');
    await testPut(`/services/${serviceId}`, { price: 500, availableForBooking: true }, 'PUT /services/:id');
    await testDelete(`/services/${serviceId}`, 'DELETE /services/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 5. TEST CLIENTS (enrichi)
  // ─────────────────────────────────────────────
  console.log('👤 5. TEST CLIENTS');
  
  await testGet('/clients', 'GET /clients');
  await testGet('/clients?type=b2b', 'GET /clients?type=b2b');
  
  const clientData = {
    name: 'Client Test ' + Date.now(),
    phone: '+216 99 999 999',
    phone2: '+216 88 888 888',
    email: `test${Date.now()}@example.com`,
    city: 'Tunis',
    address: '123 Rue des Arts',
    zipCode: '1002',
    landmark: 'Près de l\'ambassade',
    type: 'b2b',
    sector: 'hotellerie',
    companyName: 'Hôtel Test',
    siret: '123456789',
    taxId: '12345678/A/B/000',
    contactName: 'M. Contact',
    contactTitle: 'Directeur',
    contactPhone: '+216 77 777 777',
    contactEmail: 'contact@example.com',
    segment: 'premium',
    region: 'Tunis',
    country: 'Tunisie',
    vip: true,
    preferences: {
      contactMethod: 'phone',
      language: 'fr',
      timezone: 'Africa/Tunis',
      notifyNewOffers: true,
      notifyOrderStatus: true,
      notifyPromotions: true
    },
    notes: 'Client VIP - Contrat annuel',
    specialRequirements: 'Demande un service premium',
    source: 'Recommandation',
    subscriptionType: 'premium',
    subscriptionStart: '2026-01-01',
    subscriptionEnd: '2026-12-31'
  };
  const client = await testPost('/clients', clientData, 'POST /clients (enrichi)');
  let clientId = client?.id;
  
  if (clientId) {
    await testGet(`/clients/${clientId}`, 'GET /clients/:id');
    await testPut(`/clients/${clientId}`, { 
      segment: 'premium', 
      vip: true,
      preferences: { contactMethod: 'email' }
    }, 'PUT /clients/:id');
    
    // Mettre à jour les statistiques
    await testPut(`/clients/${clientId}/stats`, { orderTotal: 1500 }, 'PUT /clients/:id/stats');
    
    await testDelete(`/clients/${clientId}`, 'DELETE /clients/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 6. TEST SUPPLIERS
  // ─────────────────────────────────────────────
  console.log('🏢 6. TEST FOURNISSEURS');
  
  await testGet('/suppliers', 'GET /suppliers');
  
  const supplierData = {
    name: 'Fournisseur Test ' + Date.now(),
    contact: 'M. Test',
    phone: '+216 71 111 111',
    phone2: '+216 71 222 222',
    email: `fournisseur${Date.now()}@test.tn`,
    website: 'https://fournisseur-test.tn',
    address: 'Zone Industrielle',
    city: 'Tunis',
    postalCode: '1000',
    country: 'Tunisie',
    siret: '987654321',
    category: ['Désinfection', 'Nettoyage'],
    speciality: ['Désinfectants'],
    productTypes: ['Liquide', 'Spray'],
    paymentTerms: '30 jours fin de mois',
    deliveryTerms: 'Frais de port offerts',
    discountRate: 10,
    minOrder: 100,
    leadTime: '48h',
    active: true,
    preferred: true,
    certified: true,
    certifications: ['ISO 9001', 'ISO 14001'],
    standards: ['EN 14476'],
    notes: 'Fournisseur recommandé',
    performanceNotes: 'Excellent délai de livraison'
  };
  const supplier = await testPost('/suppliers', supplierData, 'POST /suppliers (enrichi)');
  let supplierId = supplier?.id;
  
  if (supplierId) {
    await testGet(`/suppliers/${supplierId}`, 'GET /suppliers/:id');
    await testPut(`/suppliers/${supplierId}`, { 
      discountRate: 15, 
      preferred: true,
      leadTime: '24h'
    }, 'PUT /suppliers/:id');
    await testDelete(`/suppliers/${supplierId}`, 'DELETE /suppliers/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 7. TEST ORDERS (enrichi)
  // ─────────────────────────────────────────────
  console.log('🛒 7. TEST COMMANDES (enrichi)');
  
  // Créer un produit pour la commande
  const orderProduct = await testPost('/products', {
    name: 'Produit pour commande ' + Date.now(),
    cat: 'desinfection',
    price: 18.50,
    stock: 100,
    active: true
  }, 'POST /products (pour commande)');
  
  if (orderProduct && orderProduct.id) {
    await testGet('/orders', 'GET /orders');
    
    const orderData = {
      clientId: 'demo-client',
      clientName: 'Client Test Commande',
      clientEmail: 'test@example.com',
      clientPhone: '+216 99 999 999',
      type: 'product',
      orderType: 'online',
      lines: [
        {
          type: 'product',
          id: orderProduct.id,
          name: 'Produit pour commande',
          price: 18.50,
          qty: 2,
          emoji: '📦',
          discount: 10,
          discountType: 'percent'
        }
      ],
      livraison: 7,
      serviceFee: 0,
      taxRate: 19,
      billingAddress: {
        street: '123 Rue des Arts',
        city: 'Tunis',
        postalCode: '1002',
        country: 'Tunisie'
      },
      deliveryAddress: {
        street: '456 Avenue de la République',
        city: 'Tunis',
        postalCode: '1000',
        country: 'Tunisie'
      },
      sameAddress: false,
      deliveryMethod: 'delivery',
      deliveryDate: '2026-07-15',
      deliveryTime: '09:00-12:00',
      status: 'attente',
      paymentMethod: 'card',
      notes: 'Commande de test enrichie',
      specialInstructions: 'Livrer avant 12h',
      assignedTo: 'admin',
      costTotal: 25.00
    };
    const order = await testPost('/orders', orderData, 'POST /orders (enrichi)');
    let orderId = order?.id;
    
    if (orderId) {
      await testGet(`/orders/${orderId}`, 'GET /orders/:id');
      
      // Test des différents statuts
      await testPut(`/orders/${orderId}/status`, { status: 'confirmee', note: 'Commande confirmée' }, 'PUT /orders/:id/status (confirmee)');
      await testPut(`/orders/${orderId}/status`, { status: 'expediee', note: 'Commande expédiée' }, 'PUT /orders/:id/status (expediee)');
      await testPut(`/orders/${orderId}/status`, { status: 'livree', note: 'Commande livrée' }, 'PUT /orders/:id/status (livree)');
      
      await testDelete(`/orders/${orderId}`, 'DELETE /orders/:id');
    }
    
    await testDelete(`/products/${orderProduct.id}`, 'DELETE /products (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 8. TEST SERVICE REQUESTS
  // ─────────────────────────────────────────────
  console.log('📩 8. TEST DEMANDES DE SERVICES');
  
  // Créer un client pour la demande
  const requestClient = await testPost('/clients', {
    name: 'Client Demande ' + Date.now(),
    phone: '+216 77 777 777',
    email: `demande${Date.now()}@test.tn`,
    city: 'Tunis',
    type: 'b2b',
    active: true
  }, 'POST /clients (pour demande)');
  
  // Créer un service pour la demande
  const requestService = await testPost('/services', {
    name: 'Service Demande ' + Date.now(),
    type: 'b2b',
    price: 450,
    duration: '2h',
    active: true
  }, 'POST /services (pour demande)');
  
  if (requestClient && requestClient.id && requestService && requestService.id) {
    await testGet('/requests', 'GET /requests');
    await testGet('/requests?status=nouveau', 'GET /requests?status=nouveau');
    
    const requestData = {
      clientId: requestClient.id,
      clientName: requestClient.name,
      clientPhone: requestClient.phone,
      clientEmail: requestClient.email,
      serviceId: requestService.id,
      serviceName: requestService.name,
      serviceType: 'b2b',
      description: 'Demande de test enrichie',
      detailedDescription: 'Demande détaillée avec exigences particulières',
      requirements: 'Accès facile, eau disponible',
      requestType: 'urgent',
      frequency: 'one-time',
      interventionAddress: {
        street: '123 Rue des Arts',
        city: 'Tunis',
        postalCode: '1002',
        country: 'Tunisie'
      },
      preferredDate: '2026-07-10T09:00:00Z',
      preferredTime: '09:00-12:00',
      urgencyLevel: 4,
      deadline: '2026-07-15T00:00:00Z',
      priority: 'urgent',
      priorityReason: 'Urgence sanitaire',
      areaSize: 150,
      numberOfRooms: 5,
      floorNumber: 2,
      hasElevator: true,
      status: 'nouveau',
      estimatedBudget: 500,
      minBudget: 400,
      maxBudget: 600,
      notes: 'Demande urgente'
    };
    const request = await testPost('/requests', requestData, 'POST /requests (enrichi)');
    let requestId = request?.id;
    
    if (requestId) {
      await testGet(`/requests/${requestId}`, 'GET /requests/:id');
      await testPut(`/requests/${requestId}`, { 
        status: 'en_cours',
        assignedTo: 'admin'
      }, 'PUT /requests/:id (en_cours)');
      await testPut(`/requests/${requestId}`, { 
        status: 'traite',
        satisfactionRating: 4.5,
        feedback: 'Excellent travail'
      }, 'PUT /requests/:id (traite)');
      
      await testDelete(`/requests/${requestId}`, 'DELETE /requests/:id');
    }
    
    await testDelete(`/clients/${requestClient.id}`, 'DELETE /clients (nettoyage)');
    await testDelete(`/services/${requestService.id}`, 'DELETE /services (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 9. TEST QUOTES (Devis)
  // ─────────────────────────────────────────────
  console.log('📄 9. TEST DEVIS');
  
  const quoteClient = await testPost('/clients', {
    name: 'Client Devis ' + Date.now(),
    phone: '+216 66 666 666',
    email: `devis${Date.now()}@test.tn`,
    city: 'Tunis',
    type: 'b2b',
    active: true
  }, 'POST /clients (pour devis)');
  
  const quoteService = await testPost('/services', {
    name: 'Service Devis ' + Date.now(),
    type: 'b2b',
    price: 500,
    duration: '3h',
    active: true
  }, 'POST /services (pour devis)');
  
  if (quoteClient && quoteClient.id && quoteService && quoteService.id) {
    await testGet('/quotes', 'GET /quotes');
    
    const quoteData = {
      clientId: quoteClient.id,
      clientName: quoteClient.name,
      clientEmail: quoteClient.email,
      clientPhone: quoteClient.phone,
      items: [
        {
          type: 'service',
          id: quoteService.id,
          name: 'Service Devis',
          description: 'Service de désinfection complet',
          price: 500,
          qty: 1,
          discount: 10,
          taxRate: 19,
          total: 450
        }
      ],
      subtotal: 500,
      discountTotal: 50,
      taxRate: 19,
      taxAmount: 85.50,
      total: 535.50,
      validUntil: '2026-08-15T00:00:00Z',
      paymentTerms: '30 jours net',
      deliveryTerms: 'Frais de port offerts',
      guaranteeTerms: 'Garantie satisfait ou remboursé',
      status: 'brouillon',
      introduction: 'Cher client, veuillez trouver ci-joint notre devis.',
      conclusion: 'Dans l\'attente de votre retour.',
      notes: 'Devis de test enrichi'
    };
    const quote = await testPost('/quotes', quoteData, 'POST /quotes (enrichi)');
    let quoteId = quote?.id;
    
    if (quoteId) {
      await testGet(`/quotes/${quoteId}`, 'GET /quotes/:id');
      await testPut(`/quotes/${quoteId}`, { 
        status: 'envoye',
        sentDate: new Date().toISOString(),
        sentBy: 'admin'
      }, 'PUT /quotes/:id (envoye)');
      await testPut(`/quotes/${quoteId}`, { 
        status: 'accepte',
        acceptedDate: new Date().toISOString(),
        acceptedBy: quoteClient.name
      }, 'PUT /quotes/:id (accepte)');
      
      await testDelete(`/quotes/${quoteId}`, 'DELETE /quotes/:id');
    }
    
    await testDelete(`/clients/${quoteClient.id}`, 'DELETE /clients (nettoyage)');
    await testDelete(`/services/${quoteService.id}`, 'DELETE /services (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 10. TEST EVENTS (Planning)
  // ─────────────────────────────────────────────
  console.log('📅 10. TEST ÉVÉNEMENTS');
  
  const eventClient = await testPost('/clients', {
    name: 'Client Event ' + Date.now(),
    phone: '+216 55 555 555',
    email: `event${Date.now()}@test.tn`,
    city: 'Tunis',
    type: 'b2b',
    active: true
  }, 'POST /clients (pour event)');
  
  const eventService = await testPost('/services', {
    name: 'Service Event ' + Date.now(),
    type: 'b2b',
    price: 450,
    duration: '2h',
    active: true
  }, 'POST /services (pour event)');
  
  if (eventClient && eventClient.id && eventService && eventService.id) {
    await testGet('/events', 'GET /events');
    await testGet('/events?status=planifie', 'GET /events?status=planifie');
    
    const eventData = {
      title: 'Événement Test ' + Date.now(),
      description: 'Intervention de désinfection',
      type: 'intervention',
      clientId: eventClient.id,
      clientName: eventClient.name,
      serviceId: eventService.id,
      serviceName: eventService.name,
      date: '2026-07-15T09:00:00.000Z',
      startTime: '2026-07-15T09:00:00.000Z',
      endTime: '2026-07-15T11:00:00.000Z',
      duration: 120,
      allDay: false,
      location: {
        address: '123 Rue des Arts',
        city: 'Tunis',
        postalCode: '1002',
        country: 'Tunisie',
        room: 'Salle de réunion'
      },
      status: 'planifie',
      assignedTo: 'admin',
      assignedTeam: ['technicien1', 'technicien2'],
      equipment: ['Pulvérisateur', 'Équipement de protection'],
      materials: ['Désinfectant'],
      notes: 'Vérifier disponibilité du client',
      confirmed: true,
      confirmedDate: '2026-07-10T00:00:00Z',
      confirmedBy: 'client'
    };
    const event = await testPost('/events', eventData, 'POST /events (enrichi)');
    let eventId = event?.id;
    
    if (eventId) {
      await testGet(`/events/${eventId}`, 'GET /events/:id');
      await testPut(`/events/${eventId}`, { 
        status: 'en_cours',
        startTime: '2026-07-15T09:15:00Z'
      }, 'PUT /events/:id (en_cours)');
      await testPut(`/events/${eventId}`, { 
        status: 'termine',
        rating: 4.5,
        feedback: 'Intervention parfaite'
      }, 'PUT /events/:id (termine)');
      
      await testDelete(`/events/${eventId}`, 'DELETE /events/:id');
    }
    
    await testDelete(`/clients/${eventClient.id}`, 'DELETE /clients (nettoyage)');
    await testDelete(`/services/${eventService.id}`, 'DELETE /services (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 11. TEST OFFERS (Offres promotionnelles)
  // ─────────────────────────────────────────────
  console.log('🏷️ 11. TEST OFFRES');
  
  const offerProduct = await testPost('/products', {
    name: 'Produit pour offre ' + Date.now(),
    cat: 'desinfection',
    price: 29.99,
    stock: 50,
    active: true
  }, 'POST /products (pour offre)');
  
  if (offerProduct && offerProduct.id) {
    await testGet('/offers', 'GET /offers');
    
    const offerData = {
      name: 'Offre Test ' + Date.now(),
      code: 'TEST' + Date.now().toString().slice(-6),
      description: 'Offre de test enrichie',
      target: 'product',
      targetType: 'specific',
      targetIds: [offerProduct.id],
      targetCategories: ['desinfection'],
      type: 'percent',
      value: 20,
      maxDiscount: 10,
      minPurchase: 50,
      start: '2026-07-01T00:00:00.000Z',
      end: '2026-08-31T23:59:59.000Z',
      usageLimit: 100,
      perUserLimit: 2,
      active: true,
      featured: true,
      visibility: 'public',
      displayOnHome: true,
      promotionChannel: ['email', 'social'],
      terms: 'Offre valable une fois par client',
      notes: 'Offre de test enrichie'
    };
    const offer = await testPost('/offers', offerData, 'POST /offers (enrichi)');
    let offerId = offer?.id;
    
    if (offerId) {
      await testGet(`/offers/${offerId}`, 'GET /offers/:id');
      await testPut(`/offers/${offerId}`, { 
        value: 25,
        active: true,
        featured: true
      }, 'PUT /offers/:id');
      
      await testDelete(`/offers/${offerId}`, 'DELETE /offers/:id');
    }
    
    await testDelete(`/products/${offerProduct.id}`, 'DELETE /products (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 12. RÉSULTATS
  // ─────────────────────────────────────────────
  console.log('═'.repeat(60));
  console.log(`\n📊 RÉSULTATS DES TESTS`);
  console.log(`  ✅ PASSÉS: ${testResults.passed}`);
  console.log(`  ❌ ÉCHOUÉS: ${testResults.failed}`);
  console.log(`  📝 TOTAL: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
  } else {
    console.log(`\n⚠️ ${testResults.failed} test(s) ont échoué. Vérifiez les détails ci-dessus.`);
    
    // Afficher les tests échoués
    console.log('\n📋 TESTS ÉCHOUÉS :');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ❌ ${t.name} - ${t.details}`);
      });
  }
  console.log('');
}

// ─────────────────────────────────────────────
// 🚀 EXÉCUTION
// ─────────────────────────────────────────────
runTests();