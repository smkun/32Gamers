// Firebase Configuration
// Replace with your Firebase project config from Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyDnWNyXba8hwkt9tOTVfqKUcPOutW0OYyk",
    authDomain: "gamersadmin-f1657.firebaseapp.com",
    projectId: "gamersadmin-f1657",
    storageBucket: "gamersadmin-f1657.firebasestorage.app",
    messagingSenderId: "539359464815",
    appId: "1:539359464815:web:08765f5a334a7ab1eeec9a",
    measurementId: "G-CMGT3Y2CBX"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.firebase = { app, db, auth, provider, signInWithPopup, GoogleAuthProvider, signOut, collection, getDocs, doc, setDoc, deleteDoc };