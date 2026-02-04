---
name: vanilla-javascript
description: |
  Manages ES6+ syntax, DOM manipulation, async/await, and class-based organization for browser applications.
  Use when: writing client-side JavaScript, creating DOM elements dynamically, handling events, implementing async data fetching, or organizing code with ES6 classes.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs, mcp__chrome-devtools__evaluate_script, mcp__chrome-devtools__list_console_messages, mcp__playwright__browser_evaluate, mcp__playwright__browser_console_messages
---

# Vanilla JavaScript Skill

This project uses ES6+ vanilla JavaScript with class-based organization, ES modules via CDN imports, async/await for Firebase operations, and DOM manipulation for dynamic UI rendering. No build tools or transpilation—code runs directly in modern browsers.

## Quick Start

### Class-Based Controllers

```javascript
// scripts/app.js - Main pattern in this codebase
class PortalManager {
    constructor() {
        this.apps = [];
        this.init();
    }

    async init() {
        await this.loadApps();
        this.renderApps();
        this.setupEventListeners();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portalManager = new PortalManager();
});
```

### ES Modules via CDN

```javascript
// scripts/firebase-config.js - Import pattern
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Export via window for cross-script access
window.firebase = { app, db, collection, getDocs };
```

### Dynamic DOM Creation

```javascript
createAppButton(app, index) {
    const button = document.createElement('a');
    button.href = app.url;
    button.className = 'button';
    button.setAttribute('data-app-id', app.id);
    button.style.animationDelay = `${(index + 1) * 0.1}s`;
    
    button.innerHTML = `
        <img src="assets/images/${app.image}" alt="${app.name}" 
             onerror="this.src='assets/images/placeholder.png'"/>
        <span>${app.name}</span>
    `;
    return button;
}
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| ES6 Classes | Controller organization | `class PortalManager` |
| async/await | Firebase operations | `await this.loadApps()` |
| ES Modules | CDN imports | `import { } from 'https://...'` |
| Global window | Cross-script sharing | `window.firebase = {...}` |
| Template literals | Dynamic HTML | `` `<span>${app.name}</span>` `` |
| Arrow functions | Event handlers | `(e) => this.handleClick(e)` |

## Common Patterns

### Firebase Integration Pattern

**When:** Loading data from Firestore

```javascript
async loadApps() {
    try {
        if (!window.firebase?.db) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const querySnapshot = await window.firebase.getDocs(
            window.firebase.collection(window.firebase.db, 'apps')
        );
        querySnapshot.forEach((doc) => {
            this.apps.push(doc.data());
        });
    } catch (error) {
        console.error('Failed to load:', error);
        this.loadFallbackApps();
    }
}
```

### Event Delegation Pattern

**When:** Handling events on dynamically created elements

```javascript
setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'a') {
            e.preventDefault();
            this.handleAdminAccess();
        }
    });
}
```

## See Also

- [patterns](references/patterns.md) - Async/await, DOM manipulation, event handling
- [types](references/types.md) - Type coercion, validation, data structures
- [modules](references/modules.md) - ES modules, script loading, global sharing
- [errors](references/errors.md) - Error handling, fallbacks, user feedback

## Related Skills

- See the **firebase** skill for Firestore/Auth integration patterns
- See the **google-oauth** skill for authentication flows
- See the **css** skill for styling patterns and custom properties
- See the **frontend-design** skill for UI component patterns

## Documentation Resources

> Fetch latest vanilla JavaScript documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "javascript" or "mdn"
2. **Prefer website documentation** (IDs starting with `/websites/`) over repositories
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "javascript async await best practices"
- "javascript dom manipulation"
- "javascript es6 modules"
- "javascript event handling"