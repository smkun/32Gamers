# Distribution Reference

## Contents
- Current Distribution Channels
- SEO Gaps
- Shareability
- Discoverability Improvements

## Current Distribution Channels

| Channel | Status | Location |
|---------|--------|----------|
| Direct URL | Active | `yoursite.com` |
| ifastnet hosting | Active | Production |
| Social sharing | Missing | No OG tags |
| Search engines | Limited | No meta description |

## SEO Gaps

### WARNING: Missing Meta Description

**Current state** (`index.html`):
```html
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>32GAMERS // MISSION CONTROL</title>
    <!-- No meta description -->
</head>
```

**Impact**: Search engines generate snippets from page content, which may not represent your value prop.

**Fix**:
```html
<meta name="description" content="32Gamers Club gaming portal - quick access to curated gaming applications and tools. Your central mission control for games.">
```

### WARNING: Missing Structured Data

No JSON-LD schema exists. For a portal/directory site:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club",
  "url": "https://yoursite.com",
  "description": "Gaming community portal for curated applications",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yoursite.com?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

## Shareability

### Current State

No social sharing optimization exists.

### DO: Add Open Graph Tags

```html
<!-- index.html - Add to <head> -->
<meta property="og:title" content="32GAMERS // MISSION CONTROL">
<meta property="og:description" content="Your central hub for gaming applications">
<meta property="og:image" content="https://yoursite.com/assets/images/32Gamers_logo.png">
<meta property="og:url" content="https://yoursite.com">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="32GAMERS // MISSION CONTROL">
<meta name="twitter:description" content="Your central hub for gaming applications">
<meta name="twitter:image" content="https://yoursite.com/assets/images/32Gamers_logo.png">
```

### DON'T: Use Relative Image Paths in OG Tags

```html
<!-- BAD - won't work for social crawlers -->
<meta property="og:image" content="assets/images/32Gamers_logo.png">

<!-- GOOD - absolute URL required -->
<meta property="og:image" content="https://yoursite.com/assets/images/32Gamers_logo.png">
```

## Discoverability Improvements

### Add Favicon for All Platforms

Current (`index.html:7`):
```html
<link rel="icon" type="image/png" href="assets/favicons/32gamers_favicon.png" />
```

**Add for complete coverage**:
```html
<link rel="apple-touch-icon" sizes="180x180" href="assets/favicons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicons/favicon-16x16.png">
<link rel="manifest" href="site.webmanifest">
```

### Keyboard Shortcut Discoverability

Current: Admin shortcut (`Ctrl+Alt+A`) only shown in tooltip.

```html
<!-- index.html:46 -->
<div class="admin-icon" title="Admin Access [CTRL+ALT+A]">
```

**Issue**: Tooltip not visible on mobile, shortcut not discoverable.

## Distribution Checklist

Copy when preparing for launch:
- [ ] Meta description added
- [ ] OG tags with absolute URLs
- [ ] Twitter Card tags
- [ ] Favicon set complete
- [ ] robots.txt allows indexing
- [ ] sitemap.xml created (if multiple pages)
- [ ] Domain added to Firebase authorized domains

## Related Skills

See the **adding-structured-signals** skill for schema markup.
See the **inspecting-search-coverage** skill for SEO auditing.