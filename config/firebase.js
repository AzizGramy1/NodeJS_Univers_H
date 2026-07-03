// config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
  serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));
  console.log('✅ Clé de service chargée depuis le fichier');
} catch (error) {
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!envVar) {
    console.error('❌ ERREUR : Aucune clé de service Firebase trouvée !');
    process.exit(1);
  }
  serviceAccount = JSON.parse(envVar);
  console.log('✅ Clé de service chargée depuis la variable d\'environnement');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// ✅ Exporter admin pour l'utiliser dans les modèles
module.exports = { admin, db, auth };