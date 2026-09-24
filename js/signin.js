/* Uses the same Firebase project and UID-based dashboard routing as the iPhone app. */
(() => {
    firebase.initializeApp(FIREBASE_CONFIG);
    const auth = firebase.auth();
    const signinBtn = document.getElementById('btn-signin');
    const googleBtn = document.getElementById('btn-google');
    const googleLabel = document.getElementById('google-label');
    const errorEl = document.getElementById('error-msg');
    let busy = false;

    function route(user) {
        window.location.href = isAdmin(user.uid) ? '/admin.html' : '/dashboard.html';
    }
    auth.onAuthStateChanged(user => { if (user) route(user); });

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
    function setBusy(method) {
        busy = Boolean(method);
        signinBtn.disabled = busy;
        googleBtn.disabled = busy;
        signinBtn.setAttribute('aria-busy', String(method === 'email'));
        googleBtn.setAttribute('aria-busy', String(method === 'google'));
        signinBtn.textContent = method === 'email' ? 'Signing in…' : 'Sign In';
        googleLabel.textContent = method === 'google' ? 'Connecting to Google…' : 'Sign in with Google';
    }
    function clearError() {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
    }
    function messageFor(error) {
        const messages = {
            'auth/user-not-found': 'Incorrect email or password.',
            'auth/wrong-password': 'Incorrect email or password.',
            'auth/invalid-credential': 'Incorrect email or password.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account is unavailable. Contact admin@lotara.app for help.',
            'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
            'auth/network-request-failed': 'Check your internet connection and try again.',
            'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups for this site, then try again.',
            'auth/unauthorized-domain': 'Sign-in is unavailable on this address. Please use lotara.app or contact admin@lotara.app.',
            'auth/operation-not-allowed': 'This sign-in option is temporarily unavailable. Try email and password, or contact admin@lotara.app.',
            'auth/account-exists-with-different-credential': 'This email already uses a different sign-in method. Use your existing email and password, or contact admin@lotara.app for help accessing that account.'
        };
        return messages[error.code] || 'Sign-in failed. Please try again.';
    }

    signinBtn.addEventListener('click', async () => {
        if (busy) return;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        clearError();
        if (!email || !password) { showError('Please enter your email and password.'); return; }
        setBusy('email');
        try {
            const credential = await auth.signInWithEmailAndPassword(email, password);
            route(credential.user);
        } catch (error) {
            showError(messageFor(error));
        } finally {
            setBusy(null);
        }
    });

    googleBtn.addEventListener('click', async () => {
        if (busy) return;
        clearError();
        setBusy('google');
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({prompt: 'select_account'});
        try {
            // Start immediately within the user click so browsers can open the OAuth window.
            const credential = await auth.signInWithPopup(provider);
            route(credential.user);
        } catch (error) {
            if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) {
                showError(messageFor(error));
            }
        } finally {
            setBusy(null);
        }
    });
    document.getElementById('email').addEventListener('keydown', event => {
        if (event.key === 'Enter') document.getElementById('password').focus();
    });
    document.getElementById('password').addEventListener('keydown', event => {
        if (event.key === 'Enter') signinBtn.click();
    });
})();
