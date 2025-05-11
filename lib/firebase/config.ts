import { initializeApp, getApps, getApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDb7V2EI7ws32qC6Yny6yCzTRxwTRUK8qc",
  authDomain: "tok-tak-by-ab.firebaseapp.com",
  databaseURL: "https://tok-tak-by-ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tok-tak-by-ab",
  storageBucket: "tok-tak-by-ab.appspot.com",
  messagingSenderId: "210261269424",
  appId: "1:210261269424:web:1300865fddf4a2fd00d475",
  measurementId: "G-4LPY69JQXB",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getDatabase(app)
const storage = getStorage(app)

export { app, db, storage }
