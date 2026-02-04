# Distribution Reference

## Contents
- Shareability Patterns
- App Discovery Optimization
- Social Proof Integration
- Referral Loop Implementation
- Distribution Anti-Patterns

## Shareability Patterns

The portal can leverage app cards for viral distribution:

### Deep Link to Specific Apps

```javascript
// scripts/app.js - Add shareable URLs
generateShareUrl(app) {
  const baseUrl = window.location.origin;
  return `${baseUrl}?app=${encodeURIComponent(app.appId)}`;
}

// Handle incoming deep links
handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const appId = params.get('app');
  
  if (appId) {
    this.scrollToApp(appId);
    this.highlightApp(appId);
  }
}
```

### Share Button on App Cards

```javascript
// Add share functionality to card rendering
renderAppCard(app) {
  const card = document.createElement('div');
  card.innerHTML = `
    <div class="app-card-content">
      <img src="assets/images/${app.image}" alt="${app.name}">
      <h3>${app.name}</h3>
      <p>${app.description}</p>
    </div>
    <div class="app-card-actions">
      <button class="share-btn" data-app-id="${app.appId}">
        SHARE MISSION
      </button>
    </div>
  `;
  return card;
}
```

### Copy-to-Clipboard Share

```javascript
async shareApp(appId) {
  const app = this.apps.find(a => a.appId === appId);
  const shareUrl = this.generateShareUrl(app);
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    this.showToast('Link copied to clipboard!');
    this.trackShare(appId, 'clipboard');
  } catch (err) {
    // Fallback for older browsers
    this.showShareModal(shareUrl);
  }
}
```

## App Discovery Optimization

### Featured App Rotation

```javascript
// Rotate featured apps to distribute visibility
async loadFeaturedApps() {
  const snapshot = await getDocs(
    query(collection(this.db, 'apps'), 
          where('featured', '==', true))
  );
  
  const featured = snapshot.docs.map(doc => doc.data());
  
  // Shuffle to vary exposure
  return this.shuffleArray(featured);
}

shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

### Category-Based Discovery

```javascript
// Add category filtering to PortalManager
filterByCategory(category) {
  const filtered = this.apps.filter(app => 
    app.tags && app.tags.includes(category)
  );
  this.renderApps(filtered);
  
  this.trackDiscovery('category_filter', category);
}
```

## Social Proof Integration

### App Click Counts

```javascript
// Display popularity indicators
async incrementAndDisplayClicks(appId) {
  const appRef = doc(this.db, 'apps', appId);
  
  // Increment click count
  await updateDoc(appRef, {
    clickCount: increment(1)
  });
  
  // Update UI
  const countEl = document.querySelector(`[data-app="${appId}"] .click-count`);
  if (countEl) {
    const newCount = parseInt(countEl.textContent) + 1;
    countEl.textContent = this.formatCount(newCount);
  }
}

formatCount(num) {
  if (num >= 1000) return `${(num/1000).toFixed(1)}k`;
  return num.toString();
}
```

### Popular Apps Badge

```css
/* style.css - Popularity indicator */
.app-card.popular::after {
  content: 'TRENDING';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--neon-yellow);
  color: var(--cyber-dark);
  padding: 2px 8px;
  font-size: 0.6rem;
  font-family: 'Orbitron', sans-serif;
}
```

## Referral Loop Implementation

### Referral Link Generation

```javascript
// Generate trackable referral links
generateReferralLink(userId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${userId}`;
}

// Track referral source on page load
trackReferralSource() {
  const params = new URLSearchParams(window.location.search);
  const refId = params.get('ref');
  
  if (refId) {
    localStorage.setItem('referrer', refId);
    this.trackEvent('referral_visit', { referrer: refId });
  }
}
```

### Referral Credit on Upgrade

```javascript
// Credit referrer when referred user upgrades
async creditReferrer(newUserId) {
  const referrerId = localStorage.getItem('referrer');
  if (!referrerId) return;
  
  await addDoc(collection(this.db, 'referrals'), {
    referrerId,
    referredUserId: newUserId,
    creditedAt: serverTimestamp(),
    status: 'pending'
  });
  
  localStorage.removeItem('referrer');
}
```

## Distribution Anti-Patterns

### WARNING: Share Buttons Without Value

**The Problem:**

```html
<!-- BAD: Generic share with no context -->
<button onclick="share()">Share</button>
```

**Why This Breaks:**
1. User doesn't know what they're sharing
2. No preview of shared content
3. Missing tracking for attribution

**The Fix:**

```javascript
// GOOD: Contextual share with preview
shareApp(app) {
  const shareData = {
    title: `Check out ${app.name} on 32Gamers`,
    text: app.description,
    url: this.generateShareUrl(app)
  };
  
  if (navigator.share) {
    navigator.share(shareData);
  } else {
    this.showShareModal(shareData);
  }
  
  this.trackShare(app.appId, 'native_share');
}
```

### WARNING: Untracked Referrals

**The Problem:**

```javascript
// BAD: Referral links without attribution
const shareUrl = 'https://32gamers.com';  // No tracking
```

**The Fix:**

```javascript
// GOOD: Every share is attributed
const shareUrl = `https://32gamers.com?ref=${userId}&app=${appId}&source=share`;
```

## Related Skills

- See the **instrumenting-product-metrics** skill for tracking setup
- See the **mapping-conversion-events** skill for attribution tracking