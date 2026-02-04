# Google OAuth Modules Reference

## Contents
- Module Architecture
- Firebase Config Module
- Admin Panel Module
- Global Object Pattern
- Import Structure

---

## Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     firebase-admin.html                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <script type="module">                               │  │
│  │    import './scripts/firebase-config.js'              │  │
│  │    // Auth logic, event handlers, CRUD operations     │  │
│  │  </script>                                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  scripts/firebase-config.js                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  // Firebase SDK imports from CDN                     │  │
│  │  import { initializeApp } from 'firebase-app.js'      │  │
│  │  import { getAuth, ... } from 'firebase-auth.js'      │  │
│  │  import { getFirestore, ... } from 'firebase-firestore.js' │
│  │                                                       │  │
│  │  // Export to window.firebase for cross-module access │  │
│  │  window.firebase = { auth, provider, signInWithPopup, ... } │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Firebase Config Module

Location: `scripts/firebase-config.js`

```javascript
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDnWNyXba8hwkt9tOTVfqKUcPOutW0OYyk",
    authDomain: "gamersadmin-f1657.firebaseapp.com",
    projectId: "gamersadmin-f1657",
    storageBucket: "gamersadmin-f1657.firebasestorage.app",
    messagingSenderId: "539359464815",
    appId: "1:539359464815:web:08765f5a334a7ab1eeec9a"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export to global scope
window.firebase = { 
    app, 
    db, 
    auth, 
    provider, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    deleteDoc 
};
```

---

## Admin Panel Module

Location: `firebase-admin.html` (inline `<script type="module">`)

### State Management

```javascript
let apps = [];           // Loaded app documents
let editingIndex = -1;   // -1 = adding new, >= 0 = editing existing
let currentUser = null;  // Firebase User object or null
```

### Auth Functions

```javascript
// State listener - runs on page load and auth changes
firebase.auth.onAuthStateChanged((user) => { /* ... */ });

// Login button click handler
document.getElementById('loginBtn').addEventListener('click', async () => {
    await firebase.signInWithPopup(firebase.auth, firebase.provider);
});

// Logout button click handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await firebase.signOut(firebase.auth);
});
```

### Exported to Window

```javascript
// Make functions accessible from onclick attributes
window.addApp = addApp;
window.editApp = editApp;
window.cancelEdit = cancelEdit;
window.removeApp = removeApp;
```

---

## Global Object Pattern

This project uses `window.firebase` to share Firebase instances across modules.

```javascript
// GOOD - Centralized in firebase-config.js
window.firebase = { auth, provider, signInWithPopup, signOut };

// Usage in other files
firebase.auth.onAuthStateChanged(/*...*/);
await firebase.signInWithPopup(firebase.auth, firebase.provider);
```

### Why Global Object?

1. **CDN imports** - ES modules from CDN URLs can't be re-exported easily
2. **HTML inline modules** - Inline scripts can't use relative imports
3. **Single initialization** - Firebase app initialized once, shared everywhere

### Alternative: Named Exports (not used)

```javascript
// Would require build tool (Vite, Webpack)
export { auth, provider, signInWithPopup, signOut };

// Import in another file
import { auth, signInWithPopup } from './firebase-config.js';
```

---

## Import Structure

### Order Convention

```javascript
// 1. Firebase SDK imports from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 2. Local config/constants
const firebaseConfig = { /* ... */ };

// 3. Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 4. Export (global object pattern)
window.firebase = { /* ... */ };
```

### Firebase SDK Version

All imports use Firebase JS SDK v10.7.1 via Google's CDN:

```
https://www.gstatic.com/firebasejs/10.7.1/firebase-*.js
```

See the **firebase** skill for SDK version management.