# Firestore Workflows Reference

## Contents
- Local Development Setup
- Security Rules Deployment
- Admin SDK Usage
- Testing Checklist
- Troubleshooting

---

## Local Development Setup

### 1. Start Local Server

```bash
# Python
python3 -m http.server 8000

# OR Node.js
npx http-server -p 8000
```

### 2. Test Portal Loads Apps

1. Open `http://localhost:8000`
2. Verify apps load from Firebase (check console for "Successfully loaded X apps from Firebase")
3. Check Network tab for `firestore.googleapis.com` requests

### 3. Test Admin Panel

1. Open `http://localhost:8000/firebase-admin.html`
2. Sign in with authorized Google account
3. Verify app list populates

---

## Security Rules Deployment

### Deployment Checklist

Copy this checklist and track progress:
- [ ] Open Firebase Console → Firestore Database → Rules
- [ ] Copy rules from `firebaseRules.txt` (lines 1-56, exclude `###OLD###` section)
- [ ] Paste into Rules editor
- [ ] Click "Publish"
- [ ] Test by attempting unauthorized write (should fail)
- [ ] Test authorized admin can still write

### Rules Validation Loop

1. Edit `firebaseRules.txt` locally
2. Copy to Firebase Console
3. Click "Publish"
4. Test with unauthorized user
5. If write succeeds when it shouldn't, fix rules and repeat step 2
6. Only proceed when security tests pass

### Testing Security Rules

```javascript
// In browser console (not logged in)
// This should fail with permission-denied
firebase.setDoc(firebase.doc(firebase.db, 'apps', 'test'), {
    appId: 'test',
    name: 'Test',
    url: 'test.html',
    image: 'test.png',
    description: 'Test'
});
```

---

## Admin SDK Usage

### Setup for Node.js Scripts

```bash
# Set credentials path
export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccount.json"

# Run fetch script
node fetch-apps.js
```

### Admin SDK Pattern (fetch-apps.js)

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'gamersadmin-f1657'
});

const db = admin.firestore();

async function fetchApps() {
    const snapshot = await db.collection('apps').get();
    
    if (snapshot.empty) {
        console.log('No apps found');
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`App: ${data.name} (${data.appId})`);
    });
}
```

---

## Adding a New Collection

### Workflow Checklist

Copy this checklist and track progress:
- [ ] Define document schema (required/optional fields)
- [ ] Add security rules to `firebaseRules.txt`
- [ ] Deploy rules to Firebase Console
- [ ] Create client-side read function
- [ ] Create admin write functions (if needed)
- [ ] Test CRUD operations
- [ ] Test security rules block unauthorized access

### Example: Adding a `users` Collection

```javascript
// firebaseRules.txt - add to rules
match /users/{userId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if request.auth != null && request.auth.uid == userId;
}
```

---

## Testing Checklist

### Before Deployment

- [ ] Apps load on main portal (`index.html`)
- [ ] Search filters apps correctly (Ctrl+F)
- [ ] Admin login works (`firebase-admin.html`)
- [ ] Add new app succeeds
- [ ] Edit existing app preserves `createdAt`
- [ ] Delete app removes from list
- [ ] Unauthorized users cannot write
- [ ] All required fields enforced by rules

---

## Troubleshooting

### Issue: "Loading apps..." Never Completes

**Causes & Solutions:**

1. **Firebase SDK not loaded**
   - Check Network tab for CDN errors
   - Verify `firebase-config.js` imports work

2. **Wrong credentials**
   - Verify `firebaseConfig` in `scripts/firebase-config.js`
   - Check `projectId` matches Firebase Console

3. **Security rules blocking reads**
   - Check rules have `allow read: if true;` for `apps` collection

### Issue: "Permission Denied" on Write

**Causes & Solutions:**

1. **Not logged in**
   - Check `currentUser` is set before write

2. **Wrong admin UID**
   - Verify UID in security rules matches your account
   - Find your UID: `firebase.auth.currentUser.uid`

3. **Schema validation failed**
   - Check all required fields present
   - Check field lengths under limits
   - Check URL doesn't contain blocked characters

### Issue: Ad Blocker Interference

**Solution:**
Check for `ERR_BLOCKED_BY_CLIENT` error. Ad blockers may block `firestore.googleapis.com`. Disable for localhost or production domain.

### Issue: CORS Errors

**Solution:**
Add your domain to Firebase Console → Authentication → Settings → Authorized domains.

---

## Firebase Console Quick Links

| Resource | URL |
|----------|-----|
| Project | https://console.firebase.google.com/project/gamersadmin-f1657 |
| Firestore | https://console.firebase.google.com/project/gamersadmin-f1657/firestore |
| Rules | https://console.firebase.google.com/project/gamersadmin-f1657/firestore/rules |
| Auth | https://console.firebase.google.com/project/gamersadmin-f1657/authentication |