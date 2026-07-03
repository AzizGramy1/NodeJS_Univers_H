// seed-users.js
const axios = require('axios');
const { db } = require('./config/firebase');

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────

// 🔑 Votre clé API Firebase
const FIREBASE_API_KEY = 'AIzaSyBn_eRdxrPgL3SF7Dskz4qYfagYCg4KJXg';

// ─────────────────────────────────────────────
// DONNÉES DES UTILISATEURS
// ─────────────────────────────────────────────

const USERS = [
  {
    name: 'Sami Belhadj',
    email: 'admin@univershygiene.tn',
    password: 'admin123',
    role: 'admin',
    phone: '+216 71 000 001',
    avatar: 'SB',
    active: true,
    preferences: {
      notifications: { email: true, sms: true },
      theme: 'light'
    }
  },
  {
    name: 'Leila Khelil',
    email: 'manager@univershygiene.tn',
    password: 'manager123',
    role: 'manager',
    phone: '+216 71 000 002',
    avatar: 'LK',
    active: true,
    preferences: {
      notifications: { email: true, sms: false },
      theme: 'light'
    }
  },
  {
    name: 'Karim Gharbi',
    email: 'viewer@univershygiene.tn',
    password: 'viewer123',
    role: 'viewer',
    phone: '+216 71 000 003',
    avatar: 'KG',
    active: true,
    preferences: {
      notifications: { email: false, sms: false },
      theme: 'dark'
    }
  },
  {
    name: 'Nadia Bouazizi',
    email: 'nadia.bouazizi@gmail.com',
    password: 'password123',
    role: 'viewer',
    phone: '+216 54 789 012',
    avatar: 'NB',
    active: true,
    preferences: {
      notifications: { email: true, sms: false },
      theme: 'light'
    }
  },
  {
    name: 'Walid Mejri',
    email: 'walid.mejri@gmail.com',
    password: 'password123',
    role: 'viewer',
    phone: '+216 96 333 777',
    avatar: 'WM',
    active: true,
    preferences: {
      notifications: { email: false, sms: true },
      theme: 'light'
    }
  }
];

// ─────────────────────────────────────────────
// FONCTIONS
// ─────────────────────────────────────────────

async function createFirebaseUser(email, password) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    );
    return response.data.localId; // Firebase UID
  } catch (error) {
    // Si l'utilisateur existe déjà, on essaie de le récupérer
    if (error.response?.data?.error?.message === 'EMAIL_EXISTS') {
      console.log(`  ⚠️ L'utilisateur ${email} existe déjà dans Firebase Auth`);
      try {
        // Essayer de se connecter pour récupérer l'UID
        const loginResponse = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
          {
            email: email,
            password: password,
            returnSecureToken: true
          }
        );
        return loginResponse.data.localId;
      } catch (loginError) {
        console.log(`  ❌ Impossible de récupérer l'UID pour ${email}`);
        return null;
      }
    }
    console.error(`  ❌ Erreur création Firebase Auth pour ${email}:`, error.response?.data?.error?.message || error.message);
    return null;
  }
}

async function createFirestoreUser(userData, firebaseUid) {
  try {
    const docRef = db.collection('users').doc(firebaseUid);
    await docRef.set({
      ...userData,
      firebaseUid: firebaseUid,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    });
    return true;
  } catch (error) {
    console.error(`  ❌ Erreur création Firestore pour ${userData.email}:`, error.message);
    return false;
  }
}

async function checkUserExists(email) {
  try {
    const snapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    return !snapshot.empty;
  } catch (error) {
    return false;
  }
}

async function seedUsers() {
  console.log('\n👤 SEED DES UTILISATEURS\n');
  console.log('═'.repeat(60));

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of USERS) {
    console.log(`\n📧 Traitement de ${user.email}...`);

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const exists = await checkUserExists(user.email);
    if (exists) {
      console.log(`  ⏭️  L'utilisateur ${user.email} existe déjà dans Firestore`);
      skipped++;
      continue;
    }

    // Créer l'utilisateur dans Firebase Auth
    const firebaseUid = await createFirebaseUser(user.email, user.password);
    if (!firebaseUid) {
      failed++;
      continue;
    }

    // Créer l'utilisateur dans Firestore
    const userData = { ...user };
    delete userData.password; // Ne pas stocker le mot de passe en clair
    const success = await createFirestoreUser(userData, firebaseUid);
    
    if (success) {
      console.log(`  ✅ Utilisateur ${user.email} créé avec succès (UID: ${firebaseUid})`);
      created++;
    } else {
      failed++;
    }
  }

  // ─────────────────────────────────────────────
  // RÉSULTATS
  // ─────────────────────────────────────────────

  console.log('\n═'.repeat(60));
  console.log('\n📊 RÉSULTATS DU SEED DES UTILISATEURS');
  console.log(`  ✅ Créés : ${created}`);
  console.log(`  ⏭️  Existants : ${skipped}`);
  console.log(`  ❌ Échoués : ${failed}`);
  console.log(`  📝 Total : ${USERS.length}`);

  if (created > 0) {
    console.log('\n🔑 IDENTIFIANTS DE CONNEXION :');
    console.log('  ─────────────────────────────────────');
    for (const user of USERS) {
      if (user.email && user.password) {
        console.log(`  📧 ${user.email}`);
        console.log(`  🔑 ${user.password}`);
        console.log(`  👤 Rôle : ${user.role}`);
        console.log('  ─────────────────────────────────────');
      }
    }
  }

  console.log('\n📌 Vérifiez les collections dans la console Firebase Firestore.');
  console.log('   Collection : users\n');
}

// ─────────────────────────────────────────────
// EXÉCUTION
// ─────────────────────────────────────────────

seedUsers();