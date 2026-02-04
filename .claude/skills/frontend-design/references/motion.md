# Motion Reference

## Contents
- Animation Philosophy
- Hover Effects
- Page Transitions
- Glitch Effects
- Loading Animations
- Accessibility

---

## Animation Philosophy

Motion in 32Gamers serves three purposes:

1. **Feedback** - Confirm user actions (button presses, hovers)
2. **Atmosphere** - Reinforce cyberpunk aesthetic (glitches, scanlines)
3. **Guidance** - Direct attention (loading states, reveals)

All animations use CSS. No animation library—keep it lightweight.

---

## Hover Effects

### Card Lift

```css
.app-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
}

.app-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 255, 255, 0.25);
}
```

### Border Glow Pulse

```css
.cyber-button {
  transition: all 0.3s ease;
}

.cyber-button:hover {
  animation: borderPulse 1s ease-in-out infinite;
}

@keyframes borderPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6); }
}
```

---

## Page Transitions

### Fade-In on Load

```css
.page-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Staggered Card Entrance

```javascript
// In app.js - add delay to each card
cards.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
});
```

```css
.app-card {
  animation: cardEnter 0.4s ease-out both;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
}
```

---

## Glitch Effects

### Text Glitch

```css
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
}

.glitch-text::before {
  color: var(--neon-cyan);
  animation: glitchCyan 3s infinite;
  clip-path: inset(0 0 50% 0);
}

.glitch-text::after {
  color: var(--neon-magenta);
  animation: glitchMagenta 3s infinite;
  clip-path: inset(50% 0 0 0);
}

@keyframes glitchCyan {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-2px, 1px); }
  94% { transform: translate(2px, -1px); }
}

@keyframes glitchMagenta {
  0%, 90%, 100% { transform: translate(0); }
  91% { transform: translate(2px, 1px); }
  93% { transform: translate(-2px, -1px); }
}
```

### Scanline Animation

```css
.scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.05) 2px,
    rgba(0, 0, 0, 0.05) 4px
  );
  pointer-events: none;
  animation: scanlineMove 10s linear infinite;
}

@keyframes scanlineMove {
  from { transform: translateY(0); }
  to { transform: translateY(4px); }
}
```

---

## Loading Animations

### Spinner

```css
.cyber-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--cyber-medium);
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Skeleton Shimmer

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--cyber-darker) 0%,
    var(--cyber-medium) 50%,
    var(--cyber-darker) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
```

---

## Accessibility

### Respect User Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### DON'T: Constant motion

```css
/* BAD - causes motion sickness */
.element {
  animation: pulse 0.5s infinite;
}
```

**The Fix:**

```css
/* GOOD - subtle, pausable */
.element {
  animation: pulse 3s ease-in-out infinite;
}

.element:hover {
  animation-play-state: paused;
}