# In-App Guidance Reference

## Contents
- Tooltip Patterns
- Status Message System
- Form Validation Guidance
- Error Message Patterns
- Contextual Help

---

## Tooltip Patterns

### Current Implementation (Minimal)

```javascript
// app.js:77-79 - Only on app cards
button.setAttribute('aria-label', `${app.name} - ${app.description}`);
button.setAttribute('title', app.description);
```

### DO: Use Native Title for Simple Hints

```html
<!-- index.html:46 - Admin icon example -->
<a href="firebase-admin.html" class="admin-icon" title="Admin Access [CTRL+ALT+A]">
```

**Pros:** No JavaScript, works on hover
**Cons:** Styling limited, delay before showing

### DO: Create Custom Tooltips for Rich Content

```javascript
// Custom tooltip component
function createTooltip(target, content, position = 'top') {
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.innerHTML = content;
    
    target.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        positionTooltip(tooltip, target, position);
    });
    
    target.addEventListener('mouseleave', () => {
        tooltip.remove();
    });
}

// Usage
createTooltip(
    document.querySelector('.admin-icon'),
    '<strong>Admin Panel</strong><br>Manage your app catalog'
);
```

### Tooltip CSS (Cyberpunk Theme)

```css
.tooltip {
    position: absolute;
    background: var(--cyber-dark);
    border: 1px solid var(--neon-cyan);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    box-shadow: 0 0 10px var(--neon-cyan);
    z-index: 1000;
    max-width: 200px;
}

.tooltip::after {
    content: '';
    position: absolute;
    border: 6px solid transparent;
}

.tooltip-top::after {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--neon-cyan);
}
```

---

## Status Message System

### Current Implementation

```javascript
// firebase-admin.html:289-293
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
}
```

**Types:** `info`, `success`, `error`

### Status Message CSS

```css
/* style.css:1026-1051 */
.status-message {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    text-align: center;
}

.status-message.success {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid var(--neon-green);
    color: var(--neon-green);
}

.status-message.error {
    background: rgba(255, 0, 102, 0.1);
    border: 1px solid var(--neon-magenta);
    color: var(--neon-magenta);
}
```

### DO: Use Status for Async Operations

```javascript
// Show progress, then result
showStatus('Saving app...', 'info');
try {
    await addDoc(collection(db, 'apps'), appData);
    showStatus('App added successfully!', 'success');
} catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
}
```

---

## Form Validation Guidance

### Current: Placeholder-Only Guidance

```html
<!-- firebase-admin.html - No validation hints -->
<input type="text" id="appUrl" placeholder="MyNewApp/index.html" required>
```

### DO: Add Inline Validation Feedback

```javascript
// Real-time validation with guidance
const urlInput = document.getElementById('appUrl');

urlInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const feedback = e.target.nextElementSibling;
    
    if (value.includes('<') || value.includes('>')) {
        feedback.textContent = 'URLs cannot contain < or > characters';
        feedback.className = 'field-error';
    } else if (!value.startsWith('http') && !value.includes('/')) {
        feedback.textContent = 'Use relative path (e.g., MyApp/index.html) or full URL';
        feedback.className = 'field-hint';
    } else {
        feedback.textContent = '';
    }
});
```

### Validation Feedback CSS

```css
.field-error {
    color: var(--neon-magenta);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.field-hint {
    color: var(--neon-cyan);
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.8;
}

input:invalid {
    border-color: var(--neon-magenta);
    box-shadow: 0 0 5px var(--neon-magenta);
}

input:valid {
    border-color: var(--neon-green);
}
```

---

## Error Message Patterns

### Current Implementation (Good)

```javascript
// firebase-admin.html:105-122 - Contextual error messages
} catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
    } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelled. Click the button to try again.';
    } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
    }
    
    showStatus(errorMessage, 'error');
}
```

### DO: Map Firebase Errors to User-Friendly Messages

```javascript
const firebaseErrorMessages = {
    'auth/popup-blocked': 'Please allow popups to sign in.',
    'auth/popup-closed-by-user': 'Sign-in cancelled. Try again when ready.',
    'auth/network-request-failed': 'No internet connection.',
    'permission-denied': 'You don\'t have permission for this action.',
    'not-found': 'The requested item doesn\'t exist.',
    'unavailable': 'Service temporarily unavailable. Try again later.'
};

function getUserFriendlyError(error) {
    return firebaseErrorMessages[error.code] || 'Something went wrong. Please try again.';
}
```

---

## Contextual Help

### Pattern: Help Icons Next to Fields

```html
<div class="form-group">
    <label for="appId">
        App ID
        <button type="button" class="help-icon" aria-label="Help for App ID">?</button>
    </label>
    <input type="text" id="appId" placeholder="my-new-app">
    <div class="help-content" hidden>
        <p>A unique identifier for this app. Use lowercase letters, numbers, and hyphens only.</p>
        <p>Example: <code>tetris-clone</code>, <code>my-game-2024</code></p>
    </div>
</div>
```

```javascript
// Toggle help content
document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const helpContent = icon.closest('.form-group').querySelector('.help-content');
        helpContent.hidden = !helpContent.hidden;
    });
});
```

### Help Icon CSS

```css
.help-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--neon-cyan);
    background: transparent;
    color: var(--neon-cyan);
    font-size: 10px;
    cursor: pointer;
    margin-left: 0.5rem;
}

.help-icon:hover {
    background: var(--neon-cyan);
    color: var(--cyber-dark);
}

.help-content {
    background: rgba(0, 255, 255, 0.05);
    border-left: 2px solid var(--neon-cyan);
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
}
```

---

## Anti-Patterns

### WARNING: Generic Error Messages

**The Problem:**
```javascript
// BAD
catch (error) {
    showStatus('Error occurred', 'error');
}
```

**Why This Breaks:** User has no idea what went wrong or how to fix it.

**The Fix:** Map errors to actionable messages (see patterns above).

### WARNING: Tooltip Overload

**The Problem:**
```javascript
// BAD - Tooltips on everything
document.querySelectorAll('*').forEach(el => {
    createTooltip(el, 'Click to interact');
});
```

**Why This Breaks:** Information overload, slower performance, cluttered UI.

**The Fix:** Only add tooltips to non-obvious interactive elements.

---

## Implementation Checklist

- [ ] Add tooltips to non-obvious features only
- [ ] Implement form validation with inline feedback
- [ ] Map all Firebase errors to user-friendly messages
- [ ] Add help icons for complex form fields
- [ ] Test keyboard navigation for help components
- [ ] Style with cyberpunk theme (see **css** skill)