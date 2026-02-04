# Product Analytics Reference

## Contents
- Current Analytics State
- Event Tracking Patterns
- Setting Up Google Analytics
- Adoption Funnel Events
- Privacy Considerations

---

## Current Analytics State

The codebase has **partial analytics implementation**:

```javascript
// app.js:86-102 - Hook exists but gtag not loaded
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

**Problem:** No `gtag` script is loaded in `index.html` or `firebase-admin.html`.

---

## Event Tracking Patterns

### DO: Create Centralized Tracking Module

```javascript
// scripts/analytics.js
const Analytics = {
    initialized: false,
    
    init(measurementId) {
        if (this.initialized) return;
        
        // Load gtag script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', measurementId);
        
        this.initialized = true;
    },
    
    track(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    }
};

export default Analytics;
```

### Usage in App

```javascript
// scripts/app.js
import Analytics from './analytics.js';

class PortalManager {
    constructor() {
        Analytics.init('G-XXXXXXXXXX'); // Your GA4 measurement ID
        this.loadApps();
    }
    
    trackAppClick(appId, appName) {
        Analytics.track('app_click', { app_id: appId, app_name: appName });
    }
}
```

---

## Setting Up Google Analytics

### Step 1: Add GA4 to index.html

```html
<!-- index.html - Add before closing </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Step 2: Same for firebase-admin.html

Add identical script block to track admin panel usage.

### DON'T: Hardcode Measurement ID

```javascript
// BAD - Hardcoded in multiple places
gtag('config', 'G-ABC123');
```

**The Fix:**
```javascript
// GOOD - Centralized config
const ANALYTICS_CONFIG = {
    measurementId: 'G-XXXXXXXXXX',
    debug: location.hostname === 'localhost'
};
```

---

## Adoption Funnel Events

### Key Events to Track

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | Page load | `page_title`, `page_location` |
| `app_click` | User clicks app card | `app_id`, `app_name` |
| `search_opened` | Ctrl+F pressed | `method: 'keyboard'` |
| `search_query` | Search input | `query_length`, `results_count` |
| `admin_accessed` | Admin icon clicked | `method: 'icon'` or `'keyboard'` |
| `admin_login` | Successful Google login | `user_type: 'returning'` or `'new'` |
| `app_created` | App added in admin | `app_id` |
| `app_updated` | App edited | `app_id` |
| `app_deleted` | App removed | `app_id` |

### Implementation Examples

```javascript
// Track search usage
handleSearch(query) {
    const results = this.filterApps(query);
    Analytics.track('search_query', {
        query_length: query.length,
        results_count: results.length
    });
    this.renderApps(results);
}

// Track admin access method
handleAdminAccess(method) {
    Analytics.track('admin_accessed', { method });
    window.location.href = 'firebase-admin.html';
}

// In keyboard handler
if (e.ctrlKey && e.altKey && e.key === 'a') {
    this.handleAdminAccess('keyboard');
}

// On admin icon click
adminIcon.addEventListener('click', () => this.handleAdminAccess('icon'));
```

---

## Adoption Metrics Dashboard

### Key Metrics to Monitor

```javascript
// Custom dimensions for adoption analysis
const adoptionDimensions = {
    user_type: 'new' | 'returning',
    feature_discovered: 'search' | 'admin' | 'keyboard_shortcuts',
    session_depth: 'shallow' | 'engaged' | 'power_user'
};

// Track session depth
function getSessionDepth(eventCount) {
    if (eventCount < 3) return 'shallow';
    if (eventCount < 10) return 'engaged';
    return 'power_user';
}
```

### Funnel Analysis Events

```javascript
// Activation funnel
const activationFunnel = [
    'first_visit',           // User lands on portal
    'first_app_click',       // User clicks first app
    'search_first_use',      // User discovers search
    'admin_first_access'     // User accesses admin (if admin)
];

// Track funnel progression
function trackFunnelStep(step) {
    const completed = localStorage.getItem(`funnel_${step}`);
    if (!completed) {
        Analytics.track(`funnel_${step}`, { first_time: true });
        localStorage.setItem(`funnel_${step}`, Date.now());
    }
}
```

---

## Privacy Considerations

### DO: Respect User Privacy

```javascript
// Check for consent before tracking
const Analytics = {
    hasConsent: false,
    
    requestConsent() {
        // Only if required by GDPR/CCPA
        const consent = localStorage.getItem('analytics_consent');
        this.hasConsent = consent === 'granted';
        return this.hasConsent;
    },
    
    track(eventName, params) {
        if (!this.hasConsent) return;
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    }
};
```

### DON'T: Track PII

```javascript
// BAD - Tracking personal info
Analytics.track('user_login', {
    email: user.email,      // PII
    displayName: user.name  // PII
});

// GOOD - Anonymous metrics only
Analytics.track('user_login', {
    user_type: isNewUser ? 'new' : 'returning',
    auth_method: 'google'
});
```

---

## Debugging Analytics

### Local Development

```javascript
// Enable debug mode for localhost
if (location.hostname === 'localhost') {
    gtag('config', 'G-XXXXXXXXXX', { debug_mode: true });
}
```

### Browser Console Verification

```javascript
// Check if gtag is loaded
console.log('gtag available:', typeof gtag !== 'undefined');

// Monitor dataLayer
console.log('dataLayer:', window.dataLayer);

// Test event manually
gtag('event', 'test_event', { test_param: 'value' });
```

---

## Anti-Patterns

### WARNING: Tracking Without Purpose

**The Problem:**
```javascript
// BAD - Tracking everything
document.addEventListener('click', (e) => {
    Analytics.track('click', { target: e.target.tagName });
});
```

**Why This Breaks:** Creates noise, no actionable insights, wastes quota.

**The Fix:** Only track events that inform product decisions.

### WARNING: Blocking Page Load for Analytics

**The Problem:**
```javascript
// BAD - Sync script blocks rendering
<script src="https://www.googletagmanager.com/gtag/js"></script>
```

**The Fix:**
```html
<!-- GOOD - Async loading -->
<script async src="https://www.googletagmanager.com/gtag/js"></script>
```

---

## Implementation Checklist

- [ ] Create centralized analytics module
- [ ] Add GA4 script with async loading
- [ ] Define key adoption events
- [ ] Track funnel progression
- [ ] Add debug mode for development
- [ ] Respect privacy (no PII)
- [ ] Test events in GA4 DebugView