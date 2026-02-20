// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";

// Configuration depuis .env (via app.config.js extra ou process.env)
const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: extra.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: extra.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: extra.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: extra.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: extra.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Vérifier que la config est valide
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Configuration Firebase manquante. Vérifiez votre fichier .env');
}

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Storage (images plats)
export const storage = getStorage(app);

// Auth — optionnel (nécessite configuration native pour Chef/Caissière)
// Pour l'interface Client, Auth n'est pas nécessaire
let authInstance: ReturnType<typeof getAuth> | null = null;
try {
  authInstance = getAuth(app);
} catch (error) {
  console.warn('Firebase Auth non disponible (normal pour interface Client):', error);
}

export const auth = authInstance;

export default app;
