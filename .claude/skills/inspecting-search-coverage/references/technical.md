# Technical SEO Reference

## Contents
- Robots.txt Configuration
- Sitemap.xml Generation
- Canonical URLs
- Crawlability Issues
- Core Web Vitals

---

## Robots.txt Configuration

This codebase has NO robots.txt. Create one immediately.

### DO: Create Proper robots.txt

```
# robots.txt for 32Gamers Club
User-agent: *
Allow: /
Disallow: /firebase-admin.html
Disallow: /OLD/

# Point to sitemap
Sitemap: https://yoursite.com/sitemap.xml
```

**Location:** `/robots.txt` (root directory)

### DON'T: Leave Admin Panel Crawlable

```
# BAD - No robots.txt means Google can index everything
# firebase-admin.html will appear in search results
```

**Why this breaks:** Admin panels in SERPs look unprofessional, leak internal structure, and waste crawl budget.

---

## Sitemap.xml Generation

No sitemap exists. For static sites, create manually.

### DO: Create Static Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>2025-12-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Location:** `/sitemap.xml` (root directory)

### DON'T: Include Private Pages

```xml
<!-- BAD - Don't include admin pages in sitemap -->
<url>
  <loc>https://yoursite.com/firebase-admin.html</loc>
</url>
```

---

## Canonical URLs

No canonical tags exist. Add to prevent duplicate content issues.

### DO: Add Canonical to Each Page

```html
<!-- index.html -->
<head>
  <link rel="canonical" href="https://yoursite.com/" />
</head>

<!-- firebase-admin.html -->
<head>
  <link rel="canonical" href="https://yoursite.com/firebase-admin.html" />
  <meta name="robots" content="noindex, nofollow" />
</head>
```

### DON'T: Use Relative Canonical URLs

```html
<!-- BAD - Canonical must be absolute URL -->
<link rel="canonical" href="/" />
```

**Why this breaks:** Relative URLs can resolve incorrectly across different protocols (http/https) or subdomains.

---

## Crawlability Issues

### WARNING: Client-Side Rendering

**The Problem:**

```javascript
// app.js - Apps loaded AFTER page render
async loadApps() {
    const querySnapshot = await window.firebase.getDocs(...);
    this.apps = firebaseApps; // Not in initial HTML
}
```

**Why This Breaks:**
1. Googlebot may not wait for Firebase SDK initialization
2. Content not in initial HTML response
3. Dynamic content requires JS execution
4. Crawl budget wasted on empty shell

**The Fix:**

For critical SEO, pre-render app list during build:

```html
<!-- Static fallback in index.html -->
<noscript>
  <div class="app-list-static">
    <p>JavaScript required to load apps. 
    Visit our <a href="/sitemap.xml">sitemap</a> for app list.</p>
  </div>
</noscript>
```

---

### WARNING: Broken Service Worker

**The Problem:**

```javascript
// app.js line 246-251 - References non-existent file
navigator.serviceWorker.register('/sw.js')
```

**Why This Breaks:**
1. Console error on every page load
2. May affect Core Web Vitals scoring
3. PWA features unavailable

**The Fix:**

Either create `/sw.js` or remove the registration:

```javascript
// Remove broken registration
// Or create minimal sw.js:
self.addEventListener('fetch', () => {});
```

---

## Core Web Vitals

### LCP (Largest Contentful Paint) Risks

```css
/* style.css - Heavy background effects */
.cyber-grid::before { /* Grid overlay */ }
.scanlines::after { /* Scanline effect */ }
```

**Impact:** Complex CSS animations delay LCP.

### CLS (Cumulative Layout Shift) Risks

```javascript
// Apps inserted after page load cause layout shift
this.container.innerHTML = appsHTML;
```

**Fix:** Reserve space with skeleton loaders:

```css
.app-grid {
  min-height: 400px; /* Prevent CLS */
}
```

---

## Validation Steps

1. Test robots.txt: `curl https://yoursite.com/robots.txt`
2. Test sitemap: `curl https://yoursite.com/sitemap.xml`
3. Validate sitemap: [Google Search Console](https://search.google.com/search-console)
4. Test rendering: Chrome DevTools → Lighthouse → SEO
5. Check mobile: [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)