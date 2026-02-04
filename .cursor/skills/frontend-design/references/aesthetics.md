# Aesthetics Reference

## Contents
- Color System
- Typography
- Visual Identity
- Neon Glow Techniques
- WARNING: Generic Aesthetics

---

## Color System

All colors are CSS custom properties in `:root`. Never use hardcoded hex values.

```css
:root {
  /* Primary Neons */
  --neon-cyan: #00ffff;
  --neon-magenta: #ff00ff;
  --neon-yellow: #ffff00;
  
  /* Backgrounds */
  --cyber-dark: #0a0a0f;
  --cyber-darker: #050508;
  --cyber-medium: #1a1a2e;
  
  /* Semantic */
  --success-green: #00ff88;
  --error-red: #ff3366;
  --warning-orange: #ff9933;
}
```

### DO: Use semantic color variables

```css
/* GOOD - semantic and maintainable */
.status-success { color: var(--success-green); }
.status-error { color: var(--error-red); }
```

### DON'T: Hardcode colors

```css
/* BAD - breaks theme consistency */
.status-success { color: #00ff00; }
```

---

## Typography

Two fonts define the cyberpunk aesthetic:

| Font | Usage | Weight |
|------|-------|--------|
| Orbitron | Headers, titles, buttons | 400, 700, 900 |
| JetBrains Mono | Body text, code, descriptions | 400 |

```css
.cyber-heading {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.cyber-body {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 400;
  line-height: 1.6;
}
```

### WARNING: Font Substitution

**NEVER** substitute Inter, Roboto, or system fonts. They destroy the cyberpunk aesthetic. If Orbitron fails to load, the fallback is `sans-serif`, not another specific font.

---

## Visual Identity

The 32Gamers aesthetic is defined by:

1. **High contrast** - Bright neons on near-black backgrounds
2. **Glow bleeding** - Elements emit light into surroundings
3. **Angular geometry** - Sharp corners, diagonal accents
4. **Digital artifacts** - Glitch effects, scanlines, noise

### Signature Gradient

```css
.cyber-gradient {
  background: linear-gradient(
    135deg,
    var(--neon-cyan) 0%,
    var(--neon-magenta) 50%,
    var(--neon-yellow) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

---

## Neon Glow Techniques

### Text Glow (Layered Shadows)

```css
.neon-text {
  color: var(--neon-cyan);
  text-shadow:
    0 0 5px var(--neon-cyan),
    0 0 10px var(--neon-cyan),
    0 0 20px var(--neon-cyan),
    0 0 40px var(--neon-cyan);
}
```

### Box Glow (Inset + Outset)

```css
.neon-box {
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.3),
    0 0 40px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.05);
}
```

---

## WARNING: Generic Aesthetics

**The Problem:**

```css
/* BAD - bland, forgettable, AI-generated look */
.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  font-family: Inter, sans-serif;
}
```

**Why This Breaks:**
1. Purple-blue gradients are overused AI aesthetics
2. Rounded corners without neon borders lose cyberpunk edge
3. Inter font is generic and conflicts with Orbitron identity

**The Fix:**

```css
/* GOOD - distinctive cyberpunk aesthetic */
.card {
  background: linear-gradient(135deg, var(--cyber-dark) 0%, var(--cyber-darker) 100%);
  border: 1px solid var(--neon-cyan);
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
}