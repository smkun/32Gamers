# Vanilla JavaScript Errors Reference

## Contents
- Error Handling Patterns
- Firebase Error Handling
- User Feedback
- Fallback Strategies
- Anti-Patterns

---

## Error Handling Patterns

### Try/Catch with Async/Await

```javascript
// GOOD - Wrap async operations in try/catch
async loadApps() {
    try {
        const querySnapshot = await window.firebase.getDocs(
            window.firebase.collection(window.firebase.db, 'apps')
        );
        // Process data...
    } catch (error) {
        console.error('Failed to load apps:', error);
        this.loadFallbackApps();
    }
}
```

### Graceful Degradation

```javascript
// GOOD - Fallback when primary source fails
loadFallbackApps() {
    console.log('No apps available - Firebase failed');
    this.apps = [];
    this.showError('Unable to load apps. Please check your connection.');
}
```

---

## Firebase Error Handling

### Auth Errors

```javascript
// GOOD - Handle specific Firebase auth errors
document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        showStatus('Opening sign-in popup...', 'info');
        await firebase.signInWithPopup(firebase.auth, firebase.provider);
        showStatus('Sign-in successful!', 'success');
    } catch (error) {
        console.error('Auth error:', error);
        
        if (error.code === 'auth/popup-blocked') {
            showStatus('Popup blocked! Please allow popups.', 'error');
        } else if (error.code === 'auth/popup-closed-by-user') {
            showStatus('Sign-in cancelled.', 'info');
        } else if (error.code === 'auth/network-request-failed') {
            showStatus('Network error. Check your connection.', 'error');
        } else {
            showStatus(`Login failed: ${error.message}`, 'error');
        }
    }
});
```

### Firestore Errors

```javascript
// GOOD - Handle Firestore-specific error codes
async function loadApps() {
    try {
        const querySnapshot = await firebase.getDocs(
            firebase.collection(firebase.db, 'apps')
        );
        // ...
    } catch (error) {
        console.error('Load error:', error);
        
        if (error.code === 'unavailable') {
            showStatus('Network error. Check your connection.', 'error');
        } else if (error.code === 'permission-denied') {
            showStatus('Permission denied. Please sign in as admin.', 'error');
        } else if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            showStatus('Request blocked by ad blocker.', 'error');
        } else {
            showStatus(`Failed to load: ${error.message}`, 'error');
        }
    }
}
```

### Write Operation Errors

```javascript
// GOOD - Handle save failures with user feedback
async function addApp() {
    try {
        await firebase.setDoc(
            firebase.doc(firebase.db, 'apps', newApp.appId), 
            newApp
        );
        showStatus('App added successfully!', 'success');
        loadApps(); // Refresh list
        clearForm();
    } catch (error) {
        showStatus(`Failed to save app: ${error.message}`, 'error');
    }
}
```

---

## User Feedback

### Status Message Pattern

```javascript
// GOOD - Timed status messages with visual styling
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    
    // Auto-clear after 5 seconds
    setTimeout(() => statusDiv.innerHTML = '', 5000);
}

// Usage
showStatus('Loading apps...', 'info');
showStatus('Apps loaded successfully!', 'success');
showStatus('Permission denied.', 'error');
```

### Error Container Pattern

```javascript
// GOOD - Replace content with error UI including retry
showError(message) {
    const container = document.querySelector('.button-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="window.location.reload()">Retry</button>
            </div>
        `;
    }
}
```

### Confirmation Before Destructive Actions

```javascript
// GOOD - Confirm before delete
async function removeApp(index) {
    if (!confirm('Remove this app?')) return;
    
    try {
        const app = apps[index];
        await firebase.deleteDoc(firebase.doc(firebase.db, 'apps', app.appId));
        showStatus('App removed successfully!', 'success');
        loadApps();
    } catch (error) {
        showStatus(`Failed to remove: ${error.message}`, 'error');
    }
}
```

---

## Fallback Strategies

### Image Load Fallback

```javascript
// GOOD - Inline onerror for image fallback
button.innerHTML = `
    <img src="assets/images/${app.image}" 
         alt="${app.name}" 
         onerror="this.src='assets/images/placeholder.png'"/>
`;
```

### Firebase Initialization Fallback

```javascript
// GOOD - Check Firebase ready, fail gracefully
async loadApps() {
    try {
        if (!window.firebase || !window.firebase.db) {
            console.log('Waiting for Firebase...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (window.firebase && window.firebase.db) {
            // Load from Firebase...
        } else {
            throw new Error('Firebase failed to initialize');
        }
    } catch (error) {
        this.loadFallbackApps();
    }
}
```

---

## Anti-Patterns

### WARNING: Silent Failures

**The Problem:**

```javascript
// BAD - Empty catch block hides errors
try {
    await loadData();
} catch (error) {
    // Nothing here - error disappears
}
```

**Why This Breaks:**
1. No way to debug when things fail
2. User sees broken UI with no explanation
3. Errors accumulate silently in production

**The Fix:**

```javascript
// GOOD - Always log and/or notify
try {
    await loadData();
} catch (error) {
    console.error('Load failed:', error);
    showStatus('Failed to load data', 'error');
}
```

### WARNING: Generic Error Messages

**The Problem:**

```javascript
// BAD - No actionable information
showStatus('Something went wrong', 'error');
```

**The Fix:**

```javascript
// GOOD - Specific, actionable messages
if (error.code === 'permission-denied') {
    showStatus('Permission denied. Please sign in as admin.', 'error');
} else if (error.code === 'unavailable') {
    showStatus('Network error. Check your connection and retry.', 'error');
}
```

### WARNING: Unhandled Promise Rejections

**The Problem:**

```javascript
// BAD - No catch on async function call
loadApps(); // If this fails, error is unhandled
```

**The Fix:**

```javascript
// GOOD - Handle at call site or inside function
loadApps().catch(error => {
    console.error('Startup failed:', error);
});

// OR ensure function handles internally
async loadApps() {
    try {
        // ...
    } catch (error) {
        this.loadFallbackApps();
    }
}
```

---

## Error Checklist

Copy this checklist when implementing error handling:

- [ ] All async operations wrapped in try/catch
- [ ] Firebase errors handled by specific error code
- [ ] User sees feedback for all errors
- [ ] Console.error called for debugging
- [ ] Fallback behavior defined for critical failures
- [ ] Retry option provided where appropriate
- [ ] Destructive actions require confirmation