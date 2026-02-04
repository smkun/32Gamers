# Content Copy Reference

## Contents
- Tier Naming Conventions
- Upgrade Prompt Copy Patterns
- CTA Button Text Guidelines
- Value Proposition Framing
- Copy Anti-Patterns

## Tier Naming Conventions

The cyberpunk aesthetic supports bold, evocative tier names:

| Generic Name | Cyberpunk Alternative | Usage Context |
|--------------|----------------------|---------------|
| Free | RUNNER | Entry-level access |
| Basic | NETRUNNER | Registered users |
| Premium | OPERATOR | Full access |
| Enterprise | CORPO | Team/org accounts |

### Implementation in UI

```html
<!-- index.html - Tier badge -->
<span class="tier-badge tier-operator">OPERATOR ACCESS</span>

<!-- firebase-admin.html - Tier dropdown -->
<select name="accessLevel">
  <option value="public">RUNNER (Public)</option>
  <option value="registered">NETRUNNER (Registered)</option>
  <option value="premium">OPERATOR (Premium)</option>
</select>
```

## Upgrade Prompt Copy Patterns

### DO: Lead with the unlock, not the paywall

```javascript
// Good: Focus on what they gain
const upgradePrompts = {
  locked_app: {
    headline: 'UNLOCK THIS MISSION',
    subhead: `Access ${appName} and ${premiumCount} more apps`,
    cta: 'BECOME AN OPERATOR'
  },
  feature_gate: {
    headline: 'OPERATOR FEATURE',
    subhead: 'Advanced analytics for elite runners',
    cta: 'UPGRADE ACCESS'
  }
};
```

### DON'T: Emphasize restriction

```javascript
// Bad: Negative framing creates friction
const badPrompts = {
  headline: 'PREMIUM ONLY',           // Sounds exclusive/gatekeeping
  subhead: 'You need to pay for this', // Emphasizes cost, not value
  cta: 'Pay Now'                       // Transactional, not aspirational
};
```

## CTA Button Text Guidelines

CTAs must be action-oriented and match the portal's voice:

| Context | Weak CTA | Strong CTA |
|---------|----------|------------|
| Upgrade modal | "Subscribe" | "BECOME AN OPERATOR" |
| Locked content | "Unlock" | "ACCESS THIS MISSION" |
| Pricing page | "Buy" | "JACK IN NOW" |
| Trial end | "Continue" | "GO FULL OPERATOR" |

### Implementation

```css
/* style.css - CTA hierarchy */
.cta-primary {
  background: linear-gradient(135deg, var(--neon-magenta), var(--neon-cyan));
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.cta-secondary {
  background: transparent;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
}
```

## Value Proposition Framing

### Portal-Level Value Props

```javascript
// Tier comparison for upgrade modals
const tierComparison = {
  runner: {
    name: 'RUNNER',
    price: 'Free',
    features: [
      'Access public app catalog',
      'Basic search',
      'Community updates'
    ]
  },
  operator: {
    name: 'OPERATOR',
    price: '$9/month',
    features: [
      'ALL apps unlocked',
      'Priority app access',
      'Analytics dashboard',
      'Custom collections',
      'Early access to new missions'
    ],
    highlight: true
  }
};
```

### App-Level Value Props

When gating specific apps, frame around the specific value:

```javascript
// Good: Specific to what's locked
showLockedAppModal(app) {
  return {
    headline: `UNLOCK: ${app.name.toUpperCase()}`,
    subhead: app.description,
    valueProps: [
      `Access ${app.name} instantly`,
      `Plus ${this.premiumAppCount - 1} more premium missions`,
      'Cancel anytime'
    ]
  };
}
```

## Copy Anti-Patterns

### WARNING: Generic Enterprise Copy

**The Problem:**

```html
<!-- BAD: Sounds like every other SaaS -->
<h2>Upgrade to Premium</h2>
<p>Get access to premium features and priority support.</p>
```

**Why This Breaks:**
1. Doesn't match the portal's cyberpunk voice
2. Fails to differentiate from competitors
3. Boring copy = lower conversion rates

**The Fix:**

```html
<!-- GOOD: On-brand, specific, evocative -->
<h2>JACK INTO THE FULL NETWORK</h2>
<p>Operator access unlocks the complete mission catalog. 
   No restrictions. No waiting. Full neural integration.</p>
```

### WARNING: Feature Lists Without Context

**The Problem:**

```html
<!-- BAD: List of features with no framing -->
<ul>
  <li>Unlimited apps</li>
  <li>Analytics</li>
  <li>Priority support</li>
</ul>
```

**The Fix:**

```html
<!-- GOOD: Features with benefit framing -->
<ul>
  <li><strong>Full Catalog</strong> — Every mission, unlocked day one</li>
  <li><strong>Neural Analytics</strong> — Track your runs across all apps</li>
  <li><strong>Direct Line</strong> — Operator-priority support channel</li>
</ul>
```

## Related Skills

- See the **frontend-design** skill for cyberpunk styling
- See the **crafting-page-messaging** skill for landing page copy