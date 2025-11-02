window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

try {
    emailjs.init('08lCVP-rHQse_ceTw');
} catch (err) {
    console.error('EmailJS init failed:', err);
}

const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
let scrollTimeout;
let isScrolled = false;

window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > 50;
        if (shouldBeScrolled !== isScrolled) {
            isScrolled = shouldBeScrolled;
            navbar.classList.toggle('scrolled', isScrolled);
        }

        if (sections.length && navLinks.length) {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.toggle('active', current && link.getAttribute('href').includes(current));
            });
        }

        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
        }
    });
}, { passive: true });

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}
if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}
if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}
mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .rotate-in').forEach(el => {
    observer.observe(el);
});

document.querySelectorAll('.skill-badge').forEach((badge, index) => {
    badge.style.transitionDelay = `${index * 0.1}s`;
});

document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.15}s`;
});

const JourneyCarousel = {
    currentIndex: 0,
    totalItems: 4,
    isAnimating: false,
    autoPlayInterval: null,
    cards: null,
    indicators: null,
    prevBtn: null,
    nextBtn: null,
    touchStartX: 0,
    touchEndX: 0,
    touchStartY: 0,
    touchEndY: 0,

    init() {
        this.cards = document.querySelectorAll('.carousel-card');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevCarousel');
        this.nextBtn = document.getElementById('nextCarousel');

        if (!this.cards.length) return;

        // Set initial positions
        this.updateCarousel();

        // Event listeners for navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Event listeners for indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Enhanced Touch/Swipe support for carousel container
        const carouselContainer = document.querySelector('.carousel-3d-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }, { passive: true });

            carouselContainer.addEventListener('touchmove', (e) => {
                // Prevent default only for horizontal swipes
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const diffX = Math.abs(touchX - this.touchStartX);
                const diffY = Math.abs(touchY - this.touchStartY);
                
                if (diffX > diffY) {
                    e.preventDefault();
                }
            }, { passive: false });

            carouselContainer.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].clientX;
                this.touchEndY = e.changedTouches[0].clientY;
                this.handleSwipe();
            }, { passive: true });
        }

        // Auto-play
        this.startAutoPlay();

        // Pause on hover (desktop) or touch (mobile)
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
            carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
            carouselContainer.addEventListener('touchstart', () => this.stopAutoPlay(), { once: true });
        }
    },

    handleSwipe() {
        const threshold = 50;
        const diffX = this.touchStartX - this.touchEndX;
        const diffY = Math.abs(this.touchStartY - this.touchEndY);

        // Only trigger if horizontal swipe is more prominent than vertical
        if (Math.abs(diffX) > threshold && Math.abs(diffX) > diffY) {
            if (diffX > 0) {
                // Swiped left - go to next
                this.next();
            } else {
                // Swiped right - go to prev
                this.prev();
            }
        }
    },

    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateCarousel();
    },

    next() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex + 1) % this.totalItems;
        this.updateCarousel();
    },

    prev() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
        this.updateCarousel();
    },

    updateCarousel() {
        this.isAnimating = true;

        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            this.cards.forEach((card, index) => {
                // Remove all classes
                card.classList.remove('active', 'next', 'prev', 'hidden-next', 'hidden-prev');

                // Calculate position relative to current
                const diff = index - this.currentIndex;

                if (diff === 0) {
                    card.classList.add('active');
                } else if (diff === 1 || diff === -(this.totalItems - 1)) {
                    card.classList.add('next');
                } else if (diff === -1 || diff === this.totalItems - 1) {
                    card.classList.add('prev');
                } else if (diff > 1 || diff < -(this.totalItems - 2)) {
                    card.classList.add('hidden-next');
                } else {
                    card.classList.add('hidden-prev');
                }
            });

            // Update indicators
            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentIndex);
            });
        });

        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    },

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, 5000);
    },

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
};

const MatrixEffect = {
    canvas: null,
    ctx: null,
    columns: [],
    animationId: null,

    init() {
        this.canvas = document.getElementById('matrixCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.animate();
    },

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;

        const fontSize = 14;
        const columnCount = Math.floor(this.canvas.width / fontSize);

        this.columns = [];
        for (let i = 0; i < columnCount; i++) {
            this.columns.push({
                x: i * fontSize,
                y: Math.random() * -this.canvas.height,
                speed: 0.5 + Math.random() * 1.5
            });
        }
    },

    animate() {
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#00F0FF';
        this.ctx.font = '14px "Courier New", monospace';

        this.columns.forEach(column => {
            const char = Math.random() > 0.5 ? '1' : '0';
            this.ctx.fillText(char, column.x, column.y);

            column.y += column.speed * 20;

            if (column.y > this.canvas.height && Math.random() > 0.975) {
                column.y = 0;
                column.speed = 0.5 + Math.random() * 1.5;
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
};

const journeySection = document.getElementById('journey');
if (journeySection) {
    const journeyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!JourneyCarousel.cards) {
                    setTimeout(() => {
                        JourneyCarousel.init();
                    }, 100);
                }
                if (!MatrixEffect.canvas) {
                    MatrixEffect.init();
                }
            }
        });
    }, { threshold: 0.2 });

    journeyObserver.observe(journeySection);
}

const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

const cyberdeckTerminal = {
    commandHistory: [],
    historyIndex: -1,
    contactStep: 0,
    contactData: {},

    init() {
        this.shell = document.getElementById('terminal');
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.prompt = document.getElementById('prompt');
        if (!this.shell || !this.input || !this.output || !this.prompt) {
            return;
        }

        this.projects = Array.from(document.querySelectorAll('.project-card h3')).map(el => el.textContent.trim());

        this.commands = {
            help: () => 'Available commands: `help`, `about`, `projects`, `socials`, `info`, `resume`, `contact`, `clear`, `date`, `education`, `certifications`',
            about: () => 'Mohammad Umar Wajid Khan — BCA Final Year | Full-Stack Developer | Cybersecurity & AI Explorer\n\nEngineer by training, technologist by passion. Specializing in crafting scalable web systems, intelligent automation, and secure digital infrastructures.',
            projects: () => this.projects.length ? this.projects.join('\n') : 'Projects list unavailable.',
            socials: () => 'GitHub: github.com/techuhat\nLinkedIn: linkedin.com/in/mohdkhanumar',
            info: () => 'BASE: India (IST)\nEMAIL: ablogumar@gmail.com\nCONTACT: +91 9161368619 / 6306993112\nSTATUS: Available Full-Time',
            resume: () => 'Technical documentation available on request. Contact: ablogumar@gmail.com',
            education: () => 'BCA - Integral University, Lucknow (2023-2026)\nIntermediate (Science) - Buddha Intermediate College, UP Board (2021-2022)',
            certifications: () => 'Bootcamp Certified: HTML, CSS, Bootstrap\nResearching: AI-Driven Web Defense Systems\nExploring: IoT Security & Network Vulnerability Testing\nPassion: Open-Source, Reverse Engineering, Ethical Hacking',
            clear: () => { this.output.innerHTML = ''; return ''; },
            contact: () => { this.startContactSequence(); return ''; },
            date: () => new Date().toString()
        };

        this.type('MUK CYBERDECK v2.0 — Optimized for Security, Precision & Performance\nType `help` to browse secure network commands.\n\n');

        this.input.addEventListener('keydown', (event) => this.handleInput(event));
        this.shell.addEventListener('click', () => this.input.focus());
        try {
            this.input.focus({ preventScroll: true });
        } catch (err) {
            /* no-op */
        }
    },

    handleInput(event) {
        if (event.key === 'Enter') {
            const value = this.input.value.trim();
            const promptLabel = this.prompt.textContent || '>';
            this.appendLine(`\n<span class="prompt-color">${promptLabel}</span> ${value}`);

            if (this.contactStep > 0) {
                this.processContactStep(value);
            } else if (value) {
                this.processCommand(value);
                if (!this.commandHistory.length || this.commandHistory[this.commandHistory.length - 1] !== value) {
                    this.commandHistory.push(value);
                }
                this.historyIndex = this.commandHistory.length;
            }

            this.input.value = '';
            this.scrollToBottom();
            return;
        }

        if (event.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex] || '';
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex] || '';
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
            event.preventDefault();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const current = this.input.value.trim();
            if (!current) return;
            const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(current));
            if (matches.length === 1) {
                this.input.value = matches[0];
            }
        }
    },

    processCommand(rawCommand) {
        const [command, ...args] = rawCommand.split(' ');
        const handler = this.commands[command];
        if (!handler) {
            this.type("\n<span class='output-color'>Command not found. Type `help` for assistance.</span>");
            return;
        }

        const result = typeof handler === 'function' ? handler(args) : handler;
        if (result) {
            this.type(`\n<span class='output-color'>${result}</span>`);
        }
    },

    startContactSequence() {
        this.contactStep = 1;
        this.contactData = {};
        this.appendLines([
            '<span class="output-color">╔════════════════════════════════════════════╗</span>',
            '<span class="output-color">║   CONTACT PROTOCOL INITIATED               ║</span>',
            '<span class="output-color">╚════════════════════════════════════════════╝</span>',
            '<span class="output-color">Enter your full name:</span>'
        ]);
        this.prompt.textContent = 'Name>';
    },

    validateName(name) {
        const namePattern = /^[A-Za-z\s]{2,40}$/;
        return namePattern.test(name);
    },

    validateEmail(email) {
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        return emailPattern.test(email);
    },

    async processContactStep(value) {
        if (!value) {
            this.appendLine('\n<span style="color: #ff3366;">ERROR: Input required. Please try again.</span>');
            return;
        }

        if (this.contactStep === 1) {
            if (!this.validateName(value)) {
                this.appendLines([
                    '<span style="color: #ff3366;">ERROR: Invalid name. Use only letters and spaces (2-40 characters).</span>',
                    '<span class="output-color">Enter your full name:</span>'
                ]);
                return;
            }
            this.contactData.name = value;
            this.contactStep = 2;
            this.appendLines([
                '<span style="color: #00ff88;">✓ Name verified</span>',
                '<span class="output-color">Enter your email address:</span>'
            ]);
            this.prompt.textContent = 'Email>';
            return;
        }

        if (this.contactStep === 2) {
            if (!this.validateEmail(value)) {
                this.appendLines([
                    '<span style="color: #ff3366;">ERROR: Invalid email format. Please enter a valid email address.</span>',
                    '<span class="output-color">Enter your email address:</span>'
                ]);
                return;
            }
            this.contactData.email = value;
            this.contactStep = 3;
            this.appendLines([
                '<span style="color: #00ff88;">✓ Email verified</span>',
                '<span class="output-color">Enter your message:</span>'
            ]);
            this.prompt.textContent = 'Message>';
            return;
        }

        if (this.contactStep === 3) {
            if (value.length < 10) {
                this.appendLines([
                    '<span style="color: #ff3366;">ERROR: Message too short. Minimum 10 characters required.</span>',
                    '<span class="output-color">Enter your message:</span>'
                ]);
                return;
            }
            this.contactData.message = value;
            this.appendLine('\n<span style="color: #00ff88;">✓ Message received</span>');
            this.appendLines([
                '<span class="output-color">╔════════════════════════════════════════════╗</span>',
                '<span class="output-color">║   TRANSMITTING DATA PACKET...              ║</span>',
                '<span class="output-color">╚════════════════════════════════════════════╝</span>'
            ]);

            await this.sendMessage();
        }
    },

    async sendMessage() {
        try {
            this.appendLine('\n<span style="color: #00f7ff;">⟳ Initializing transmission...</span>');

            const templateParams = {
                from_name: this.contactData.name,
                from_email: this.contactData.email,
                message: this.contactData.message,
                to_email: 'ablogumar@gmail.com'
            };

            this.appendLine('\n<span style="color: #00f7ff;">⟳ Connecting to server...</span>');

            const response = await emailjs.send(
                'service_m0zpwfl',
                'template_et65p2f',
                templateParams
            );

            if (response.status === 200) {
                this.appendLines([
                    '<span style="color: #00ff88;">✓ CONNECTION ESTABLISHED</span>',
                    '<span style="color: #00ff88;">✓ DATA PACKET TRANSMITTED</span>',
                    '<span style="color: #00ff88;">✓ ACKNOWLEDGMENT RECEIVED</span>',
                    '<span class="output-color">╔════════════════════════════════════════════╗</span>',
                    '<span class="output-color">║   TRANSMISSION SUCCESSFUL                  ║</span>',
                    '<span class="output-color">╠════════════════════════════════════════════╣</span>',
                    `<span class="output-color">║   Name: ${this.formatField(this.contactData.name, 33)} ║</span>`,
                    `<span class="output-color">║   Email: ${this.formatField(this.contactData.email, 32)} ║</span>`,
                    '<span class="output-color">╠════════════════════════════════════════════╣</span>',
                    '<span class="output-color">║   Message delivered to Mohammad Umar Khan  ║</span>',
                    '<span class="output-color">║   Expected response time: 24-48 hours      ║</span>',
                    '<span class="output-color">╚════════════════════════════════════════════╝</span>'
                ]);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            this.appendLines([
                '<span style="color: #ff3366;">✗ TRANSMISSION FAILED</span>',
                `<span style="color: #ff3366;">ERROR: ${error.text || error.message || 'Could not connect to server'}</span>`,
                '<span class="output-color">Alternative: Email directly at ablogumar@gmail.com</span>'
            ]);
        }

        this.contactStep = 0;
        this.contactData = {};
        this.prompt.textContent = '>';
        this.appendLine('\n');
    },

    type(text, index = 0) {
        if (index < text.length) {
            this.output.insertAdjacentHTML('beforeend', text[index]);
            this.scrollToBottom();
            setTimeout(() => this.type(text, index + 1), 8);
        }
    },

    appendLine(content) {
        this.output.insertAdjacentHTML('beforeend', content);
        this.scrollToBottom();
    },

    appendLines(lines) {
        lines.forEach(line => {
            this.appendLine(`\n${line}`);
        });
    },

    formatField(value, length) {
        const trimmed = value.length > length ? `${value.slice(0, length - 3)}...` : value;
        return trimmed.padEnd(length, ' ');
    },

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
};

cyberdeckTerminal.init();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

class TextScrambleHero {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_/\\[]{}—=+*^?#01︎10︎あ㐀明る日¥£€$¢';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 20);
            const end = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span style="color: var(--neon-green); text-shadow: 0 0 15px var(--neon-green);">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

const heroNameEl = document.getElementById('hero-name');
const heroRoleEl = document.getElementById('hero-role');

if (heroNameEl && heroRoleEl) {
    const fxName = new TextScrambleHero(heroNameEl);
    const fxRole = new TextScrambleHero(heroRoleEl);

    window.addEventListener('load', () => {
        setTimeout(() => {
            heroNameEl.classList.add('active');
            fxName.setText('MOHAMMAD UMAR WAJID KHAN').then(() => {
                setTimeout(() => {
                    heroRoleEl.classList.add('active');
                    fxRole.setText('FULL-STACK ENGINEER × CYBERSECURITY ENTHUSIAST × DIGITAL ARCHITECT');
                }, 300);
            });
        }, 1200);
    });
}
