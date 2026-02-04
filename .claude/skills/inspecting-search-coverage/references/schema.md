# Schema Markup Reference

## Contents
- JSON-LD Basics
- Organization Schema
- WebApplication Schema
- BreadcrumbList Schema
- Validation

---

## JSON-LD Basics

### Current State: None

No structured data exists in this codebase.

### Where to Add

```html
<!-- In <head> of index.html -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "...",
    ...
}
</script>
```

---

## Organization Schema

Add to `index.html` for brand recognition in SERPs.

### DO: Complete Organization Schema

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "32Gamers Club",
    "url": "https://yoursite.com",
    "logo": "https://yoursite.com/assets/images/32gamers_logo.png",
    "description": "Gaming community portal with curated apps and tools",
    "sameAs": [
        "https://twitter.com/32gamersclub",
        "https://discord.gg/32gamers"
    ]
}
</script>
```

### DON'T: Use Relative URLs

```json
{
    "logo": "/assets/images/logo.png"
}
```

**Why this breaks:** Schema.org requires absolute URLs for all resources.

---

## WebApplication Schema

For each gaming app in the catalog.

### DO: Add WebApplication for Portal

```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "32Gamers Mission Control",
    "url": "https://yoursite.com",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
    }
}
</script>
```

### Per-App Schema (If Generating App Pages)

```javascript
// Generate for each app
function appSchema(app) {
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": app.name,
        "description": app.description,
        "url": app.url,
        "image": `https://yoursite.com/assets/images/${app.image}`,
        "applicationCategory": "GameApplication"
    };
}
```

---

## BreadcrumbList Schema

Add for better SERP display with navigation path.

### DO: Add Breadcrumbs

```html
<!-- index.html -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://yoursite.com"
        }
    ]
}
</script>

<!-- apps/discord.html (if exists) -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://yoursite.com"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Apps",
            "item": "https://yoursite.com/apps"
        },
        {
            "@type": "ListItem",
            "position": 3,
            "name": "Discord",
            "item": "https://yoursite.com/apps/discord"
        }
    ]
}
</script>
```

---

## Combined Schema Example

Full implementation for `index.html`:

```html
<head>
    <!-- ... other meta tags ... -->
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://yoursite.com/#organization",
                "name": "32Gamers Club",
                "url": "https://yoursite.com",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://yoursite.com/assets/images/32gamers_logo.png"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://yoursite.com/#website",
                "url": "https://yoursite.com",
                "name": "32Gamers Club",
                "publisher": {
                    "@id": "https://yoursite.com/#organization"
                }
            },
            {
                "@type": "WebPage",
                "@id": "https://yoursite.com/#webpage",
                "url": "https://yoursite.com",
                "name": "32Gamers Mission Control",
                "isPartOf": {
                    "@id": "https://yoursite.com/#website"
                },
                "about": {
                    "@id": "https://yoursite.com/#organization"
                }
            }
        ]
    }
    </script>
</head>
```

---

## Validation

### Test Your Schema

1. **Google Rich Results Test:** https://search.google.com/test/rich-results
2. **Schema Markup Validator:** https://validator.schema.org/
3. **JSON-LD Playground:** https://json-ld.org/playground/

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing field" | Required property absent | Add the property |
| "Invalid URL" | Relative URL used | Use absolute URL |
| "Unknown type" | Typo in @type | Check schema.org spelling |

### Iterate Until Pass

1. Add JSON-LD to page
2. Test with Rich Results Test
3. If errors, fix and re-test
4. Only deploy when validation passes

---

## Schema Checklist

Copy and track progress:
- [ ] Organization schema on index.html
- [ ] WebApplication schema for portal
- [ ] BreadcrumbList schema
- [ ] Validate with Google Rich Results Test
- [ ] Check in Google Search Console after deployment