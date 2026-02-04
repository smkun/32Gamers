# In-App Guidance Reference

## Contents
- Tooltip Implementation
- Contextual Help Patterns
- Keyboard Shortcut Help Screen
- Form Field Guidance
- Error Recovery Guidance

---

## Tooltip Implementation

### Hover Tooltips

```javascript
// scripts/app.js - Tooltip utility
const Tooltip = {
    show(element, text, position = 'top') {
        const existing = element.querySelector('.tooltip');
        if (existing) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        element.style.position = 'relative';
        element.appendChild(tooltip);
    },
    
    hide(element) {
        const tooltip = element.querySelector('.tooltip');
        if (tooltip) tooltip.remove();
    }
};

// Usage
adminIcon.addEventListener('mouseenter', () => {
    Tooltip.show(adminIcon, 'Manage apps (Ctrl+Alt+A)', 'bottom');
});
adminIcon.addEventListener('mouseleave', () => {
    Tooltip.hide(adminIcon);
});
```

### Tooltip CSS

```css
/* style.css */
.tooltip {
    position: absolute;
    background: var(--cyber-dark);
    border: 1px solid var(--neon-cyan);
    color: var(--neon-cyan);
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
    animation: tooltipFadeIn 0.2s ease;
}

.tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0.5rem;
}

.tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
}

.tooltip::after {
    content: '';
    position: absolute;
    border: 6px solid transparent;
}

.tooltip-top::after {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--neon-cyan);
}

@keyframes tooltipFadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

---

## Contextual Help Patterns

### First-Time Action Help

```javascript
// firebase-admin.html - Show help on first form interaction
document.getElementById('appForm').addEventListener('focusin', function(e) {
    if (!localStorage.getItem('32gamers_form_helped')) {
        showFormHelp(e.target);
    }
}, { once: true });

function showFormHelp(field) {
    const helpText = {
        appId: 'Unique identifier (e.g., "minecraft", "fortnite")',
        name: 'Display name shown on the portal',
        url: 'Link to the app or game',
        image: 'Filename in assets/images/ (e.g., "minecraft.png")',
        description: 'Brief description (max 500 characters)'
    };
    
    const help = document.createElement('div');
    help.className = 'field-help';
    help.innerHTML = `
        <p><strong>TIP:</strong> ${helpText[field.name] || 'Fill in this field'}</p>
        <button onclick="dismissFormHelp()">Got it</button>
    `;
    field.parentElement.appendChild(help);
}

function dismissFormHelp() {
    document.querySelector('.field-help')?.remove();
    localStorage.setItem('32gamers_form_helped', 'true');
}
```

---

## Keyboard Shortcut Help Screen

```javascript
// scripts/app.js - Add to PortalManager
setupKeyboardHelp() {
    document.addEventListener('keydown', (e) => {
        // Show help with '?' key
        if (e.key === '?' && !e.ctrlKey && !e.altKey) {
            this.toggleKeyboardHelp();
        }
        // Or Escape to close
        if (e.key === 'Escape') {
            this.closeKeyboardHelp();
        }
    });
}

toggleKeyboardHelp() {
    const existing = document.getElementById('keyboardHelp');
    if (existing) {
        existing.remove();
        return;
    }
    
    const help = document.createElement('div');
    help.id = 'keyboardHelp';
    help.className = 'keyboard-help-modal';
    help.innerHTML = `
        <div class="modal-backdrop" onclick="portalManager.closeKeyboardHelp()"></div>
        <div class="modal-content cyber-border">
            <h2 class="neon-text">KEYBOARD SHORTCUTS</h2>
            <div class="shortcut-list">
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>F</kbd>
                    <span>Search apps</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>A</kbd>
                    <span>Admin panel</span>
                </div>
                <div class="shortcut-item">
                    <kbd>?</kbd>
                    <span>Toggle this help</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Close dialogs</span>
                </div>
            </div>
            <button class="cyber-btn" onclick="portalManager.closeKeyboardHelp()">
                CLOSE
            </button>
        </div>
    `;
    document.body.appendChild(help);
}

closeKeyboardHelp() {
    document.getElementById('keyboardHelp')?.remove();
}
```

### Help Modal CSS

```css
/* style.css */
.keyboard-help-modal .shortcut-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 2rem 0;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(0, 255, 255, 0.05);
    border-left: 2px solid var(--neon-cyan);
}

.shortcut-item kbd {
    background: var(--cyber-dark);
    border: 1px solid var(--neon-magenta);
    padding: 0.25rem 0.5rem;
    margin: 0 0.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
}
```

---

## Form Field Guidance

### Inline Validation Messages

```javascript
// firebase-admin.html - Real-time validation
function setupFormValidation() {
    const form = document.getElementById('appForm');
    const fields = form.querySelectorAll('input, textarea');
    
    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });
}

function validateField(field) {
    const value = field.value.trim();
    let error = null;
    
    if (!value && field.required) {
        error = 'This field is required';
    } else if (field.name === 'url' && value) {
        // Basic URL validation
        if (!/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(value)) {
            error = 'Enter a valid URL or relative path';
        }
    } else if (field.name === 'appId' && value) {
        if (!/^[a-z0-9-]+$/i.test(value)) {
            error = 'Only letters, numbers, and hyphens allowed';
        }
    }
    
    if (error) {
        showFieldError(field, error);
        return false;
    }
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    field.parentElement.appendChild(error);
    field.classList.add('has-error');
}

function clearFieldError(field) {
    field.parentElement.querySelector('.field-error')?.remove();
    field.classList.remove('has-error');
}
```

---

## Error Recovery Guidance

```javascript
// app.js - Enhanced error with recovery steps
showError(message, recoveryOptions = []) {
    const container = document.querySelector('.button-container');
    container.innerHTML = `
        <div class="error-message cyber-border">
            <div class="error-icon">⚠</div>
            <p class="error-text">${message}</p>
            ${recoveryOptions.length > 0 ? `
                <div class="recovery-steps">
                    <p>Try these steps:</p>
                    <ol>
                        ${recoveryOptions.map(opt => `<li>${opt}</li>`).join('')}
                    </ol>
                </div>
            ` : ''}
            <button class="cyber-btn" onclick="window.location.reload()">
                RETRY CONNECTION
            </button>
        </div>
    `;
}

// Usage
this.showError('Unable to load apps', [
    'Check your internet connection',
    'Disable ad blockers for this site',
    'Try refreshing the page'
]);
```