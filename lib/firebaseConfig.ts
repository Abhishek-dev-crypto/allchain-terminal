import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

/* ---------------- CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBKHqrZIGMn1_oMRbHn-0rYkGT-dV24F1U",
  authDomain: "allchain-mvp.firebaseapp.com",
  projectId: "allchain-mvp",
  storageBucket: "allchain-mvp.firebasestorage.app",
  messagingSenderId: "407708201539",
  appId: "1:407708201539:web:cdae1b6ce80c67826c1af6",
  measurementId: "G-W3ERYPVTN7"
};

/* ---------------- INIT ---------------- */
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

/* ---------------- SERVICES ---------------- */
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

/* ---------------- OFFLINE CACHE ---------------- */
enableIndexedDbPersistence(db).catch(() => {
  console.log("Persistence disabled (multi-tab)");
});

export default app;