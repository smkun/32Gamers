# Activation & Onboarding Reference

## Contents
- Current State Analysis
- First-Run Detection Patterns
- Onboarding Component Patterns
- Admin Setup Flow
- Anti-Patterns

---

## Current State Analysis

The 32Gamers portal has **no onboarding flow**. Users see a loading screen, then the app grid.

**Existing loading state** (`index.html:65-80`):
```html
<div class="loading-placeholder" id="loading">
    <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-progress">
            <div class="progress-bar"></div>
        </div>
        <div class="loading-text">[INITIALIZING NEURAL LINK]</div>
    </div>
</div>
```

This is purely decorative—no user guidance or feature introduction.

---

## First-Run Detection Patterns

### DO: Use localStorage for First-Visit Detection

```javascript
// scripts/app.js - Add to PortalManager constructor
class PortalManager {
    constructor() {
        this.isFirstVisit = !localStorage.getItem('32gamers_visited');
        if (this.isFirstVisit) {
            this.showWelcome();
            localStorage.setItem('32gamers_visited', 'true');
        }
        this.loadApps();
    }

    showWelcome() {
        // Insert welcome modal before app grid
        const welcome = document.createElement('div');
        welcome.className = 'welcome-overlay';
        welcome.innerHTML = `
            <div class="welcome-modal">
                <h2>Welcome to 32Gamers Club</h2>
                <p>Your gaming portal. Press <kbd>Ctrl+F</kbd> to search.</p>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Enter Portal
                </button>
            </div>
        `;
        document.body.appendChild(welcome);
    }
}
```

### DON'T: Rely on Server-Side Session

```javascript
// BAD - Firebase Auth doesn't track "first login ever"
onAuthStateChanged(auth, (user) => {
    if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        // UNRELIABLE: This checks Firebase account creation, not portal usage
        showOnboarding();
    }
});
```

**Why this breaks:** A user could have a Google account for years but be new to your portal.

---

## Onboarding Component Patterns

### Welcome Modal Structure

```css
/* style.css - Cyberpunk welcome overlay */
.welcome-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 30, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.welcome-modal {
    background: var(--cyber-dark);
    border: 2px solid var(--neon-cyan);
    padding: 2rem;
    max-width: 500px;
    box-shadow: 0 0 30px var(--neon-cyan);
}

.welcome-modal kbd {
    background: var(--cyber-gray);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
}
```

### Progressive Feature Introduction

```javascript
// Reveal features one at a time, not all at once
const onboardingSteps = [
    { target: '.app-grid', message: 'Browse gaming apps here' },
    { target: '.admin-icon', message: 'Admins: Click to manage apps' },
    { target: '.search-container', message: 'Press Ctrl+F to search' }
];

function showStep(index) {
    if (index >= onboardingSteps.length) return;
    const step = onboardingSteps[index];
    highlightElement(step.target, step.message, () => showStep(index + 1));
}
```

---

## Admin Setup Flow

The admin panel (`firebase-admin.html`) has a basic empty state:

```javascript
// firebase-admin.html:267-269 - Current implementation
if (apps.length === 0) {
    appList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No apps found. Add your first app above!</p>';
    return;
}
```

### DO: Add Contextual Form Guidance

```javascript
// Enhanced admin form with inline help
const formHtml = `
<form id="appForm">
    <div class="form-group">
        <label for="appId">App ID</label>
        <input type="text" id="appId" placeholder="my-new-app" required>
        <small class="help-text">Unique identifier, lowercase, no spaces</small>
    </div>
    <!-- ... other fields with help-text ... -->
</form>
`;
```

### DON'T: Show All Fields Without Context

```html
<!-- BAD - firebase-admin.html current state -->
<input type="text" id="appUrl" placeholder="MyNewApp/index.html" required>
<!-- User doesn't know: relative or absolute? What format? -->
```

---

## Anti-Patterns

### WARNING: Blocking Onboarding

**The Problem:**
```javascript
// BAD - Forces onboarding before any access
if (isFirstVisit) {
    document.body.innerHTML = '<div class="onboarding-wizard">...</div>';
    // User cannot skip or explore
}
```

**Why This Breaks:**
1. Returning users who cleared localStorage see onboarding again
2. No way to skip—frustrates experienced users
3. Blocks access to actual content

**The Fix:**
```javascript
// GOOD - Non-blocking, dismissible
if (isFirstVisit) {
    showWelcomeToast(); // Small, dismissible notification
}
// App loads normally regardless
this.loadApps();
```

### WARNING: Onboarding Without Persistence

**The Problem:**
```javascript
// BAD - No persistence
showOnboardingModal();
// User refreshes → sees onboarding again
```

**Why This Breaks:** Users see the same "welcome" every page load.

**The Fix:**
```javascript
// GOOD - Persist completion
if (!localStorage.getItem('onboarding_complete')) {
    showOnboardingModal();
}
// In modal dismiss handler:
localStorage.setItem('onboarding_complete', 'true');
```

---

## Activation Checklist

Copy this checklist when implementing onboarding:

- [ ] Add first-visit detection with localStorage
- [ ] Create dismissible welcome component
- [ ] Style with cyberpunk theme (see **css** skill)
- [ ] Add keyboard shortcut hints (Ctrl+F, Ctrl+Alt+A)
- [ ] Track onboarding completion (see **instrumenting-product-metrics** skill)
- [ ] Test with cleared localStorage
- [ ] Verify mobile responsiveness