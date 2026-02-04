---
name: firebase
description: |
  Configures Firebase SDK, authentication, Firestore database operations, and real-time data synchronization for the 32Gamers portal.
  Use when: initializing Firebase, implementing Google OAuth login, performing Firestore CRUD operations, managing auth state, or debugging Firebase connectivity issues.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs, mcp__chrome-devtools__list_console_messages, mcp__chrome-devtools__list_network_requests, mcp__chrome-devtools__evaluate_script
---

# Firebase Skill

This project uses Firebase v10.7.1 via CDN with client-side SDK for a serverless static architecture. Firebase Auth handles Google OAuth, and Cloud Firestore stores the app catalog. All Firebase operations happen client-side with security rules enforcing access control.

## Quick Start

### Firebase Initialization

```javascript
// scripts/firebase-config.js - Single source of truth
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Expose globally for cross-script access
window.firebase = { app, db, auth, provider, signInWithPopup, GoogleAuthProvider, signOut, collection, getDocs, doc, setDoc, deleteDoc };
```

### Reading from Firestore

```javascript
const querySnapshot = await window.firebase.getDocs(
    window.firebase.collection(window.firebase.db, 'apps')
);
querySnapshot.forEach((doc) => {
    const app = doc.data();
    // Process each document
});
```

### Writing to Firestore

```javascript
await firebase.setDoc(
    firebase.doc(firebase.db, 'apps', newApp.appId),
    newApp
);
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| CDN Import | Load Firebase modules via ES6 imports | `import { getFirestore } from 'https://www.gstatic.com/...'` |
| Global Object | Cross-script access pattern | `window.firebase.db` |
| Auth State | Listen for login/logout | `firebase.auth.onAuthStateChanged()` |
| Document Reference | Target specific documents | `firebase.doc(db, 'apps', appId)` |
| Collection Reference | Query entire collections | `firebase.collection(db, 'apps')` |

## Common Patterns

### Wait for Firebase Ready

```javascript
if (!window.firebase || !window.firebase.db) {
    await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Handle Auth Errors

```javascript
if (error.code === 'auth/popup-blocked') {
    showStatus('Please allow popups for this site');
} else if (error.code === 'auth/popup-closed-by-user') {
    showStatus('Sign-in cancelled');
}
```

## See Also

- [patterns](references/patterns.md) - Authentication, Firestore CRUD, error handling
- [workflows](references/workflows.md) - Setup, deployment, debugging

## Related Skills

- **google-oauth** skill for authentication flow details
- **firestore** skill for database schema and security rules
- **vanilla-javascript** skill for DOM manipulation patterns

## Documentation Resources

> Fetch latest Firebase documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "firebase"
2. Prefer website documentation (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "firebase web sdk initialization"
- "firestore getDocs collection"
- "firebase auth google sign in popup"
- "firestore security rules"