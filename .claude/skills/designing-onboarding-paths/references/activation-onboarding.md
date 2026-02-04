# Activation & Onboarding Reference

## Contents
- First-Visit Detection
- Welcome Modal Implementation
- Admin First-Login Flow
- Onboarding Checklist Pattern
- State Persistence
- Anti-Patterns

---

## First-Visit Detection

Use localStorage to track whether a user has visited before.

```javascript
// scripts/app.js - Add to PortalManager constructor
class PortalManager {
    constructor() {
        this.apps = [];
        this.isFirstVisit = !localStorage.getItem('32gamers_visited');
        this.init();
    }

    async init() {
        await this.loadApps();
        this.renderApps();
        this.setupEventListeners();
        
        if (this.isFirstVisit) {
            this.showWelcomeFlow();
            localStorage.setItem('32gamers_visited', Date.now().toString());
        }
    }
}
```

**DO:** Store timestamp instead of boolean for analytics.
**DON'T:** Check localStorage on every render—cache in constructor.

---

## Welcome Modal Implementation

```javascript
// scripts/app.js
showWelcomeFlow() {
    const modal = document.createElement('div');
    modal.className = 'onboarding-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content cyber-border">
            <div class="modal-header">
                <h2 class="glitch-text" data-text="WELCOME">WELCOME</h2>
                <span class="modal-subtitle">TO 32GAMERS CLUB</span>
            </div>
            <div class="modal-body">
                <p>Your portal to gaming applications.</p>
                <ul class="feature-list">
                    <li><kbd>Ctrl+F</kbd> Search apps</li>
                    <li><kbd>Ctrl+Alt+A</kbd> Admin panel</li>
                </ul>
            </div>
            <button class="cyber-btn primary" id="welcomeDismiss">
                ENTER THE GRID
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('welcomeDismiss').addEventListener('click', () => {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
    });
}
```

See the **css** skill for `.onboarding-modal` styling.

---

## Admin First-Login Flow

```javascript
// firebase-admin.html - Inside onAuthStateChanged
firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showUserSection(user);
        
        // Check if first admin login
        const adminOnboardingKey = `32gamers_admin_onboarded_${user.uid}`;
        if (!localStorage.getItem(adminOnboardingKey)) {
            showAdminOnboarding();
        } else {
            loadApps();
        }
    }
});

function showAdminOnboarding() {
    const onboarding = document.createElement('div');
    onboarding.className = 'admin-onboarding';
    onboarding.innerHTML = `
        <div class="onboarding-card cyber-border">
            <h3>ADMIN INITIALIZATION</h3>
            <div class="checklist">
                <label class="check-item">
                    <input type="checkbox" id="step1" checked disabled>
                    <span>Sign in with Google</span>
                </label>
                <label class="check-item">
                    <input type="checkbox" id="step2">
                    <span>Add your first app</span>
                </label>
                <label class="check-item">
                    <input type="checkbox" id="step3">
                    <span>Verify on main portal</span>
                </label>
            </div>
            <button class="cyber-btn" onclick="startAdminTutorial()">
                BEGIN TUTORIAL
            </button>
            <button class="cyber-btn secondary" onclick="skipOnboarding()">
                SKIP
            </button>
        </div>
    `;
    document.querySelector('.admin-container').prepend(onboarding);
}
```

---

## Onboarding Checklist Pattern

Track multi-step onboarding progress:

```javascript
// Onboarding state manager
const OnboardingTracker = {
    STORAGE_KEY: '32gamers_onboarding',
    
    getProgress() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            welcomeSeen: false,
            searchUsed: false,
            adminVisited: false,
            appAdded: false,
            completedAt: null
        };
    },
    
    markStep(step) {
        const progress = this.getProgress();
        progress[step] = true;
        
        // Check if all steps complete
        const steps = ['welcomeSeen', 'searchUsed', 'adminVisited', 'appAdded'];
        if (steps.every(s => progress[s])) {
            progress.completedAt = Date.now();
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        return progress;
    },
    
    isComplete() {
        return this.getProgress().completedAt !== null;
    }
};
```

**Usage:**

```javascript
// When user opens search
setupSearch() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
            this.toggleSearch();
            OnboardingTracker.markStep('searchUsed');
        }
    });
}
```

---

## State Persistence

### WARNING: Don't Use sessionStorage for Onboarding

**The Problem:**

```javascript
// BAD - Resets every browser session
sessionStorage.setItem('onboarding_complete', 'true');
```

**Why This Breaks:**
1. User closes tab, onboarding shows again next visit
2. Annoying repetition destroys trust
3. No way to track long-term activation

**The Fix:**

```javascript
// GOOD - Persists across sessions
localStorage.setItem('32gamers_onboarding', JSON.stringify({
    completedAt: Date.now(),
    version: '1.0'  // For future onboarding updates
}));
```

---

## Anti-Patterns

### WARNING: Blocking Content Before Onboarding

**The Problem:**

```javascript
// BAD - Forces onboarding before showing ANY content
async init() {
    if (this.isFirstVisit) {
        await this.showMandatoryOnboarding();  // Blocks everything
    }
    await this.loadApps();
}
```

**Why This Breaks:**
1. Users can't explore naturally
2. High bounce rate—users leave before completing
3. Feels like a gatekeeper, not a guide

**The Fix:**

```javascript
// GOOD - Load content first, overlay onboarding
async init() {
    await this.loadApps();
    this.renderApps();
    
    if (this.isFirstVisit) {
        this.showWelcomeOverlay();  // Non-blocking overlay
    }
}
```

### WARNING: No Skip Option

Always provide escape routes:

```html
<!-- GOOD - Multiple dismissal options -->
<div class="modal-footer">
    <button class="cyber-btn primary">START TOUR</button>
    <button class="cyber-btn ghost">SKIP FOR NOW</button>
    <a href="#" class="text-link">Don't show again</a>
</div>
```