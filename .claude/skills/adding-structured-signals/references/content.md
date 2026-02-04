# Content Requirements

## Contents
- Required vs Optional Properties
- Content Length Guidelines
- Image Requirements
- Freshness Signals

## Required Properties by Schema Type

### WebSite (Minimum)

```javascript
// Minimum viable WebSite schema
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club",       // Required
  "url": "https://32gamers.club" // Required
}
```

### SoftwareApplication (For App Cards)

```javascript
// Map Firestore app document to schema
function mapAppToSchema(app) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,                    // Required - from Firestore
    "description": app.description,       // Required - from Firestore
    "url": app.url,                       // Required - from Firestore
    "image": `assets/images/${app.image}`, // Recommended
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}
```

## Content Length Guidelines

| Property | Min | Max | Notes |
|----------|-----|-----|-------|
| name | 10 chars | 100 chars | Matches Firestore limit |
| description | 50 chars | 500 chars | Matches Firestore limit |
| url | - | 200 chars | Matches Firestore limit |

## WARNING: Empty or Placeholder Content

### Problem: Generic Placeholder Values

```javascript
// BAD - Placeholder content provides no value
{
  "name": "App Name Here",
  "description": "Description goes here",
  "url": "#"
}
```

**Why This Breaks:**
1. Google may penalize pages with placeholder content
2. No meaningful information for rich results
3. Poor user experience if shown in search

**The Fix:**

```javascript
// GOOD - Real content from Firestore validation
// firebaseRules.txt already enforces non-empty strings
{
  "name": app.name,  // Validated: size() > 0
  "description": app.description, // Validated: size() > 0
  "url": app.url // Validated: size() > 0
}
```

## Image Requirements

For SoftwareApplication rich results:

```javascript
// Validate image before including in schema
function getImageUrl(app) {
  const baseUrl = 'https://32gamers.club/assets/images/';
  const imagePath = app.image;
  
  // Schema.org recommends absolute URLs
  return imagePath.startsWith('http') 
    ? imagePath 
    : baseUrl + imagePath;
}
```

**Image specifications:**
- Minimum: 112x112 pixels
- Recommended: 1200x630 pixels for social sharing
- Format: PNG, JPG, or WebP
- Max file size: 5MB

## Freshness Signals

```javascript
// Include timestamps from Firestore
{
  "@type": "SoftwareApplication",
  "name": app.name,
  "datePublished": app.createdAt?.toDate().toISOString(),
  "dateModified": app.updatedAt?.toDate().toISOString()
}
```

See the **firestore** skill for timestamp handling in Firestore documents.