# Strategy & Monetization Reference

## Contents
- Monetization Event Mapping
- Premium Feature Tracking
- Value Metric Identification
- Revenue Attribution
- Anti-Patterns

---

## Monetization Event Mapping

The 32Gamers portal is currently free, but tracking value-creation events enables future monetization.

### Value-Creating Events to Track

| Event | Value Signal | Monetization Angle |
|-------|--------------|-------------------|
| `app_click` | User found valuable app | Featured app placement |
| `apps_loaded` count | Catalog size matters | Premium app listings |
| `admin_login` | Active curator | Pro admin features |
| `app_created` | Content creation | Unlimited apps tier |
| `search` with results | Discovery value | Advanced search features |

### Event-to-Value Mapping

```javascript
// Track events that indicate value delivery
const VALUE_EVENTS = {
    app_click: 1,        // User found something useful
    search_success: 0.5, // Search returned results
    admin_action: 2,     // Admin actively curating
    return_visit: 1.5    // User came back
};

function trackValueEvent(eventName, params) {
    const valueScore = VALUE_EVENTS[eventName] || 0;

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, eventName, {
            ...params,
            value_score: valueScore
        });
    }

    // Accumulate session value
    const sessionValue = parseFloat(sessionStorage.getItem('session_value') || '0');
    sessionStorage.setItem('session_value', (sessionValue + valueScore).toString());
}
```

---

## Premium Feature Tracking

Track potential premium feature usage to validate demand before building.

### Feature Gate Simulation

```javascript
// Track when users hit "premium" boundaries
function checkPremiumGate(feature, currentUsage, limit) {
    if (currentUsage >= limit) {
        // Track gate hit
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'premium_gate_hit', {
                feature: feature,
                current_usage: currentUsage,
                limit: limit
            });
        }
        return true;  // Would be gated
    }
    return false;
}

// Example: Track if admin would hit app limit
async function addApp() {
    const currentApps = await getAppCount();

    // Track if user would hit a hypothetical 10-app limit
    if (checkPremiumGate('app_count', currentApps, 10)) {
        console.log('User would hit premium gate at 10 apps');
    }

    // Continue with add logic...
}
```

### Track Feature Interest

```javascript
// Track clicks on "coming soon" or hypothetical premium features
function trackFeatureInterest(featureName) {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'feature_interest', {
            feature_name: featureName,
            user_type: currentUser ? 'admin' : 'visitor'
        });
    }
}

// Example: Add "Pro" badge to features and track clicks
// <span class="pro-badge" onclick="trackFeatureInterest('bulk_import')">PRO</span>
```

---

## Value Metric Identification

Identify which metrics correlate with user value to inform pricing.

### Session Value Calculation

```javascript
// Calculate total session value before user leaves
window.addEventListener('beforeunload', () => {
    const sessionValue = parseFloat(sessionStorage.getItem('session_value') || '0');
    const sessionDuration = Date.now() - parseInt(sessionStorage.getItem('session_start') || Date.now());

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'session_end', {
            total_value_score: sessionValue,
            duration_ms: sessionDuration,
            apps_clicked: parseInt(sessionStorage.getItem('apps_clicked') || '0'),
            searches_performed: parseInt(sessionStorage.getItem('searches') || '0')
        });
    }
});

// Initialize session tracking
sessionStorage.setItem('session_start', Date.now().toString());
sessionStorage.setItem('session_value', '0');
sessionStorage.setItem('apps_clicked', '0');
sessionStorage.setItem('searches', '0');
```

### Admin Value Metrics

```javascript
// Track admin productivity metrics
function trackAdminSession() {
    const metrics = {
        apps_added: parseInt(localStorage.getItem('total_apps_added') || '0'),
        apps_edited: parseInt(localStorage.getItem('total_apps_edited') || '0'),
        apps_deleted: parseInt(localStorage.getItem('total_apps_deleted') || '0'),
        sessions_count: parseInt(localStorage.getItem('admin_sessions') || '0')
    };

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'admin_lifetime_stats', metrics);
    }
}
```

---

## Revenue Attribution

If monetization is added, attribute revenue to acquisition source.

### First-Touch Attribution

```javascript
// Store first traffic source for later attribution
function captureFirstTouch() {
    if (localStorage.getItem('first_touch_source')) {
        return;  // Already captured
    }

    const params = new URLSearchParams(window.location.search);
    const firstTouch = {
        source: params.get('utm_source') || 'direct',
        medium: params.get('utm_medium') || 'none',
        campaign: params.get('utm_campaign') || 'none',
        timestamp: Date.now()
    };

    localStorage.setItem('first_touch_source', JSON.stringify(firstTouch));
}

// Include in conversion events
function getAttributionParams() {
    const firstTouch = JSON.parse(localStorage.getItem('first_touch_source') || '{}');
    return {
        first_touch_source: firstTouch.source,
        first_touch_medium: firstTouch.medium,
        first_touch_campaign: firstTouch.campaign
    };
}
```

### Potential Revenue Events

```javascript
// When/if monetization is added, track these events:

// Subscription started
logEvent(analytics, 'purchase', {
    currency: 'USD',
    value: 9.99,
    items: [{ item_name: 'Pro Plan', item_category: 'subscription' }],
    ...getAttributionParams()
});

// Feature upgraded
logEvent(analytics, 'unlock_achievement', {
    achievement_id: 'unlimited_apps',
    ...getAttributionParams()
});

// Sponsored app placement
logEvent(analytics, 'ad_impression', {
    ad_format: 'featured_app',
    ad_source: 'sponsored',
    ...getAttributionParams()
});
```

---

## Pricing Signal Collection

Track signals that indicate willingness to pay.

### Power User Identification

```javascript
// Define power user thresholds
const POWER_USER_SIGNALS = {
    apps_created: 5,
    return_visits: 3,
    search_uses: 10,
    session_duration_ms: 300000  // 5 minutes
};

function checkPowerUserStatus() {
    const stats = {
        apps_created: parseInt(localStorage.getItem('total_apps_added') || '0'),
        return_visits: parseInt(localStorage.getItem('visit_count') || '0'),
        search_uses: parseInt(localStorage.getItem('total_searches') || '0')
    };

    const isPowerUser = Object.entries(POWER_USER_SIGNALS).every(([key, threshold]) => {
        return (stats[key] || 0) >= threshold;
    });

    if (isPowerUser && !localStorage.getItem('power_user_tracked')) {
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'power_user_achieved', stats);
        }
        localStorage.setItem('power_user_tracked', 'true');
    }

    return isPowerUser;
}
```

---

## WARNING: Tracking Without Monetization Strategy

**The Problem:**

```javascript
// BAD - Tracking everything without purpose
logEvent(analytics, 'button_hover', {...});
logEvent(analytics, 'scroll_position', {...});
logEvent(analytics, 'mouse_click', {...});
// What decisions do these inform?
```

**Why This Breaks:**
1. Data without strategy is just noise
2. Wastes Firebase Analytics event limits
3. No actionable insights

**The Fix:**

Only track events that inform specific decisions:

```javascript
// GOOD - Each event maps to a decision
// Decision: Should we add search? → Track search usage
logEvent(analytics, 'search', { results_count });

// Decision: Should we limit free apps? → Track app creation
logEvent(analytics, 'app_created', { total_apps });

// Decision: Which apps to feature? → Track app clicks
logEvent(analytics, 'app_click', { app_id, app_name });
```

---

## WARNING: Premature Monetization Instrumentation

**The Problem:**

```javascript
// BAD - Building complex paywall tracking before validating demand
logEvent(analytics, 'paywall_shown', {...});
logEvent(analytics, 'payment_initiated', {...});
logEvent(analytics, 'subscription_failed', {...});
// Portal doesn't even have payments!
```

**Why This Breaks:**
1. Wasted engineering effort
2. Events fire but mean nothing
3. Misleads analysis

**The Fix:**

```javascript
// GOOD - Track value signals first
// Phase 1: Validate demand
logEvent(analytics, 'premium_gate_hit', { feature: 'app_count' });
logEvent(analytics, 'feature_interest', { feature: 'bulk_import' });

// Phase 2: Only add payment tracking when monetization ships
// (Don't build this until you need it)
```

---

## Monetization Readiness Checklist

Copy this checklist before implementing paid features:

```markdown
- [ ] app_click events firing correctly
- [ ] Power user identification working
- [ ] First-touch attribution captured
- [ ] Session value tracking implemented
- [ ] Premium gate hit events defined
- [ ] Feature interest tracking on pro badges
- [ ] At least 100 sessions with value data
- [ ] Clear correlation between events and user value
```

---

## Related Skills

For pricing tier design, see the **structuring-offer-ladders** skill.
For conversion funnel setup, see the **conversion-optimization** reference.
