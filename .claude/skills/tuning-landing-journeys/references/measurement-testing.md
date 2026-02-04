# Measurement & Testing Reference

## Contents
- Analytics Integration
- Performance Measurement
- Manual Testing Checklist
- A/B Testing Opportunities

## Analytics Integration

### Current State

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

**WARNING: gtag not loaded**

No Google Analytics script in `index.html`. The tracking code exists but never fires.

### Adding Google Analytics

```html
<!-- ADD to index.html head, before other scripts -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Events to Track

| Event | Trigger | Parameters |
|-------|---------|------------|
| `app_click` | App card clicked | `app_id`, `app_name` |
| `search_used` | Search input focused | - |
| `admin_accessed` | Admin panel opened | `method` (icon/keyboard) |
| `page_load_time` | DOMContentLoaded | `duration_ms` |

### Adding Event Tracking

```javascript
// Enhance handleAdminAccess in scripts/app.js
async handleAdminAccess() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'admin_accessed', { 'method': 'icon_click' });
    }
    window.location.href = 'firebase-admin.html';
}
```

## Performance Measurement

### Core Web Vitals Targets

| Metric | Target | Measurement Point |
|--------|--------|-------------------|
| LCP | <2.5s | Largest app card render |
| FID | <100ms | First app card click |
| CLS | <0.1 | Loading state → app grid transition |

### Using Chrome DevTools

```bash
# Start local server
python3 -m http.server 8000

# Use mcp__chrome-devtools__performance_start_trace
# Navigate to http://localhost:8000
# Use mcp__chrome-devtools__performance_stop_trace
# Use mcp__chrome-devtools__performance_analyze_insight
```

### Current Performance Concerns

**1. Firebase SDK Size**

```html
<!-- Large SDK loaded from CDN -->
<script type="module" src="scripts/firebase-config.js"></script>
```

Firebase SDK is ~100KB+ gzipped. Consider lazy loading for non-critical features.

**2. Font Loading**

```html
<!-- index.html:10-12 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron...&display=swap">
```

**DO:** `preconnect` hints reduce latency
**DO:** `display=swap` prevents FOIT

## Manual Testing Checklist

Copy this checklist for each release:

### Landing Page
- [ ] Loading animation displays
- [ ] Apps load from Firebase
- [ ] App cards have hover effects
- [ ] App click navigates correctly
- [ ] Search (Ctrl+F) filters apps
- [ ] Admin icon visible and clickable
- [ ] Ctrl+Alt+A opens admin

### Admin Panel
- [ ] Google login popup opens
- [ ] Authorized user sees app list
- [ ] Add app form validates inputs
- [ ] Edit populates form correctly
- [ ] Delete requires confirmation
- [ ] Logout clears session

### Responsive
- [ ] 1024px: Grid reflows to 3 columns
- [ ] 768px: Grid reflows to 2 columns
- [ ] 480px: Grid shows single column
- [ ] Touch devices: Active states work

### Error States
- [ ] Firebase offline: Error message shows
- [ ] Invalid app data: Graceful handling
- [ ] Auth failure: Clear error message

## A/B Testing Opportunities

### Test 1: Loading State Duration Perception

**Hypothesis:** Animated progress bar makes wait feel shorter

**Current:** Infinite animation loop
**Variant:** Fake progress that completes near actual load time

```javascript
// Track perceived vs actual load time
const loadStart = Date.now();
// ... after apps render
gtag('event', 'load_complete', {
    'actual_ms': Date.now() - loadStart,
    'perceived_rating': userRating // prompt after load
});
```

### Test 2: App Card Size

**Hypothesis:** Larger cards increase click-through

**Current:** `minmax(240px, 1fr)`
**Variant:** `minmax(280px, 1fr)`

```css
/* A/B variant */
.button-container.variant-large {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

### Test 3: Admin Discovery

**Hypothesis:** Labeled button increases admin access

**Current:** Icon only with tooltip
**Variant:** "ADMIN" text label visible

See the **instrumenting-product-metrics** skill for implementation patterns.