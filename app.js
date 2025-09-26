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

    async loadApps() {
        try {
            // Try multiple sources for maximum reliability
            const sources = [
                // 1. Try GitHub raw file (if configured)
                this.getGitHubUrl(),
                // 2. Try local JSON file
                'apps.json',
                // 3. Try with cachebuster
                `apps.json?v=${Date.now()}`
            ].filter(Boolean);

            let data = null;
            for (const url of sources) {
                try {
                    console.log(`Trying to load from: ${url}`);
                    const response = await fetch(url);
                    if (response.ok) {
                        data = await response.json();
                        console.log(`Successfully loaded from: ${url}`);
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to load from ${url}:`, e);
                    continue;
                }
            }

            if (data && data.apps) {
                this.apps = data.apps;
                // Update page title if provided
                if (data.title) {
                    const h1 = document.querySelector('h1');
                    if (h1) h1.textContent = data.title;
                }
            } else {
                throw new Error('No valid data source found');
            }
        } catch (error) {
            console.error('Failed to load apps from all sources:', error);
            // Fallback to hardcoded apps if all sources fail
            this.loadFallbackApps();
        }
    }

    getGitHubUrl() {
        // You can configure this for GitHub Pages or raw file access
        // Example: 'https://raw.githubusercontent.com/yourusername/32gamers/main/apps.json'
        const githubConfig = window.GITHUB_CONFIG || {};
        if (githubConfig.repo) {
            return `https://raw.githubusercontent.com/${githubConfig.repo}/main/apps.json`;
        }
        return null;
    }

    loadFallbackApps() {
        console.log('Loading fallback apps...');
        this.apps = [
            {
                "id": "traveller",
                "name": "Traveller App",
                "url": "TravellerApp/index.html",
                "image": "TravellerApp.png",
                "description": "Character generator and game tools for Traveller RPG"
            },
            {
                "id": "mmrpg",
                "name": "MMRPG App",
                "url": "MMRPGApp/index.html",
                "image": "MMRPG.png",
                "description": "Tools and utilities for MMRPG campaigns"
            },
            {
                "id": "knight",
                "name": "KnightRPG App",
                "url": "KnightRPG/index.html",
                "image": "knight_tarot.png",
                "description": "Character tools for KnightRPG system"
            },
            {
                "id": "baa",
                "name": "BAA Campaign",
                "url": "BAA/index.html",
                "image": "BAA.png",
                "description": "Boston Avenger RPG Campaign resources"
            },
            {
                "id": "rogues",
                "name": "The Rogues Gallery",
                "url": "theRoguesGallery/index.html",
                "image": "theRoguesGallery.png",
                "description": "Character gallery and NPC resources"
            },
            {
                "id": "converter",
                "name": "5e to Daggerheart Converter",
                "url": "5eConverter/index.html",
                "image": "5eConvert.png",
                "description": "Convert D&D 5e content to Daggerheart system"
            }
        ];
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
            <img src="${app.image}" alt="${app.name}" onerror="this.src='placeholder.png'"/>
            <span>${app.name}</span>
        `;

        // Add click tracking
        button.addEventListener('click', (e) => {
            this.trackAppClick(app.id, app.name);
        });

        return button;
    }

    trackAppClick(appId, appName) {
        // Simple analytics - could be expanded
        if (typeof gtag !== 'undefined') {
            gtag('event', 'app_click', {
                'app_id': appId,
                'app_name': appName
            });
        }
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

    // Admin functions (for future admin panel)
    async addApp(appData) {
        // This would be used by an admin interface
        this.apps.push(appData);
        this.renderApps();
        // In a real implementation, this would save to server/localStorage
    }

    async removeApp(appId) {
        this.apps = this.apps.filter(app => app.id !== appId);
        this.renderApps();
    }

    async updateApp(appId, newData) {
        const index = this.apps.findIndex(app => app.id === appId);
        if (index !== -1) {
            this.apps[index] = { ...this.apps[index], ...newData };
            this.renderApps();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portalManager = new PortalManager();
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}