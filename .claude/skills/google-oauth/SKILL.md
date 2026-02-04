---
name: google-oauth
description: |
  Implements Firebase Google OAuth authentication with popup-based sign-in flow and admin access control.
  Use when: adding authentication, implementing sign-in/sign-out, protecting admin routes, handling auth state changes, managing user sessions, or securing Firestore write operations.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs, mcp__chrome-devtools__click, mcp__chrome-devtools__fill, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__wait_for, mcp__playwright__browser_click, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot
---

# Google OAuth Skill

Firebase Authentication with Google OAuth for the 32Gamers Club portal. Uses popup-based sign-in, `onAuthStateChanged` for session persistence, and UID-based Firestore rules for admin access control.

## Quick Start

### Initialize Firebase Auth

```javascript
// scripts/firebase-config.js
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export to global scope for cross-module access
window.firebase = { auth, provider, signInWithPopup, signOut };
```

### Handle Auth State Changes

```javascript
// firebase-admin.html - Auth state listener
firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showUserSection(user);
        loadApps();  // Load protected data
    } else {
        currentUser = null;
        showLoginSection();
    }
});
```

### Sign In with Popup

```javascript
document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        const result = await firebase.signInWithPopup(firebase.auth, firebase.provider);
        showStatus('Sign-in successful!', 'success');
    } catch (error) {
        if (error.code === 'auth/popup-blocked') {
            showStatus('Popup blocked! Allow popups for this site.', 'error');
        } else if (error.code === 'auth/popup-closed-by-user') {
            showStatus('Sign-in cancelled.', 'info');
        }
    }
});
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| `onAuthStateChanged` | Session persistence listener | `firebase.auth.onAuthStateChanged(callback)` |
| `signInWithPopup` | Trigger Google OAuth flow | `await signInWithPopup(auth, provider)` |
| `signOut` | End user session | `await signOut(auth)` |
| `user.uid` | Unique user identifier for rules | `'9mbW4MTdXSMvGdlgUIJu5DOWMZW2'` |
| `user.email` | User's Google email | `currentUser.email` |

## Common Patterns

### Guard Protected Operations

**When:** Writing data that requires admin privileges

```javascript
async function addApp() {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }
    // Proceed with Firestore write
    await firebase.setDoc(firebase.doc(firebase.db, 'apps', newApp.appId), {
        ...newApp,
        createdBy: currentUser.email
    });
}
```

### Display User Info

**When:** Showing authenticated user details

```javascript
function showUserSection(user) {
    document.getElementById('userAvatar').src = user.photoURL || '';
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('userEmail').textContent = user.email || '';
}
```

## See Also

- [patterns](references/patterns.md) - Auth flow patterns and error handling
- [types](references/types.md) - User object properties and auth types
- [modules](references/modules.md) - Firebase Auth module structure
- [errors](references/errors.md) - Common auth errors and solutions

## Related Skills

- **firebase** - Firebase SDK initialization and configuration
- **firestore** - Database operations protected by auth rules
- **vanilla-javascript** - DOM manipulation and event handling patterns

## Documentation Resources

> Fetch latest Firebase Auth documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "firebase auth"
2. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "firebase auth google sign in popup"
- "firebase onAuthStateChanged"
- "firebase security rules auth uid"