---
name: css
description: |
  Implements cyberpunk UI with CSS custom properties, neon glow effects, clip-path borders, keyframe animations, and responsive design.
  Use when: styling components, adding neon effects, creating animations, implementing responsive layouts, theming with custom properties, or debugging visual issues.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__emulate, mcp__chrome-devtools__evaluate_script, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# CSS Skill - Cyberpunk Portal

This codebase uses a single `style.css` file (1200+ lines) implementing a cyberpunk aesthetic with CSS custom properties for theming, multi-layered glow effects, clip-path borders, and extensive keyframe animations.

## Quick Start

### Adding Neon Glow

```css
/* Use predefined glow variables for consistency */
.element {
    border: 2px solid var(--neon-cyan);
    box-shadow: var(--glow-cyan);
}

.element:hover {
    border-color: var(--neon-magenta);
    box-shadow: var(--glow-magenta);
}
```

### Clip-Path Borders (Cyberpunk Corners)

```css
/* Standard corner cut pattern used throughout */
.card {
    clip-path: polygon(
        0 0, calc(100% - 15px) 0, 100% 15px,
        100% 100%, 15px 100%, 0 calc(100% - 15px)
    );
}
```

### Responsive Breakpoints

| Breakpoint | Target | Grid Columns |
|------------|--------|--------------|
| `> 1024px` | Desktop | `auto-fill, minmax(240px, 1fr)` |
| `768-1024px` | Tablet | `auto-fill, minmax(200px, 1fr)` |
| `480-768px` | Mobile | `repeat(2, 1fr)` |
| `< 480px` | Small mobile | `1fr` |

## Key Concepts

| Concept | Location | Example |
|---------|----------|---------|
| Color system | `:root` lines 6-34 | `var(--neon-cyan)` |
| Glow presets | `:root` lines 21-24 | `var(--glow-magenta)` |
| Timing vars | `:root` lines 30-33 | `var(--fast)`, `var(--normal)`, `var(--slow)` |
| Typography | `:root` lines 27-28 | `var(--font-display)`, `var(--font-body)` |

## Common Patterns

### Glitch Text Effect

```css
.glitch {
    position: relative;
}
.glitch::before,
.glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
}
.glitch::before {
    color: var(--neon-magenta);
    animation: glitchBefore 3s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}
```

### Staggered Card Animations

```css
.button:nth-child(1) { animation-delay: 0.1s; }
.button:nth-child(2) { animation-delay: 0.15s; }
/* Increment by 0.05s per card */
```

## See Also

- [patterns](references/patterns.md) - Color system, glow effects, animations
- [workflows](references/workflows.md) - Adding components, responsive testing

## Related Skills

- See the **vanilla-javascript** skill for DOM manipulation patterns
- See the **frontend-design** skill for UI component architecture

## Documentation Resources

> Fetch latest CSS documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "css" or "mdn css"
2. Query with `mcp__context7__query-docs` for specific properties

**Recommended Queries:**
- "css custom properties"
- "css clip-path"
- "css keyframes animation"
- "css prefers-reduced-motion"