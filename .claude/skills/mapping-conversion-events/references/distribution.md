# Distribution Reference

## Contents
- Traffic Source Tracking
- Referral Attribution
- Share/Embed Tracking
- Cross-Domain Tracking
- Anti-Patterns

---

## Traffic Source Tracking

Track where users come from to measure distribution channel effectiveness.

### UTM Parameter Capture

```javascript
// scripts/app.js - Add to init or constructor
captureUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utmParams = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_term: params.get('utm_term'),
        utm_content: params.get('utm_content')
    };

    // Filter out null values
    const cleanParams = Object.fromEntries(
        Object.entries(utmParams).filter(([_, v]) => v != null)
    );

    if (Object.keys(cleanParams).length > 0) {
        // Store for session attribution
        sessionStorage.setItem('utm_params', JSON.stringify(cleanParams));

        // Track source event
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'traffic_source', cleanParams);
        }
    }
}
```

### Include Source in Conversions

```javascript
// Attach UTM params to conversion events
trackAppClick(appId, appName) {
    const utmParams = JSON.parse(sessionStorage.getItem('utm_params') || '{}');

    const eventData = {
        app_id: appId,
        app_name: appName,
        ...utmParams  // Include attribution
    };

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'app_click', eventData);
    }
}
```

---

## Referral Attribution

Track organic referrals (non-UTM traffic).

### Capture Document Referrer

```javascript
// scripts/app.js - Track referrer on page load
trackReferrer() {
    const referrer = document.referrer;
    if (!referrer) {
        // Direct traffic
        return { referrer_type: 'direct' };
    }

    try {
        const url = new URL(referrer);
        const referrerDomain = url.hostname;

        // Categorize referrer
        let referrerType = 'other';
        if (referrerDomain.includes('google')) referrerType = 'search';
        else if (referrerDomain.includes('facebook') || referrerDomain.includes('twitter')) {
            referrerType = 'social';
        }
        else if (referrerDomain.includes('discord')) referrerType = 'community';

        return {
            referrer_type: referrerType,
            referrer_domain: referrerDomain
        };
    } catch {
        return { referrer_type: 'unknown' };
    }
}

// Include in page_view event
trackPageView() {
    const referrerData = this.trackReferrer();

    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            ...referrerData
        });
    }
}
```

---

## Share/Embed Tracking

If users can share or embed portal content, track that distribution.

### Share Button Tracking

```javascript
// Add share functionality with tracking
function shareApp(appId, appName, shareMethod) {
    const shareUrl = `${window.location.origin}?app=${appId}`;

    // Track share intent
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'share', {
            method: shareMethod,  // 'copy_link', 'native_share', 'twitter', etc.
            content_type: 'app',
            item_id: appId
        });
    }

    // Execute share
    if (shareMethod === 'copy_link') {
        navigator.clipboard.writeText(shareUrl);
    } else if (shareMethod === 'native_share' && navigator.share) {
        navigator.share({
            title: appName,
            text: `Check out ${appName} on 32Gamers!`,
            url: shareUrl
        });
    }
}
```

### Track Shared Link Arrivals

```javascript
// Detect if user arrived via shared app link
checkSharedAppLink() {
    const params = new URLSearchParams(window.location.search);
    const sharedAppId = params.get('app');

    if (sharedAppId) {
        if (window.logEvent && window.firebaseAnalytics) {
            window.logEvent(window.firebaseAnalytics, 'shared_link_arrival', {
                shared_app_id: sharedAppId
            });
        }

        // Optionally scroll to or highlight the shared app
        this.highlightApp(sharedAppId);
    }
}
```

---

## Cross-Domain Tracking

If 32Gamers links to external apps, track handoffs.

### Outbound Link Tracking

```javascript
// Track when users leave to external apps
renderApps() {
    this.apps.forEach(app => {
        const button = document.createElement('a');
        button.href = app.url;

        // Check if external link
        const isExternal = app.url.startsWith('http') &&
            !app.url.includes(window.location.hostname);

        if (isExternal) {
            button.addEventListener('click', (e) => {
                // Track before navigation
                this.trackOutboundLink(app.id, app.name, app.url);
            });
        }

        // ... rest of rendering
    });
}

trackOutboundLink(appId, appName, destinationUrl) {
    if (window.logEvent && window.firebaseAnalytics) {
        window.logEvent(window.firebaseAnalytics, 'outbound_link', {
            app_id: appId,
            app_name: appName,
            destination_domain: new URL(destinationUrl).hostname,
            link_url: destinationUrl
        });
    }
}
```

---

## Distribution Channel Performance

### Sample UTM Links for Different Channels

```
# Discord community
https://32gamers.club/?utm_source=discord&utm_medium=community&utm_campaign=launch

# Twitter/X post
https://32gamers.club/?utm_source=twitter&utm_medium=social&utm_campaign=game_spotlight

# Email newsletter
https://32gamers.club/?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_picks

# Reddit post
https://32gamers.club/?utm_source=reddit&utm_medium=social&utm_campaign=r_gaming
```

### Measuring Channel Effectiveness

Query Firebase Analytics or export data to measure:

| Metric | Formula |
|--------|---------|
| Channel conversion rate | `app_click` with `utm_source=X` / `page_view` with `utm_source=X` |
| Best performing source | Highest `app_click` count by `utm_source` |
| Social share virality | `shared_link_arrival` / `share` events |

---

## WARNING: Losing Attribution on Page Refresh

**The Problem:**

```javascript
// BAD - UTM params lost after navigation
const params = new URLSearchParams(window.location.search);
const source = params.get('utm_source');  // null after any navigation
```

**Why This Breaks:**
1. User lands with UTM → clicks app → attribution lost
2. Can't measure which channel drove conversions
3. All conversions appear as "direct"

**The Fix:**

```javascript
// GOOD - Persist UTM params in sessionStorage
function captureAndPersistUtm() {
    // Only capture if URL has params (first landing)
    const params = new URLSearchParams(window.location.search);
    if (params.has('utm_source')) {
        sessionStorage.setItem('utm_source', params.get('utm_source'));
        sessionStorage.setItem('utm_medium', params.get('utm_medium'));
        sessionStorage.setItem('utm_campaign', params.get('utm_campaign'));
    }
}

function getPersistedUtm() {
    return {
        utm_source: sessionStorage.getItem('utm_source'),
        utm_medium: sessionStorage.getItem('utm_medium'),
        utm_campaign: sessionStorage.getItem('utm_campaign')
    };
}
```

---

## WARNING: Not Tracking Outbound Links

**The Problem:**

```javascript
// BAD - User clicks external app link, no tracking
<a href="https://external-game.com">Play Now</a>
```

**Why This Breaks:**
1. Can't measure which apps are most clicked
2. Don't know if users actually leave portal
3. No data on app popularity

**The Fix:**

```javascript
// GOOD - Track before navigation
button.addEventListener('click', (e) => {
    // Don't prevent default - just log first
    this.trackAppClick(app.id, app.name);

    // For critical tracking, use sendBeacon
    if (navigator.sendBeacon) {
        const data = JSON.stringify({ app_id: app.id, event: 'app_click' });
        navigator.sendBeacon('/api/track', data);  // If you have an endpoint
    }
});
```

---

## Related Skills

For search engine visibility, see the **inspecting-search-coverage** skill.
For structured data signals, see the **adding-structured-signals** skill.
