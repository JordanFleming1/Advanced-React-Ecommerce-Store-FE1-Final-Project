// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Custom Firebase SDK configuration for the e-commerce application
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVrqsVqGPXn42dGJK7sh5YkZSBNBr5bXc",
  authDomain: "advanced-ecommerce-app-7a565.firebaseapp.com",
  projectId: "advanced-ecommerce-app-7a565",
  storageBucket: "advanced-ecommerce-app-7a565.firebasestorage.app",
  messagingSenderId: "818642367051",
  appId: "1:818642367051:web:b2e6a1b2e25c1621dc93ce",
  measurementId: "G-N5W4XCECT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Analytics
const analytics = getAnalytics(app);

// Export auth and db
export { auth, db, app, analytics };