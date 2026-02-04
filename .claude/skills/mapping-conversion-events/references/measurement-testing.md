# Measurement & Testing Reference

## Contents
- Validating Event Tracking
- Debug Mode Setup
- Testing Funnels Locally
- Firebase Analytics Debugging
- Anti-Patterns

---

## Validating Event Tracking

### Chrome DevTools Network Tab

```javascript
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Filter by "analytics" or "collect"
// 4. Perform action (click app)
// 5. Look for request to google-analytics.com or firebase

// Expected payload structure for Firebase Analytics:
// POST https://www.google-analytics.com/g/collect?v=2&tid=G-CMGT3Y2CBX...
// Params include: en=app_click, ep.app_id=game-1, ep.app_name=Cool%20Game
```

### Console Logging for Debug

```javascript
// scripts/app.js - Add debug wrapper
const DEBUG_ANALYTICS = true;  // Set false in production

function trackEvent(eventName, params) {
    if (DEBUG_ANALYTICS) {
        console.log(`[Analytics Debug] ${eventName}:`, params);
    }

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, eventName, params);
    }
}

// Usage
trackEvent('app_click', { app_id: 'game-1', app_name: 'Cool Game' });
// Console: [Analytics Debug] app_click: {app_id: 'game-1', app_name: 'Cool Game'}
```

---

## Debug Mode Setup

### Firebase Analytics DebugView

Enable real-time event debugging in Firebase Console:

```javascript
// scripts/firebase-config.js - Add before getAnalytics()

// Enable debug mode for local development
if (window.location.hostname === 'localhost') {
    // This enables DebugView in Firebase Console
    window.localStorage.setItem('debug', 'firebase:analytics');
}

const analytics = getAnalytics(app);
```

**View events in Firebase Console:**
1. Go to Firebase Console → Analytics → DebugView
2. Select your device (appears after first event)
3. Events stream in real-time with 1-2 second delay

### Google Analytics Debug Extension

Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension:

```javascript
// When extension is enabled, detailed logs appear in console:
// analytics_debug_mode: Sending event: app_click
// Parameters: {app_id: "game-1", app_name: "Cool Game"}
```

---

## Testing Funnels Locally

### Simulate Full User Journey

```javascript
// Test script - run in browser console

async function testFunnel() {
    console.group('Funnel Test');

    // Stage 1: Page View
    console.log('1. Simulating page_view');
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'page_view', {
            page_title: 'Test',
            test_mode: true
        });
    }

    // Stage 2: Apps Loaded (wait for real load)
    await new Promise(r => setTimeout(r, 2000));
    console.log('2. Apps should be loaded - check apps_loaded event');

    // Stage 3: Simulate app click
    console.log('3. Simulating app_click');
    const firstApp = document.querySelector('.app-btn');
    if (firstApp) {
        const appId = firstApp.dataset.appId;
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'app_click', {
                app_id: appId,
                test_mode: true
            });
        }
    }

    console.log('Check Firebase DebugView for events');
    console.groupEnd();
}

testFunnel();
```

### Verify Event Parameters

```javascript
// Validation function to ensure events have required params
function validateEventParams(eventName, params, requiredParams) {
    const missing = requiredParams.filter(p => !(p in params));
    if (missing.length > 0) {
        console.error(`[Analytics] Event "${eventName}" missing params:`, missing);
        return false;
    }
    return true;
}

// Usage in trackAppClick
trackAppClick(appId, appName) {
    const params = { app_id: appId, app_name: appName };

    if (!validateEventParams('app_click', params, ['app_id', 'app_name'])) {
        return;  // Don't send malformed events
    }

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'app_click', params);
    }
}
```

---

## Firebase Analytics Debugging

### Check Analytics Initialization

```javascript
// Run in console to verify setup
function checkAnalyticsSetup() {
    console.group('Analytics Setup Check');

    // Check Firebase app
    console.log('Firebase app:', window.firebase?.app ? '✓ Loaded' : '✗ Missing');

    // Check Analytics
    console.log('Analytics:', window.firebaseAnalytics ? '✓ Initialized' : '✗ Not initialized');

    // Check logEvent function
    console.log('logEvent:', typeof window.logEvent === 'function' ? '✓ Available' : '✗ Not available');

    // Check measurementId in config
    const config = window.firebaseConfig;
    console.log('measurementId:', config?.measurementId || '✗ Not found');

    console.groupEnd();
}

checkAnalyticsSetup();
```

### Common Debug Scenarios

| Symptom | Check | Fix |
|---------|-------|-----|
| No events in DebugView | Analytics SDK imported? | Add `getAnalytics` import |
| Events fire but no data | measurementId correct? | Verify in firebase-config.js |
| app_click not firing | gtag vs logEvent? | Switch to Firebase logEvent |
| Events delayed 24+ hours | Using DebugView? | Enable debug mode locally |

---

## Testing Checklist

Copy this checklist when validating analytics:

```markdown
- [ ] Firebase Analytics SDK imported in firebase-config.js
- [ ] getAnalytics() called after initializeApp()
- [ ] window.firebaseAnalytics and window.logEvent exported
- [ ] page_view fires on page load
- [ ] apps_loaded fires after Firestore query completes
- [ ] app_click fires when clicking app card
- [ ] Events appear in Firebase DebugView within 5 seconds
- [ ] Event parameters are populated (not null/undefined)
- [ ] No console errors related to analytics
- [ ] Works on both localhost and production domain
```

---

## WARNING: Testing with Production Analytics

**The Problem:**

```javascript
// BAD - Test events pollute production data
logEvent(analytics, 'app_click', {
    app_id: 'test-123',
    app_name: 'Test App'
});
// This shows up in real dashboards!
```

**Why This Breaks:**
1. Corrupts conversion metrics
2. Inflates user counts
3. Breaks funnel accuracy

**The Fix:**

```javascript
// GOOD - Use test_mode parameter
logEvent(analytics, 'app_click', {
    app_id: appId,
    app_name: appName,
    test_mode: window.location.hostname === 'localhost'
});

// In Firebase, filter reports by test_mode != true
// Or use a separate Firebase project for dev
```

---

## WARNING: Not Verifying Events Actually Send

**The Problem:**

```javascript
// BAD - Assumes tracking works
trackAppClick(appId, appName) {
    if (window.logEvent) {
        window.logEvent(window.firebaseAnalytics, 'app_click', {...});
    }
    // Never verified this actually worked
}
```

**Why This Breaks:**
1. Analytics might be blocked by ad blockers
2. Network errors silently fail
3. Misconfigured SDK sends nothing

**The Fix:**

```javascript
// GOOD - Verify in DebugView and add error handling
trackAppClick(appId, appName) {
    try {
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'app_click', {
                app_id: appId,
                app_name: appName
            });
            console.debug('[Analytics] Event sent: app_click');
        } else {
            console.warn('[Analytics] SDK not available');
        }
    } catch (error) {
        console.error('[Analytics] Failed to send event:', error);
    }
}
```

---

## Iterate-Until-Pass Workflow

1. Make tracking changes
2. Validate: Open browser DevTools + Firebase DebugView
3. Trigger the event (click app, load page, etc.)
4. If event doesn't appear in DebugView within 5 seconds:
   - Check console for errors
   - Verify SDK initialization
   - Check network tab for blocked requests
   - Repeat step 1
5. Only proceed when event appears in DebugView with correct parameters

---

## Related Skills

For Firebase SDK configuration, see the **firebase** skill.
For debugging JavaScript issues, see the **vanilla-javascript** skill.
