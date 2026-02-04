# Roadmap & Experiments Reference

## Contents
- Feature Flag Pattern
- A/B Testing Without Backend
- Rollout Strategies
- Experiment Tracking
- Cleanup Checklist

---

## Feature Flag Pattern

Simple client-side feature flags:

```javascript
// scripts/features.js
const FeatureFlags = {
    flags: {
        WELCOME_MODAL_V2: false,
        KEYBOARD_HINTS: true,
        ADMIN_ONBOARDING: false,
        SEARCH_SUGGESTIONS: false
    },
    
    // Override from localStorage for testing
    init() {
        const overrides = JSON.parse(localStorage.getItem('32gamers_flags') || '{}');
        Object.assign(this.flags, overrides);
    },
    
    isEnabled(flag) {
        return this.flags[flag] === true;
    },
    
    // For testing: enable in console
    enable(flag) {
        const overrides = JSON.parse(localStorage.getItem('32gamers_flags') || '{}');
        overrides[flag] = true;
        localStorage.setItem('32gamers_flags', JSON.stringify(overrides));
        this.flags[flag] = true;
        console.log(`[FeatureFlags] Enabled: ${flag}`);
    },
    
    disable(flag) {
        const overrides = JSON.parse(localStorage.getItem('32gamers_flags') || '{}');
        overrides[flag] = false;
        localStorage.setItem('32gamers_flags', JSON.stringify(overrides));
        this.flags[flag] = false;
        console.log(`[FeatureFlags] Disabled: ${flag}`);
    }
};

// Initialize on load
FeatureFlags.init();
```

### Usage in Code

```javascript
// scripts/app.js
class PortalManager {
    async init() {
        await this.loadApps();
        this.renderApps();
        
        if (FeatureFlags.isEnabled('WELCOME_MODAL_V2')) {
            this.showWelcomeModalV2();
        } else if (this.isFirstVisit) {
            this.showWelcomeFlow();  // Original version
        }
        
        if (FeatureFlags.isEnabled('KEYBOARD_HINTS')) {
            this.setupKeyboardHints();
        }
    }
}
```

---

## A/B Testing Without Backend

Hash-based variant assignment:

```javascript
// scripts/experiments.js
const Experiments = {
    getVariant(experimentName, variants = ['control', 'treatment']) {
        // Deterministic assignment based on visitor ID
        const visitorId = this.getVisitorId();
        const hash = this.hashString(`${experimentName}_${visitorId}`);
        const variantIndex = Math.abs(hash) % variants.length;
        
        return {
            experiment: experimentName,
            variant: variants[variantIndex],
            visitorId
        };
    },
    
    getVisitorId() {
        let id = localStorage.getItem('32gamers_visitor_id');
        if (!id) {
            id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('32gamers_visitor_id', id);
        }
        return id;
    },
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }
};
```

### Running an Experiment

```javascript
// scripts/app.js
class PortalManager {
    showWelcomeFlow() {
        const { variant } = Experiments.getVariant('welcome_modal_test', [
            'minimal',      // Just text
            'with_video',   // Includes demo video
            'interactive'   // Step-by-step walkthrough
        ]);
        
        Analytics.track('experiment_exposure', {
            experiment: 'welcome_modal_test',
            variant
        });
        
        switch (variant) {
            case 'minimal':
                this.showMinimalWelcome();
                break;
            case 'with_video':
                this.showVideoWelcome();
                break;
            case 'interactive':
                this.showInteractiveWelcome();
                break;
        }
    }
}
```

---

## Rollout Strategies

### Percentage Rollout

```javascript
// scripts/features.js
FeatureFlags.isEnabledForPercentage = function(flag, percentage) {
    const visitorId = Experiments.getVisitorId();
    const hash = Math.abs(Experiments.hashString(`${flag}_${visitorId}`));
    const bucket = hash % 100;
    
    return bucket < percentage;
};

// Usage: Enable for 25% of users
if (FeatureFlags.isEnabledForPercentage('NEW_SEARCH_UI', 25)) {
    this.renderNewSearchUI();
}
```

### Admin-Only Preview

```javascript
// firebase-admin.html
firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        // Enable all experimental features for admin
        FeatureFlags.enable('WELCOME_MODAL_V2');
        FeatureFlags.enable('ADMIN_ONBOARDING');
        FeatureFlags.enable('SEARCH_SUGGESTIONS');
    }
});
```

---

## Experiment Tracking

```javascript
// Track conversion for experiment
const ExperimentTracker = {
    trackConversion(experimentName, conversionEvent) {
        const assignment = JSON.parse(
            localStorage.getItem(`exp_${experimentName}`) || 'null'
        );
        
        if (assignment) {
            Analytics.track('experiment_conversion', {
                experiment: experimentName,
                variant: assignment.variant,
                conversion: conversionEvent,
                time_to_convert_ms: Date.now() - assignment.assignedAt
            });
        }
    },
    
    recordAssignment(experimentName, variant) {
        localStorage.setItem(`exp_${experimentName}`, JSON.stringify({
            variant,
            assignedAt: Date.now()
        }));
    }
};

// Usage
const { variant } = Experiments.getVariant('onboarding_flow');
ExperimentTracker.recordAssignment('onboarding_flow', variant);

// Later, when user completes onboarding
ExperimentTracker.trackConversion('onboarding_flow', 'onboarding_completed');
```

---

## Cleanup Checklist

When an experiment concludes, use this checklist:

```markdown
Copy this checklist and track progress:
- [ ] Analyze experiment results in localStorage analytics
- [ ] Choose winning variant
- [ ] Remove losing variant code
- [ ] Remove feature flag checks (hardcode winner)
- [ ] Remove experiment assignment code
- [ ] Update any A/B-specific CSS
- [ ] Clear experiment-related localStorage keys
- [ ] Document decision in commit message
```

### Code Cleanup Example

```javascript
// BEFORE (during experiment)
if (FeatureFlags.isEnabled('WELCOME_MODAL_V2')) {
    this.showWelcomeModalV2();
} else {
    this.showWelcomeFlow();
}

// AFTER (experiment concluded, V2 won)
this.showWelcomeModalV2();

// Also remove:
// - showWelcomeFlow() method
// - WELCOME_MODAL_V2 flag definition
// - Any V1-specific CSS
```

### WARNING: Leaving Dead Code

**The Problem:**

```javascript
// BAD - Experiment over but code remains
if (FeatureFlags.isEnabled('OLD_EXPERIMENT_2024')) {
    // This code is never executed
    this.doOldThing();
}
```

**Why This Breaks:**
1. Increases bundle size
2. Confuses future developers
3. May have security vulnerabilities in unused paths

**The Fix:**

Schedule cleanup as part of experiment conclusion:

```javascript
// In your task tracker or commit message
// TODO: Remove OLD_EXPERIMENT_2024 code by [date]
// Winner: treatment variant
// Files to clean: app.js:45-67, style.css:200-250
```