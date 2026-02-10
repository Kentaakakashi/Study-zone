
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
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

  // 🔐 AUTO REDIRECT
  onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes("index")) {
      window.location.href = "dashboard.html";
    }
    if (!user && window.location.pathname.includes("dashboard")) {
      window.location.href = "index.html";
    }
  });

  // 📧 EMAIL LOGIN
  window.login = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .catch(err => alert(err.message));
  };

  // 🆕 SIGN UP
  window.signup = () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .catch(err => alert(err.message));
  };

  // 🔴 LOGOUT
  window.logout = () => {
    signOut(auth);
  };

  // 🔵 GOOGLE LOGIN
  window.googleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .catch(err => alert(err.message));
  };
</script>
