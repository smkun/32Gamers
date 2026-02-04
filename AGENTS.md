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
├── firebase-admin.html     # Admin interface for CRUD operations
├── style.css               # Global cyberpunk styles (1200+ lines)
├── scripts/
│   ├── firebase-config.js  # Firebase SDK initialization
│   └── app.js              # PortalManager class - app loading/rendering
├── assets/
│   ├── images/             # App icons and 32Gamers logo
│   └── favicons/           # Site favicons for various apps
├── docs/
│   ├── FIREBASE-SETUP.md   # Firebase project configuration guide
│   └── DEPLOYMENT-GUIDE.md # ifastnet deployment instructions
├── firebaseRules.txt       # Firestore security rules (copy to Firebase Console)
├── fetch-apps.js           # Node.js utility for fetching apps via Admin SDK
├── OLD/                    # Archived Express.js backend (not used in production)
└── claudedocs/             # Technical documentation
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
| Admin Panel | `firebase-admin.html` | Inline JS module for app CRUD with auth state handling |

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
| `node fetch-apps.js` | Fetch apps via Firebase Admin SDK (requires GOOGLE_APPLICATION_CREDENTIALS) |

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | For Admin SDK only | Path to service account key | `./serviceAccount.json` |

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

**Files to upload:**
- `index.html`
- `firebase-admin.html`
- `style.css`
- `scripts/` directory
- `assets/` directory

**Do NOT upload:**
- `OLD/` directory
- `node_modules/`
- `.git/`, `.claude/`, `.serena/`
- `claudedocs/`
- `package.json`, `package-lock.json`

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
- [Firebase Console](https://console.firebase.google.com/project/gamersadmin-f1657)


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
