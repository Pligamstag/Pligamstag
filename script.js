// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAIrQqokEPwD2YNaqaVM2IMMNJ-32P-zy8",
    authDomain: "pligamstag-e8832.firebaseapp.com",
    projectId: "pligamstag-e8832",
    storageBucket: "pligamstag-e8832.firebasestorage.app",
    messagingSenderId: "32917915670",
    appId: "1:32917915670:web:9e8b2a3893c5d54af50d37",
    measurementId: "G-26FD046N3C"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

// ========== SYSTÈME LIVE TWITCH ==========
let isLive = false;

function updateLiveStatus() {
    const liveIndicator = document.getElementById('liveIndicator');
    const twitchStatus = document.getElementById('twitch-followers');
    
    if (isLive) {
        liveIndicator.style.display = 'block';
        twitchStatus.textContent = '🔴 EN DIRECT MAINTENANT';
        twitchStatus.style.color = '#ff2d75';
        twitchStatus.style.fontWeight = 'bold';
    } else {
        liveIndicator.style.display = 'none';
        twitchStatus.textContent = 'Streams réguliers';
        twitchStatus.style.color = '';
        twitchStatus.style.fontWeight = '';
    }
}

// ========== SYSTÈME EMAIL CONTACT ==========
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
       
        btnText.style.display = 'none';
        btnLoading.style.display = 'block';
        submitBtn.disabled = true;
       
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value || 'Message depuis le site',
            message: document.getElementById('message').value
        };
        
        setTimeout(() => {
            const mailtoLink = `mailto:pligamstag@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
                `Nom: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
            )}`;
           
            window.location.href = mailtoLink;
            successMessage.style.display = 'block';
            contactForm.reset();
           
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }, 1000);
    });
}

// ========== SYSTÈME PANNEAU BIO ==========
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

// ========== SYSTÈME FANS FIREBASE ==========
async function initFanSystem() {
    const fanForm = document.getElementById('fanForm');
    const fanSubmitBtn = document.getElementById('fanSubmitBtn');
    const fanBtnText = document.getElementById('fanBtnText');
    const fanBtnLoading = document.getElementById('fanBtnLoading');
    const fanSuccessMessage = document.getElementById('fanSuccessMessage');
    const fanErrorMessage = document.getElementById('fanErrorMessage');
    const fanErrorText = document.getElementById('fanErrorText');
    const fanCountDisplay = document.getElementById('fanCount');
    
    await loadFanCount();
    
    fanForm.addEventListener('submit', async function(e) {
        e.preventDefault();
       
        fanBtnText.style.display = 'none';
        fanBtnLoading.style.display = 'block';
        fanSubmitBtn.disabled = true;
       
        fanSuccessMessage.style.display = 'none';
        fanErrorMessage.style.display = 'none';
        
        const fanData = {
            name: document.getElementById('fanName').value.trim(),
            email: document.getElementById('fanEmail').value.trim().toLowerCase()
        };
        
        try {
            const fanDoc = await db.collection('fans').doc(fanData.email).get();
           
            if (fanDoc.exists) {
                fanErrorText.textContent = 'Tu es déjà inscrit avec cet email ! Merci pour ton soutien 💜';
                fanErrorMessage.style.display = 'block';
                setTimeout(() => {
                    fanErrorMessage.style.display = 'none';
                }, 5000);
            } else {
                await db.collection('fans').doc(fanData.email).set({
                    name: fanData.name,
                    email: fanData.email,
                    date: firebase.firestore.FieldValue.serverTimestamp()
                });
               
                await incrementFanCount();
               
                fanSuccessMessage.style.display = 'block';
                fanForm.reset();
               
                fanSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
               
                setTimeout(() => {
                    fanSuccessMessage.style.display = 'none';
                }, 8000);
            }
        } catch (error) {
            fanErrorText.textContent = 'Une erreur est survenue: ' + error.message;
            fanErrorMessage.style.display = 'block';
            setTimeout(() => {
                fanErrorMessage.style.display = 'none';
            }, 5000);
        }
       
        fanBtnText.style.display = 'block';
        fanBtnLoading.style.display = 'none';
        fanSubmitBtn.disabled = false;
    });
    
    async function loadFanCount() {
        try {
            const snapshot = await db.collection('fans').get();
            const count = snapshot.size;
            animateFanCount(count);
        } catch (error) {
            animateFanCount(0);
        }
    }
    
    async function incrementFanCount() {
        try {
            const snapshot = await db.collection('fans').get();
            const newCount = snapshot.size;
            animateFanCount(newCount);
        } catch (error) {
            console.error('Erreur incrémentation:', error);
        }
    }
    
    function animateFanCount(target) {
        const duration = 2000;
        const start = parseInt(fanCountDisplay.textContent.replace(/\s/g, '')) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;
        
        const animate = () => {
            current += increment;
            if ((increment > 0 && current < target) || (increment < 0 && current > target)) {
                fanCountDisplay.textContent = Math.floor(current).toLocaleString('fr-FR');
                requestAnimationFrame(animate);
            } else {
                fanCountDisplay.textContent = target.toLocaleString('fr-FR');
            }
        };
        
        if (start !== target) {
            animate();
        } else {
            fanCountDisplay.textContent = target.toLocaleString('fr-FR');
        }
    }
}

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', function() {
    updateLiveStatus();
    initContactForm();
    initStatsSidebar();
    initFanSystem();
    
    setInterval(updateLiveStatus, 60000);
});

// ========== ANIMATIONS SCROLL ==========
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

window.addEventListener('scroll', fadeInOnScroll);
fadeInOnScroll();

// Navigation fluide
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 25, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 25, 0.9)';
    }
});

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

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(document.querySelector('.stats'));
