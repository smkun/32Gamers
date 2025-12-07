# Legacy Express Backend Files

This folder contains **unused legacy code** from the original Express.js backend implementation.

## ⚠️ Status: NOT IN PRODUCTION

These files are **NOT used** in the current production deployment on ifastnet Ultimate. The live site uses:
- Static HTML/CSS/JavaScript files
- Firebase for backend (authentication + database)

## 📁 Contents

### Node.js Backend (Unused)
- `app.js` - Express server (port 3000)
- `package.json` - Node dependencies
- `package-lock.json` - Dependency lock file
- `node_modules/` - NPM packages (23+ MB)

### Data & Views (Unused)
- `members.js` - Static member data array
- `views/` - EJS template files
  - `partials/` - Shared components (head, nav, footer)
  - `home.ejs`, `members.ejs`, `games.ejs`, etc.
- `public/` - Static assets for Express
  - `css/styles.css`
  - `js/script.js`
  - `images/`

## 🔄 Migration History

**Original Architecture** (Legacy):
```
Browser → Express Server (app.js) → EJS Templates → Static HTML
```

**Current Architecture** (Production):
```
Browser → Static HTML → Firebase SDK → Cloud Firestore
```

## 🗑️ Safe to Delete?

**Yes**, these files can be safely deleted if you:
1. Have confirmed the production site works without them
2. Have committed to version control (git) for backup
3. Don't plan to use the Express backend in the future

**Reasons to Keep**:
- Local development/testing
- Reference for member data structure
- Potential future migration to server-side rendering

## 📊 Disk Space Savings

Removing this folder would save approximately **25-30 MB** from deployment uploads to ifastnet Ultimate.

**Current Production Files** (needed on server):
```
index.html
firebase-admin.html
style.css
scripts/
  ├── firebase-config.js
  └── app.js
assets/
  ├── images/
  └── favicons/
docs/
  └── FIREBASE-SETUP.md
```

## 🔄 If You Need to Restore

If you ever need to run the Express backend:

```bash
# From project root
cd OLD
npm install  # Reinstall dependencies
node app.js  # Start server on localhost:3000
```

Then visit: `http://localhost:3000`

---

**Moved to OLD/**: 2025-12-07
**Reason**: Cleanup of unused legacy Express backend
**Production Hosting**: ifastnet Ultimate (static files only, PHP/MySQL unused)
