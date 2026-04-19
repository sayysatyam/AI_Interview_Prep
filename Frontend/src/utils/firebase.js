import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"
import dotenv from "dotenv"
dotenv.require('config');
const firebaseConfig = {
  apiKey: import.meta.env.FIRBASE_APIKEY,
  authDomain: "aiinterviewprep-7cb02.firebaseapp.com",
  projectId: "aiinterviewprep-7cb02",
  storageBucket: "aiinterviewprep-7cb02.firebasestorage.app",
  messagingSenderId: "353935837252",
  appId: "1:353935837252:web:26265f5aaf4c96e2275411",
  measurementId: "G-LH261YRTXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

export {auth,provider};