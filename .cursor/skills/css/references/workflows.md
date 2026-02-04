# CSS Workflows Reference

## Contents
- Adding New Components
- Modifying the Color Theme
- Creating New Animations
- Responsive Testing
- Debugging Visual Issues
- Browser Testing Checklist

---

## Adding New Components

### Workflow Checklist

Copy this checklist and track progress:
- [ ] Step 1: Use existing variables from `:root`
- [ ] Step 2: Apply standard clip-path if card-like
- [ ] Step 3: Add glow on hover using presets
- [ ] Step 4: Use timing variables for transitions
- [ ] Step 5: Add responsive breakpoints
- [ ] Step 6: Test with `prefers-reduced-motion`

### Example: New Card Component

```css
/* 1. Base styles with variables */
.new-card {
    background: linear-gradient(
        135deg,
        rgba(0, 243, 255, 0.05) 0%,
        rgba(255, 0, 255, 0.05) 100%
    );
    border: 2px solid var(--neon-cyan);
    color: var(--neon-cyan);
    font-family: var(--font-body);
    padding: 2rem;
    transition: all var(--normal);
}

/* 2. Clip-path for cyberpunk corners */
.new-card {
    clip-path: polygon(
        0 0, calc(100% - 15px) 0, 100% 15px,
        100% 100%, 15px 100%, 0 calc(100% - 15px)
    );
}

/* 3. Hover with glow */
.new-card:hover {
    border-color: var(--neon-magenta);
    box-shadow: var(--glow-magenta);
    transform: translateY(-5px);
}

/* 4. Responsive */
@media (max-width: 768px) {
    .new-card {
        padding: 1.5rem;
    }
}
```

---

## Modifying the Color Theme

### Workflow

1. Edit variables in `:root` block (lines 6-34 in `style.css`)
2. Update glow presets if changing primary colors
3. Test all states: default, hover, focus, error, success

### Adding a New Color

```css
:root {
    /* Add to neon palette section */
    --neon-orange: #ff6600;
    
    /* Add glow preset */
    --glow-orange: 0 0 5px var(--neon-orange), 
                   0 0 10px var(--neon-orange), 
                   0 0 20px var(--neon-orange);
}
```

### DON'T: Change colors without updating glows

```css
/* BAD - orphaned glow reference */
:root {
    --neon-cyan: #00ff88; /* Changed */
    --glow-cyan: 0 0 5px #00f3ff; /* Still old value! */
}

/* GOOD - glow uses variable */
:root {
    --neon-cyan: #00ff88;
    --glow-cyan: 0 0 5px var(--neon-cyan), 
                 0 0 10px var(--neon-cyan);
}
```

---

## Creating New Animations

### Animation Pattern Template

```css
/* 1. Define keyframes */
@keyframes effectName {
    0% { /* start state */ }
    50% { /* middle state (optional) */ }
    100% { /* end state */ }
}

/* 2. Apply with timing variable */
.element {
    animation: effectName 2s ease-in-out infinite;
}

/* 3. Add hover trigger if needed */
.element { animation-play-state: paused; }
.element:hover { animation-play-state: running; }
```

### Existing Animations Reference

| Animation | Duration | Usage |
|-----------|----------|-------|
| `gridPulse` | 4s | Background grid opacity |
| `scanlineMove` | 8s | CRT scanline scroll |
| `glitchText` | 5s | Title glitch shift |
| `cardReveal` | 0.6s | Card entry (one-shot) |
| `shimmer` | 3s | Holographic sweep |
| `spinnerRotate` | 1.5s | Loading spinner |
| `loadingProgress` | 2s | Progress bar |

---

## Responsive Testing

### Breakpoint Testing Order

1. **Desktop first** (> 1024px) - full effects
2. **Tablet** (768-1024px) - reduced grid columns
3. **Mobile** (480-768px) - 2-column grid
4. **Small mobile** (< 480px) - single column

### Using Chrome DevTools

```bash
# Take screenshot at specific viewport
mcp__chrome-devtools__resize_page --width 768 --height 1024
mcp__chrome-devtools__take_screenshot --path "tablet-view.png"
```

### Testing Reduced Motion

```javascript
// In Chrome DevTools Console
// Simulate prefers-reduced-motion
document.documentElement.style.setProperty('--fast', '0.01ms');
document.documentElement.style.setProperty('--normal', '0.01ms');
document.documentElement.style.setProperty('--slow', '0.01ms');
```

Or use DevTools: Rendering > Emulate CSS media feature `prefers-reduced-motion`

---

## Debugging Visual Issues

### Glow Not Showing

**Check 1:** Is `clip-path` applied?
```css
/* clip-path clips box-shadow */
/* Use border + filter instead */
.element {
    border: 2px solid var(--neon-cyan);
    filter: drop-shadow(0 0 10px var(--neon-cyan));
}
```

**Check 2:** Is element stacking context correct?
```css
.element {
    position: relative; /* Creates stacking context */
    z-index: 2;
}
```

### Animation Not Running

**Check 1:** `prefers-reduced-motion` active?
```css
/* This override may be preventing animation */
@media (prefers-reduced-motion: reduce) { ... }
```

**Check 2:** Animation overwritten?
```css
/* Later rule may override */
.element { animation: none; } /* Check for this */
```

### Hover States Not Working on Mobile

**Expected behavior** - touch devices disable hover:
```css
@media (hover: none) and (pointer: coarse) {
    .button:hover {
        transform: none;
        box-shadow: none;
    }
}
```

---

## Browser Testing Checklist

Copy this checklist and track progress:
- [ ] Chrome (latest) - primary target
- [ ] Firefox (latest) - check `clip-path` support
- [ ] Safari (latest) - check `-webkit-` prefixes
- [ ] Mobile Safari - test touch interactions
- [ ] Chrome Mobile - test responsive grid

### Known Browser Differences

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| `clip-path` | Full | Full | Needs `-webkit-` for older |
| `backdrop-filter` | Full | Full | Needs `-webkit-` |
| CSS variables | Full | Full | Full |
| `gap` in grid | Full | Full | iOS 14.5+ |

### Validation Loop

1. Make CSS changes
2. Test in Chrome DevTools (resize for breakpoints)
3. If visual issues, check browser console for CSS errors
4. Test touch behavior with device toolbar
5. Only proceed when all breakpoints render correctly