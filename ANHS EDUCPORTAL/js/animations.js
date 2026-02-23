// ANHS EDUCPORTAL Animations Script
// Handles scroll-triggered animations, interactions, and visual enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        // Initialize animations
        initScrollAnimations();
        initButtonInteractions();
        initCardAnimations();
        initParallaxEffect();
        initFloatingElements();
        initLoadingAnimations();
        initModalAnimations();
    }

    // Always initialize accessibility features
    initAccessibilityFeatures();
});

// Scroll-triggered fade-in animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate in on scroll
    // Exclude content sections to prevent interference with navigation
    const animateElements = document.querySelectorAll('.card, .section, .announcement-item, .student-card, .ql-card, .dashboard-card, .stat-box, .notification-item, .assignment-item, .schedule-item, .resource-item, .activity-item');
    animateElements.forEach(el => {
        // Only animate elements that are not initially hidden
        if (getComputedStyle(el).display !== 'none' && getComputedStyle(el).opacity !== '0') {
            observer.observe(el);
        }
    });
}

// Button and interactive element animations
function initButtonInteractions() {
    const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-secondary');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
    });
}

// Card hover and interaction animations
function initCardAnimations() {
    const cards = document.querySelectorAll('.card, .ql-card, .student-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) rotate(1deg)';
            this.style.boxShadow = '0 15px 35px rgba(23,106,58,0.2)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0deg)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        });
    });
}

// Parallax effect for hero sections
function initParallaxEffect() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        heroBg.style.transform = `translateY(${rate}px)`;
    });
}

// Floating background elements - Disabled to prevent interference with page loading
function initFloatingElements() {
    // Temporarily disabled to prevent blank screen issues
    // const container = document.querySelector('.main-content') || document.body;
    // const numElements = 8;

    // for (let i = 0; i < numElements; i++) {
    //     const element = document.createElement('div');
    //     element.className = 'floating-element';
    //     element.style.left = Math.random() * 100 + '%';
    //     element.style.top = Math.random() * 100 + '%';
    //     element.style.animationDelay = Math.random() * 4 + 's';
    //     element.style.animationDuration = (Math.random() * 2 + 3) + 's';
    //     container.appendChild(element);
    // }
}

// Loading animations for buttons and forms
function initLoadingAnimations() {
    // Add loading state to forms on submit
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"], .btn-primary');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
        });
    });
}

// Modal animations
function initModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('show', function() {
            this.style.display = 'block';
            setTimeout(() => {
                this.classList.add('show');
            }, 10);
        });

        modal.addEventListener('hide', function() {
            this.classList.remove('show');
            setTimeout(() => {
                this.style.display = 'none';
            }, 300);
        });
    });
}

// Accessibility features
function initAccessibilityFeatures() {
    // Add focus animations
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    focusableElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid #ffd600';
            this.style.outlineOffset = '2px';
        });

        el.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility function to add glow effect
function addGlowEffect(element, color = '#ffd600') {
    element.style.boxShadow = `0 0 20px ${color}40, 0 0 40px ${color}20`;
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 1000);
}

// Export functions for potential use in other scripts
window.ANHSAnimations = {
    addGlowEffect,
    initScrollAnimations,
    initButtonInteractions,
    initCardAnimations
};
