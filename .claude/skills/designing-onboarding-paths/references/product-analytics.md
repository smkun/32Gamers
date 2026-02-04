# Product Analytics Reference

## Contents
- Onboarding Completion Tracking
- Event Logging Pattern
- Activation Metrics
- Funnel Definition
- Privacy Considerations

---

## Onboarding Completion Tracking

Track onboarding funnel without external analytics:

```javascript
// scripts/analytics.js - Lightweight local analytics
const Analytics = {
    STORAGE_KEY: '32gamers_analytics',
    
    getEvents() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    },
    
    track(event, properties = {}) {
        const events = this.getEvents();
        events.push({
            event,
            properties,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
        console.debug(`[Analytics] ${event}`, properties);
    },
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('32gamers_session');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('32gamers_session', sessionId);
        }
        return sessionId;
    }
};
```

### Tracking Onboarding Steps

```javascript
// scripts/app.js - Instrument key moments
class PortalManager {
    async init() {
        Analytics.track('portal_loaded');
        
        const isFirstVisit = !localStorage.getItem('32gamers_visited');
        if (isFirstVisit) {
            Analytics.track('first_visit');
        }
        
        await this.loadApps();
        Analytics.track('apps_loaded', { count: this.apps.length });
    }
    
    showWelcomeFlow() {
        Analytics.track('onboarding_started');
        // ... show modal
    }
    
    dismissWelcome() {
        Analytics.track('onboarding_completed');
        // ... dismiss modal
    }
    
    handleAdminAccess() {
        Analytics.track('admin_accessed', { method: 'icon' });
        window.location.href = 'firebase-admin.html';
    }
}

// Track keyboard shortcut usage
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
        Analytics.track('search_opened', { method: 'keyboard' });
    }
    if (e.ctrlKey && e.altKey && e.key === 'a') {
        Analytics.track('admin_accessed', { method: 'keyboard' });
    }
});
```

---

## Event Logging Pattern

Consistent event naming convention:

| Event | When | Properties |
|-------|------|------------|
| `portal_loaded` | Page load complete | - |
| `first_visit` | No localStorage flag | - |
| `onboarding_started` | Welcome modal shown | - |
| `onboarding_skipped` | User clicks skip | `{ step: number }` |
| `onboarding_completed` | User finishes flow | `{ duration_ms: number }` |
| `search_opened` | Search activated | `{ method: 'keyboard'\|'click' }` |
| `search_performed` | Search submitted | `{ query: string, results: number }` |
| `app_clicked` | App card clicked | `{ appId: string }` |
| `admin_accessed` | Admin panel opened | `{ method: 'icon'\|'keyboard' }` |
| `admin_login` | Google OAuth success | `{ uid: string }` |
| `app_created` | New app added | `{ appId: string }` |

---

## Activation Metrics

Define what "activated" means for this portal:

```javascript
// scripts/analytics.js
const ActivationTracker = {
    ACTIVATION_CRITERIA: {
        viewed_apps: false,      // Saw app list
        clicked_app: false,      // Clicked at least one app
        used_search: false,      // Used search feature
        returned_visit: false    // Came back within 7 days
    },
    
    checkActivation() {
        const events = Analytics.getEvents();
        const criteria = { ...this.ACTIVATION_CRITERIA };
        
        criteria.viewed_apps = events.some(e => e.event === 'apps_loaded');
        criteria.clicked_app = events.some(e => e.event === 'app_clicked');
        criteria.used_search = events.some(e => e.event === 'search_opened');
        
        const firstVisit = localStorage.getItem('32gamers_visited');
        const lastVisit = localStorage.getItem('32gamers_last_visit');
        if (firstVisit && lastVisit && firstVisit !== lastVisit) {
            criteria.returned_visit = true;
        }
        
        const activated = Object.values(criteria).filter(Boolean).length >= 2;
        
        return {
            criteria,
            activated,
            score: Object.values(criteria).filter(Boolean).length
        };
    }
};
```

---

## Funnel Definition

```javascript
// Admin onboarding funnel
const AdminFunnel = {
    steps: [
        { name: 'admin_page_viewed', required: true },
        { name: 'login_started', required: true },
        { name: 'login_completed', required: true },
        { name: 'form_focused', required: false },
        { name: 'app_created', required: true }
    ],
    
    analyzeFunnel() {
        const events = Analytics.getEvents();
        const results = this.steps.map(step => ({
            ...step,
            completed: events.some(e => e.event === step.name),
            timestamp: events.find(e => e.event === step.name)?.timestamp
        }));
        
        // Find drop-off point
        const dropOff = results.findIndex(r => r.required && !r.completed);
        
        return {
            steps: results,
            dropOffStep: dropOff === -1 ? null : results[dropOff].name,
            completionRate: results.filter(r => r.completed).length / results.length
        };
    }
};
```

---

## Privacy Considerations

### WARNING: Don't Track PII

**The Problem:**

```javascript
// BAD - Stores email in localStorage
Analytics.track('admin_login', { email: user.email });
```

**Why This Breaks:**
1. localStorage is accessible to any script on the domain
2. GDPR/CCPA compliance issues
3. Unnecessary for product analytics

**The Fix:**

```javascript
// GOOD - Use anonymous identifiers
Analytics.track('admin_login', { 
    uid_hash: hashUID(user.uid),  // One-way hash
    is_returning: !!localStorage.getItem(`admin_${user.uid}`)
});

function hashUID(uid) {
    // Simple hash for anonymization
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = ((hash << 5) - hash) + uid.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString(16);
}
```

### Data Retention

```javascript
// Automatically purge old events
Analytics.cleanup = function() {
    const events = this.getEvents();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recent = events.filter(e => e.timestamp > thirtyDaysAgo);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recent));
};

// Run on load
Analytics.cleanup();
```