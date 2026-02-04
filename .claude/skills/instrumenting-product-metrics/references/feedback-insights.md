# Feedback & Insights Metrics

## Contents
- Error Signal Collection
- User Friction Detection
- Implicit Feedback Signals
- Support Signal Tracking
- Anti-Patterns

## Error Signal Collection

Errors are implicit negative feedback. Track them systematically.

### JavaScript Error Tracking

Add global error handler to both pages:

```javascript
// Add to index.html and firebase-admin.html
window.addEventListener('error', (event) => {
    gtag('event', 'js_error', {
        'error_message': event.message?.substring(0, 100),
        'error_source': event.filename,
        'error_line': event.lineno,
        'error_col': event.colno,
        'page': window.location.pathname
    });
});

window.addEventListener('unhandledrejection', (event) => {
    gtag('event', 'promise_rejection', {
        'error_reason': String(event.reason)?.substring(0, 100),
        'page': window.location.pathname
    });
});
```

### Firebase Error Categorization

Extract actionable insights from Firebase errors:

```javascript
// Enhanced error handling in loadApps (scripts/app.js:43-46)
catch (error) {
    const errorCategory = categorizeFirebaseError(error);

    gtag('event', 'firebase_error', {
        'error_category': errorCategory.category,
        'error_code': error.code || 'unknown',
        'error_recoverable': errorCategory.recoverable,
        'suggested_action': errorCategory.action
    });

    console.error('Failed to load apps:', error);
    this.loadFallbackApps();
}

function categorizeFirebaseError(error) {
    const code = error.code || '';
    const message = error.message || '';

    if (code === 'unavailable' || message.includes('network')) {
        return { category: 'network', recoverable: true, action: 'retry' };
    }
    if (code === 'permission-denied') {
        return { category: 'auth', recoverable: false, action: 'login' };
    }
    if (message.includes('ERR_BLOCKED_BY_CLIENT')) {
        return { category: 'ad_blocker', recoverable: false, action: 'whitelist' };
    }
    if (code === 'resource-exhausted') {
        return { category: 'quota', recoverable: true, action: 'wait' };
    }
    return { category: 'unknown', recoverable: false, action: 'contact_support' };
}
```

### Auth Error Insights

Track auth failures for admin panel (firebase-admin.html:110-120):

```javascript
catch (error) {
    const authInsight = {
        'auth/popup-blocked': { category: 'browser_settings', friction: 'high' },
        'auth/popup-closed-by-user': { category: 'user_abandoned', friction: 'medium' },
        'auth/network-request-failed': { category: 'network', friction: 'high' },
        'auth/cancelled-popup-request': { category: 'double_click', friction: 'low' },
        'auth/user-disabled': { category: 'account_issue', friction: 'critical' }
    };

    const insight = authInsight[error.code] || { category: 'unknown', friction: 'medium' };

    gtag('event', 'auth_failure', {
        'error_code': error.code,
        'error_category': insight.category,
        'friction_level': insight.friction
    });
}
```

## User Friction Detection

### Rage Click Detection

Users clicking rapidly indicate frustration:

```javascript
// Add to PortalManager
constructor() {
    this.apps = [];
    this.clickHistory = [];
    this.init();
}

trackClick(element, context) {
    const now = Date.now();
    this.clickHistory.push({ time: now, element, context });

    // Keep last 10 clicks
    if (this.clickHistory.length > 10) this.clickHistory.shift();

    // Detect rage clicks: 3+ clicks within 1 second on same element
    const recentClicks = this.clickHistory.filter(c =>
        now - c.time < 1000 && c.element === element
    );

    if (recentClicks.length >= 3) {
        gtag('event', 'rage_click_detected', {
            'element': element,
            'context': context,
            'click_count': recentClicks.length,
            'time_span_ms': now - recentClicks[0].time
        });
    }
}
```

### Dead Click Detection

Clicks on non-interactive elements:

```javascript
// Add to index.html
document.addEventListener('click', (e) => {
    const target = e.target;
    const isInteractive = target.matches('a, button, input, [onclick], [role="button"]');
    const nearInteractive = target.closest('a, button, [onclick]');

    if (!isInteractive && !nearInteractive) {
        gtag('event', 'dead_click', {
            'element_tag': target.tagName,
            'element_class': target.className?.substring(0, 50),
            'page_area': getPageArea(e.clientX, e.clientY)
        });
    }
});

function getPageArea(x, y) {
    const third = window.innerWidth / 3;
    const horizontal = x < third ? 'left' : x < third * 2 ? 'center' : 'right';
    const vertical = y < 200 ? 'header' : y > window.innerHeight - 100 ? 'footer' : 'main';
    return `${vertical}_${horizontal}`;
}
```

### Form Abandonment

Track when users start but don't complete forms:

```javascript
// In firebase-admin.html
let formStarted = false;
let formCompleted = false;

formFields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', () => {
        if (!formStarted) {
            formStarted = true;
            gtag('event', 'form_started', { form: 'app_form' });
        }
    });
});

// Track submission
async function addApp() {
    formCompleted = true;
    // ... existing code
}

// Track abandonment on page leave
window.addEventListener('beforeunload', () => {
    if (formStarted && !formCompleted) {
        // Use sendBeacon for reliability
        navigator.sendBeacon('/analytics', JSON.stringify({
            event: 'form_abandoned',
            form: 'app_form',
            fields_filled: formFields.filter(id =>
                document.getElementById(id).value.trim().length > 0
            ).length
        }));
    }
});
```

## Implicit Feedback Signals

### Time to First Interaction

Long time before first click may indicate confusion:

```javascript
// In PortalManager
constructor() {
    this.pageLoadTime = Date.now();
    this.firstInteractionTracked = false;
    this.apps = [];
    this.init();
}

trackFirstInteraction(interactionType) {
    if (this.firstInteractionTracked) return;
    this.firstInteractionTracked = true;

    const timeToInteract = Date.now() - this.pageLoadTime;

    gtag('event', 'first_interaction', {
        'interaction_type': interactionType,
        'time_to_interact_ms': timeToInteract,
        'interaction_speed': timeToInteract < 3000 ? 'fast' :
                            timeToInteract < 10000 ? 'normal' : 'slow'
    });
}

// Call from various interaction points
trackAppClick(appId, appName) {
    this.trackFirstInteraction('app_click');
    // ... existing code
}

setupSearch() {
    // ... in search open handler
    this.trackFirstInteraction('search_open');
}
```

### Scroll Depth (if content scrolls)

```javascript
let maxScrollDepth = 0;

window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );

    if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        // Track at thresholds
        if ([25, 50, 75, 100].includes(scrollPercent)) {
            gtag('event', 'scroll_depth', {
                'depth_percent': scrollPercent
            });
        }
    }
});
```

### Quick Bounce Detection

Users leaving very quickly indicate immediate friction:

```javascript
let hasEngaged = false;

// Any meaningful action counts as engagement
function markEngaged() {
    hasEngaged = true;
}

// Add to all interaction handlers
trackAppClick() { markEngaged(); /* ... */ }
// etc.

window.addEventListener('beforeunload', () => {
    const timeOnPage = Date.now() - pageLoadTime;

    if (!hasEngaged && timeOnPage < 5000) {
        gtag('event', 'quick_bounce', {
            'time_on_page_ms': timeOnPage,
            'transport_type': 'beacon'
        });
    }
});
```

## Support Signal Tracking

### External Link Tracking

If users click help/support links:

```javascript
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="mailto:"], a[href*="support"], a[href*="help"]');
    if (link) {
        gtag('event', 'support_signal', {
            'signal_type': 'link_click',
            'link_text': link.textContent?.substring(0, 50),
            'link_href': link.href?.substring(0, 100)
        });
    }
});
```

### Copy Actions on Error Messages

Users copying error text often need support:

```javascript
document.addEventListener('copy', () => {
    const selection = window.getSelection().toString();
    const isInErrorContext = document.querySelector('.error-message, .status-message.error');

    if (isInErrorContext && selection.length > 10) {
        gtag('event', 'support_signal', {
            'signal_type': 'error_text_copied',
            'copied_length': selection.length
        });
    }
});
```

## Anti-Patterns

### WARNING: Tracking Without Actionability

**The Problem:**

```javascript
// BAD - Data collected but never used
gtag('event', 'button_color', { color: 'blue' });
gtag('event', 'font_size', { size: '14px' });
// No business decision can be made from this
```

**Why This Breaks:**
1. Bloats analytics with noise
2. Increases tracking costs
3. Makes meaningful signals harder to find

**The Fix:**

```javascript
// GOOD - Only track what drives decisions
gtag('event', 'app_click', {
    app_id,  // Which apps are popular?
    position // Does position affect clicks?
});
// These answer: "What should we feature?"
```

### WARNING: Missing Error Context

**The Problem:**

```javascript
// BAD - Error without context
gtag('event', 'error', { message: error.message });
// Cannot reproduce or fix
```

**Why This Breaks:**
1. Cannot identify which users are affected
2. Cannot determine error frequency
3. Cannot correlate with user actions

**The Fix:**

```javascript
// GOOD - Rich error context
gtag('event', 'error', {
    message: error.message?.substring(0, 100),
    stack: error.stack?.substring(0, 200),
    page: window.location.pathname,
    last_action: sessionStorage.getItem('last_action'),
    session_id: Analytics.getSessionId(),
    app_count: portalManager?.apps?.length || 0
});
```

### WARNING: PII in Feedback Data

**The Problem:**

```javascript
// BAD - User email in error tracking
gtag('event', 'auth_error', {
    email: user.email,  // PII violation
    error: 'login failed'
});
```

**Why This Breaks:**
1. Violates GDPR/CCPA
2. Creates legal liability
3. Unnecessary for debugging

**The Fix:**

```javascript
// GOOD - Hash or omit PII
gtag('event', 'auth_error', {
    user_id_hash: hashUserId(user.uid), // One-way hash
    error_code: 'auth/popup-blocked'
});
```

## Feedback Collection Checklist

Copy this checklist when implementing feedback metrics:

- [ ] Add global JS error handler
- [ ] Add unhandled promise rejection handler
- [ ] Categorize Firebase errors with actionable codes
- [ ] Categorize auth errors with friction levels
- [ ] Implement rage click detection (3+ clicks/second)
- [ ] Implement dead click detection for UX issues
- [ ] Track form start and abandonment
- [ ] Track time to first interaction
- [ ] Track quick bounces (<5 seconds, no engagement)
- [ ] Add support signal tracking (help link clicks, error copy)
- [ ] Verify no PII in any tracked events
- [ ] Truncate all string values to prevent bloat
