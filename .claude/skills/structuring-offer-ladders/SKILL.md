---
name: structuring-offer-ladders
description: |
  Frames plan tiers, value ladders, and upgrade logic for the 32Gamers portal.
  Use when: designing pricing tiers, adding premium features, creating upgrade flows,
  implementing featured app placements, or structuring freemium access control.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__serena__find_symbol, mcp__serena__get_symbols_overview, mcp__serena__replace_symbol_body, mcp__serena__insert_after_symbol
---

# Structuring Offer Ladders

The 32Gamers portal currently operates as a free community hub. This skill documents how to implement offer ladders, pricing tiers, and upgrade logic within the existing Firebase/vanilla JS architecture.

## Quick Start

### Add Tier Metadata to Firestore Schema

```javascript
// Extend the apps collection document structure
// Location: Add to firebaseRules.txt validation
{
  appId: string,
  name: string,
  tier: 'free' | 'featured' | 'premium',  // NEW: offer tier
  featured: boolean,                        // NEW: homepage placement
  sponsored: boolean,                       // NEW: paid placement
  accessLevel: 'public' | 'registered' | 'premium'  // NEW: access control
}
```

### Render Tier-Based App Cards

```javascript
// scripts/app.js - Add to renderApps() method
renderApp(app) {
  const card = document.createElement('div');
  card.className = `app-card ${app.tier || 'free'}`;
  
  if (app.featured) {
    card.classList.add('featured');
  }
  
  if (app.tier === 'premium') {
    card.innerHTML += `<span class="tier-badge">PREMIUM</span>`;
  }
  
  return card;
}
```

### Style Tier Distinctions

```css
/* style.css - Add tier visual hierarchy */
.app-card.featured {
  order: -1;  /* Pin to top of grid */
  border: 2px solid var(--neon-cyan);
  box-shadow: 0 0 20px var(--neon-cyan);
}

.app-card.premium .tier-badge {
  background: linear-gradient(135deg, var(--neon-magenta), var(--neon-cyan));
  padding: 4px 12px;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
}
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| Value Tier | Segment features by access level | `free`, `registered`, `premium` |
| Featured Placement | Homepage prominence | `featured: true` in Firestore |
| Upgrade Trigger | Prompt conversion action | Lock icon + "Upgrade to unlock" |
| Access Gate | Control feature visibility | Check `user.tier >= app.accessLevel` |

## Offer Ladder Structure

| Tier | Access | Visual Treatment | Price Point |
|------|--------|------------------|-------------|
| Free | Public apps only | Standard card | $0 |
| Registered | + Favorites, Search | Standard + badge | $0 (email capture) |
| Premium | + All apps, Analytics | Neon glow, priority | Monthly/Annual |

## Common Patterns

### Upgrade Prompt on Locked Content

**When:** User clicks premium app without access

```javascript
// scripts/app.js
handleAppClick(app, user) {
  if (app.accessLevel === 'premium' && (!user || user.tier !== 'premium')) {
    this.showUpgradeModal({
      title: 'UNLOCK PREMIUM ACCESS',
      feature: app.name,
      cta: 'Upgrade Now'
    });
    return;
  }
  window.open(app.url, '_blank');
}
```

### Track Upgrade Intent

```javascript
// Add to existing gtag tracking
trackUpgradeIntent(appId, appName, userTier) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'upgrade_intent', {
      'app_id': appId,
      'app_name': appName,
      'current_tier': userTier,
      'target_tier': 'premium'
    });
  }
}
```

## See Also

- [conversion-optimization](references/conversion-optimization.md)
- [content-copy](references/content-copy.md)
- [distribution](references/distribution.md)
- [measurement-testing](references/measurement-testing.md)
- [growth-engineering](references/growth-engineering.md)
- [strategy-monetization](references/strategy-monetization.md)

## Related Skills

- See the **firebase** skill for Firestore operations
- See the **firestore** skill for schema design and security rules
- See the **google-oauth** skill for user tier authentication
- See the **mapping-user-journeys** skill for conversion flow analysis
- See the **designing-onboarding-paths** skill for first-run upgrade prompts
- See the **instrumenting-product-metrics** skill for funnel tracking