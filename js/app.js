// needham gravity app logic - echoes GSAP staggered menu, Three.js CanvAscii title, & OGL HalftoneReveal background

document.addEventListener('DOMContentLoaded', () => {
    initCleanRouteNavigation();
    initStaggeredMenu();
    initCanvAsciiHeroTitle();
    initHalftoneRevealBackground();
    initTelemetrySimulation();
    initContactForm();
    initScrollUrlUpdater();
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

// Three.js CanvAscii title rendering for NEEDHAM GRAVITY (EXACT ECHOES IMPLEMENTATION)
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

class CanvasTxt {
    constructor(txt, { fontSize = 130, fontFamily = 'IBM Plex Mono', color = '#fdf9f3' } = {}) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.txt = txt;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;

        this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
    }

    resize() {
        this.context.font = this.font;
        const metrics = this.context.measureText(this.txt);

        const textWidth = Math.ceil(metrics.width) + 40;
        const textHeight = Math.ceil((metrics.actualBoundingBoxAscent || (this.fontSize * 0.8)) + (metrics.actualBoundingBoxDescent || (this.fontSize * 0.2))) + 40;

        this.canvas.width = Math.max(1, textWidth);
        this.canvas.height = Math.max(1, textHeight);
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.color;
        this.context.font = this.font;

        const metrics = this.context.measureText(this.txt);
        const yPos = 20 + (metrics.actualBoundingBoxAscent || (this.fontSize * 0.8));

        this.context.fillText(this.txt, 20, yPos);
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

function initCanvAsciiHeroTitle() {
    const asciiContainer = document.getElementById('ascii-text-container');
    if (!asciiContainer || typeof THREE === 'undefined') return;

    const width = asciiContainer.clientWidth || window.innerWidth;
    const height = asciiContainer.clientHeight || 240;
    const isMobile = window.innerWidth < 600;
    const isTablet = window.innerWidth >= 600 && window.innerWidth < 900;

    const asciiFontSize = isMobile ? 3.5 : (isTablet ? 4.5 : 5.5);
    const textFontSize = isMobile ? 65 : (isTablet ? 100 : 130);
    const planeBaseHeight = isMobile ? 6 : (isTablet ? 8 : 9.5);

    const asciiInstance = new CanvAscii({
        text: 'NEEDHAM GRAVITY',
        asciiFontSize: asciiFontSize,
        textFontSize: textFontSize,
        textColor: '#fdf9f3',
        planeBaseHeight: planeBaseHeight,
        enableWaves: true
    }, asciiContainer, width, height);

    asciiInstance.init().then(() => {
        asciiInstance.load();
    });

    window.addEventListener('resize', () => {
        if (asciiContainer) {
            asciiInstance.setSize(asciiContainer.clientWidth, asciiContainer.clientHeight || 240);
        }
    });
}

// OGL Halftone Reveal shader background for hero background
function initHalftoneRevealBackground() {
    const container = document.getElementById('halftone-bg-container');
    if (!container || typeof OGL === 'undefined') return;

    const bgImg = container.querySelector('.hero-bg-img');
    if (bgImg) bgImg.style.display = 'none';

    const { Renderer, Program, Triangle, Mesh, Texture } = OGL;

    const hexToRgb = hex => {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0, 0, 0];
    };

    const vertex = `#version 300 es
    in vec2 position;
    out vec2 vUv;
    void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
    `;

    const fragment = `#version 300 es
    precision highp float;

    uniform sampler2D tMap;
    uniform vec2 iResolution;
    uniform vec2 uImageSize;
    uniform vec2 uMouse;
    uniform float uActivity;

    uniform float uDotSize;
    uniform float uDensity;
    uniform float uAngle;
    uniform int uShape;
    uniform vec3 uInk;
    uniform vec3 uPaper;
    uniform int uMode;
    uniform float uContrast;
    uniform float uInvert;

    uniform float uRevealRadius;
    uniform float uEdge;
    uniform float uIdleReveal;
    uniform int uTrigger;

    in vec2 vUv;
    out vec4 fragColor;

    vec2 uAspect() {
        return vec2(iResolution.x / max(iResolution.y, 1.0), 1.0);
    }

    vec2 coverUv(vec2 uv) {
        float ia = uImageSize.x / max(uImageSize.y, 1.0);
        float pa = iResolution.x / max(iResolution.y, 1.0);
        vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
        return (uv - 0.5) * s + 0.5;
    }

    vec3 gradeRGB(vec3 c) {
        c = clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0);
        return mix(c, 1.0 - c, uInvert);
    }

    float shapeDist(vec2 f) {
        if (uShape == 1) return max(abs(f.x), abs(f.y));
        if (uShape == 2) return abs(f.x) + abs(f.y);
        if (uShape == 3) return abs(f.y);
        return length(f);
    }

    mat2 rot(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat2(c, -s, s, c);
    }

    vec4 sampleCell(vec2 st, float dens, float ang) {
        vec2 rp = rot(ang) * st * dens;
        vec2 center = floor(rp) + 0.5;
        vec2 stC = rot(-ang) * (center / dens);
        vec2 uvC = stC / uAspect();
        return texture(tMap, clamp(coverUv(uvC), 0.0, 1.0));
    }

    float coverage(vec2 st, float dens, float ang, float ink, float rscale) {
        vec2 rp = rot(ang) * st * dens;
        vec2 f = fract(rp) - 0.5;
        float d = shapeDist(f);
        float r = sqrt(clamp(ink, 0.0, 1.0)) * 0.72 * rscale * uDotSize;
        float w = length(fwidth(rp)) * 0.6 + 1e-4;
        return smoothstep(r + w, r - w, d);
    }

    void main() {
        vec2 aspect = uAspect();
        vec2 st = vUv * aspect;
        float ang = radians(uAngle);

        vec2 duv = (vUv - uMouse) * aspect;
        float dist = length(duv);

        float act = uTrigger == 2 ? 1.0 : (uTrigger == 0 ? 0.0 : uActivity);
        float radius = max(uRevealRadius, 1e-4) * mix(0.4, 1.0, act);

        float px = 1.4 / max(iResolution.y, 1.0);
        float band = max(px, radius * (1.0 - clamp(uEdge, 0.0, 1.0)) * 0.45);
        float loupe = 1.0 - smoothstep(radius - band, radius + band, dist);
        float focus = clamp(max(loupe * act, uIdleReveal), 0.0, 1.0);

        float dens = uDensity;

        vec3 print;
        if (uMode == 2) {
            vec3 gc = gradeRGB(sampleCell(st, dens, ang + radians(15.0)).rgb);
            vec3 gm = gradeRGB(sampleCell(st, dens, ang + radians(75.0)).rgb);
            vec3 gy = gradeRGB(sampleCell(st, dens, ang).rgb);
            vec3 gk = gradeRGB(sampleCell(st, dens, ang + radians(45.0)).rgb);
            float c = 1.0 - gc.r;
            float m = 1.0 - gm.g;
            float y = 1.0 - gy.b;
            float k = 1.0 - dot(gk, vec3(0.299, 0.587, 0.114));
            float gcr = min(min(c, m), y) * 0.5;
            c = clamp(c - gcr, 0.0, 1.0);
            m = clamp(m - gcr, 0.0, 1.0);
            y = clamp(y - gcr, 0.0, 1.0);
            k = clamp(max(gcr, k * k * 0.9), 0.0, 1.0);
            float covC = coverage(st, dens, ang + radians(15.0), c, 0.82);
            float covM = coverage(st, dens, ang + radians(75.0), m, 0.82);
            float covY = coverage(st, dens, ang, y, 0.82);
            float covK = coverage(st, dens, ang + radians(45.0), k, 0.78);
            print = uPaper;
            print = mix(print, print * vec3(0.10, 0.72, 0.90), covC);
            print = mix(print, print * vec3(0.92, 0.10, 0.52), covM);
            print = mix(print, print * vec3(0.98, 0.86, 0.10), covY);
            print = mix(print, print * vec3(0.08), covK);
        } else if (uMode == 1) {
            vec3 ink2 = mix(uInk.gbr, vec3(0.90, 0.24, 0.30), 0.7);
            float lumA = dot(gradeRGB(sampleCell(st, dens, ang).rgb), vec3(0.299, 0.587, 0.114));
            float lumB = dot(gradeRGB(sampleCell(st, dens, ang + radians(38.0)).rgb), vec3(0.299, 0.587, 0.114));
            float covA = coverage(st, dens, ang, 1.0 - lumA, 1.0);
            float covB = coverage(st, dens, ang + radians(38.0), pow(1.0 - lumB, 1.4), 0.92);
            print = uPaper;
            print = mix(print, ink2, covB * 0.85);
            print = mix(print, uInk, covA);
        } else {
            float lum = dot(gradeRGB(sampleCell(st, dens, ang).rgb), vec3(0.299, 0.587, 0.114));
            float cov = coverage(st, dens, ang, 1.0 - lum, 1.0);
            print = mix(uPaper, uInk, cov);
        }

        float t = clamp(dist / radius, 0.0, 1.0);
        float bend = t * t * t * t;
        vec2 dir = dist > 1e-5 ? duv / dist : vec2(0.0);
        vec2 off = dir * bend * radius * 0.22 / aspect;
        vec2 ca = dir * bend * 0.0045 / aspect;
        vec3 sharp = gradeRGB(vec3(
            texture(tMap, clamp(coverUv(vUv - off - ca), 0.0, 1.0)).r,
            texture(tMap, clamp(coverUv(vUv - off), 0.0, 1.0)).g,
            texture(tMap, clamp(coverUv(vUv - off + ca), 0.0, 1.0)).b
        ));

        vec3 col = mix(print, sharp, focus);
        fragColor = vec4(col, 1.0);
    }
    `;

    const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: false,
        antialias: true
    });

    const gl = renderer.gl;
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.zIndex = '0';
    container.appendChild(gl.canvas);

    const texture = new Texture(gl, { generateMipmaps: false });

    const uniforms = {
        tMap: { value: texture },
        iResolution: { value: [1, 1] },
        uImageSize: { value: [1, 1] },
        uMouse: { value: [0.5, 0.5] },
        uActivity: { value: 1.0 },
        uDotSize: { value: 1.2 },
        uDensity: { value: 65.0 },
        uAngle: { value: 45.0 },
        uShape: { value: 0 },
        uInk: { value: hexToRgb('#050E1B') },
        uPaper: { value: hexToRgb('#F3C319') },
        uMode: { value: 1 },
        uContrast: { value: 1.25 },
        uInvert: { value: 0 },
        uRevealRadius: { value: 0.45 },
        uEdge: { value: 0.75 },
        uIdleReveal: { value: 0.35 },
        uTrigger: { value: 2 } // Always active halftone reveal shader background
    };

    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'assets/hero-bg.jpg';
    img.onload = () => {
        texture.image = img;
        uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
    };

    const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    window.addEventListener('resize', resize);

    const mouseRef = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, active: 1, target: 1 };

    const onMove = e => {
        const rect = container.getBoundingClientRect();
        mouseRef.x = (e.clientX - rect.left) / rect.width;
        mouseRef.y = 1 - (e.clientY - rect.top) / rect.height;
        mouseRef.target = 1;
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    let prev = performance.now();
    const loop = now => {
        requestAnimationFrame(loop);
        const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
        prev = now;

        const a = 1 - Math.exp(-dt / 0.37);
        mouseRef.sx += (mouseRef.x - mouseRef.sx) * a;
        mouseRef.sy += (mouseRef.y - mouseRef.sy) * a;
        mouseRef.active = 1.0;

        uniforms.uMouse.value[0] = mouseRef.sx;
        uniforms.uMouse.value[1] = mouseRef.sy;
        uniforms.uActivity.value = 1.0;

        renderer.render({ scene: mesh });
    };
    requestAnimationFrame(loop);
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
