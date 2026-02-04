---
name: clarifying-market-fit
description: |
  Aligns ICP, positioning, and value narrative for on-page messaging in the 32Gamers portal.
  Use when: defining target audience, writing value propositions, updating hero copy, crafting app descriptions, improving empty states, or auditing messaging consistency across portal pages.
allowed-tools: Read, Edit, Write, Glob, Grep, mcp__tavily__tavily_search, mcp__tavily__tavily_research
---

# Clarifying Market Fit

Aligns Ideal Customer Profile (ICP), positioning statements, and value narratives across the 32Gamers portal's messaging surfaces.

## Messaging Surfaces in This Codebase

| File | Surface | Current Copy |
|------|---------|--------------|
| `index.html:57` | Hero headline | `MISSION CONTROL` |
| `index.html:61` | Subtitle/value prop | `// SELECT YOUR MISSION` |
| `index.html:73` | Loading state | `[INITIALIZING NEURAL LINK]` |
| `firebase-admin.html:22` | Admin login prompt | `Sign in with your Google account to manage apps` |
| `scripts/app.js:53` | Error state | `Unable to load apps. Please check your internet connection...` |
| `scripts/app.js:208` | Empty search | `No apps found matching your search.` |

## Quick Start

### Update Hero Copy

```html
<!-- index.html:56-62 -->
<h1 class="cyber-title">
    <span class="glitch" data-text="YOUR HEADLINE">YOUR HEADLINE</span>
    <div class="title-underline"></div>
</h1>
<div class="subtitle">// YOUR VALUE PROPOSITION</div>
```

### Update Status Messages

```javascript
// scripts/app.js:104-114 - Error message pattern
showError(message) {
    const container = document.querySelector('.button-container');
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="window.location.reload()">Retry</button>
        </div>
    `;
}
```

## ICP Definition Framework

For 32Gamers portal, the ICP is:

**Primary**: Gaming community members seeking quick access to curated gaming apps/tools
**Secondary**: Admin/curator managing the app catalog

| ICP Attribute | Portal User | Admin User |
|---------------|-------------|------------|
| Goal | Find and launch games quickly | Manage app catalog |
| Pain point | Scattered bookmarks, no central hub | Complex CMS tools |
| Value delivered | One-click access | Simple CRUD via Google OAuth |

## Messaging Consistency Checklist

Copy this checklist when auditing messaging:
- [ ] Hero headline matches brand voice (cyberpunk/tech aesthetic)
- [ ] Subtitle communicates primary value (app access)
- [ ] Loading states use thematic language (neural link, mission, etc.)
- [ ] Error messages are actionable, not generic
- [ ] Empty states guide user to next action
- [ ] Admin prompts clarify what happens after sign-in
- [ ] Meta title matches page purpose

## See Also

- [conversion-optimization](references/conversion-optimization.md)
- [content-copy](references/content-copy.md)
- [distribution](references/distribution.md)
- [measurement-testing](references/measurement-testing.md)
- [growth-engineering](references/growth-engineering.md)
- [strategy-monetization](references/strategy-monetization.md)

## Related Skills

For implementing messaging changes:
- See the **css** skill for styling value prop sections
- See the **vanilla-javascript** skill for dynamic messaging
- See the **frontend-design** skill for cyberpunk aesthetic guidelines
- See the **crafting-page-messaging** skill for copy frameworks