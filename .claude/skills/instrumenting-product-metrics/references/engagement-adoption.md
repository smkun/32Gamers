# Engagement & Adoption Metrics

## Contents
- Core Engagement Events
- Feature Adoption Tracking
- Return User Detection
- Session Depth Metrics
- Anti-Patterns

## Core Engagement Events

The portal's primary engagement signal is app clicks. Secondary signals: search usage, admin panel activity.

### App Click Tracking (Existing)

Current implementation in `scripts/app.js:94-102`:

```javascript
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

**Enhanced version with engagement depth:**

```javascript
trackAppClick(appId, appName) {
    const clickCount = parseInt(sessionStorage.getItem('click_count') || '0') + 1;
    sessionStorage.setItem('click_count', clickCount.toString());

    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName,
            'session_click_number': clickCount,
            'engagement_level': clickCount >= 3 ? 'high' : clickCount >= 2 ? 'medium' : 'low'
        });
    }
}
```

## Feature Adoption Tracking

### Search Feature Adoption

The search feature is hidden behind `Ctrl+F`. Track discovery and usage:

```javascript
// In setupSearch (line 176-183)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchContainer.style.display = 'block';
        searchInput.focus();

        // Track feature discovery
        const searchUsed = sessionStorage.getItem('search_used');
        gtag('event', 'feature_discovered', {
            'feature_name': 'search',
            'discovery_method': 'keyboard_shortcut',
            'is_first_use': !searchUsed
        });
        sessionStorage.setItem('search_used', 'true');
    }
});
```

### Search Query Tracking

```javascript
// In filterApps (line 193-196)
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    this.filterApps(query);

    // Debounce to avoid tracking every keystroke
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
        if (query.length >= 2) {
            gtag('event', 'search_query', {
                'query_length': query.length,
                'results_count': this.lastFilteredCount
            });
        }
    }, 500);
});
```

### Admin Feature Adoption

Track admin panel engagement depth:

```javascript
// In firebase-admin.html, track CRUD actions
async function addApp() {
    // ... existing validation ...

    try {
        const actionCount = parseInt(sessionStorage.getItem('admin_actions') || '0') + 1;
        sessionStorage.setItem('admin_actions', actionCount.toString());

        if (editingIndex === -1) {
            await firebase.setDoc(...);
            gtag('event', 'app_created', {
                'app_id': newApp.appId,
                'admin_action_number': actionCount
            });
        } else {
            await firebase.setDoc(...);
            gtag('event', 'app_updated', {
                'app_id': existingApp.appId,
                'admin_action_number': actionCount
            });
        }
    } catch (error) { ... }
}
```

## Return User Detection

Track returning visitors vs new:

```javascript
// Add to PortalManager constructor
constructor() {
    this.apps = [];

    const visitHistory = JSON.parse(localStorage.getItem('32gamers_visits') || '[]');
    const now = Date.now();
    const isReturn = visitHistory.length > 0;
    const daysSinceLastVisit = isReturn
        ? Math.floor((now - visitHistory[visitHistory.length - 1]) / 86400000)
        : null;

    visitHistory.push(now);
    // Keep last 10 visits
    if (visitHistory.length > 10) visitHistory.shift();
    localStorage.setItem('32gamers_visits', JSON.stringify(visitHistory));

    gtag('event', 'page_view', {
        'user_type': isReturn ? 'returning' : 'new',
        'visit_number': visitHistory.length,
        'days_since_last_visit': daysSinceLastVisit
    });

    this.init();
}
```

## Session Depth Metrics

Measure how deeply users engage in a session:

```javascript
// Track time on page
let pageLoadTime = Date.now();

window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - pageLoadTime;
    const clickCount = parseInt(sessionStorage.getItem('click_count') || '0');

    // Use sendBeacon for reliability on page exit
    navigator.sendBeacon('/analytics', JSON.stringify({
        event: 'session_end',
        duration_ms: sessionDuration,
        apps_clicked: clickCount,
        search_used: sessionStorage.getItem('search_used') === 'true'
    }));
});
```

**Note:** `sendBeacon` requires a server endpoint. For GA-only tracking, use `transport_type: 'beacon'`:

```javascript
gtag('event', 'session_end', {
    'session_duration_ms': sessionDuration,
    'apps_clicked': clickCount,
    'transport_type': 'beacon'
});
```

## Anti-Patterns

### WARNING: Tracking Raw Search Queries

**The Problem:**

```javascript
// BAD - Privacy risk, high cardinality
gtag('event', 'search', { 'query': e.target.value });
```

**Why This Breaks:**
1. Users may search for personal information
2. Creates massive cardinality in GA (thousands of unique values)
3. Makes reports unusable
4. May violate privacy regulations

**The Fix:**

```javascript
// GOOD - Track query characteristics, not content
gtag('event', 'search', {
    'query_length': query.length,
    'results_count': filteredApps.length,
    'has_results': filteredApps.length > 0
});
```

### WARNING: No Engagement Thresholds

**The Problem:**

```javascript
// BAD - Every click treated equally
gtag('event', 'app_click', { app_id });
// Cannot distinguish casual from power users
```

**Why This Breaks:**
1. Cannot segment users by engagement level
2. DAU/MAU ratios meaningless
3. No way to identify at-risk users

**The Fix:**

```javascript
// GOOD - Classify engagement levels
const level = clickCount >= 5 ? 'power' :
              clickCount >= 2 ? 'engaged' : 'casual';

gtag('event', 'app_click', {
    app_id,
    engagement_level: level,
    session_clicks: clickCount
});
```

## Engagement Checklist

Copy this checklist when implementing engagement tracking:

- [ ] Track session click count with incrementing counter
- [ ] Add engagement level classification to click events
- [ ] Instrument search feature discovery
- [ ] Track search usage with debounced queries (500ms)
- [ ] Never log raw search query text
- [ ] Detect and tag returning vs new users
- [ ] Track visit count and days since last visit
- [ ] Implement session end tracking with sendBeacon
- [ ] Add admin action counting for power user detection
