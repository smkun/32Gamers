# Content & Copy Reference

## Contents
- Brand Voice Guidelines
- Copy Locations
- Microcopy Patterns
- Editing Copy

## Brand Voice Guidelines

32Gamers uses a **cyberpunk/tech aesthetic** voice:

| Attribute | Example | Anti-Pattern |
|-----------|---------|--------------|
| Sci-fi terminology | "MISSION CONTROL" | "Home Page" |
| Technical formatting | `// SELECT YOUR MISSION` | "Choose a game" |
| Bracket notation | `[INITIALIZING NEURAL LINK]` | "Loading..." |
| Command-line style | `CTRL+ALT+A` | "Admin shortcut" |

## Copy Locations Map

### index.html

```html
<!-- Line 6 - Browser tab title -->
<title>32GAMERS // MISSION CONTROL</title>

<!-- Line 57 - Hero headline with glitch effect -->
<span class="glitch" data-text="MISSION CONTROL">MISSION CONTROL</span>

<!-- Line 61 - Value proposition subtitle -->
<div class="subtitle">// SELECT YOUR MISSION</div>

<!-- Line 73 - Loading state copy -->
INITIALIZING NEURAL LINK
```

### firebase-admin.html

```html
<!-- Line 6 - Admin page title -->
<title>32Gamers Firebase Admin</title>

<!-- Line 13 - Admin panel heading -->
<h1>32Gamers Firebase Admin</h1>

<!-- Line 21-22 - Login prompt -->
<h3>Admin Access Required</h3>
<p>Sign in with your Google account to manage apps</p>
```

### scripts/app.js

```javascript
// Line 53 - Network error message
'Unable to load apps. Please check your internet connection or contact the administrator.'

// Line 208 - Search empty state
'No apps found matching your search.'
```

## Microcopy Patterns

### Status Messages

Follow this pattern for status messages:

```javascript
// firebase-admin.html - Status message examples
'Opening sign-in popup...'      // Action in progress
'Sign-in successful!'            // Success confirmation
'Sign-in cancelled.'             // User-initiated cancel
'Network error. Check your connection and try again.'  // Error with action
```

### Form Placeholders

```html
<!-- firebase-admin.html:54-70 - Pattern: example, not instruction -->
<input placeholder="my-new-app">      <!-- Shows format -->
<input placeholder="My New App">       <!-- Shows style -->
<input placeholder="MyNewApp/index.html">  <!-- Shows path format -->
```

### DO: Thematic Loading States

```html
<!-- Good - matches cyberpunk brand -->
<p>[INITIALIZING NEURAL LINK]</p>
<p>[ESTABLISHING CONNECTION]</p>
<p>[DECRYPTING DATA STREAM]</p>
```

### DON'T: Generic Loading Copy

```html
<!-- BAD - breaks immersion -->
<p>Loading...</p>
<p>Please wait</p>
<p>Fetching data</p>
```

## Editing Copy

### Changing Hero Copy

1. Open `index.html`
2. Edit line 57 for headline (update both `data-text` and inner text):

```html
<span class="glitch" data-text="NEW HEADLINE">NEW HEADLINE</span>
```

3. Edit line 61 for subtitle:

```html
<div class="subtitle">// NEW VALUE PROP</div>
```

### Changing Status Messages

Edit `firebase-admin.html` inline script, `showStatus()` calls:

```javascript
// Line 107 - Sign-in progress
showStatus('Your custom message...', 'info');
```

### Changing Error Messages

Edit `scripts/app.js`:

```javascript
// Line 53 - Update loadFallbackApps() message
this.showError('Your custom error message with guidance.');
```

## Missing: Meta Description

**WARNING**: No meta description tag exists. Add to `index.html`:

```html
<!-- Add after line 5 -->
<meta name="description" content="32Gamers Club - Your central hub for gaming applications. Quick access to curated games and tools.">
```

## Missing: Open Graph Tags

**WARNING**: No social sharing tags. Add to `index.html`:

```html
<!-- Add after meta description -->
<meta property="og:title" content="32GAMERS // MISSION CONTROL">
<meta property="og:description" content="Your central hub for gaming applications">
<meta property="og:image" content="assets/images/32Gamers_logo.png">
<meta property="og:type" content="website">
```

## Related Skills

See the **frontend-design** skill for visual styling of copy elements.