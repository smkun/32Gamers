# Vanilla JavaScript Modules Reference

## Contents
- ES Modules via CDN
- Script Loading Order
- Cross-Script Communication
- Module Organization

---

## ES Modules via CDN

### Firebase SDK Imports

```javascript
// scripts/firebase-config.js
// Import Firebase modules from CDN - no build step required
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } 
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } 
    from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
```

### HTML Module Loading

```html
<!-- index.html -->
<!-- Module script for ES imports -->
<script type="module" src="scripts/firebase-config.js"></script>

<!-- Regular script with defer for class-based code -->
<script src="scripts/app.js" defer></script>
```

### Inline Module Script

```html
<!-- firebase-admin.html -->
<script type="module">
    import './scripts/firebase-config.js';
    
    // Module code has its own scope
    let apps = [];
    let currentUser = null;
    
    // Make functions available to onclick handlers
    window.addApp = addApp;
    window.editApp = editApp;
</script>
```

---

## Script Loading Order

### Correct Order

```html
<!-- 1. Module scripts load and initialize Firebase -->
<script type="module" src="scripts/firebase-config.js"></script>

<!-- 2. Regular script waits for DOM, uses initialized Firebase -->
<script src="scripts/app.js" defer></script>
```

### Module vs Regular Script Differences

| Feature | `type="module"` | Regular Script |
|---------|-----------------|----------------|
| Scope | Own scope | Global scope |
| `import`/`export` | Supported | Not supported |
| Strict mode | Automatic | Manual |
| Execution | Deferred by default | Immediate |
| `this` at top level | `undefined` | `window` |

---

## Cross-Script Communication

### Window Object Pattern

```javascript
// scripts/firebase-config.js
// Export everything needed by other scripts via window
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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

### Consuming in Regular Script

```javascript
// scripts/app.js - Can access window.firebase
async loadApps() {
    if (!window.firebase || !window.firebase.db) {
        console.log('Waiting for Firebase...');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const querySnapshot = await window.firebase.getDocs(
        window.firebase.collection(window.firebase.db, 'apps')
    );
}
```

### WARNING: Race Conditions

**The Problem:**

```javascript
// BAD - Module might not be loaded yet
const db = window.firebase.db; // Could be undefined!
```

**Why This Breaks:**
1. Module scripts are deferred and async
2. Regular scripts with `defer` run after HTML parsing
3. Order between module and deferred script isn't guaranteed

**The Fix:**

```javascript
// GOOD - Check and wait for dependency
async init() {
    if (!window.firebase?.db) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (!window.firebase?.db) {
        throw new Error('Firebase failed to initialize');
    }
}
```

---

## Module Organization

### File Structure

```
scripts/
├── firebase-config.js  # Firebase initialization + window export
└── app.js              # Main application class (PortalManager)
```

### Config Module Pattern

```javascript
// firebase-config.js
// 1. Configuration object
const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    // ...
};

// 2. Firebase SDK imports
import { initializeApp } from '...';
import { getFirestore } from '...';

// 3. Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Export via window for cross-script access
window.firebase = { app, db, /* ... */ };
```

### Controller Module Pattern

```javascript
// app.js
// Self-contained class that uses window.firebase
class PortalManager {
    constructor() {
        this.apps = [];
        this.init();
    }
    // ...
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.portalManager = new PortalManager();
});
```

---

## Inline Scripts for Simple Actions

### Direct in HTML

```html
<!-- index.html -->
<script>
    // Simple functions that don't need module features
    function handleAdminClick() {
        window.location.href = 'firebase-admin.html';
    }
    
    // Global keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.key === 'a') {
            e.preventDefault();
            handleAdminClick();
        }
    });
</script>
```

### When to Use Inline vs External

| Use Inline | Use External |
|------------|--------------|
| Simple event handlers | Complex logic |
| Page-specific config | Reusable code |
| One-liner functions | Classes |
| Critical path code | Deferrable code |