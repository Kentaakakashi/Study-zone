import { auth, db } from "./firebase.js";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const userName = document.getElementById("userName");
const timerDisplay = document.getElementById("timer");

let time = 25 * 60;
let interval = null;
let currentUser = null;

const provider = new GoogleAuthProvider();

loginBtn.onclick = () => {
  signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    userName.innerText = "Logged in as " + user.displayName;
    loginBtn.style.display = "none";
  }
});

document.getElementById("startBtn").onclick = () => {
  if (!currentUser) return alert("Login first");

  if (interval) return;

  interval = setInterval(() => {
    time--;
    updateTimer();
    if (time <= 0) stopTimer();
  }, 1000);
};

document.getElementById("stopBtn").onclick = stopTimer;

function updateTimer() {
  const m = Math.floor(time / 60);
  const s = time % 60;
  timerDisplay.innerText = `${m}:${s.toString().padStart(2,"0")}`;
}

async function stopTimer() {
  clearInterval(interval);
  interval = null;

  const studiedMinutes = Math.round((25 * 60 - time) / 60);

  if (currentUser && studiedMinutes > 0) {
    await setDoc(doc(db, "studyTime", currentUser.uid), {
      minutes: studiedMinutes,
      updatedAt: new Date()
    });
    alert("Saved " + studiedMinutes + " minutes 🎉");
  }

  time = 25 * 60;
  updateTimer();
}
