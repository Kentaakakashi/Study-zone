import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQZ36IQVFEm-rqyD0WlPO23Sf8Lih5Fo8",
  authDomain: "study-zone-438c4.firebaseapp.com",
  projectId: "study-zone-438c4",
  storageBucket: "study-zone-438c4.firebasestorage.app",
  messagingSenderId: "320895535749",
  appId: "1:320895535749:web:cab35a214ef7c22ae2f7ec"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");

// SIGN UP
signupBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Account created 🔥"))
    .catch(err => alert(err.message));
});

// LOGIN
loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("Logged in 😤"))
    .catch(err => alert(err.message));
});
