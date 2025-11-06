// ============================================
// ADVANCED ANIMATIONS WITH GSAP
// Next-level interactions and effects
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize all animations
    initScrollProgress();
    initHeroAnimations();
    initParallaxEffects();
    initRevealAnimations();
    initMagneticButtons();
    initCustomCursor();
    initFeatureCardTilt();
    initTextShimmer();
});

// ============================================
// SCROLL PROGRESS BAR
// ============================================

function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    // Update on scroll
    gsap.to('.scroll-progress', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3
        }
    });
}

// ============================================
// HERO SECTION ANIMATIONS
// ============================================

function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Animate hero content on load
    tl.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        delay: 0.3
    })
    .from('.hero-subtitle', {
        y: 60,
        opacity: 0,
        duration: 1,
    }, '-=0.8')
    .from('.hero-buttons .btn', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    }, '-=0.6');
    
    // Parallax effect on hero
    gsap.to('.hero-content', {
        y: 150,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}

// ============================================
// PARALLAX EFFECTS
// ============================================

function initParallaxEffects() {
    // Feature cards parallax
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        const speed = 1 + (i % 3) * 0.3; // Varying speeds
        
        gsap.to(card, {
            y: -50 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    });
    
    // Premium features parallax
    gsap.utils.toArray('.premium-feature').forEach((feature, i) => {
        gsap.from(feature, {
            y: 100,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: feature,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });
}

// ============================================
// REVEAL ANIMATIONS
// ============================================

function initRevealAnimations() {
    // Section titles
    gsap.utils.toArray('.section-title, .research-title, .clinical-title, .timeline-title, .engagement-title').forEach(title => {
        gsap.from(title, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    
    // Stagger animations for grids
    gsap.utils.toArray('.charts-grid, .radial-progress-grid, .engagement-grid').forEach(grid => {
        const items = grid.children;
        
        gsap.from(items, {
            y: 80,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: grid,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    
    // Comparison tables
    gsap.from('.comparison-table, .competitor-table', {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.2)',
        scrollTrigger: {
            trigger: '.comparison-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });
}

// ============================================
// MAGNETIC BUTTONS
// ============================================

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-login');
    
    buttons.forEach(button => {
        button.classList.add('magnetic');
        
        button.addEventListener('mouseenter', function(e) {
            gsap.to(button, {
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        button.addEventListener('mouseleave', function(e) {
            gsap.to(button, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
        
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(button, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

// ============================================
// CUSTOM CURSOR
// ============================================

function initCustomCursor() {
    // Only on desktop
    if (window.innerWidth < 768) return;
    
    // Create cursor elements
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);
    
    // Track cursor position
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant dot movement
        gsap.to(cursorDot, {
            x: mouseX - 4,
            y: mouseY - 4,
            duration: 0
        });
        
        // Smooth outline movement
        gsap.to(cursorOutline, {
            x: mouseX - 16,
            y: mouseY - 16,
            duration: 0.15
        });
    });
    
    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .feature-card, .chart-card, .stat-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('hover');
            gsap.to(cursorDot, {
                scale: 1.5,
                duration: 0.3
            });
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('hover');
            gsap.to(cursorDot, {
                scale: 1,
                duration: 0.3
            });
        });
    });
}

// ============================================
// FEATURE CARD TILT EFFECT
// ============================================

function initFeatureCardTilt() {
    const cards = document.querySelectorAll('.feature-card, .premium-feature, .chart-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.5,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// ============================================
// TEXT SHIMMER EFFECT
// ============================================

function initTextShimmer() {
    // Add shimmer to hero title on load
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => {
            heroTitle.classList.add('shimmer-text');
            setTimeout(() => {
                heroTitle.classList.remove('shimmer-text');
            }, 3000);
        }, 1500);
    }
}

// ============================================
// SMOOTH SCROLL TO ANCHORS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            gsap.to(window, {
                scrollTo: {
                    y: target,
                    offsetY: 80
                },
                duration: 1.2,
                ease: 'power3.inOut'
            });
        }
    });
});

// ============================================
// PERFORMANCE: Pause animations when tab is hidden
// ============================================

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        gsap.globalTimeline.pause();
    } else {
        gsap.globalTimeline.resume();
    }
});

