// Dashboard Data Loader - Fetches all data from backend API

const PRODUCTION_API_URL = 'https://anhs-educportal.onrender.com';
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

async function apiFetch(endpoint) {
    const authToken = (window.API && typeof window.API.getToken === 'function' ? window.API.getToken() : null);

    if (!API_BASE_URL) {
        throw new Error('API base URL is not configured');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || `Request failed: ${response.status}`);
    }
    return data;
}

// Load hero statistics
async function loadHeroStats() {
    try {
        const data = await apiFetch('/api/stats/hero');
        
        if (data.success && data.data) {
            document.getElementById('stat-students').textContent = data.data.students.toLocaleString() + '+';
            document.getElementById('stat-graduation').textContent = Number.isFinite(data.data.graduationRate)
                ? `${data.data.graduationRate}%`
                : 'N/A';
            document.getElementById('stat-faculty').textContent = data.data.faculty + '+';
            document.getElementById('stat-programs').textContent = data.data.programs + '+';
        }
    } catch (error) {
        console.error('Failed to load hero stats:', error);
        // Keep default values if API fails
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const data = await apiFetch('/api/stats/dashboard');
        
        if (data.success && data.data) {
            const counts = data.data.counts;
            
            // Update stats if elements exist
            const statElements = {
                'dashboard-students': counts.students,
                'dashboard-teachers': counts.teachers,
                'dashboard-programs': counts.programs,
                'dashboard-awards': counts.news // Using news count as placeholder
            };
            
            Object.entries(statElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value ? value.toLocaleString() : '0';
                }
            });
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Load programs from API
async function loadPrograms() {
    try {
        const data = await apiFetch('/api/programs');
        
        const container = document.getElementById('programs-container');
        if (!container) return;
        
        if (Array.isArray(data) && data.length > 0) {
            container.innerHTML = data.map(program => `
                <div class="swiper-slide">
                    <div class="program-card">
                        <div class="program-image">
                            <img src="${program.image || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'}" alt="${program.name}">
                            <div class="program-badge">${program.code || 'JHS'}</div>
                        </div>
                        <div class="program-content">
                            <h3>${program.name}</h3>
                            <p>${program.description}</p>
                            <ul class="program-features">
                                ${(program.features || []).map(f => `<li><i class="bi bi-check-circle"></i> ${f}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Reinitialize Swiper
            if (window.swiper) {
                window.swiper.update();
            }
        } else {
            container.innerHTML = '<p class="text-center">No programs available at the moment.</p>';
        }
    } catch (error) {
        console.error('Failed to load programs:', error);
        const container = document.getElementById('programs-container');
        if (container) {
            container.innerHTML = '<p class="text-center text-danger">Failed to load programs. Please try again later.</p>';
        }
    }
}

// Load news from API
async function loadNews() {
    try {
        const data = await apiFetch('/api/news');
        
        const container = document.getElementById('news-container');
        if (!container) return;
        
        if (Array.isArray(data) && data.length > 0) {
            container.innerHTML = data.slice(0, 3).map((news, index) => `
                <div class="news-card" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                    <div class="news-image">
                        <img src="${news.image || 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'}" alt="${news.title}">
                        <div class="news-category">${news.category || 'General'}</div>
                    </div>
                    <div class="news-content">
                        <h3>${news.title}</h3>
                        <p>${news.summary || news.content?.substring(0, 150) + '...' || 'No content available'}</p>
                        <div class="news-meta">
                            <span><i class="bi bi-calendar"></i> ${new Date(news.createdAt || news.date).toLocaleDateString()}</span>
                            <span><i class="bi bi-eye"></i> ${news.views || 0} Views</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-center">No news available at the moment.</p>';
        }
    } catch (error) {
        console.error('Failed to load news:', error);
        const container = document.getElementById('news-container');
        if (container) {
            container.innerHTML = '<p class="text-center text-danger">Failed to load news. Please try again later.</p>';
        }
    }
}

// Load events from API
async function loadEvents() {
    try {
        const data = await apiFetch('/api/events');
        
        const container = document.getElementById('events-container');
        if (!container) return;
        
        if (Array.isArray(data) && data.length > 0) {
            container.innerHTML = data.slice(0, 4).map((event, index) => `
                <div class="timeline-item" data-aos="${index % 2 === 0 ? 'fade-right' : 'fade-left'}">
                    <div class="timeline-content">
                        <div class="timeline-date">${formatEventDate(event.startDate)}</div>
                        <h3>${event.title}</h3>
                        <p>${event.description || 'No description available'}</p>
                        <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
                        <p><strong>Time:</strong> ${event.time || 'TBA'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-center">No upcoming events at the moment.</p>';
        }
    } catch (error) {
        console.error('Failed to load events:', error);
        const container = document.getElementById('events-container');
        if (container) {
            container.innerHTML = '<p class="text-center text-danger">Failed to load events. Please try again later.</p>';
        }
    }
}

// Format event date
function formatEventDate(dateString) {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Store chart instances for cleanup
window.dashboardCharts = window.dashboardCharts || {};

// Initialize charts with API data
async function initializeCharts() {
    try {
        const data = await apiFetch('/api/stats/charts');

        // Program Distribution Chart
        const programCtx = document.getElementById('programDistributionChart');
        if (programCtx && Array.isArray(data.data?.enrollmentByGrade) && data.data.enrollmentByGrade.length > 0) {
            // Destroy existing chart if present
            if (window.dashboardCharts['program']) {
                window.dashboardCharts['program'].destroy();
            }
            const enrollmentData = data.data.enrollmentByGrade;
            window.dashboardCharts['program'] = new Chart(programCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: enrollmentData.map(e => e._id),
                    datasets: [{
                        data: enrollmentData.map(e => e.count),
                        backgroundColor: ['#1a6633', '#2d8b4a', '#ffd700', '#b88b2f'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }

        // Grade Distribution Chart
        const placementCtx = document.getElementById('placementChart');
        if (placementCtx && Array.isArray(data.data?.gradeDistribution) && data.data.gradeDistribution.length > 0) {
            // Destroy existing chart if present
            if (window.dashboardCharts['placement']) {
                window.dashboardCharts['placement'].destroy();
            }
            const gradeDistribution = data.data.gradeDistribution;
            window.dashboardCharts['placement'] = new Chart(placementCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: gradeDistribution.map(g => g._id),
                    datasets: [{
                        label: 'Grade Count',
                        data: gradeDistribution.map(g => g.count),
                        backgroundColor: '#1a6633',
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Failed to initialize charts:', error);
    }
}

// Initialize all dashboard data
async function initializeDashboard() {
    console.log('Initializing dashboard with backend data...');
    
    // Load all data in parallel
    await Promise.all([
        loadHeroStats(),
        loadDashboardStats(),
        loadPrograms(),
        loadNews(),
        loadEvents(),
        initializeCharts()
    ]);
    
    console.log('Dashboard initialization complete');
}

// Export for use in other scripts
window.Dashboard = {
    initialize: initializeDashboard,
    loadHeroStats,
    loadDashboardStats,
    loadPrograms,
    loadNews,
    loadEvents,
    initializeCharts
};
