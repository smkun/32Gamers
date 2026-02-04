# Measurement & Testing Reference

## Contents
- Current Analytics
- Event Tracking Gaps
- A/B Testing Approach
- Validation Workflow

## Current Analytics

### Existing Implementation

```javascript
// scripts/app.js:94-102 - App click tracking
trackAppClick(appId, appName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_click', {
            'app_id': appId,
            'app_name': appName
        });
    }
}
```

**Status**: Conditional on `gtag` being loaded. No Google Analytics script currently in `index.html`.

### WARNING: Missing Analytics Setup

No GA4 script exists in `index.html`. The `gtag` calls will silently fail.

**To enable tracking, add to `index.html` `<head>`**:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Event Tracking Gaps

### Events NOT Currently Tracked

| Event | Business Value | Implementation Location |
|-------|---------------|------------------------|
| Page load complete | Time to interactive | `scripts/app.js` |
| Search performed | Feature usage | `scripts/app.js:193` |
| Admin login | Admin engagement | `firebase-admin.html:108` |
| App added/updated/deleted | Catalog health | `firebase-admin.html:199-256` |
| Error displayed | UX issues | `scripts/app.js:104` |

### DO: Track Key Conversion Events

```javascript
// Add to firebase-admin.html after successful operations
gtag('event', 'app_added', {
    'app_id': newApp.appId,
    'app_name': newApp.name
});

gtag('event', 'admin_login', {
    'method': 'google'
});
```

### DON'T: Track Without Consent

```javascript
// BAD - no consent check
gtag('event', 'page_view');

// Consider - consent-aware tracking
if (userConsentedToAnalytics()) {
    gtag('event', 'page_view');
}
```

## Messaging A/B Testing

For static HTML without a testing platform, use URL parameters:

### Manual Variant Testing

```javascript
// Add to scripts/app.js
function getHeadlineVariant() {
    const params = new URLSearchParams(window.location.search);
    const variant = params.get('headline');
    
    const headlines = {
        'control': 'MISSION CONTROL',
        'v1': 'GAME HUB',
        'v2': 'LAUNCH PAD'
    };
    
    return headlines[variant] || headlines['control'];
}
```

```html
<!-- Test URLs -->
<!-- yoursite.com?headline=control -->
<!-- yoursite.com?headline=v1 -->
<!-- yoursite.com?headline=v2 -->
```

### Track Variant Performance

```javascript
// Track which variant user saw
const variant = getHeadlineVariant();
gtag('event', 'headline_impression', {
    'variant': variant
});
```

## Validation Workflow

When testing messaging changes:

1. **Make change** in target file
2. **Test locally**: `python3 -m http.server 8000`
3. **Verify rendering** at `localhost:8000`
4. **Check console** for JavaScript errors
5. **Deploy** to staging/production
6. **Monitor** for 24-48 hours
7. **Compare metrics** to baseline

### Validation Checklist

Copy this checklist:
- [ ] Copy renders correctly
- [ ] No JS console errors
- [ ] Mobile viewport looks correct
- [ ] Analytics events fire (check GA4 Realtime)
- [ ] Loading states still work
- [ ] Error states still work

## Related Skills

See the **instrumenting-product-metrics** skill for event implementation.
See the **mapping-conversion-events** skill for funnel definition.