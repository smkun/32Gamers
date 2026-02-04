---
name: designing-onboarding-paths
description: |
  Designs onboarding paths, checklists, and first-run UI for the 32Gamers portal.
  Use when: creating welcome flows, first-time user detection, admin onboarding, 
  empty state guidance, progress indicators, or keyboard shortcut help screens.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__serena__find_symbol, mcp__serena__get_symbols_overview, mcp__serena__replace_symbol_body, mcp__serena__insert_after_symbol
---

# Designing Onboarding Paths

This skill covers first-run experiences, checklists, and guided UI for the 32Gamers cyberpunk portal. The codebase uses vanilla JavaScript with Firebase Auth for user state detection.

## Quick Start

### First-Visit Detection

```javascript
// scripts/app.js - Add to PortalManager class
checkFirstVisit() {
    const hasVisited = localStorage.getItem('32gamers_visited');
    if (!hasVisited) {
        this.showWelcomeModal();
        localStorage.setItem('32gamers_visited', 'true');
    }
}
```

### Admin First-Login Detection

```javascript
// firebase-admin.html - After successful auth
firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        const adminKey = `32gamers_admin_${user.uid}`;
        if (!localStorage.getItem(adminKey)) {
            showAdminOnboarding();
            localStorage.setItem(adminKey, 'true');
        }
    }
});
```

## Key Concepts

| Concept | Storage Key | Purpose |
|---------|-------------|---------|
| First visit | `32gamers_visited` | Show welcome modal |
| Admin first login | `32gamers_admin_{uid}` | Show admin tutorial |
| Onboarding progress | `32gamers_onboarding` | Track checklist steps |
| Dismissed hints | `32gamers_hints` | Don't repeat tooltips |

## Existing Patterns

### Loading State (Already Implemented)

```html
<!-- index.html lines 64-80 -->
<div class="loading-placeholder">
    <div class="spinner-container">
        <div class="spinner"></div>
    </div>
    <p class="loading-text">[INITIALIZING NEURAL LINK]</p>
</div>
```

### Status Messages (Admin Panel)

```javascript
// firebase-admin.html - 5-second auto-dismiss
function showStatus(message, type = 'info') {
    statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    setTimeout(() => statusDiv.innerHTML = '', 5000);
}
```

### Keyboard Shortcuts (Discoverable)

| Shortcut | Action | Location |
|----------|--------|----------|
| `Ctrl+Alt+A` | Admin panel | index.html:24-29 |
| `Ctrl+F` | Search apps | app.js:158-216 |

## Common Patterns

### Welcome Modal Structure

```html
<div class="onboarding-modal hidden" id="welcomeModal">
    <div class="modal-content cyber-border">
        <h2 class="glitch-text">WELCOME, OPERATOR</h2>
        <div class="onboarding-steps">
            <div class="step active" data-step="1">Browse Apps</div>
            <div class="step" data-step="2">Use Search</div>
            <div class="step" data-step="3">Admin Access</div>
        </div>
        <button class="cyber-btn" onclick="dismissWelcome()">BEGIN</button>
    </div>
</div>
```

### Empty State with Guidance

```javascript
// When no apps exist in Firebase
if (apps.length === 0) {
    container.innerHTML = `
        <div class="empty-state">
            <p class="neon-text">NO APPS DETECTED</p>
            <p>Press <kbd>Ctrl+Alt+A</kbd> to access admin and add your first app.</p>
        </div>
    `;
}
```

## See Also

- [activation-onboarding](references/activation-onboarding.md) - First-run flows and welcome screens
- [engagement-adoption](references/engagement-adoption.md) - Feature discovery and nudges
- [in-app-guidance](references/in-app-guidance.md) - Tooltips and contextual help
- [product-analytics](references/product-analytics.md) - Tracking onboarding completion
- [roadmap-experiments](references/roadmap-experiments.md) - Feature rollouts
- [feedback-insights](references/feedback-insights.md) - User signals and improvements

## Related Skills

- See the **vanilla-javascript** skill for DOM manipulation and event handling
- See the **firebase** skill for auth state detection
- See the **css** skill for modal animations and cyberpunk styling
- See the **google-oauth** skill for admin authentication flows