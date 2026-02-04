// Firebase Configuration
// 
// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or open existing)
// 3. Click the web icon (</>) to add a web app
// 4. Copy the firebaseConfig object Firebase gives you
// 5. Replace the placeholder values below with your actual Firebase config
//
// Your config will look like this but with real values:

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// TODO: Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDFN6LsmG0R_r12QQ0armGbsbzWdcW4VZ0",
  authDomain: "code-journey-blog.firebaseapp.com",
  projectId: "code-journey-blog",
  storageBucket: "code-journey-blog.firebasestorage.app",
  messagingSenderId: "520128438360",
  appId: "1:520128438360:web:e6ea0edce9bf8371462a2d",
  measurementId: "G-866CSV9DBG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Admin email configuration
// TODO: Replace with your actual admin email
const ADMIN_EMAIL = 'hilljamesconnor@gmail.com';

// Helper function to check if user is admin
function isAdmin(user) {
  return user && user.email === ADMIN_EMAIL;
}

export { app, db, auth, storage, isAdmin, ADMIN_EMAIL };
