﻿// ANHS EduPortal API Client
// Handles all API communications and authentication

// Configuration: Set your production backend URL here after deploying to Render/Railway
const PRODUCTION_API_URL = 'https://anhs-educportal.onrender.com'; // e.g., 'https://anhs-backend.onrender.com'
const HOSTNAME = window.location.hostname;
const IS_FILE_PROTOCOL = window.location.protocol === 'file:';
const IS_LOOPBACK = ['localhost', '127.0.0.1', '::1'].includes(HOSTNAME);
const IS_PRIVATE_IPV4 = /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(HOSTNAME);
const IS_LOCAL_NETWORK_HOST = IS_FILE_PROTOCOL || IS_LOOPBACK || IS_PRIVATE_IPV4 || HOSTNAME.endsWith('.local');
const LOCAL_API_URL = IS_FILE_PROTOCOL
    ? 'http://localhost:5000'
    : `http://${HOSTNAME || 'localhost'}:5000`;

const API_BASE_URL = window.ANHS_API_BASE_URL
    || (IS_LOCAL_NETWORK_HOST ? LOCAL_API_URL : '')
    || PRODUCTION_API_URL
    || '';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.isLocalDev = IS_LOCAL_NETWORK_HOST;
        this.token = null;
        this.csrfToken = null;
        this.user = null;
        this._sessionPromise = null;
    }

    sanitizePayload(value) {
        if (Array.isArray(value)) {
            return value.map((item) => this.sanitizePayload(item));
        }

        const isFile = typeof File !== 'undefined' && value instanceof File;
        const isBlob = typeof Blob !== 'undefined' && value instanceof Blob;
        const isFormData = typeof FormData !== 'undefined' && value instanceof FormData;

        if (value && typeof value === 'object' && !(value instanceof Date) && !isFile && !isBlob && !isFormData) {
            return Object.fromEntries(
                Object.entries(value)
                    .filter(([, entry]) => entry !== null && entry !== undefined)
                    .map(([key, entry]) => [key, this.sanitizePayload(entry)])
            );
        }

        return value;
    }

    // Authentication methods
    async login(email, password, role = null, invitationCode = null) {
        try {
            const payload = this.sanitizePayload({ email, password, role, invitationCode });
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            this.setAuth(data.token, data.user, data.csrfToken);
            return data;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    }

    async register(
        name,
        email,
        password,
        role = 'student',
        inviteToken = null,
        firstName = null,
        lastName = null,
        extra = {}
    ) {
        try {
            const payload = this.sanitizePayload({ name, email, password, role, inviteToken, firstName, lastName, ...extra });
            const response = await fetch(`${this.baseURL}/api/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            this.setAuth(data.token, data.user, data.csrfToken);
            return data;
        } catch (error) {
            console.error('Register API error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            if (this.baseURL) {
                await fetch(`${this.baseURL}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
        this.clearAuth();
    }

    // Content and forms (authenticated)
    announcements = this.buildCrud('/api/announcements');
    news = this.buildCrud('/api/news');
    events = this.buildCrud('/api/events');
    programs = this.buildCrud('/api/programs');
    admissions = this.buildCrud('/api/admissions');
    admissionsTracking = {
        async lookup(reference, email) {
            const query = `reference=${encodeURIComponent(reference || '')}&email=${encodeURIComponent(email || '')}`;
            return window.API.request(`/api/admissions/track?${query}`, { public: true });
        }
    };
    contacts = this.buildCrud('/api/contacts', { noUpdate: true });
    preferences = {
        async get() {
            return window.API.request('/api/auth/preferences');
        },
        async update(preferences) {
            return window.API.request('/api/auth/preferences', { method: 'PUT', body: { preferences } });
        }
    };

    // Admin/Staff resources
    users = this.buildCrud('/api/users');
    students = this.buildCrud('/api/students');
    studentsMe = {
        async get() {
            return window.API.request('/api/students/me');
        },
        async update(data) {
            return window.API.request('/api/students/me', { method: 'PUT', body: data });
        }
    };
    teachers = this.buildCrud('/api/teachers');
    classes = this.buildCrud('/api/classes');
    enrollments = this.buildCrud('/api/enrollments');
    attendance = this.buildCrud('/api/attendance');
    attendanceMy = {
        async list() {
            return window.API.request('/api/attendance/my');
        }
    };
    attendanceByStudent = {
        async list(studentId) {
            return window.API.request(`/api/attendance/by-student/${studentId}`);
        }
    };
    grades = this.buildCrud('/api/grades');
    gradesMy = {
        async list() {
            return window.API.request('/api/grades/my');
        }
    };
    gradesByStudent = {
        async list(studentId) {
            return window.API.request(`/api/grades/by-student/${studentId}`);
        }
    };
    parents = this.buildCrud('/api/parents');
    parentsMe = {
        async get() {
            return window.API.request('/api/parents/me');
        },
        async update(data) {
            return window.API.request('/api/parents/me', { method: 'PUT', body: data });
        }
    };
    assignments = this.buildCrud('/api/assignments');
    assignmentsMy = {
        async list() {
            return window.API.request('/api/assignments/my');
        }
    };
    assignmentsMySubmissions = {
        async list() {
            return window.API.request('/api/assignments/my-submissions');
        }
    };
    assignmentsSubmit = {
        async submit(id, file = null) {
            if (file) {
                const form = new FormData();
                form.append('file', file);
                return window.API.request(`/api/assignments/${id}/submit`, { method: 'POST', body: form });
            }
            return window.API.request(`/api/assignments/${id}/submit`, { method: 'POST' });
        }
    };
    assignmentsSubmissions = {
        async list(id) {
            return window.API.request(`/api/assignments/${id}/submissions`);
        },
        async grade(id, data) {
            return window.API.request(`/api/assignments/submissions/${id}`, { method: 'PATCH', body: data });
        }
    };
    schedule = this.buildCrud('/api/schedule');
    scheduleMy = {
        async list() {
            return window.API.request('/api/schedule/my');
        }
    };

    invites = {
        async create(email, role) {
            return window.API.request('/api/invites', { method: 'POST', body: { email, role } });
        },
        async validate(token) {
            return window.API.request(`/api/invites/validate/${token}`, { public: true });
        },
        async list() {
            return window.API.request('/api/invites');
        }
    };

    parentLinks = {
        async request(studentId) {
            return window.API.request('/api/parent-links/request', { method: 'POST', body: { studentId } });
        },
        async myLinks() {
            return window.API.request('/api/parent-links/me');
        },
        async approve(id) {
            return window.API.request(`/api/parent-links/${id}/approve`, { method: 'POST' });
        },
        async reject(id) {
            return window.API.request(`/api/parent-links/${id}/reject`, { method: 'POST' });
        }
    };
    parentMessages = {
        async listMy() {
            return window.API.request('/api/parent-messages/me');
        },
        async send(data) {
            return window.API.request('/api/parent-messages/me', { method: 'POST', body: data });
        },
        async markRead(id) {
            return window.API.request(`/api/parent-messages/me/${id}/read`, { method: 'PATCH' });
        },
        async listAll(parentId = null) {
            const qs = parentId ? `?parentId=${encodeURIComponent(parentId)}` : '';
            return window.API.request(`/api/parent-messages${qs}`);
        },
        async reply(parentId, data) {
            return window.API.request(`/api/parent-messages/${parentId}/reply`, { method: 'POST', body: data });
        }
    };

    uploads = {
        async upload(file) {
            const form = new FormData();
            form.append('file', file);
            return window.API.request('/api/uploads', { method: 'POST', body: form });
        },
        async list() {
            return window.API.request('/api/uploads');
        },
        async remove(id) {
            return window.API.request(`/api/uploads/${id}`, { method: 'DELETE' });
        },
        async downloadUrl(id) {
            return `${this.baseURL}/api/uploads/${id}/download`;
        }
    };

    buildCrud(basePath, options = {}) {
        return {
            async create(data) {
                return window.API.request(basePath, { method: 'POST', body: data });
            },
            async list() {
                return window.API.request(basePath);
            },
            async get(id) {
                return window.API.request(`${basePath}/${id}`);
            },
            async update(id, data) {
                if (options.noUpdate) throw new Error('Update not supported');
                return window.API.request(`${basePath}/${id}`, { method: 'PUT', body: data });
            },
            async remove(id) {
                return window.API.request(`${basePath}/${id}`, { method: 'DELETE' });
            }
        };
    }

    // Generic request method with auth
    async request(endpoint, options = {}) {
        if (!this.baseURL) {
            throw new Error('API base URL is not configured. Set window.ANHS_API_BASE_URL or PRODUCTION_API_URL in js/api.js');
        }

        const url = `${this.baseURL}${endpoint}`;
        const method = (options.method || 'GET').toUpperCase();

        const headers = { ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token && !options.public) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (!options.public && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            const csrfToken = await this.ensureCsrfToken();
            if (csrfToken) headers['x-csrf-token'] = csrfToken;
        }

        const finalOptions = { ...options, headers, credentials: 'include' };

        if (finalOptions.body && typeof finalOptions.body === 'object' && !(finalOptions.body instanceof FormData)) {
            finalOptions.body = JSON.stringify(this.sanitizePayload(finalOptions.body));
        }

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json().catch(() => null);

            if (response.status === 401 && !options.public) {
                console.warn('Unauthorized, clearing auth');
                this.clearAuth();
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                throw new Error(data?.message || `Request failed: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Auth management
    setAuth(token, user, csrfToken = null) {
        this.token = token;
        this.user = user;
        if (csrfToken) this.csrfToken = csrfToken;
    }

    clearAuth() {
        this.token = null;
        this.csrfToken = null;
        this.user = null;
        this._sessionPromise = null;
    }

    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    async ensureSession(force = false) {
        if (!this.baseURL) {
            throw new Error('API base URL is not configured. Set window.ANHS_API_BASE_URL or PRODUCTION_API_URL in js/api.js');
        }

        if (!force && this.user) return this.user;
        if (!force && this._sessionPromise) return this._sessionPromise;

        this._sessionPromise = (async () => {
            const response = await fetch(`${this.baseURL}/api/auth/me`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.user) {
                this.clearAuth();
                throw new Error('Session expired. Please login again.');
            }

            this.user = data.user;
            if (data.csrfToken) this.csrfToken = data.csrfToken;
            return this.user;
        })();

        try {
            return await this._sessionPromise;
        } finally {
            this._sessionPromise = null;
        }
    }

    async ensureCsrfToken(force = false) {
        if (!this.baseURL) {
            throw new Error('API base URL is not configured. Set window.ANHS_API_BASE_URL or PRODUCTION_API_URL in js/api.js');
        }
        if (!force && this.csrfToken) return this.csrfToken;

        const response = await fetch(`${this.baseURL}/api/auth/csrf`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) return null;

        this.csrfToken = data?.csrfToken || null;
        return this.csrfToken;
    }
}

window.API = new APIClient();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
