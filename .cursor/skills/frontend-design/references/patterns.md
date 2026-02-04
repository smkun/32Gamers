# Patterns Reference

## Contents
- Design Checklist
- DO/DON'T Pairs
- Anti-Pattern Gallery
- Visual Differentiation
- When to Break Rules

---

## Design Checklist

Copy this checklist when creating new UI:

- [ ] Uses CSS custom properties (no hardcoded colors)
- [ ] Orbitron for headers, JetBrains Mono for body
- [ ] Neon border or glow on interactive elements
- [ ] Hover state with transform and box-shadow
- [ ] Responsive at 1024px, 768px, 480px breakpoints
- [ ] `prefers-reduced-motion` respected
- [ ] Dark background (never white/light)

---

## DO/DON'T Pairs

### Color Usage

```css
/* DO - use semantic variables */
.success { color: var(--success-green); }
.error { color: var(--error-red); }

/* DON'T - hardcode colors */
.success { color: #00ff00; }
.error { color: red; }
```

### Typography

```css
/* DO - match project fonts */
h1 { font-family: 'Orbitron', sans-serif; }
p { font-family: 'JetBrains Mono', monospace; }

/* DON'T - introduce foreign fonts */
h1 { font-family: 'Inter', sans-serif; }
p { font-family: 'Roboto', sans-serif; }
```

### Borders

```css
/* DO - subtle neon borders */
.card { border: 1px solid rgba(0, 255, 255, 0.3); }

/* DON'T - heavy solid borders */
.card { border: 3px solid #00ffff; }
```

### Backgrounds

```css
/* DO - gradient dark backgrounds */
.panel {
  background: linear-gradient(135deg, var(--cyber-dark), var(--cyber-darker));
}

/* DON'T - flat or light backgrounds */
.panel { background: #1a1a1a; }
.panel { background: white; }
```

---

## Anti-Pattern Gallery

### WARNING: Purple-Blue Gradient Syndrome

**The Problem:**

```css
/* Every AI-generated UI looks like this */
.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

**Why This Breaks:**
1. Overused—users recognize it as "AI-generated"
2. Clashes with cyan/magenta neon palette
3. Too soft for cyberpunk aesthetic

**The Fix:**

```css
.card {
  background: linear-gradient(135deg, var(--cyber-dark) 0%, var(--cyber-darker) 100%);
  border: 1px solid var(--neon-cyan);
}
```

### WARNING: Over-Rounded Corners

**The Problem:**

```css
.card { border-radius: 24px; }
.button { border-radius: 9999px; }
```

**Why This Breaks:**
1. Feels soft and friendly—wrong for cyberpunk
2. Loses angular, technological aesthetic
3. Looks like mobile app UI, not gaming portal

**The Fix:**

```css
.card { border-radius: 4px; }
.button { border-radius: 2px; }
```

### WARNING: Missing Glow Effects

**The Problem:**

```css
.button:hover {
  background: var(--neon-cyan);
}
```

**Why This Breaks:**
1. Flat color change feels dead
2. Misses opportunity for "powered on" feeling
3. No neon atmosphere

**The Fix:**

```css
.button:hover {
  background: var(--neon-cyan);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}
```

---

## Visual Differentiation

What makes 32Gamers distinctive:

| Generic UI | 32Gamers Cyberpunk |
|------------|-------------------|
| White/light backgrounds | Near-black with subtle gradients |
| Soft shadows | Neon glows |
| Rounded corners (16px+) | Sharp corners (4-8px) |
| Inter/Roboto fonts | Orbitron + JetBrains Mono |
| Subtle hover | Dramatic lift + glow |
| Pastel accents | High-contrast neons |

---

## When to Break Rules

### Acceptable Exceptions

1. **Admin panel forms** - Can use slightly larger border-radius for usability
2. **Error states** - Red can be solid, not glowing, for clarity
3. **Dense data tables** - Reduce glow effects for readability
4. **Mobile touch targets** - Increase padding beyond desktop guidelines

### Never Break

1. **Font choices** - Always Orbitron/JetBrains Mono
2. **Color palette** - Always use CSS variables
3. **Dark background** - Never white or light gray
4. **Hover feedback** - Always provide visual response