# Google OAuth Errors Reference

## Contents
- Auth Popup Errors
- Domain Configuration Errors
- Network Errors
- Permission Errors
- Debugging Checklist

---

## Auth Popup Errors

### auth/popup-blocked

**Cause:** Browser's popup blocker prevented the OAuth window.

**Solution:**
```javascript
if (error.code === 'auth/popup-blocked') {
    showStatus('Popup blocked! Please allow popups for this site and try again.', 'error');
}
```

**User instruction:** Click the popup blocked icon in the address bar and allow popups.

---

### auth/popup-closed-by-user

**Cause:** User closed the Google sign-in popup before completing authentication.

**Solution:**
```javascript
if (error.code === 'auth/popup-closed-by-user') {
    showStatus('Sign-in cancelled.', 'info');  // Not an error, just info
}
```

---

### auth/cancelled-popup-request

**Cause:** Multiple popups opened simultaneously (e.g., double-clicking login button).

**Prevention:**
```javascript
let isAuthenticating = false;

document.getElementById('loginBtn').addEventListener('click', async () => {
    if (isAuthenticating) return;
    isAuthenticating = true;
    
    try {
        await firebase.signInWithPopup(firebase.auth, firebase.provider);
    } finally {
        isAuthenticating = false;
    }
});
```

---

## Domain Configuration Errors

### auth/unauthorized-domain

**Cause:** Current domain not in Firebase Auth authorized domains list.

**Symptoms:**
```
Error: This domain (example.com) is not authorized to run this operation.
```

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", click "Add domain"
3. Add your domain (e.g., `32gamers.ifastnet.com`)

**Common domains to add:**
- Production domain
- `localhost` (for development)
- Staging/preview URLs

---

## Network Errors

### auth/network-request-failed

**Cause:** Network connectivity issue during OAuth flow.

**Solution:**
```javascript
if (error.code === 'auth/network-request-failed') {
    showStatus('Network error. Check your connection and try again.', 'error');
}
```

**Debugging:**
1. Check browser DevTools → Network tab for failed requests
2. Verify Firebase services are reachable
3. Check for VPN/firewall interference

---

### ERR_BLOCKED_BY_CLIENT

**Cause:** Ad blocker or privacy extension blocking Firebase requests.

**Detection:**
```javascript
if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
    showStatus('Request blocked by ad blocker. Please disable it for this site.', 'error');
}
```

---

## Permission Errors

### permission-denied (Firestore)

**Cause:** User authenticated but not authorized by Firestore rules.

**Symptoms:** User can sign in but can't add/edit/delete apps.

**Debugging:**
```javascript
try {
    await firebase.setDoc(/*...*/);
} catch (error) {
    if (error.code === 'permission-denied') {
        console.log('Current user UID:', firebase.auth.currentUser?.uid);
        console.log('Expected admin UID:', '9mbW4MTdXSMvGdlgUIJu5DOWMZW2');
        showStatus('Permission denied. Only admin can modify apps.', 'error');
    }
}
```

See the **firestore** skill for security rules configuration.

---

## Debugging Checklist

Copy this checklist when troubleshooting auth issues:

- [ ] Check browser console for error messages
- [ ] Verify domain in Firebase Console → Auth → Authorized domains
- [ ] Confirm Google sign-in provider enabled in Firebase Console
- [ ] Check network tab for blocked requests
- [ ] Disable ad blockers temporarily to test
- [ ] Verify `firebase-config.js` has correct project credentials
- [ ] Confirm user UID matches Firestore rules admin UID
- [ ] Test in incognito window to rule out extension interference

---

## Error Handler Template

Complete error handling for sign-in:

```javascript
document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        showStatus('Opening sign-in popup...', 'info');
        await firebase.signInWithPopup(firebase.auth, firebase.provider);
        showStatus('Sign-in successful!', 'success');
    } catch (error) {
        console.error('Auth error:', error);
        
        const errorMessages = {
            'auth/popup-blocked': 'Popup blocked! Please allow popups for this site.',
            'auth/popup-closed-by-user': 'Sign-in cancelled.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/unauthorized-domain': 'Domain not authorized. Contact admin.',
            'auth/cancelled-popup-request': 'Please wait for the popup to load.',
            'auth/user-disabled': 'Account disabled. Contact admin.'
        };
        
        const message = errorMessages[error.code] || `Login failed: ${error.message}`;
        const type = error.code === 'auth/popup-closed-by-user' ? 'info' : 'error';
        
        showStatus(message, type);
    }
});
```

---

## Status Message Display

Utility function used throughout the admin panel:

```javascript
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    setTimeout(() => statusDiv.innerHTML = '', 5000);  // Auto-clear after 5s
}
```

CSS classes: `info`, `success`, `error` - styled in `style.css`.