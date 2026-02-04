# Conversion Optimization Reference

## Contents
- Upgrade Modal Implementation
- Feature Gating Patterns
- Visual Hierarchy for Tiers
- Anti-Patterns to Avoid
- Conversion Tracking Integration

## Upgrade Modal Implementation

The portal uses vanilla JS DOM manipulation. Add upgrade modals that match the cyberpunk aesthetic:

```javascript
// scripts/app.js - Add to PortalManager class
showUpgradeModal(options) {
  const modal = document.createElement('div');
  modal.className = 'upgrade-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${options.title}</h2>
      <p>Access <strong>${options.feature}</strong> with Premium</p>
      <div class="tier-comparison">
        <div class="tier free">Free: Basic catalog</div>
        <div class="tier premium highlighted">Premium: All ${this.apps.length} apps</div>
      </div>
      <button class="cta-upgrade">${options.cta}</button>
      <button class="cta-dismiss">Maybe Later</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.querySelector('.cta-dismiss').onclick = () => modal.remove();
}
```

```css
/* style.css - Modal styling */
.upgrade-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.upgrade-modal .modal-content {
  background: var(--cyber-dark);
  border: 2px solid var(--neon-cyan);
  padding: 2rem;
  max-width: 400px;
  text-align: center;
}

.cta-upgrade {
  background: linear-gradient(135deg, var(--neon-magenta), var(--neon-cyan));
  border: none;
  padding: 1rem 2rem;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  text-transform: uppercase;
}
```

## Feature Gating Patterns

### DO: Gate at the data layer

```javascript
// Good: Check access before rendering
async loadApps() {
  const snapshot = await getDocs(collection(this.db, 'apps'));
  const userTier = this.currentUser?.tier || 'free';
  
  this.apps = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(app => this.canAccess(app, userTier));
}

canAccess(app, userTier) {
  const tierRank = { free: 0, registered: 1, premium: 2 };
  const appRequirement = tierRank[app.accessLevel] || 0;
  return tierRank[userTier] >= appRequirement;
}
```

### DON'T: Hide premium content with CSS only

```javascript
// BAD: CSS-only gating is bypassable
.premium-only { display: none; }
// User can inspect and remove this class

// GOOD: Don't render locked content at all, show upgrade prompt instead
```

## Visual Hierarchy for Tiers

Tier differentiation must be immediately visible without reading labels:

```css
/* Free tier: Standard treatment */
.app-card.free {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Featured tier: Prominent but not overwhelming */
.app-card.featured {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  order: -1;
}

/* Premium tier: Maximum visual impact */
.app-card.premium {
  border-color: var(--neon-magenta);
  box-shadow: 
    0 0 20px rgba(255, 0, 255, 0.4),
    inset 0 0 20px rgba(255, 0, 255, 0.1);
  position: relative;
}

.app-card.premium::before {
  content: 'PREMIUM';
  position: absolute;
  top: 0;
  right: 0;
  background: var(--neon-magenta);
  padding: 4px 8px;
  font-size: 0.7rem;
  font-family: 'Orbitron', sans-serif;
}
```

## Anti-Patterns to Avoid

### WARNING: Blocking Before Value Demonstration

**The Problem:**

```javascript
// BAD: Gate immediately on page load
if (!user.isPremium) {
  showPaywall();  // User sees nothing
}
```

**Why This Breaks:**
1. User hasn't seen value yet - no motivation to pay
2. Bounce rate increases dramatically
3. No opportunity to build trust or demonstrate quality

**The Fix:**

```javascript
// GOOD: Show free content, gate premium features
async loadApps() {
  const apps = await this.fetchAllApps();
  const freeApps = apps.filter(a => a.accessLevel === 'public');
  const premiumApps = apps.filter(a => a.accessLevel === 'premium');
  
  this.renderApps(freeApps);
  this.renderLockedPreviews(premiumApps);  // Show what they're missing
}
```

### WARNING: Inconsistent Upgrade CTAs

**The Problem:**

```javascript
// BAD: Different upgrade paths scattered randomly
<button onclick="upgrade()">Get Premium</button>
<a href="/pricing">See Plans</a>
<span class="upgrade-link">Unlock</span>
```

**Why This Breaks:**
1. Confuses users about what action to take
2. Fragments conversion analytics
3. Inconsistent experience damages trust

**The Fix:**

```javascript
// GOOD: Single upgrade component used everywhere
class UpgradeCTA {
  constructor(context) {
    this.context = context;
  }
  
  render() {
    return `<button class="upgrade-cta" data-context="${this.context}">
      UPGRADE TO PREMIUM
    </button>`;
  }
}
```

## Conversion Tracking Integration

Integrate with existing gtag setup in `scripts/app.js`:

```javascript
// Track full conversion funnel
trackConversionFunnel(stage, data = {}) {
  if (typeof gtag === 'undefined') return;
  
  const stages = {
    'view_locked': 'upgrade_funnel_start',
    'click_upgrade': 'upgrade_intent',
    'view_pricing': 'pricing_view',
    'select_plan': 'plan_selected',
    'complete': 'upgrade_complete'
  };
  
  gtag('event', stages[stage] || stage, {
    ...data,
    funnel_position: Object.keys(stages).indexOf(stage) + 1
  });
}
```

## Related Skills

- See the **instrumenting-product-metrics** skill for analytics setup
- See the **mapping-conversion-events** skill for funnel definition