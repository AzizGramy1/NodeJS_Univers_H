const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

try {
  // 1. Essayer de charger le fichier local (développement)
  serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));
  console.log('✅ Clé de service chargée depuis le fichier');
} catch (error) {
  // 2. Si le fichier n'existe pas, utiliser la variable d'environnement (production)
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!envVar) {
    console.error('❌ ERREUR : Aucune clé de service Firebase trouvée !');
    console.error('   Soit placez serviceAccountKey.json à la racine,');
    console.error('   soit définissez la variable FIREBASE_SERVICE_ACCOUNT.');
    process.exit(1);
  }
  try {
    serviceAccount = JSON.parse(envVar);
    console.log('✅ Clé de service chargée depuis la variable d\'environnement');
  } catch (parseError) {
    console.error('❌ ERREUR : La variable FIREBASE_SERVICE_ACCOUNT n\'est pas un JSON valide.');
    process.exit(1);
  }
}

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };