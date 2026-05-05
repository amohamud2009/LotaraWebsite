// Shared auth helpers — admin UID lives only here
const ADMIN_UID = "sXCGEu5cddUpSwlZHjd3Owhtl3q2";

function isAdmin(uid) {
    return uid === ADMIN_UID;
}

// Redirect if not signed in; call in dashboard/admin pages
function requireAuth(redirectUrl) {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = redirectUrl || '/signin.html';
            } else {
                resolve(user);
            }
        });
    });
}

// Redirect if not admin; call in admin page
function requireAdmin() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = '/signin.html';
            } else if (!isAdmin(user.uid)) {
                window.location.href = '/dashboard.html';
            } else {
                resolve(user);
            }
        });
    });
}
