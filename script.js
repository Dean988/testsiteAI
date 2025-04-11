// Classe principale per gestire l'applicazione
class SiteManager {
    constructor() {
        this.easterEggs = [];
        this.konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.userSequence = [];
        this.isGameActive = false;
        this.userDiscoveredEggs = 0;
        this.totalEggs = 3; // Numero totale di easter egg
        this.init();
    }
    init() {
        // Inizializza gli elementi animati
        this.animatedElements = document.querySelectorAll('.animated');
        this.images = document.querySelectorAll('.image-placeholder img');
        // Setup delle animazioni
        this.setupAnimations();
        // Setup delle interazioni con le immagini
        this.setupImageInteractions();
        // Setup degli easter egg
        this.setupEasterEggs();
        // Setup degli eventi globali
        this.setupGlobalEvents();
        // Animazione iniziale dell'header
        this.animateHeader();
        // Effetto parallasse nello sfondo
        this.setupParallax();
    }
    setupAnimations() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fadeIn');
                    // Rimuove l'elemento dall'osservatore dopo l'animazione
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        this.animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
    setupImageInteractions() {
        // Effetto lightbox avanzato per le immagini
        this.images.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                this.createLightbox(img.src, index);
            });
            // Effetto di hover 3D
            const parent = img.parentElement;
            if (parent) {
                parent.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = parent.getBoundingClientRect();
                    const x = (e.clientX - left) / width - 0.5;
                    const y = (e.clientY - top) / height - 0.5;
                    img.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.05, 1.05, 1.05)`;
                });
                parent.addEventListener('mouseleave', () => {
                    img.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
                });
            }
        });
    }
    createLightbox(src, index) {
        // Rimuovi lightbox esistenti
        const existingLightbox = document.querySelector('.lightbox');
        if (existingLightbox) {
            document.body.removeChild(existingLightbox);
        }
        // Crea il lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        const image = document.createElement('img');
        image.src = src;
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'lightbox-close';
        const prevBtn = document.createElement('span');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.className = 'lightbox-nav lightbox-prev';
        const nextBtn = document.createElement('span');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.className = 'lightbox-nav lightbox-next';
        // Aggiungi gli elementi al DOM
        lightboxContent.appendChild(image);
        lightbox.appendChild(closeBtn);
        lightbox.appendChild(prevBtn);
        lightbox.appendChild(nextBtn);
        lightbox.appendChild(lightboxContent);
        document.body.appendChild(lightbox);
        // Aggiungi gli event listener
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        // Naviga tra le immagini
        prevBtn.addEventListener('click', () => {
            const newIndex = (index - 1 + this.images.length) % this.images.length;
            image.src = this.images[newIndex].src;
            index = newIndex;
        });
        nextBtn.addEventListener('click', () => {
            const newIndex = (index + 1) % this.images.length;
            image.src = this.images[newIndex].src;
            index = newIndex;
        });
        // Chiudi con ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.body.contains(lightbox)) {
                    document.body.removeChild(lightbox);
                }
            }
        });
        // Aggiungi animazione di entrata
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
    }
    setupEasterEggs() {
        // Easter Egg 1: Konami Code per attivare il gioco nascosto
        this.easterEggs.push({
            trigger: 'konami',
            action: () => {
                this.startMiniGame();
                this.updateEggCounter();
            },
            discovered: false
        });
        // Easter Egg 2: Clicca 3 volte sul logo
        const logo = document.querySelector('.logo');
        let logoClicks = 0;
        if (logo) {
            logo.addEventListener('click', () => {
                logoClicks++;
                if (logoClicks === 3) {
                    // Cambia il colore del logo
                    const logoEgg = this.easterEggs.find(egg => egg.trigger === 'logo');
                    if (logoEgg && !logoEgg.discovered) {
                        logoEgg.discovered = true;
                        logo.classList.add('rainbow-text');
                        this.showNotification('Easter Egg trovato: Logo arcobaleno!');
                        this.updateEggCounter();
                    }
                    logoClicks = 0;
                }
            });
        }
        this.easterEggs.push({
            trigger: 'logo',
            action: () => { },
            discovered: false
        });
        // Easter Egg 3: Scrivi "gigi" nella tastiera
        const secretWord = 'gigi';
        let typedWord = '';
        document.addEventListener('keydown', (e) => {
            typedWord += e.key.toLowerCase();
            if (typedWord.length > secretWord.length) {
                typedWord = typedWord.substring(1);
            }
            if (typedWord === secretWord) {
                const gigiEgg = this.easterEggs.find(egg => egg.trigger === 'gigi');
                if (gigiEgg && !gigiEgg.discovered) {
                    gigiEgg.discovered = true;
                    this.showGigiSurprise();
                    this.updateEggCounter();
                }
            }
        });
        this.easterEggs.push({
            trigger: 'gigi',
            action: () => { },
            discovered: false
        });
    }
    setupGlobalEvents() {
        // Controlla sequenza Konami
        document.addEventListener('keydown', (e) => {
            // Aggiungi il tasto alla sequenza utente
            this.userSequence.push(e.key);
            // Mantieni solo gli ultimi n tasti (dove n è la lunghezza della sequenza Konami)
            if (this.userSequence.length > this.konamiSequence.length) {
                this.userSequence.shift();
            }
            // Verifica se la sequenza corrisponde
            if (this.arraysEqual(this.userSequence, this.konamiSequence)) {
                const konamiEgg = this.easterEggs.find(egg => egg.trigger === 'konami');
                if (konamiEgg && !konamiEgg.discovered) {
                    konamiEgg.discovered = true;
                    konamiEgg.action();
                }
            }
        });
        // Smooth scrolling migliorato
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        window.scrollTo({
                            top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
    updateEggCounter() {
        this.userDiscoveredEggs++;
        // Controlla se l'utente ha trovato tutti gli easter egg
        if (this.userDiscoveredEggs === this.totalEggs) {
            this.showNotification('Hai trovato tutti gli Easter Egg! Sei un esploratore eccezionale!', 5000);
            // Sblocca un piccolo premio
            document.body.classList.add('achievement-unlocked');
        }
        else {
            this.showNotification(`Easter Egg trovato! ${this.userDiscoveredEggs}/${this.totalEggs}`, 3000);
        }
    }
    animateHeader() {
        const header = document.querySelector('header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('header-scrolled');
                }
                else {
                    header.classList.remove('header-scrolled');
                }
            });
        }
    }
    setupParallax() {
        // Rimuoviamo l'effetto parallasse che causava problemi
        // e implementiamo un effetto più sottile e controllato
        window.addEventListener('scroll', () => {
            // Utilizziamo un effetto più leggero che non causa spazi bianchi
            const scrollPosition = window.pageYOffset;
            // Sfondo fisso senza muovere l'immagine (che può causare spazi bianchi)
            // Invece, applichiamo un leggero effetto di opacità agli elementi
            
            // Effetto sulle sezioni di contenuto
            document.querySelectorAll('.content-box').forEach((box, index) => {
                const offset = index * 0.02;
                const opacity = Math.min(1, 0.8 + (scrollPosition * 0.0005) - offset);
                box.style.opacity = opacity.toString();
            });
            
            // Effetto sottile sull'header
            const header = document.querySelector('header');
            if (header) {
                const headerOpacity = Math.min(0.95, 0.5 + (scrollPosition * 0.001));
                header.style.backgroundColor = `rgba(0, 0, 0, ${headerOpacity})`;
            }
        });
    }
    startMiniGame() {
        if (this.isGameActive)
            return;
        this.isGameActive = true;
        this.showNotification('Easter Egg trovato: Mini gioco sbloccato! Cattura tutti i pallini!', 5000);
        // Crea il container del gioco
        const gameContainer = document.createElement('div');
        gameContainer.className = 'mini-game';
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = '<p>Punti: <span id="game-score">0</span></p><p>Tempo: <span id="game-time">30</span>s</p>';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Chiudi';
        closeBtn.className = 'game-close-btn';
        gameContainer.appendChild(gameInfo);
        gameContainer.appendChild(closeBtn);
        document.body.appendChild(gameContainer);
        // Setup del gioco
        let score = 0;
        let timeLeft = 30;
        const scoreElement = document.getElementById('game-score');
        const timeElement = document.getElementById('game-time');
        // Aggiorna il timer
        const timer = setInterval(() => {
            timeLeft--;
            if (timeElement) {
                timeElement.textContent = timeLeft.toString();
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endGame(gameContainer, score);
            }
        }, 1000);
        // Crea target da cliccare
        const createTarget = () => {
            if (!this.isGameActive)
                return;
            const target = document.createElement('div');
            target.className = 'game-target';
            const maxX = gameContainer.clientWidth - 30;
            const maxY = gameContainer.clientHeight - 30;
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);
            target.style.left = `${randomX}px`;
            target.style.top = `${randomY}px`;
            target.addEventListener('click', () => {
                score++;
                if (scoreElement) {
                    scoreElement.textContent = score.toString();
                }
                gameContainer.removeChild(target);
                createTarget();
            });
            gameContainer.appendChild(target);
            // Rimuovi il target dopo un certo tempo
            setTimeout(() => {
                if (gameContainer.contains(target)) {
                    gameContainer.removeChild(target);
                    createTarget();
                }
            }, 2000);
        };
        // Inizia con 3 target
        for (let i = 0; i < 3; i++) {
            createTarget();
        }
        // Gestisci la chiusura del gioco
        closeBtn.addEventListener('click', () => {
            clearInterval(timer);
            this.endGame(gameContainer, score);
        });
    }
    endGame(gameContainer, score) {
        this.isGameActive = false;
        const finalMessage = document.createElement('div');
        finalMessage.className = 'game-end-message';
        finalMessage.innerHTML = `<h3>Gioco Terminato!</h3><p>Punteggio finale: ${score}</p>`;
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Chiudi';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(gameContainer);
        });
        finalMessage.appendChild(closeBtn);
        gameContainer.innerHTML = '';
        gameContainer.appendChild(finalMessage);
    }
    showGigiSurprise() {
        this.showNotification('Easter Egg trovato: Hai sbloccato il gatto Gigi!', 3000);
        // Crea un gatto che segue il cursore
        const gigi = document.createElement('div');
        gigi.className = 'gigi-cat';
        gigi.innerHTML = '🐱';
        document.body.appendChild(gigi);
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            // Animazione fluida che segue il mouse con un po' di ritardo
            gsap.to(gigi, {
                left: x + 10,
                top: y + 10,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        // Rimuovi dopo 30 secondi
        setTimeout(() => {
            gsap.to(gigi, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    if (document.body.contains(gigi)) {
                        document.body.removeChild(gigi);
                    }
                }
            });
        }, 30000);
    }
    showNotification(message, duration = 3000) {
        // Rimuovi notifiche esistenti
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            document.body.removeChild(existingNotification);
        }
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        // Mostra la notifica con animazione
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        // Nascondi e rimuovi dopo la durata
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, duration);
    }
    arraysEqual(a, b) {
        if (a.length !== b.length)
            return false;
        return a.every((val, i) => val === b[i]);
    }
}
// Inizializza l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new SiteManager();
}); 