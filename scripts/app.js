// 32Gamers Portal - Dynamic App Loader
class PortalManager {
    constructor() {
        this.apps = [];
        this.init();
    }

    async init() {
        await this.loadApps();
        this.renderApps();
        this.setupEventListeners();
    }

    async waitForFirebase(maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            if (window.firebase?.db) return true;
            const delay = Math.pow(2, i) * 300; // 300ms, 600ms, 1200ms
            console.log(`Waiting for Firebase... (attempt ${i + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, delay));
        }
        return false;
    }

    async loadApps() {
        try {
            // Wait for Firebase with exponential backoff
            const firebaseReady = await this.waitForFirebase();

            if (firebaseReady) {
                console.log('Loading from Firebase...');
                const querySnapshot = await window.firebase.getDocs(window.firebase.collection(window.firebase.db, 'apps'));
                const firebaseApps = [];
                querySnapshot.forEach((doc) => {
                    const app = doc.data();
                    firebaseApps.push({
                        id: app.appId,
                        name: app.name,
                        url: app.url,
                        image: app.image,
                        description: app.description
                    });
                });

                this.apps = firebaseApps;
                console.log(`Successfully loaded ${firebaseApps.length} apps from Firebase`);
                return;
            } else {
                throw new Error('Firebase failed to initialize');
            }
        } catch (error) {
            console.error('Failed to load apps from Firebase:', error);
            this.loadFallbackApps();
        }
    }


    loadFallbackApps() {
        console.log('No apps available - Firebase and JSON sources failed');
        this.apps = [];
        this.showError('Unable to load apps. Please check your internet connection or contact the administrator.');
    }

    renderApps() {
        const container = document.querySelector('.button-container');
        if (!container) return;

        // Clear existing buttons
        container.innerHTML = '';

        // Create buttons from JSON data
        this.apps.forEach((app, index) => {
            const button = this.createAppButton(app, index);
            container.appendChild(button);
        });
    }

    createAppButton(app, index) {
        const button = document.createElement('a');
        button.href = app.url;
        button.className = 'button';
        button.setAttribute('data-app-id', app.id);
        button.style.animationDelay = `${(index + 1) * 0.1}s`;

        // Add accessibility attributes
        button.setAttribute('aria-label', `${app.name} - ${app.description}`);
        button.setAttribute('title', app.description);

        button.innerHTML = `
            <img src="assets/images/${app.image}" alt="${app.name}" loading="lazy" onerror="this.style.opacity='0.3'"/>
            <span>${app.name}</span>
        `;

        return button;
    }

    showError(message) {
        const container = document.querySelector('.button-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const focused = document.activeElement;
                if (focused && focused.classList.contains('button')) {
                    focused.click();
                }
            }
        });

        // Add search functionality (for future enhancement)
        this.setupSearch();

        // Setup admin access
        this.setupAdminAccess();
    }

    setupAdminAccess() {
        const adminIcon = document.getElementById('adminIcon');
        if (!adminIcon) return;

        // Admin access with protection
        adminIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAdminAccess();
        });

        // Secret key combination: Ctrl+Alt+A
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'a') {
                e.preventDefault();
                this.handleAdminAccess();
            }
        });
    }

    async handleAdminAccess() {
        // Direct access to Firebase admin - no password needed
        window.location.href = 'firebase-admin.html';
    }

    setupSearch() {
        // Create search input (hidden by default, can be shown with Ctrl+F)
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.display = 'none';
        searchContainer.innerHTML = `
            <input type="text" placeholder="Search apps..." class="search-input">
            <button class="search-close">&times;</button>
        `;

        document.querySelector('.container').insertBefore(
            searchContainer,
            document.querySelector('.button-container')
        );

        const searchInput = searchContainer.querySelector('.search-input');
        const searchClose = searchContainer.querySelector('.search-close');

        // Show search on Ctrl+F
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                searchContainer.style.display = 'block';
                searchInput.focus();
            }
        });

        // Hide search
        searchClose.addEventListener('click', () => {
            searchContainer.style.display = 'none';
            searchInput.value = '';
            this.renderApps(); // Reset view
        });

        // Filter apps as user types
        searchInput.addEventListener('input', (e) => {
            this.filterApps(e.target.value);
        });
    }

    filterApps(searchTerm) {
        const filtered = this.apps.filter(app =>
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const container = document.querySelector('.button-container');
        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = '<p class="no-results">No apps found matching your search.</p>';
            return;
        }

        filtered.forEach((app, index) => {
            const button = this.createAppButton(app, index);
            container.appendChild(button);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portalManager = new PortalManager();
});

// Service Worker registration disabled - sw.js not implemented
// Uncomment when service worker is ready:
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js').catch(() => {});
// }