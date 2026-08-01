import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';
import { apiGet, clearToken, setToken } from './api.js';
import { refreshAllStores, resetAllStores } from './storeUtils.js';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  firebaseReady: false,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

/** Guard: throw a clear error when Firebase is not configured. */
function assertFirebase() {
  if (!auth) {
    throw Object.assign(
      new Error(
        'Firebase is not configured. Open the root .env file and replace the ' +
        'VITE_FIREBASE_API_KEY placeholder with your real Firebase web app credentials.'
      ),
      { code: 'auth/not-configured' }
    );
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // firebaseReady lets the UI show a config warning banner when credentials are missing
  const firebaseReady = Boolean(auth);

  useEffect(() => {
    const initDev = async () => {
      const devUser = { uid: 'dev-user-123', email: 'dev@vivrose.local', displayName: 'Arjun Mehta' };
      setUser(devUser);
      setToken('dev-token-user');
      try {
        const me = await apiGet('/api/auth/me');
        setProfile(me.user);
      } catch {
        setProfile({ id: devUser.uid, name: devUser.displayName, email: devUser.email });
      } finally {
        refreshAllStores();
        setLoading(false);
      }
    };

    if (!auth) {
      initDev();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        initDev();
        return;
      }
      setUser(firebaseUser);
      try {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        const me = await apiGet('/api/auth/me');
        setProfile(me.user);
        refreshAllStores();
      } catch {
        setProfile({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
        });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);


  const signIn = async (email, password) => {
    assertFirebase();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name, email, password) => {
    assertFirebase();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
  };

  const signInWithGoogle = async () => {
    assertFirebase();
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {
        /* ignore */
      }
    }
    clearToken();
    resetAllStores();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, firebaseReady, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
