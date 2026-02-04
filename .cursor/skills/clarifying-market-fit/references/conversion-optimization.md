# Conversion Optimization Reference

## Contents
- Portal Conversion Points
- CTA Patterns
- Friction Reduction
- Common Anti-Patterns

## Portal Conversion Points

The 32Gamers portal has two primary conversion flows:

| Flow | Entry | Conversion | Location |
|------|-------|------------|----------|
| App discovery | Landing page | App click | `index.html` → app URL |
| Admin access | Portal | Successful CRUD | `firebase-admin.html` |

### App Click Tracking

```javascript
// scripts/app.js:94-102 - Current implementation
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

## CTA Patterns

### DO: Clear, Action-Oriented CTAs

```html
<!-- firebase-admin.html:72 - Good: specific action -->
<button class="btn-primary" onclick="addApp()">Add App</button>

<!-- firebase-admin.html:23 - Good: describes outcome -->
<button class="login-btn">Sign in with Google</button>
```

### DON'T: Vague or Generic CTAs

```html
<!-- BAD - unclear what happens next -->
<button>Submit</button>
<button>Continue</button>
<button>Go</button>
```

**Why this breaks**: Users hesitate when unsure what clicking does. Specific verbs ("Add App", "Sign in") reduce cognitive load.

## Friction Reduction

### Current Admin Login Flow

```
1. User clicks admin icon (index.html:46)
2. Redirect to firebase-admin.html
3. Click "Sign in with Google"
4. OAuth popup
5. User section revealed
```

**Friction points**:
- Step 3 is extra click after intentional navigation
- No loading indicator during OAuth popup

### DO: Immediate Feedback on Actions

```javascript
// firebase-admin.html:107-109 - Good pattern
showStatus('Opening sign-in popup...', 'info');
const result = await firebase.signInWithPopup(...);
showStatus('Sign-in successful!', 'success');
```

### DON'T: Silent Operations

```javascript
// BAD - user doesn't know if click registered
await firebase.signInWithPopup(firebase.auth, firebase.provider);
// No feedback until completion or error
```

## Empty State Optimization

### DO: Guide to Next Action

```javascript
// firebase-admin.html:268 - Guides user
appList.innerHTML = '<p>No apps found. Add your first app above!</p>';
```

### DON'T: Dead-End Empty States

```javascript
// BAD - no guidance
appList.innerHTML = '<p>No apps.</p>';
```

## Common Anti-Patterns

### WARNING: Generic Error Messages

**The Problem:**
```javascript
// BAD - no actionable information
showStatus('Error occurred', 'error');
```

**Why This Breaks:**
1. Users don't know what went wrong
2. Can't self-remediate
3. Increases support burden

**The Fix:**
```javascript
// firebase-admin.html:159-167 - Good: specific, actionable
if (error.code === 'unavailable') {
    showStatus('Network error. Please check your connection and try again.', 'error');
} else if (error.code === 'permission-denied') {
    showStatus('Permission denied. Please sign in as admin.', 'error');
}
```

### WARNING: Missing Loading States

**The Problem:**
```javascript
// BAD - no visual feedback during load
const data = await fetch('/api/apps');
renderApps(data);
```

**The Fix:**
```html
<!-- index.html:66-79 - Good: visual loading state -->
<div class="loading-placeholder">
    <div class="spinner-container">
        <div class="spinner"></div>
    </div>
    <p class="loading-text">[INITIALIZING NEURAL LINK]</p>
</div>
```

## Measurement

See the **instrumenting-product-metrics** skill for adding conversion tracking.