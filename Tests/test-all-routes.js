// test-all-routes.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const FIREBASE_API_KEY = 'AIzaSyBn_eRdxrPgL3SF7Dskz4qYfagYCg4KJXg';
const EMAIL = 'azizg7266@gmail.com';
const PASSWORD = 'AzizAziz1@*123';

let TOKEN = null;
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// ─────────────────────────────────────────────
// 🔐 OBTAIN TOKEN
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
// 📦 TEST HELPERS
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
    logTest(name, true, `(${response.data.data?.length || '0'} éléments)`);
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
// 🧪 TESTS
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
  
  // GET all products
  await testGet('/products', 'GET /products');
  
  // POST create product
  const productData = {
    name: 'Produit Test ' + Date.now(),
    cat: 'desinfection',
    emoji: '🧪',
    price: 29.99,
    stock: 100,
    threshold: 10,
    active: true,
    desc: 'Produit créé par test automatisé'
  };
  const product = await testPost('/products', productData, 'POST /products');
  
  if (product && product.id) {
    // GET product by ID
    await testGet(`/products/${product.id}`, 'GET /products/:id');
    
    // GET low stock
    await testGet('/products/low-stock', 'GET /products/low-stock');
    
    // PUT update product
    await testPut(`/products/${product.id}`, { price: 39.99, stock: 50 }, 'PUT /products/:id');
    
    // DELETE product
    await testDelete(`/products/${product.id}`, 'DELETE /products/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 4. TEST SERVICES
  // ─────────────────────────────────────────────
  console.log('🧹 4. TEST SERVICES');
  
  await testGet('/services', 'GET /services');
  
  const serviceData = {
    name: 'Service Test ' + Date.now(),
    type: 'b2b',
    price: 350,
    duration: '2h',
    desc: 'Service de test automatisé',
    active: true
  };
  const service = await testPost('/services', serviceData, 'POST /services');
  
  if (service && service.id) {
    await testGet(`/services/${service.id}`, 'GET /services/:id');
    await testPut(`/services/${service.id}`, { price: 400, duration: '3h' }, 'PUT /services/:id');
    await testDelete(`/services/${service.id}`, 'DELETE /services/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 5. TEST CLIENTS
  // ─────────────────────────────────────────────
  console.log('👤 5. TEST CLIENTS');
  
  await testGet('/clients', 'GET /clients');
  await testGet('/clients?type=b2b', 'GET /clients?type=b2b');
  
  const clientData = {
    name: 'Client Test ' + Date.now(),
    phone: '+216 99 999 999',
    email: `test${Date.now()}@example.com`,
    city: 'Tunis',
    type: 'b2b',
    address: 'Tunis, Tunisie',
    active: true
  };
  const client = await testPost('/clients', clientData, 'POST /clients');
  
  if (client && client.id) {
    await testGet(`/clients/${client.id}`, 'GET /clients/:id');
    await testPut(`/clients/${client.id}`, { city: 'Sfax', phone: '+216 98 888 888' }, 'PUT /clients/:id');
    await testDelete(`/clients/${client.id}`, 'DELETE /clients/:id');
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
    email: `fournisseur${Date.now()}@test.tn`,
    address: 'Tunis, Tunisie',
    active: true
  };
  const supplier = await testPost('/suppliers', supplierData, 'POST /suppliers');
  
  if (supplier && supplier.id) {
    await testGet(`/suppliers/${supplier.id}`, 'GET /suppliers/:id');
    await testPut(`/suppliers/${supplier.id}`, { phone: '+216 71 222 222' }, 'PUT /suppliers/:id');
    await testDelete(`/suppliers/${supplier.id}`, 'DELETE /suppliers/:id');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 7. TEST ORDERS
  // ─────────────────────────────────────────────
  console.log('🛒 7. TEST COMMANDES');
  
  // Créer un produit pour la commande
  const orderProduct = await testPost('/products', {
    name: 'Produit pour commande',
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
      type: 'product',
      lines: [
        {
          type: 'product',
          id: orderProduct.id,
          name: 'Produit pour commande',
          price: 18.50,
          qty: 2,
          emoji: '📦'
        }
      ],
      status: 'attente',
      notes: 'Commande de test'
    };
    const order = await testPost('/orders', orderData, 'POST /orders');
    
    if (order && order.id) {
      await testGet(`/orders/${order.id}`, 'GET /orders/:id');
      await testPut(`/orders/${order.id}/status`, { status: 'confirmee' }, 'PUT /orders/:id/status (confirmee)');
      await testPut(`/orders/${order.id}/status`, { status: 'expediee' }, 'PUT /orders/:id/status (expediee)');
      await testPut(`/orders/${order.id}/status`, { status: 'livree' }, 'PUT /orders/:id/status (livree)');
      await testDelete(`/orders/${order.id}`, 'DELETE /orders/:id');
    }
    
    // Nettoyer le produit
    await testDelete(`/products/${orderProduct.id}`, 'DELETE /products (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 8. TEST OFFERS
  // ─────────────────────────────────────────────
  console.log('🏷️ 8. TEST OFFRES');
  
  // Créer un produit pour l'offre
  const offerProduct = await testPost('/products', {
    name: 'Produit pour offre',
    cat: 'desinfection',
    price: 29.99,
    stock: 50,
    active: true
  }, 'POST /products (pour offre)');
  
  if (offerProduct && offerProduct.id) {
    await testGet('/offers', 'GET /offers');
    
    const offerData = {
      name: 'Offre Test ' + Date.now(),
      target: 'product',
      itemId: offerProduct.id,
      type: 'percent',
      value: 20,
      start: '2026-07-01T00:00:00.000Z',
      end: '2026-08-31T23:59:59.000Z',
      active: true,
      desc: 'Offre de test automatisé'
    };
    const offer = await testPost('/offers', offerData, 'POST /offers');
    
    if (offer && offer.id) {
      await testGet(`/offers/${offer.id}`, 'GET /offers/:id');
      await testPut(`/offers/${offer.id}`, { value: 25, active: false }, 'PUT /offers/:id');
      await testDelete(`/offers/${offer.id}`, 'DELETE /offers/:id');
    }
    
    await testDelete(`/products/${offerProduct.id}`, 'DELETE /products (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 9. TEST REQUESTS (Demandes de services)
  // ─────────────────────────────────────────────
  console.log('📩 9. TEST DEMANDES');
  
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
      serviceId: requestService.id,
      description: 'Demande de test automatisé',
      priority: 'urgent',
      status: 'nouveau',
      notes: 'Test automatique'
    };
    const request = await testPost('/requests', requestData, 'POST /requests');
    
    if (request && request.id) {
      await testGet(`/requests/${request.id}`, 'GET /requests/:id');
      await testPut(`/requests/${request.id}`, { status: 'en_cours' }, 'PUT /requests/:id (en_cours)');
      await testPut(`/requests/${request.id}`, { status: 'traite' }, 'PUT /requests/:id (traite)');
      await testDelete(`/requests/${request.id}`, 'DELETE /requests/:id');
    }
    
    await testDelete(`/clients/${requestClient.id}`, 'DELETE /clients (nettoyage)');
    await testDelete(`/services/${requestService.id}`, 'DELETE /services (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 10. TEST QUOTES (Devis)
  // ─────────────────────────────────────────────
  console.log('📄 10. TEST DEVIS');
  
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
      requestId: null,
      items: [
        {
          type: 'service',
          id: quoteService.id,
          name: 'Service Devis',
          price: 500,
          qty: 1
        }
      ],
      status: 'brouillon',
      validUntil: '2026-08-15T00:00:00.000Z',
      notes: 'Devis de test'
    };
    const quote = await testPost('/quotes', quoteData, 'POST /quotes');
    
    if (quote && quote.id) {
      await testGet(`/quotes/${quote.id}`, 'GET /quotes/:id');
      await testPut(`/quotes/${quote.id}`, { status: 'envoye' }, 'PUT /quotes/:id (envoye)');
      await testPut(`/quotes/${quote.id}`, { status: 'accepte' }, 'PUT /quotes/:id (accepte)');
      await testDelete(`/quotes/${quote.id}`, 'DELETE /quotes/:id');
    }
    
    await testDelete(`/clients/${quoteClient.id}`, 'DELETE /clients (nettoyage)');
    await testDelete(`/services/${quoteService.id}`, 'DELETE /services (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 11. TEST EVENTS (Planning)
  // ─────────────────────────────────────────────
  console.log('📅 11. TEST ÉVÉNEMENTS');
  
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
      clientId: eventClient.id,
      serviceId: eventService.id,
      date: '2026-07-15T09:00:00.000Z',
      notes: 'Événement de test automatisé',
      status: 'planifie'
    };
    const event = await testPost('/events', eventData, 'POST /events');
    
    if (event && event.id) {
      await testGet(`/events/${event.id}`, 'GET /events/:id');
      await testPut(`/events/${event.id}`, { status: 'en_cours' }, 'PUT /events/:id (en_cours)');
      await testPut(`/events/${event.id}`, { status: 'termine' }, 'PUT /events/:id (termine)');
      await testDelete(`/events/${event.id}`, 'DELETE /events/:id');
    }
    
    await testDelete(`/clients/${eventClient.id}`, 'DELETE /clients (nettoyage)');
    await testDelete(`/services/${eventService.id}`, 'DELETE /services (nettoyage)');
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 12. SUMMARY
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
  }
  console.log('');
}

// ─────────────────────────────────────────────
// 🚀 EXÉCUTION
// ─────────────────────────────────────────────
runTests();