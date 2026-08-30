// needham gravity app logic - echoes gsap staggered menu, three.js canvascii title, & ogl halftonereveal background

document.addEventListener('DOMContentLoaded', () => {
    const initializers = [
        initCleanRouteNavigation,
        initStaggeredMenu,
        initParticleTextHeroTitle,
        initSubsystemsCADAnimation,
        initTimelineScrollAnimation,
        initTelemetrySimulation,
        initIntegratedGoogleForm,
        initPhoneNumberFormatter,
        initAccordionGallery,
        initScrollUrlUpdater,
        initClickPops
    ];

    initializers.forEach(fn => {
        try {
            if (typeof fn === 'function') fn();
        } catch (err) {
            console.warn(`[Init Safeguard] Exception in ${fn.name || 'initializer'}:`, err);
        }
    });

    if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => { ScrollTrigger.refresh(); }, 300);
    }
});

window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});

// global state for programmatic smooth scrolling lock
let isProgrammaticScroll = false;
let programmaticScrollTimer = null;

// route path mapping helper in exact dom scroll order
const routeToSectionMap = {
    '/': 'hero',
    '/about': 'about',
    '/team': 'team',
    '/meet-team': 'meet-team',
    '/sponsors': 'sponsors',
    '/contact': 'contact',
    '/contact-form': 'contact-form',
    '/roadmap': 'roadmap'
};

const sectionToRouteMap = {
    'hero': '/',
    'about': '/about',
    'team': '/team',
    'meet-team': '/meet-team',
    'sponsors': '/sponsors',
    'contact': '/contact',
    'contact-form': '/contact-form',
    'roadmap': '/roadmap'
};

// handle clean route clicks and initial page load route restoration without hashtags
function scrollToSectionForPath(path, isInstant = false) {
    if (!path) return;
    const cleanPath = path.replace(/\/$/, '') || '/';

    if (cleanPath === '/contact' || cleanPath === '/contact-form') {
        document.body.classList.add('is-contact-page');
        window.scrollTo({ top: 0, behavior: 'auto' });
        history.replaceState(null, '', '/contact-form');
        setTimeout(() => { initAccordionGallery(); }, 50);
        return;
    }

    document.body.classList.remove('is-contact-page');

    if (cleanPath === '/') {
        window.scrollTo({ top: 0, behavior: isInstant ? 'auto' : 'smooth' });
        history.replaceState(null, '', '/');
        return;
    }

    const targetId = routeToSectionMap[cleanPath];
    if (!targetId) return;

    const elem = document.getElementById(targetId);
    if (!elem) return;

    isProgrammaticScroll = true;
    if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer);

    const targetY = elem.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
        top: targetY,
        behavior: isInstant ? 'auto' : 'smooth'
    });

    history.replaceState(null, '', cleanPath);

    programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll = false;
    }, 850);
}

function initCleanRouteNavigation() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const initialPath = sessionStorage.getItem('redirect_route') || window.location.pathname;
    if (initialPath && initialPath !== '/') {
        sessionStorage.removeItem('redirect_route');
        scrollToSectionForPath(initialPath, true);

        setTimeout(() => {
            scrollToSectionForPath(initialPath, true);
        }, 100);

        setTimeout(() => {
            scrollToSectionForPath(initialPath, false);
        }, 400);

        window.addEventListener('load', () => {
            scrollToSectionForPath(initialPath, false);
        }, { once: true });
    }

    window.addEventListener('popstate', () => {
        const currentPath = window.location.pathname;
        scrollToSectionForPath(currentPath, true);
    });

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-target], a[href^="/"]');
        if (!link) return;

        const dataTarget = link.getAttribute('data-target');
        const href = link.getAttribute('href');

        let targetId = dataTarget;
        let routePath = href;

        if (!targetId && href) {
            const cleanHref = href.replace(/\/$/, '') || '/';
            targetId = routeToSectionMap[cleanHref];
        }

        if (targetId === 'contact-form' || routePath === '/contact-form' || routePath === '/contact') {
            e.preventDefault();
            document.body.classList.add('is-contact-page');
            window.scrollTo({ top: 0, behavior: 'auto' });
            history.pushState(null, '', '/contact-form');
            if (window.isMenuOpen && typeof window.closeStaggeredMenu === 'function') {
                window.closeStaggeredMenu();
            }
            setTimeout(() => { initAccordionGallery(); }, 50);
            return;
        }

        document.body.classList.remove('is-contact-page');

        if (targetId === 'hero' || routePath === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.pushState(null, '', '/');
            if (window.isMenuOpen && typeof window.closeStaggeredMenu === 'function') {
                window.closeStaggeredMenu();
            }
            return;
        }

        if (targetId) {
            const targetElem = document.getElementById(targetId);
            if (targetElem) {
                e.preventDefault();
                routePath = sectionToRouteMap[targetId] || '/';

                isProgrammaticScroll = true;
                if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer);

                const targetY = targetElem.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });

                history.pushState(null, '', routePath);

                if (window.isMenuOpen && typeof window.closeStaggeredMenu === 'function') {
                    window.closeStaggeredMenu();
                }

                programmaticScrollTimer = setTimeout(() => {
                    isProgrammaticScroll = false;
                }, 850);
            }
        }
    });
}

// echoes staggered top menu logic with gsap in/out animations & orange sweeper leader
function initStaggeredMenu() {
    window.isMenuOpen = false;
    let isMenuBusy = false;
    let menuTimeline = null;

    const smWrapperEl = document.getElementById('staggered-menu-overlay');
    const smPanelEl = document.getElementById('staggered-menu-panel');
    const smToggleEl = document.getElementById('sm-toggle-btn');
    const smPreLayers = Array.from(document.querySelectorAll('.sm-prelayer'));
    const smItemLabels = Array.from(document.querySelectorAll('.sm-panel-itemLabel'));
    const smMenuItems = document.querySelectorAll('.sm-menu-item');

    if (typeof gsap !== 'undefined' && smPanelEl) {
        gsap.set(smPanelEl, { yPercent: -100 });
        if (smPreLayers.length) gsap.set(smPreLayers, { yPercent: -100 });
        if (smItemLabels.length) gsap.set(smItemLabels, { yPercent: 140, rotate: 10 });
    }

    function _animateIconOpen() {
        const toggleIcon = smToggleEl ? smToggleEl.querySelector('.sm-icon') : null;
        const toggleText = smToggleEl ? smToggleEl.querySelector('.sm-toggle-line') : null;
        if (toggleIcon && typeof gsap !== 'undefined') {
            gsap.to(toggleIcon, { rotate: 225, duration: 0.5, ease: 'power4.out', overwrite: 'auto' });
        }
        if (toggleText) toggleText.textContent = 'Close';
    }

    function _animateIconClose() {
        const toggleIcon = smToggleEl ? smToggleEl.querySelector('.sm-icon') : null;
        const toggleText = smToggleEl ? smToggleEl.querySelector('.sm-toggle-line') : null;
        if (toggleIcon && typeof gsap !== 'undefined') {
            gsap.to(toggleIcon, { rotate: 0, duration: 0.3, ease: 'power3.inOut', overwrite: 'auto' });
        }
        if (toggleText) toggleText.textContent = 'Menu';
    }

    function openStaggeredMenu() {
        if (isMenuBusy || window.isMenuOpen) return;
        isMenuBusy = true;
        window.isMenuOpen = true;

        if (smWrapperEl) {
            smWrapperEl.style.visibility = 'visible';
            smWrapperEl.style.pointerEvents = 'auto';
        }

        _animateIconOpen();

        if (typeof gsap === 'undefined' || !smPanelEl) {
            if (smPanelEl) smPanelEl.style.transform = 'translateY(0%)';
            isMenuBusy = false;
            return;
        }

        if (menuTimeline) menuTimeline.kill();

        if (smItemLabels.length) gsap.set(smItemLabels, { yPercent: 140, rotate: 10 });

        menuTimeline = gsap.timeline({ onComplete: () => { isMenuBusy = false; } });

        smPreLayers.forEach((layer, i) => {
            menuTimeline.fromTo(layer,
                { yPercent: -100 },
                { yPercent: 0, duration: 0.45, ease: 'power4.out' },
                i * 0.08
            );
        });

        const panelStart = 0.22;
        menuTimeline.fromTo(smPanelEl,
            { yPercent: -100 },
            { yPercent: 0, duration: 0.55, ease: 'power4.out' },
            panelStart
        );

        if (smItemLabels.length) {
            menuTimeline.to(smItemLabels, {
                yPercent: 0, rotate: 0,
                duration: 0.4, ease: 'power4.out',
                stagger: 0.04
            }, panelStart + 0.15);
        }
    }

    window.closeStaggeredMenu = function (callback) {
        if (!window.isMenuOpen) {
            if (callback) callback();
            return;
        }
        isMenuBusy = true;
        window.isMenuOpen = false;

        if (smWrapperEl) smWrapperEl.style.pointerEvents = 'none';
        _animateIconClose();

        if (typeof gsap === 'undefined' || !smPanelEl) {
            if (smPanelEl) smPanelEl.style.transform = 'translateY(-100%)';
            if (smWrapperEl) {
                smWrapperEl.style.visibility = 'hidden';
                smWrapperEl.style.pointerEvents = 'none';
            }
            isMenuBusy = false;
            if (callback) callback();
            return;
        }

        if (menuTimeline) menuTimeline.kill();

        const allPanels = [...smPreLayers, smPanelEl];
        gsap.to(allPanels, {
            yPercent: -100,
            duration: 0.35,
            ease: 'power3.in',
            stagger: { each: 0.04, from: 'end' },
            overwrite: 'auto',
            onComplete: () => {
                if (smItemLabels.length) gsap.set(smItemLabels, { yPercent: 140, rotate: 10 });
                if (smWrapperEl) {
                    smWrapperEl.style.visibility = 'hidden';
                    smWrapperEl.style.pointerEvents = 'none';
                }
                isMenuBusy = false;
                if (callback) callback();
            }
        });
    };

    if (smToggleEl) {
        smToggleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.isMenuOpen) {
                window.closeStaggeredMenu();
            } else {
                openStaggeredMenu();
            }
        });
    }

    smMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            window.closeStaggeredMenu();
        });
    });
}

// helper utilities for particletext canvas text animation
const hexToRgb = hex => {
    const clean = (hex || '').replace('#', '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16)
    };
};

const mixRgb = (from, to, amount) => ({
    r: Math.round(from.r + (to.r - from.r) * amount),
    g: Math.round(from.g + (to.g - from.g) * amount),
    b: Math.round(from.b + (to.b - from.b) * amount)
});

const rgbToCss = rgb => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

const resolveFontSize = (value, container, fontWeight, fontFamily) => {
    if (typeof value === 'number') return value;
    const probe = document.createElement('span');
    probe.textContent = 'M';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.fontSize = value;
    probe.style.fontWeight = String(fontWeight);
    probe.style.fontFamily = fontFamily;
    container.appendChild(probe);
    const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
    probe.remove();
    return size;
};

const waitForFonts = async font => {
    if (!('fonts' in document)) return;
    try {
        await document.fonts.load(font);
    } catch { }
    await document.fonts.ready;
};

class ParticleText {
    constructor(options, container) {
        this.container = container;
        this.text = options.text || 'NEEDHAM GRAVITY';
        this.particleSize = options.particleSize || 2.2;
        this.density = options.density || 4;
        this.color = options.color || '#f8fafc';
        this.highlightColor = options.highlightColor || '#f3c319';
        this.scatter = options.scatter !== undefined ? options.scatter : 190;
        this.gatherDuration = options.gatherDuration || 1600;
        this.stagger = options.stagger !== undefined ? options.stagger : 420;
        this.pointerRepel = options.pointerRepel !== undefined ? options.pointerRepel : 42;
        this.repelRadius = options.repelRadius !== undefined ? options.repelRadius : 120;
        this.idleDrift = options.idleDrift !== undefined ? options.idleDrift : 0.8;
        this.trigger = options.trigger || 'mount';
        this.fontSize = options.fontSize || 'clamp(3.5rem, 13vw, 9rem)';
        this.fontWeight = options.fontWeight || 900;
        this.fontFamily = options.fontFamily || "'Outfit', 'IBM Plex Mono', sans-serif";
        this.glow = options.glow !== undefined ? options.glow : true;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-text__canvas';
        this.canvas.style.display = 'block';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.particles = [];
        this.animationFrame = null;
        this.resizeFrame = null;
        this.buildId = 0;
        this.gathering = false;
        this.gatherStart = 0;
        this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        this.width = 0;
        this.height = 0;
        this.dpr = 1;

        this.pointer = {
            active: false,
            x: 0,
            y: 0,
            smoothX: 0,
            smoothY: 0
        };

        this.init();
    }

    startGather() {
        this.gathering = false;
    }

    drawParticle(particle) {
        const size = particle.size;
        this.ctx.fillStyle = particle.color;

        if (size <= 2.1) {
            this.ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
            return;
        }

        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    render(now) {
        if (!this.isVisible) {
            this.animationFrame = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.pointer.smoothX += (this.pointer.x - this.pointer.smoothX) * 0.18;
        this.pointer.smoothY += (this.pointer.y - this.pointer.smoothY) * 0.18;

        const driftTime = now * 0.0015;
        const isMobile = window.innerWidth < 600;

        this.particles.forEach(particle => {
            let baseX = particle.targetX;
            let baseY = particle.targetY;

            // subtle organic particle wiggle (reduced on mobile viewports)
            if (!this.reducedMotion && this.idleDrift > 0) {
                const wiggleAmp = isMobile ? 0.22 : 1.35;
                const wiggleX = Math.sin(driftTime * 2.8 + particle.seed * 25) * wiggleAmp * particle.depth;
                const wiggleY = Math.cos(driftTime * 2.4 + particle.depth * 25) * wiggleAmp * particle.depth;
                baseX += wiggleX;
                baseY += wiggleY;
            }

            if (this.pointer.active && !this.reducedMotion && this.pointerRepel > 0 && this.repelRadius > 0) {
                const dx = baseX - this.pointer.smoothX;
                const dy = baseY - this.pointer.smoothY;
                const distance = Math.hypot(dx, dy);
                if (distance > 0 && distance < this.repelRadius) {
                    const force = Math.pow(1 - distance / this.repelRadius, 2) * this.pointerRepel;
                    baseX += (dx / distance) * force;
                    baseY += (dy / distance) * force;
                }
            }

            const follow = this.reducedMotion ? 1 : 0.28;
            particle.x += (baseX - particle.x) * follow;
            particle.y += (baseY - particle.y) * follow;

            this.drawParticle(particle);
        });

        this.animationFrame = window.requestAnimationFrame(this.render.bind(this));
    }

    ensureRenderLoop() {
        if (this.animationFrame === null) {
            this.animationFrame = window.requestAnimationFrame(this.render.bind(this));
        }
    }

    async sampleText() {
        const currentBuild = ++this.buildId;
        const rect = this.container.getBoundingClientRect();
        this.width = Math.floor(rect.width);
        this.height = Math.floor(rect.height);

        if (this.width <= 0 || this.height <= 0) return;

        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
        this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        const computed = window.getComputedStyle(this.container);
        const resolvedFamily = this.fontFamily === 'inherit' ? computed.fontFamily || 'sans-serif' : this.fontFamily;

        const isMobile = window.innerWidth < 600;
        const textToDraw = isMobile ? 'NEEDHAM\nGRAVITY' : 'NEEDHAM GRAVITY';
        const lines = String(textToDraw || ' ').split('\n');

        let resolvedSize = resolveFontSize(this.fontSize, this.container, this.fontWeight, resolvedFamily);
        if (isMobile) resolvedSize = Math.min(resolvedSize, Math.max(34, window.innerWidth / 7.5));

        let font = `${this.fontWeight} ${resolvedSize}px ${resolvedFamily}`;

        await waitForFonts(font);
        if (currentBuild !== this.buildId) return;

        const offscreen = document.createElement('canvas');
        offscreen.width = Math.floor(this.width * this.dpr);
        offscreen.height = Math.floor(this.height * this.dpr);
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!offCtx) return;

        offCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        const maxTextWidth = this.width * 0.92;
        offCtx.font = font;

        let maxMeasuredWidth = 0;
        lines.forEach(line => {
            const m = offCtx.measureText(line);
            if (m.width > maxMeasuredWidth) maxMeasuredWidth = m.width;
        });

        if (maxMeasuredWidth > maxTextWidth) {
            resolvedSize = Math.max(18, resolvedSize * (maxTextWidth / maxMeasuredWidth));
            font = `${this.fontWeight} ${resolvedSize}px ${resolvedFamily}`;
            await waitForFonts(font);
            if (currentBuild !== this.buildId) return;
            offCtx.font = font;
        }

        const lineH = Math.ceil(resolvedSize * 1.08);
        const totalHeight = lineH * lines.length;

        offCtx.clearRect(0, 0, this.width, this.height);
        offCtx.font = font;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillStyle = '#ffffff';

        const startY = this.height / 2 - (totalHeight / 2) + (lineH / 2);
        lines.forEach((line, idx) => {
            offCtx.fillText(line, this.width / 2, startY + idx * lineH);
        });

        const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
        const targets = [];
        const step = isMobile ? 3 : 4;

        for (let y = 0; y < offscreen.height; y += step) {
            for (let x = 0; x < offscreen.width; x += step) {
                const alpha = imageData.data[(y * offscreen.width + x) * 4 + 3];
                if (alpha > 40) {
                    targets.push({
                        x: x / this.dpr,
                        y: y / this.dpr,
                        alpha: alpha / 255
                    });
                }
            }
        }

        const baseRgb = hexToRgb(this.color);
        const highlightRgb = hexToRgb(this.highlightColor);
        const currentParticleSize = isMobile ? 1.75 : this.particleSize;

        this.particles = targets.map((target, index) => {
            const seed = ((index * 9301 + 49297) % 233280) / 233280;
            const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;
            const blend = baseRgb && highlightRgb ? clamp(target.x / Math.max(1, this.width) + (seed - 0.5) * 0.35, 0, 1) : 0;
            const particleColor = baseRgb && highlightRgb ? rgbToCss(mixRgb(baseRgb, highlightRgb, blend)) : this.color;

            // micro-texture jitter for organic warmth while keeping retina grid alignment
            const offsetX = isMobile ? (seed - 0.5) * 0.35 : 0;
            const offsetY = isMobile ? (depth - 0.5) * 0.35 : 0;

            const posX = target.x + offsetX;
            const posY = target.y + offsetY;

            return {
                x: posX,
                y: posY,
                startX: posX,
                startY: posY,
                targetX: posX,
                targetY: posY,
                size: Math.max(0.6, currentParticleSize * (0.7 + target.alpha * 0.4)),
                color: particleColor,
                seed,
                depth,
                delay: 0
            };
        });

        this.pointer.x = this.width / 2;
        this.pointer.y = this.height / 2;
        this.pointer.smoothX = this.pointer.x;
        this.pointer.smoothY = this.pointer.y;

        if (this.reducedMotion) {
            this.particles.forEach(particle => {
                particle.x = particle.targetX;
                particle.y = particle.targetY;
                particle.startX = particle.targetX;
                particle.startY = particle.targetY;
                particle.delay = 0;
            });
            this.gathering = false;
        } else {
            this.startGather(false);
        }

        this.ensureRenderLoop();
    }

    queueSample() {
        if (this.resizeFrame) window.cancelAnimationFrame(this.resizeFrame);
        this.resizeFrame = window.requestAnimationFrame(this.sampleText.bind(this));
    }

    handlePointerMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = event.touches ? event.touches[0] : event;
        if (touch) {
            this.pointer.x = touch.clientX - rect.left;
            this.pointer.y = touch.clientY - rect.top;
            this.pointer.active = true;
        }
    }

    handlePointerLeave() {
        this.pointer.active = false;
    }

    handlePointerEnter(event) {
        this.handlePointerMove(event);
        if (this.trigger === 'hover') this.startGather(true);
    }

    handleTouchMove(event) {
        this.handlePointerMove(event);
    }

    handleTouchEnd() {
        this.pointer.active = false;
    }

    handleClick() {
        if (this.trigger === 'click') this.startGather(true);
    }

    init() {
        this.isVisible = true;
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerLeave = this.handlePointerLeave.bind(this);
        this.handlePointerEnter = this.handlePointerEnter.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.queueSample = this.queueSample.bind(this);

        this.canvas.addEventListener('pointerenter', this.handlePointerEnter);
        this.canvas.addEventListener('pointermove', this.handlePointerMove);
        this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
        this.canvas.addEventListener('click', this.handleClick);

        this.canvas.addEventListener('touchstart', this.handleTouchMove, { passive: true });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: true });

        this.intersectionObserver = new IntersectionObserver(([entry]) => {
            this.isVisible = entry.isIntersecting;
            if (this.isVisible) {
                this.ensureRenderLoop();
            } else if (this.animationFrame !== null) {
                window.cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
        }, { threshold: 0 });
        this.intersectionObserver.observe(this.container);

        this.resizeObserver = new ResizeObserver(this.queueSample);
        this.resizeObserver.observe(this.container);
        this.sampleText();
    }

    dispose() {
        this.buildId += 1;
        this.isVisible = false;
        if (this.intersectionObserver) this.intersectionObserver.disconnect();
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.canvas.removeEventListener('pointerenter', this.handlePointerEnter);
        this.canvas.removeEventListener('pointermove', this.handlePointerMove);
        this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
        this.canvas.removeEventListener('click', this.handleClick);

        this.canvas.removeEventListener('touchstart', this.handleTouchMove);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);

        if (this.animationFrame !== null) window.cancelAnimationFrame(this.animationFrame);
        if (this.resizeFrame !== null) window.cancelAnimationFrame(this.resizeFrame);
    }
}

let particleTextInstance = null;

function initParticleTextHeroTitle() {
    const container = document.getElementById('particle-text-container');
    if (!container) return;

    if (particleTextInstance) {
        particleTextInstance.dispose();
        particleTextInstance = null;
        container.innerHTML = '';
    }

    particleTextInstance = new ParticleText({
        text: 'NEEDHAM GRAVITY',
        particleSize: 2.2,
        density: 4,
        color: '#f8fafc',
        highlightColor: '#f3c319',
        scatter: 190,
        gatherDuration: 1600,
        stagger: 420,
        pointerRepel: 42,
        repelRadius: 120,
        idleDrift: 0.8,
        trigger: 'mount',
        fontSize: 'clamp(3.5rem, 13vw, 9rem)',
        fontWeight: 900,
        fontFamily: "'Outfit', 'IBM Plex Mono', sans-serif",
        glow: true
    }, container);
}



// backup email dispatch mirrors the primary contact form submission through Formspree
async function submitContactFormBackup(form, formData) {
    const formspreeEndpoint = form.getAttribute('data-formspree-endpoint');
    if (!formspreeEndpoint) return false;

    const backupData = new FormData();
    const formspreeCc = form.getAttribute('data-formspree-cc');

    for (const [key, value] of formData.entries()) {
        backupData.append(key, value);
    }

    if (formspreeCc) {
        backupData.append('_cc', formspreeCc);
    }

    backupData.append('_subject', 'Needham Gravity Contact Form Submission');

    try {
        const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            body: backupData,
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.ok;
    } catch {
        return false;
    }
}

// interactive subsystems cad fade out & callout transition
function initSubsystemsCADAnimation() {
    const track = document.getElementById('subsystems-track');
    const img1 = document.getElementById('cad-img-1');
    const img2 = document.getElementById('cad-img-2');
    const img3 = document.getElementById('cad-img-3');

    const cards = [
        document.getElementById('subsystem-card-1'),
        document.getElementById('subsystem-card-2'),
        document.getElementById('subsystem-card-3')
    ];

    if (!track || !img1 || !img2 || !img3) return;

    function updateCardColumnHeight() {
        const cardsColumn = document.querySelector('.subsystems-cards-column');
        if (!cardsColumn) return;

        if (window.innerWidth <= 900) {
            const activeCard = cardsColumn.querySelector('.subsystem-callout-card.active-stage');
            if (activeCard) {
                const cardHeight = activeCard.scrollHeight;
                cardsColumn.style.height = `${Math.max(cardHeight, 210)}px`;
            }
        } else {
            cardsColumn.style.height = '';
        }
    }

    function setStage(stageIndex) {
        cards.forEach((card, i) => {
            if (card) card.classList.toggle('active-stage', i === stageIndex);
        });
        updateCardColumnHeight();
    }

    window.addEventListener('resize', updateCardColumnHeight);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // responsive non-zooming fade out: all layers rendered centered at natural full scale (1.0)
        // top layers fade out cleanly to reveal pre-rendered opaque layers behind them!
        gsap.set(img1, { scale: 1.0, transformOrigin: '50% 50%', xPercent: 0, yPercent: 0, opacity: 1, zIndex: 5 });
        gsap.set(img2, { scale: 1.0, transformOrigin: '50% 50%', xPercent: 0, yPercent: 0, opacity: 0, zIndex: 4 });
        gsap.set(img3, { scale: 1.0, transformOrigin: '50% 50%', xPercent: 0, yPercent: 0, opacity: 0, zIndex: 3 });
        setStage(0);

        ScrollTrigger.create({
            trigger: track,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1,
            onUpdate: (self) => {
                const p = self.progress;
                if (p < 0.35) {
                    setStage(0);
                    img1.style.opacity = '1';
                    img2.style.opacity = '0';
                    img3.style.opacity = '0';
                } else if (p < 0.70) {
                    setStage(1);
                    img1.style.opacity = '0';
                    img2.style.opacity = '1';
                    img3.style.opacity = '0';
                } else {
                    setStage(2);
                    img1.style.opacity = '0';
                    img2.style.opacity = '0';
                    img3.style.opacity = '1';
                }
            }
        });
    } else {
        setStage(0);
    }
}

// animated light mode telemetry simulation feed
function initTelemetrySimulation() {
    const rpmVal = document.getElementById('tele-rpm');
    const speedVal = document.getElementById('tele-speed');
    const batteryVal = document.getElementById('tele-battery');
    const inclineVal = document.getElementById('tele-incline');
    const powerVal = document.getElementById('tele-power');
    const fillBar = document.getElementById('tele-bar-fill');

    if (!rpmVal) return;

    let barTrendUp = true;
    let currentBarPct = 65;

    setInterval(() => {
        const speed = (12.2 + (Math.random() * 1.6 - 0.8)).toFixed(1);
        const rpm = Math.floor(142 + (Math.random() * 14 - 7));
        const power = Math.floor(335 + (Math.random() * 26 - 13));
        const incline = (14.0 + (Math.random() * 1.0 - 0.5)).toFixed(1);

        if (speedVal) speedVal.innerText = speed;
        if (rpmVal) rpmVal.innerText = rpm;
        if (powerVal) powerVal.innerText = power;
        if (inclineVal) inclineVal.innerText = incline;

        if (barTrendUp) {
            currentBarPct += Math.floor(Math.random() * 6 + 3);
            if (currentBarPct >= 85) barTrendUp = false;
        } else {
            currentBarPct -= Math.floor(Math.random() * 6 + 3);
            if (currentBarPct <= 45) barTrendUp = true;
        }

        if (fillBar) {
            fillBar.style.width = `${currentBarPct}%`;
        }
    }, 1800);
}

// button click pop animation listener
function initClickPops() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        btn.classList.remove('btn-click-pop');
        void btn.offsetWidth;
        btn.classList.add('btn-click-pop');
    });
}

// project echoes style timeline scroll animation (vertical progress line & node activation)
function initTimelineScrollAnimation() {
    const timeline = document.querySelector('.timeline');
    const progressBar = document.querySelector('.timeline-progress-bar');
    const items = document.querySelectorAll('.timeline-item');

    if (!timeline || !progressBar || !items.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.set(progressBar, { height: '0%' });

        ScrollTrigger.create({
            trigger: timeline,
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: 0.1,
            onUpdate: (self) => {
                const progressPercent = Math.min(self.progress * 100, 100);
                progressBar.style.height = `${progressPercent}%`;

                const scrollY = window.scrollY || window.pageYOffset;
                const winHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;
                if (scrollY + winHeight >= docHeight - 50) {
                    progressBar.style.height = '100%';
                    items.forEach(item => {
                        const card = item.querySelector('.timeline-card');
                        const dot = item.querySelector('.timeline-dot');
                        if (card) card.classList.add('active');
                        if (dot) dot.classList.add('active');
                    });
                }
            }
        });

        // activate each node dot and timeline card when line reaches them
        items.forEach(item => {
            const card = item.querySelector('.timeline-card');
            const dot = item.querySelector('.timeline-dot');

            ScrollTrigger.create({
                trigger: item,
                start: 'top 75%',
                onEnter: () => {
                    if (card) card.classList.add('active');
                    if (dot) dot.classList.add('active');
                },
                onLeaveBack: () => {
                    if (card) card.classList.remove('active');
                    if (dot) dot.classList.remove('active');
                }
            });
        });
    }
}

// smooth & reliable scroll url updater (scroll spy)
function initScrollUrlUpdater() {
    const sectionIds = ['hero', 'about', 'team', 'meet-team', 'sponsors', 'contact', 'contact-form', 'roadmap'];
    let lastActiveRoute = window.location.pathname.replace(/\/$/, '') || '/';

    function updateActiveRouteOnScroll() {
        if (isProgrammaticScroll) return;
        if (document.body.classList.contains('is-contact-page')) return;

        const scrollY = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        let currentSectionId = 'hero';

        // 1. top of page -> hero
        if (scrollY < 100) {
            currentSectionId = 'hero';
        }
        // 2. bottom of page -> last section (roadmap)
        else if (windowHeight + scrollY >= documentHeight - 80) {
            currentSectionId = sectionIds[sectionIds.length - 1];
        }
        // 3. middle sections -> section covering viewport focal line (35% from top)
        else {
            const focalY = scrollY + (windowHeight * 0.35);
            let closestSection = sectionIds[0];
            let minDistance = Infinity;

            for (const id of sectionIds) {
                const elem = document.getElementById(id);
                if (!elem) continue;
                const rect = elem.getBoundingClientRect();
                const elemTop = rect.top + scrollY;
                const elemBottom = elemTop + rect.height;

                if (focalY >= elemTop && focalY < elemBottom) {
                    closestSection = id;
                    break;
                }

                const dist = Math.abs(elemTop - focalY);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestSection = id;
                }
            }
            currentSectionId = closestSection;
        }

        const newRoute = sectionToRouteMap[currentSectionId] || '/';

        if (window.location.pathname !== newRoute && lastActiveRoute !== newRoute) {
            lastActiveRoute = newRoute;
            history.replaceState(null, '', newRoute);
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveRouteOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// integrated google form preset buttons, phone formatting, & iframe submission feedback
function initIntegratedGoogleForm() {
    const form = document.getElementById('google-contact-form');
    const iframe = document.getElementById('hidden_gform_iframe');
    const donationInput = document.getElementById('entry-donation');
    const presetBtns = document.querySelectorAll('.donation-presets .preset-btn');
    const successBanner = document.getElementById('form-success-banner');
    const submitBtn = document.getElementById('gform-submit-btn');

    if (!form) return;

    let isFormSubmitting = false;
    let submitTimeout = null;

    function showSuccessState() {
        if (!isFormSubmitting) return;
        isFormSubmitting = false;
        if (submitTimeout) clearTimeout(submitTimeout);

        form.style.display = 'none';
        if (successBanner) successBanner.style.display = 'block';

        const formCard = form.closest('.custom-form-card') || form.closest('.custom-form-container');
        if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    const resetBtn = document.getElementById('gform-reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            form.style.display = 'block';
            if (successBanner) successBanner.style.display = 'none';
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Message <i class="fa-solid fa-paper-plane"></i>';
            }
        });
    }

    if (presetBtns.length && donationInput) {
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.getAttribute('data-amount');
                donationInput.value = amount;

                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        donationInput.addEventListener('input', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        isFormSubmitting = true;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting Message <i class="fa-solid fa-spinner fa-spin"></i>';
        }

        const formData = new FormData(form);
        const searchParams = new URLSearchParams(formData);
        const actionUrl = form.getAttribute('action');

        // Backup email dispatch runs in parallel so the main Google Apps Script flow stays primary.
        void submitContactFormBackup(form, formData);

        if (actionUrl && actionUrl !== '#') {
            fetch(actionUrl, {
                method: 'POST',
                body: searchParams,
                mode: 'no-cors'
            }).then(() => {
                showSuccessState();
            }).catch(() => {
                showSuccessState();
            });
        }

        submitTimeout = setTimeout(() => {
            showSuccessState();
        }, 600);
    });

    if (iframe) {
        iframe.addEventListener('load', () => {
            showSuccessState();
        });
    }
}

// automatic phone number input auto-formatter: (555) 000-0000
function initPhoneNumberFormatter() {
    const phoneInput = document.getElementById('entry-phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        if (!digits) {
            e.target.value = '';
            return;
        }
        if (digits.length <= 3) {
            e.target.value = `(${digits}`;
        } else if (digits.length <= 6) {
            e.target.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
            e.target.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
    });
}

// gsap accordion gallery logic
function initAccordionGallery() {
    const root = document.querySelector('.accordion-gallery');
    if (!root) return;

    const panels = Array.from(root.querySelectorAll('.ag-panel'));
    if (!panels.length) return;

    const count = panels.length;
    let active = 2;
    const expandRatio = 0.52;
    const tilt = 8;
    const parallax = 0.5;
    const duration = 0.6;
    const ease = 'power3.out';
    const stagger = 0.06;
    const gap = 10;

    let mediaSize = 320;
    let currentTL = null;

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    function measure() {
        const rect = root.getBoundingClientRect();
        const usable = Math.max(rect.width - gap * (count - 1), 120);
        mediaSize = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
        root.style.setProperty('--ag-media-size', `${mediaSize}px`);
        applyLayout(false);
    }

    function applyLayout(animate = true) {
        if (!panels.length) return;

        const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
        const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

        if (currentTL) currentTL.kill();
        const dur = animate && !prefersReduced ? duration : 0;

        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();

            panels.forEach((panel, i) => {
                const isActive = i === active;
                const media = panel.querySelector('.ag-panel__media');
                const bar = panel.querySelector('.ag-panel__bar');
                const text = panel.querySelector('.ag-panel__text');

                const rot = isActive ? 0 : (i < active ? tilt : -tilt);

                tl.to(panel, { flexGrow: isActive ? grow : 1, rotateY: rot, duration: dur, ease }, 0);

                if (media) {
                    const drift = Math.max(-1.5, Math.min(1.5, active - i));
                    const shift = drift * parallax * mediaSize * 0.06;
                    const gray = isActive ? 0 : 1;
                    const dim = isActive ? 0 : 0.35;

                    tl.to(media, {
                        xPercent: -50,
                        x: isActive ? 0 : shift,
                        '--ag-gray': gray,
                        '--ag-dim': dim,
                        duration: dur,
                        ease
                    }, 0);
                }

                if (bar && text) {
                    if (isActive) {
                        tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
                    } else {
                        tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
                    }
                }
            });

            currentTL = tl;
        } else {
            panels.forEach((panel, i) => {
                const isActive = i === active;
                panel.style.flexGrow = isActive ? grow : 1;
            });
        }
    }

    panels.forEach((panel, i) => {
        panel.addEventListener('mouseenter', () => {
            if (active !== i) {
                active = i;
                applyLayout(true);
            }
        });

        panel.addEventListener('focus', () => {
            if (active !== i) {
                active = i;
                applyLayout(true);
            }
        });

        panel.addEventListener('click', (e) => {
            if (active !== i) {
                e.preventDefault();
                active = i;
                applyLayout(true);
            }
        });
    });

    measure();
    window.addEventListener('resize', measure);
}