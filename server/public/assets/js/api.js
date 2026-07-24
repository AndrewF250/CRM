/**
 * CRM API Client with Authentication
 */
const API = {
    baseUrl: '/api',
    token: localStorage.getItem('crm_token'),

    setToken(token) {
        this.token = token;
        localStorage.setItem('crm_token', token);
    },

    clearToken() {
        this.token = null;
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
    },

    getCurrentUser() {
        const user = localStorage.getItem('crm_user');
        return user ? JSON.parse(user) : null;
    },

    saveUser(user) {
        localStorage.setItem('crm_user', JSON.stringify(user));
    },

    isLoggedIn() {
        return !!this.token;
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    },

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/pages/login.html';
                return null;
            }
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }
            return await response.json();
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    },

    // Auth
    async login(username, password, remember = true) {
        const result = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, remember })
        });
        if (result && result.token) {
            this.setToken(result.token);
            this.saveUser(result.user);
        }
        return result;
    },

    async logout() {
        try { await this.request('/logout', { method: 'POST' }); } catch (err) {}
        this.clearToken();
        window.location.href = '/pages/login.html';
    },

    async checkAuth() {
        try { return (await this.request('/auth/me'))?.user; } catch (err) { return null; }
    },

    // Projects
    async getProjects() { return this.request('/projects'); },
    async getProject(id) { return this.request(`/projects/${id}`); },
    async createProject(data) { return this.request('/projects', { method: 'POST', body: JSON.stringify(data) }); },
    async updateProject(id, data) { return this.request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteProject(id) { return this.request(`/projects/${id}`, { method: 'DELETE' }); },

    // Hashtags
    async gethashtags() { return this.request('/hashtags'); },

    // Tasks
    async getTasks(projectId = null) {
        const query = projectId ? `?project_id=${projectId}` : '';
        return this.request(`/tasks${query}`);
    },
    async createTask(data) { return this.request('/tasks', { method: 'POST', body: JSON.stringify(data) }); },
    async updateTask(id, data) { return this.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteTask(id) { return this.request(`/tasks/${id}`, { method: 'DELETE' }); },

    // Subtasks
    async getSubtasks(taskId) { return this.request(`/tasks/${taskId}/subtasks`); },
    async createSubtask(data) { return this.request('/subtasks', { method: 'POST', body: JSON.stringify(data) }); },
    async updateSubtask(id, data) { return this.request(`/subtasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteSubtask(id) { return this.request(`/subtasks/${id}`, { method: 'DELETE' }); },

    // Documents
    async getDocuments(projectId = null) {
        const query = projectId ? `?project_id=${projectId}` : '';
        return this.request(`/documents${query}`);
    },
    async addDocument(data) { return this.request('/documents', { method: 'POST', body: JSON.stringify(data) }); },
    async deleteDocument(id) { return this.request(`/documents/${id}`, { method: 'DELETE' }); },

    // Calls
    async getCalls(projectId = null) {
        const query = projectId ? `?project_id=${projectId}` : '';
        return this.request(`/calls${query}`);
    },
    async addCall(data) { return this.request('/calls', { method: 'POST', body: JSON.stringify(data) }); },
    async deleteCall(id) { return this.request(`/calls/${id}`, { method: 'DELETE' }); },

    // Activity
    async getActivity(projectId = null, limit = 50) {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        params.append('limit', limit);
        return this.request(`/activity?${params.toString()}`);
    },

    // Stats
    async getStats() { return this.request('/stats'); }
};

// Toast
function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 24px;border-radius:10px;font-size:0.9rem;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:opacity 0.3s;';
    t.style.background = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

// Modals
function openModal(id) {
    const el = document.getElementById(id);
    const overlay = document.getElementById('modalOverlay');
    if (!el || !overlay) return;
    if (!overlay.contains(el)) { overlay.innerHTML = ''; overlay.appendChild(el); }
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}
