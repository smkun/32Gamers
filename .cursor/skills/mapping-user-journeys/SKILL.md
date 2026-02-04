---
name: mapping-user-journeys
description: |
  Maps in-app journeys and identifies friction points in the 32Gamers portal codebase.
  Use when: analyzing user flows, identifying UX friction, auditing loading/error states, reviewing authentication flows, or optimizing the app discovery experience.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__serena__find_symbol, mcp__serena__get_symbols_overview, mcp__serena__search_for_pattern, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__list_console_messages, mcp__playwright__browser_snapshot, mcp__playwright__browser_navigate
---

# Mapping User Journeys

Maps the 32Gamers portal's in-app journeys from initial page load through app discovery, admin authentication, and CRUD operations. Identifies friction points in code by analyzing loading states, error handling, and interaction patterns.

## Quick Start

### Identify Journey Touchpoints

```javascript
// Key entry points in this codebase:
// Portal:  index.html → scripts/app.js (PortalManager)
// Admin:   firebase-admin.html (inline module)
// Config:  scripts/firebase-config.js (Firebase init)
```

### Core User Journeys

| Journey | Entry | Key File | Line Reference |
|---------|-------|----------|----------------|
| App Discovery | `index.html` | `scripts/app.js` | `init()` line 8 |
| Admin Auth | `firebase-admin.html` | inline | `onAuthStateChanged` line 94 |
| App Search | `Ctrl+F` | `scripts/app.js` | `setupSearch()` line 158 |
| CRUD Operations | Admin panel | `firebase-admin.html` | `addApp()` line 171 |

## Key Concepts

| Concept | Location | Purpose |
|---------|----------|---------|
| Loading State | `style.css:604-712` | Cyberpunk spinner during data fetch |
| Error Display | `style.css:714-757` | Pink-bordered error messages |
| Empty State | `app.js:267-270` | No apps fallback |
| Status Messages | `firebase-admin.html:289-293` | Success/error/info feedback |

## Common Patterns

### Tracing a User Flow

**When:** Auditing a specific journey for friction points

```javascript
// 1. Find the entry point
// Portal loads: index.html → app.js init()

// 2. Track the data flow
async loadApps() {
    // Wait for Firebase (friction point: 1s timeout)
    if (!window.firebase || !window.firebase.db) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Fetch from Firestore
    const querySnapshot = await window.firebase.getDocs(/*...*/);
}

// 3. Identify error boundaries
catch (error) {
    this.loadFallbackApps();  // Graceful degradation
}
```

### Mapping State Transitions

**When:** Understanding UI state changes

```
Loading → Success → Rendered
Loading → Error → Error Message
Login → Auth Check → Admin Panel OR Login Section
```

## Friction Point Checklist

Copy this checklist when auditing journeys:

- [ ] Loading state visible within 100ms?
- [ ] Error messages actionable (not just "Error occurred")?
- [ ] Empty states guide user to next action?
- [ ] Keyboard shortcuts discoverable?
- [ ] Form validation provides specific feedback?
- [ ] Auth errors distinguish user vs system issues?

## See Also

- [activation-onboarding](references/activation-onboarding.md)
- [engagement-adoption](references/engagement-adoption.md)
- [in-app-guidance](references/in-app-guidance.md)
- [product-analytics](references/product-analytics.md)
- [roadmap-experiments](references/roadmap-experiments.md)
- [feedback-insights](references/feedback-insights.md)

## Related Skills

- See the **vanilla-javascript** skill for DOM manipulation and event handling patterns
- See the **firebase** skill for authentication and Firestore operations
- See the **css** skill for loading states and animation implementations
- See the **google-oauth** skill for authentication flow details
- See the **designing-onboarding-paths** skill for first-run experience patterns
- See the **instrumenting-product-metrics** skill for analytics integration