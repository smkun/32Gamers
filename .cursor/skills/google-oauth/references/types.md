# Google OAuth Types Reference

## Contents
- Firebase User Object
- Auth Error Codes
- GoogleAuthProvider Configuration
- Auth State Callback Types

---

## Firebase User Object

The `user` object returned by `onAuthStateChanged` and `signInWithPopup`:

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `uid` | `string` | Unique user ID (use in Firestore rules) | `'9mbW4MTdXSMvGdlgUIJu5DOWMZW2'` |
| `email` | `string \| null` | Google account email | `'scottkunian@gmail.com'` |
| `displayName` | `string \| null` | User's full name | `'Scott Kunian'` |
| `photoURL` | `string \| null` | Profile picture URL | `'https://lh3.googleusercontent.com/...'` |
| `emailVerified` | `boolean` | Always `true` for Google accounts | `true` |
| `isAnonymous` | `boolean` | Always `false` for Google sign-in | `false` |
| `metadata` | `UserMetadata` | Creation/sign-in timestamps | See below |

### User Metadata

```javascript
user.metadata = {
    creationTime: "Tue, 03 Dec 2024 15:30:00 GMT",
    lastSignInTime: "Wed, 04 Feb 2026 10:15:00 GMT"
}
```

### Safe Property Access

```javascript
// GOOD - Defensive property access
function showUserSection(user) {
    document.getElementById('userAvatar').src = user.photoURL || '';
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('userEmail').textContent = user.email || '';
}
```

```javascript
// BAD - Assuming properties exist
function showUserSection(user) {
    document.getElementById('userAvatar').src = user.photoURL;  // May be null
    document.getElementById('userName').textContent = user.displayName;  // May be null
}
```

---

## Auth Error Codes

Common error codes from `signInWithPopup`:

| Code | Cause | User Message |
|------|-------|--------------|
| `auth/popup-blocked` | Browser blocked popup | "Please allow popups for this site" |
| `auth/popup-closed-by-user` | User closed popup without signing in | "Sign-in cancelled" |
| `auth/network-request-failed` | Network connectivity issue | "Check your connection" |
| `auth/cancelled-popup-request` | Multiple popups opened | Close other popups |
| `auth/unauthorized-domain` | Domain not in Firebase Auth settings | Add domain to authorized list |
| `auth/user-disabled` | Account disabled in Firebase Console | Contact admin |

### Error Object Structure

```javascript
error = {
    code: 'auth/popup-blocked',
    message: 'Unable to establish a connection with the popup...',
    name: 'FirebaseError'
}
```

---

## GoogleAuthProvider Configuration

Default configuration used in this project:

```javascript
import { GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const provider = new GoogleAuthProvider();

// Optional: Request additional scopes (not used in this project)
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

// Optional: Custom parameters
// provider.setCustomParameters({ prompt: 'select_account' });
```

### Forcing Account Selection

```javascript
// Force account picker even if already signed in
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account'
});
```

---

## Auth State Callback Types

The `onAuthStateChanged` callback signature:

```javascript
// Callback receives User | null
firebase.auth.onAuthStateChanged((user) => {
    // user is Firebase User object when authenticated
    // user is null when signed out
});

// Returns unsubscribe function
const unsubscribe = firebase.auth.onAuthStateChanged((user) => {
    // Handle state change
});

// Clean up listener when no longer needed
unsubscribe();
```

### UserCredential from signInWithPopup

```javascript
const result = await firebase.signInWithPopup(auth, provider);

result = {
    user: User,                    // Firebase User object
    providerId: 'google.com',
    operationType: 'signIn',
    credential: OAuthCredential    // Contains access token
}

// Access Google OAuth token if needed
const credential = GoogleAuthProvider.credentialFromResult(result);
const token = credential.accessToken;
```