# On-Page Integration

## Contents
- Meta Tags and Structured Data Relationship
- Open Graph Coordination
- Canonical URLs in Schema
- Title and Description Alignment

## Meta Tags and Structured Data

Structured data complements but does not replace meta tags. Both are required for optimal SEO.

### Required Meta Tags (index.html)

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Cyberpunk gaming community portal - discover and launch gaming apps">
  <meta name="robots" content="index, follow">
  <title>32Gamers Club | Gaming Portal</title>
  
  <!-- Open Graph -->
  <meta property="og:title" content="32Gamers Club">
  <meta property="og:description" content="Cyberpunk gaming community portal">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://32gamers.club">
  <meta property="og:image" content="https://32gamers.club/assets/images/32gamers-logo.png">
  
  <!-- Structured Data - Aligns with meta content -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "32Gamers Club",
    "description": "Cyberpunk gaming community portal",
    "url": "https://32gamers.club"
  }
  </script>
</head>
```

## WARNING: Mismatched Content

### Problem: Schema Contradicts Meta Tags

```html
<!-- BAD - Conflicting information confuses search engines -->
<meta name="description" content="Gaming community for casual players">
<script type="application/ld+json">
{
  "description": "Professional esports tournament platform"
}
</script>
```

**Why This Breaks:**
1. Search engines may distrust conflicting signals
2. Can result in neither being used for snippets
3. Creates inconsistent brand messaging

**The Fix:**

```html
<!-- GOOD - Consistent messaging across all signals -->
<meta name="description" content="Cyberpunk gaming community portal">
<script type="application/ld+json">
{
  "description": "Cyberpunk gaming community portal"
}
</script>
```

## Canonical URL Integration

```html
<head>
  <link rel="canonical" href="https://32gamers.club">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://32gamers.club",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://32gamers.club"
    }
  }
  </script>
</head>
```

## Admin Page (firebase-admin.html)

Admin pages should not be indexed but can still have schema for internal tooling:

```html
<head>
  <meta name="robots" content="noindex, nofollow">
  <title>Admin | 32Gamers Club</title>
  
  <!-- Optional: Schema for internal documentation -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "32Gamers Admin Panel",
    "isAccessibleForFree": false
  }
  </script>
</head>
```

## Content Alignment Checklist

Copy this checklist when adding schema:
- [ ] Schema `name` matches `<title>` content
- [ ] Schema `description` matches meta description
- [ ] Schema `url` matches canonical link
- [ ] Schema `image` matches og:image
- [ ] All URLs use consistent protocol (https)