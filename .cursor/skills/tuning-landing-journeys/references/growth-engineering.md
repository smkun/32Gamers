# Growth Engineering Reference

## Contents
- User Acquisition Loops
- Engagement Mechanics
- Return Visit Drivers
- Keyboard Shortcut Discovery

## User Acquisition Loops

### Current State

No built-in acquisition mechanics. Portal is a utility hub, not a viral product.

### Potential Loop: App Sharing

```javascript
// Add to scripts/app.js createAppButton
createAppButton(app, index) {
    // ... existing code ...
    
    // Share button (Web Share API)
    if (navigator.share) {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.share({
                title: app.name,
                text: app.description,
                url: window.location.origin + '/' + app.url
            });
        };
        button.appendChild(shareBtn);
    }
}
```

### Potential Loop: Bookmark Prompt

```javascript
// Detect if user returns without bookmark
const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
localStorage.setItem('visitCount', visitCount);

if (visitCount === 3) {
    // Prompt to bookmark
    showBookmarkPrompt();
}
```

## Engagement Mechanics

### Search as Engagement

```javascript
// scripts/app.js:158-196 - Search setup
setupSearch() {
    // Hidden by default, revealed by Ctrl+F
    searchContainer.style.display = 'none';
}
```

**Friction:** Search is hidden power-user feature.

**Improvement:** Show search prominently for portals with 10+ apps:

```javascript
if (this.apps.length >= 10) {
    searchContainer.style.display = 'block';
}
```

### Hover Interactions

```css
/* style.css:544-556 - Rich hover state */
.button:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 0 20px var(--neon-cyan), 0 0 40px var(--neon-magenta);
}
```

**Engagement signal:** Visual feedback rewards exploration.

### Animation as Engagement

```css
/* style.css:464-476 - Staggered card reveal */
.button:nth-child(1) { animation-delay: 0.1s; }
.button:nth-child(2) { animation-delay: 0.15s; }
/* ... through child 13 */
```

**Pattern:** Staggered reveal creates visual interest and guides eye movement.

## Return Visit Drivers

### Currently Missing

No push notifications, no email capture, no "recently visited" tracking.

### Potential: Recently Used Apps

```javascript
// Track app clicks in localStorage
trackAppClick(appId, appName) {
    const recent = JSON.parse(localStorage.getItem('recentApps') || '[]');
    recent.unshift(appId);
    localStorage.setItem('recentApps', JSON.stringify(recent.slice(0, 5)));
    
    // Existing analytics...
}

// On next visit, surface recent apps first
renderApps() {
    const recent = JSON.parse(localStorage.getItem('recentApps') || '[]');
    const sorted = this.apps.sort((a, b) => {
        const aRecent = recent.indexOf(a.id);
        const bRecent = recent.indexOf(b.id);
        if (aRecent === -1 && bRecent === -1) return 0;
        if (aRecent === -1) return 1;
        if (bRecent === -1) return -1;
        return aRecent - bRecent;
    });
    // ... render sorted
}
```

### Potential: Last Visit Indicator

```javascript
// Show "New since your last visit" badge
const lastVisit = localStorage.getItem('lastVisit');
localStorage.setItem('lastVisit', Date.now());

// In renderApps, check app.createdAt against lastVisit
if (app.createdAt > lastVisit) {
    button.classList.add('new-badge');
}
```

## Keyboard Shortcut Discovery

### Current Shortcuts

| Shortcut | Action | Discovery Method |
|----------|--------|------------------|
| Ctrl+Alt+A | Admin panel | Icon tooltip only |
| Ctrl+F | Search | Browser native, repurposed |

### Improving Discoverability

```javascript
// Show shortcuts on first visit
if (!localStorage.getItem('shortcutsShown')) {
    showShortcutsModal();
    localStorage.setItem('shortcutsShown', 'true');
}
```

```html
<!-- Shortcuts modal template -->
<div class="shortcuts-modal">
    <h3>KEYBOARD SHORTCUTS</h3>
    <ul>
        <li><kbd>Ctrl</kbd>+<kbd>F</kbd> Search apps</li>
        <li><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>A</kbd> Admin access</li>
    </ul>
</div>
```

### Keyboard Navigation

```javascript
// scripts/app.js:117-125 - Arrow key navigation exists
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused && focused.classList.contains('button')) {
            focused.click();
        }
    }
});
```

**Missing:** Arrow key navigation between cards.

```javascript
// Add arrow key navigation
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const buttons = document.querySelectorAll('.button');
        const current = document.activeElement;
        const index = Array.from(buttons).indexOf(current);
        // Navigate to adjacent card based on grid layout
    }
});
```

See the **designing-onboarding-paths** skill for first-run experience patterns.