---
name: orchestrating-feature-adoption
description: |
  Plans feature discovery, nudges, and adoption flows for the 32Gamers portal.
  Use when: designing user onboarding, implementing feature tooltips, adding in-app guidance, creating empty states, planning adoption metrics, or building progressive disclosure patterns.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__serena__find_symbol, mcp__serena__get_symbols_overview, mcp__serena__search_for_pattern, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__evaluate_script
---

# Orchestrating Feature Adoption

The 32Gamers portal is **discovery-light**: a single admin icon plus `Ctrl+Alt+A` keyboard shortcut are the only entry points to management. This skill documents how to plan and implement feature adoption flows in vanilla JS with Firebase backend.

## Quick Start

### Adding Feature Discovery (Tooltip Pattern)

```javascript
// scripts/app.js - Add tooltip to existing element
const adminIcon = document.querySelector('.admin-icon');
adminIcon.setAttribute('title', 'Admin Access [CTRL+ALT+A]');
adminIcon.setAttribute('aria-label', 'Open admin panel with Ctrl+Alt+A');
```

### Creating Empty States with CTAs

```javascript
// When no apps exist, guide user to action
if (apps.length === 0) {
    container.innerHTML = `
        <div class="empty-state">
            <p>No apps found. Add your first app above!</p>
        </div>
    `;
    return;
}
```

### Tracking Feature Engagement

```javascript
// app.js pattern - conditional analytics
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

## Key Concepts

| Concept | Location | Pattern |
|---------|----------|---------|
| Admin discovery | `index.html:46-52` | Icon + keyboard shortcut + title tooltip |
| Search activation | `app.js:158-196` | Hidden by default, `Ctrl+F` activates |
| Empty state | `firebase-admin.html:267-269` | Clear CTA when no data |
| Status messages | `firebase-admin.html:289-293` | Auto-dismiss feedback |
| Auth state UI | `firebase-admin.html:94-103` | Show/hide sections based on login |

## Current Product Surfaces

| Surface | Status | Gap |
|---------|--------|-----|
| First-run welcome | Absent | No onboarding |
| Feature tooltips | Minimal | Only admin icon has title |
| Keyboard hints | Hidden | Ctrl+F/Ctrl+Alt+A not visible |
| Progress indicators | None | No setup completion tracking |
| Analytics | Partial | gtag hook exists, not configured |

## Adoption Flow Decision Tree

```
User lands on portal
├── First visit?
│   └── [GAP] No welcome/onboarding → Implement first-run detection
├── Wants to manage apps?
│   └── Discover admin icon (visual) OR Ctrl+Alt+A (keyboard)
├── Searching for app?
│   └── [GAP] No hint about Ctrl+F → Add search hint in UI
└── Admin panel empty?
    └── "Add your first app above!" CTA exists ✓
```

## See Also

- [activation-onboarding](references/activation-onboarding.md)
- [engagement-adoption](references/engagement-adoption.md)
- [in-app-guidance](references/in-app-guidance.md)
- [product-analytics](references/product-analytics.md)
- [roadmap-experiments](references/roadmap-experiments.md)
- [feedback-insights](references/feedback-insights.md)

## Related Skills

- **vanilla-javascript** skill for DOM manipulation and event handling
- **firebase** skill for auth state and Firestore operations
- **css** skill for styling tooltips, modals, and status messages
- **frontend-design** skill for cyberpunk-themed UI components
- **google-oauth** skill for admin access control patterns
- **instrumenting-product-metrics** skill for tracking adoption events
- **designing-onboarding-paths** skill for first-run flow design