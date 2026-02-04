# Components Reference

## Contents
- App Cards
- Buttons
- Form Inputs
- Loading States
- Admin Panel Elements

---

## App Cards

The primary UI element. Each app displays as a hoverable card with glow effects.

```css
.app-card {
  background: linear-gradient(135deg, var(--cyber-dark) 0%, var(--cyber-darker) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-card:hover {
  border-color: var(--neon-cyan);
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 10px 40px rgba(0, 255, 255, 0.2),
    0 0 20px rgba(0, 255, 255, 0.1);
}

.app-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
}

.app-card__title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  color: var(--neon-cyan);
  margin: 1rem 0 0.5rem;
}

.app-card__description {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}
```

---

## Buttons

### Primary Action Button

```css
.cyber-button {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid var(--neon-cyan);
  color: var(--neon-cyan);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.cyber-button:hover {
  background: var(--neon-cyan);
  color: var(--cyber-dark);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.cyber-button:active {
  transform: scale(0.98);
}
```

### Danger Button

```css
.cyber-button--danger {
  border-color: var(--error-red);
  color: var(--error-red);
}

.cyber-button--danger:hover {
  background: var(--error-red);
  color: var(--cyber-dark);
  box-shadow: 0 0 30px rgba(255, 51, 102, 0.5);
}
```

---

## Form Inputs

```css
.cyber-input {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  padding: 12px 16px;
  background: var(--cyber-darker);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #fff;
  width: 100%;
  transition: all 0.3s ease;
}

.cyber-input:focus {
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.cyber-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
```

### DON'T: Default browser styling

```css
/* BAD - breaks visual consistency */
.input {
  border: 1px solid #ccc;
  background: white;
}
```

---

## Loading States

### Skeleton Placeholder

```css
.loading-placeholder {
  background: linear-gradient(
    90deg,
    var(--cyber-darker) 25%,
    var(--cyber-medium) 50%,
    var(--cyber-darker) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Pulsing Loader

```css
.cyber-loader {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-top-color: var(--neon-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Admin Panel Elements

The admin panel in `firebase-admin.html` uses inline styles matching the main stylesheet.

```css
.admin-header {
  background: var(--cyber-dark);
  border-bottom: 1px solid var(--neon-magenta);
  padding: 1rem 2rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  color: var(--neon-cyan);
  border-bottom: 2px solid var(--neon-cyan);
  padding: 1rem;
  text-align: left;
}

.admin-table td {
  font-family: 'JetBrains Mono', monospace;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}