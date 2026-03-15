import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_vXjWESW4up2abDk-Oq-o20a82r3ENUI",
  authDomain: "linkshare-jobportal.firebaseapp.com",
  databaseURL: "https://linkshare-jobportal-default-rtdb.firebaseio.com",
  projectId: "linkshare-jobportal",
  storageBucket: "linkshare-jobportal.firebasestorage.app",
  messagingSenderId: "727127132506",
  appId: "1:727127132506:web:35da417bef7c0d2ac08b63",
  measurementId: "G-QPM7BB0YKE"
};

const app = initializeApp(firebaseConfig);
export const db  = getDatabase(app);
export const auth = getAuth(app);
