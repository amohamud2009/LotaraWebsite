// ============================================
// LOTARA WEBSITE - INTERACTIVE FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    initSmoothScroll();
    
    // Action button interactions
    initActionButtons();
    
    // Parallax effect for hero
    initParallax();
    
    // Animate feature cards on scroll
    initScrollAnimations();
});

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// ACTION BUTTONS
// ============================================

function initActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const feature = this.getAttribute('data-feature');
            
            // Add ripple effect
            createRipple(this, event);
            
            // Scroll to features section
            setTimeout(() => {
                const featuresSection = document.getElementById('features');
                if (featuresSection) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = featuresSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 300);
            
            // Analytics (if you add GA later)
            console.log(`User clicked: ${feature}`);
        });
    });
}

function createRipple(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ============================================
// PARALLAX EFFECT
// ============================================

function initParallax() {
    const hero = document.querySelector('.hero');
    
    if (!hero) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const parallaxSpeed = 0.5;
                
                hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
                
                // Fade out hero content on scroll
                const heroContent = document.querySelector('.hero-content');
                const opacity = 1 - (scrolled / 500);
                if (heroContent && opacity >= 0) {
                    heroContent.style.opacity = opacity;
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ============================================
// NAVIGATION BACKGROUND ON SCROLL
// ============================================

window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.8)';
        nav.style.boxShadow = 'none';
    }
});

// ============================================
// RIPPLE EFFECT STYLES (injected dynamically)
// ============================================

const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(139, 92, 246, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// ANALYTICS HELPER (for future GA integration)
// ============================================

function trackEvent(category, action, label) {
    // Placeholder for Google Analytics or other tracking
    console.log('Event:', { category, action, label });
    
    // When you add GA:
    // gtag('event', action, {
    //     'event_category': category,
    //     'event_label': label
    // });
}

// Export for potential future use
window.LotaraWebsite = {
    trackEvent
};

