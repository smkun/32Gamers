# Product Analytics Implementation

## Contents
- Current Analytics State
- Google Analytics Setup
- Event Schema Design
- Performance Metrics
- Firebase Analytics Alternative
- Anti-Patterns

## Current Analytics State

**WARNING: Analytics infrastructure exists but is NOT active.**

The portal has:
- Measurement ID: `G-CMGT3Y2CBX` (in `scripts/firebase-config.js:11`)
- One gtag event call (in `scripts/app.js:94-102`)
- No GA script loaded in HTML

The single existing event:

```javascript
// scripts/app.js:94-102
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

## Google Analytics Setup

### Step 1: Add GA Script to index.html

Insert before the closing `</head>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CMGT3Y2CBX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-CMGT3Y2CBX', {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

### Step 2: Add GA Script to firebase-admin.html

Same script block, insert before `</head>`.

### Step 3: Create Analytics Helper

Add to `scripts/firebase-config.js` or create `scripts/analytics.js`:

```javascript
// Analytics helper with safety guards
const Analytics = {
    track(eventName, params = {}) {
        if (typeof gtag === 'undefined') {
            console.warn('[Analytics] gtag not loaded:', eventName);
            return;
        }

        // Add common parameters
        const enrichedParams = {
            ...params,
            timestamp: Date.now(),
            page_path: window.location.pathname,
            session_id: this.getSessionId()
        };

        gtag('event', eventName, enrichedParams);
    },

    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session');
        if (!sessionId) {
            sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('analytics_session', sessionId);
        }
        return sessionId;
    },

    timing(name, value) {
        this.track('timing_complete', {
            name,
            value: Math.round(value)
        });
    },

    error(description, fatal = false) {
        this.track('exception', { description, fatal });
    }
};

window.Analytics = Analytics;
```

## Event Schema Design

### Naming Convention

Use snake_case with verb_noun pattern:

| Pattern | Example | Description |
|---------|---------|-------------|
| `action_object` | `app_clicked` | User performed action on object |
| `object_state` | `apps_loaded` | Object reached state |
| `feature_action` | `search_opened` | Feature was activated |
| `error_type` | `error_auth` | Error category occurred |

### Standard Event Properties

Every event should include:

```javascript
{
    // Required
    event_name: 'app_clicked',

    // Recommended
    session_id: 'abc123',
    page_path: '/index.html',
    timestamp: 1704067200000,

    // Event-specific
    app_id: 'game1',
    app_name: 'Cool Game'
}
```

### Event Catalog

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_loaded` | DOMContentLoaded | `load_time_ms`, `has_firebase` |
| `apps_loaded` | Firestore query complete | `app_count`, `load_time_ms`, `source` |
| `apps_load_failed` | Firestore error | `error_code`, `error_message` |
| `app_clicked` | App card click | `app_id`, `app_name`, `position` |
| `search_opened` | Ctrl+F pressed | - |
| `search_query` | Input with 2+ chars | `query_length`, `results_count` |
| `search_closed` | Close button/Escape | `had_query`, `had_results` |
| `admin_login_start` | Login button clicked | - |
| `admin_login_success` | Auth state changed | `user_email` |
| `admin_login_failed` | Auth error | `error_code` |
| `admin_logout` | Logout clicked | - |
| `app_created` | setDoc success (new) | `app_id` |
| `app_updated` | setDoc success (edit) | `app_id` |
| `app_deleted` | deleteDoc success | `app_id` |
| `form_validation_error` | Empty fields | `empty_fields` |

## Performance Metrics

### Page Load Timing

```javascript
// In PortalManager constructor
constructor() {
    this.loadStartTime = performance.now();
    this.apps = [];
    this.init();
}

async init() {
    await this.loadApps();
    this.renderApps();

    const loadTime = performance.now() - this.loadStartTime;
    Analytics.track('page_loaded', {
        'load_time_ms': Math.round(loadTime),
        'app_count': this.apps.length
    });

    this.setupEventListeners();
}
```

### Firebase Operation Timing

```javascript
// In loadApps
async loadApps() {
    const startTime = performance.now();

    try {
        const querySnapshot = await window.firebase.getDocs(...);
        const duration = performance.now() - startTime;

        Analytics.track('apps_loaded', {
            'load_time_ms': Math.round(duration),
            'app_count': firebaseApps.length,
            'source': 'firebase'
        });
    } catch (error) {
        const duration = performance.now() - startTime;

        Analytics.track('apps_load_failed', {
            'load_time_ms': Math.round(duration),
            'error_code': error.code || 'unknown',
            'error_message': error.message
        });
    }
}
```

### Web Vitals (Advanced)

```javascript
// Add to index.html for Core Web Vitals
import {onCLS, onFID, onLCP} from 'web-vitals';

onCLS((metric) => Analytics.track('web_vital', { name: 'CLS', value: metric.value }));
onFID((metric) => Analytics.track('web_vital', { name: 'FID', value: metric.value }));
onLCP((metric) => Analytics.track('web_vital', { name: 'LCP', value: metric.value }));
```

## Firebase Analytics Alternative

If preferring Firebase Analytics over GA4:

```javascript
// In scripts/firebase-config.js, add:
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

const analytics = getAnalytics(app);

// Usage
logEvent(analytics, 'app_clicked', { app_id: 'game1' });
```

**Trade-offs:**
- Firebase Analytics: Better mobile support, integrated with Firebase console
- GA4: Better web analytics, more reporting features, established ecosystem

## Anti-Patterns

### WARNING: No GA Script But Using gtag

**The Problem:**

```javascript
// BAD - gtag undefined, events silently dropped
gtag('event', 'app_clicked', { app_id: 'game1' });
// TypeError: gtag is not defined (or silently undefined)
```

**Why This Breaks:**
1. Zero analytics data collected
2. No error thrown if `typeof gtag` check used
3. Impossible to debug without checking console

**The Fix:**

```javascript
// GOOD - Always verify gtag exists
function trackEvent(name, params) {
    if (typeof gtag === 'undefined') {
        console.warn(`[Analytics] Cannot track "${name}": gtag not loaded`);
        return false;
    }
    gtag('event', name, params);
    return true;
}
```

### WARNING: High-Cardinality Event Parameters

**The Problem:**

```javascript
// BAD - Unique values per user
gtag('event', 'page_view', {
    'user_agent': navigator.userAgent,  // Thousands of unique values
    'timestamp_exact': Date.now()       // Unique per event
});
```

**Why This Breaks:**
1. GA4 has cardinality limits (500 unique values per custom dimension)
2. Reports become unusable with "other" category
3. Sampling kicks in, data becomes unreliable

**The Fix:**

```javascript
// GOOD - Categorize high-cardinality values
gtag('event', 'page_view', {
    'browser': getBrowserCategory(), // 'chrome', 'firefox', 'safari', 'other'
    'device_type': getDeviceType(),  // 'mobile', 'tablet', 'desktop'
    'timestamp_hour': new Date().getHours()
});

function getBrowserCategory() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari')) return 'safari';
    return 'other';
}
```

### WARNING: Blocking gtag Calls

**The Problem:**

```javascript
// BAD - Analytics blocks user interaction
await gtag('event', 'app_clicked', { app_id });
window.location.href = app.url; // Waits for analytics
```

**Why This Breaks:**
1. Analytics should never delay user actions
2. gtag is fire-and-forget by design
3. Users experience unnecessary latency

**The Fix:**

```javascript
// GOOD - Fire and forget, use sendBeacon for navigation
button.addEventListener('click', (e) => {
    gtag('event', 'app_clicked', {
        app_id,
        transport_type: 'beacon'  // Survives navigation
    });
    // Navigation happens immediately
});
```

## Analytics Implementation Checklist

Copy this checklist when adding analytics:

- [ ] Add GA4 script to both `index.html` and `firebase-admin.html`
- [ ] Create Analytics helper with safety guards
- [ ] Verify gtag is defined before first event fires
- [ ] Add session ID to all events
- [ ] Instrument page load timing
- [ ] Instrument Firebase operation timing
- [ ] Track all error states with error codes
- [ ] Use `transport_type: 'beacon'` for pre-navigation events
- [ ] Avoid high-cardinality parameters
- [ ] Test in GA4 DebugView before deploying
