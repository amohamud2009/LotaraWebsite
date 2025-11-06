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
                
                // Animate bar chart
                if (entry.target.classList.contains('bar-chart-card')) {
                    entry.target.classList.add('animate-in');
                    setTimeout(() => animateBarChart(), 300);
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
    document.querySelectorAll('.chart-card, .bar-chart-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

function animateCircularChart(card) {
    const chart = card.querySelector('.circular-chart');
    if (chart) {
        chart.classList.add('animate');
    }
}

function animateBarChart() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.classList.add('animate');
        }, index * 200);
    });
}

function animateStatNumber(card) {
    const numberEl = card.querySelector('.stat-number');
    if (!numberEl) return;
    
    const targetText = numberEl.textContent;
    const hasPlus = targetText.includes('+');
    const hasPercent = targetText.includes('%');
    const targetNumber = parseInt(targetText.replace(/[^0-9]/g, ''));
    
    let currentNumber = 0;
    const duration = 2000;
    const increment = targetNumber / (duration / 16);
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        
        let displayText = Math.floor(currentNumber).toString();
        if (hasPlus) displayText += '+';
        if (hasPercent) displayText += '%';
        
        numberEl.textContent = displayText;
    }, 16);
}

