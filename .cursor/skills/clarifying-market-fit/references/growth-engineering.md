# Growth Engineering Reference

## Contents
- Viral Loops
- Retention Hooks
- Activation Patterns
- Technical Growth Opportunities

## Current Growth Mechanisms

| Mechanism | Status | Location |
|-----------|--------|----------|
| Direct sharing | Not implemented | - |
| Deep linking to apps | Works | URL structure |
| Return visit prompts | Not implemented | - |
| Admin invite flow | Not implemented | Single admin only |

## Viral Loops

### Shareable App Links

Currently, apps link directly to their URLs. No referral tracking exists.

**Opportunity**: Add sharing capability per app.

```javascript
// Potential implementation in scripts/app.js
createShareButton(app) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.innerHTML = '🔗';
    shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.shareApp(app);
    });
    return shareBtn;
}

shareApp(app) {
    const shareUrl = `${window.location.origin}?app=${app.id}`;
    if (navigator.share) {
        navigator.share({
            title: app.name,
            text: app.description,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl);
        // Show "Link copied" toast
    }
}
```

### Deep Link Handler

Handle `?app=` parameter to highlight/scroll to specific app:

```javascript
// Add to scripts/app.js init()
handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('app');
    if (appId) {
        const appButton = document.querySelector(`[data-app-id="${appId}"]`);
        if (appButton) {
            appButton.scrollIntoView({ behavior: 'smooth' });
            appButton.classList.add('highlighted');
        }
    }
}
```

## Retention Hooks

### DO: Progressive Disclosure for Returning Users

```javascript
// Detect returning visitor
function isReturningUser() {
    const visited = localStorage.getItem('32gamers_visited');
    if (!visited) {
        localStorage.setItem('32gamers_visited', Date.now());
        return false;
    }
    return true;
}

// Show different messaging
if (isReturningUser()) {
    document.querySelector('.subtitle').textContent = '// WELCOME BACK, AGENT';
}
```

### DON'T: Implement Dark Patterns

```javascript
// BAD - manipulative retention
if (!localStorage.getItem('popup_shown')) {
    showPopup('WAIT! Before you go...');
}

// BAD - fake urgency
showBanner('3 other agents viewing this app!');
```

## Activation Patterns

### First-Time User Experience

Current: All users see same content. No onboarding.

**Opportunity**: First-visit guidance

```javascript
// Add to scripts/app.js
showFirstTimeHint() {
    if (localStorage.getItem('onboarded')) return;
    
    const hint = document.createElement('div');
    hint.className = 'first-time-hint';
    hint.innerHTML = `
        <p>Click any app to launch • Press Ctrl+F to search</p>
        <button onclick="this.parentElement.remove(); localStorage.setItem('onboarded', '1')">Got it</button>
    `;
    document.querySelector('.container').prepend(hint);
}
```

### Admin Activation

Current flow has good activation (OAuth is simple), but no post-activation guidance.

**Opportunity**: Post-login guidance

```javascript
// firebase-admin.html - After first successful login
if (!localStorage.getItem('admin_onboarded')) {
    showStatus('Welcome! Add your first app using the form above.', 'info');
    localStorage.setItem('admin_onboarded', '1');
}
```

## Technical Growth Opportunities

### PWA Installation

Service worker registered but incomplete (`scripts/app.js:246-251`).

**Complete PWA setup**:

1. Create `site.webmanifest`:
```json
{
  "name": "32Gamers Club",
  "short_name": "32Gamers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00ffff",
  "icons": [
    { "src": "assets/favicons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/favicons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

2. Link manifest:
```html
<link rel="manifest" href="site.webmanifest">
```

3. Create `sw.js` for offline support.

### Offline Capability

Cache app catalog for offline browsing:

```javascript
// sw.js
const CACHE_NAME = '32gamers-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/scripts/app.js',
    '/assets/images/32Gamers_logo.png'
];
```

## Related Skills

See the **designing-onboarding-paths** skill for onboarding flows.
See the **orchestrating-feature-adoption** skill for progressive disclosure.