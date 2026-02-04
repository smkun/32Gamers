---
name: adding-structured-signals
description: |
  Adds JSON-LD structured data markup for rich search results in static HTML pages.
  Use when: implementing Schema.org markup, adding WebSite/WebApplication structured data, enabling rich snippets for the app catalog, or improving search engine understanding of page content.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__serena__find_file, mcp__serena__search_for_pattern, mcp__serena__get_symbols_overview, mcp__tavily__tavily_search, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__evaluate_script
---

# Adding Structured Signals

Implements JSON-LD structured data for the 32Gamers Club portal. Since this is a static HTML + Firebase architecture without server-side rendering, all structured data must be embedded directly in HTML or generated client-side and injected into the DOM.

## Quick Start

### WebSite Schema (index.html)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club",
  "url": "https://yoursite.com",
  "description": "Cyberpunk gaming community portal",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yoursite.com?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### SoftwareApplication Schema (Dynamic)

```javascript
// In app.js - generate schema for each app card
function generateAppSchema(app) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "description": app.description,
    "url": app.url,
    "image": `assets/images/${app.image}`,
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser"
  };
}
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| JSON-LD | Preferred format for structured data | `<script type="application/ld+json">` |
| @context | Schema.org namespace | `"@context": "https://schema.org"` |
| @type | Entity type declaration | `"@type": "WebSite"` |
| ItemList | Collection of items | App catalog as ordered list |

## Common Patterns

### Static Page Schema

**When:** Adding base schema to `index.html` or `firebase-admin.html`

```html
<head>
  <!-- Other meta tags -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "32Gamers Club Portal",
    "description": "Gaming community app hub",
    "isPartOf": {
      "@type": "WebSite",
      "name": "32Gamers Club"
    }
  }
  </script>
</head>
```

### Dynamic Schema Injection

**When:** Generating schema after Firebase data loads

```javascript
// After apps load from Firestore
function injectItemListSchema(apps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": apps.map((app, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generateAppSchema(app)
    }))
  };
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
```

## Validation

Test structured data using:
1. Google Rich Results Test: `https://search.google.com/test/rich-results`
2. Schema.org Validator: `https://validator.schema.org/`
3. Browser DevTools: Search for `application/ld+json` in Elements panel

## See Also

- [technical](references/technical.md) - Implementation details
- [on-page](references/on-page.md) - Meta tags integration
- [content](references/content.md) - Content requirements
- [programmatic](references/programmatic.md) - Dynamic generation
- [schema](references/schema.md) - Schema types reference
- [competitive](references/competitive.md) - Rich result opportunities

## Related Skills

- See the **vanilla-javascript** skill for DOM manipulation patterns
- See the **firebase** skill for Firestore data fetching
- See the **crafting-page-messaging** skill for content optimization