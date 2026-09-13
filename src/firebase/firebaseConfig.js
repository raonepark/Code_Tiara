import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBfAmF7ElAn5bVrvi4HPWAU0wY3uYdQPN8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "code-tiara.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "code-tiara",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "code-tiara.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1034295696275",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1034295696275:web:84d043fd86faa6d98c6666"
};

// Check if keys are properly configured
const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

if (!isConfigured) {
  console.warn(
    "Firebase is not configured yet. Please update the .env file with your Firebase credentials."
  );
}

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    const isPopout = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('popout');
    if (!isPopout) {
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    }
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

export { 
  auth, 
  db, 
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  isConfigured,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
};
