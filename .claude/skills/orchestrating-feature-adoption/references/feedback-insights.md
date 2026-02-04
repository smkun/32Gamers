# Feedback & Insights Reference

## Contents
- Current Feedback Channels
- In-App Feedback Patterns
- Error Reporting
- User Sentiment Collection
- Support Signal Analysis

---

## Current Feedback Channels

The 32Gamers portal has **no built-in feedback mechanism**. Users have no way to:
- Report bugs
- Request features
- Provide general feedback

**Existing error display** (`firebase-admin.html:105-122`):
```javascript
catch (error) {
    console.error('Login error:', error);
    showStatus(errorMessage, 'error');
}
```

Errors are logged to console but not sent anywhere.

---

## In-App Feedback Patterns

### Simple Feedback Button

```html
<!-- Add to index.html footer -->
<button class="feedback-btn" onclick="openFeedback()">
    <svg><!-- icon --></svg>
    Feedback
</button>
```

```javascript
// Feedback modal
function openFeedback() {
    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.innerHTML = `
        <div class="feedback-content">
            <h3>Send Feedback</h3>
            <select id="feedbackType">
                <option value="bug">Report a Bug</option>
                <option value="feature">Request a Feature</option>
                <option value="other">Other</option>
            </select>
            <textarea id="feedbackText" placeholder="Describe your feedback..."></textarea>
            <div class="feedback-actions">
                <button onclick="submitFeedback()">Send</button>
                <button onclick="this.closest('.feedback-modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
```

### Submit to Firestore

```javascript
// Store feedback in Firebase
async function submitFeedback() {
    const type = document.getElementById('feedbackType').value;
    const text = document.getElementById('feedbackText').value;
    
    if (!text.trim()) {
        showStatus('Please enter feedback', 'error');
        return;
    }
    
    try {
        await addDoc(collection(db, 'feedback'), {
            type: type,
            text: text,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: serverTimestamp(),
            status: 'new'
        });
        
        showStatus('Thanks for your feedback!', 'success');
        document.querySelector('.feedback-modal').remove();
    } catch (error) {
        showStatus('Failed to send feedback', 'error');
    }
}
```

### Feedback CSS

```css
.feedback-btn {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: var(--cyber-dark);
    border: 1px solid var(--neon-cyan);
    color: var(--neon-cyan);
    padding: 0.5rem 1rem;
    cursor: pointer;
    z-index: 100;
}

.feedback-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.feedback-content {
    background: var(--cyber-dark);
    border: 2px solid var(--neon-cyan);
    padding: 2rem;
    width: 90%;
    max-width: 500px;
}

.feedback-content textarea {
    width: 100%;
    min-height: 100px;
    margin: 1rem 0;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--cyber-gray);
    color: var(--text-light);
    padding: 0.5rem;
}
```

---

## Error Reporting

### Automatic Error Collection

```javascript
// scripts/error-reporter.js
const ErrorReporter = {
    init() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.report({
                type: 'uncaught',
                message: message,
                source: source,
                line: lineno,
                column: colno,
                stack: error?.stack
            });
        };
        
        window.onunhandledrejection = (event) => {
            this.report({
                type: 'unhandled_promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
        };
    },
    
    async report(errorData) {
        // Don't report in development
        if (location.hostname === 'localhost') {
            console.warn('Error would be reported:', errorData);
            return;
        }
        
        try {
            await addDoc(collection(db, 'errors'), {
                ...errorData,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error('Failed to report error:', e);
        }
    }
};

export default ErrorReporter;
```

### Firestore Security Rules for Feedback

```javascript
// Add to firebaseRules.txt
match /feedback/{docId} {
    // Anyone can submit feedback
    allow create: if true;
    // Only admin can read/update/delete
    allow read, update, delete: if isAdmin();
}

match /errors/{docId} {
    // Anyone can report errors
    allow create: if true;
    // Only admin can read
    allow read: if isAdmin();
}
```

---

## User Sentiment Collection

### Quick Rating Widget

```javascript
// After user completes action, ask for rating
function showRatingPrompt(context) {
    // Don't show too often
    const lastRating = localStorage.getItem('last_rating_prompt');
    if (lastRating && Date.now() - parseInt(lastRating) < 86400000) {
        return; // Once per day max
    }
    
    const widget = document.createElement('div');
    widget.className = 'rating-widget';
    widget.innerHTML = `
        <p>How was your experience?</p>
        <div class="rating-buttons">
            <button onclick="submitRating(1, '${context}')">😞</button>
            <button onclick="submitRating(2, '${context}')">😐</button>
            <button onclick="submitRating(3, '${context}')">😊</button>
        </div>
        <button class="dismiss" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(widget);
    
    localStorage.setItem('last_rating_prompt', Date.now());
}

async function submitRating(score, context) {
    await addDoc(collection(db, 'ratings'), {
        score: score,
        context: context,
        timestamp: serverTimestamp()
    });
    
    document.querySelector('.rating-widget').remove();
    showStatus('Thanks for your feedback!', 'success');
}
```

### When to Show Rating

```javascript
// Show after successful actions
showRatingPrompt('app_created');     // After admin adds app
showRatingPrompt('search_complete'); // After successful search
showRatingPrompt('first_session');   // End of first visit
```

---

## Support Signal Analysis

### Identifying User Struggles

```javascript
// Track rage clicks (multiple rapid clicks)
let clickTimes = [];
document.addEventListener('click', (e) => {
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(t => now - t < 2000);
    
    if (clickTimes.length >= 5) {
        Analytics.track('rage_click', {
            target: e.target.className,
            url: window.location.href
        });
        clickTimes = [];
    }
});

// Track dead clicks (clicks on non-interactive elements)
document.addEventListener('click', (e) => {
    const interactive = e.target.closest('a, button, input, [onclick]');
    if (!interactive) {
        Analytics.track('dead_click', {
            target: e.target.tagName,
            text: e.target.textContent?.slice(0, 50)
        });
    }
});
```

### Form Abandonment Tracking

```javascript
// Track when users start but don't complete forms
const form = document.getElementById('appForm');
let formStarted = false;

form.addEventListener('focusin', () => {
    if (!formStarted) {
        formStarted = true;
        Analytics.track('form_started', { form: 'add_app' });
    }
});

form.addEventListener('submit', () => {
    Analytics.track('form_completed', { form: 'add_app' });
    formStarted = false;
});

// On page unload, check for abandonment
window.addEventListener('beforeunload', () => {
    if (formStarted) {
        Analytics.track('form_abandoned', { form: 'add_app' });
    }
});
```

---

## Anti-Patterns

### WARNING: Feedback Without Response Path

**The Problem:**
```javascript
// BAD - Collect feedback but never act on it
await addDoc(collection(db, 'feedback'), data);
// No notification, no follow-up, no status updates
```

**Why This Breaks:** Users feel ignored, stop giving feedback.

**The Fix:** Add status field, notify admin, optionally email user:
```javascript
await addDoc(collection(db, 'feedback'), {
    ...data,
    status: 'new',
    notifiedAdmin: false
});
// Trigger notification to admin
```

### WARNING: Intrusive Feedback Prompts

**The Problem:**
```javascript
// BAD - Interrupt users constantly
setInterval(() => showRatingPrompt(), 30000);
```

**Why This Breaks:** Annoys users, causes feedback fatigue.

**The Fix:** Rate-limit prompts, trigger at natural breakpoints only.

---

## Implementation Checklist

- [ ] Add feedback button to portal footer
- [ ] Create feedback Firestore collection
- [ ] Add security rules for feedback/errors
- [ ] Implement error reporter
- [ ] Add rating widget (rate-limited)
- [ ] Track rage clicks and dead clicks
- [ ] Set up admin notification for new feedback
- [ ] Style with cyberpunk theme (see **css** skill)
- [ ] Test feedback submission flow