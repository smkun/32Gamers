# On-Page SEO Reference

## Contents
- Meta Tags
- Heading Structure
- Semantic HTML
- Open Graph Tags
- Twitter Cards

---

## Meta Tags

### Current State: Critical Gaps

```html
<!-- index.html - MISSING meta description -->
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>32GAMERS // MISSION CONTROL</title>
    <!-- No description! -->
</head>
```

### DO: Add Complete Meta Tags

```html
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>32Gamers Club | Gaming Portal & App Hub</title>
    <meta name="description" content="Discover curated gaming apps, tools, and resources. Your cyberpunk mission control for the gaming community." />
    <meta name="keywords" content="gaming, games, portal, apps, community" />
    <meta name="author" content="32Gamers Club" />
    <link rel="canonical" href="https://yoursite.com/" />
</head>
```

### DON'T: Write Generic Descriptions

```html
<!-- BAD - Too generic, no keywords -->
<meta name="description" content="Welcome to our website." />

<!-- BAD - Too long (over 160 chars) -->
<meta name="description" content="32Gamers Club is the ultimate destination for gamers worldwide who want to discover amazing gaming applications, tools, utilities, and resources that will enhance their gaming experience across all platforms including PC, console, and mobile devices." />
```

**Why this breaks:** Generic descriptions get ignored by Google. Long descriptions get truncated in SERPs.

---

## Heading Structure

### Current State: Flat Hierarchy

```html
<!-- index.html - Only H1 present -->
<h1 class="cyber-title">
    <span class="glitch-text" data-text="MISSION">MISSION</span>
    <span class="glitch-text secondary" data-text="CONTROL">CONTROL</span>
</h1>
<!-- No H2, H3 hierarchy -->
```

### DO: Create Logical Heading Hierarchy

```html
<h1 class="cyber-title">32Gamers Mission Control</h1>

<section class="app-catalog">
    <h2>Gaming Apps</h2>
    <!-- App cards here -->
</section>

<section class="community">
    <h2>Join the Community</h2>
    <h3>Discord</h3>
    <h3>Newsletter</h3>
</section>
```

### DON'T: Skip Heading Levels

```html
<!-- BAD - Jumps from H1 to H4 -->
<h1>Mission Control</h1>
<h4>Apps</h4>
```

**Why this breaks:** Screen readers and crawlers use heading hierarchy to understand content structure.

---

## Semantic HTML

### Current State: Div Soup

```html
<!-- index.html - Heavy div usage -->
<div class="portal-container">
    <div class="cyber-header">
        <div class="logo-container">...</div>
    </div>
    <div class="app-grid" id="appGrid">...</div>
</div>
```

### DO: Use Semantic Elements

```html
<main class="portal-container">
    <header class="cyber-header">
        <nav class="logo-container">
            <a href="/" aria-label="Home">...</a>
        </nav>
    </header>
    
    <section class="app-catalog" aria-labelledby="apps-heading">
        <h2 id="apps-heading">Gaming Apps</h2>
        <article class="app-card">...</article>
    </section>
    
    <footer class="cyber-footer">
        <nav aria-label="Footer navigation">...</nav>
    </footer>
</main>
```

### DON'T: Use Divs for Navigation

```html
<!-- BAD - No semantic meaning -->
<div class="nav">
    <div class="link" onclick="...">Home</div>
</div>
```

**Why this breaks:** Crawlers can't identify navigation structure. Accessibility tools fail.

---

## Open Graph Tags

### Current State: None

No Open Graph tags exist. Social shares show broken previews.

### DO: Add Complete OG Tags

```html
<head>
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://yoursite.com/" />
    <meta property="og:title" content="32Gamers Club | Gaming Portal" />
    <meta property="og:description" content="Discover curated gaming apps and tools. Your cyberpunk mission control." />
    <meta property="og:image" content="https://yoursite.com/assets/images/og-preview.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="32Gamers Club" />
</head>
```

### DON'T: Use Relative Image URLs

```html
<!-- BAD - Relative URL won't resolve -->
<meta property="og:image" content="/assets/images/logo.png" />
```

**Why this breaks:** Social platforms need absolute URLs to fetch preview images.

---

## Twitter Cards

### DO: Add Twitter Card Tags

```html
<head>
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@32gamersclub" />
    <meta name="twitter:title" content="32Gamers Club | Gaming Portal" />
    <meta name="twitter:description" content="Discover curated gaming apps and tools." />
    <meta name="twitter:image" content="https://yoursite.com/assets/images/twitter-card.png" />
</head>
```

### Card Types

| Type | Use When |
|------|----------|
| `summary` | Default, small image |
| `summary_large_image` | Full-width image preview |
| `app` | App store listings |
| `player` | Video/audio content |

---

## Implementation Checklist

Copy and track progress:
- [ ] Meta description on index.html (max 160 chars)
- [ ] Add noindex to firebase-admin.html
- [ ] H1 → H2 → H3 hierarchy
- [ ] Replace divs with semantic elements
- [ ] Open Graph tags with absolute image URL
- [ ] Twitter Card tags
- [ ] Test with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)