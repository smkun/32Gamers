# Strategy & Monetization Reference

## Contents
- Pricing Tier Design
- Value Ladder Structure
- Upgrade Logic Implementation
- Price Anchoring Techniques
- Monetization Anti-Patterns

## Pricing Tier Design

### Tier Structure for 32Gamers Portal

```javascript
// Recommended tier structure
const pricingTiers = {
  runner: {
    id: 'runner',
    name: 'RUNNER',
    tagline: 'Start your journey',
    price: 0,
    interval: null,
    features: [
      { name: 'Public app catalog', included: true },
      { name: 'Basic search', included: true },
      { name: 'Community updates', included: true },
      { name: 'Premium apps', included: false },
      { name: 'Advanced search', included: false },
      { name: 'Analytics dashboard', included: false }
    ],
    cta: 'CURRENT PLAN',
    highlighted: false
  },
  
  operator: {
    id: 'operator',
    name: 'OPERATOR',
    tagline: 'Full neural integration',
    price: 9,
    interval: 'month',
    annualPrice: 86,  // ~20% savings
    features: [
      { name: 'Public app catalog', included: true },
      { name: 'Basic search', included: true },
      { name: 'Community updates', included: true },
      { name: 'Premium apps', included: true, highlight: true },
      { name: 'Advanced search', included: true, highlight: true },
      { name: 'Analytics dashboard', included: true, highlight: true }
    ],
    cta: 'BECOME OPERATOR',
    highlighted: true
  }
};
```

### Firestore Schema for Tiers

```javascript
// firebaseRules.txt - Extend allowed fields
function validAppsDoc() {
  let allowed = [
    'appId', 'name', 'url', 'image', 'description',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy',
    'tier',           // NEW: 'free' | 'premium'
    'accessLevel',    // NEW: 'public' | 'registered' | 'premium'
    'featured',       // NEW: boolean
    'sponsored'       // NEW: boolean
  ];
  // ... rest of validation
}
```

## Value Ladder Structure

### Feature Progression

| Feature | Runner (Free) | Netrunner ($0) | Operator ($9/mo) |
|---------|---------------|----------------|------------------|
| Public catalog | ✓ | ✓ | ✓ |
| Basic search | ✓ | ✓ | ✓ |
| Full catalog | – | – | ✓ |
| Favorites | – | ✓ | ✓ |
| Advanced filters | – | – | ✓ |
| Analytics | – | – | ✓ |
| Early access | – | – | ✓ |

### Implementation in UI

```javascript
// Render tier comparison table
renderTierComparison() {
  const features = [
    { name: 'Public catalog', tiers: [true, true, true] },
    { name: 'Basic search', tiers: [true, true, true] },
    { name: 'Favorites', tiers: [false, true, true] },
    { name: 'Full catalog', tiers: [false, false, true] },
    { name: 'Advanced filters', tiers: [false, false, true] },
    { name: 'Analytics', tiers: [false, false, true] }
  ];
  
  return features.map(f => `
    <tr>
      <td>${f.name}</td>
      ${f.tiers.map(included => `
        <td>${included ? '✓' : '–'}</td>
      `).join('')}
    </tr>
  `).join('');
}
```

## Upgrade Logic Implementation

### Check User Access Level

```javascript
// scripts/app.js - Add to PortalManager
class AccessControl {
  constructor(user) {
    this.user = user;
    this.tier = user?.tier || 'free';
  }
  
  canAccess(app) {
    const tierHierarchy = {
      free: 0,
      registered: 1,
      premium: 2
    };
    
    const userLevel = tierHierarchy[this.tier];
    const requiredLevel = tierHierarchy[app.accessLevel || 'public'];
    
    return userLevel >= requiredLevel;
  }
  
  getUpgradeReason(app) {
    if (this.canAccess(app)) return null;
    
    return {
      required: app.accessLevel,
      current: this.tier,
      message: `${app.name} requires ${app.accessLevel} access`
    };
  }
}
```

### Upgrade Flow Integration

```javascript
// Handle app click with access control
async handleAppClick(app) {
  const access = new AccessControl(this.currentUser);
  
  if (access.canAccess(app)) {
    // Track and navigate
    this.trackAppClick(app.appId, app.name);
    window.open(app.url, '_blank');
    return;
  }
  
  // Show upgrade flow
  const reason = access.getUpgradeReason(app);
  this.showUpgradeModal({
    title: 'UNLOCK THIS MISSION',
    feature: app.name,
    reason: reason,
    targetTier: reason.required
  });
  
  this.trackUpgradeIntent(app.appId, this.currentUser?.tier);
}
```

## Price Anchoring Techniques

### Annual vs Monthly Display

```javascript
// Show annual as default with monthly comparison
renderPricing(tier) {
  const monthlyPrice = tier.price;
  const annualPrice = tier.annualPrice;
  const monthlyEquivalent = (annualPrice / 12).toFixed(2);
  const savings = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);
  
  return `
    <div class="pricing-display">
      <div class="price-annual highlighted">
        <span class="price">$${annualPrice}</span>
        <span class="interval">/year</span>
        <span class="equivalent">($${monthlyEquivalent}/mo)</span>
        <span class="savings-badge">SAVE ${savings}%</span>
      </div>
      <div class="price-monthly">
        <span class="price">$${monthlyPrice}</span>
        <span class="interval">/month</span>
      </div>
    </div>
  `;
}
```

### Decoy Pricing (If Adding Third Tier)

```javascript
// Middle tier makes premium look like better value
const tiersWithDecoy = {
  runner: { price: 0 },
  hacker: { price: 7, features: ['Some premium'] },  // Decoy
  operator: { price: 9, features: ['All premium'] }  // Best value
};
// $7 for "some" vs $9 for "all" makes $9 obvious choice
```

## Monetization Anti-Patterns

### WARNING: Feature Creep in Free Tier

**The Problem:**

```javascript
// BAD: Free tier has too much
const freeTier = {
  features: [
    'Full catalog',
    'Search',
    'Favorites',
    'Analytics'  // Why upgrade?
  ]
};
```

**Why This Breaks:**
1. No reason to upgrade
2. Premium tier feels like a donation
3. Unsustainable business model

**The Fix:**

```javascript
// GOOD: Free tier delivers value but leaves room
const freeTier = {
  features: [
    'Public catalog (subset)',   // Value delivered
    'Basic search',              // Useful but limited
    // Clear upgrade path exists
  ]
};
```

### WARNING: Pricing Based on Cost, Not Value

**The Problem:**

```javascript
// BAD: Pricing based on your hosting costs
const pricing = {
  premium: serverCost * 1.2  // Cost-plus pricing
};
```

**Why This Breaks:**
1. Ignores customer perceived value
2. Likely underpriced for what users would pay
3. Races to bottom as costs decrease

**The Fix:**

```javascript
// GOOD: Pricing based on value delivered
const pricing = {
  premium: calculateValueBasedPrice({
    comparableAlternatives: [15, 20, 25],  // Competitor prices
    timesSaved: 10,  // Hours per month
    hourlyValue: 20  // User's implied hourly rate
  })
};
```

### WARNING: Hidden Upgrade Requirements

**The Problem:**

```javascript
// BAD: User discovers gate after investing time
loadFullApp(app) {
  // User clicks, app starts loading...
  // 5 seconds later:
  showPaywall("Actually, this requires premium");
}
```

**Why This Breaks:**
1. Feels like bait-and-switch
2. Damages trust
3. Creates negative word-of-mouth

**The Fix:**

```javascript
// GOOD: Clear indication before any commitment
renderAppCard(app) {
  if (app.accessLevel === 'premium') {
    card.innerHTML += `<span class="tier-badge">OPERATOR ONLY</span>`;
  }
  // User knows before clicking
}
```

## Upgrade Workflow Checklist

Copy this checklist when implementing monetization:

- [ ] Define tier structure (features per tier)
- [ ] Update Firestore schema with tier fields
- [ ] Update security rules for tier validation
- [ ] Implement AccessControl class
- [ ] Add tier badges to app cards
- [ ] Create upgrade modal component
- [ ] Implement upgrade tracking events
- [ ] Add pricing page/component
- [ ] Test upgrade flow end-to-end
- [ ] Verify free tier still delivers value

## Related Skills

- See the **firestore** skill for schema updates
- See the **firebase** skill for authentication integration
- See the **instrumenting-product-metrics** skill for revenue tracking
- See the **mapping-conversion-events** skill for funnel setup