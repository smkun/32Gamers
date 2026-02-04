# Vanilla JavaScript Types Reference

## Contents
- Data Structures
- Type Validation
- Type Coercion Pitfalls
- Nullish Handling

---

## Data Structures

### App Data Structure

```javascript
// Standard app object shape from Firestore
const app = {
    appId: 'my-app',           // string - unique identifier
    name: 'My App',            // string - display name
    url: 'MyApp/index.html',   // string - relative or absolute URL
    image: 'my-app.png',       // string - filename in assets/images/
    description: 'Brief desc', // string - tooltip/alt text
    createdAt: new Date(),     // Date - optional timestamp
    createdBy: 'user@email',   // string - optional admin email
    updatedAt: new Date(),     // Date - optional
    updatedBy: 'user@email'    // string - optional
};
```

### Firebase User Object

```javascript
// Properties used from Firebase Auth user
const user = {
    uid: '9mbW4MTdX...',       // string - unique user ID
    email: 'user@gmail.com',   // string - user email
    displayName: 'User Name',  // string|null - display name
    photoURL: 'https://...',   // string|null - avatar URL
};
```

---

## Type Validation

### Form Validation Pattern

```javascript
// GOOD - Validate all required fields before submission
async function addApp() {
    const newApp = {
        appId: document.getElementById('appId').value.trim(),
        name: document.getElementById('appName').value.trim(),
        url: document.getElementById('appUrl').value.trim(),
        image: document.getElementById('appImage').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
    };
    
    // All fields required
    if (!newApp.appId || !newApp.name || !newApp.url || 
        !newApp.image || !newApp.description) {
        showStatus('Please fill in all fields', 'error');
        return;
    }
    
    // Check for duplicates
    if (apps.find(app => app.appId === newApp.appId)) {
        showStatus('App ID already exists', 'error');
        return;
    }
    
    // Proceed with save...
}
```

### Checking Object Existence

```javascript
// GOOD - Optional chaining for nested property access
if (!window.firebase?.db) {
    console.log('Firebase not ready');
}

// GOOD - Check element exists before manipulating
const container = document.querySelector('.button-container');
if (!container) return;
```

---

## Type Coercion Pitfalls

### WARNING: Truthy/Falsy Confusion

**The Problem:**

```javascript
// BAD - Empty string is falsy but might be valid
if (app.description) {
    // Won't run for empty string ""
}

// BAD - 0 is falsy but might be valid index
if (index) {
    // Won't run when index is 0
}
```

**The Fix:**

```javascript
// GOOD - Explicit checks
if (app.description !== undefined && app.description !== null) { }

// GOOD - Check type for array index
if (typeof index === 'number') { }

// GOOD - Check length for strings
if (app.description.length > 0) { }
```

### WARNING: Loose Equality

**The Problem:**

```javascript
// BAD - Loose equality has surprising results
null == undefined  // true
0 == ''           // true
'0' == false      // true
```

**The Fix:**

```javascript
// GOOD - Always use strict equality
if (app.id === null) { }
if (index === 0) { }
```

---

## Nullish Handling

### Default Values

```javascript
// GOOD - Nullish coalescing for defaults
document.getElementById('userName').textContent = user.displayName ?? 'User';
document.getElementById('userAvatar').src = user.photoURL ?? '';

// GOOD - Logical OR for falsy defaults (when 0/'' are invalid)
const timeout = config.timeout || 5000;
```

### Safe Property Access

```javascript
// GOOD - Optional chaining prevents errors
const db = window.firebase?.db;
const apps = querySnapshot?.docs ?? [];

// GOOD - Default destructuring
const { name = 'Unknown', url = '#' } = app;
```

### Array Operations with Fallbacks

```javascript
// GOOD - Filter returns empty array, not undefined
const filtered = this.apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
);

if (filtered.length === 0) {
    container.innerHTML = '<p class="no-results">No apps found.</p>';
    return;
}

// GOOD - Find returns undefined if not found
const existingApp = apps.find(a => a.appId === newApp.appId);
if (existingApp) {
    showStatus('App ID already exists', 'error');
    return;
}
```

---

## Working with Dates

### Firestore Timestamps

```javascript
// Creating timestamps for Firestore
const newApp = {
    // ...
    createdAt: new Date(),
    createdBy: currentUser.email
};

// On update, preserve original creation data
await firebase.setDoc(firebase.doc(firebase.db, 'apps', appId), {
    ...newApp,
    createdAt: existingApp.createdAt,  // Preserve original
    createdBy: existingApp.createdBy,
    updatedAt: new Date(),             // Track update
    updatedBy: currentUser.email
});
```

### Type from DOM

```javascript
// DOM values are always strings
const input = document.getElementById('count').value; // "5" string

// GOOD - Parse when needed
const count = parseInt(input, 10);
const price = parseFloat(priceInput);

// GOOD - Check for NaN after parsing
if (isNaN(count)) {
    showStatus('Invalid number', 'error');
    return;
}
```