# Programmatic Generation

## Contents
- Dynamic Schema from Firestore
- Batch Schema Generation
- Client-Side Injection Patterns
- Error Handling

## Dynamic Schema from Firestore

Since 32Gamers loads app data from Firestore at runtime, schema must be generated client-side.

### Integration with PortalManager

```javascript
// scripts/app.js - Add schema generation to existing class
class PortalManager {
  constructor() {
    this.apps = [];
    // ... existing constructor code
  }
  
  async loadApps() {
    try {
      const querySnapshot = await getDocs(collection(db, 'apps'));
      this.apps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      this.renderApps(this.apps);
      this.injectStructuredData(this.apps); // Add this line
    } catch (error) {
      console.error('Error loading apps:', error);
    }
  }
  
  injectStructuredData(apps) {
    if (!apps.length) return;
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "32Gamers App Catalog",
      "numberOfItems": apps.length,
      "itemListElement": apps.map((app, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": app.name,
          "description": app.description,
          "url": this.resolveUrl(app.url),
          "image": this.resolveImageUrl(app.image),
          "applicationCategory": "GameApplication"
        }
      }))
    };
    
    this.appendSchema(schema);
  }
  
  resolveUrl(url) {
    return url.startsWith('http') ? url : `https://32gamers.club/${url}`;
  }
  
  resolveImageUrl(image) {
    return `https://32gamers.club/assets/images/${image}`;
  }
  
  appendSchema(schema) {
    const existing = document.querySelector('[data-schema-type="app-list"]');
    if (existing) existing.remove();
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-type', 'app-list');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
```

## WARNING: Schema Generation in Loops

### Problem: Creating Multiple Schema Scripts

```javascript
// BAD - Creates one script per app, bloats DOM
apps.forEach(app => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@type": "SoftwareApplication",
    "name": app.name
  });
  document.head.appendChild(script);
});
```

**Why This Breaks:**
1. Creates N script tags for N apps
2. Harder for crawlers to parse
3. No relationship between items

**The Fix:**

```javascript
// GOOD - Single ItemList containing all apps
const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": apps.map((app, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": { "@type": "SoftwareApplication", "name": app.name }
  }))
};
// Single script injection
```

## Error Handling

```javascript
injectStructuredData(apps) {
  try {
    // Validate apps have required fields
    const validApps = apps.filter(app => 
      app.name && app.description && app.url
    );
    
    if (validApps.length === 0) {
      console.warn('No valid apps for schema generation');
      return;
    }
    
    const schema = this.buildItemListSchema(validApps);
    this.appendSchema(schema);
    
  } catch (error) {
    // Schema failure should not break the app
    console.error('Schema generation failed:', error);
  }
}
```

## Search Action Integration

```javascript
// Add search capability to WebSite schema
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
```

See the **vanilla-javascript** skill for DOM manipulation patterns used in schema injection.