// Smooth scrolling for anchor links
function scrollToSection(sectionId) {
    const element = document.querySelector(`#${sectionId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add scroll animation to elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards, steps, and tech items
document.querySelectorAll('.feature-card, .step, .tech-item, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add active state to navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// Add scroll active state to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Animate counter numbers
function animateCounters() {
    const counters = document.querySelectorAll('.stat-card h3');
    counters.forEach(counter => {
        const target = counter.innerText;
        const finalValue = parseInt(target) || target;
        
        if (typeof finalValue === 'number') {
            let count = 0;
            const increment = finalValue / 50;
            const timer = setInterval(() => {
                count += increment;
                if (count >= finalValue) {
                    counter.innerText = finalValue;
                    clearInterval(timer);
                } else {
                    counter.innerText = Math.floor(count);
                }
            }, 30);
        }
    });
}

// Trigger counter animation when stat section comes into view
const statsSection = document.querySelector('.stats');
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            animateCounters();
            entry.target.dataset.animated = 'true';
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// Mobile menu toggle (if needed in future)
function handleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Log when user enters VR
document.querySelectorAll('[onclick*="VR/index.html"]').forEach(btn => {
    btn.addEventListener('click', function() {
        console.log('🥽 Utilisateur lance le jeu VR!');
        // You can add analytics here
    });
});

console.log('🍔 VR Burger Workshop - Presentation loaded!');
