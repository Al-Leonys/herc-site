// needham gravity app logic - echoes gsap staggered menu, three.js canvascii title, & ogl halftonereveal background

// deployment sub-path (e.g. "/herc-site" on GitHub Pages project sites, "" at a domain root or local preview)
const BASE_PATH = (function() {
    try {
        if (window.location.protocol === 'file:') {
            return '';
        }

        const scriptSrc = document.currentScript && document.currentScript.src;
        if (scriptSrc) {
            const scriptPath = new URL(scriptSrc).pathname.replace(/\/js\/app\.js$/, '');
            if (scriptPath) return scriptPath;
        }

        const pathname = window.location.pathname || '';
        const cleanPath = pathname.replace(/\/(index|404)\.html$/, '').replace(/\/$/, '');

        if (window.location.hostname.endsWith('.github.io')) {
            const segments = cleanPath.split('/').filter(Boolean);
            return segments.length > 0 ? `/${segments[0]}` : '';
        }

        return '';
    } catch (e) {
        return '';
    }
})();

function withBase(path) {
    if (!BASE_PATH) return path;
    return path === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${path}`;
}

function stripBase(pathname) {
    if (BASE_PATH && pathname && pathname.indexOf(BASE_PATH) === 0) {
        return pathname.slice(BASE_PATH.length) || '/';
    }
    return pathname || '/';
}

function normalizeRoutePath(pathname) {
    const baseStrippedPath = stripBase(pathname || '');
    const cleanPath = baseStrippedPath.replace(/\/index\.html$/, '/').replace(/\/404\.html$/, '/');
    return cleanPath.replace(/\/$/, '') || '/';
}

function safeHistoryPush(url) {
    if (window.location.protocol === 'file:') return;
    try {
        history.pushState(null, '', url);
    } catch (err) {
        console.warn('[Router] pushState failed:', err);
    }
}

function safeHistoryReplace(url) {
    if (window.location.protocol === 'file:') return;
    try {
        history.replaceState(null, '', url);
    } catch (err) {
        console.warn('[Router] replaceState failed:', err);
    }
}

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
        initResourceSearchFilter,
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
    '/subsystems': 'subsystems',
    '/team': 'team',
    '/donors': 'donors',
    '/sponsors': 'donors',
    '/contact': 'contact',
    '/contact-form': 'contact-form',
    '/roadmap': 'roadmap',
    '/resources': 'resources',
    '/resources.html': 'resources',
    '/meet-team': 'team'
};

const sectionToRouteMap = {
    'hero': '/',
    'about': '/about',
    'subsystems': '/subsystems',
    'team': '/team',
    'donors': '/donors',
    'contact': '/contact',
    'contact-form': '/contact-form',
    'roadmap': '/roadmap',
    'resources': '/resources'
};

// handle clean route clicks and initial page load route restoration without hashtags
function scrollToSectionForPath(path, isInstant = false) {
    if (!path) return;
    const cleanPath = normalizeRoutePath(path);

    if (cleanPath === '/contact' || cleanPath === '/contact-form') {
        document.body.classList.remove('is-resources-page');
        document.body.classList.add('is-contact-page');
        window.scrollTo({ top: 0, behavior: 'auto' });
        safeHistoryReplace(withBase('/contact-form'));
        setTimeout(() => { initAccordionGallery(); }, 50);
        return;
    }

    if (cleanPath === '/resources' || cleanPath === '/resources.html') {
        document.body.classList.remove('is-contact-page');
        document.body.classList.add('is-resources-page');
        window.scrollTo({ top: 0, behavior: 'auto' });
        safeHistoryReplace(withBase('/resources'));
        initAeroShardsAnimation();
        return;
    }

    document.body.classList.remove('is-contact-page');
    document.body.classList.remove('is-resources-page');

    if (cleanPath === '/') {
        window.scrollTo({ top: 0, behavior: isInstant ? 'auto' : 'smooth' });
        safeHistoryReplace(withBase('/'));
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

    safeHistoryReplace(withBase(cleanPath));

    programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll = false;
    }, 850);
}

function initCleanRouteNavigation() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Check if coming from a 404 client-side redirect
    const redirectRoute = sessionStorage.getItem('redirect_route');
    if (redirectRoute) {
        sessionStorage.removeItem('redirect_route');
        const cleanPath = normalizeRoutePath(redirectRoute);
        if (cleanPath && cleanPath !== '/' && routeToSectionMap[cleanPath]) {
            scrollToSectionForPath(cleanPath, true);
            setTimeout(() => { scrollToSectionForPath(cleanPath, true); }, 100);
            setTimeout(() => { scrollToSectionForPath(cleanPath, false); }, 400);
        }
    } else {
        const currentRoute = normalizeRoutePath(window.location.pathname);
        if (currentRoute && currentRoute !== '/' && routeToSectionMap[currentRoute]) {
            scrollToSectionForPath(currentRoute, true);
            setTimeout(() => { scrollToSectionForPath(currentRoute, true); }, 100);
            setTimeout(() => { scrollToSectionForPath(currentRoute, false); }, 400);
        }
    }

    // fix root-relative nav links so they resolve under the deployment sub-path (e.g. GitHub Pages project sites)
    if (BASE_PATH) {
        document.querySelectorAll('a[href^="/"]').forEach((a) => {
            const href = a.getAttribute('href');
            if (href && href.indexOf(BASE_PATH) !== 0) {
                a.setAttribute('href', withBase(href));
            }
        });
    }

    window.addEventListener('popstate', () => {
        const currentPath = normalizeRoutePath(window.location.pathname);
        scrollToSectionForPath(currentPath, true);
    });

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-target], a[href^="/"], a[href*="resources"]');
        if (!link) return;

        const href = normalizeRoutePath(link.getAttribute('href') || '');
        if (link.getAttribute('target') === '_blank' || link.hasAttribute('download') || href.includes('.pdf') || href.endsWith('.pdf')) {
            return;
        }

        const dataTarget = link.getAttribute('data-target');

        let targetId = dataTarget;
        let routePath = href;

        if (!targetId && href) {
            const cleanHref = href.replace(/\/$/, '') || '/';
            targetId = routeToSectionMap[cleanHref];
        }

        if (targetId === 'contact-form' || routePath === '/contact-form' || routePath === '/contact') {
            e.preventDefault();
            document.body.classList.remove('is-resources-page');
            document.body.classList.add('is-contact-page');
            window.scrollTo({ top: 0, behavior: 'auto' });
            safeHistoryPush(withBase('/contact-form'));
            if (window.isMenuOpen && typeof window.closeStaggeredMenu === 'function') {
                window.closeStaggeredMenu();
            }
            setTimeout(() => { initAccordionGallery(); }, 50);
            return;
        }

        if (targetId === 'resources' || routePath === '/resources' || routePath === 'resources.html' || routePath === '/resources.html') {
            e.preventDefault();
            document.body.classList.remove('is-contact-page');
            document.body.classList.add('is-resources-page');
            window.scrollTo({ top: 0, behavior: 'auto' });
            safeHistoryPush(withBase('/resources'));
            if (window.isMenuOpen && typeof window.closeStaggeredMenu === 'function') {
                window.closeStaggeredMenu();
            }
            initAeroShardsAnimation();
            return;
        }

        document.body.classList.remove('is-contact-page');
        document.body.classList.remove('is-resources-page');

        if (targetId === 'hero' || routePath === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            safeHistoryPush(withBase('/'));
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

                safeHistoryPush(withBase(routePath));

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
        color: '#ffffff',
        highlightColor: '#ffd700',
        scatter: 190,
        gatherDuration: 1600,
        stagger: 420,
        pointerRepel: 0,
        repelRadius: 0,
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

// interactive subsystems image carousel & callout transition
function initSubsystemsCADAnimation() {
    const slides = Array.from(document.querySelectorAll('#diagram-viewport .carousel-slide'));
    const dots = Array.from(document.querySelectorAll('#subsystems-dots .carousel-dot'));
    const prevBtn = document.getElementById('subsystems-prev');
    const nextBtn = document.getElementById('subsystems-next');

    const cards = [
        document.getElementById('subsystem-card-1'),
        document.getElementById('subsystem-card-2'),
        document.getElementById('subsystem-card-3')
    ];

    if (!slides.length) return;

    let activeIndex = 0;

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

    function goToSlide(index) {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => slide.classList.toggle('active', i === activeIndex));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
        cards.forEach((card, i) => {
            if (card) card.classList.toggle('active-stage', i === activeIndex);
        });

        updateCardColumnHeight();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(activeIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(activeIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

    window.addEventListener('resize', updateCardColumnHeight);

    goToSlide(0);
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

        gsap.to(progressBar, {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: timeline,
                start: 'top 70%',
                end: 'bottom 85%',
                scrub: true,
                invalidateOnRefresh: true
            }
        });

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

        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);
    }
}

// smooth & reliable scroll url updater (scroll spy)
function initScrollUrlUpdater() {
    const sectionIds = ['hero', 'about', 'subsystems', 'team', 'donors', 'contact', 'contact-form', 'roadmap'];
    let lastActiveRoute = normalizeRoutePath(window.location.pathname);

    function updateActiveRouteOnScroll() {
        if (isProgrammaticScroll) return;
        if (document.body.classList.contains('is-contact-page') || document.body.classList.contains('is-resources-page')) return;

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

        if (normalizeRoutePath(window.location.pathname) !== newRoute && lastActiveRoute !== newRoute) {
            lastActiveRoute = newRoute;
            safeHistoryReplace(withBase(newRoute));
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

        // check native HTML5 form constraints
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // additional strict validation: trim fields to ensure not blank/whitespace-only and check email format
        const nameInput = document.getElementById('entry-name');
        const emailInput = document.getElementById('entry-email');
        const companyInput = document.getElementById('entry-company');

        if (nameInput && !nameInput.value.trim()) {
            nameInput.focus();
            form.reportValidity();
            return;
        }

        if (emailInput) {
            const emailVal = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailVal || !emailRegex.test(emailVal)) {
                emailInput.focus();
                form.reportValidity();
                return;
            }
        }

        if (companyInput && !companyInput.value.trim()) {
            companyInput.focus();
            form.reportValidity();
            return;
        }

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

// automatic international & domestic phone number input auto-formatter with predictive formatting and 400ms flag lookup
function initPhoneNumberFormatter() {
    const phoneInput = document.getElementById('entry-phone');
    const flagBadge = document.getElementById('phone-flag-badge');
    if (!phoneInput) return;

    const COUNTRY_CODES = [
        // 1-digit codes
        { code: '1', flag: '🇺🇸', name: 'US/Canada' },
        { code: '7', flag: '🇷🇺', name: 'Russia/Kazakhstan' },

        // 2-digit codes
        { code: '20', flag: '🇪🇬', name: 'Egypt' },
        { code: '27', flag: '🇿🇦', name: 'South Africa' },
        { code: '30', flag: '🇬🇷', name: 'Greece' },
        { code: '31', flag: '🇳🇱', name: 'Netherlands' },
        { code: '32', flag: '🇧🇪', name: 'Belgium' },
        { code: '33', flag: '🇫🇷', name: 'France' },
        { code: '34', flag: '🇪🇸', name: 'Spain' },
        { code: '36', flag: '🇭🇺', name: 'Hungary' },
        { code: '39', flag: '🇮🇹', name: 'Italy' },
        { code: '40', flag: '🇷🇴', name: 'Romania' },
        { code: '41', flag: '🇨🇭', name: 'Switzerland' },
        { code: '43', flag: '🇦🇹', name: 'Austria' },
        { code: '44', flag: '🇬🇧', name: 'United Kingdom' },
        { code: '45', flag: '🇩🇰', name: 'Denmark' },
        { code: '46', flag: '🇸🇪', name: 'Sweden' },
        { code: '47', flag: '🇳🇴', name: 'Norway' },
        { code: '48', flag: '🇵🇱', name: 'Poland' },
        { code: '49', flag: '🇩🇪', name: 'Germany' },
        { code: '51', flag: '🇵🇪', name: 'Peru' },
        { code: '52', flag: '🇲🇽', name: 'Mexico' },
        { code: '53', flag: '🇨🇺', name: 'Cuba' },
        { code: '54', flag: '🇦🇷', name: 'Argentina' },
        { code: '55', flag: '🇧🇷', name: 'Brazil' },
        { code: '56', flag: '🇨🇱', name: 'Chile' },
        { code: '57', flag: '🇨🇴', name: 'Colombia' },
        { code: '58', flag: '🇻🇪', name: 'Venezuela' },
        { code: '60', flag: '🇲🇾', name: 'Malaysia' },
        { code: '61', flag: '🇦🇺', name: 'Australia' },
        { code: '62', flag: '🇮🇩', name: 'Indonesia' },
        { code: '63', flag: '🇵🇭', name: 'Philippines' },
        { code: '64', flag: '🇳🇿', name: 'New Zealand' },
        { code: '65', flag: '🇸🇬', name: 'Singapore' },
        { code: '66', flag: '🇹🇭', name: 'Thailand' },
        { code: '81', flag: '🇯🇵', name: 'Japan' },
        { code: '82', flag: '🇰🇷', name: 'South Korea' },
        { code: '84', flag: '🇻🇳', name: 'Vietnam' },
        { code: '86', flag: '🇨🇳', name: 'China' },
        { code: '90', flag: '🇹🇷', name: 'Turkey' },
        { code: '91', flag: '🇮🇳', name: 'India' },
        { code: '92', flag: '🇵🇰', name: 'Pakistan' },
        { code: '93', flag: '🇦🇫', name: 'Afghanistan' },
        { code: '94', flag: '🇱🇰', name: 'Sri Lanka' },
        { code: '95', flag: '🇲🇲', name: 'Myanmar' },
        { code: '98', flag: '🇮🇷', name: 'Iran' },

        // 3-digit codes
        { code: '211', flag: '🇸🇸', name: 'South Sudan' },
        { code: '212', flag: '🇲🇦', name: 'Morocco' },
        { code: '213', flag: '🇩🇿', name: 'Algeria' },
        { code: '216', flag: '🇹🇳', name: 'Tunisia' },
        { code: '218', flag: '🇱🇾', name: 'Libya' },
        { code: '220', flag: '🇬🇲', name: 'Gambia' },
        { code: '221', flag: '🇸🇳', name: 'Senegal' },
        { code: '222', flag: '🇲🇷', name: 'Mauritania' },
        { code: '223', flag: '🇲🇱', name: 'Mali' },
        { code: '224', flag: '🇬🇳', name: 'Guinea' },
        { code: '225', flag: '🇨🇮', name: 'Ivory Coast' },
        { code: '226', flag: '🇧🇫', name: 'Burkina Faso' },
        { code: '227', flag: '🇳🇪', name: 'Niger' },
        { code: '228', flag: '🇹🇬', name: 'Togo' },
        { code: '229', flag: '🇧🇯', name: 'Benin' },
        { code: '230', flag: '🇲🇺', name: 'Mauritius' },
        { code: '231', flag: '🇱🇷', name: 'Liberia' },
        { code: '232', flag: '🇸🇱', name: 'Sierra Leone' },
        { code: '233', flag: '🇬🇭', name: 'Ghana' },
        { code: '234', flag: '🇳🇬', name: 'Nigeria' },
        { code: '235', flag: '🇹🇩', name: 'Chad' },
        { code: '236', flag: '🇨🇫', name: 'Central African Republic' },
        { code: '237', flag: '🇨🇲', name: 'Cameroon' },
        { code: '238', flag: '🇨🇻', name: 'Cape Verde' },
        { code: '239', flag: '🇸🇹', name: 'Sao Tome and Principe' },
        { code: '240', flag: '🇬🇶', name: 'Equatorial Guinea' },
        { code: '241', flag: '🇬🇦', name: 'Gabon' },
        { code: '242', flag: '🇨🇬', name: 'Republic of the Congo' },
        { code: '243', flag: '🇨🇩', name: 'DR Congo' },
        { code: '244', flag: '🇦🇴', name: 'Angola' },
        { code: '245', flag: '🇬🇼', name: 'Guinea-Bissau' },
        { code: '248', flag: '🇸🇨', name: 'Seychelles' },
        { code: '249', flag: '🇸🇩', name: 'Sudan' },
        { code: '250', flag: '🇷🇼', name: 'Rwanda' },
        { code: '251', flag: '🇪🇹', name: 'Ethiopia' },
        { code: '252', flag: '🇸🇴', name: 'Somalia' },
        { code: '253', flag: '🇩🇯', name: 'Djibouti' },
        { code: '254', flag: '🇰🇪', name: 'Kenya' },
        { code: '255', flag: '🇹🇿', name: 'Tanzania' },
        { code: '256', flag: '🇺🇬', name: 'Uganda' },
        { code: '257', flag: '🇧🇮', name: 'Burundi' },
        { code: '258', flag: '🇲🇿', name: 'Mozambique' },
        { code: '260', flag: '🇿🇲', name: 'Zambia' },
        { code: '261', flag: '🇲🇬', name: 'Madagascar' },
        { code: '263', flag: '🇿🇼', name: 'Zimbabwe' },
        { code: '264', flag: '🇳🇦', name: 'Namibia' },
        { code: '265', flag: '🇲🇼', name: 'Malawi' },
        { code: '266', flag: '🇱🇸', name: 'Lesotho' },
        { code: '267', flag: '🇧🇼', name: 'Botswana' },
        { code: '268', flag: '🇸🇿', name: 'Eswatini' },
        { code: '269', flag: '🇰🇲', name: 'Comoros' },
        { code: '297', flag: '🇦🇼', name: 'Aruba' },
        { code: '298', flag: '🇫🇴', name: 'Faroe Islands' },
        { code: '299', flag: '🇬🇱', name: 'Greenland' },
        { code: '350', flag: '🇬🇮', name: 'Gibraltar' },
        { code: '351', flag: '🇵🇹', name: 'Portugal' },
        { code: '352', flag: '🇱🇺', name: 'Luxembourg' },
        { code: '353', flag: '🇮🇪', name: 'Ireland' },
        { code: '354', flag: '🇮🇸', name: 'Iceland' },
        { code: '355', flag: '🇦🇱', name: 'Albania' },
        { code: '356', 'flag': '🇲🇹', name: 'Malta' },
        { code: '357', flag: '🇨🇾', name: 'Cyprus' },
        { code: '358', flag: '🇫🇮', name: 'Finland' },
        { code: '359', flag: '🇧🇬', name: 'Bulgaria' },
        { code: '370', flag: '🇱🇹', name: 'Lithuania' },
        { code: '371', flag: '🇱🇻', name: 'Latvia' },
        { code: '372', flag: '🇪🇪', name: 'Estonia' },
        { code: '373', flag: '🇲🇩', name: 'Moldova' },
        { code: '374', flag: '🇦🇲', name: 'Armenia' },
        { code: '375', flag: '🇧🇾', name: 'Belarus' },
        { code: '376', flag: '🇦🇩', name: 'Andorra' },
        { code: '377', flag: '🇲🇨', name: 'Monaco' },
        { code: '378', flag: '🇸🇲', name: 'San Marino' },
        { code: '380', flag: '🇺🇦', name: 'Ukraine' },
        { code: '381', flag: '🇷🇸', name: 'Serbia' },
        { code: '382', flag: '🇲🇪', name: 'Montenegro' },
        { code: '383', flag: '🇽🇰', name: 'Kosovo' },
        { code: '385', flag: '🇭🇷', name: 'Croatia' },
        { code: '386', flag: '🇸🇮', name: 'Slovenia' },
        { code: '387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
        { code: '389', flag: '🇲🇰', name: 'North Macedonia' },
        { code: '420', flag: '🇨🇿', name: 'Czech Republic' },
        { code: '421', flag: '🇸🇰', name: 'Slovakia' },
        { code: '423', flag: '🇱🇮', name: 'Liechtenstein' },
        { code: '501', flag: '🇧🇿', name: 'Belize' },
        { code: '502', flag: '🇬🇹', name: 'Guatemala' },
        { code: '503', flag: '🇸🇻', name: 'El Salvador' },
        { code: '504', flag: '🇭🇳', name: 'Honduras' },
        { code: '505', flag: '🇳🇮', name: 'Nicaragua' },
        { code: '506', flag: '🇨🇷', name: 'Costa Rica' },
        { code: '507', flag: '🇵🇦', name: 'Panama' },
        { code: '508', flag: '🇵🇲', name: 'Saint Pierre and Miquelon' },
        { code: '509', flag: '🇭🇹', name: 'Haiti' },
        { code: '590', flag: '🇬🇵', name: 'Guadeloupe' },
        { code: '591', flag: '🇧🇴', name: 'Bolivia' },
        { code: '592', flag: '🇬🇾', name: 'Guyana' },
        { code: '593', flag: '🇪🇨', name: 'Ecuador' },
        { code: '594', flag: '🇬🇫', name: 'French Guiana' },
        { code: '595', flag: '🇵🇾', name: 'Paraguay' },
        { code: '596', flag: '🇲🇶', name: 'Martinique' },
        { code: '597', flag: '🇸🇷', name: 'Suriname' },
        { code: '598', flag: '🇺🇾', name: 'Uruguay' },
        { code: '599', flag: '🇨🇼', name: 'Curaçao' },
        { code: '670', flag: '🇹🇱', name: 'East Timor' },
        { code: '673', flag: '🇧🇳', name: 'Brunei' },
        { code: '674', flag: '🇳🇷', name: 'Nauru' },
        { code: '675', flag: '🇵🇬', name: 'Papua New Guinea' },
        { code: '676', flag: '🇹🇴', name: 'Tonga' },
        { code: '677', flag: '🇸🇧', name: 'Solomon Islands' },
        { code: '678', flag: '🇻🇺', name: 'Vanuatu' },
        { code: '679', flag: '🇫🇯', name: 'Fiji' },
        { code: '680', flag: '🇵🇼', name: 'Palau' },
        { code: '685', flag: '🇼🇸', name: 'Samoa' },
        { code: '686', flag: '🇰🇮', name: 'Kiribati' },
        { code: '687', flag: '🇳🇨', name: 'New Caledonia' },
        { code: '689', flag: '🇵🇫', name: 'French Polynesia' },
        { code: '850', flag: '🇰🇵', name: 'North Korea' },
        { code: '852', flag: '🇭🇰', name: 'Hong Kong' },
        { code: '853', flag: '🇲🇴', name: 'Macau' },
        { code: '855', flag: '🇰🇭', name: 'Cambodia' },
        { code: '856', flag: '🇱🇦', name: 'Laos' },
        { code: '880', flag: '🇧🇩', name: 'Bangladesh' },
        { code: '886', flag: '🇹🇼', name: 'Taiwan' },
        { code: '960', flag: '🇲🇻', name: 'Maldives' },
        { code: '961', flag: '🇱🇧', name: 'Lebanon' },
        { code: '962', flag: '🇯🇴', name: 'Jordan' },
        { code: '963', flag: '🇸🇾', name: 'Syria' },
        { code: '964', flag: '🇮🇶', name: 'Iraq' },
        { code: '965', flag: '🇰🇼', name: 'Kuwait' },
        { code: '966', flag: '🇸🇦', name: 'Saudi Arabia' },
        { code: '967', flag: '🇾🇪', name: 'Yemen' },
        { code: '968', flag: '🇴🇲', name: 'Oman' },
        { code: '970', flag: '🇵🇸', name: 'Palestine' },
        { code: '971', flag: '🇦🇪', name: 'UAE' },
        { code: '972', flag: '🇮🇱', name: 'Israel' },
        { code: '973', flag: '🇧🇭', name: 'Bahrain' },
        { code: '974', flag: '🇶🇦', name: 'Qatar' },
        { code: '975', flag: '🇧🇹', name: 'Bhutan' },
        { code: '976', 'flag': '🇲🇳', name: 'Mongolia' },
        { code: '977', flag: '🇳🇵', name: 'Nepal' },
        { code: '992', flag: '🇹🇯', name: 'Tajikistan' },
        { code: '993', flag: '🇹🇲', name: 'Turkmenistan' },
        { code: '994', flag: '🇦🇿', name: 'Azerbaijan' },
        { code: '995', flag: '🇬🇪', name: 'Georgia' },
        { code: '996', flag: '🇰🇬', name: 'Kyrgyzstan' },
        { code: '998', flag: '🇺🇿', name: 'Uzbekistan' }
    ];

    // Sort by code length descending (3-digit first, 2-digit, 1-digit) for longest prefix matching
    const SORTED_CODES = COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length);

    function findCountryByDigits(digitStr) {
        for (const entry of SORTED_CODES) {
            if (digitStr.startsWith(entry.code)) {
                return entry;
            }
        }
        return null;
    }

    function formatNationalDigits(digits) {
        if (!digits) return '';
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
        // Up to 15 digits (E.164 max limit for non-10-digit countries like UK/China/Germany)
        return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
    }

    let flagDebounceTimer = null;

    function updateFlagIcon(emoji) {
        if (flagBadge) {
            flagBadge.textContent = emoji || '🌐';
        }
    }

    function triggerFlagLookup(rawVal) {
        if (flagDebounceTimer) clearTimeout(flagDebounceTimer);
        flagDebounceTimer = setTimeout(() => {
            const val = rawVal.trim();
            if (!val) {
                updateFlagIcon('🌐');
                return;
            }
            const digits = val.replace(/\D/g, '');
            if (val.startsWith('+')) {
                const country = findCountryByDigits(digits);
                updateFlagIcon(country ? country.flag : '🌐');
            } else {
                if (digits.length >= 3) {
                    updateFlagIcon('🇺🇸');
                } else {
                    updateFlagIcon('🌐');
                }
            }
        }, 400);
    }

    phoneInput.addEventListener('input', (e) => {
        const raw = e.target.value;
        const isInternational = raw.trim().startsWith('+');

        if (isInternational) {
            // International mode: digits after + up to 15 digits (E.164 standard)
            const digits = raw.replace(/\D/g, '').slice(0, 15);
            if (!digits) {
                e.target.value = '+';
                triggerFlagLookup('+');
                return;
            }

            const country = findCountryByDigits(digits);
            if (country) {
                const countryCode = country.code;
                const nationalDigits = digits.slice(countryCode.length);

                if (countryCode === '1') {
                    // NANP (US/Canada): +1 (AAA) BBB-CCCC
                    if (!nationalDigits) {
                        e.target.value = `+1`;
                    } else if (nationalDigits.length <= 3) {
                        e.target.value = `+1 (${nationalDigits}`;
                    } else if (nationalDigits.length <= 6) {
                        e.target.value = `+1 (${nationalDigits.slice(0, 3)}) ${nationalDigits.slice(3)}`;
                    } else {
                        e.target.value = `+1 (${nationalDigits.slice(0, 3)}) ${nationalDigits.slice(3, 6)}-${nationalDigits.slice(6)}`;
                    }
                } else {
                    // Global non-10-digit formats (UK, China, Europe, Asia, etc.)
                    const formattedNat = formatNationalDigits(nationalDigits);
                    e.target.value = `+${countryCode}` + (formattedNat ? ` ${formattedNat}` : '');
                }
            } else {
                // Predictive formatting while entering country code
                if (digits.length <= 3) {
                    e.target.value = `+${digits}`;
                } else {
                    e.target.value = `+${digits.slice(0, 3)} ${digits.slice(3)}`;
                }
            }
        } else {
            // Domestic US/Canada 10-digit formatting fallback: (AAA) BBB-CCCC
            const digits = raw.replace(/\D/g, '').slice(0, 10);
            if (!digits) {
                e.target.value = '';
                triggerFlagLookup('');
                return;
            }
            if (digits.length <= 3) {
                e.target.value = `(${digits}`;
            } else if (digits.length <= 6) {
                e.target.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else {
                e.target.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
        }

        triggerFlagLookup(e.target.value);
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

// AeroShards is rendered by Vite/React in #aero-shards-root (src/AeroShards.jsx)
function initAeroShardsAnimation() {}


// Real-time resource search filtering
function initResourceSearchFilter() {
    const searchInput = document.getElementById('resource-search-input');
    const items = document.querySelectorAll('.resource-list-item');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            items.forEach(item => {
                const titleEl = item.querySelector('.resource-item-title');
                const descEl = item.querySelector('.resource-item-desc');
                const title = titleEl ? titleEl.textContent.toLowerCase() : '';
                const desc = descEl ? descEl.textContent.toLowerCase() : '';
                const category = (item.getAttribute('data-category') || '').toLowerCase();

                if (!query || title.includes(query) || desc.includes(query) || category.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}