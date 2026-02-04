# Firestore Patterns Reference

## Contents
- CRUD Operations
- Security Rules
- Error Handling
- Anti-Patterns

---

## CRUD Operations

### Reading All Documents

```javascript
// From scripts/app.js:24
const querySnapshot = await window.firebase.getDocs(
    window.firebase.collection(window.firebase.db, 'apps')
);

const firebaseApps = [];
querySnapshot.forEach((doc) => {
    const app = doc.data();
    firebaseApps.push({
        id: app.appId,
        name: app.name,
        url: app.url,
        image: app.image,
        description: app.description
    });
});
```

### Creating a Document

```javascript
// From firebase-admin.html:199
// Use appId as document ID for predictable lookups
await firebase.setDoc(
    firebase.doc(firebase.db, 'apps', newApp.appId),
    newApp
);
```

### Updating a Document

```javascript
// From firebase-admin.html:204
// Preserve original metadata, add update tracking
await firebase.setDoc(firebase.doc(firebase.db, 'apps', existingApp.appId), {
    ...newApp,
    createdAt: existingApp.createdAt,  // Keep original
    createdBy: existingApp.createdBy,  // Keep original
    updatedAt: new Date(),
    updatedBy: currentUser.email
});
```

### Deleting a Document

```javascript
// From firebase-admin.html:255
await firebase.deleteDoc(firebase.doc(firebase.db, 'apps', app.appId));
```

---

## Security Rules

### Current Production Rules (firebaseRules.txt)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny everything by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Apps collection: public read, admin-only write
    match /apps/{docId} {
      allow read: if true;
      allow create, update, delete: if isAdmin() && validAppsDoc();

      function isAdmin() {
        return request.auth != null
               && request.auth.uid == '9mbW4MTdXSMvGdlgUIJu5DOWMZW2';
      }

      function validAppsDoc() {
        let required = ['appId', 'name', 'url', 'image', 'description'];
        let allowed = ['appId', 'name', 'url', 'image', 'description', 
                       'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];

        let data = request.resource.data;
        let hasRequired = required.toSet().difference(data.keys().toSet()).size() == 0;
        let keysValid = data.keys().hasOnly(allowed);

        let typesValid = data.appId is string && data.appId.size() > 0
                      && data.name is string && data.name.size() > 0
                      && data.url is string && data.url.size() > 0
                      && data.image is string && data.image.size() > 0
                      && data.description is string && data.description.size() > 0;

        // URL injection protection
        let urlSafe = !data.url.matches('.*[<>"\';\\(\\)].*');

        // Field length limits
        let lengthsValid = data.appId.size() <= 50
                        && data.name.size() <= 100
                        && data.url.size() <= 200
                        && data.image.size() <= 100
                        && data.description.size() <= 500;

        return hasRequired && keysValid && typesValid && urlSafe && lengthsValid;
      }
    }
  }
}
```

---

## Error Handling

### Comprehensive Error Handler

```javascript
// From firebase-admin.html:157-168
try {
    const querySnapshot = await firebase.getDocs(firebase.collection(firebase.db, 'apps'));
    // Process results
} catch (error) {
    console.error('Load error:', error);
    
    if (error.code === 'unavailable') {
        showStatus('Network error. Check connection.', 'error');
    } else if (error.code === 'permission-denied') {
        showStatus('Permission denied. Sign in as admin.', 'error');
    } else if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        showStatus('Request blocked by ad blocker.', 'error');
    } else {
        showStatus(`Failed: ${error.message}`, 'error');
    }
}
```

---

## Anti-Patterns

### WARNING: Missing Firebase Readiness Check

**The Problem:**

```javascript
// BAD - Firebase may not be initialized yet
const snapshot = await getDocs(collection(db, 'apps'));
```

**Why This Breaks:**
1. Firebase SDK loads async via CDN
2. `db` will be undefined if accessed too early
3. Results in cryptic "Cannot read property" errors

**The Fix:**

```javascript
// GOOD - From scripts/app.js:17-22
if (!window.firebase || !window.firebase.db) {
    console.log('Waiting for Firebase to initialize...');
    await new Promise(resolve => setTimeout(resolve, 1000));
}

if (window.firebase && window.firebase.db) {
    const snapshot = await window.firebase.getDocs(
        window.firebase.collection(window.firebase.db, 'apps')
    );
}
```

### WARNING: Auto-Generated Document IDs

**The Problem:**

```javascript
// BAD - Let Firestore generate random ID
await addDoc(collection(db, 'apps'), appData);
```

**Why This Breaks:**
1. Can't lookup documents without querying
2. Harder to prevent duplicates
3. Document ID doesn't relate to content

**The Fix:**

```javascript
// GOOD - Use appId as document ID (from firebase-admin.html:199)
await firebase.setDoc(
    firebase.doc(firebase.db, 'apps', newApp.appId),
    newApp
);
```

### WARNING: Overwriting Metadata on Update

**The Problem:**

```javascript
// BAD - Loses creation metadata
await setDoc(doc(db, 'apps', id), newData);
```

**Why This Breaks:**
1. Overwrites `createdAt` and `createdBy`
2. Loses audit trail
3. Can't track document history

**The Fix:**

```javascript
// GOOD - Preserve original metadata (from firebase-admin.html:204-210)
await firebase.setDoc(firebase.doc(firebase.db, 'apps', existingApp.appId), {
    ...newApp,
    createdAt: existingApp.createdAt,
    createdBy: existingApp.createdBy,
    updatedAt: new Date(),
    updatedBy: currentUser.email
});
```

### WARNING: Permissive Security Rules

**The Problem:**

```javascript
// BAD - Anyone can write anything
match /apps/{docId} {
  allow read, write: if true;
}
```

**Why This Breaks:**
1. Anyone can delete your entire collection
2. No schema validation - garbage data accepted
3. No audit trail

**The Fix:**

Use the production rules in `firebaseRules.txt` with:
- UID-based admin check
- Required field validation
- Type checking
- URL injection protection
- Field length limits