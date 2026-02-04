# Roadmap & Experiments Metrics

## Contents
- Feature Flag Infrastructure
- A/B Testing Patterns
- Rollout Tracking
- Experiment Verification
- Anti-Patterns

## Feature Flag Infrastructure

The 32Gamers portal has no feature flag system. For a static site with Firebase backend, implement flags via Firestore or localStorage.

### Firestore-Based Feature Flags

Add a `config` collection to Firestore:

```javascript
// Firestore document: config/features
{
    "search_enabled": true,
    "admin_shortcuts_enabled": true,
    "new_card_design": false,
    "max_apps_shown": 50
}
```

Load flags at startup:

```javascript
// In PortalManager constructor
constructor() {
    this.apps = [];
    this.features = {};
    this.init();
}

async init() {
    await this.loadFeatureFlags();
    await this.loadApps();
    this.renderApps();
    this.setupEventListeners();
}

async loadFeatureFlags() {
    try {
        const configDoc = await window.firebase.getDoc(
            window.firebase.doc(window.firebase.db, 'config', 'features')
        );
        if (configDoc.exists()) {
            this.features = configDoc.data();
            gtag('event', 'features_loaded', {
                'feature_count': Object.keys(this.features).length,
                'features_active': Object.entries(this.features)
                    .filter(([k, v]) => v === true)
                    .map(([k]) => k)
                    .join(',')
            });
        }
    } catch (error) {
        console.warn('Failed to load feature flags:', error);
        this.features = {}; // Default to empty, features use fallback
    }
}

isFeatureEnabled(featureName, defaultValue = false) {
    return this.features[featureName] ?? defaultValue;
}
```

### Usage in Code

```javascript
// In setupSearch
setupSearch() {
    if (!this.isFeatureEnabled('search_enabled', true)) {
        return; // Skip search setup if disabled
    }
    // ... existing search setup
}

// Track feature usage
if (this.isFeatureEnabled('new_card_design')) {
    button.classList.add('new-design');
    gtag('event', 'feature_used', {
        'feature_name': 'new_card_design',
        'context': 'app_card_render'
    });
}
```

## A/B Testing Patterns

### Client-Side Assignment

For simple A/B tests without a testing platform:

```javascript
// Deterministic assignment based on user ID or random assignment
function getExperimentVariant(experimentName, variants = ['control', 'treatment']) {
    const storageKey = `experiment_${experimentName}`;
    let variant = localStorage.getItem(storageKey);

    if (!variant) {
        // Random assignment
        const index = Math.floor(Math.random() * variants.length);
        variant = variants[index];
        localStorage.setItem(storageKey, variant);

        gtag('event', 'experiment_assigned', {
            'experiment_name': experimentName,
            'variant': variant
        });
    }

    return variant;
}

// Usage
const cardDesignVariant = getExperimentVariant('card_design_2024', ['classic', 'compact', 'large']);

if (cardDesignVariant === 'compact') {
    button.classList.add('compact-card');
} else if (cardDesignVariant === 'large') {
    button.classList.add('large-card');
}
```

### Track Experiment Exposure

Always track when a user sees an experiment variant:

```javascript
function trackExperimentExposure(experimentName, variant, context) {
    gtag('event', 'experiment_exposure', {
        'experiment_name': experimentName,
        'variant': variant,
        'exposure_context': context
    });
}

// Call when rendering experimental UI
renderApps() {
    const variant = getExperimentVariant('card_design_2024');
    trackExperimentExposure('card_design_2024', variant, 'app_grid');

    this.apps.forEach((app, index) => {
        const button = this.createAppButton(app, index, variant);
        container.appendChild(button);
    });
}
```

### Track Experiment Conversions

```javascript
trackAppClick(appId, appName) {
    const experiments = ['card_design_2024', 'search_ux_2024'];

    experiments.forEach(exp => {
        const variant = localStorage.getItem(`experiment_${exp}`);
        if (variant) {
            gtag('event', 'experiment_conversion', {
                'experiment_name': exp,
                'variant': variant,
                'conversion_type': 'app_click',
                'app_id': appId
            });
        }
    });

    // ... existing tracking
}
```

## Rollout Tracking

### Gradual Rollout with Percentage

```javascript
function isInRollout(featureName, percentage) {
    const storageKey = `rollout_${featureName}`;
    let inRollout = localStorage.getItem(storageKey);

    if (inRollout === null) {
        inRollout = Math.random() * 100 < percentage;
        localStorage.setItem(storageKey, inRollout.toString());

        gtag('event', 'rollout_assigned', {
            'feature_name': featureName,
            'in_rollout': inRollout,
            'rollout_percentage': percentage
        });
    }

    return inRollout === 'true' || inRollout === true;
}

// Usage: 10% rollout
if (isInRollout('new_loading_animation', 10)) {
    showNewLoadingAnimation();
}
```

### Track Rollout Errors

```javascript
// Wrap new feature code in error tracking
function withRolloutErrorTracking(featureName, fn) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            gtag('event', 'rollout_error', {
                'feature_name': featureName,
                'error_message': error.message,
                'error_stack': error.stack?.substring(0, 200)
            });

            // Disable feature for this session
            sessionStorage.setItem(`rollout_disabled_${featureName}`, 'true');

            throw error; // Re-throw for normal error handling
        }
    };
}

// Usage
const newRenderApps = withRolloutErrorTracking('new_render', function() {
    // New experimental render code
});
```

## Experiment Verification

### Pre-Launch Checklist

Before launching any experiment:

```javascript
function verifyExperimentSetup(experimentName) {
    const checks = {
        assigned: localStorage.getItem(`experiment_${experimentName}`) !== null,
        exposureTracked: false, // Check GA4 for this
        conversionTracked: false // Check GA4 for this
    };

    console.table({
        experiment: experimentName,
        ...checks,
        ready: Object.values(checks).every(v => v)
    });

    return checks;
}
```

### Debug Mode for Experiments

```javascript
// Add to URL: ?experiment_debug=true
if (new URLSearchParams(window.location.search).has('experiment_debug')) {
    window.EXPERIMENT_DEBUG = true;

    // Log all experiment events
    const originalTrack = Analytics.track;
    Analytics.track = function(name, params) {
        if (name.startsWith('experiment_')) {
            console.log(`[EXPERIMENT] ${name}:`, params);
        }
        return originalTrack.call(this, name, params);
    };

    // Show experiment overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;bottom:10px;left:10px;background:#000;color:#0f0;padding:10px;font-size:12px;z-index:9999;';
    overlay.innerHTML = `
        <strong>Experiments:</strong><br>
        ${['card_design_2024', 'search_ux_2024']
            .map(e => `${e}: ${localStorage.getItem(`experiment_${e}`) || 'not assigned'}`)
            .join('<br>')}
    `;
    document.body.appendChild(overlay);
}
```

## Anti-Patterns

### WARNING: Changing Experiment Assignment

**The Problem:**

```javascript
// BAD - Re-assigning on every page load
const variant = Math.random() > 0.5 ? 'A' : 'B';
gtag('event', 'experiment_exposure', { variant });
```

**Why This Breaks:**
1. Same user sees different variants across sessions
2. Conversion attribution impossible
3. Results are meaningless noise

**The Fix:**

```javascript
// GOOD - Sticky assignment
function getExperimentVariant(name) {
    const key = `experiment_${name}`;
    let variant = localStorage.getItem(key);
    if (!variant) {
        variant = Math.random() > 0.5 ? 'A' : 'B';
        localStorage.setItem(key, variant);
    }
    return variant;
}
```

### WARNING: Not Tracking Exposure

**The Problem:**

```javascript
// BAD - Assignment without exposure tracking
const variant = getExperimentVariant('test');
if (variant === 'treatment') {
    showNewFeature();
}
// Conversion tracked later, but no exposure record
```

**Why This Breaks:**
1. Cannot calculate exposure → conversion rate
2. Users who never saw the feature counted in denominator
3. Results appear worse than reality

**The Fix:**

```javascript
// GOOD - Always track exposure
const variant = getExperimentVariant('test');
trackExperimentExposure('test', variant, 'feature_area');

if (variant === 'treatment') {
    showNewFeature();
}
```

### WARNING: Multiple Active Experiments Interacting

**The Problem:**

```javascript
// BAD - Experiments affect each other
if (getExperimentVariant('layout') === 'wide') {
    container.classList.add('wide');
}
if (getExperimentVariant('cards') === 'large') {
    cards.forEach(c => c.classList.add('large'));
    // Large cards + wide layout = broken UI
}
```

**Why This Breaks:**
1. Interaction effects confound results
2. Cannot isolate which experiment caused change
3. May create broken combinations

**The Fix:**

```javascript
// GOOD - Mutex experiments or track combinations
const layout = getExperimentVariant('layout');
const cards = getExperimentVariant('cards');

gtag('event', 'experiment_combination', {
    'layout_variant': layout,
    'cards_variant': cards,
    'combination': `${layout}_${cards}`
});

// Only run compatible combinations
if (layout === 'wide' && cards === 'large') {
    console.warn('Incompatible experiment combination, using defaults');
    // Use defaults
}
```

## Experiment Tracking Checklist

Copy this checklist when running experiments:

- [ ] Define experiment name and variants before coding
- [ ] Implement sticky assignment (localStorage)
- [ ] Track assignment event once per user
- [ ] Track exposure event every time variant is shown
- [ ] Track conversion events with experiment context
- [ ] Add debug mode via URL parameter
- [ ] Verify no interaction with other active experiments
- [ ] Set experiment end date and disable mechanism
- [ ] Document expected sample size and duration
- [ ] Create GA4 funnel for experiment → conversion
