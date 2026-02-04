# Growth Engineering Reference

## Contents
- Upgrade Trigger Implementation
- Freemium Gate Patterns
- Viral Loop Mechanics
- Progressive Unlocking
- Growth Anti-Patterns

## Upgrade Trigger Implementation

### Trigger After Value Demonstration

```javascript
// scripts/app.js - Trigger upgrade after user engages
class UpgradeTriggers {
  constructor(portalManager) {
    this.pm = portalManager;
    this.triggers = {
      appClicks: 0,
      searchAttempts: 0,
      sessionDuration: 0
    };
    
    this.thresholds = {
      appClicks: 5,       // After clicking 5 free apps
      searchAttempts: 3,  // After 3 searches
      sessionDuration: 120000  // After 2 minutes
    };
  }
  
  onAppClick(app) {
    this.triggers.appClicks++;
    
    if (this.triggers.appClicks >= this.thresholds.appClicks) {
      this.showContextualUpgrade('high_engagement', {
        appsViewed: this.triggers.appClicks
      });
    }
  }
  
  showContextualUpgrade(trigger, context) {
    // Only show once per trigger type per session
    if (sessionStorage.getItem(`upgrade_shown_${trigger}`)) return;
    
    sessionStorage.setItem(`upgrade_shown_${trigger}`, 'true');
    
    this.pm.showUpgradeModal({
      title: this.getTriggerTitle(trigger),
      context: context
    });
  }
  
  getTriggerTitle(trigger) {
    const titles = {
      high_engagement: "YOU'RE ON A ROLL",
      search_limit: "UNLOCK FULL SEARCH",
      session_duration: "ENJOYING THE PORTAL?"
    };
    return titles[trigger] || "UPGRADE YOUR ACCESS";
  }
}
```

### Feature Usage Triggers

```javascript
// Trigger based on specific feature usage
onSearchAttempt(query) {
  this.triggers.searchAttempts++;
  
  // Show premium search features after basic search
  if (this.triggers.searchAttempts >= 2) {
    this.showSearchUpgradeBanner();
  }
}

showSearchUpgradeBanner() {
  const banner = document.createElement('div');
  banner.className = 'search-upgrade-banner';
  banner.innerHTML = `
    <p>Want advanced filters? <strong>Operators</strong> get category search, 
       saved searches, and more.</p>
    <button class="upgrade-inline">UPGRADE</button>
  `;
  
  document.querySelector('.search-container').appendChild(banner);
}
```

## Freemium Gate Patterns

### Soft Gate: Preview Then Lock

```javascript
// Show preview of premium content before requiring upgrade
renderPremiumPreview(app) {
  const card = document.createElement('div');
  card.className = 'app-card premium-preview';
  
  card.innerHTML = `
    <div class="preview-content">
      <img src="assets/images/${app.image}" alt="${app.name}">
      <h3>${app.name}</h3>
      <p>${app.description}</p>
    </div>
    <div class="preview-overlay">
      <span class="lock-icon">🔒</span>
      <button class="unlock-cta">UNLOCK ACCESS</button>
    </div>
  `;
  
  // Clicking anywhere triggers upgrade flow
  card.onclick = () => this.showUpgradeModal({
    feature: app.name,
    context: 'premium_preview_click'
  });
  
  return card;
}
```

### Hard Gate: Feature Completely Hidden

```javascript
// Use sparingly - only for truly premium features
async loadApps() {
  const snapshot = await getDocs(collection(this.db, 'apps'));
  const userTier = this.currentUser?.tier || 'free';
  
  this.apps = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(app => {
      // Hard gate: premium-only features not shown at all
      if (app.visibility === 'premium_only' && userTier !== 'premium') {
        return false;
      }
      return true;
    });
}
```

## Viral Loop Mechanics

### Share for Unlock

```javascript
// Unlock temporary premium access via sharing
async shareForAccess(appId) {
  const app = this.apps.find(a => a.appId === appId);
  const shareUrl = this.generateShareUrl(app);
  
  try {
    await navigator.share({
      title: `Check out ${app.name} on 32Gamers`,
      text: app.description,
      url: shareUrl
    });
    
    // Grant temporary access
    this.grantTemporaryAccess(appId, 24 * 60 * 60 * 1000);  // 24 hours
    this.showToast(`Unlocked ${app.name} for 24 hours!`);
    
    this.trackEvent('share_unlock', { appId });
  } catch (err) {
    // User cancelled share
  }
}

grantTemporaryAccess(appId, durationMs) {
  const expiry = Date.now() + durationMs;
  const unlocks = JSON.parse(localStorage.getItem('temp_unlocks') || '{}');
  unlocks[appId] = expiry;
  localStorage.setItem('temp_unlocks', JSON.stringify(unlocks));
}

hasTemporaryAccess(appId) {
  const unlocks = JSON.parse(localStorage.getItem('temp_unlocks') || '{}');
  return unlocks[appId] && unlocks[appId] > Date.now();
}
```

### Referral Unlocks

```javascript
// Unlock premium features via referrals
checkReferralUnlocks(userId) {
  // Count successful referrals
  const referralCount = this.getReferralCount(userId);
  
  const unlocks = {
    1: 'advanced_search',     // 1 referral unlocks search
    3: 'favorites',           // 3 referrals unlock favorites
    5: 'full_catalog_week'    // 5 referrals = 1 week full access
  };
  
  Object.entries(unlocks).forEach(([count, feature]) => {
    if (referralCount >= parseInt(count)) {
      this.unlockFeature(userId, feature);
    }
  });
}
```

## Progressive Unlocking

### Time-Based Unlock

```javascript
// Unlock features over time to retain free users
class ProgressiveUnlock {
  constructor(userId) {
    this.userId = userId;
    this.firstVisit = this.getFirstVisit();
    this.daysSinceFirst = this.getDaysSinceFirst();
  }
  
  getUnlockedFeatures() {
    const unlocks = [];
    
    if (this.daysSinceFirst >= 0) unlocks.push('basic_catalog');
    if (this.daysSinceFirst >= 3) unlocks.push('search');
    if (this.daysSinceFirst >= 7) unlocks.push('favorites');
    if (this.daysSinceFirst >= 14) unlocks.push('one_premium_app');
    
    return unlocks;
  }
  
  showUnlockNotification(feature) {
    const notifications = {
      search: "Search unlocked! Find apps faster.",
      favorites: "Favorites unlocked! Save your top apps.",
      one_premium_app: "Bonus! Pick one premium app to try free."
    };
    
    this.showToast(notifications[feature]);
  }
}
```

## Growth Anti-Patterns

### WARNING: Aggressive Gating Too Early

**The Problem:**

```javascript
// BAD: Gate on first action
if (!user.isPremium) {
  showPaywall();  // First click triggers paywall
}
```

**Why This Breaks:**
1. User hasn't experienced value
2. Creates negative first impression
3. High bounce rate, low conversion

**The Fix:**

```javascript
// GOOD: Gate after demonstrated value
const ENGAGEMENT_THRESHOLD = 3;

onAppClick(app) {
  this.clickCount++;
  
  if (app.accessLevel === 'premium') {
    if (this.clickCount < ENGAGEMENT_THRESHOLD) {
      // Early: Show preview, not hard block
      this.showPremiumPreview(app);
    } else {
      // After engagement: Full upgrade flow
      this.showUpgradeModal(app);
    }
  }
}
```

### WARNING: No Escape Path from Upgrade Prompts

**The Problem:**

```javascript
// BAD: Modal with no dismiss option
showUpgradeModal() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <h2>UPGRADE NOW</h2>
    <button>Buy Premium</button>
    <!-- No way to close! -->
  `;
}
```

**Why This Breaks:**
1. Frustrates users who can't afford/don't want to upgrade
2. Forces browser close = lost user forever
3. Damages brand perception

**The Fix:**

```javascript
// GOOD: Always provide escape
showUpgradeModal() {
  modal.innerHTML = `
    <h2>UPGRADE TO OPERATOR</h2>
    <button class="primary">Upgrade Now</button>
    <button class="secondary">Maybe Later</button>
    <a href="#" class="dismiss">Continue with free</a>
  `;
}
```

## Related Skills

- See the **designing-onboarding-paths** skill for first-run flows
- See the **mapping-user-journeys** skill for engagement analysis