# Product Analytics Reference

## Contents
- Current Analytics Setup
- Event Tracking Patterns
- Missing Analytics Gaps
- Recommended Event Schema
- Implementation Guide

## Current Analytics Setup

### Google Analytics Integration

```javascript
// app.js lines 94-102
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

### Firebase Measurement ID

```javascript
// firebase-config.js line 11
measurementId: "G-CMGT3Y2CBX"
```

**Current Tracking:** Only app clicks are tracked. No funnel data.

## Event Tracking Patterns

### Safe Analytics Call Pattern

```javascript
// Always check for gtag availability
if (typeof gtag !== 'undefined') {
    gtag('event', 'event_name', { parameters });
}
```

**Why:** Ad blockers may prevent gtag from loading. Failing silently prevents console errors.

### Event Naming Convention

| Format | Example | Use Case |
|--------|---------|----------|
| `noun_verb` | `app_click` | User actions |
| `feature_action` | `search_opened` | Feature usage |
| `flow_step` | `admin_login_success` | Funnel tracking |

## Missing Analytics Gaps

### WARNING: No Funnel Tracking

**Current state:** Only `app_click` is tracked. Critical user journey steps are invisible.

**Impact:**
- Cannot measure conversion (visit → app launch)
- Cannot identify drop-off points
- Cannot measure admin engagement

### Recommended Events to Add

```javascript
// Portal funnel events
gtag('event', 'page_view', { page: 'portal' });
gtag('event', 'apps_loaded', { count: apps.length });
gtag('event', 'search_opened', {});
gtag('event', 'search_performed', { term: searchTerm, results: count });
gtag('event', 'app_click', { app_id, app_name });

// Admin funnel events
gtag('event', 'admin_page_view', {});
gtag('event', 'admin_login_attempt', {});
gtag('event', 'admin_login_success', { user_email });
gtag('event', 'admin_login_failure', { error_code });
gtag('event', 'app_created', { app_id });
gtag('event', 'app_updated', { app_id });
gtag('event', 'app_deleted', { app_id });
```

## Recommended Event Schema

### Portal Events

```javascript
// In app.js - add to appropriate lifecycle points

// On page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'portal_loaded', {
            timestamp: Date.now()
        });
    }
});

// On apps loaded
async loadApps() {
    // ... existing code ...
    if (typeof gtag !== 'undefined') {
        gtag('event', 'apps_displayed', {
            app_count: this.apps.length,
            load_time_ms: performance.now()
        });
    }
}

// On search
filterApps(searchTerm) {
    if (typeof gtag !== 'undefined' && searchTerm.length > 2) {
        gtag('event', 'search_performed', {
            search_term: searchTerm,
            result_count: filtered.length
        });
    }
}
```

### Admin Events

```javascript
// In firebase-admin.html - add to auth handlers

// Login success
firebase.auth.onAuthStateChanged((user) => {
    if (user && typeof gtag !== 'undefined') {
        gtag('event', 'admin_authenticated', {
            method: 'google'
        });
    }
});

// CRUD operations
async function addApp() {
    // ... existing code ...
    if (typeof gtag !== 'undefined') {
        gtag('event', editingIndex === -1 ? 'app_created' : 'app_updated', {
            app_id: newApp.appId
        });
    }
}
```

## Implementation Guide

### Step 1: Verify GA4 Setup

```javascript
// Check in browser console
console.log('gtag available:', typeof gtag !== 'undefined');
```

### Step 2: Add Event Helpers

```javascript
// Create analytics utility
const analytics = {
    track(eventName, params = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...params,
                timestamp: Date.now()
            });
        }
    }
};
```

### Step 3: Instrument Key Points

```javascript
// Portal lifecycle
analytics.track('portal_loaded');
analytics.track('apps_displayed', { count: apps.length });
analytics.track('app_clicked', { app_id, app_name });

// Admin lifecycle
analytics.track('admin_login_success');
analytics.track('app_created', { app_id });
```

### Step 4: Validate in GA4 DebugView

1. Open GA4 Console → Configure → DebugView
2. Enable debug mode: `gtag('config', 'G-XXXXX', { debug_mode: true })`
3. Trigger events and verify they appear

## Analytics Implementation Checklist

- [ ] gtag snippet in HTML head
- [ ] Measurement ID configured in firebase-config.js
- [ ] Safe `typeof gtag` checks before all calls
- [ ] Portal funnel events: load → display → click
- [ ] Admin funnel events: view → login → action
- [ ] Search tracking with term and result count
- [ ] Error events for debugging
- [ ] Validate events in GA4 DebugView

See the **instrumenting-product-metrics** skill for advanced analytics patterns.