# CSS Patterns Reference

## Contents
- Color System and Variables
- Glow Effects
- Clip-Path Borders
- Animation Patterns
- Background Effects
- Form Styling
- Anti-Patterns

---

## Color System and Variables

All colors are defined in `:root` at `style.css:6-34`.

### Foundation Colors

```css
:root {
    /* Deep Space Foundation - backgrounds */
    --cyber-black: #0a0e27;
    --cyber-void: #050814;    /* Main body background */
    --cyber-dark: #0f1729;    /* Component backgrounds */

    /* Electric Neon Palette - accents */
    --neon-cyan: #00f3ff;     /* Primary accent */
    --neon-magenta: #ff00ff;  /* Hover states */
    --neon-yellow: #fffc00;   /* Highlights, warnings */
    --neon-pink: #ff0080;     /* Errors, danger */
    --neon-blue: #00b8ff;     /* Secondary accent */
    --neon-green: #39ff14;    /* Success states */
}
```

### DO: Use semantic color application

```css
/* Primary elements */
.element { color: var(--neon-cyan); }

/* Hover/focus states */
.element:hover { color: var(--neon-magenta); }

/* Success feedback */
.success { color: var(--neon-green); }

/* Error feedback */
.error { color: var(--neon-pink); }
```

### DON'T: Hardcode hex values

```css
/* BAD - breaks theming, inconsistent */
.element { color: #00f3ff; }

/* GOOD - uses variable */
.element { color: var(--neon-cyan); }
```

---

## Glow Effects

Predefined glow composites at `style.css:21-24`.

### Glow Variable Structure

```css
:root {
    --glow-cyan: 0 0 5px var(--neon-cyan), 
                 0 0 10px var(--neon-cyan), 
                 0 0 20px var(--neon-cyan);
}
```

### DO: Layer glows for depth

```css
/* Subtle glow - single layer */
.subtle { box-shadow: 0 0 10px var(--neon-cyan); }

/* Standard glow - use preset */
.standard { box-shadow: var(--glow-cyan); }

/* Intense glow - combine with inset */
.intense {
    box-shadow:
        0 0 20px var(--neon-cyan),
        0 0 40px var(--neon-magenta),
        inset 0 0 20px rgba(0, 243, 255, 0.1);
}
```

### DON'T: Over-glow everything

```css
/* BAD - visual noise, performance hit */
.card {
    box-shadow: var(--glow-cyan), var(--glow-magenta), var(--glow-yellow);
}

/* GOOD - single glow, transition on hover */
.card {
    box-shadow: var(--glow-cyan);
    transition: box-shadow var(--normal);
}
.card:hover {
    box-shadow: var(--glow-magenta);
}
```

---

## Clip-Path Borders

Creates cyberpunk "cut corner" aesthetic.

### Standard Corner Cut

```css
/* 15px corners - cards, buttons */
.card {
    clip-path: polygon(
        0 0, calc(100% - 15px) 0, 100% 15px,
        100% 100%, 15px 100%, 0 calc(100% - 15px)
    );
}

/* 20px corners - larger containers */
.container {
    clip-path: polygon(
        0 0, calc(100% - 20px) 0, 100% 20px,
        100% 100%, 20px 100%, 0 calc(100% - 20px)
    );
}

/* 30px corners - main containers */
.admin-container {
    clip-path: polygon(
        0 0, calc(100% - 30px) 0, 100% 30px,
        100% 100%, 30px 100%, 0 calc(100% - 30px)
    );
}
```

### WARNING: Clip-path clips box-shadow

```css
/* BAD - shadow is clipped */
.card {
    clip-path: polygon(...);
    box-shadow: var(--glow-cyan);
}

/* GOOD - use border + filter for glow with clip-path */
.card {
    clip-path: polygon(...);
    border: 2px solid var(--neon-cyan);
    filter: drop-shadow(0 0 10px var(--neon-cyan));
}
```

---

## Animation Patterns

### Timing Variables

```css
:root {
    --fast: 150ms;    /* Micro-interactions */
    --normal: 300ms;  /* Standard transitions */
    --slow: 500ms;    /* Emphasis animations */
}
```

### Staggered Entry Animation

```css
@keyframes cardReveal {
    0% {
        opacity: 0;
        transform: translateY(30px) rotateX(-15deg);
        filter: blur(10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0) rotateX(0);
        filter: blur(0);
    }
}

/* Stagger with nth-child */
.button { animation: cardReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) backwards; }
.button:nth-child(1) { animation-delay: 0.1s; }
.button:nth-child(2) { animation-delay: 0.15s; }
/* Increment by 0.05s */
```

### Shimmer Effect (Holographic)

```css
.button::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(0, 243, 255, 0.1) 50%,
        transparent 70%
    );
    transform: rotate(45deg);
    animation: shimmer 3s linear infinite;
    opacity: 0;
}

@keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
}

.button:hover::before { opacity: 1; }
```

### DO: Respect reduced motion

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

---

## Background Effects

Layer order for depth (all use `pointer-events: none`):

| Layer | Class | z-index | Purpose |
|-------|-------|---------|---------|
| 1 | `.cyber-grid` | 0 | Animated grid lines |
| 2 | `.vignette` | 0 | Edge darkening |
| 3 | `.particles` | 1 | Floating dots |
| 4 | `.wrapper` | 10 | Content |
| 5 | `.scanlines` | 100 | CRT effect overlay |

### Grid Pattern

```css
.cyber-grid {
    position: fixed;
    background-image:
        linear-gradient(var(--neon-cyan) 1px, transparent 1px),
        linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.03;
    animation: gridPulse 4s ease-in-out infinite;
}
```

---

## Form Styling

Admin panel forms at `style.css:946-984`.

```css
.admin-container input,
.admin-container textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(0, 243, 255, 0.05);
    border: 2px solid var(--neon-cyan);
    color: var(--neon-cyan);
    font-family: var(--font-body);
    transition: all var(--normal);
}

.admin-container input:focus {
    outline: none;
    border-color: var(--neon-magenta);
    box-shadow: var(--glow-magenta);
    background: rgba(255, 0, 255, 0.05);
}
```

---

## Anti-Patterns

### WARNING: Using px for typography sizing

**The Problem:**
```css
/* BAD - doesn't scale with user preferences */
.title { font-size: 48px; }
```

**Why This Breaks:**
1. Ignores user's browser font size settings
2. Fails accessibility requirements
3. Inconsistent across devices

**The Fix:**
```css
/* GOOD - responsive with clamp */
.cyber-title {
    font-size: clamp(3rem, 8vw, 6rem);
}
```

### WARNING: Forgetting touch device handling

**The Problem:**
```css
/* BAD - hover states persist on touch */
.button:hover {
    transform: translateY(-10px);
}
```

**The Fix:**
```css
@media (hover: none) and (pointer: coarse) {
    .button:hover {
        transform: none;
    }
    .button:active {
        transform: scale(0.95);
    }
}
```