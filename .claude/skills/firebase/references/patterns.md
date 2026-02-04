# Firebase Patterns Reference

## Contents
- Authentication Patterns
- Firestore CRUD Patterns
- Error Handling Patterns
- Anti-Patterns to Avoid

---

## Authentication Patterns

### Auth State Observer

The project uses `onAuthStateChanged` as the single source of truth for auth state:

```javascript
// GOOD - Reactive auth state handling
firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showUserSection(user);
        loadApps();
    } else {
        currentUser = null;
        showLoginSection();
    }
});
```

### Google Sign-In with Popup

```javascript
// GOOD - Proper popup auth with error handling
document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        const result = await firebase.signInWithPopup(firebase.auth, firebase.provider);
        showStatus('Sign-in successful!', 'success');
    } catch (error) {
        // Handle specific error codes
        if (error.code === 'auth/popup-blocked') {
            showStatus('Popup blocked! Please allow popups.', 'error');
        }
    }
});
```

### Sign Out

```javascript
await firebase.signOut(firebase.auth);
```

---

## Firestore CRUD Patterns

### Read All Documents

```javascript
const querySnapshot = await firebase.getDocs(
    firebase.collection(firebase.db, 'apps')
);
const apps = [];
querySnapshot.forEach((doc) => {
    apps.push({ id: doc.id, ...doc.data() });
});
```

### Create/Update Document

Use document ID as the Firestore doc ID for predictable lookups:

```javascript
// GOOD - Document ID matches app ID
await firebase.setDoc(
    firebase.doc(firebase.db, 'apps', newApp.appId),
    {
        ...newApp,
        createdAt: new Date(),
        createdBy: currentUser.email
    }
);
```

### Update with Preserved Timestamps

```javascript
// GOOD - Preserve original metadata on update
await firebase.setDoc(firebase.doc(firebase.db, 'apps', existingApp.appId), {
    ...newApp,
    createdAt: existingApp.createdAt,
    createdBy: existingApp.createdBy,
    updatedAt: new Date(),
    updatedBy: currentUser.email
});
```

### Delete Document

```javascript
await firebase.deleteDoc(firebase.doc(firebase.db, 'apps', app.appId));
```

---

## Error Handling Patterns

### Comprehensive Error Mapping

```javascript
// GOOD - Map Firebase errors to user-friendly messages
try {
    const querySnapshot = await firebase.getDocs(/*...*/);
} catch (error) {
    if (error.code === 'unavailable') {
        showStatus('Network error. Check your connection.', 'error');
    } else if (error.code === 'permission-denied') {
        showStatus('Permission denied. Sign in as admin.', 'error');
    } else if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        showStatus('Blocked by ad blocker. Disable it.', 'error');
    } else {
        showStatus(`Failed: ${error.message}`, 'error');
    }
}
```

### Auth Error Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| `auth/popup-blocked` | Browser blocked popup | "Allow popups for this site" |
| `auth/popup-closed-by-user` | User closed popup | "Sign-in cancelled" |
| `auth/network-request-failed` | No network | "Check your connection" |
| `unavailable` | Firestore offline | "Network error" |
| `permission-denied` | Security rules blocked | "Sign in as admin" |

---

## Anti-Patterns to Avoid

### WARNING: Multiple Firebase Initializations

**The Problem:**

```javascript
// BAD - Initializing Firebase in multiple files
// file1.js
const app = initializeApp(firebaseConfig);
// file2.js
const app = initializeApp(firebaseConfig); // Error: duplicate app
```

**Why This Breaks:**
1. Firebase throws "duplicate-app" error on second init
2. Creates race conditions between modules
3. Wastes memory with duplicate SDK instances

**The Fix:**

```javascript
// GOOD - Single initialization, global export
// firebase-config.js (only file that calls initializeApp)
window.firebase = { app, db, auth, provider, ...methods };

// Other files just import
import './scripts/firebase-config.js';
// Use window.firebase.db, window.firebase.auth, etc.
```

### WARNING: Polling for Firebase Ready

**The Problem:**

```javascript
// BAD - Arbitrary timeout polling
if (!window.firebase) {
    await new Promise(resolve => setTimeout(resolve, 1000));
}
```

**Why This Breaks:**
1. 1000ms may not be enough on slow connections
2. Wastes time if Firebase loads faster
3. Silent failure if Firebase never loads

**The Fix:**

```javascript
// BETTER - Event-driven initialization
function waitForFirebase(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const check = () => {
            if (window.firebase?.db) return resolve(window.firebase);
            if ((Date.now() - start) > timeout) return reject(new Error('Firebase timeout'));
            requestAnimationFrame(check);
        };
        const start = Date.now();
        check();
    });
}
```

### WARNING: Ignoring Security Rules

**The Problem:**

```javascript
// BAD - Client-side validation only
if (newApp.name && newApp.url) {
    await firebase.setDoc(/*...*/);
}
```

**Why This Breaks:**
1. Client code can be bypassed via browser console
2. No protection against malicious input
3. Database can be corrupted

**The Fix:**

See `firebaseRules.txt` - Server-side security rules with schema validation:

```javascript
// Firestore rules enforce:
// - Required fields: appId, name, url, image, description
// - Field length limits
// - URL injection protection
// - Admin-only write access via UID check
```

### WARNING: Not Checking Auth Before Write

**The Problem:**

```javascript
// BAD - Write without auth check
async function addApp() {
    await firebase.setDoc(/*...*/);
}
```

**Why This Breaks:**
1. Security rules will reject the write
2. User sees cryptic "permission-denied" error
3. Poor UX

**The Fix:**

```javascript
// GOOD - Guard clause for auth
async function addApp() {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }
    await firebase.setDoc(/*...*/);
}