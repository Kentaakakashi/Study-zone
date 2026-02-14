// Check if we're on the login page
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const showLoginContainer = document.getElementById('showLoginContainer');
    const googleLogin = document.getElementById('googleLogin');

    // Toggle between login and signup
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        showSignup.closest('p').classList.add('hidden');
        showLoginContainer.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        showLoginContainer.classList.add('hidden');
        showSignup.closest('p').classList.remove('hidden');
    });

    // Email/Password Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('Login successful:', userCredential.user);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });

    // Email/Password Signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update profile with name
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Create user document in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalStudyTime: 0,
                streak: 0,
                lastStudyDate: null
            });
            
            console.log('Signup successful:', userCredential.user);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed: ' + error.message);
        }
    });

    // Google Login
    googleLogin.addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            // Check if user document exists, create if not
            const userDoc = await db.collection('users').doc(result.user.uid).get();
            if (!userDoc.exists) {
                await db.collection('users').doc(result.user.uid).set({
                    name: result.user.displayName,
                    email: result.user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    totalStudyTime: 0,
                    streak: 0,
                    lastStudyDate: null
                });
            }
            
            console.log('Google login successful:', result.user);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google login failed: ' + error.message);
        }
    });

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            // If user is logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    });
}
