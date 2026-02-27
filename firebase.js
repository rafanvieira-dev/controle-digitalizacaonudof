import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "controledigitalizacaodoc.firebaseapp.com",
  projectId: "controledigitalizacaodoc",
  storageBucket: "controledigitalizacaodoc.appspot.com",
  messagingSenderId: "1057595169300",
  appId: "1:1057595169300:web:86c34690b376b2649da501"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
