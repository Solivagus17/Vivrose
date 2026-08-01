import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isRealKey = (key) => Boolean(key && !key.includes('EXAMPLE') && !key.includes('your-api-key'));
const hasConfig = Boolean(isRealKey(config.apiKey) && config.authDomain && config.projectId);

// Only initialize in the browser; guards SSR (smoke test) and missing config.
const firebaseReady = typeof window !== 'undefined' && hasConfig;

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(config)) : null;

export const auth = firebaseReady ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
