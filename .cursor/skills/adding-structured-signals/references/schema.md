# Schema Types Reference

## Contents
- WebSite Schema
- WebPage Schema
- SoftwareApplication Schema
- ItemList Schema
- Organization Schema
- BreadcrumbList Schema

## WebSite Schema

Base schema for the portal homepage.

```javascript
// index.html - Static schema in <head>
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "32Gamers Club",
  "alternateName": "32Gamers",
  "url": "https://32gamers.club",
  "description": "Cyberpunk-themed gaming community portal",
  "inLanguage": "en-US",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://32gamers.club?q={search_term}",
    "query-input": "required name=search_term"
  }
}
```

## WebPage Schema

For specific pages like admin panel.

```javascript
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "32Gamers Admin Panel",
  "url": "https://32gamers.club/firebase-admin.html",
  "isPartOf": {
    "@type": "WebSite",
    "name": "32Gamers Club"
  },
  "about": {
    "@type": "Thing",
    "name": "App Catalog Management"
  }
}
```

## SoftwareApplication Schema

For each app in the catalog.

```javascript
// Properties mapped from Firestore document
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",                    // Required
  "description": "App description",      // Required
  "url": "https://app-url.com",          // Required
  "image": "https://32gamers.club/assets/images/app.png",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "32Gamers Club"
  }
}
```

### Application Categories

| Value | Use For |
|-------|---------|
| GameApplication | Games |
| WebApplication | Web tools |
| SocialNetworkingApplication | Social features |
| EntertainmentApplication | Media/entertainment |

## ItemList Schema

For the app catalog collection.

```javascript
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Gaming Apps",
  "description": "Curated collection of gaming applications",
  "numberOfItems": 10,
  "itemListOrder": "https://schema.org/ItemListUnordered",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": { "@type": "SoftwareApplication", "name": "App 1" }
    }
  ]
}
```

## Organization Schema

For branding and knowledge panel eligibility.

```javascript
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "32Gamers Club",
  "url": "https://32gamers.club",
  "logo": "https://32gamers.club/assets/images/32gamers-logo.png",
  "sameAs": [
    "https://github.com/32gamers"
  ]
}
```

## BreadcrumbList Schema

For admin panel navigation context.

```javascript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://32gamers.club"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Admin",
      "item": "https://32gamers.club/firebase-admin.html"
    }
  ]
}
```

## Schema Validation Quick Reference

| Schema Type | Required Properties |
|-------------|---------------------|
| WebSite | name, url |
| WebPage | name |
| SoftwareApplication | name |
| ItemList | itemListElement |
| Organization | name |
| BreadcrumbList | itemListElement |