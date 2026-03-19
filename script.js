// ============================================================
//  ✏️  MIS À JOUR ICI — Tes chiffres (modifie-les manuellement)
// ============================================================
const SOCIAL_STATS = {
    twitch:    { followers: null,  label: 'abonnés',  live: false },  // géré automatiquement via API
    youtube:   { followers: 300,   label: 'abonnés'  },
    tiktok:    { followers: 1700,  label: 'followers' },
    instagram: { followers: 80,    label: 'followers' },
};

// Réseaux fermés temporairement (floutés)
const CLOSED_NETWORKS = ['twitter', 'discord'];

// ============================================================

// Formatte un nombre : 1700 → "1,7K" / 1200000 → "1,2M"
function formatCount(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
    return n.toString();
}

// Injecte les chiffres dans les cartes réseaux
function updateSocialCards() {
    for (const [network, data] of Object.entries(SOCIAL_STATS)) {
        if (!data.followers) continue;
        const el = document.getElementById(`${network}-followers`);
        if (el) {
            el.textContent = formatCount(data.followers) + ' ' + data.label;
        }
    }
}

// Marque les cartes fermées comme floues + badge
function applyClosedCards() {
    CLOSED_NETWORKS.forEach(network => {
        const card = document.querySelector(`.social-card.${network}`);
        if (!card) return;
        card.classList.add('card-closed');

        // Retire le lien existant et le remplace par un span inactif
        const btn = card.querySelector('.social-btn');
        if (btn) {
            const span = document.createElement('span');
            span.className = 'social-btn social-btn-disabled';
            span.textContent = btn.textContent;
            btn.replaceWith(span);
        }

        // Ajoute le badge s'il n'existe pas déjà
        if (!card.querySelector('.closed-badge')) {
            const badge = document.createElement('div');
            badge.className = 'closed-badge';
            badge.innerHTML = '<i class="fas fa-lock"></i> Fermé temporairement';
            card.appendChild(badge);
        }
    });
}

// ============================================================
//  TWITCH LIVE CHECK (via API publique — fonctionne Netlify/Vercel)
//  Pour que ça marche : remplace CLIENT_ID par ton vrai Client-ID Twitch
//  (créé sur dev.twitch.tv → Applications → Register → copie le Client ID)
// ============================================================
const TWITCH_USERNAME   = 'pligamstag';
const TWITCH_CLIENT_ID  = 'TON_CLIENT_ID_ICI'; // ← à remplacer

async function checkTwitchLive() {
    const liveIndicator = document.getElementById('liveIndicator');
    const twitchFollowers = document.getElementById('twitch-followers');

    // Si pas de vrai Client ID, on reste sur le mode aléatoire de fallback
    if (TWITCH_CLIENT_ID === 'TON_CLIENT_ID_ICI') {
        fallbackLive(liveIndicator);
        return;
    }

    try {
        // Récupère le token App (ne nécessite pas de connexion utilisateur)
        const tokenRes = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=&grant_type=client_credentials`,
            { method: 'POST' }
        );

        // Vérifie si le stream est en direct
        const streamRes = await fetch(
            `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USERNAME}`,
            { headers: { 'Client-Id': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${(await tokenRes.json()).access_token}` } }
        );
        const streamData = await streamRes.json();
        const isLive = streamData.data && streamData.data.length > 0;

        if (isLive) {
            liveIndicator.style.display = 'flex';
            const viewers = streamData.data[0].viewer_count;
            liveIndicator.querySelector
                ? liveIndicator.title = `${viewers.toLocaleString('fr-FR')} viewers en ce moment`
                : null;
        } else {
            liveIndicator.style.display = 'none';
        }

        // Nombre de followers Twitch
        const userRes = await fetch(
            `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${streamData.data?.[0]?.user_id || ''}`,
            { headers: { 'Client-Id': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${(await tokenRes.json()).access_token}` } }
        );
        const userData = await userRes.json();
        if (userData.total !== undefined && twitchFollowers) {
            twitchFollowers.textContent = formatCount(userData.total) + ' abonnés';
        }

    } catch (e) {
        console.warn('Twitch API indisponible, mode fallback activé');
        fallbackLive(liveIndicator);
    }
}

function fallbackLive(indicator) {
    if (Math.random() < 0.2) {
        indicator.style.display = 'flex';
        setTimeout(() => { indicator.style.display = 'none'; }, 4 * 60 * 60 * 1000);
    }
}

// ============================================================
//  Initialisation des particules
// ============================================================
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
        if (elementTop < window.innerHeight - 150) {
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
        const suffix = counter.getAttribute('data-suffix') || '+';

        const updateCounter = () => {
            if (count < target) {
                count += increment;
                counter.innerText = Math.ceil(count) + suffix;
                setTimeout(updateCounter, 10);
            } else {
                counter.innerText = target + suffix;
            }
        };
        updateCounter();
    });
}

// ============================================================
//  Initialisation principale
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Stats sociales
    updateSocialCards();
    applyClosedCards();

    // Vérification live Twitch
    checkTwitchLive();

    // Composants UI
    initStatsSidebar();
    initSmoothScroll();
    initScrollEffect();

    // Observer pour les compteurs animés
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

    const apropos = document.querySelector('#apropos');
    if (apropos) observer.observe(apropos);

    // Scroll animations
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
