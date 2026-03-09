import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

// ── Firebase Configuration ──────────────────────────────────────────
// Set these values from your Firebase Console → Project Settings
// https://console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Only initialize if config is present (skip in dev without Firebase)
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
const app = hasConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = app ? new GoogleAuthProvider() : null;

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    console.warn('Firebase not configured. Skipping auth.');
    return null;
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signUpWithEmail(email, password, displayName) {
  if (!auth) {
    console.warn('Firebase not configured. Skipping auth.');
    return null;
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result;
}

export async function signInWithEmail(email, password) {
  if (!auth) {
    console.warn('Firebase not configured. Skipping auth.');
    return null;
  }
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  if (!auth) return;
  return signOut(auth);
}

export function onAuthChange(callback) {
  if (!auth) {
    // No Firebase — auto-grant access (dev mode / Electron)
    callback({ uid: 'local', displayName: 'Local User', email: '', photoURL: '' });
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function isFirebaseConfigured() {
  return hasConfig;
}

export { auth };
