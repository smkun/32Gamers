---
name: firestore
description: |
  Manages Firestore collections, document schemas, security rules, and NoSQL queries for the 32Gamers portal app catalog.
  Use when: performing CRUD operations on the apps collection, writing security rules, querying documents, handling Firestore errors, or designing document schemas.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Firestore Skill

Cloud Firestore backend for the 32Gamers portal. Single `apps` collection stores the app catalog. Client-side SDK v10.x via CDN. Security rules enforce admin-only writes with schema validation.

## Quick Start

### Reading All Apps

```javascript
// scripts/app.js - PortalManager.loadApps()
const querySnapshot = await window.firebase.getDocs(
    window.firebase.collection(window.firebase.db, 'apps')
);
querySnapshot.forEach((doc) => {
    const app = doc.data();
    // Use app.appId, app.name, app.url, app.image, app.description
});
```

### Writing a Document

```javascript
// firebase-admin.html - addApp()
await firebase.setDoc(
    firebase.doc(firebase.db, 'apps', newApp.appId),
    {
        appId: newApp.appId,
        name: newApp.name,
        url: newApp.url,
        image: newApp.image,
        description: newApp.description,
        createdAt: new Date(),
        createdBy: currentUser.email
    }
);
```

### Deleting a Document

```javascript
await firebase.deleteDoc(firebase.doc(firebase.db, 'apps', app.appId));
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| Collection | Group of documents | `collection(db, 'apps')` |
| Document | Single record with fields | `doc(db, 'apps', 'minecraft')` |
| Query Snapshot | Results from getDocs | `querySnapshot.forEach(doc => ...)` |
| Security Rules | Access control in `firebaseRules.txt` | `allow read: if true;` |
| setDoc | Create or overwrite | `setDoc(doc(db, 'apps', id), data)` |

## Document Schema

```
apps/{appId}
├── appId: string (required, max 50)
├── name: string (required, max 100)
├── url: string (required, max 200)
├── image: string (required, max 100)
├── description: string (required, max 500)
├── createdAt: timestamp (optional)
├── createdBy: string (optional)
├── updatedAt: timestamp (optional)
└── updatedBy: string (optional)
```

## Error Handling Pattern

```javascript
try {
    const querySnapshot = await firebase.getDocs(firebase.collection(firebase.db, 'apps'));
    // Process results
} catch (error) {
    if (error.code === 'unavailable') {
        showStatus('Network error. Check connection.', 'error');
    } else if (error.code === 'permission-denied') {
        showStatus('Permission denied. Sign in as admin.', 'error');
    } else {
        showStatus(`Error: ${error.message}`, 'error');
    }
}
```

## See Also

- [patterns](references/patterns.md) - CRUD operations, error handling, security rules
- [workflows](references/workflows.md) - Admin SDK setup, rule deployment, testing

## Related Skills

- See the **firebase** skill for SDK initialization and auth state management
- See the **google-oauth** skill for authentication flow
- See the **vanilla-javascript** skill for DOM manipulation patterns

## Documentation Resources

> Fetch latest Firestore documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "firebase firestore"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code repositories
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "firestore security rules"
- "firestore getDocs collection"
- "firestore setDoc deleteDoc"
- "firestore error handling"