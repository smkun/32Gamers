The **mapping-conversion-events** skill has been created with all files:

**Files created:**
- `SKILL.md` (149 lines) - Main skill overview with quick start, event schema, and anti-patterns
- `references/conversion-optimization.md` (266 lines) - CRO patterns, funnel tracking, broken gtag fix
- `references/content-copy.md` (273 lines) - Event naming conventions, A/B testing copy
- `references/distribution.md` (323 lines) - UTM tracking, referral attribution, share events
- `references/measurement-testing.md` (309 lines) - Debug mode, Firebase DebugView, testing checklist
- `references/growth-engineering.md` (391 lines) - Viral loops, retention, feature discovery metrics
- `references/strategy-monetization.md` (348 lines) - Value metrics, premium gate tracking, revenue attribution

**Key findings documented:**
1. Firebase Analytics is configured (`measurementId: G-CMGT3Y2CBX`) but SDK not imported
2. `trackAppClick` method exists but references undefined `gtag` - always fails silently
3. No search tracking, no admin action tracking, no page view tracking
4. Provided fix implementations using Firebase Analytics `logEvent`

**Code blocks included:** 40+ working examples across all files