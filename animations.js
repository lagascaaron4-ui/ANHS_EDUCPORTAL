// Enhanced Animations for ANHS EduPortal

class AnimationController {
    constructor() {
        this.observers = [];
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupIntersectionObserver();
        this.setupParallaxEffects();
        this.setupHoverAnimations();
        this.setupLoadingAnimations();
        this.setupAccessibility();
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.triggerStaggerAnimation(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.card, .ql-card, .section, .hero-content').forEach(el => {
            observer.observe(el);
        });
    }

    // Intersection Observer for performance
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementInView(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
    }

    handleElementInView(element) {
        // Add specific animations based on element type
        if (element.classList.contains('card')) {
            this.animateCard(element);
        } else if (element.classList.contains('ql-card')) {
            this.animateQuickLink(element);
        }
    }

    // Parallax effects for hero section
    setupParallaxEffects() {
        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const heroBg = document.querySelector('.hero-bg');

            if (heroBg) {
                const rate = scrolled * -0.5;
                heroBg.style.transform = `translateY(${rate}px)`;
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    // Enhanced hover animations
    setupHoverAnimations() {
        // Magnetic effect for buttons
        document.querySelectorAll('.btn, .ql-card').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0px, 0px) scale(1)';
            });
        });

        // Ripple effect for buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // Loading animations
    setupLoadingAnimations() {
        // Page load animation
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            this.animatePageLoad();
        });

        // Loading states for forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
            });
        });
    }

    animatePageLoad() {
        // Stagger animation for hero elements
        const heroElements = document.querySelectorAll('.hero-title, .hero-desc, .hero-buttons .btn');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
            el.classList.add('fade-in-up');
        });

        // Animate quick links with stagger
        const quickLinks = document.querySelectorAll('.ql-card');
        quickLinks.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in-up');
        });
    }

    // Stagger animations for card containers
    triggerStaggerAnimation(container) {
        const cards = container.querySelectorAll('.card, .ql-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Individual card animations
    animateCard(card) {
        card.style.animation = 'slideInUp 0.6s ease-out forwards';
    }

    animateQuickLink(card) {
        card.style.animation = 'bounceIn 0.5s ease-out forwards';
    }

    // Accessibility features
    setupAccessibility() {
        // Reduced motion support
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            this.disableAnimations();
        }

        // Focus animations
        document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focus-ring');
            });

            element.addEventListener('blur', () => {
                element.classList.remove('focus-ring');
            });
        });
    }

    disableAnimations() {
        document.documentElement.style.setProperty('--transition-fast', '0s');
        document.documentElement.style.setProperty('--transition-medium', '0s');
    }

    // Utility methods
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';

        const start = performance.now();

        const fade = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = '1';
            }
        };

        requestAnimationFrame(fade);
    }

    slideUp(element, duration = 300) {
        const height = element.offsetHeight;
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';

        const start = performance.now();

        const slide = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;

            if (progress < 1) {
                element.style.height = `${height * progress}px`;
                requestAnimationFrame(slide);
            } else {
                element.style.height = `${height}px`;
                element.style.overflow = '';
            }
        };

        requestAnimationFrame(slide);
    }

    // Modal animations
    animateModal(modal) {
        modal.style.animation = 'modalBounceIn 0.5s ease-out';
    }

    // Carousel animations
    setupCarouselAnimations() {
        const carousels = document.querySelectorAll('.carousel');

        carousels.forEach(carousel => {
            const items = carousel.querySelectorAll('.carousel-item');
            let currentIndex = 0;

            const showItem = (index) => {
                items.forEach((item, i) => {
                    item.classList.toggle('active', i === index);
                });
            };

            const nextItem = () => {
                currentIndex = (currentIndex + 1) % items.length;
                showItem(currentIndex);
            };

            setInterval(nextItem, 5000); // Auto-advance every 5 seconds
        });
    }

    // Floating elements animation
    setupFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-element');

        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.5}s`;
            element.style.animation = `float 4s ease-in-out infinite`;
        });
    }

    // Progress bar animations
    animateProgressBar(selector, percentage) {
        const bar = document.querySelector(selector);
        if (bar) {
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-in-out';
                bar.style.width = `${percentage}%`;
            }, 100);
        }
    }

    // Typewriter effect for text
    typewriterEffect(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    // Counter animation
    animateCounter(element, target, duration = 2000) {
        const start = parseInt(element.textContent) || 0;
        const increment = target / (duration / 16);
        let current = start;

        const counter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(counter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(counter);
    }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();

    // Setup additional animations
    window.animationController.setupCarouselAnimations();
    window.animationController.setupFloatingElements();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
