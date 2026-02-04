# In-App Guidance Reference

## Contents
- Status Messages System
- Error Message Patterns
- Form Validation Guidance
- Keyboard Shortcut Hints
- Contextual Help Patterns

## Status Messages System

### Admin Panel Status Display

```javascript
// firebase-admin.html lines 289-293
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    setTimeout(() => statusDiv.innerHTML = '', 5000);
}
```

### Status Message Types

```css
/* style.css lines 1026-1051 */
.status-message.success {
    color: var(--neon-green);
    border-color: var(--neon-green);
}

.status-message.error {
    color: var(--neon-pink);
    border-color: var(--neon-pink);
}

.status-message.info {
    color: var(--neon-cyan);
    border-color: var(--neon-cyan);
}
```

### DO: Use Specific Status Messages

```javascript
// Good - actionable messages
showStatus('App added successfully!', 'success');
showStatus('Please fill in all fields', 'error');
showStatus('Loading apps...', 'info');
```

### DON'T: Use Generic Messages

```javascript
// BAD - unhelpful
showStatus('Error', 'error');
showStatus('Done', 'success');
```

## Error Message Patterns

### Authentication Errors

```javascript
// firebase-admin.html lines 110-120
catch (error) {
    if (error.code === 'auth/popup-blocked') {
        showStatus('Popup blocked! Please allow popups...', 'error');
    } else if (error.code === 'auth/popup-closed-by-user') {
        showStatus('Sign-in cancelled.', 'info');
    } else if (error.code === 'auth/network-request-failed') {
        showStatus('Network error. Check your connection...', 'error');
    } else {
        showStatus(`Sign-in failed: ${error.message}`, 'error');
    }
}
```

**Pattern:** Map error codes to user-friendly messages with actionable guidance.

### Data Loading Errors

```javascript
// firebase-admin.html lines 157-168
catch (error) {
    if (error.code === 'unavailable') {
        showStatus('Network error. Please check your connection...', 'error');
    } else if (error.code === 'permission-denied') {
        showStatus('Permission denied. Please sign in as admin.', 'error');
    } else if (error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        showStatus('Request blocked by ad blocker...', 'error');
    }
}
```

### Error Message Quality Checklist

| Requirement | Bad Example | Good Example |
|-------------|-------------|--------------|
| Specific | "Error occurred" | "Network error" |
| Actionable | "Failed" | "Check your connection" |
| Non-technical | "auth/popup-blocked" | "Please allow popups" |
| Contextual | "Invalid" | "App ID already exists" |

## Form Validation Guidance

### Current Validation Pattern

```javascript
// firebase-admin.html lines 181-186
if (!newApp.appId || !newApp.name || !newApp.url || 
    !newApp.image || !newApp.description) {
    showStatus('Please fill in all fields', 'error');
    return;
}
```

**Friction Point:** Doesn't indicate WHICH field is missing.

### Recommended: Field-Specific Validation

```javascript
function validateAppForm() {
    const fields = {
        appId: 'App ID',
        appName: 'App Name', 
        appUrl: 'App URL',
        appImage: 'Image Filename',
        appDescription: 'Description'
    };
    
    for (const [id, label] of Object.entries(fields)) {
        if (!document.getElementById(id).value.trim()) {
            showStatus(`${label} is required`, 'error');
            document.getElementById(id).focus();
            return false;
        }
    }
    return true;
}
```

### Input Focus States

```css
/* style.css lines 979-996 */
input:focus, textarea:focus {
    border-color: var(--neon-magenta);
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
    background: rgba(255, 0, 255, 0.05);
}
```

**Why this works:** Clear visual feedback on active field.

## Keyboard Shortcut Hints

### Current Implementation (Hidden)

```javascript
// app.js lines 145-150 - No visual indication
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        this.handleAdminAccess();
    }
});
```

### Recommended: Discoverable Shortcuts

```html
<!-- Add tooltip to admin icon -->
<div id="adminAccessIcon" title="Admin Panel (Ctrl+Alt+A)">
    <!-- icon -->
</div>

<!-- Add keyboard hint to search -->
<div class="search-hint">Press Ctrl+F to search</div>
```

### Shortcut Documentation Pattern

```javascript
// Add keyboard shortcut display
const shortcuts = [
    { keys: 'Ctrl+F', action: 'Open search' },
    { keys: 'Ctrl+Alt+A', action: 'Admin panel' },
    { keys: 'Esc', action: 'Close overlay' },
    { keys: 'Enter/Space', action: 'Activate focused app' }
];
```

## Contextual Help Patterns

### Form Field Placeholders

```html
<!-- firebase-admin.html lines 53-70 -->
<input type="text" id="appId" placeholder="my-new-app">
<input type="text" id="appUrl" placeholder="MyNewApp/index.html">
<input type="text" id="appImage" placeholder="my-app-icon.png">
```

**Pattern:** Placeholders show expected format, not just field name.

### DO: Format Examples in Placeholders

```html
<input placeholder="my-app-name (lowercase, hyphens)">
<input placeholder="path/to/app.html">
```

### DON'T: Repeat Label in Placeholder

```html
<!-- BAD -->
<label>App Name</label>
<input placeholder="App Name">
```

## Guidance Implementation Checklist

- [ ] All error messages are actionable
- [ ] Form validation highlights specific issues
- [ ] Keyboard shortcuts have visual hints
- [ ] Placeholders show format examples
- [ ] Status messages auto-dismiss after reasonable time
- [ ] Success/error/info states are visually distinct