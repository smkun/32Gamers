# Engagement & Adoption Reference

## Contents
- Feature Discovery Patterns
- Progressive Disclosure
- Nudge Implementation
- Return Visitor Recognition
- Anti-Patterns

---

## Feature Discovery Patterns

### Keyboard Shortcut Discovery

The portal has hidden shortcuts users should discover:

```javascript
// scripts/app.js - Hint system for keyboard shortcuts
class ShortcutHints {
    constructor() {
        this.hints = [
            { key: 'Ctrl+F', action: 'Search apps', shown: false },
            { key: 'Ctrl+Alt+A', action: 'Admin panel', shown: false }
        ];
        this.hintDelay = 30000;  // 30 seconds of inactivity
    }

    startHintTimer() {
        this.timer = setTimeout(() => {
            const unshown = this.hints.find(h => !h.shown);
            if (unshown) this.showHint(unshown);
        }, this.hintDelay);
    }

    showHint(hint) {
        hint.shown = true;
        const toast = document.createElement('div');
        toast.className = 'hint-toast';
        toast.innerHTML = `
            <span class="hint-key"><kbd>${hint.key}</kbd></span>
            <span class="hint-action">${hint.action}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
}
```

### CSS for Hint Toast

```css
/* style.css */
.hint-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid var(--neon-cyan);
    padding: 1rem 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    animation: slideInRight 0.3s ease, fadeOut 0.3s ease 4.7s;
    z-index: 1000;
}

.hint-toast kbd {
    background: var(--cyber-dark);
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--neon-cyan);
    font-family: 'JetBrains Mono', monospace;
}
```

---

## Progressive Disclosure

Reveal features as users need them:

```javascript
// Show admin hint only after user has browsed apps
class PortalManager {
    constructor() {
        this.appClicks = 0;
    }

    renderApps() {
        this.apps.forEach(app => {
            const card = this.createAppCard(app);
            card.addEventListener('click', () => {
                this.appClicks++;
                this.checkEngagement();
            });
        });
    }

    checkEngagement() {
        // After 3 app clicks, hint about admin
        if (this.appClicks === 3 && !localStorage.getItem('32gamers_admin_hinted')) {
            this.showAdminHint();
            localStorage.setItem('32gamers_admin_hinted', 'true');
        }
    }

    showAdminHint() {
        const adminIcon = document.getElementById('adminIcon');
        adminIcon.classList.add('attention-pulse');
        
        const tooltip = document.createElement('div');
        tooltip.className = 'attention-tooltip';
        tooltip.textContent = 'Manage your own apps here!';
        adminIcon.appendChild(tooltip);
        
        setTimeout(() => {
            adminIcon.classList.remove('attention-pulse');
            tooltip.remove();
        }, 5000);
    }
}
```

---

## Nudge Implementation

### Empty State Nudge

```javascript
// app.js - Enhanced empty state
renderApps() {
    const container = document.querySelector('.button-container');
    
    if (this.apps.length === 0) {
        container.innerHTML = `
            <div class="empty-state cyber-border">
                <div class="empty-icon">⚠</div>
                <h3 class="glitch-text">NO APPS DETECTED</h3>
                <p>The portal is empty. Time to add some games!</p>
                <div class="empty-actions">
                    <button class="cyber-btn primary" onclick="window.location='firebase-admin.html'">
                        ACCESS ADMIN PANEL
                    </button>
                    <p class="hint-text">Or press <kbd>Ctrl+Alt+A</kbd></p>
                </div>
            </div>
        `;
        return;
    }
    // ... render apps
}
```

### Search Empty State

```javascript
// app.js - Existing pattern at line 208, enhanced
filterApps(searchTerm) {
    const filtered = this.apps.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>No apps match "${searchTerm}"</p>
                <button class="cyber-btn ghost" onclick="portalManager.clearSearch()">
                    CLEAR SEARCH
                </button>
                <p class="suggestion">Try: game, portal, or clear to see all</p>
            </div>
        `;
    }
}
```

---

## Return Visitor Recognition

```javascript
// scripts/app.js
class PortalManager {
    async init() {
        const lastVisit = localStorage.getItem('32gamers_last_visit');
        const now = Date.now();
        
        if (lastVisit) {
            const daysSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) {
                this.showReturnMessage();
            }
        }
        
        localStorage.setItem('32gamers_last_visit', now.toString());
        await this.loadApps();
    }

    showReturnMessage() {
        const banner = document.createElement('div');
        banner.className = 'return-banner';
        banner.innerHTML = `
            <span>WELCOME BACK, OPERATOR</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.querySelector('.header').after(banner);
    }
}
```

---

## Anti-Patterns

### WARNING: Aggressive Notification Spam

**The Problem:**

```javascript
// BAD - Shows hint every 10 seconds
setInterval(() => {
    this.showRandomHint();
}, 10000);
```

**Why This Breaks:**
1. Interrupts user flow constantly
2. Users develop "banner blindness"
3. Creates negative association with the product

**The Fix:**

```javascript
// GOOD - Contextual, one-time hints
showHintOnce(hintId, content) {
    const shownHints = JSON.parse(localStorage.getItem('32gamers_hints') || '[]');
    if (shownHints.includes(hintId)) return;
    
    this.displayHint(content);
    shownHints.push(hintId);
    localStorage.setItem('32gamers_hints', JSON.stringify(shownHints));
}
```

### WARNING: Hiding Core Functionality

**The Problem:**

```javascript
// BAD - Search only appears after onboarding
if (OnboardingTracker.isComplete()) {
    this.enableSearch();
}
```

**Why This Breaks:**
1. Power users can't access features they need
2. Creates confusion about what the product does
3. Penalizes users who skip onboarding

**The Fix:**

```javascript
// GOOD - All features available, hints guide discovery
setupSearch() {
    this.searchEnabled = true;  // Always available
    
    if (!OnboardingTracker.getProgress().searchUsed) {
        this.highlightSearchHint();  // Gentle nudge, not gate
    }
}
```