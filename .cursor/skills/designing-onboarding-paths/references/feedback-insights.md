# Feedback & Insights Reference

## Contents
- In-App Feedback Collection
- Error Reporting Pattern
- User Signal Detection
- Support Escalation
- Backlog Triage

---

## In-App Feedback Collection

Lightweight feedback widget:

```javascript
// scripts/feedback.js
const FeedbackWidget = {
    init() {
        this.createWidget();
        this.bindEvents();
    },
    
    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'feedbackWidget';
        widget.className = 'feedback-widget';
        widget.innerHTML = `
            <button class="feedback-trigger" aria-label="Send feedback">
                <span class="feedback-icon">💬</span>
            </button>
            <div class="feedback-form hidden">
                <div class="feedback-header">
                    <h4>Send Feedback</h4>
                    <button class="close-btn" aria-label="Close">×</button>
                </div>
                <div class="feedback-options">
                    <button data-type="bug" class="feedback-type">
                        🐛 Bug
                    </button>
                    <button data-type="idea" class="feedback-type">
                        💡 Idea
                    </button>
                    <button data-type="other" class="feedback-type">
                        💬 Other
                    </button>
                </div>
                <textarea 
                    placeholder="What's on your mind?"
                    maxlength="500"
                ></textarea>
                <button class="cyber-btn submit-feedback">
                    TRANSMIT
                </button>
            </div>
        `;
        document.body.appendChild(widget);
    },
    
    bindEvents() {
        const widget = document.getElementById('feedbackWidget');
        const trigger = widget.querySelector('.feedback-trigger');
        const form = widget.querySelector('.feedback-form');
        const closeBtn = widget.querySelector('.close-btn');
        const submitBtn = widget.querySelector('.submit-feedback');
        const typeButtons = widget.querySelectorAll('.feedback-type');
        
        let selectedType = null;
        
        trigger.addEventListener('click', () => {
            form.classList.toggle('hidden');
            Analytics.track('feedback_opened');
        });
        
        closeBtn.addEventListener('click', () => {
            form.classList.add('hidden');
        });
        
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                typeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedType = btn.dataset.type;
            });
        });
        
        submitBtn.addEventListener('click', () => {
            const message = widget.querySelector('textarea').value.trim();
            if (selectedType && message) {
                this.submitFeedback(selectedType, message);
            }
        });
    },
    
    submitFeedback(type, message) {
        // Store locally (no backend)
        const feedback = JSON.parse(localStorage.getItem('32gamers_feedback') || '[]');
        feedback.push({
            type,
            message,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        localStorage.setItem('32gamers_feedback', JSON.stringify(feedback));
        
        Analytics.track('feedback_submitted', { type });
        
        // Show confirmation
        this.showConfirmation();
    },
    
    showConfirmation() {
        const form = document.querySelector('.feedback-form');
        form.innerHTML = `
            <div class="feedback-success">
                <span class="success-icon">✓</span>
                <p>Feedback received!</p>
            </div>
        `;
        setTimeout(() => {
            form.classList.add('hidden');
            this.createWidget();  // Reset form
        }, 2000);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    FeedbackWidget.init();
});
```

### Feedback Widget CSS

```css
/* style.css */
.feedback-widget {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
}

.feedback-trigger {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--cyber-dark);
    border: 2px solid var(--neon-cyan);
    cursor: pointer;
    transition: all 0.3s ease;
}

.feedback-trigger:hover {
    box-shadow: 0 0 20px var(--neon-cyan);
    transform: scale(1.1);
}

.feedback-form {
    position: absolute;
    bottom: 60px;
    right: 0;
    width: 300px;
    background: var(--cyber-dark);
    border: 2px solid var(--neon-cyan);
    padding: 1rem;
}

.feedback-options {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
}

.feedback-type {
    flex: 1;
    padding: 0.5rem;
    background: transparent;
    border: 1px solid var(--neon-cyan);
    color: var(--text-color);
    cursor: pointer;
}

.feedback-type.selected {
    background: var(--neon-cyan);
    color: var(--cyber-dark);
}

.feedback-form textarea {
    width: 100%;
    min-height: 100px;
    background: rgba(0, 255, 255, 0.05);
    border: 1px solid var(--neon-cyan);
    color: var(--text-color);
    padding: 0.75rem;
    resize: vertical;
}
```

---

## Error Reporting Pattern

Capture errors with context:

```javascript
// scripts/app.js
class ErrorReporter {
    static capture(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Store in localStorage
        const errors = JSON.parse(localStorage.getItem('32gamers_errors') || '[]');
        errors.push(errorData);
        
        // Keep only last 20 errors
        if (errors.length > 20) {
            errors.splice(0, errors.length - 20);
        }
        
        localStorage.setItem('32gamers_errors', JSON.stringify(errors));
        
        Analytics.track('error_occurred', {
            message: error.message,
            context: context.action || 'unknown'
        });
        
        console.error('[ErrorReporter]', errorData);
    }
}

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
    ErrorReporter.capture(error || new Error(message), {
        source,
        lineno,
        colno
    });
};

// Promise rejection handler
window.onunhandledrejection = function(event) {
    ErrorReporter.capture(event.reason, {
        type: 'unhandled_promise_rejection'
    });
};
```

### Usage in Code

```javascript
// scripts/app.js
async loadApps() {
    try {
        const querySnapshot = await window.firebase.getDocs(...);
        // ...
    } catch (error) {
        ErrorReporter.capture(error, { action: 'loadApps' });
        this.showError('Unable to load apps');
    }
}
```

---

## User Signal Detection

Detect frustration and confusion:

```javascript
// scripts/signals.js
const UserSignals = {
    rageclicks: 0,
    lastClick: 0,
    
    init() {
        document.addEventListener('click', (e) => this.detectRageClick(e));
        this.detectScrollBounce();
    },
    
    detectRageClick(e) {
        const now = Date.now();
        if (now - this.lastClick < 300) {
            this.rageclicks++;
            if (this.rageclicks >= 3) {
                Analytics.track('rage_click_detected', {
                    element: e.target.tagName,
                    className: e.target.className
                });
                this.rageclicks = 0;
                this.offerHelp('Having trouble? Press ? for shortcuts.');
            }
        } else {
            this.rageclicks = 1;
        }
        this.lastClick = now;
    },
    
    detectScrollBounce() {
        let scrollCount = 0;
        let lastDirection = null;
        
        window.addEventListener('scroll', () => {
            const direction = window.scrollY > (this.lastScrollY || 0) ? 'down' : 'up';
            if (direction !== lastDirection) {
                scrollCount++;
                if (scrollCount > 6) {  // 6+ direction changes
                    Analytics.track('scroll_bounce_detected');
                    scrollCount = 0;
                }
            }
            lastDirection = direction;
            this.lastScrollY = window.scrollY;
        });
    },
    
    offerHelp(message) {
        const toast = document.createElement('div');
        toast.className = 'help-toast';
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
};

UserSignals.init();
```

---

## Support Escalation

For admin users, provide debug export:

```javascript
// firebase-admin.html
function exportDebugInfo() {
    const debugData = {
        timestamp: new Date().toISOString(),
        analytics: JSON.parse(localStorage.getItem('32gamers_analytics') || '[]'),
        errors: JSON.parse(localStorage.getItem('32gamers_errors') || '[]'),
        feedback: JSON.parse(localStorage.getItem('32gamers_feedback') || '[]'),
        flags: JSON.parse(localStorage.getItem('32gamers_flags') || '{}'),
        onboarding: JSON.parse(localStorage.getItem('32gamers_onboarding') || '{}'),
        browser: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `32gamers-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
```

---

## Backlog Triage

Analyze collected feedback:

```javascript
// Admin console utility
function analyzeFeedback() {
    const feedback = JSON.parse(localStorage.getItem('32gamers_feedback') || '[]');
    
    const byType = feedback.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
    }, {});
    
    const byPage = feedback.reduce((acc, f) => {
        const page = new URL(f.url).pathname;
        acc[page] = (acc[page] || 0) + 1;
        return acc;
    }, {});
    
    console.table({
        'Total Feedback': feedback.length,
        'Bugs': byType.bug || 0,
        'Ideas': byType.idea || 0,
        'Other': byType.other || 0
    });
    
    console.log('Feedback by page:', byPage);
    console.log('Recent feedback:', feedback.slice(-5));
    
    return { byType, byPage, recent: feedback.slice(-5) };
}

// Run in browser console
// analyzeFeedback();
```

### Feedback Loop Workflow

```markdown
Copy this checklist and track progress:
- [ ] Export debug data from affected users
- [ ] Review error logs for patterns
- [ ] Categorize feedback by type (bug/idea/other)
- [ ] Identify most common page/feature for issues
- [ ] Create actionable items for top 3 issues
- [ ] Prioritize based on user impact
- [ ] Clear processed feedback from localStorage
```