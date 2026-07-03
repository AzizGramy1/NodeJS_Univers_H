// test-complet.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const FIREBASE_API_KEY = 'AIzaSyBn_eRdxrPgL3SF7Dskz4qYfagYCg4KJXg';
const EMAIL = 'azizg7266@gmail.com';
const PASSWORD = 'AzizAziz1@*123';

async function getFirebaseToken() {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email: EMAIL,
        password: PASSWORD,
        returnSecureToken: true
      }
    );
    return response.data.idToken;
  } catch (error) {
    // Si l'utilisateur n'existe pas, on le crée
    if (error.response?.data?.error?.message === 'EMAIL_NOT_FOUND') {
      console.log('👤 Utilisateur introuvable, création en cours...');
      try {
        const signUpResponse = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
          {
            email: EMAIL,
            password: PASSWORD,
            returnSecureToken: true
          }
        );
        console.log('✅ Utilisateur créé avec succès !');
        return signUpResponse.data.idToken;
      } catch (signUpError) {
        console.error('❌ Erreur lors de la création de l\'utilisateur:', signUpError.response?.data || signUpError.message);
        return null;
      }
    }
    console.error('❌ Erreur lors de la récupération du token:', error.response?.data || error.message);
    return null;
  }
}

async function testAPI() {
  console.log('🚀 Début des tests...\n');

  const TOKEN = await getFirebaseToken();
  
  if (!TOKEN) {
    console.error('❌ Impossible de continuer sans token');
    return;
  }
  
  console.log('✅ Token obtenu avec succès\n');

  try {
    // Test Ping
    console.log('📡 Test Ping...');
    const ping = await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Ping réussi:', ping.data.message, '\n');

    // Créer un produit
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
    
    const product = await axios.post(
      `${BASE_URL}/products`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const productId = product.data.data.id;
    console.log(`✅ Produit créé avec l'ID: ${productId}\n`);

    // Récupérer les produits
    console.log('📋 Récupération des produits...');
    const products = await axios.get(`${BASE_URL}/products`);
    console.log(`✅ ${products.data.data.length} produit(s) trouvé(s)\n`);

    // Supprimer le produit
    console.log('🗑️ Suppression du produit...');
    await axios.delete(
      `${BASE_URL}/products/${productId}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log('✅ Produit supprimé\n');

    console.log('🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:');
    if (error.response) {
      console.error('  Statut:', error.response.status);
      console.error('  Données:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Erreur:', error.message);
    }
  }
}

testAPI();