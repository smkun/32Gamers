# Programmatic SEO Reference

## Contents
- Dynamic Content Challenges
- Static Generation Options
- App Page Templates
- Build-Time Pre-rendering

---

## Dynamic Content Challenges

### Current Architecture

```
Browser → Firebase SDK → Firestore → Render Apps
         (Client-side)   (Runtime)   (After JS)
```

**SEO Problem:** Apps exist only after JavaScript execution. Search engines may not wait.

### Crawl Flow Reality

1. Googlebot fetches `index.html`
2. Receives HTML with empty `<div id="appGrid"></div>`
3. May or may not execute JavaScript
4. If JS runs, must wait for Firebase
5. Firebase requires network roundtrip
6. Content finally appears (maybe)

---

## Static Generation Options

### Option 1: Build-Time JSON Fetch

Create a build script that fetches apps and generates static HTML.

```javascript
// build-static.js (Node.js)
const admin = require('firebase-admin');
const fs = require('fs');

async function generateStaticHTML() {
    const db = admin.firestore();
    const snapshot = await db.collection('apps').get();
    
    const apps = [];
    snapshot.forEach(doc => apps.push(doc.data()));
    
    // Generate HTML with apps embedded
    const html = generateIndexHTML(apps);
    fs.writeFileSync('dist/index.html', html);
}

function generateIndexHTML(apps) {
    const appCards = apps.map(app => `
        <article class="app-card">
            <img src="assets/images/${app.image}" alt="${app.name}" />
            <h3>${app.name}</h3>
            <p>${app.description}</p>
            <a href="${app.url}">Launch</a>
        </article>
    `).join('\n');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>32Gamers Club | Gaming Portal</title>
    <meta name="description" content="..." />
</head>
<body>
    <main>
        <h1>32Gamers Mission Control</h1>
        <section id="appGrid">${appCards}</section>
    </main>
</body>
</html>`;
}
```

**Pros:** Full SEO, fast load, works without JS
**Cons:** Requires build step, content not real-time

### Option 2: Hybrid Approach

Static HTML shell with dynamic enhancement:

```html
<!-- index.html - Static base -->
<section id="appGrid">
    <!-- Pre-rendered app list (from last build) -->
    <article class="app-card" data-app-id="discord">
        <img src="assets/images/discord.png" alt="Discord" />
        <h3>Discord</h3>
        <p>Voice and text chat</p>
    </article>
    <!-- More static cards... -->
</section>

<script type="module">
    // Enhance with fresh data if JS available
    import { PortalManager } from './scripts/app.js';
    const pm = new PortalManager();
    pm.loadApps(); // Updates existing cards
</script>
```

---

## App Page Templates

For better SEO, consider individual app pages.

### DO: Generate Per-App Pages

```
/apps/discord.html
/apps/steam.html
/apps/twitch.html
```

Each page with unique:
- Title: `Discord - 32Gamers Club`
- Description: `Download Discord for voice chat...`
- JSON-LD: WebApplication schema

### Template Structure

```html
<!-- apps/[app-name].html template -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>{{app.name}} - 32Gamers Club</title>
    <meta name="description" content="{{app.description}}" />
    <link rel="canonical" href="https://yoursite.com/apps/{{app.id}}" />
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "{{app.name}}",
        "description": "{{app.description}}",
        "url": "{{app.url}}",
        "image": "https://yoursite.com/assets/images/{{app.image}}"
    }
    </script>
</head>
<body>
    <article>
        <h1>{{app.name}}</h1>
        <img src="/assets/images/{{app.image}}" alt="{{app.name}} icon" />
        <p>{{app.description}}</p>
        <a href="{{app.url}}" rel="noopener">Launch {{app.name}}</a>
    </article>
</body>
</html>
```

---

## Build-Time Pre-rendering

### Simple Build Script

```bash
#!/bin/bash
# build.sh - Generate static content

echo "Fetching apps from Firebase..."
node fetch-apps.js > apps.json

echo "Generating static pages..."
node generate-pages.js

echo "Copying assets..."
cp -r assets/ dist/

echo "Build complete!"
```

### Page Generator

```javascript
// generate-pages.js
const fs = require('fs');
const apps = require('./apps.json');

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://yoursite.com/</loc></url>
    ${apps.map(app => `
    <url><loc>https://yoursite.com/apps/${app.appId}</loc></url>
    `).join('')}
</urlset>`;

fs.writeFileSync('dist/sitemap.xml', sitemap);
```

---

## DON'T: Rely Solely on Client-Side

```javascript
// BAD - No SEO without JS execution
class PortalManager {
    async loadApps() {
        // Content invisible to crawlers that don't run JS
        const apps = await fetchFromFirebase();
        this.render(apps);
    }
}
```

**Why this breaks:** Not all crawlers execute JavaScript. Even Googlebot may timeout on slow Firebase responses.

---

## Implementation Path

1. **Quick Win:** Add noscript fallback with static app list
2. **Medium:** Create build script for static HTML generation
3. **Full:** Generate individual app pages with unique SEO

See the **firebase** skill for Firestore data fetching patterns.