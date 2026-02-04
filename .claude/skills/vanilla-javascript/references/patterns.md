# Vanilla JavaScript Patterns Reference

## Contents
- Async/Await Patterns
- DOM Manipulation Patterns
- Event Handling Patterns
- Class Organization Patterns
- Anti-Patterns

---

## Async/Await Patterns

### Firebase Data Loading

```javascript
// GOOD - Proper async initialization with fallback
async loadApps() {
    try {
        if (!window.firebase?.db) {
            console.log('Waiting for Firebase...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const querySnapshot = await window.firebase.getDocs(
            window.firebase.collection(window.firebase.db, 'apps')
        );
        
        querySnapshot.forEach((doc) => {
            this.apps.push(doc.data());
        });
    } catch (error) {
        console.error('Load failed:', error);
        this.loadFallbackApps();
    }
}
```

### Sequential Initialization

```javascript
// GOOD - Clear async flow in class initialization
async init() {
    await this.loadApps();    // Wait for data
    this.renderApps();        // Then render
    this.setupEventListeners(); // Then bind events
}
```

---

## DOM Manipulation Patterns

### Dynamic Element Creation

```javascript
// GOOD - Create elements programmatically with all attributes
createAppButton(app, index) {
    const button = document.createElement('a');
    button.href = app.url;
    button.className = 'button';
    button.setAttribute('data-app-id', app.id);
    button.style.animationDelay = `${(index + 1) * 0.1}s`;
    
    // Accessibility
    button.setAttribute('aria-label', `${app.name} - ${app.description}`);
    button.setAttribute('title', app.description);
    
    // Content with fallback
    button.innerHTML = `
        <img src="assets/images/${app.image}" alt="${app.name}" 
             onerror="this.src='assets/images/placeholder.png'"/>
        <span>${app.name}</span>
    `;
    
    return button;
}
```

### Batch DOM Updates

```javascript
// GOOD - Clear container once, then batch append
renderApps() {
    const container = document.querySelector('.button-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear once
    
    this.apps.forEach((app, index) => {
        const button = this.createAppButton(app, index);
        container.appendChild(button);
    });
}
```

### WARNING: innerHTML with User Data

**The Problem:**

```javascript
// BAD - XSS vulnerability with user-controlled data
container.innerHTML = `<p>${userInput}</p>`;
```

**Why This Breaks:**
1. User can inject `<script>` tags or event handlers
2. Opens door to session hijacking, data theft
3. Firebase rules validate server-side, but client still renders

**The Fix:**

```javascript
// GOOD - Use textContent for user data
const p = document.createElement('p');
p.textContent = userInput;
container.appendChild(p);

// OR escape HTML if innerHTML is necessary
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

---

## Event Handling Patterns

### Keyboard Shortcuts

```javascript
// GOOD - Modifier key combinations with preventDefault
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        this.handleAdminAccess();
    }
});

// Search shortcut
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchContainer.style.display = 'block';
        searchInput.focus();
    }
});
```

### Event Handler on Dynamic Elements

```javascript
// GOOD - Attach handler during creation
createAppButton(app, index) {
    const button = document.createElement('a');
    // ... setup ...
    
    button.addEventListener('click', (e) => {
        this.trackAppClick(app.id, app.name);
    });
    
    return button;
}
```

### Auth State Listener

```javascript
// GOOD - React to Firebase auth state changes
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
```

---

## Class Organization Patterns

### Controller Class Structure

```javascript
class PortalManager {
    constructor() {
        this.apps = [];
        this.init();
    }
    
    // Lifecycle
    async init() { }
    
    // Data
    async loadApps() { }
    loadFallbackApps() { }
    
    // Rendering
    renderApps() { }
    createAppButton(app, index) { }
    showError(message) { }
    
    // Events
    setupEventListeners() { }
    setupSearch() { }
    setupAdminAccess() { }
    
    // Actions
    filterApps(searchTerm) { }
    trackAppClick(appId, appName) { }
}
```

---

## Anti-Patterns

### WARNING: Polling for Dependencies

**The Problem:**

```javascript
// BAD - Arbitrary timeout hoping Firebase loads
await new Promise(resolve => setTimeout(resolve, 1000));
```

**Why This Breaks:**
1. Slow networks may need more than 1 second
2. Fast networks waste time waiting
3. No actual verification of readiness

**The Fix:**

```javascript
// GOOD - Poll with condition check
async waitForFirebase(maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        if (window.firebase?.db) return true;
        await new Promise(r => setTimeout(r, 200));
    }
    return false;
}
```

### WARNING: Global onclick in HTML

**The Problem:**

```javascript
// BAD - onclick in HTML requires global functions
<button onclick="removeApp(${index})">Remove</button>

// Forces this pattern:
window.removeApp = removeApp;
```

**Why This Breaks:**
1. Pollutes global namespace
2. Functions must be global before HTML renders
3. Harder to refactor and test

**The Fix:**

```javascript
// GOOD - Add listeners in JavaScript
const button = document.createElement('button');
button.addEventListener('click', () => removeApp(index));
```