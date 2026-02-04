# Feedback & Insights Reference

## Contents
- User Signal Collection
- Error Pattern Analysis
- Support Signal Detection
- Feedback Loop Implementation
- Insight-to-Action Workflow

## User Signal Collection

### Current Implicit Signals

The 32Gamers portal collects limited user signals:

| Signal | Collection Point | Insight |
|--------|------------------|---------|
| App clicks | `trackAppClick()` | Popular apps |
| Search terms | Not tracked | Unmet needs |
| Errors | Console only | Pain points |
| Session duration | Not tracked | Engagement |

### Adding Search Term Tracking

```javascript
// app.js - modify filterApps()
filterApps(searchTerm) {
    // Track search terms to understand user intent
    if (searchTerm.length > 2 && typeof gtag !== 'undefined') {
        gtag('event', 'search_query', {
            term: searchTerm,
            results_found: filtered.length
        });
    }
    
    // Zero-results = potential new app request
    if (filtered.length === 0 && searchTerm.length > 2) {
        gtag('event', 'search_no_results', {
            term: searchTerm
        });
    }
}
```

**Insight:** Zero-result searches reveal apps users want but don't exist.

## Error Pattern Analysis

### Console Error Monitoring

```javascript
// Add global error handler
window.addEventListener('error', (event) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno
        });
    }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'unhandled_promise', {
            reason: event.reason?.message || 'Unknown'
        });
    }
});
```

### Error Categories

| Error Type | Detection | User Impact |
|------------|-----------|-------------|
| Firebase connection | `loadApps()` catch | No apps displayed |
| Auth popup blocked | `auth/popup-blocked` | Cannot login |
| Network failure | `auth/network-request-failed` | Degraded experience |
| Permission denied | `permission-denied` | Cannot save changes |
| Image 404 | `onerror` handler | Broken thumbnails |

### Error-to-Insight Pattern

```javascript
// Aggregate errors and surface patterns
// firebase-admin.html - enhanced error tracking
async function loadApps() {
    try {
        // ... existing code ...
    } catch (error) {
        // Categorize for pattern analysis
        const category = categorizeError(error);
        gtag('event', 'load_error', {
            category: category,
            code: error.code,
            message: error.message
        });
    }
}

function categorizeError(error) {
    if (error.code === 'unavailable') return 'network';
    if (error.code === 'permission-denied') return 'auth';
    if (error.message?.includes('ERR_BLOCKED')) return 'adblock';
    return 'unknown';
}
```

## Support Signal Detection

### Friction Indicators

**High friction signals:**
- Multiple login attempts
- Form submission failures
- Repeated searches with no clicks
- Quick page abandonment

```javascript
// Track repeated login failures
let loginAttempts = 0;

document.getElementById('loginBtn').addEventListener('click', async () => {
    loginAttempts++;
    
    if (loginAttempts > 2) {
        gtag('event', 'repeated_login_attempts', {
            count: loginAttempts
        });
    }
    
    // ... existing login code ...
});
```

### Admin Workflow Friction

```javascript
// Track form abandonment
let formStarted = false;

document.querySelectorAll('#appManagement input').forEach(input => {
    input.addEventListener('focus', () => {
        if (!formStarted) {
            formStarted = true;
            gtag('event', 'form_started', {});
        }
    });
});

// On page unload with unsaved changes
window.addEventListener('beforeunload', () => {
    if (formStarted && !formSubmitted) {
        gtag('event', 'form_abandoned', {});
    }
});
```

## Feedback Loop Implementation

### In-App Feedback (Simple)

```html
<!-- Add to index.html footer -->
<div class="feedback-prompt">
    <p>Missing an app? 
        <a href="mailto:admin@example.com?subject=App%20Request">
            Request it here
        </a>
    </p>
</div>
```

### Structured Feedback Collection

```javascript
// For more structured feedback
function collectFeedback(type, details) {
    gtag('event', 'user_feedback', {
        type: type,  // 'bug', 'request', 'suggestion'
        details: details,
        page: window.location.pathname
    });
}

// Usage examples
collectFeedback('request', 'Add Minecraft server status');
collectFeedback('bug', 'App icon not loading');
```

## Insight-to-Action Workflow

### Weekly Review Process

```
1. Export GA4 events for past 7 days
2. Identify top patterns:
   - Most clicked apps → Feature on homepage
   - Zero-result searches → Add requested apps
   - Error spikes → Prioritize fixes
   - Form abandonment → Simplify flow
3. Create action items
4. Track improvements
```

### Insight Categories

| Insight Type | Data Source | Action |
|--------------|-------------|--------|
| Popular apps | `app_click` events | Feature prominently |
| Unmet needs | `search_no_results` | Add apps or alternatives |
| Pain points | Error events | Fix bugs, improve UX |
| Drop-off | Funnel analysis | Simplify flow |
| Engagement | Session metrics | A/B test improvements |

### Action Prioritization Matrix

| Frequency | User Impact | Priority |
|-----------|-------------|----------|
| High | High | P0 - Fix immediately |
| High | Low | P1 - Schedule soon |
| Low | High | P2 - Plan for next cycle |
| Low | Low | P3 - Backlog |

## Feedback Implementation Checklist

- [ ] Error events tracked with categories
- [ ] Search terms logged for intent analysis
- [ ] Zero-result searches flagged as requests
- [ ] Repeated failures detected as friction
- [ ] Form abandonment tracked
- [ ] Weekly review process established
- [ ] Clear feedback channel for users
- [ ] Insight-to-action workflow documented

See the **orchestrating-feature-adoption** skill for acting on feedback insights.