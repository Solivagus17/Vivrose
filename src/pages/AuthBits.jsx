export function friendlyError(err) {
  const code = err && err.code;
  const map = {
    'auth/not-configured': 'Firebase is not configured. Replace the VITE_FIREBASE_API_KEY placeholder in the root .env file with your real credentials.',
    'auth/configuration-not-found': 'Authentication is not enabled in Firebase Console. Go to Firebase Console → Authentication → Get Started, then enable Email/Password and Google in Sign-in method.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'The sign-in window was closed. Try again.',
    'auth/popup-blocked': 'Pop-up was blocked by the browser. Allow pop-ups and try again.',
    'auth/account-exists-with-different-credential': 'An account already exists. Sign in with the same method you used before.',
    'auth/network-request-failed': 'Network error — check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment then try again.',
  };
  return map[code] || (err && err.message) || 'Something went wrong. Please try again.';
}

export function GoogleButton({ onClick, busy }) {
  return (
    <button type="button" className="btn btn-google" onClick={onClick} disabled={busy}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C38.6 35.7 44 30.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
      </svg>
      Continue with Google
    </button>
  );
}
