# Roadmap & Experiments Reference

## Contents
- Current Feature Set
- Feature Flag Patterns
- A/B Testing Approaches
- Rollout Strategies
- Experiment Validation

## Current Feature Set

### Portal Features

| Feature | Status | Location |
|---------|--------|----------|
| App catalog grid | Shipped | `app.js:renderApps()` |
| Keyboard search | Shipped | `app.js:setupSearch()` |
| Admin keyboard shortcut | Shipped | `app.js:setupAdminAccess()` |
| Click tracking | Shipped | `app.js:trackAppClick()` |
| Loading animation | Shipped | `style.css:604-712` |
| Responsive layout | Shipped | `style.css:1114-1198` |
| Reduced motion support | Shipped | `style.css:1217-1226` |

### Admin Features

| Feature | Status | Location |
|---------|--------|----------|
| Google OAuth login | Shipped | `firebase-admin.html:94-122` |
| App CRUD operations | Shipped | `firebase-admin.html:171-261` |
| Status messages | Shipped | `firebase-admin.html:289-293` |
| Edit mode | Shipped | `firebase-admin.html:222-235` |

## Feature Flag Patterns

### Simple Feature Flags (No Library)

This codebase has no feature flag system. For lightweight experiments:

```javascript
// Add to firebase-config.js or separate config
const FEATURE_FLAGS = {
    showAppDescriptions: true,
    enableFavorites: false,
    newSearchUI: false
};

// Usage in app.js
if (FEATURE_FLAGS.showAppDescriptions) {
    button.innerHTML += `<p class="description">${app.description}</p>`;
}
```

### Firebase Remote Config (Recommended)

```javascript
// More sophisticated approach using Firebase Remote Config
import { getRemoteConfig, getValue } from 'firebase/remote-config';

const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

remoteConfig.defaultConfig = {
    show_app_descriptions: false,
    search_debounce_ms: 300
};

await fetchAndActivate(remoteConfig);
const showDescriptions = getValue(remoteConfig, 'show_app_descriptions').asBoolean();
```

## A/B Testing Approaches

### Manual A/B via User Segmentation

```javascript
// Simple 50/50 split based on user ID hash
function getExperimentVariant(userId, experimentName) {
    const hash = simpleHash(userId + experimentName);
    return hash % 2 === 0 ? 'control' : 'treatment';
}

// Usage
const variant = getExperimentVariant(currentUser.uid, 'new_card_layout');
if (variant === 'treatment') {
    renderNewCardLayout();
} else {
    renderApps(); // control
}

// Track variant assignment
gtag('event', 'experiment_assigned', {
    experiment: 'new_card_layout',
    variant: variant
});
```

### Tracking Experiment Results

```javascript
// Track conversion by variant
gtag('event', 'app_click', {
    app_id: appId,
    experiment: 'new_card_layout',
    variant: getExperimentVariant(userId, 'new_card_layout')
});
```

## Rollout Strategies

### Percentage Rollout

```javascript
// Gradual rollout based on percentage
const ROLLOUT_PERCENTAGE = 10; // 10% of users

function isFeatureEnabled(userId, featureName) {
    const hash = simpleHash(userId + featureName);
    return (hash % 100) < ROLLOUT_PERCENTAGE;
}
```

### Admin-First Rollout

```javascript
// Enable for admins first, then all users
function isFeatureEnabled(userId, featureName) {
    const ADMIN_UID = '9mbW4MTdXSMvGdlgUIJu5DOWMZW2';
    
    // Always enabled for admin
    if (userId === ADMIN_UID) return true;
    
    // Check rollout percentage for others
    return FEATURE_ROLLOUTS[featureName]?.enabled ?? false;
}
```

## Experiment Validation

### Pre-Launch Checklist

Copy when launching experiments:

- [ ] Control and treatment code paths tested locally
- [ ] Analytics events fire correctly for both variants
- [ ] Experiment assignment is deterministic (same user = same variant)
- [ ] Fallback to control if experiment fails
- [ ] Documented expected metrics impact
- [ ] Defined success criteria and sample size

### Validation Workflow

```
1. Implement feature behind flag
2. Deploy with flag OFF
3. Enable for admin-only testing
4. Validate tracking in GA4 DebugView
5. Enable for X% of users
6. Monitor for errors/regressions
7. Analyze results after N days
8. Ship or revert based on data
```

### Monitoring Experiment Health

```javascript
// Track experiment errors
try {
    if (FEATURE_FLAGS.newFeature) {
        runNewFeature();
    }
} catch (error) {
    gtag('event', 'experiment_error', {
        experiment: 'newFeature',
        error: error.message
    });
    // Fallback to control
    runControlFeature();
}
```

## Potential Experiments for 32Gamers

| Experiment | Hypothesis | Metric |
|------------|------------|--------|
| Show descriptions on cards | Higher click rate | app_click per session |
| Visible search button | More search usage | search_performed events |
| App categories | Better discovery | unique apps clicked |
| Favorites feature | Return visits | sessions per user |
| Hover preview | Informed clicks | time to first click |

### Example: Description Visibility Test

```javascript
// Control: current behavior (description hidden)
// Treatment: description visible on card

const variant = getExperimentVariant(userId, 'card_descriptions');

createAppButton(app, index) {
    const button = document.createElement('a');
    // ... existing code ...
    
    if (variant === 'treatment') {
        button.innerHTML += `
            <p class="card-description">${app.description}</p>
        `;
    }
    
    return button;
}
```