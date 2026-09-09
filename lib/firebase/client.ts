import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────
// Firebase config — PLACEHOLDER.
// Fill these from Firebase Console → Project settings → General → Your apps,
// then put the real values into `.env.local` (see `.env.local.example`).
// Do NOT hardcode secrets here; everything is read from NEXT_PUBLIC_* env vars
// because this config is safe to expose on the client (it is not a secret —
// access is controlled by Firestore/Storage security rules, not by hiding
// these values).
// ─────────────────────────────────────────────────────────────────────────
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
