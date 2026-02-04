# Content & Copy Reference

## Contents
- Trackable Copy Elements
- Event Naming Conventions
- Messaging That Drives Conversions
- Copy Testing with Events
- Anti-Patterns

---

## Trackable Copy Elements

Content in the portal that should be measured for effectiveness:

| Element | Location | Tracking Event |
|---------|----------|---------------|
| Hero headline | index.html `.cyber-title` | page_view + scroll_depth |
| Subtitle | index.html `.subtitle` | included in page_view |
| App names | Firestore `apps.name` | app_click (app_name param) |
| App descriptions | Firestore `apps.description` | hover_duration, app_click |
| Error messages | app.js `.error-message` | error_displayed |
| Loading states | app.js `.loading-placeholder` | apps_loaded (load_time_ms) |
| Admin CTA | firebase-admin.html login button | admin_login_attempt |

---

## Event Naming Conventions

Use snake_case with verb_noun pattern:

```javascript
// GOOD - Action-oriented, measurable
'app_click'           // User clicked an app
'search_executed'     // User performed a search
'admin_login_success' // Admin successfully logged in
'error_displayed'     // Error shown to user

// BAD - Vague or noun-only
'click'               // What was clicked?
'apps'                // What about apps?
'user_action'         // Too generic
'adminLoginSuccess'   // Wrong case (use snake_case)
```

### Event Parameter Naming

```javascript
// GOOD - Consistent parameter names
logEvent(analytics, 'app_click', {
    app_id: 'game-1',        // snake_case
    app_name: 'Cool Game',   // snake_case
    click_source: 'grid',    // snake_case
    timestamp: Date.now()    // snake_case
});

// BAD - Inconsistent casing
logEvent(analytics, 'app_click', {
    appId: 'game-1',         // camelCase (inconsistent)
    AppName: 'Cool Game',    // PascalCase (wrong)
    'click-source': 'grid',  // kebab-case (won't work in some tools)
});
```

---

## Messaging That Drives Conversions

### Hero Copy Analysis

Current hero in `index.html`:

```html
<h1 class="cyber-title">
    <span class="glitch" data-text="MISSION CONTROL">MISSION CONTROL</span>
</h1>
<div class="subtitle">// SELECT YOUR MISSION</div>
```

**Tracking the hero effectiveness:**

```javascript
// Track if hero text correlates with engagement
trackPageView() {
    logEvent(analytics, 'page_view', {
        hero_text: document.querySelector('.cyber-title')?.textContent?.trim(),
        subtitle_text: document.querySelector('.subtitle')?.textContent?.trim(),
        variant: 'mission_control_v1'  // For A/B testing
    });
}
```

### Error Message Copy

Current error handling in `app.js`:

```javascript
showError(message) {
    const container = document.querySelector('.button-container');
    container.innerHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
            <p>Please refresh the page or try again later.</p>
        </div>
    `;
}
```

**Track error message impressions:**

```javascript
showError(message, errorCode) {
    // Track error displayed
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'error_displayed', {
            error_message: message,
            error_code: errorCode || 'unknown',
            page: window.location.pathname
        });
    }

    // Render error UI
    const container = document.querySelector('.button-container');
    container.innerHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
            <p>Please refresh the page or try again later.</p>
        </div>
    `;
}
```

---

## Copy Testing with Events

### A/B Test Hero Copy

```javascript
// Randomly assign variant on first visit
function getHeroVariant() {
    let variant = localStorage.getItem('hero_variant');
    if (!variant) {
        variant = Math.random() < 0.5 ? 'mission_control' : 'game_hub';
        localStorage.setItem('hero_variant', variant);
    }
    return variant;
}

// Apply variant
function applyHeroVariant() {
    const variant = getHeroVariant();
    const heroEl = document.querySelector('.cyber-title .glitch');
    const subtitleEl = document.querySelector('.subtitle');

    if (variant === 'game_hub') {
        heroEl.textContent = 'GAME HUB';
        heroEl.dataset.text = 'GAME HUB';
        subtitleEl.textContent = '// CHOOSE YOUR ADVENTURE';
    }

    // Track which variant user sees
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'hero_variant_shown', {
            variant: variant
        });
    }
}
```

### Measure Copy Effectiveness

```javascript
// In trackAppClick, include hero variant
trackAppClick(appId, appName) {
    const eventData = {
        app_id: appId,
        app_name: appName,
        hero_variant: localStorage.getItem('hero_variant') || 'default'
    };

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'app_click', eventData);
    }
}
```

**Analysis:** Compare `app_click` conversion rate between `hero_variant: mission_control` vs `hero_variant: game_hub`.

---

## WARNING: Tracking PII in Event Parameters

**The Problem:**

```javascript
// BAD - Includes email in event
logEvent(analytics, 'admin_login', {
    email: user.email,  // PII!
    user_name: user.displayName  // PII!
});
```

**Why This Breaks:**
1. Violates Firebase Analytics TOS
2. GDPR/CCPA compliance issues
3. Data can't be deleted easily

**The Fix:**

```javascript
// GOOD - Use anonymous identifiers
logEvent(analytics, 'admin_login', {
    user_id_hash: hashUserId(user.uid),  // Hashed, not raw
    login_method: 'google',
    success: true
});

function hashUserId(uid) {
    // Simple hash for analytics (not security)
    return btoa(uid).substring(0, 16);
}
```

---

## WARNING: Inconsistent Event Naming Across Pages

**The Problem:**

```javascript
// index.html
logEvent(analytics, 'app_click', {...});

// firebase-admin.html
logEvent(analytics, 'AppClick', {...});  // Different case!
logEvent(analytics, 'click_app', {...}); // Different order!
```

**Why This Breaks:**
1. Firebase treats these as 3 separate events
2. Dashboards show fragmented data
3. Funnels can't connect properly

**The Fix:**

Create a shared event constants file:

```javascript
// scripts/analytics-events.js
export const EVENTS = {
    PAGE_VIEW: 'page_view',
    APPS_LOADED: 'apps_loaded',
    APP_CLICK: 'app_click',
    SEARCH_OPENED: 'search_opened',
    SEARCH_EXECUTED: 'search_executed',
    ADMIN_LOGIN: 'admin_login',
    APP_CREATED: 'app_created',
    APP_DELETED: 'app_deleted',
    ERROR_DISPLAYED: 'error_displayed'
};

// Usage
import { EVENTS } from './analytics-events.js';
logEvent(analytics, EVENTS.APP_CLICK, {...});
```

---

## Related Skills

For UI copy patterns, see the **crafting-page-messaging** skill.
For market positioning, see the **clarifying-market-fit** skill.
