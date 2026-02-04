# Conversion Optimization Reference

## Contents
- Primary Conversion: App Click
- Secondary Conversion: Admin Actions
- Conversion Tracking Implementation
- Funnel Drop-off Analysis
- Anti-Patterns

---

## Primary Conversion: App Click

The core conversion event is when a user clicks an app card and navigates to that app.

### Current Implementation (Broken)

```javascript
// scripts/app.js - Line 87-95
button.addEventListener('click', (e) => {
    this.trackAppClick(app.id, app.name);
});

trackAppClick(appId, appName) {
    // BROKEN: gtag is never defined
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

### Fixed Implementation

```javascript
// scripts/app.js - Replace trackAppClick method
trackAppClick(appId, appName) {
    const eventData = {
        app_id: appId,
        app_name: appName,
        timestamp: Date.now(),
        referrer: document.referrer || 'direct'
    };

    // Firebase Analytics (preferred)
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'app_click', eventData);
        return;
    }

    // Fallback: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', eventData);
        return;
    }

    // Debug mode: log to console
    console.debug('[Analytics] app_click:', eventData);
}
```

---

## Secondary Conversion: Admin Actions

Admin CRUD operations indicate engagement depth but are not currently tracked.

### Instrument Admin Actions

```javascript
// firebase-admin.html - Add to addApp() function
async function addApp() {
    const startTime = performance.now();
    // ... existing validation ...

    try {
        await addDoc(collection(db, 'apps'), appData);

        // Track successful creation
        trackAdminAction('app_created', {
            app_id: appId,
            duration_ms: Math.round(performance.now() - startTime)
        });

        showNotification('App added!', 'success');
    } catch (error) {
        trackAdminAction('app_create_failed', {
            error_code: error.code,
            error_message: error.message
        });
        showNotification('Failed to add app', 'error');
    }
}

function trackAdminAction(eventName, params) {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, eventName, {
            ...params,
            admin_email: currentUser?.email || 'unknown'
        });
    }
}
```

---

## Conversion Tracking Implementation

### Step 1: Enable Firebase Analytics

```javascript
// scripts/firebase-config.js - Add analytics import
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// After initializeApp(firebaseConfig)
const analytics = getAnalytics(app);

// Export for other scripts
window.firebaseAnalytics = analytics;
window.logEvent = logEvent;
```

### Step 2: Track Page Views

```javascript
// scripts/app.js - Add to constructor or init
trackPageView() {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
}
```

### Step 3: Track Apps Loaded Event

```javascript
// scripts/app.js - Modify loadApps()
async loadApps() {
    const loadStart = performance.now();

    try {
        const querySnapshot = await getDocs(collection(this.db, 'apps'));
        this.apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Track successful load
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'apps_loaded', {
                count: this.apps.length,
                load_time_ms: Math.round(performance.now() - loadStart)
            });
        }

        this.renderApps();
    } catch (error) {
        // Track load failure
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'apps_load_failed', {
                error_code: error.code || 'unknown',
                error_message: error.message
            });
        }
        this.showError('Failed to load apps');
    }
}
```

---

## Funnel Drop-off Analysis

### Funnel Stages

```
Stage 1: page_view
    ↓ (drop: page didn't load / user bounced)
Stage 2: apps_loaded
    ↓ (drop: no interesting apps / slow load)
Stage 3: app_click
    ↓ (drop: clicked but didn't engage)
Stage 4: (external) app_engagement
```

### Measure Drop-offs

```javascript
// Calculate funnel metrics in Firebase Console or export data
// Key metrics:
// - Bounce rate: page_view with no apps_loaded within 5s
// - Discovery rate: apps_loaded → app_click conversion
// - Load abandonment: apps_loaded time > 3000ms correlates with bounces
```

---

## WARNING: Tracking Without User Consent

**The Problem:**

```javascript
// BAD - Tracks immediately without consent check
const analytics = getAnalytics(app);
logEvent(analytics, 'page_view', {...});
```

**Why This Breaks:**
1. GDPR/CCPA violations for EU/California users
2. App store rejection risk for mobile web apps
3. User trust erosion

**The Fix:**

```javascript
// GOOD - Check consent before tracking
function initAnalytics() {
    const consent = localStorage.getItem('analytics_consent');
    if (consent === 'granted') {
        const analytics = getAnalytics(app);
        window.firebaseAnalytics = analytics;
        window.logEvent = logEvent;
    }
}

function grantAnalyticsConsent() {
    localStorage.setItem('analytics_consent', 'granted');
    initAnalytics();
}
```

---

## WARNING: Over-Tracking Low-Value Events

**The Problem:**

```javascript
// BAD - Tracks every mouse movement
document.addEventListener('mousemove', () => {
    logEvent(analytics, 'mouse_move', { x: e.clientX, y: e.clientY });
});
```

**Why This Breaks:**
1. Firebase Analytics has event limits (500 distinct events)
2. Drowns out meaningful conversion signals
3. Increases costs and slows dashboard

**The Fix:**

Track only events that inform decisions:
- Conversions (app_click, admin_login)
- Funnel stages (page_view, apps_loaded)
- Errors (load_failed, auth_error)
- Search interactions (search_executed with results_count)

---

## Related Skills

For Firebase SDK setup, see the **firebase** skill.
For user journey mapping, see the **mapping-user-journeys** skill.
