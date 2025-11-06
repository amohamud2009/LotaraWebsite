// ============================================
// RESEARCH CHARTS ANIMATIONS
// Beautiful animated charts with scroll triggers
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initResearchCharts();
});

function initResearchCharts() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate chart cards
                if (entry.target.classList.contains('chart-card')) {
                    entry.target.classList.add('animate-in');
                    animateCircularChart(entry.target);
                }
                
                // Animate radial progress items
                if (entry.target.classList.contains('radial-progress-item')) {
                    entry.target.classList.add('animate-in');
                    animateRadialProgress(entry.target);
                }
                
                // Animate bar chart
                if (entry.target.classList.contains('bar-chart-card')) {
                    entry.target.classList.add('animate-in');
                    setTimeout(() => animateBarChart(), 300);
                }
                
                // Animate timeline chart
                if (entry.target.classList.contains('timeline-chart-card')) {
                    entry.target.classList.add('animate-in');
                    setTimeout(() => animateTimelineChart(), 300);
                }
                
                // Animate engagement chart
                if (entry.target.classList.contains('engagement-chart-card')) {
                    entry.target.classList.add('animate-in');
                    setTimeout(() => animateEngagementStats(), 300);
                }
                
                // Animate stat cards
                if (entry.target.classList.contains('stat-card')) {
                    entry.target.classList.add('animate-in');
                    animateStatNumber(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    // Observe all chart elements
    document.querySelectorAll('.chart-card, .radial-progress-item, .bar-chart-card, .timeline-chart-card, .engagement-chart-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

function animateCircularChart(card) {
    const chart = card.querySelector('.circular-chart');
    if (chart) {
        chart.classList.add('animate');
    }
}

function animateRadialProgress(item) {
    const circle = item.querySelector('.radial-progress-circle');
    const numberEl = item.querySelector('.radial-progress-number');
    if (!circle || !numberEl) return;
    
    // Get target percentage
    const targetText = numberEl.textContent;
    const hasPlus = targetText.includes('+');
    const targetPercent = parseFloat(targetText.replace(/[^0-9]/g, ''));
    
    // Calculate stroke-dashoffset (circumference = 2 * π * r = 2 * π * 80 = 502)
    const circumference = 502;
    const targetOffset = circumference - (targetPercent / 100 * circumference);
    
    // Animate the circle
    setTimeout(() => {
        circle.style.strokeDashoffset = targetOffset;
    }, 100);
    
    // Animate the number
    let currentNumber = 0;
    const duration = 2000;
    const increment = targetPercent / (duration / 16);
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetPercent) {
            currentNumber = targetPercent;
            clearInterval(timer);
        }
        
        let displayText = Math.floor(currentNumber) + '%';
        if (hasPlus) displayText = '+' + displayText;
        
        numberEl.textContent = displayText;
    }, 16);
}

function animateBarChart() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.classList.add('animate');
        }, index * 200);
    });
}

function animateTimelineChart() {
    const bars = document.querySelectorAll('.timeline-bar');
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.classList.add('animate');
        }, index * 300);
    });
}

function animateEngagementStats() {
    const stats = document.querySelectorAll('.engagement-stat');
    stats.forEach((stat, index) => {
        setTimeout(() => {
            animateStatNumber({ querySelector: () => stat });
        }, index * 200);
    });
}

function animateStatNumber(card) {
    const numberEl = card.querySelector('.stat-number') || card.querySelector('.engagement-stat');
    if (!numberEl) return;
    
    const targetText = numberEl.textContent;
    const hasPlus = targetText.includes('+');
    const hasPercent = targetText.includes('%');
    const hasDot = targetText.includes('.');
    const hasX = targetText.includes('x');
    const targetNumber = parseFloat(targetText.replace(/[^0-9.]/g, ''));
    
    let currentNumber = 0;
    const duration = 2000;
    const increment = targetNumber / (duration / 16);
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        
        let displayText = hasDot ? currentNumber.toFixed(1) : Math.floor(currentNumber).toString();
        if (hasPlus) displayText += '+';
        if (hasPercent) displayText += '%';
        if (hasX) displayText += 'x';
        
        numberEl.textContent = displayText;
    }, 16);
}

