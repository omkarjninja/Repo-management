// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk0vBQ7StVHlN8UioFoKKf1fbm34C2Tmc",
  authDomain: "shivam-4dc1b.firebaseapp.com",
  projectId: "shivam-4dc1b",
  storageBucket: "shivam-4dc1b.firebasestorage.app",
  messagingSenderId: "6760309485",
  appId: "1:6760309485:web:337d9eb6b3a47669a1a2e4"
};

// Initialize Firebase
//Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;