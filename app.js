import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

let startTime;

document.getElementById("signup").onclick = () => {
  const email = email.value;
  const password = password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Account created 🔥"))
    .catch(err => alert(err.message));
};

document.getElementById("login").onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .catch(err => alert(err.message));
};

onAuthStateChanged(auth, user => {
  if (user) {
    auth.style.display = "none";
    dashboard.style.display = "block";
  }
});

document.getElementById("start").onclick = () => {
  startTime = Date.now();
};

document.getElementById("stop").onclick = () => {
  const mins = Math.floor((Date.now() - startTime) / 60000);
  document.getElementById("time").innerText = `${mins} mins studied`;
};
