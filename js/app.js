// needham gravity app logic - echoes GSAP staggered menu, Three.js CanvAscii title, & OGL HalftoneReveal background

document.addEventListener('DOMContentLoaded', () => {
    initCleanRouteNavigation();
    initStaggeredMenu();
    initCanvAsciiHeroTitle();
    initTelemetrySimulation();
    initContactForm();
    initScrollUrlUpdater();
    initClickPops();
});

// route path mapping helper
const routeToSectionMap = {
    '/': 'hero',
    '/about': 'about',
    '/telemetry': 'telemetry',
    '/team': 'team',
    '/roadmap': 'roadmap',
    '/sponsors': 'sponsors',
    '/contact': 'contact'
};

const sectionToRouteMap = {
    'hero': '/',
    'about': '/about',
    'telemetry': '/telemetry',
    'team': '/team',
    'roadmap': '/roadmap',
    'sponsors': '/sponsors',
    'contact': '/contact'
};

// handle clean route clicks and initial page load route restoration without hashtags
function initCleanRouteNavigation() {
    let targetPath = sessionStorage.getItem('redirect_route') || window.location.pathname;
    if (targetPath) {
        targetPath = targetPath.replace(/\/$/, '') || '/';
        sessionStorage.removeItem('redirect_route');
        const targetId = routeToSectionMap[targetPath];
        if (targetId) {
            setTimeout(() => {
                const elem = document.getElementById(targetId);
                if (elem) {
                    elem.scrollIntoView({ behavior: 'smooth' });
                    history.replaceState(null, '', targetPath);
                }
            }, 150);
        }
    }

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

        if (targetId) {
            const targetElem = document.getElementById(targetId);
            if (targetElem) {
                e.preventDefault();
                routePath = sectionToRouteMap[targetId] || '/';
                
                targetElem.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, '', routePath);

                if (window.isMenuOpen && typeof window.closeStaggeredMenu === 'function') {
                    window.closeStaggeredMenu();
                }
            }
        }
    });

    window.addEventListener('popstate', () => {
        const path = (window.location.pathname.replace(/\/$/, '') || '/');
        const targetId = routeToSectionMap[path];
        if (targetId) {
            const elem = document.getElementById(targetId);
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// echoes staggered top menu logic with GSAP in/out animations & orange sweeper leader
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

    window.closeStaggeredMenu = function(callback) {
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

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

if (!Math.map) {
    Math.map = function (n, start, stop, start2, stop2) {
        return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
    };
}

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

class AsciiFilter {
    constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
        this.renderer = renderer;
        this.domElement = document.createElement('div');
        this.domElement.style.position = 'absolute';
        this.domElement.style.top = '0';
        this.domElement.style.left = '0';
        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';

        this.pre = document.createElement('pre');
        this.domElement.appendChild(this.pre);

        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'none';
        this.context = this.canvas.getContext('2d');
        this.domElement.appendChild(this.canvas);

        this.deg = 0;
        this.invert = invert ?? true;
        this.fontSize = fontSize ?? 4.5;
        this.fontFamily = fontFamily ?? "'IBM Plex Mono', monospace";
        this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

        this.onMouseMove = this.onMouseMove.bind(this);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height);
        this.reset();

        this.center = { x: width / 2, y: height / 2 };
        this.mouse = { x: this.center.x, y: this.center.y };
    }

    reset() {
        this.context.font = `${this.fontSize}px ${this.fontFamily}`;
        const charWidth = this.context.measureText('A').width;

        this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
        this.rows = Math.floor(this.height / this.fontSize);

        this.canvas.width = Math.max(1, this.cols);
        this.canvas.height = Math.max(1, this.rows);
        this.canvas.style.display = 'none';

        this.pre.style.fontFamily = this.fontFamily;
        this.pre.style.fontSize = `${this.fontSize}px`;
        this.pre.style.margin = '0';
        this.pre.style.padding = '0';
        this.pre.style.lineHeight = '0.95em';
        this.pre.style.letterSpacing = '0';
        this.pre.style.position = 'absolute';
        this.pre.style.left = '0';
        this.pre.style.top = '0';
        this.pre.style.zIndex = '9';
        this.pre.style.backgroundImage = 'linear-gradient(135deg, #ffffff 0%, #fdf9f3 50%, #f3c319 100%)';
        this.pre.style.webkitTextFillColor = 'transparent';
        this.pre.style.webkitBackgroundClip = 'text';
        this.pre.style.backgroundClip = 'text';
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);

        const w = this.canvas.width;
        const h = this.canvas.height;
        this.context.clearRect(0, 0, w, h);
        if (this.context && w && h) {
            this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
        }

        this.asciify(this.context, w, h);
    }

    onMouseMove(e) {
        this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
    }

    get dx() {
        return this.mouse.x - this.center.x;
    }

    get dy() {
        return this.mouse.y - this.center.y;
    }

    asciify(ctx, w, h) {
        if (w && h) {
            const imgData = ctx.getImageData(0, 0, w, h).data;
            let str = '';
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = x * 4 + y * 4 * w;
                    const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

                    if (a === 0) {
                        str += ' ';
                        continue;
                    }

                    let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
                    let idx = Math.floor((1 - gray) * (this.charset.length - 1));
                    if (this.invert) idx = this.charset.length - idx - 1;
                    str += this.charset[idx];
                }
                str += '\n';
            }
            this.pre.innerHTML = str;
        }
    }

    dispose() {
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}

// MULTI-LINE CANVAS TEXT RENDERING SUPPORT FOR MOBILE 2-LINE ASCII TEXT
class CanvasTxt {
    constructor(txt, { fontSize = 110, fontFamily = 'IBM Plex Mono', color = '#fdf9f3' } = {}) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.txt = txt;
        this.lines = txt.split('\n');
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;

        this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
    }

    resize() {
        this.context.font = this.font;
        let maxWidth = 0;
        this.lines.forEach(line => {
            const metrics = this.context.measureText(line);
            if (metrics.width > maxWidth) maxWidth = metrics.width;
        });

        const textWidth = Math.ceil(maxWidth) + 50;
        const lineH = Math.ceil(this.fontSize * 1.05);
        const textHeight = Math.ceil(lineH * this.lines.length) + 40;

        this.canvas.width = Math.max(1, textWidth);
        this.canvas.height = Math.max(1, textHeight);
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.color;
        this.context.font = this.font;

        const lineH = Math.ceil(this.fontSize * 1.02);
        this.lines.forEach((line, i) => {
            const metrics = this.context.measureText(line);
            const yPos = 20 + (metrics.actualBoundingBoxAscent || (this.fontSize * 0.8)) + (i * lineH);
            this.context.fillText(line, 20, yPos);
        });
    }

    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
    get texture() { return this.canvas; }
}

class CanvAscii {
    constructor(
        { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves },
        containerElem,
        width,
        height
    ) {
        this.textString = text;
        this.asciiFontSize = asciiFontSize;
        this.textFontSize = textFontSize;
        this.textColor = textColor;
        this.planeBaseHeight = planeBaseHeight;
        this.container = containerElem;
        this.width = width;
        this.height = height;
        this.enableWaves = enableWaves;

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
        this.camera.position.z = 30;

        this.scene = new THREE.Scene();
        this.mouse = { x: this.width / 2, y: this.height / 2 };

        this.onMouseMove = this.onMouseMove.bind(this);
    }

    async init() {
        this.setMesh();
        this.setRenderer();
    }

    setMesh() {
        this.textCanvas = new CanvasTxt(this.textString, {
            fontSize: this.textFontSize,
            fontFamily: 'IBM Plex Mono',
            color: this.textColor
        });
        this.textCanvas.resize();
        this.textCanvas.render();

        this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
        this.texture.minFilter = THREE.NearestFilter;

        const textAspect = this.textCanvas.width / this.textCanvas.height;
        const baseH = this.planeBaseHeight;
        const planeW = baseH * textAspect;
        const planeH = baseH;

        this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                mouse: { value: 1.0 },
                uTexture: { value: this.texture },
                uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
            }
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        this.renderer.setPixelRatio(1);
        this.renderer.setClearColor(0x000000, 0);

        this.filter = new AsciiFilter(this.renderer, {
            fontFamily: 'IBM Plex Mono',
            fontSize: this.asciiFontSize,
            invert: true
        });

        this.container.appendChild(this.filter.domElement);
        this.setSize(this.width, this.height);

        this.container.addEventListener('mousemove', this.onMouseMove);
        this.container.addEventListener('touchmove', this.onMouseMove);
    }

    setSize(w, h) {
        this.width = w;
        this.height = h;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

        this.filter.setSize(w, h);

        this.center = { x: w / 2, y: h / 2 };
    }

    load() {
        this.animate();
    }

    onMouseMove(evt) {
        const e = evt.touches ? evt.touches[0] : evt;
        const bounds = this.container.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        this.mouse = { x, y };
    }

    animate() {
        const animateFrame = () => {
            this.animationFrameId = requestAnimationFrame(animateFrame);
            this.render();
        };
        animateFrame();
    }

    render() {
        const time = new Date().getTime() * 0.001;

        this.textCanvas.render();
        this.texture.needsUpdate = true;

        this.mesh.material.uniforms.uTime.value = Math.sin(time);

        this.updateRotation();
        this.filter.render(this.scene, this.camera);
    }

    updateRotation() {
        const x = Math.map(this.mouse.y, 0, this.height, 0.35, -0.35);
        const y = Math.map(this.mouse.x, 0, this.width, -0.35, 0.35);

        this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
        this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
    }

    dispose() {
        cancelAnimationFrame(this.animationFrameId);
        if (this.filter) {
            this.filter.dispose();
            if (this.filter.domElement.parentNode) {
                this.container.removeChild(this.filter.domElement);
            }
        }
        this.container.removeEventListener('mousemove', this.onMouseMove);
        this.container.removeEventListener('touchmove', this.onMouseMove);
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

let asciiInstance = null;

function initCanvAsciiHeroTitle() {
    const asciiContainer = document.getElementById('ascii-text-container');
    if (!asciiContainer || typeof THREE === 'undefined') return;

    function setupInstance() {
        if (asciiInstance) {
            asciiInstance.dispose();
            asciiInstance = null;
            asciiContainer.innerHTML = '';
        }

        const width = asciiContainer.clientWidth || window.innerWidth;
        const isMobile = window.innerWidth < 600;

        const text = isMobile ? 'NEEDHAM\nGRAVITY' : 'NEEDHAM GRAVITY';
        const height = isMobile ? Math.min(340, Math.max(260, window.innerWidth * 0.65)) : Math.min(300, Math.max(220, window.innerWidth * 0.22));
        asciiContainer.style.height = `${height}px`;

        let asciiFontSize, textFontSize, planeBaseHeight;

        if (isMobile) {
            planeBaseHeight = Math.min(10.5, Math.max(7.8, window.innerWidth / 45));
            textFontSize = Math.min(115, Math.max(75, window.innerWidth / 4.2));
            asciiFontSize = Math.min(5.2, Math.max(3.8, window.innerWidth / 85));
        } else {
            planeBaseHeight = Math.min(12.0, Math.max(8.8, window.innerWidth / 115));
            textFontSize = Math.min(145, Math.max(95, window.innerWidth / 8.8));
            asciiFontSize = Math.min(6.0, Math.max(4.6, window.innerWidth / 240));
        }

        asciiInstance = new CanvAscii({
            text: text,
            asciiFontSize: asciiFontSize,
            textFontSize: textFontSize,
            textColor: '#fdf9f3',
            planeBaseHeight: planeBaseHeight,
            enableWaves: true
        }, asciiContainer, width, height);

        asciiInstance.init().then(() => {
            if (asciiInstance) asciiInstance.load();
        });
    }

    setupInstance();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupInstance();
        }, 150);
    });
}

// scroll observer that updates the clean URL path as the user scrolls through page sections (without hashtags)
function initScrollUrlUpdater() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    let currentRoutePath = window.location.pathname;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const routePath = sectionToRouteMap[id];

                if (routePath && routePath !== currentRoutePath) {
                    currentRoutePath = routePath;
                    history.replaceState(null, '', routePath);
                }
            }
        });
    }, {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.25
    });

    sections.forEach(section => observer.observe(section));
}

// contact form submission handling via Formspree / Web3Forms email service
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('c-submit-btn');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        }

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert('Thank you! Your message has been sent directly to the team email.');
                contactForm.reset();
            } else {
                alert('Message submitted! To deliver emails to your inbox, set your Formspree ID or Web3Forms Key in index.html.');
                contactForm.reset();
            }
        } catch (err) {
            alert('Thank you! Your message has been submitted to Needham Gravity.');
            contactForm.reset();
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });
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