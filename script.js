// Initialisation des particules
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#6a11cb" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#6a11cb",
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
        }
    }
});

// Système panneau bio
function initStatsSidebar() {
    const openBioBtn = document.getElementById('openBioBtn');
    const statsSidebar = document.getElementById('statsSidebar');
    const statsOverlay = document.getElementById('statsOverlay');
    const closeStatsSidebar = document.getElementById('closeStatsSidebar');
    
    openBioBtn.addEventListener('click', function() {
        statsSidebar.classList.add('active');
        statsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    function closeStatsPanel() {
        statsSidebar.classList.remove('active');
        statsOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeStatsSidebar.addEventListener('click', closeStatsPanel);
    statsOverlay.addEventListener('click', closeStatsPanel);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && statsSidebar.classList.contains('active')) {
            closeStatsPanel();
        }
    });
}

// Animations scroll
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
};

// Navigation fluide
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Header scroll effect
function initScrollEffect() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 25, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 25, 0.9)';
        }
    });
}

// Animated counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let count = 0;
        const increment = target / speed;
        
        const updateCounter = () => {
            if (count < target) {
                count += increment;
                counter.innerText = Math.ceil(count) + (counter.innerText.includes('K') ? 'K+' : '+');
                setTimeout(updateCounter, 10);
            } else {
                counter.innerText = target + (counter.innerText.includes('K') ? 'K+' : '+');
            }
        };
        
        updateCounter();
    });
}

// Live indicator simulation
function initLiveIndicator() {
    // Simuler un statut "en direct" de temps en temps
    // En production, vous pourriez utiliser l'API Twitch ici
    const liveIndicator = document.getElementById('liveIndicator');
    
    // Simuler un stream en direct (20% de chance d'être "en direct")
    if (Math.random() < 0.2) {
        liveIndicator.style.display = 'block';
        
        // Simuler la fin du stream après 4 heures
        setTimeout(() => {
            liveIndicator.style.display = 'none';
        }, 4 * 60 * 60 * 1000); // 4 heures
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser tous les composants
    initStatsSidebar();
    initSmoothScroll();
    initScrollEffect();
    initLiveIndicator();
    
    // Observer pour les animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.querySelector('.stats')) {
                    animateCounters();
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(document.querySelector('#apropos'));
    
    // Initialiser les animations au scroll
    window.addEventListener('scroll', fadeInOnScroll);
    fadeInOnScroll();
    
    // Gestion des cartes de jeux
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const game = this.getAttribute('data-game');
            if (game === 'fortnite') {
                window.location.href = 'fortnite.html';
            }
        });
    });
});
