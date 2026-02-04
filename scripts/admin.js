// 32Gamers Admin Panel - App Management
import './firebase-config.js';

let apps = [];
let editingIndex = -1;
let currentUser = null;

// Authentication
firebase.auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showUserSection(user);
        loadApps();
    } else {
        currentUser = null;
        showLoginSection();
    }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        showStatus('Opening sign-in popup...', 'info');
        const result = await firebase.signInWithPopup(firebase.auth, firebase.provider);
        showStatus('Sign-in successful!', 'success');
    } catch (error) {
        console.error('Auth error:', error);
        if (error.code === 'auth/popup-blocked') {
            showStatus('Popup blocked! Please allow popups for this site and try again.', 'error');
        } else if (error.code === 'auth/popup-closed-by-user') {
            showStatus('Sign-in cancelled.', 'info');
        } else if (error.code === 'auth/network-request-failed') {
            showStatus('Network error. Check your connection and try again.', 'error');
        } else {
            showStatus(`Login failed: ${error.message}`, 'error');
        }
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await firebase.signOut(firebase.auth);
    } catch (error) {
        showStatus(`Logout failed: ${error.message}`, 'error');
    }
});

function showLoginSection() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('userSection').classList.add('hidden');
}

function showUserSection(user) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('userSection').classList.remove('hidden');

    document.getElementById('userAvatar').src = user.photoURL || '';
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('userEmail').textContent = user.email || '';
}

// Input Validation
function validateAppData(data) {
    // Check required fields
    if (!data.appId || !data.name || !data.url || !data.image || !data.description) {
        return 'Please fill in all fields';
    }

    // App ID: alphanumeric, hyphens, underscores only (no spaces or special chars)
    const appIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!appIdPattern.test(data.appId)) {
        return 'App ID must contain only letters, numbers, hyphens, and underscores';
    }
    if (data.appId.length > 50) {
        return 'App ID must be 50 characters or less';
    }

    // URL validation: must be relative path or valid http(s) URL, no javascript:
    const dangerousPattern = /^(javascript|data|vbscript):/i;
    if (dangerousPattern.test(data.url)) {
        return 'Invalid URL format (security restriction)';
    }
    // Allow relative URLs or absolute http(s) URLs
    const validUrlPattern = /^(https?:\/\/[^\s<>"']+|[a-zA-Z0-9_\-./]+)$/;
    if (!validUrlPattern.test(data.url)) {
        return 'Invalid URL format';
    }
    if (data.url.length > 200) {
        return 'URL must be 200 characters or less';
    }

    // Image: should be a filename, no path traversal
    const imagePattern = /^[a-zA-Z0-9_\-]+\.(png|jpg|jpeg|gif|webp|svg)$/i;
    if (!imagePattern.test(data.image)) {
        return 'Image must be a valid filename (e.g., my-icon.png)';
    }
    if (data.image.length > 100) {
        return 'Image filename must be 100 characters or less';
    }

    // Name length
    if (data.name.length > 100) {
        return 'App name must be 100 characters or less';
    }

    // Description length
    if (data.description.length > 500) {
        return 'Description must be 500 characters or less';
    }

    return null; // Valid
}

// App Management
async function loadApps() {
    try {
        showStatus('Loading apps...', 'info');
        const querySnapshot = await firebase.getDocs(firebase.collection(firebase.db, 'apps'));
        apps = [];
        querySnapshot.forEach((doc) => {
            apps.push({ id: doc.id, ...doc.data() });
        });
        renderApps();
        showStatus('Apps loaded successfully!', 'success');
    } catch (error) {
        console.error('Load error:', error);
        if (error.code === 'unavailable') {
            showStatus('Network error. Please check your connection and try again.', 'error');
        } else if (error.code === 'permission-denied') {
            showStatus('Permission denied. Please sign in as admin.', 'error');
        } else if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            showStatus('Request blocked by ad blocker. Please disable it for this site.', 'error');
        } else {
            showStatus(`Failed to load apps: ${error.message}`, 'error');
        }
    }
}

async function addApp() {
    if (!currentUser) {
        showStatus('Please login first', 'error');
        return;
    }

    const newApp = {
        appId: document.getElementById('appId').value.trim(),
        name: document.getElementById('appName').value.trim(),
        url: document.getElementById('appUrl').value.trim(),
        image: document.getElementById('appImage').value.trim(),
        description: document.getElementById('appDescription').value.trim(),
        createdAt: firebase.serverTimestamp(),
        createdBy: currentUser.email
    };

    // Validate all input
    const validationError = validateAppData(newApp);
    if (validationError) {
        showStatus(validationError, 'error');
        return;
    }

    try {
        if (editingIndex === -1) {
            // Adding new app
            if (apps.find(app => app.appId === newApp.appId)) {
                showStatus('App ID already exists', 'error');
                return;
            }
            await firebase.setDoc(firebase.doc(firebase.db, 'apps', newApp.appId), newApp);
            showStatus('App added successfully!', 'success');
        } else {
            // Editing existing app
            const existingApp = apps[editingIndex];
            await firebase.setDoc(firebase.doc(firebase.db, 'apps', existingApp.appId), {
                ...newApp,
                createdAt: existingApp.createdAt,
                createdBy: existingApp.createdBy,
                updatedAt: firebase.serverTimestamp(),
                updatedBy: currentUser.email
            });
            showStatus('App updated successfully!', 'success');
            cancelEdit();
        }

        loadApps();
        clearForm();
    } catch (error) {
        showStatus(`Failed to save app: ${error.message}`, 'error');
    }
}

function editApp(index) {
    const app = apps[index];
    editingIndex = index;

    document.getElementById('appId').value = app.appId;
    document.getElementById('appName').value = app.name;
    document.getElementById('appUrl').value = app.url;
    document.getElementById('appImage').value = app.image;
    document.getElementById('appDescription').value = app.description;

    document.getElementById('addButton').textContent = 'Update App';
    document.getElementById('cancelButton').classList.remove('cancel-button');
    document.querySelector('#appManagement h3').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    editingIndex = -1;
    document.getElementById('addButton').textContent = 'Add App';
    document.getElementById('cancelButton').classList.add('cancel-button');
    clearForm();
}

function clearForm() {
    ['appId', 'appName', 'appUrl', 'appImage', 'appDescription'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

async function removeApp(index) {
    if (!confirm('Remove this app?')) return;

    try {
        const app = apps[index];
        await firebase.deleteDoc(firebase.doc(firebase.db, 'apps', app.appId));
        showStatus('App removed successfully!', 'success');
        loadApps();
    } catch (error) {
        showStatus(`Failed to remove app: ${error.message}`, 'error');
    }
}

function renderApps() {
    const appList = document.getElementById('appList');
    appList.innerHTML = '';

    if (apps.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'text-align: center; opacity: 0.7;';
        emptyMsg.textContent = 'No apps found. Add your first app above!';
        appList.appendChild(emptyMsg);
        return;
    }

    apps.forEach((app, index) => {
        const appDiv = document.createElement('div');
        appDiv.className = 'app-item';

        // Info section (XSS-safe using textContent)
        const infoDiv = document.createElement('div');
        const nameEl = document.createElement('strong');
        nameEl.textContent = app.name;
        const descEl = document.createElement('small');
        descEl.textContent = app.description;
        infoDiv.appendChild(nameEl);
        infoDiv.appendChild(document.createElement('br'));
        infoDiv.appendChild(descEl);

        // Buttons section (using data attributes instead of inline onclick)
        const btnDiv = document.createElement('div');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-secondary';
        editBtn.textContent = 'Edit';
        editBtn.dataset.action = 'edit';
        editBtn.dataset.index = index;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-danger';
        removeBtn.textContent = 'Remove';
        removeBtn.dataset.action = 'remove';
        removeBtn.dataset.index = index;

        btnDiv.appendChild(editBtn);
        btnDiv.appendChild(removeBtn);

        appDiv.appendChild(infoDiv);
        appDiv.appendChild(btnDiv);
        appList.appendChild(appDiv);
    });
}

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '';
    const msgDiv = document.createElement('div');
    msgDiv.className = `status-message ${type}`;
    msgDiv.textContent = message;
    statusDiv.appendChild(msgDiv);
    setTimeout(() => statusDiv.innerHTML = '', 5000);
}

// Event delegation for app list buttons (no more global onclick handlers)
document.getElementById('appList').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (btn.dataset.action === 'edit') editApp(index);
    if (btn.dataset.action === 'remove') removeApp(index);
});

// Form button event listeners
document.getElementById('addButton').addEventListener('click', addApp);
document.getElementById('cancelButton').addEventListener('click', cancelEdit);
