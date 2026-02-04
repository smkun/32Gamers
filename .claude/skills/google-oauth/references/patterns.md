# Google OAuth Patterns Reference

## Contents
- Authentication Flow Pattern
- Session Persistence Pattern
- Admin Access Control Pattern
- Error Handling Pattern
- UI State Management Pattern

---

## Authentication Flow Pattern

The 32Gamers portal uses popup-based Google OAuth. The flow is:

1. User clicks login button
2. `signInWithPopup` opens Google consent screen
3. On success, `onAuthStateChanged` fires with user object
4. UI updates to show authenticated state

```javascript
// GOOD - Complete auth flow with state listener
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

document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        await firebase.signInWithPopup(firebase.auth, firebase.provider);
    } catch (error) {
        handleAuthError(error);
    }
});
```

```javascript
// BAD - Relying on signInWithPopup result instead of state listener
document.getElementById('loginBtn').addEventListener('click', async () => {
    const result = await firebase.signInWithPopup(firebase.auth, firebase.provider);
    currentUser = result.user;  // Don't do this - use onAuthStateChanged
    showUserSection(result.user);
});
```

**Why the bad pattern breaks:** On page refresh, `signInWithPopup` isn't called but `onAuthStateChanged` still fires with the persisted session. Using only the popup result means losing auth state on refresh.

---

## Session Persistence Pattern

Firebase Auth persists sessions in IndexedDB by default. Always use `onAuthStateChanged` to restore state.

```javascript
// GOOD - Single source of truth for auth state
let currentUser = null;

firebase.auth.onAuthStateChanged((user) => {
    currentUser = user;
    updateUI();
});

function updateUI() {
    if (currentUser) {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('userSection').classList.remove('hidden');
    } else {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('userSection').classList.add('hidden');
    }
}
```

```javascript
// BAD - Checking auth state synchronously on page load
const user = firebase.auth.currentUser;  // May be null before listener fires
if (user) {
    showUserSection(user);
}
```

**Why the bad pattern breaks:** `currentUser` is populated asynchronously. On page load it's `null` until Firebase restores the session.

---

## Admin Access Control Pattern

See the **firestore** skill for complete security rules. Client-side auth state should mirror server-side rules.

### Firestore Rules (UID-based)

```javascript
// firebaseRules.txt
function isAdmin() {
    return request.auth != null
           && request.auth.uid == '9mbW4MTdXSMvGdlgUIJu5DOWMZW2';
}

match /apps/{docId} {
    allow read: if true;
    allow create, update, delete: if isAdmin() && validAppsDoc();
}
```

### Client-Side Guard

```javascript
// GOOD - Guard operations that require auth
async function addApp() {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }
    // Firestore rules will still enforce - this is UX, not security
    await firebase.setDoc(/*...*/);
}
```

```javascript
// BAD - No client-side guard, relying only on server rules
async function addApp() {
    // Will throw permission-denied error for non-admin users
    await firebase.setDoc(/*...*/);
}
```

**Why the bad pattern is problematic:** Users see cryptic permission errors instead of clear "login required" messages.

---

## Error Handling Pattern

Handle specific Firebase Auth error codes for better UX.

```javascript
// GOOD - Specific error handling
try {
    await firebase.signInWithPopup(firebase.auth, firebase.provider);
    showStatus('Sign-in successful!', 'success');
} catch (error) {
    console.error('Auth error:', error);
    if (error.code === 'auth/popup-blocked') {
        showStatus('Popup blocked! Please allow popups for this site.', 'error');
    } else if (error.code === 'auth/popup-closed-by-user') {
        showStatus('Sign-in cancelled.', 'info');
    } else if (error.code === 'auth/network-request-failed') {
        showStatus('Network error. Check your connection.', 'error');
    } else {
        showStatus(`Login failed: ${error.message}`, 'error');
    }
}
```

```javascript
// BAD - Generic error handling
try {
    await firebase.signInWithPopup(firebase.auth, firebase.provider);
} catch (error) {
    alert('Login failed');  // Unhelpful, no context
}
```

---

## UI State Management Pattern

Toggle visibility based on auth state rather than manipulating individual elements.

```javascript
// GOOD - Section-based visibility toggle
function showLoginSection() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('userSection').classList.add('hidden');
}

function showUserSection(user) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('userSection').classList.remove('hidden');
    
    document.getElementById('userAvatar').src = user.photoURL || '';
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('userEmail').textContent = user.email || '';
}
```

```css
/* CSS for hidden state */
.hidden {
    display: none !important;
}
```