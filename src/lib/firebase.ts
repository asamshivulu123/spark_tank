// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "pitch-perfect-ai-qpv8g",
  "appId": "1:1085682239512:web:2893c9f3cd1a2c00ce9b6d",
  "storageBucket": "pitch-perfect-ai-qpv8g.firebasestorage.app",
  "apiKey": "AIzaSyDvqwGQ6VRplmyLiTZ8_M6RvXROs8BLPa8",
  "authDomain": "pitch-perfect-ai-qpv8g.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1085682239512"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };