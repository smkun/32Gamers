---
name: tuning-landing-journeys
description: |
  Improves landing page flow, hierarchy, and conversion paths in the 32Gamers portal.
  Use when: optimizing page structure, improving visual hierarchy, enhancing user flow from landing to app selection, reducing friction in the journey to admin panel, or improving load state UX.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__performance_start_trace, mcp__chrome-devtools__performance_stop_trace, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot
---

# Tuning Landing Journeys

Optimize the 32Gamers portal's landing page flow and conversion paths. The portal is a static HTML/CSS/JS app with Firebase backend—no framework abstractions.

## Quick Start

### Audit Current Page Hierarchy

```bash
# Start local server
python3 -m http.server 8000 &

# Take accessibility snapshot with browser tools
# Use mcp__playwright__browser_snapshot to capture current state
```

### Key Landing Elements

| Element | Location | Purpose |
|---------|----------|---------|
| Logo + Neon Border | `.logo-container` | Brand anchor, visual hierarchy top |
| Title + Glitch | `.cyber-title .glitch` | Primary heading, attention capture |
| Subtitle | `.subtitle` | Action prompt "SELECT YOUR MISSION" |
| App Grid | `.button-container` | Core conversion: app selection |
| Admin Icon | `.admin-icon` | Secondary path to admin |
| Loading State | `.loading-placeholder` | First-load UX before apps render |

## Primary Journey: Landing → App

```
Landing Load → Loading State → App Grid Render → App Card Hover → Click
```

### Critical Path Files

- `index.html:56-80` - Title hierarchy and loading state
- `style.css:426-602` - App card grid and hover states
- `scripts/app.js:56-92` - App rendering and click tracking

## Secondary Journey: Landing → Admin

```
Landing → Admin Icon (or Ctrl+Alt+A) → firebase-admin.html → Google OAuth → CRUD
```

### Admin Access Friction Points

```javascript
// Current: Hidden icon requires discovery
// index.html:46 - admin icon placement
<div class="admin-icon" id="adminIcon" title="Admin Access [CTRL+ALT+A]">
```

## Common Patterns

### Improving Visual Hierarchy

**When:** Apps load but users don't engage

```css
/* Strengthen subtitle call-to-action */
.subtitle {
    font-size: clamp(1rem, 2.5vw, 1.5rem);  /* Increase from 0.875rem */
    color: var(--neon-yellow);
    animation: subtitlePulse 2s ease-in-out infinite;
}
```

### Reducing Loading State Friction

**When:** Users bounce during load

```javascript
// scripts/app.js:14-25 - Current wait adds 1s delay
// Consider progressive loading or skeleton cards
```

## See Also

- [conversion-optimization](references/conversion-optimization.md)
- [content-copy](references/content-copy.md)
- [distribution](references/distribution.md)
- [measurement-testing](references/measurement-testing.md)
- [growth-engineering](references/growth-engineering.md)
- [strategy-monetization](references/strategy-monetization.md)

## Related Skills

See the **css** skill for cyberpunk styling patterns.
See the **frontend-design** skill for UI component guidelines.
See the **mapping-user-journeys** skill for flow analysis.
See the **designing-onboarding-paths** skill for first-run experience.
See the **crafting-page-messaging** skill for copy optimization.