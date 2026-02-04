# Growth Engineering Reference

## Contents
- Viral Loop Tracking
- Retention Event Mapping
- Feature Discovery Metrics
- Admin Engagement Tracking
- Anti-Patterns

---

## Viral Loop Tracking

Track the share → visit → engage loop to measure organic growth.

### Share Event Implementation

```javascript
// Add share functionality to app cards
renderApps() {
    this.apps.forEach(app => {
        const card = this.createAppCard(app);

        // Add share button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.innerHTML = '🔗';
        shareBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.shareApp(app);
        };

        card.appendChild(shareBtn);
    });
}

shareApp(app) {
    const shareUrl = `${window.location.origin}?ref=share&app=${app.id}`;

    // Track share event
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'share', {
            content_type: 'app',
            item_id: app.id,
            method: navigator.share ? 'native' : 'clipboard'
        });
    }

    // Execute share
    if (navigator.share) {
        navigator.share({
            title: app.name,
            text: `Check out ${app.name} on 32Gamers!`,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl);
        this.showNotification('Link copied!');
    }
}
```

### Track Viral Arrivals

```javascript
// In PortalManager constructor
checkViralArrival() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const appId = params.get('app');

    if (ref === 'share' && appId) {
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'viral_arrival', {
                shared_app_id: appId,
                referrer: document.referrer || 'direct'
            });
        }

        // Highlight the shared app when it loads
        this.pendingHighlight = appId;
    }
}
```

### Measure Viral Coefficient

```javascript
// K-factor = invites sent × conversion rate
// Track components:

// 1. Shares per user
// Count 'share' events per unique user

// 2. Viral arrivals per share
// Count 'viral_arrival' / 'share' events

// 3. Viral conversion
// Count 'viral_arrival' → 'app_click' in same session
```

---

## Retention Event Mapping

Track returning users to measure stickiness.

### Identify Return Visits

```javascript
// Track if user has visited before
trackRetention() {
    const lastVisit = localStorage.getItem('last_visit');
    const now = Date.now();
    const isReturning = lastVisit !== null;

    let daysSinceLastVisit = 0;
    if (lastVisit) {
        daysSinceLastVisit = Math.floor((now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24));
    }

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'session_start', {
            is_returning: isReturning,
            days_since_last: daysSinceLastVisit,
            visit_count: parseInt(localStorage.getItem('visit_count') || '0') + 1
        });
    }

    // Update storage
    localStorage.setItem('last_visit', now.toString());
    localStorage.setItem('visit_count',
        (parseInt(localStorage.getItem('visit_count') || '0') + 1).toString()
    );
}
```

### Retention Cohort Parameters

```javascript
// Add to page_view or session_start events
function getRetentionParams() {
    const firstVisit = localStorage.getItem('first_visit');
    const now = Date.now();

    if (!firstVisit) {
        localStorage.setItem('first_visit', now.toString());
        return { cohort_day: 0, user_age_days: 0 };
    }

    const userAgeDays = Math.floor((now - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));

    return {
        user_age_days: userAgeDays,
        cohort_week: Math.floor(userAgeDays / 7)
    };
}
```

---

## Feature Discovery Metrics

Track which features users find and use.

### Search Feature Discovery

```javascript
// scripts/app.js - Track search usage
setupSearch() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.openSearch();

            // Track feature discovery
            if (window.logEvent && window.firebaseAnalytics) {
                window.logEvent(window.firebaseAnalytics, 'feature_used', {
                    feature_name: 'search',
                    trigger: 'keyboard_shortcut'
                });
            }
        }
    });
}

filterApps(searchTerm) {
    const filtered = this.apps.filter(...);

    // Track search execution
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'search', {
            search_term: searchTerm.substring(0, 50),  // Truncate for privacy
            results_count: filtered.length
        });
    }

    this.renderFilteredApps(filtered);
}
```

### Admin Panel Discovery

```javascript
// Track admin panel access attempts
function trackAdminAccess(method) {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'feature_used', {
            feature_name: 'admin_panel',
            trigger: method  // 'keyboard_shortcut', 'direct_url', 'link_click'
        });
    }
}

// In index.html keyboard handler
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        trackAdminAccess('keyboard_shortcut');
        window.location.href = 'firebase-admin.html';
    }
});
```

---

## Admin Engagement Tracking

Track admin actions to measure engagement depth.

### CRUD Operation Tracking

```javascript
// firebase-admin.html - Track admin actions

async function addApp() {
    // ... validation ...

    try {
        await addDoc(collection(db, 'apps'), appData);

        trackAdminAction('app_created', {
            app_id: appId,
            has_image: Boolean(appImage),
            description_length: appDescription.length
        });

        showNotification('App added!', 'success');
    } catch (error) {
        trackAdminAction('app_create_failed', {
            error_code: error.code
        });
    }
}

async function editApp(index) {
    trackAdminAction('app_edit_started', { app_index: index });
    // ... edit logic ...
    trackAdminAction('app_edited', { app_id: editedAppId });
}

async function removeApp(index) {
    trackAdminAction('app_deleted', {
        app_id: deletedAppId,
        apps_remaining: apps.length - 1
    });
}

function trackAdminAction(actionName, params) {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, actionName, {
            ...params,
            timestamp: Date.now()
        });
    }
}
```

### Admin Session Metrics

```javascript
// Track admin session depth
let adminActions = 0;
const sessionStart = Date.now();

function trackAdminAction(actionName, params) {
    adminActions++;

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, actionName, {
            ...params,
            session_action_count: adminActions,
            session_duration_ms: Date.now() - sessionStart
        });
    }
}
```

---

## WARNING: Not Tracking Feature Discovery

**The Problem:**

```javascript
// BAD - Feature exists but usage is invisible
setupSearch() {
    // Search works but we don't know if anyone uses it
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            this.openSearch();
        }
    });
}
```

**Why This Breaks:**
1. Can't tell if features are useful
2. Don't know which shortcuts users prefer
3. Can't justify development effort

**The Fix:**

```javascript
// GOOD - Track all feature usage
setupSearch() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.openSearch();
            trackFeature('search', 'keyboard_shortcut');
        }
    });
}

function trackFeature(featureName, trigger) {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'feature_used', {
            feature_name: featureName,
            trigger: trigger
        });
    }
}
```

---

## WARNING: Tracking Vanity Metrics Only

**The Problem:**

```javascript
// BAD - Only tracks page views
logEvent(analytics, 'page_view', {...});
// "We had 1000 page views!" but no conversions tracked
```

**Why This Breaks:**
1. Page views don't indicate value
2. Can't optimize without conversion data
3. Misleading success indicators

**The Fix:**

Track the full funnel:

```javascript
// GOOD - Track meaningful progression
// Level 1: Reach
logEvent(analytics, 'page_view', {...});

// Level 2: Engagement
logEvent(analytics, 'apps_loaded', { count: apps.length });
logEvent(analytics, 'search', { query: searchTerm });

// Level 3: Conversion
logEvent(analytics, 'app_click', { app_id, app_name });

// Level 4: Retention
logEvent(analytics, 'session_start', { is_returning: true });

// Level 5: Advocacy
logEvent(analytics, 'share', { item_id: app.id });
```

---

## Related Skills

For onboarding flow design, see the **designing-onboarding-paths** skill.
For feature adoption patterns, see the **orchestrating-feature-adoption** skill.
