---
name: frontend-design
description: |
  Designs cyberpunk-themed UI with neon colors, glitch effects, scanlines, and gradient animations.
  Use when: creating new UI components, styling pages, adding animations, or extending the 32Gamers cyberpunk aesthetic.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__emulate, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot
---

# Frontend Design Skill

This project uses vanilla CSS with a distinctive cyberpunk aesthetic: neon glows, glitch effects, scanlines, and animated gradients. All styling follows CSS custom properties defined in `style.css`. No CSS frameworks—every effect is hand-crafted.

## Quick Start

### Adding Neon Glow Effect

```css
.my-element {
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1);
}
```

### Creating a Cyberpunk Card

```css
.cyber-card {
  background: linear-gradient(135deg, var(--cyber-dark) 0%, var(--cyber-darker) 100%);
  border: 1px solid var(--neon-cyan);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.cyber-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 255, 255, 0.2);
}
```

## Key Concepts

| Concept | Variable | Example |
|---------|----------|---------|
| Primary neon | `--neon-cyan` | `#00ffff` |
| Secondary neon | `--neon-magenta` | `#ff00ff` |
| Background dark | `--cyber-dark` | `#0a0a0f` |
| Accent glow | `--glow-magenta` | Magenta box-shadow |
| Typography | Orbitron, JetBrains Mono | Headers, code |

## Common Patterns

### Glitch Text Effect

**When:** Hero text, error states, dramatic reveals

```css
.glitch-text {
  animation: glitch 2s infinite;
}

@keyframes glitch {
  0%, 90%, 100% { transform: translate(0); }
  92% { transform: translate(-2px, 2px); }
  94% { transform: translate(2px, -2px); }
}
```

### Scanline Overlay

**When:** Full-page atmosphere, retro CRT effect

```css
.scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}
```

## See Also

- [aesthetics](references/aesthetics.md) - Color system, typography, visual identity
- [components](references/components.md) - Card, button, input styling
- [layouts](references/layouts.md) - Grid, responsive breakpoints
- [motion](references/motion.md) - Animations, transitions, hover effects
- [patterns](references/patterns.md) - DO/DON'T, anti-patterns

## Related Skills

For Firebase data integration, see the **firebase** skill.
For CSS architecture details, see the **css** skill.
For vanilla JS DOM manipulation, see the **vanilla-javascript** skill.