import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Retrieve configuration from Vite environment variables or localStorage override
export function getFirebaseConfig(): FirebaseConfigParams | null {
  // Check localStorage first (allows setting via in-app dialog)
  try {
    const saved = localStorage.getItem('garbagemedia_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Check Vite .env variables
  const env = import.meta.env;
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveLocalFirebaseConfig(config: FirebaseConfigParams) {
  localStorage.setItem('garbagemedia_firebase_config', JSON.stringify(config));
}

export function clearLocalFirebaseConfig() {
  localStorage.removeItem('garbagemedia_firebase_config');
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
const googleProvider = new GoogleAuthProvider();

const config = getFirebaseConfig();

if (config && config.apiKey && !config.apiKey.includes('YOUR_')) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('Firebase initialization error:', err);
  }
}

export const isFirebaseConfigured = Boolean(app && auth && db);

export { app, auth, db, storage, googleProvider };

