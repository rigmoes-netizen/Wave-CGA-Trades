import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxndmrecl_E4A9iBpNg00Ri3hOB3BeJoA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0771910459.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0771910459",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0771910459.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "901697091601",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:901697091601:web:c2f6da71c04699f2dcd9b0"
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-d25a6b00-1ccc-4855-95cf-02a26b260224";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
