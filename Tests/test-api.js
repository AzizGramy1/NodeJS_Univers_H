const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function test() {
  console.log('🚀 Début des tests...');

  try {
    // 1. Test ping
    console.log('📡 Test Ping...');
    const ping = await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Ping réussi:', ping.data);

    // 2. Créer un produit
    console.log('📦 Création d\'un produit...');
    const productData = {
      name: 'Produit Test Auto',
      cat: 'desinfection',
      emoji: '🧪',
      price: 29.99,
      stock: 10,
      threshold: 5,
      active: true
    };
    const product = await axios.post(`${BASE_URL}/products`, productData);
    const productId = product.data.data.id;
    console.log('✅ Produit créé avec l\'ID:', productId);

    // 3. Récupérer tous les produits
    console.log('📋 Récupération des produits...');
    const products = await axios.get(`${BASE_URL}/products`);
    console.log(`✅ ${products.data.data.length} produit(s) trouvé(s)`);

    // 4. Récupérer un produit par ID
    console.log('🔍 Récupération du produit par ID...');
    const singleProduct = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log('✅ Produit récupéré:', singleProduct.data.data.name);

    // 5. Mettre à jour le produit
    console.log('✏️ Mise à jour du produit...');
    await axios.put(`${BASE_URL}/products/${productId}`, {
      price: 39.99,
      stock: 20
    });
    console.log('✅ Produit mis à jour');

    // 6. Supprimer le produit
    console.log('🗑️ Suppression du produit...');
    await axios.delete(`${BASE_URL}/products/${productId}`);
    console.log('✅ Produit supprimé');

    console.log('🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:');
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('  Statut:', error.response.status);
      console.error('  Données:', JSON.stringify(error.response.data, null, 2));
      console.error('  Headers:', error.response.headers);
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('  Aucune réponse du serveur. Vérifiez que le serveur tourne sur le port 5000.');
      console.error('  Erreur:', error.message);
    } else {
      // Erreur dans la configuration de la requête
      console.error('  Erreur:', error.message);
    }
  }
}

test();