// Simple include loader: fetches HTML snippets and injects into placeholders
document.addEventListener('DOMContentLoaded', function() {
  async function loadInclude(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const res = await fetch(url, {cache: 'no-cache'});
      if (!res.ok) return;
      const html = await res.text();
      el.innerHTML = html;

      // Initialize menu functionality for included header
      if (selector === '#site-header') {
        initMenu();
      }
    } catch (err) {
      // fail silently; page still usable
      console.error('Include load failed:', url, err);
    }
  }

  function initMenu() {
    const navToggle = document.getElementById('navToggle');
    const siteNav = document.getElementById('siteNav');
    const mobileNav = document.getElementById('mobileNav');
    
    // Initialize retry counter on first call
    if (!initMenu.retries) initMenu.retries = 0;
    
    if (!navToggle || !siteNav) {
      initMenu.retries++;
      // Only retry up to 10 times (500ms total)
      if (initMenu.retries > 10) {
        console.warn('Menu elements not found after retries, giving up.');
        return;
      }
      console.warn('Menu elements not found, retrying... (' + initMenu.retries + ')');
      setTimeout(initMenu, 50); // Poll every 50ms until elements are available
      return;
    }
    
    // Reset retry counter on success
    initMenu.retries = 0;

    // Ensure the menu is closed by default
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');

    // Ensure the container is positioned so absolute dropdown is inside viewport
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) headerContainer.style.position = headerContainer.style.position || 'relative';

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      // Toggle mobile nav on small screens if available, otherwise toggle siteNav
      const useMobile = (window.innerWidth <= 900) && mobileNav;
      const targetNav = useMobile ? mobileNav : siteNav;
      if (!targetNav) return;
      const isOpen = targetNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      // Ensure dropdown max-height fits below the toggle
      if (isOpen) {
        const rect = targetNav.getBoundingClientRect();
        const available = window.innerHeight - rect.top - 16; // 16px margin
        targetNav.style.maxHeight = Math.max(120, Math.min(available, window.innerHeight - 80)) + 'px';
      } else {
        targetNav.style.maxHeight = '';
      }
    });

    // Close menus after clicking a link (handles both navs)
    [siteNav, mobileNav].forEach(navEl => {
      if (!navEl) return;
      navEl.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
          navEl.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      [siteNav, mobileNav].forEach(navEl => {
        if (!navEl) return;
        if (!navEl.contains(e.target) && !navToggle.contains(e.target) && navEl.classList.contains('open')) {
          navEl.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          navEl.style.maxHeight = '';
        }
      });
    });

    // Reset on resize
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        // ensure mobile nav closed on larger breakpoints
        if (mobileNav) mobileNav.classList.remove('open');
        if (siteNav) siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        if (siteNav) siteNav.style.maxHeight = '';
        if (mobileNav) mobileNav.style.maxHeight = '';
      }
    });
  }

  loadInclude('#site-header', 'includes/header.html');
  loadInclude('#site-footer', 'includes/footer.html');
  
  // Only initialize menu if navigation elements exist on the page
  if (document.getElementById('navToggle') && document.getElementById('siteNav')) {
    initMenu();
  }
});

// Reusable loader functions
function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.remove('d-none');
  }
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('d-none');
  }
}

// Authentication helpers: store/handle JWT and provide fetch wrapper
function _anhs_storeAuthData(data) {
  try {
    if (!data) return;
    if (window.API && typeof window.API.setAuth === 'function' && data.token && data.user) {
      window.API.setAuth(data.token, data.user);
    }
  } catch (e) {
    console.warn('Failed to store auth data', e);
  }
}

// Call to POST verify-code endpoint and persist returned token/user
async function handleVerifyAndStoreJwt(email, code, extra = {}) {
  const body = Object.assign({ email, code }, extra);
  if (!window.API || typeof window.API.request !== 'function') {
    throw new Error('API client unavailable');
  }

  const data = await window.API.request('/api/auth/verify-code', {
    method: 'POST',
    body,
    public: true
  });
  _anhs_storeAuthData(data);
  if (typeof window.onAnhsLogin === 'function') {
    try { window.onAnhsLogin(data.user || null); } catch(e) { console.warn('onAnhsLogin hook failed', e); }
  }
  return data;
}

// Fetch wrapper that attaches Authorization header automatically
window.anhsAuthFetch = function(input, init = {}) {
  init = Object.assign({}, init);
  init.headers = Object.assign({}, init.headers || {});
  const token = (window.API && typeof window.API.getToken === 'function' ? window.API.getToken() : null);
  if (token) init.headers['Authorization'] = 'Bearer ' + token;
  if (!init.headers['Content-Type'] && !(init.body instanceof FormData)) init.headers['Content-Type'] = 'application/json';
  init.credentials = 'include';
  return fetch(input, init);
};

window.anhsLogout = function() {
  if (window.API && typeof window.API.clearAuth === 'function') window.API.clearAuth();
  if (typeof window.onAnhsLogout === 'function') {
    try { window.onAnhsLogout(); } catch(e) { console.warn('onAnhsLogout hook failed', e); }
  }
};

