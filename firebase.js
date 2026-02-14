// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQZ36IQVFEm-rqyD0WlPO23Sf8Lih5Fo8",
    authDomain: "study-zone-438c4.firebaseapp.com",
    projectId: "study-zone-438c4",
    storageBucket: "study-zone-438c4.firebasestorage.app",
    messagingSenderId: "320895535749",
    appId: "1:320895535749:web:cab35a214ef7c22ae2f7ec",
    measurementId: "G-3709MF7LGL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable persistence (optional)
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence disabled');
        } else if (err.code == 'unimplemented') {
            console.log('Browser doesn\'t support persistence');
        }
    });
