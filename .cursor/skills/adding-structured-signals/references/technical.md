# Technical Implementation

## Contents
- JSON-LD Embedding Methods
- Static vs Dynamic Schema
- WARNING: Common Anti-Patterns
- Validation and Testing
- Performance Considerations

## JSON-LD Embedding Methods

### Method 1: Inline in HTML (Static)

```html
<!-- index.html - Place in <head> before closing -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club",
  "url": "https://32gamers.club",
  "description": "Cyberpunk-themed gaming community portal"
}
</script>
```

### Method 2: JavaScript Injection (Dynamic)

```javascript
// scripts/app.js - Add to PortalManager class
class PortalManager {
  injectStructuredData(apps) {
    // Remove existing dynamic schema
    const existing = document.querySelector('script[data-dynamic-schema]');
    if (existing) existing.remove();
    
    const schema = this.buildItemListSchema(apps);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic-schema', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
  
  buildItemListSchema(apps) {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": apps.length,
      "itemListElement": apps.map((app, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": app.name,
          "description": app.description,
          "url": app.url,
          "applicationCategory": "GameApplication"
        }
      }))
    };
  }
}
```

## WARNING: Common Anti-Patterns

### Problem: Invalid JSON in Schema

```html
<!-- BAD - Trailing comma breaks JSON parsing -->
<script type="application/ld+json">
{
  "@type": "WebSite",
  "name": "32Gamers Club",
}
</script>
```

**Why This Breaks:**
1. Google ignores malformed JSON-LD entirely
2. No error in browser console - silent failure
3. Rich results never appear

**The Fix:**

```html
<!-- GOOD - Valid JSON, no trailing commas -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club"
}
</script>
```

### Problem: Missing @context

```javascript
// BAD - Missing @context makes schema unprocessable
const schema = {
  "@type": "WebSite",
  "name": "32Gamers Club"
};
```

**The Fix:**

```javascript
// GOOD - Always include @context
const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club"
};
```

## Validation Workflow

Copy this checklist and track progress:
- [ ] Add schema to HTML or generate via JS
- [ ] Open page in browser
- [ ] Run: Google Rich Results Test
- [ ] If errors, fix schema and repeat validation
- [ ] Only deploy when validation passes

### Browser Console Validation

```javascript
// Paste in DevTools console to extract and validate
const schemas = document.querySelectorAll('script[type="application/ld+json"]');
schemas.forEach((s, i) => {
  try {
    const data = JSON.parse(s.textContent);
    console.log(`Schema ${i + 1}:`, data['@type'], '✓');
  } catch (e) {
    console.error(`Schema ${i + 1}: Invalid JSON`, e.message);
  }
});
```

## Performance

JSON-LD in `<head>` does not block rendering. Keep schema under 10KB to avoid indexing delays. For the 32Gamers app catalog, generate schema after initial render to avoid blocking first paint.