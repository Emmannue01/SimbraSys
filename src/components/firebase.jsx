// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCotTsGec4oVY7EoZDXGJqynxqmjC5MJLk",
  authDomain: "simbrasys-3aaec.firebaseapp.com",
  projectId: "simbrasys-3aaec",
  storageBucket: "simbrasys-3aaec.firebasestorage.app",
  messagingSenderId: "809241685905",
  appId: "1:809241685905:web:30931f1210e132e07bf430",
  measurementId: "G-GBGPL57MJ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

export { db, auth, rtdb, storage };
export default app;