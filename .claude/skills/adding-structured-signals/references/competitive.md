# Competitive Rich Results

## Contents
- Rich Result Opportunities
- Competitor Analysis Approach
- Missing Schema Detection
- Differentiation Strategies

## Rich Result Opportunities

For a gaming portal, these rich results are achievable:

| Rich Result Type | Schema Required | Likelihood |
|------------------|-----------------|------------|
| Sitelinks Searchbox | WebSite + SearchAction | High |
| Software App | SoftwareApplication | Medium |
| Logo | Organization | High |
| Breadcrumbs | BreadcrumbList | High |
| FAQ | FAQPage | Low (need FAQ content) |

## Sitelinks Searchbox Implementation

This is the highest-value opportunity for 32Gamers.

```html
<!-- index.html - Enables Google Sitelinks Searchbox -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club",
  "url": "https://32gamers.club",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://32gamers.club?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

**Requirements for eligibility:**
1. Site must have internal search functionality (PortalManager has this)
2. Search results page at the target URL
3. Site must be indexed by Google

## WARNING: Competitors Without Schema

### Problem: Not Using Available Schema Types

Many gaming portals skip structured data entirely, missing rich result opportunities.

**The Opportunity:**

```javascript
// Differentiate by implementing comprehensive schema
const comprehensiveSchema = [
  // 1. WebSite with search
  { "@type": "WebSite", /* ... */ },
  
  // 2. Organization for branding
  { "@type": "Organization", /* ... */ },
  
  // 3. ItemList for app catalog
  { "@type": "ItemList", /* ... */ },
  
  // 4. Individual SoftwareApplication for each app
  // (nested in ItemList)
];
```

## Competitive Analysis Workflow

Copy this checklist for analyzing competitors:
- [ ] Search competitor domain in Google
- [ ] Check if they have sitelinks searchbox
- [ ] Use Rich Results Test on their pages
- [ ] Identify schema types they're missing
- [ ] Implement those schemas on 32Gamers

### Using MCP Tools for Analysis

```bash
# Use tavily to research competitor SEO
mcp__tavily__tavily_search: "gaming portal structured data schema.org"

# Extract competitor page structure
mcp__tavily__tavily_extract: [competitor URL]
```

## Differentiation Through Schema

### App Catalog Advantage

Most gaming sites don't schema-markup their app lists:

```javascript
// Competitive advantage: Full ItemList schema
{
  "@type": "ItemList",
  "name": "32Gamers App Catalog",
  "itemListElement": apps.map((app, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "SoftwareApplication",
      "name": app.name,
      "applicationCategory": "GameApplication",
      "offers": { "@type": "Offer", "price": "0" }
    }
  }))
}
```

### Free Apps Emphasis

```javascript
// Highlight free offerings in schema
{
  "@type": "SoftwareApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

## Monitoring Rich Results

1. Google Search Console > Enhancements > view schema reports
2. Search `site:32gamers.club` and check for rich snippets
3. Rich Results Test after any schema changes

See the **inspecting-search-coverage** skill for monitoring indexed pages and rich results.