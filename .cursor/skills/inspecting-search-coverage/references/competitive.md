# Competitive SEO Reference

## Contents
- Competitor Analysis
- Alternative Pages Strategy
- Internal Linking
- Differentiation Keywords

---

## Competitor Analysis

### Gaming Portal Competitors

Research competitor SEO to identify gaps and opportunities.

```bash
# Use Tavily to research competitors
# Find what keywords gaming portals rank for
```

### Common Competitor Patterns

| Competitor Type | SEO Strength | Gap for 32Gamers |
|-----------------|--------------|------------------|
| Steam/Epic | Brand authority | Niche curation |
| IGN/GameSpot | Content volume | Community focus |
| Discord servers | Community | Discoverability |
| Reddit r/gaming | User content | Organized catalog |

---

## Alternative Pages Strategy

Create comparison/alternative pages to capture search intent.

### DO: Create Comparison Content

```html
<!-- Future: /alternatives/discord.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Best Discord Alternatives for Gaming (2025) - 32Gamers</title>
    <meta name="description" content="Compare top Discord alternatives for gaming: TeamSpeak, Mumble, and more. Find the best voice chat for your gaming group." />
</head>
<body>
    <article>
        <h1>Best Discord Alternatives for Gaming</h1>
        
        <section>
            <h2>Top 5 Discord Alternatives</h2>
            <ol>
                <li><a href="/apps/teamspeak">TeamSpeak</a></li>
                <li><a href="/apps/mumble">Mumble</a></li>
                <!-- More alternatives -->
            </ol>
        </section>
        
        <section>
            <h2>Comparison Table</h2>
            <!-- Feature comparison -->
        </section>
    </article>
</body>
</html>
```

### Target Keywords

| Keyword Pattern | Example | Search Intent |
|-----------------|---------|---------------|
| "[app] alternatives" | "discord alternatives" | Comparison shopping |
| "[app] vs [app]" | "discord vs teamspeak" | Decision making |
| "best [category] apps" | "best gaming voice chat" | Discovery |
| "[app] for [use case]" | "voice chat for streaming" | Specific need |

---

## Internal Linking

### Current State: Minimal

Only link is admin panel access.

### DO: Create Link Network

```html
<!-- index.html - Add category navigation -->
<nav class="category-nav">
    <a href="#voice-chat">Voice Chat</a>
    <a href="#game-launchers">Launchers</a>
    <a href="#streaming">Streaming</a>
    <a href="#utilities">Utilities</a>
</nav>

<!-- In app cards -->
<article class="app-card">
    <h3>Discord</h3>
    <p>Voice chat for gamers. 
       See also: <a href="/alternatives/discord">Discord alternatives</a>
    </p>
</article>
```

### Internal Link Structure

```
index.html (hub)
├── /apps/discord.html
│   └── links to /alternatives/discord.html
├── /apps/steam.html
│   └── links to /alternatives/steam.html
├── /categories/voice-chat.html
│   └── links to all voice apps
└── /about.html
    └── links back to categories
```

---

## Differentiation Keywords

### Unique Value Proposition

32Gamers differentiates via:
- **Curation** - Handpicked, not exhaustive
- **Cyberpunk aesthetic** - Visual identity
- **Community focus** - For gamers, by gamers

### Target Niche Keywords

| Keyword | Competition | Opportunity |
|---------|-------------|-------------|
| "curated gaming apps" | Low | High - unique angle |
| "gaming portal" | Medium | Brand it |
| "cyberpunk gaming tools" | Very Low | Own this niche |
| "gaming app directory" | Low | Informational |

### DO: Weave Differentiators Into Content

```html
<meta name="description" content="Curated gaming apps and tools with a cyberpunk edge. 32Gamers Club - your handpicked gaming portal." />

<h1>32Gamers Mission Control</h1>
<p>Not another bloated app store. We <strong>curate</strong> the best 
gaming tools so you don't have to wade through junk.</p>
```

---

## Content Gap Analysis

### Missing Content Types

| Content Type | SEO Value | Effort | Priority |
|--------------|-----------|--------|----------|
| Individual app pages | High | Medium | High |
| Category pages | High | Low | High |
| Comparison articles | High | High | Medium |
| How-to guides | Medium | High | Low |
| App reviews | Medium | Medium | Medium |

### Quick Wins

1. **Category anchors** - Add `#voice-chat`, `#launchers` sections
2. **App descriptions** - Expand from one-liners to paragraphs
3. **Related apps** - Link similar apps to each other

---

## Competitive Audit Checklist

Copy and track progress:
- [ ] Research top 3 competitor gaming portals
- [ ] Identify keywords they rank for (via Tavily search)
- [ ] Find gaps they don't cover
- [ ] Plan 5 alternative/comparison pages
- [ ] Create internal linking strategy
- [ ] Define unique positioning keywords
- [ ] See the **clarifying-market-fit** skill for positioning

---

## Research Tools

Use MCP tools for competitive research:

```javascript
// Example: Research competitor SEO
// Use mcp__tavily__tavily_search
{
    "query": "best gaming portal sites 2025",
    "max_results": 10
}

// Example: Analyze competitor page
// Use mcp__tavily__tavily_extract
{
    "url": "https://competitor-site.com",
    "include_images": false
}
```