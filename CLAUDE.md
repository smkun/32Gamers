# 32Gamers Club Portal

A cyberpunk-themed gaming community portal serving as a centralized hub for gaming applications. Features a dynamic app catalog with real-time Firebase backend, Google OAuth authentication, and a sleek admin interface for managing the app catalog.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | Vanilla JavaScript | ES6+ | Portal manager, DOM manipulation |
| Styling | CSS3 | Modern | Cyberpunk UI with animations, custom properties |
| Database | Cloud Firestore | 10.x | Real-time NoSQL app catalog storage |
| Auth | Firebase Auth | 10.x | Google OAuth for admin access |
| Hosting | ifastnet Ultimate | - | Static file hosting |
| Fonts | Google Fonts | - | Orbitron + JetBrains Mono |

## Quick Start

```bash
# Prerequisites
# - Web browser (Chrome, Firefox, Safari)
# - Python 3.x OR Node.js (for local server)
# - Firebase project (for full functionality)

# Clone and navigate
git clone <repository-url>
cd 32gamers-club

# Start local development server
python3 -m http.server 8000
# OR
npx http-server -p 8000

# Access the portal
# Main portal: http://localhost:8000
# Admin panel: http://localhost:8000/firebase-admin.html
```

## Project Structure

```
32gamers-club/
├── index.html              # Main portal page with cyberpunk UI
├── firebase-admin.html     # Admin interface (pure markup)
├── style.css               # Global cyberpunk styles with CSS custom properties
├── robots.txt              # SEO robots file
├── sitemap.xml             # SEO sitemap
├── scripts/
│   ├── firebase-config.js  # Firebase SDK initialization
│   ├── app.js              # PortalManager class - app loading/rendering
│   └── admin.js            # Admin panel logic (extracted from HTML)
├── assets/
│   ├── images/             # App icons (WebP format)
│   └── favicons/           # Site favicons
├── tools/                  # Development utilities (not deployed)
│   ├── deploy.ps1          # Deployment script - creates dist/ folder
│   ├── convert-to-webp.py  # Image conversion utility
│   └── compress-images.ps1 # Image compression utility
├── docs/
│   ├── FIREBASE-SETUP.md   # Firebase project configuration guide
│   └── DEPLOYMENT-GUIDE.md # ifastnet deployment instructions
├── dist/                   # Production build output (gitignored)
├── OLD/                    # Archived files (not deployed)
└── firebaseRules.txt       # Firestore security rules reference
```

## Architecture Overview

The portal follows a serverless static architecture:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser       │     │   Firebase SDK   │     │   Firestore     │
│   (Static HTML) │ ──▶ │   (Client-side)  │ ──▶ │   (apps/*)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Firebase Auth   │
                        │  (Google OAuth)  │
                        └──────────────────┘
```

**Data Flow:**
1. `index.html` loads `app.js` which instantiates `PortalManager`
2. `PortalManager.loadApps()` fetches documents from Firestore `apps` collection
3. Apps are rendered as cyberpunk-styled cards with hover animations
4. Admin panel (`firebase-admin.html`) provides CRUD operations behind Google OAuth

### Key Modules

| Module | Location | Purpose |
|--------|----------|---------|
| PortalManager | `scripts/app.js` | Main controller - loads apps, renders UI, handles search |
| Firebase Config | `scripts/firebase-config.js` | Initializes Firebase SDK, exports db/auth instances |
| Admin Panel | `scripts/admin.js` | Admin CRUD operations, validation, auth state handling |

## Development Guidelines

### Code Style

- **File naming**: kebab-case for multi-word files (`firebase-config.js`, `firebase-admin.html`)
- **Class naming**: PascalCase (`PortalManager`)
- **Function naming**: camelCase (`loadApps`, `renderApps`, `handleAdminAccess`)
- **Variable naming**: camelCase (`currentUser`, `firebaseApps`, `querySnapshot`)
- **Constants**: camelCase at module level (`firebaseConfig`)
- **CSS variables**: kebab-case with semantic prefixes (`--neon-cyan`, `--cyber-dark`, `--glow-magenta`)

### JavaScript Patterns

- ES6 modules for Firebase imports via CDN URLs
- Class-based organization for main functionality (`PortalManager`)
- Async/await for Firebase operations
- Global `window.firebase` object for cross-script access
- Event delegation and DOM manipulation via vanilla JS

### CSS Patterns

- CSS custom properties in `:root` for theming
- BEM-like naming (`.button-container`, `.loading-placeholder`)
- Cyberpunk aesthetic: neon colors, glitch effects, scanlines
- Responsive design with media queries (1024px, 768px, 480px breakpoints)
- `prefers-reduced-motion` support for accessibility

### Import Order (JS)

```javascript
// 1. Firebase SDK imports from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 2. Local config/constants
const firebaseConfig = { ... };

// 3. Initialization
const app = initializeApp(firebaseConfig);
```

## Available Commands

| Command | Description |
|---------|-------------|
| `python3 -m http.server 8000` | Start local dev server (Python) |
| `npx http-server -p 8000` | Start local dev server (Node.js) |
| `powershell -ExecutionPolicy Bypass -File tools/deploy.ps1` | Build production dist/ folder |
| `python tools/convert-to-webp.py` | Convert images to WebP format |

**Note:** Client-side Firebase config is in `scripts/firebase-config.js`. For production, update:
- `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

## Firebase Configuration

### Firestore Collection Structure

```
apps/
├── {appId}
│   ├── appId: string        # Unique identifier
│   ├── name: string         # Display name
│   ├── description: string  # Brief description
│   ├── url: string          # Link to app (relative or absolute)
│   ├── image: string        # Icon filename in assets/images/
│   ├── createdAt: timestamp # (optional)
│   ├── createdBy: string    # (optional) Admin email
│   ├── updatedAt: timestamp # (optional)
│   └── updatedBy: string    # (optional) Admin email
```

### Security Rules

See `firebaseRules.txt` for complete rules. Key points:
- Public read access to `apps` collection
- Write access restricted to specific admin UID
- Schema validation for all required fields
- URL injection protection
- Field length limits (name: 100, description: 500, url: 200)

### Admin Access

1. Navigate to `firebase-admin.html` (or press `Ctrl+Alt+A` from main portal)
2. Sign in with authorized Google account
3. Add/Edit/Delete apps through the admin interface

**Keyboard Shortcuts:**
- `Ctrl+Alt+A`: Access admin panel
- `Ctrl+F`: Open search (on main portal)

## Testing

### Local Testing Checklist

1. Start local server: `python3 -m http.server 8000`
2. Test main portal loads apps from Firebase
3. Test search functionality (`Ctrl+F`)
4. Test admin login with Google OAuth
5. Test app CRUD operations in admin panel
6. Test responsive design at mobile breakpoints

### Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Deploy to ifastnet Ultimate

**Build and deploy:**
```powershell
# Run from project root to create dist/ folder:
powershell -ExecutionPolicy Bypass -File tools/deploy.ps1

# Upload contents of dist/ folder to ifastnet
```

**What gets deployed (in dist/):**
- `index.html`, `firebase-admin.html`, `style.css`
- `robots.txt`, `sitemap.xml`
- `scripts/` (firebase-config.js, app.js, admin.js)
- `assets/` (images, favicons)

**What stays out of production:**
- `tools/`, `docs/`, `OLD/`
- `node_modules/`, `.git/`, `.claude/`
- All markdown files

See @docs/DEPLOYMENT-GUIDE.md for detailed instructions.

### Pre-deployment Checklist

- [ ] Firebase config updated in `scripts/firebase-config.js`
- [ ] Domain added to Firebase Auth authorized domains
- [ ] Firestore security rules deployed
- [ ] All assets/images uploaded
- [ ] Test locally before upload

## Additional Resources

- @docs/FIREBASE-SETUP.md - Firebase project setup guide
- @docs/DEPLOYMENT-GUIDE.md - ifastnet deployment instructions
- @firebaseRules.txt - Firestore security rules
- @TODO.md - Optimization tracking and action items
- [Firebase Console](https://console.firebase.google.com/project/gamersadmin-f1657)

## Changelog

### 2026-02-04 - Comprehensive Optimization

Full optimization pass tracked in @TODO.md. Key improvements:

**Security**
- Fixed XSS vulnerabilities in admin panel (textContent instead of innerHTML)
- Added comprehensive input validation with URL/ID sanitization
- Event delegation replaces inline onclick handlers

**Performance**
- Images converted to WebP (95.6% size reduction: 20MB → 907KB)
- Firebase loading uses exponential backoff instead of arbitrary delay
- Lazy loading added to app card images
- Font weights reduced from 9 to 4 (~40% font download savings)

**Accessibility & SEO**
- Semantic HTML (main, header, section, button with aria-labels)
- Full SEO meta tags (Open Graph, Twitter Cards, JSON-LD structured data)
- robots.txt and sitemap.xml added
- Canonical URL: https://32gamers.com/

**Code Quality**
- Admin panel JS extracted to `scripts/admin.js` (390 lines → 88 lines HTML)
- CSS custom properties for maintainability
- Dead code removed (trackAppClick, unused admin functions)
- Deployment script created (`tools/deploy.ps1`)

**Project Organization**
- `tools/` folder for dev utilities (not deployed)
- `dist/` build output for clean deployments
- Consolidated docs into single `docs/` folder
- Archived unused files to `OLD/`

## Skill Usage Guide

When working on tasks involving these technologies, invoke the corresponding skill:

| Skill | Invoke When |
|-------|-------------|
| firebase | Configures Firebase SDK, authentication, Firestore database operations, and real-time data |
| css | Implements cyberpunk UI with custom properties, neon effects, animations, and responsive design |
| frontend-design | Designs cyberpunk-themed UI with neon colors, glitch effects, scanlines, and gradient animations |
| google-oauth | Implements Google OAuth authentication and manages admin access control |
| vanilla-javascript | Manages ES6+ syntax, DOM manipulation, async/await, and class-based organization |
| firestore | Manages Firestore collections, document schemas, security rules, and NoSQL queries |
| mapping-user-journeys | Maps in-app journeys and identifies friction points in code |
| designing-onboarding-paths | Designs onboarding paths, checklists, and first-run UI |
| clarifying-market-fit | Aligns ICP, positioning, and value narrative for on-page messaging |
| orchestrating-feature-adoption | Plans feature discovery, nudges, and adoption flows |
| instrumenting-product-metrics | Defines product events, funnels, and activation metrics |
| crafting-page-messaging | Writes conversion-focused messaging for pages and key CTAs |
| structuring-offer-ladders | Frames plan tiers, value ladders, and upgrade logic |
| tuning-landing-journeys | Improves landing page flow, hierarchy, and conversion paths |
| adding-structured-signals | Adds structured data for rich results |
| inspecting-search-coverage | Audits technical and on-page search coverage |
| mapping-conversion-events | Defines funnel events, tracking, and success signals |
