The **instrumenting-product-metrics** skill has been created with the following files:

## Created Files

```
.claude/skills/instrumenting-product-metrics/
├── SKILL.md (104 lines)
└── references/
    ├── activation-onboarding.md (190 lines)
    ├── engagement-adoption.md (256 lines)
    ├── in-app-guidance.md (305 lines)
    ├── product-analytics.md (350 lines)
    ├── roadmap-experiments.md (402 lines)
    └── feedback-insights.md (435 lines)
```

## Key Highlights

**Current State Identified:**
- Measurement ID `G-CMGT3Y2CBX` exists but GA script not loaded
- Only 1 event tracked: `app_click` in `scripts/app.js:94-102`
- Rich error handling in admin panel but not tracked as metrics

**Documented Patterns:**
- GA4 setup with proper script inclusion
- Analytics helper with gtag safety guards
- Event schema with 15+ trackable events
- Performance timing for Firebase operations
- Funnel definitions (activation, admin, search)

**Anti-Patterns Covered:**
- Using gtag without loading GA script
- High-cardinality parameters breaking reports
- Tracking without exposure events in experiments
- Missing session IDs preventing user journey analysis
- PII leakage in error tracking

**Checklists Included:**
- Analytics implementation checklist
- Activation tracking checklist
- Engagement tracking checklist
- Experiment tracking checklist
- Feedback collection checklist