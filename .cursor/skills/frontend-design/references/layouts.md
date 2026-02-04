# Layouts Reference

## Contents
- Grid System
- Responsive Breakpoints
- Container Constraints
- Spatial Composition
- WARNING: Layout Anti-Patterns

---

## Grid System

The app catalog uses CSS Grid with auto-fit for responsive card layouts.

```css
.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
```

### Three-Column Layout (Desktop)

```css
.content-grid {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 2rem;
  min-height: 100vh;
}

.sidebar-left { /* Navigation */ }
.main-content { /* App grid */ }
.sidebar-right { /* Filters/info */ }
```

---

## Responsive Breakpoints

Three breakpoints match the project's media queries:

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Desktop | >1024px | Full grid, sidebars visible |
| Tablet | 768-1024px | 2-column grid, collapsible sidebar |
| Mobile | <768px | Single column, stacked layout |

```css
/* Desktop (default) */
.apps-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Tablet */
@media (max-width: 1024px) {
  .apps-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    padding: 1.5rem;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .apps-grid {
    padding: 0.5rem;
  }
  
  .app-card {
    padding: 1rem;
  }
}
```

---

## Container Constraints

```css
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.content-narrow {
  max-width: 800px;
  margin: 0 auto;
}

.full-bleed {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}
```

---

## Spatial Composition

### Consistent Spacing Scale

```css
:root {
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 2rem;     /* 32px */
  --space-xl: 4rem;     /* 64px */
}
```

### Visual Hierarchy

```css
/* Hero section with breathing room */
.hero {
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
}

/* Content sections with consistent gaps */
.section {
  padding: var(--space-lg) 0;
}

.section + .section {
  border-top: 1px solid rgba(0, 255, 255, 0.1);
}
```

---

## WARNING: Layout Anti-Patterns

### DON'T: Inconsistent spacing

```css
/* BAD - magic numbers everywhere */
.card { margin: 17px; padding: 23px 31px; }
.header { margin-bottom: 42px; }
```

**Why This Breaks:**
1. No visual rhythm
2. Impossible to maintain
3. Looks unpolished

**The Fix:**

```css
/* GOOD - consistent scale */
.card { margin: var(--space-md); padding: var(--space-lg); }
.header { margin-bottom: var(--space-xl); }
```

### DON'T: Fixed widths on responsive layouts

```css
/* BAD - breaks on mobile */
.card { width: 350px; }
```

**The Fix:**

```css
/* GOOD - fluid with constraints */
.card { 
  width: 100%;
  max-width: 350px;
  min-width: 250px;
}
```

### DON'T: Viewport-height traps

```css
/* BAD - content overflow issues */
.section { height: 100vh; }
```

**The Fix:**

```css
/* GOOD - minimum height allows growth */
.section { min-height: 100vh; }