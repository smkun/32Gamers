# Firebase Workflows Reference

## Contents
- Initial Setup Workflow
- Adding New Apps Workflow
- Debugging Firebase Issues
- Deployment Checklist

---

## Initial Setup Workflow

### Firebase Project Configuration

Copy this checklist and track progress:
- [ ] Step 1: Create project at console.firebase.google.com
- [ ] Step 2: Enable Google Auth (Authentication > Sign-in method)
- [ ] Step 3: Create Firestore database (Firestore > Create database)
- [ ] Step 4: Get config (Project Settings > Your apps > Web app)
- [ ] Step 5: Update `scripts/firebase-config.js` with config
- [ ] Step 6: Add domain to authorized domains (Authentication > Settings)
- [ ] Step 7: Deploy security rules from `firebaseRules.txt`

### Config Update

```javascript
// scripts/firebase-config.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Security Rules Deployment

1. Open Firebase Console > Firestore > Rules
2. Copy contents of `firebaseRules.txt`
3. Paste and click "Publish"

Validation loop:
1. Publish rules
2. Test CRUD operations in admin panel
3. If permission errors occur, check rule syntax
4. Repeat until all operations work

---

## Adding New Apps Workflow

### Via Admin Panel

1. Navigate to `firebase-admin.html`
2. Sign in with authorized Google account
3. Fill form fields:
   - App ID: `my-new-app` (unique, kebab-case)
   - Name: `My New App`
   - URL: `MyNewApp/index.html` (relative) or `https://...` (absolute)
   - Image: `my-app-icon.png` (must exist in `assets/images/`)
   - Description: Brief text (max 500 chars)
4. Click "Add App"
5. Verify app appears on main portal

### Programmatic Creation

```javascript
const newApp = {
    appId: 'my-new-app',
    name: 'My New App',
    url: 'MyNewApp/index.html',
    image: 'my-app-icon.png',
    description: 'Brief description',
    createdAt: new Date(),
    createdBy: currentUser.email
};

await firebase.setDoc(
    firebase.doc(firebase.db, 'apps', newApp.appId),
    newApp
);
```

---

## Debugging Firebase Issues

### Issue: "Loading apps..." Never Completes

Debug steps:
1. Open DevTools Console (F12)
2. Check for Firebase errors
3. Verify `window.firebase` exists: `console.log(window.firebase)`
4. Test Firestore connection: `firebase.getDocs(firebase.collection(firebase.db, 'apps'))`

Common causes:
- Ad blocker blocking Firebase domains
- Incorrect `firebaseConfig` values
- Security rules blocking read access

### Issue: "Unauthorized domain" on Login

Fix:
1. Firebase Console > Authentication > Settings > Authorized domains
2. Add your domain (e.g., `yoursite.com`, `localhost`)
3. Wait 5 minutes for propagation
4. Retry login

### Issue: "Permission denied" on Write

Debug steps:
1. Verify you're logged in: `firebase.auth.currentUser`
2. Check your UID: `firebase.auth.currentUser.uid`
3. Compare with allowed UID in `firebaseRules.txt`
4. If UIDs don't match, update rules or use correct account

### Issue: CORS or Network Errors

Check for:
- Ad blockers (disable for Firebase domains)
- VPN/proxy interference
- Firewall blocking `*.googleapis.com`, `*.firebaseapp.com`

Use DevTools Network tab to identify blocked requests.

---

## Deployment Checklist

### Pre-Deployment

Copy this checklist and track progress:
- [ ] Firebase config in `scripts/firebase-config.js` has correct project ID
- [ ] Production domain added to Firebase Auth authorized domains
- [ ] Security rules deployed and tested
- [ ] All app images exist in `assets/images/`
- [ ] Local testing passes (`python3 -m http.server 8000`)

### Post-Deployment Verification

1. Main portal loads apps
2. Admin login works with Google OAuth
3. Add/Edit/Delete operations succeed
4. Mobile responsive design works
5. Console shows no errors

Validation loop:
1. Deploy files to hosting
2. Test all CRUD operations
3. If errors occur, check browser console
4. Fix issues and redeploy
5. Repeat until all tests pass

---

## File Dependencies

```
scripts/firebase-config.js    # Must load first
    ↓
scripts/app.js               # Uses window.firebase
    ↓
firebase-admin.html          # Imports firebase-config.js
```

**Load Order:** `firebase-config.js` MUST complete before any file accesses `window.firebase`.