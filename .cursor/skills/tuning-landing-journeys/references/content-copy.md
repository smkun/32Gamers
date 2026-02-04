# Content & Copy Reference

## Contents
- Page Hierarchy Copy
- Loading State Messaging
- Error State Copy
- Admin Interface Copy
- Empty State Handling

## Page Hierarchy Copy

### Primary Title

```html
<!-- index.html:56-58 -->
<h1 class="cyber-title">
    <span class="glitch" data-text="MISSION CONTROL">MISSION CONTROL</span>
</h1>
```

**Current:** "MISSION CONTROL" - thematic, establishes gaming context
**Note:** `data-text` attribute required for glitch effect duplication

### Action Prompt

```html
<!-- index.html:61 -->
<div class="subtitle">// SELECT YOUR MISSION</div>
```

**Pattern:** Code-style comment prefix `//` reinforces tech aesthetic
**Improvement opportunity:** Dynamic copy based on app count: `// ${apps.length} MISSIONS AVAILABLE`

## Loading State Messaging

### Current Loading Copy

```html
<!-- index.html:71-75 -->
<p class="loading-text">
    <span class="loading-bracket">[</span>
    INITIALIZING NEURAL LINK
    <span class="loading-bracket">]</span>
</p>
```

**Voice:** Cyberpunk terminal aesthetic with bracket syntax

### Alternative Loading Messages

For variety, rotate between themed messages:

```javascript
const loadingMessages = [
    'INITIALIZING NEURAL LINK',
    'SYNCING MISSION DATABASE',
    'LOADING ARCADE PROTOCOLS',
    'ESTABLISHING UPLINK'
];
```

## Error State Copy

### Firebase Connection Error

```javascript
// scripts/app.js:53-54
this.showError('Unable to load apps. Please check your internet connection or contact the administrator.');
```

**Current:** Generic, actionable but not themed
**Improved:** Match cyberpunk voice:

```javascript
'CONNECTION LOST // Check your neural link (internet) and retry'
```

### Admin Permission Errors

```javascript
// firebase-admin.html:162
showStatus('Permission denied. Please sign in as admin.', 'error');
```

**DO:** Clear explanation of what went wrong
**DON'T:** Technical jargon like "Firestore rules violation"

## Admin Interface Copy

### Section Headers

```html
<!-- firebase-admin.html:51-75 -->
<h3>Add New App</h3>
<!-- ... form fields ... -->
<h3>Current Apps</h3>
```

**Pattern:** Simple, action-oriented headers

### Form Labels

```html
<!-- firebase-admin.html:53-70 -->
<label for="appId">App ID:</label>
<label for="appName">App Name:</label>
<label for="appUrl">App URL:</label>
<label for="appImage">Image Filename:</label>
<label for="appDescription">Description:</label>
```

**DO:** Include placeholder examples showing expected format
**Current placeholders:** `my-new-app`, `My New App`, `MyNewApp/index.html`

### Success/Error Status Messages

```javascript
// firebase-admin.html:289-292
function showStatus(message, type = 'info') {
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    setTimeout(() => statusDiv.innerHTML = '', 5000);
}
```

**Pattern:** Auto-dismissing after 5 seconds. Consider keeping errors visible until acknowledged.

## Empty State Handling

### No Apps State

```javascript
// firebase-admin.html:267-269
if (apps.length === 0) {
    appList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No apps found. Add your first app above!</p>';
}
```

**DO:** Provide clear next action
**Improvement:** Add visual indicator pointing to form

### Search No Results

```javascript
// scripts/app.js:208
container.innerHTML = '<p class="no-results">No apps found matching your search.</p>';
```

**Style applied:**
```css
/* style.css:814-822 */
.no-results {
    grid-column: 1 / -1;
    color: var(--neon-yellow);
    font-size: 1.25rem;
    letter-spacing: 0.1em;
}
```

## Copy Consistency Checklist

Copy this checklist when auditing messaging:

- [ ] All headings use uppercase (title style)
- [ ] Error messages explain cause AND next action
- [ ] Loading messages match cyberpunk voice
- [ ] Form placeholders show valid examples
- [ ] Status messages auto-dismiss (except errors)
- [ ] Empty states guide to next action