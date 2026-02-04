# Measurement & Testing Reference

## Contents
- Offer Ladder Analytics Setup
- A/B Testing Tier Displays
- Conversion Funnel Tracking
- Upgrade Path Analysis
- Testing Anti-Patterns

## Offer Ladder Analytics Setup

Extend the existing gtag integration in `scripts/app.js`:

```javascript
// Track tier-specific events
class TierAnalytics {
  constructor() {
    this.funnelStages = [
      'view_locked_content',
      'click_upgrade_cta',
      'view_pricing',
      'select_tier',
      'begin_checkout',
      'complete_upgrade'
    ];
  }
  
  trackFunnelStage(stage, metadata = {}) {
    if (typeof gtag === 'undefined') return;
    
    const stageIndex = this.funnelStages.indexOf(stage);
    
    gtag('event', stage, {
      funnel_position: stageIndex + 1,
      funnel_total_stages: this.funnelStages.length,
      ...metadata
    });
  }
  
  trackTierView(tierId, source) {
    this.trackFunnelStage('view_pricing', {
      tier_viewed: tierId,
      source: source
    });
  }
  
  trackTierSelect(tierId, price) {
    this.trackFunnelStage('select_tier', {
      tier_selected: tierId,
      tier_price: price
    });
  }
}
```

## A/B Testing Tier Displays

### Simple Client-Side A/B Test

```javascript
// A/B test different tier presentations
class TierABTest {
  constructor() {
    this.variant = this.assignVariant();
  }
  
  assignVariant() {
    // Consistent assignment based on user ID or random
    const stored = localStorage.getItem('tier_ab_variant');
    if (stored) return stored;
    
    const variant = Math.random() < 0.5 ? 'control' : 'treatment';
    localStorage.setItem('tier_ab_variant', variant);
    
    this.trackAssignment(variant);
    return variant;
  }
  
  trackAssignment(variant) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'ab_test_assignment', {
      test_name: 'tier_display_v1',
      variant: variant
    });
  }
  
  getTierConfig() {
    if (this.variant === 'treatment') {
      return {
        showComparison: true,
        highlightSavings: true,
        defaultTier: 'annual'
      };
    }
    
    return {
      showComparison: false,
      highlightSavings: false,
      defaultTier: 'monthly'
    };
  }
}
```

### Visual Variant Implementation

```javascript
// Apply variant-specific styling
applyTierVariant(variant) {
  const pricingContainer = document.querySelector('.pricing-tiers');
  
  if (variant === 'treatment') {
    // Treatment: Horizontal comparison layout
    pricingContainer.classList.add('layout-comparison');
    this.injectSavingsBadge();
  } else {
    // Control: Standard vertical layout
    pricingContainer.classList.add('layout-standard');
  }
}

injectSavingsBadge() {
  const annualTier = document.querySelector('[data-tier="annual"]');
  const badge = document.createElement('span');
  badge.className = 'savings-badge';
  badge.textContent = 'SAVE 20%';
  annualTier.appendChild(badge);
}
```

## Conversion Funnel Tracking

### Full Upgrade Funnel

```javascript
// Track complete conversion path
class UpgradeFunnel {
  constructor(analytics) {
    this.analytics = analytics;
    this.sessionData = {
      startTime: Date.now(),
      touchpoints: []
    };
  }
  
  // Called when user sees locked content
  onViewLocked(appId, appName) {
    this.addTouchpoint('view_locked', { appId, appName });
    this.analytics.trackFunnelStage('view_locked_content', {
      app_id: appId,
      app_name: appName
    });
  }
  
  // Called when user clicks any upgrade CTA
  onClickUpgrade(source, context) {
    this.addTouchpoint('click_upgrade', { source, context });
    this.analytics.trackFunnelStage('click_upgrade_cta', {
      cta_source: source,
      cta_context: context
    });
  }
  
  // Called when upgrade completes
  onUpgradeComplete(tierId, price, method) {
    const duration = Date.now() - this.sessionData.startTime;
    
    this.analytics.trackFunnelStage('complete_upgrade', {
      tier_id: tierId,
      price: price,
      payment_method: method,
      session_duration_ms: duration,
      touchpoint_count: this.sessionData.touchpoints.length
    });
  }
  
  addTouchpoint(type, data) {
    this.sessionData.touchpoints.push({
      type,
      data,
      timestamp: Date.now()
    });
  }
}
```

### Funnel Visualization Data

```javascript
// Export funnel data for analysis
getFunnelMetrics() {
  return {
    stages: this.funnelStages,
    dropoffs: this.calculateDropoffs(),
    conversionRate: this.calculateConversionRate()
  };
}

calculateDropoffs() {
  // Would query analytics backend in production
  return {
    'view_locked_content → click_upgrade_cta': 0.35,
    'click_upgrade_cta → view_pricing': 0.72,
    'view_pricing → select_tier': 0.45,
    'select_tier → complete_upgrade': 0.68
  };
}
```

## Upgrade Path Analysis

### Track Which Content Drives Upgrades

```javascript
// Attribute upgrades to trigger content
trackUpgradeAttribution(userId, tierId) {
  const attribution = {
    firstLockedContent: localStorage.getItem('first_locked_view'),
    lastLockedContent: localStorage.getItem('last_locked_view'),
    totalLockedViews: parseInt(localStorage.getItem('locked_view_count') || 0),
    upgradeTriggeredBy: localStorage.getItem('upgrade_trigger')
  };
  
  if (typeof gtag !== 'undefined') {
    gtag('event', 'upgrade_attribution', {
      user_id: userId,
      tier_id: tierId,
      ...attribution
    });
  }
}

// Store attribution data on locked content views
onLockedContentView(appId) {
  if (!localStorage.getItem('first_locked_view')) {
    localStorage.setItem('first_locked_view', appId);
  }
  localStorage.setItem('last_locked_view', appId);
  
  const count = parseInt(localStorage.getItem('locked_view_count') || 0);
  localStorage.setItem('locked_view_count', count + 1);
}
```

## Testing Anti-Patterns

### WARNING: Testing Without Sufficient Sample Size

**The Problem:**

```javascript
// BAD: Declaring winner after 50 users
if (conversionA > conversionB) {
  deployVariantA();  // Not statistically significant!
}
```

**Why This Breaks:**
1. Results likely due to random variance
2. May deploy inferior experience
3. Wasted development effort on wrong direction

**The Fix:**

```javascript
// GOOD: Check statistical significance
function isSignificant(conversionsA, totalA, conversionsB, totalB) {
  // Minimum sample size check
  if (totalA < 100 || totalB < 100) {
    return { significant: false, reason: 'insufficient_sample' };
  }
  
  // Z-test for proportions
  const pA = conversionsA / totalA;
  const pB = conversionsB / totalB;
  const pPooled = (conversionsA + conversionsB) / (totalA + totalB);
  
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1/totalA + 1/totalB));
  const z = (pA - pB) / se;
  
  return {
    significant: Math.abs(z) > 1.96,  // 95% confidence
    zScore: z,
    pA,
    pB
  };
}
```

### WARNING: Changing Tests Mid-Flight

**The Problem:**

```javascript
// BAD: Modifying variant during test
if (lowConversion && daysSinceStart > 3) {
  modifyTreatmentVariant();  // Invalidates all data!
}
```

**Why This Breaks:**
1. Invalidates statistical analysis
2. Creates Simpson's paradox risk
3. Can't attribute results to specific change

**The Fix:**

```javascript
// GOOD: End test, start new test
if (shouldModify) {
  endCurrentTest('early_termination_low_conversion');
  startNewTest('tier_display_v2', newConfig);
}
```

## Related Skills

- See the **instrumenting-product-metrics** skill for analytics implementation
- See the **mapping-conversion-events** skill for event definitions