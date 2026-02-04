# Roadmap & Experiments Reference

## Contents
- Current Feature State
- Feature Flag Patterns
- A/B Testing Approach
- Rollout Strategies
- Experiment Tracking

---

## Current Feature State

The 32Gamers portal has **no feature flag infrastructure**. All features are always-on.

**Existing conditional rendering:**
```javascript
// app.js:245-251 - Browser feature detection only
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
}
```

This is feature detection, not feature flags.

---

## Feature Flag Patterns

### Simple localStorage-Based Flags

```javascript
// scripts/feature-flags.js
const FeatureFlags = {
    flags: {
        SHOW_SEARCH_HINT: true,
        ENABLE_KEYBOARD_HELP: true,
        NEW_ADMIN_LAYOUT: false,
        ONBOARDING_V2: false
    },
    
    isEnabled(flag) {
        // Check localStorage override first
        const override = localStorage.getItem(`ff_${flag}`);
        if (override !== null) {
            return override === 'true';
        }
        return this.flags[flag] || false;
    },
    
    // For testing: enable flag in console
    enable(flag) {
        localStorage.setItem(`ff_${flag}`, 'true');
    },
    
    disable(flag) {
        localStorage.setItem(`ff_${flag}`, 'false');
    },
    
    reset(flag) {
        localStorage.removeItem(`ff_${flag}`);
    }
};

export default FeatureFlags;
```

### Usage in Code

```javascript
// scripts/app.js
import FeatureFlags from './feature-flags.js';

class PortalManager {
    init() {
        if (FeatureFlags.isEnabled('SHOW_SEARCH_HINT')) {
            this.showSearchHint();
        }
        
        if (FeatureFlags.isEnabled('ONBOARDING_V2')) {
            this.showOnboardingV2();
        } else {
            this.showOnboardingV1();
        }
    }
}
```

---

## A/B Testing Approach

### Simple Variant Assignment

```javascript
// Assign user to variant on first visit
function getVariant(experimentId, variants = ['control', 'treatment']) {
    const key = `experiment_${experimentId}`;
    let variant = localStorage.getItem(key);
    
    if (!variant) {
        // Random assignment
        variant = variants[Math.floor(Math.random() * variants.length)];
        localStorage.setItem(key, variant);
    }
    
    return variant;
}

// Usage
const searchHintVariant = getVariant('search_hint_2024', ['none', 'subtle', 'prominent']);

if (searchHintVariant === 'subtle') {
    showSubtleSearchHint();
} else if (searchHintVariant === 'prominent') {
    showProminentSearchHint();
}
// 'none' variant: do nothing
```

### Track Experiment Exposure

```javascript
// Track when user sees experiment variant
function trackExperiment(experimentId, variant) {
    Analytics.track('experiment_viewed', {
        experiment_id: experimentId,
        variant: variant
    });
}

// In implementation
const variant = getVariant('onboarding_v2');
trackExperiment('onboarding_v2', variant);

if (variant === 'treatment') {
    showOnboardingV2();
}
```

---

## Rollout Strategies

### Percentage-Based Rollout

```javascript
// Gradual rollout to percentage of users
function isInRollout(featureId, percentage) {
    const key = `rollout_${featureId}`;
    let bucket = localStorage.getItem(key);
    
    if (bucket === null) {
        // Assign random bucket 0-99
        bucket = Math.floor(Math.random() * 100);
        localStorage.setItem(key, bucket);
    }
    
    return parseInt(bucket) < percentage;
}

// Start at 10%, increase over time
if (isInRollout('new_search_ui', 10)) {
    renderNewSearchUI();
} else {
    renderLegacySearchUI();
}
```

### Staged Rollout Plan

```markdown
## Feature: New Admin Layout

### Rollout Schedule
| Date | Percentage | Action |
|------|------------|--------|
| Week 1 | 5% | Internal testing |
| Week 2 | 20% | Early adopters |
| Week 3 | 50% | General availability |
| Week 4 | 100% | Full rollout |

### Success Criteria
- [ ] No increase in error rate
- [ ] Admin task completion rate ≥ baseline
- [ ] No negative feedback in first 48 hours

### Rollback Trigger
- Error rate > 5%
- Task completion < 80% of baseline
```

---

## Experiment Tracking

### Experiment Documentation Template

```javascript
// experiments/search-hint-experiment.js
const SearchHintExperiment = {
    id: 'search_hint_2024_01',
    description: 'Test visibility of search feature hint',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    variants: {
        control: 'No hint shown',
        subtle: 'Small text hint in footer',
        prominent: 'Animated hint on first visit'
    },
    metrics: {
        primary: 'search_opened_rate',
        secondary: ['time_to_first_search', 'search_queries_per_session']
    },
    hypothesis: 'Prominent hint will increase search usage by 20%'
};
```

### Tracking Experiment Outcomes

```javascript
// Track conversion events per variant
function trackExperimentConversion(experimentId, conversionEvent) {
    const variant = localStorage.getItem(`experiment_${experimentId}`);
    if (!variant) return;
    
    Analytics.track('experiment_conversion', {
        experiment_id: experimentId,
        variant: variant,
        conversion_event: conversionEvent
    });
}

// When user completes target action
searchContainer.addEventListener('show', () => {
    trackExperimentConversion('search_hint_2024_01', 'search_opened');
});
```

---

## DON'T: Common Experiment Mistakes

### WARNING: Changing Variant Mid-Experiment

**The Problem:**
```javascript
// BAD - Reassigning users
if (newVariantBetter) {
    localStorage.setItem('experiment_search', 'treatment');
}
```

**Why This Breaks:** Contaminates results, users see inconsistent experience.

**The Fix:** Never change assignment. Start new experiment if needed.

### WARNING: Not Tracking Exposure

**The Problem:**
```javascript
// BAD - No exposure tracking
if (variant === 'treatment') {
    showNewFeature();
}
// Don't know if user actually saw it
```

**Why This Breaks:** Can't calculate accurate conversion rates.

**The Fix:** Always call `trackExperiment()` when showing variant.

### WARNING: Too Many Concurrent Experiments

**The Problem:** Running 5+ experiments simultaneously on same users.

**Why This Breaks:** Interaction effects make results uninterpretable.

**The Fix:** Limit to 2-3 non-overlapping experiments. Use mutual exclusion:

```javascript
// Exclude users from conflicting experiments
if (isInExperiment('onboarding_v2')) {
    // Don't enroll in welcome_modal experiment
    return;
}
```

---

## Feature Flag Cleanup

### Removing Old Flags

```javascript
// After 100% rollout, remove flag code
// BEFORE (with flag)
if (FeatureFlags.isEnabled('NEW_ADMIN_LAYOUT')) {
    renderNewLayout();
} else {
    renderOldLayout();
}

// AFTER (flag removed, old code deleted)
renderNewLayout();
```

### Cleanup Checklist

- [ ] Confirm feature at 100% for 2+ weeks
- [ ] No rollback needed
- [ ] Remove flag check from code
- [ ] Delete old code path
- [ ] Remove flag from FeatureFlags object
- [ ] Update documentation

---

## Implementation Checklist

- [ ] Create feature-flags.js module
- [ ] Add localStorage-based assignment
- [ ] Implement percentage rollout
- [ ] Track experiment exposure
- [ ] Document experiment hypothesis
- [ ] Plan rollout schedule
- [ ] Define success metrics
- [ ] Set up rollback triggers