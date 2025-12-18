/**
 * Firebase Configuration and Initialization
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDAV-UbXtv1vRnhwfpB7sFNj2Obr8pzSsU",
  authDomain: "sitesage-auth.firebaseapp.com",
  projectId: "sitesage-auth",
  storageBucket: "sitesage-auth.firebasestorage.app",
  messagingSenderId: "885444572358",
  appId: "1:885444572358:web:b9149a25224f95126b53c7",
  measurementId: "G-D10LPNYRKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
