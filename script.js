document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainView = document.getElementById('main-view');
    const independentViews = document.getElementById('independent-views');
    const navLinks = document.querySelectorAll('.nav-link');
    const projectCards = document.querySelectorAll('.project-card');
    const backButtons = document.querySelectorAll('.back-btn, [data-action="back-home"]');
    const heroText = document.querySelector('.hero-panel .h1');
    const scrollArrow = document.querySelector('.hero-panel .panel.arrow');

    // State
    let currentView = 'main';

    // --- Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.includes('.pdf')) {
                e.preventDefault();
                window.open(href, '_blank');
                return;
            }
            e.preventDefault();
            const target = link.dataset.target;
            if (!target) return;

            if (target === 'about-detail' || target === 'cv' || target === 'information') {
                showIndependentView('view-about-detail');
            } else if (target === 'archive') {
                showIndependentView('view-archive');
            } else if (target === 'work' || target === 'home') {
                showMainView();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            } else {
                showMainView();
                // Scroll to target section (e.g. publications)
                const section = document.getElementById(target);
                if (section) {
                    setTimeout(() => {
                        const headerOffset = 64; // Nav height
                        const elementPosition = section.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }, 20);
                }
            }
        });
    });

    // Handle Project Card Clicks
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.id;
            const viewId = `view-${projectId}`;
            const detailView = document.getElementById(viewId);
            if (detailView) {
                showIndependentView(viewId);
            }
        });
    });

    // Handle Back Buttons
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showMainView();
        });
    });

    // Handle Next / Previous Project Navigation in Detail Views
    document.addEventListener('click', (e) => {
        const projectLink = e.target.closest('.otherprojectslink');
        if (projectLink) {
            const targetViewId = projectLink.dataset.target;
            if (targetViewId) {
                e.preventDefault();
                showIndependentView(targetViewId);
            }
        }
    });

    // Nav Active State Helper
    function setActiveNav(targetName) {
        navLinks.forEach(link => {
            const target = link.dataset.target;
            if (targetName === 'about-detail' || targetName === 'information') {
                if (target === 'about-detail' || target === 'information') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            } else if (targetName === 'archive') {
                if (target === 'archive') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            } else if (targetName === 'work' || targetName === 'home') {
                if (target === 'work' || target === 'home') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            } else if (targetName === 'publications') {
                if (target === 'publications') {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    // View Switching Helpers
    function showMainView() {
        if (independentViews) {
            independentViews.querySelectorAll('.fullscreen-view').forEach(v => {
                v.style.display = 'none';
            });
        }
        if (mainView) {
            mainView.style.display = 'block';
        }
        currentView = 'main';
        history.pushState(null, '', window.location.pathname);
        setActiveNav('work');
        updateHeroScrollBlur();
    }

    function showIndependentView(viewId) {
        const targetView = document.getElementById(viewId);
        if (!targetView) return;

        if (mainView) mainView.style.display = 'none';
        if (independentViews) {
            independentViews.querySelectorAll('.fullscreen-view').forEach(v => {
                v.style.display = 'none';
            });
        }
        targetView.style.display = 'block';
        currentView = viewId;
        window.scrollTo(0, 0);

        if (viewId === 'view-about-detail') {
            setActiveNav('about-detail');
        } else if (viewId === 'view-archive') {
            setActiveNav('archive');
        }
    }

    // --- Hero Text Scroll Blur & Fade Effect (Triggered dynamically when Featured Work reaches Hero Text) ---
    function updateHeroScrollBlur() {
        if (currentView !== 'main' || !heroText) return;

        // Mobile: hero is not sticky, so skip the overlap blur entirely
        if (window.innerWidth <= 767) {
            heroText.style.filter = 'none';
            heroText.style.opacity = '1';
            if (scrollArrow) scrollArrow.style.opacity = '1';
            return;
        }

        const workSection = document.getElementById('work');
        if (!workSection) return;

        const heroRect = heroText.getBoundingClientRect();
        const workRect = workSection.getBoundingClientRect();

        // Blur starts dynamically when Featured Work title reaches 200px below hero text bottom
        const startPoint = heroRect.bottom + 200;
        // Expanded transition distance (400px) for a much more gradual, smooth blur transition
        const transitionDistance = Math.max(400, heroRect.height * 1.4);

        // Overlap distance as Featured Work rises up over hero text
        const overlap = startPoint - workRect.top;

        if (overlap > 0) {
            const progress = Math.min(1, overlap / transitionDistance);
            const blurVal = (progress * 12).toFixed(1);
            const opacityVal = (1 - progress * 0.85).toFixed(2);

            heroText.style.filter = `blur(${blurVal}px)`;
            heroText.style.opacity = opacityVal;
            if (scrollArrow) {
                scrollArrow.style.opacity = (1 - progress).toFixed(2);
            }
        } else {
            heroText.style.filter = 'none';
            heroText.style.opacity = '1';
            if (scrollArrow) {
                scrollArrow.style.opacity = '1';
            }
        }
    }

    window.addEventListener('scroll', updateHeroScrollBlur, { passive: true });
    updateHeroScrollBlur(); // Initial state check

    // Scroll Observer for Active Nav Link
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        if (currentView !== 'main') return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                updateActiveNav(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    function updateActiveNav(id) {
        navLinks.forEach(link => {
            if (link.dataset.target === id || ((id === 'home' || id === 'work') && (link.dataset.target === 'work' || link.dataset.target === 'home'))) {
                link.classList.add('active');
            } else if (link.dataset.target !== 'about-detail' && link.dataset.target !== 'archive' && !link.classList.contains('resume-btn')) {
                link.classList.remove('active');
            }
        });
    }

    // Initial view setup on load
    const hash = window.location.hash.substring(1);
    if (hash === 'information' || hash === 'about-detail' || hash === 'about') {
        showIndependentView('view-about-detail');
    } else if (hash === 'archive') {
        showIndependentView('view-archive');
    } else {
        showMainView();
        window.scrollTo(0, 0);
    }

    // --- Lightbox Modal Logic with Bottom Thumbnail Strip & Multi-Image Gallery ---
    const archiveCards = document.querySelectorAll('.archive-card');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxThumbnails = document.getElementById('lightbox-thumbnails');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPaper = document.getElementById('lightbox-paper');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let masterArchiveItems = [];
    let masterGalleryIndex = 0;

    function buildMasterArchiveItems() {
        masterArchiveItems = [];
        const allCards = (window.__archiveCards && window.__archiveCards.length) ? window.__archiveCards : document.querySelectorAll('.archive-card');
        allCards.forEach((card, cardIdx) => {
            const galleryData = card.dataset.gallery;
            const imgSrc = card.dataset.img;
            const title = card.dataset.title || '';
            const category = card.dataset.category || '';
            const paper = card.dataset.paper || '';
            const paperLabel = card.dataset.paperLabel || '';
            const videoPoster = card.dataset.videoPoster || '';

            let images = [];
            if (galleryData) {
                try {
                    images = JSON.parse(galleryData);
                } catch(e) {
                    images = [imgSrc];
                }
            } else if (imgSrc) {
                images = [imgSrc];
            }

            images.forEach(src => {
                masterArchiveItems.push({
                    src: src,
                    title: title,
                    category: category,
                    paper: paper,
                    paperLabel: paperLabel,
                    isVideo: /\.mp4(\?|$)/i.test(src),
                    thumb: /\.mp4(\?|$)/i.test(src) ? (videoPoster || src) : src,
                    cardIndex: cardIdx
                });
            });
        });
    }

    function renderLightboxThumbnails() {
        if (!lightboxThumbnails) return;
        lightboxThumbnails.innerHTML = '';

        if (!masterArchiveItems || masterArchiveItems.length <= 1) {
            lightboxThumbnails.style.display = 'none';
            return;
        }

        lightboxThumbnails.style.display = 'flex';

        masterArchiveItems.forEach((item, idx) => {
            const thumb = document.createElement('img');
            thumb.src = item.thumb || item.src;
            thumb.alt = item.title || `Thumbnail ${idx + 1}`;
            thumb.className = `lightbox-thumb ${idx === masterGalleryIndex ? 'active' : ''}`;
            if (idx > 0 && item.cardIndex !== masterArchiveItems[idx - 1].cardIndex) thumb.classList.add('group-start');
            
            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                masterGalleryIndex = idx;
                updateLightboxState();
            });

            lightboxThumbnails.appendChild(thumb);
        });
    }

    function updateLightboxState() {
        if (!masterArchiveItems || masterArchiveItems.length === 0) return;
        const currentItem = masterArchiveItems[masterGalleryIndex];
        if (!currentItem) return;

        const lightboxVideo = document.getElementById('lightbox-video');
        if (currentItem.isVideo && lightboxVideo) {
            lightboxImg.style.display = 'none';
            lightboxImg.removeAttribute('src');
            lightboxVideo.style.display = '';
            if (lightboxVideo.getAttribute('src') !== currentItem.src) lightboxVideo.src = currentItem.src;
            lightboxVideo.play().catch(() => {});
        } else {
            if (lightboxVideo) { lightboxVideo.pause(); lightboxVideo.style.display = 'none'; }
            lightboxImg.style.display = '';
            lightboxImg.src = currentItem.src;
        }
        if (lightboxTitle) lightboxTitle.textContent = currentItem.title;
        if (lightboxCategory) lightboxCategory.textContent = currentItem.category;
        if (lightboxPaper) {
            if (currentItem.paper) { lightboxPaper.href = currentItem.paper; lightboxPaper.textContent = currentItem.paperLabel || '📄 Research behind this project ↗'; lightboxPaper.style.display = 'inline-flex'; }
            else { lightboxPaper.style.display = 'none'; }
        }

        if (lightboxCounter) {
            const groupItems = masterArchiveItems.filter(it => it.cardIndex === currentItem.cardIndex);
            const groupPos = groupItems.indexOf(currentItem) + 1;
            lightboxCounter.textContent = `${groupPos} / ${groupItems.length}`;
            lightboxCounter.style.display = 'inline-block';
        }

        if (lightboxPrev && lightboxNext) {
            lightboxPrev.style.display = masterArchiveItems.length > 1 ? 'flex' : 'none';
            lightboxNext.style.display = masterArchiveItems.length > 1 ? 'flex' : 'none';
        }

        // Highlight active thumbnail in bottom strip & scroll into view smoothly
        if (lightboxThumbnails && masterArchiveItems.length > 1) {
            const thumbs = lightboxThumbnails.querySelectorAll('.lightbox-thumb');
            thumbs.forEach((t, i) => {
                t.classList.toggle('in-group', masterArchiveItems[i].cardIndex === currentItem.cardIndex);
                if (i === masterGalleryIndex) {
                    t.classList.add('active');
                    t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    t.classList.remove('active');
                }
            });
        }
    }

    if (lightboxModal) {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.archive-card');
            if (!card) return;
            lightboxModal.classList.remove('poster-mode');

            buildMasterArchiveItems();
            const currentImg = card.querySelector('.imagegrid');
            const currentSrc = currentImg ? currentImg.getAttribute('src') : card.dataset.img;

            let foundIdx = masterArchiveItems.findIndex(item => item.src === currentSrc);
            if (foundIdx === -1) {
                const cardTitle = card.dataset.title;
                foundIdx = masterArchiveItems.findIndex(item => item.title === cardTitle);
            }
            masterGalleryIndex = foundIdx !== -1 ? foundIdx : 0;

            renderLightboxThumbnails();
            updateLightboxState();
            lightboxModal.classList.add('active');
        });

        // Publications: open poster images in the same lightbox
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.pub-poster');
            if (!link) return;
            e.preventDefault();
            masterArchiveItems = [{
                src: link.dataset.poster,
                title: link.dataset.title || '',
                category: link.dataset.category || '',
                paper: link.dataset.poster,
                paperLabel: link.dataset.paperLabel || 'Open full-size poster ↗'
            }];
            masterGalleryIndex = 0;
            lightboxModal.classList.add('poster-mode');
            renderLightboxThumbnails();
            updateLightboxState();
            lightboxModal.classList.add('active');
        });

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                if (masterArchiveItems.length > 1) {
                    masterGalleryIndex = (masterGalleryIndex - 1 + masterArchiveItems.length) % masterArchiveItems.length;
                    updateLightboxState();
                }
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                if (masterArchiveItems.length > 1) {
                    masterGalleryIndex = (masterGalleryIndex + 1) % masterArchiveItems.length;
                    updateLightboxState();
                }
            });
        }

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightboxModal.classList.remove('active');
                const lv = document.getElementById('lightbox-video'); if (lv) lv.pause();
            });
        }

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-media-wrapper')) {
                lightboxModal.classList.remove('active');
            }
        });

        window.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;
            if (e.key === 'Escape') {
                lightboxModal.classList.remove('active');
            } else if (e.key === 'ArrowLeft' && masterArchiveItems.length > 1) {
                masterGalleryIndex = (masterGalleryIndex - 1 + masterArchiveItems.length) % masterArchiveItems.length;
                updateLightboxState();
            } else if (e.key === 'ArrowRight' && masterArchiveItems.length > 1) {
                masterGalleryIndex = (masterGalleryIndex + 1) % masterArchiveItems.length;
                updateLightboxState();
            }
        });
    }

    // --- Responsive Masonry Distribution (3 / 2 / 1 columns) ---
    const archiveGridEl = document.querySelector('.pinterestgrid');
    window.__archiveCards = archiveGridEl ? Array.from(archiveGridEl.querySelectorAll('.archive-card')) : [];
    let masonryCols = 0;
    function masonryColCount() {
        const w = window.innerWidth;
        return w <= 600 ? 1 : (w <= 991 ? 2 : 3);
    }
    function initMasonry3Columns() {
        const grid = archiveGridEl;
        const cards = window.__archiveCards;
        if (!grid || cards.length === 0) return;
        const colCount = masonryColCount();
        if (colCount === masonryCols) return;
        masonryCols = colCount;

        grid.innerHTML = '';
        const cols = [];
        for (let i = 0; i < colCount; i++) {
            const col = document.createElement('div');
            col.className = 'pinterest-col';
            grid.appendChild(col);
            cols.push(col);
        }
        cards.forEach((card, index) => {
            cols[index % colCount].appendChild(card);
        });
    }

    initMasonry3Columns();
    let masonryTimer;
    window.addEventListener('resize', () => {
        clearTimeout(masonryTimer);
        masonryTimer = setTimeout(initMasonry3Columns, 150);
    });

    // --- Automatic Continuous Image Slideshow for Multi-Image Cards (Full Color, Auto-Rotation) ---
    if (archiveCards) {
        archiveCards.forEach((card, cardIndex) => {
            const galleryData = card.dataset.gallery;
            if (!galleryData) return;

            let gallery = [];
            try {
                gallery = JSON.parse(galleryData);
            } catch(e) {
                return;
            }

            if (!Array.isArray(gallery) || gallery.length <= 1) return;
            if (card.dataset.staticThumb === 'true') return; // keep thumbnail fixed

            const imgEl = card.querySelector('.imagegrid');
            if (!imgEl) return;

            let currentIndex = 0;

            // Stagger initial start times slightly for a rich rhythmic visual flow across cards
            setTimeout(() => {
                setInterval(() => {
                    currentIndex = (currentIndex + 1) % gallery.length;
                    imgEl.style.opacity = '0.4';
                    setTimeout(() => {
                        imgEl.src = gallery[currentIndex];
                        imgEl.style.opacity = '1';
                    }, 150);
                }, 1300);
            }, cardIndex * 250);
        });
    }

    // --- Interactive Stardust & Ambient Star Sky Engine (Main Page Only) ---
    const stardustCanvas = document.getElementById('stardust-canvas');
    if (stardustCanvas) {
        const ctx = stardustCanvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let W = 0, H = 0;
        let particles = [];
        let shells = [];
        let streaks = [];
        let bgStars = [];
        let lastX = 0, lastY = 0;

        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Tunable Performance Parameters
        const BG_STAR_COUNT = 90;
        const SPAWN_FAST = 5;
        const SPAWN_SLOW = 2;
        const MAX_PARTICLES = 720;
        const FADE_MIN = 0.008;
        const FADE_MAX = 0.016;

        // --- Real North-Sky (Big Dipper around Polaris) for Seoul, by date/time ---
        // Star positions J2000 (RA/Dec in degrees). Rendered on a polar plot
        // centered on the North Celestial Pole; each star's angle = its hour
        // angle (Local Sidereal Time - RA), so the asterism rotates by date/time.
        const NORTH_STARS = [
            { ra: 165.93,  dec: 61.751, mag: 1.79, name: 'Dubhe' },   // 0
            { ra: 165.46,  dec: 56.383, mag: 2.37 },                  // 1 Merak
            { ra: 178.45,  dec: 53.695, mag: 2.44 },                  // 2 Phecda
            { ra: 183.857, dec: 57.033, mag: 3.31 },                  // 3 Megrez
            { ra: 193.507, dec: 55.960, mag: 1.77 },                  // 4 Alioth
            { ra: 200.981, dec: 54.921, mag: 2.04 },                  // 5 Mizar
            { ra: 206.885, dec: 49.313, mag: 1.86, name: 'Alkaid' },  // 6
            { ra: 37.954,  dec: 89.264, mag: 1.98, name: 'Polaris' }  // 7 (the pole)
        ];
        const DIPPER_LINES = [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]];
        const SEOUL_LON = 126.978; // fixed observer longitude (east)
        let constellation = null;
        let introDipper = { active: false, start: 0 };
        let particleWave = { active: false, start: 0, parts: [], cx: 0, cy: 0, maxR: 0 };

        // Intro: a swirling particle wave (concentric light-streak arcs + radial
        // gold streaks converging on a glowing ring), fades in, flows, fades out.
        function startParticleWave() {
            const cx = W * 0.5, cy = H * 0.72;
            const maxR = Math.min(W, H) * 0.25;
            const dir = Math.random() < 0.5 ? 1 : -1;
            const parts = [];
            const RINGS = 7;
            for (let ring = 0; ring < RINGS; ring++) {
                const rr = maxR * (0.14 + 0.86 * ring / (RINGS - 1));
                const count = 8 + ring * 4;
                for (let i = 0; i < count; i++) {
                    const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
                    const omega = dir * (0.004 + 0.010 * (1 - ring / RINGS)) * (0.85 + Math.random() * 0.3);
                    const ct = Math.random();
                    const color = ct < 0.55 ? '#7fdcff' : (ct < 0.9 ? '#e9c68f' : '#ffffff');
                    parts.push({ type: 'ring', a: a, rad: rr, omega: omega, drift: Math.random() * Math.PI * 2, amp: 6 + Math.random() * 10, color: color, w: 0.6 + Math.random() * 0.9, hist: [] });
                }
            }
            const spokes = 24;
            for (let i = 0; i < spokes; i++) {
                const a = (i / spokes) * Math.PI * 2 + Math.random() * 0.05;
                parts.push({ type: 'radial', a: a, rad: maxR * (0.5 + Math.random() * 0.5), vr: -(0.7 + Math.random() * 0.9), omega: dir * 0.001, color: Math.random() < 0.7 ? '#e9c68f' : '#7fdcff', w: 0.5 + Math.random() * 0.7, hist: [] });
            }
            particleWave.parts = parts;
            particleWave.cx = cx; particleWave.cy = cy; particleWave.maxR = maxR;
            particleWave.active = true; particleWave.start = performance.now();
        }

        function drawParticleWave() {
            if (!particleWave.active) return;
            const elapsed = performance.now() - particleWave.start;
            const FADE_IN = 900, HOLD_END = 3400, END = 5000;
            if (elapsed > END) { particleWave.active = false; particleWave.parts = []; return; }
            const fi = Math.min(1, elapsed / FADE_IN);
            const fo = elapsed < HOLD_END ? 1 : Math.max(0, 1 - (elapsed - HOLD_END) / (END - HOLD_END));
            const env = fi * fo;
            const cx = particleWave.cx, cy = particleWave.cy, maxR = particleWave.maxR;
            const squash = 0.82, MAXH = 12;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            const parts = particleWave.parts;
            for (let k = 0; k < parts.length; k++) {
                const p = parts[k];
                if (p.type === 'ring') {
                    p.a += p.omega;
                    const rr = p.rad + Math.sin(elapsed * 0.002 + p.drift) * p.amp;
                    p.hist.unshift({ x: cx + Math.cos(p.a) * rr, y: cy + Math.sin(p.a) * rr * squash });
                } else {
                    p.rad += p.vr;
                    p.a += p.omega;
                    if (p.rad < maxR * 0.12) p.rad = maxR * (0.6 + Math.random() * 0.4);
                    p.hist.unshift({ x: cx + Math.cos(p.a) * p.rad, y: cy + Math.sin(p.a) * p.rad * squash });
                }
                if (p.hist.length > MAXH) p.hist.pop();
                const pts = p.hist;
                ctx.strokeStyle = p.color;
                for (let i = 0; i < pts.length - 1; i++) {
                    const f = 1 - i / (pts.length - 1);
                    ctx.globalAlpha = env * f * f * 0.7;
                    ctx.lineWidth = Math.max(0.3, p.w * f);
                    ctx.beginPath();
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
                    ctx.stroke();
                }
            }
            const pulse = 0.7 + 0.3 * Math.sin(elapsed * 0.004);
            ctx.globalAlpha = env * 0.8 * pulse;
            ctx.strokeStyle = '#8fe3ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, maxR * 0.16, maxR * 0.16 * squash, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // Intro: the Big Dipper fades in (real Seoul date/time orientation),
        // holds briefly in the lower empty area, then fades out. No fireworks.
        function drawIntroDipper() {
            if (!introDipper.active) return;
            const elapsed = performance.now() - introDipper.start;
            const HOLD_END = 3600, END = 5200;
            if (elapsed > END) { introDipper.active = false; return; }

            const JD = Date.now() / 86400000 + 2440587.5;
            const D = JD - 2451545.0;
            let gmst = (280.46061837 + 360.98564736629 * D) % 360;
            if (gmst < 0) gmst += 360;
            const lst = (gmst + SEOUL_LON) % 360;
            const scale = Math.min(W, H) * 0.0042;

            const rel = [];
            let mx = 0, my = 0;
            for (let i = 0; i < 7; i++) {
                const st = NORTH_STARS[i];
                let Hd = (lst - st.ra) % 360; if (Hd < 0) Hd += 360;
                const Hr = Hd * Math.PI / 180;
                const r = scale * (90 - st.dec);
                const x = -r * Math.sin(Hr), y = -r * Math.cos(Hr);
                rel.push({ x: x, y: y, mag: st.mag });
                mx += x; my += y;
            }
            mx /= 7; my /= 7;
            const tx = W * 0.5, ty = H * 0.71; // lower empty area
            const pts = rel.map(function (p) { return { x: p.x - mx + tx, y: p.y - my + ty, mag: p.mag }; });

            const fo = elapsed < HOLD_END ? 1 : Math.max(0, 1 - (elapsed - HOLD_END) / (END - HOLD_END));

            const lineA = Math.max(0, Math.min(1, (elapsed - 700) / 800)) * fo;
            if (lineA > 0) {
                ctx.strokeStyle = 'rgba(185, 205, 255, ' + (0.5 * lineA) + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let i = 0; i < DIPPER_LINES.length; i++) {
                    const a = pts[DIPPER_LINES[i][0]], b = pts[DIPPER_LINES[i][1]];
                    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                }
                ctx.stroke();
            }
            for (let i = 0; i < pts.length; i++) {
                const sa = Math.max(0, Math.min(1, (elapsed - i * 110) / 450)) * fo;
                if (sa <= 0) continue;
                const pt = pts[i];
                const r = Math.max(1.1, 2.8 - pt.mag * 0.4);
                ctx.globalAlpha = 0.95 * sa;
                ctx.fillStyle = '#eaf1ff';
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            const la = Math.max(0, Math.min(1, (elapsed - 1300) / 800)) * fo;
            if (la > 0) {
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'rgba(210, 220, 255, ' + (0.65 * la) + ')';
                ctx.fillText('\uBD81\uB450\uCE60\uC131', pts[6].x - 14, pts[6].y + 20);
            }
        }

        function computeConstellation() {
            const JD = Date.now() / 86400000 + 2440587.5;   // Julian Date (UTC)
            const D = JD - 2451545.0;                        // days since J2000
            let gmst = (280.46061837 + 360.98564736629 * D) % 360;
            if (gmst < 0) gmst += 360;
            const lst = (gmst + SEOUL_LON) % 360;            // local sidereal time (deg)
            const cx = W * 0.82, cy = H * 0.30;              // pole pivot (upper-right)
            const SCALE = Math.min(W, H) * 0.004;            // px per degree, responsive
            const pts = NORTH_STARS.map(st => {
                let Hd = (lst - st.ra) % 360; if (Hd < 0) Hd += 360; // hour angle
                const Hr = Hd * Math.PI / 180;
                const r = SCALE * (90 - st.dec);             // polar distance
                return { x: cx - r * Math.sin(Hr), y: cy - r * Math.cos(Hr), mag: st.mag, name: st.name };
            });
            constellation = { cx: cx, cy: cy, pts: pts };
        }

        function drawConstellation() {
            if (!constellation) return;
            const pts = constellation.pts;
            // asterism lines
            ctx.strokeStyle = 'rgba(170, 195, 255, 0.30)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < DIPPER_LINES.length; i++) {
                const a = pts[DIPPER_LINES[i][0]], b = pts[DIPPER_LINES[i][1]];
                ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            }
            ctx.stroke();
            // dashed pointer from Dubhe to Polaris
            ctx.save();
            ctx.setLineDash([3, 6]);
            ctx.strokeStyle = 'rgba(150, 180, 255, 0.16)';
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[7].x, pts[7].y);
            ctx.stroke();
            ctx.restore();
            // stars (size by magnitude)
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                const isPol = p.name === 'Polaris';
                const r = Math.max(0.9, 2.5 - p.mag * 0.4) * (isPol ? 1.5 : 1);
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = isPol ? '#fff2cc' : '#eaf1ff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            // labels
            ctx.font = '11px sans-serif';
            ctx.fillStyle = 'rgba(200, 215, 255, 0.5)';
            ctx.fillText('\uBD81\uB450\uCE60\uC131', pts[6].x - 12, pts[6].y + 16);
            ctx.fillStyle = 'rgba(255, 240, 200, 0.6)';
            ctx.fillText('\uBD81\uADF9\uC131', pts[7].x + 8, pts[7].y + 4);
        }

        function resizeCanvas() {
            W = window.innerWidth;
            H = window.innerHeight;
            stardustCanvas.width = W * dpr;
            stardustCanvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            computeConstellation();
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        // Initialize Fixed Ambient Night Sky Stars
        for (let i = 0; i < BG_STAR_COUNT; i++) {
            bgStars.push({
                x: Math.random(),
                y: Math.random(),
                r: Math.random() * 1.1 + 0.3,
                a: Math.random() * 0.45 + 0.15
            });
        }

        // Spawn Stardust Trail Particles (Speed-Responsive + Color Accents)
        function spawnStardust(x, y, count) {
            for (let i = 0; i < count; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = Math.random() * 0.7 + 0.1;
                
                // 25% Random Vivid Color Accents, 75% Shimmering White/Gold
                const isSpecialColor = Math.random() < 0.25;
                let color = '#ffffff';
                if (isSpecialColor) {
                    const colorfulAccents = ['#ff5ebd', '#00f2fe', '#b57bee', '#ffaa00', '#4facfe', '#ff758c'];
                    color = colorfulAccents[Math.floor(Math.random() * colorfulAccents.length)];
                } else {
                    const whitePalette = ['#ffffff', '#ffffff', '#fff9e6', '#e2f0fe'];
                    color = whitePalette[Math.floor(Math.random() * whitePalette.length)];
                }

                particles.push({
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 0.18, // Float upward gently
                    r: Math.random() * 1.8 + 0.6,
                    life: 1,
                    dec: Math.random() * (FADE_MAX - FADE_MIN) + FADE_MIN,
                    tw: Math.random() * Math.PI * 2,
                    color: color,
                    isStar: Math.random() < 0.35
                });
            }

            if (particles.length > MAX_PARTICLES) {
                particles.splice(0, particles.length - MAX_PARTICLES);
            }
        }

        // Speed-Responsive Pointer Movement Listener
        window.addEventListener('pointermove', (e) => {
            if (currentView !== 'main' || reduceMotion) return;
            const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
            spawnStardust(e.clientX, e.clientY, dist > 40 ? SPAWN_FAST : SPAWN_SLOW);
            lastX = e.clientX;
            lastY = e.clientY;
        }, { passive: true });

        function drawBgStars() {
            for (let i = 0; i < bgStars.length; i++) {
                const b = bgStars[i];
                ctx.globalAlpha = b.a;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(b.x * W, b.y * H, b.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Concave "glint" sparkle: mainSpikes long points, optional shorter
        // secondary spikes between them (sub>0) -> the classic sparkle shape.
        function drawSparkle(x, y, mainSpikes, R, rot, sub) {
            const total = sub > 0 ? mainSpikes * 2 : mainSpikes;
            const inner = R * 0.13;
            ctx.beginPath();
            for (let i = 0; i <= total; i++) {
                const ang = rot + i * (2 * Math.PI / total);
                const rr = (sub > 0 && (i % 2 === 1)) ? R * sub : R;
                const tx = x + Math.cos(ang) * rr;
                const ty = y + Math.sin(ang) * rr;
                if (i === 0) {
                    ctx.moveTo(tx, ty);
                } else {
                    const aVal = ang - (Math.PI / total);
                    ctx.quadraticCurveTo(x + Math.cos(aVal) * inner, y + Math.sin(aVal) * inner, tx, ty);
                }
            }
            ctx.closePath();
            ctx.fill();
        }

        function animateStardustFrame() {
            ctx.clearRect(0, 0, W, H);

            if (currentView === 'main') {

                // Rising shells: climb fast, trail sparks, explode near apex
                for (let k = shells.length - 1; k >= 0; k--) {
                    const sh = shells[k];
                    sh.y += sh.vy;
                    sh.vy += 0.10; // decelerate as it climbs
                    spawnFireworkBead(sh.x + (Math.random() - 0.5) * 3, sh.y + Math.random() * 4, Math.random() * Math.PI * 2, Math.random() * 0.4, '#ffd9a0', 0.06, 0.7, 0.6);
                    ctx.globalAlpha = 0.9;
                    ctx.fillStyle = '#fff4d6';
                    ctx.beginPath();
                    ctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                    if (sh.y <= sh.targetY || sh.vy >= -1.2) {
                        launchFirework(sh.x, sh.y, sh.palette, sh.scale);
                        shells.splice(k, 1);
                    }
                }
                ctx.globalAlpha = 1;

                // Firework strokes: long tapered streaks that arc under gravity
                const MAXHIST = 14;
                ctx.lineCap = 'round';
                for (let k = streaks.length - 1; k >= 0; k--) {
                    const st = streaks[k];
                    st.hist.unshift({ x: st.x, y: st.y });
                    if (st.hist.length > MAXHIST) st.hist.pop();
                    st.x += st.vx;
                    st.y += st.vy;
                    st.vx *= st.drag;
                    st.vy *= st.drag;
                    st.vy += st.grav;
                    st.life -= st.dec;
                    if (st.life <= 0) { streaks.splice(k, 1); continue; }

                    const pts = st.hist;
                    ctx.strokeStyle = st.color;
                    for (let i = 0; i < pts.length - 1; i++) {
                        const f = 1 - i / (pts.length - 1); // 1 at head -> 0 at tail
                        ctx.globalAlpha = Math.max(0, st.life) * f * f;
                        ctx.lineWidth = Math.max(0.35, st.width * f);
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
                        ctx.stroke();
                    }
                }
                ctx.globalAlpha = 1;

                for (let j = particles.length - 1; j >= 0; j--) {
                    const p = particles[j];
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.drag) { p.vx *= p.drag; p.vy *= p.drag; } // air resistance -> hold shape
                    p.vy += (p.grav != null ? p.grav : 0.003); // gravity
                    p.life -= p.dec;
                    p.tw += 0.18; // Twinkle phase

                    if (p.life <= 0) {
                        particles.splice(j, 1);
                        continue;
                    }

                    const twinkle = p.fw
                        ? (p.life > 0.75 ? 0.8 + 0.2 * Math.sin(p.tw) : 1) // sparkle at burst, calm as it falls
                        : 0.6 + 0.4 * Math.sin(p.tw);
                    const currentAlpha = Math.max(0, p.life) * twinkle * (p.alphaMul || 1);

                    ctx.globalAlpha = currentAlpha;
                    ctx.fillStyle = p.color;

                    if (p.isStar) {
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.tw * 0.2);
                        const outerR = p.r * 1.8;
                        const innerR = p.r * 0.35;
                        ctx.beginPath();
                        ctx.moveTo(0, -outerR);
                        ctx.lineTo(innerR, -innerR);
                        ctx.lineTo(outerR, 0);
                        ctx.lineTo(innerR, innerR);
                        ctx.lineTo(0, outerR);
                        ctx.lineTo(-innerR, innerR);
                        ctx.lineTo(-outerR, 0);
                        ctx.lineTo(-innerR, -innerR);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    } else {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.globalAlpha = 1;
            } else if (currentView !== 'main') {
                if (particles.length > 0) particles = [];
                if (shells.length > 0) shells = [];
                if (streaks.length > 0) streaks = [];
            }

            requestAnimationFrame(animateStardustFrame);
        }

        // --- Intro Firework Show (fires on page load / refresh) ---
        // Shells rise from the bottom, explode at apex into a circular burst of
        // radial bead-spokes, hold their shape (air drag), then fade slowly.
        function spawnFireworkBead(cx, cy, ang, spd, color, dec, sizeMul, drag) {
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                r: (Math.random() * 1.8 + 0.7) * (sizeMul || 1), // varied sizes
                life: 1,
                dec: dec,
                tw: Math.random() * Math.PI * 2,
                color: color,
                shape: (function () { const q = Math.random(); return q < 0.62 ? 'round' : (q < 0.92 ? 'spark4' : 'spark8'); })(),
                glow: true,
                alphaMul: 1,
                drag: drag || 0,
                grav: 0.09,                      // real gravity -> parabolic droop
                fw: true                         // firework bead: no twinkle while falling
            });
        }

        function launchFirework(cx, cy, palette, scale) {
            if (currentView !== 'main') return;
            const nColors = 1 + Math.floor(Math.random() * 2); // 1-2 colors per burst
            const cols = [];
            for (let i = 0; i < nColors; i++) cols.push(palette[Math.floor(Math.random() * palette.length)]);
            const pick = () => (Math.random() < 0.10 ? '#ffffff' : cols[Math.floor(Math.random() * cols.length)]);

            // one long, tapered STROKE per spoke (not a chain of dots)
            const spokes = 42 + Math.floor(Math.random() * 16);
            for (let sIdx = 0; sIdx < spokes; sIdx++) {
                const ang = (sIdx / spokes) * Math.PI * 2 + (Math.random() - 0.5) * 0.04;
                const spd = (6.2 + Math.random() * 3.6) * scale; // strong pop -> long stroke
                streaks.push({
                    x: cx, y: cy,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    color: pick(),
                    life: 1,
                    dec: 0.0032 + Math.random() * 0.0026, // much slower fade
                    drag: 0.945,       // slows outward -> gravity bends it into a parabola
                    grav: 0.06,        // gentler fall
                    width: 1.3 + Math.random() * 1.3,
                    hist: []
                });
            }
        }

        function launchShell(bx, by, palette, scale) {
            if (currentView !== 'main') return;
            shells.push({
                x: bx,
                y: H * 1.03,                        // start just below the viewport
                vy: -(11 + Math.random() * 2.6),    // upward launch (a touch slower)
                targetY: by,                        // apex where it explodes
                palette: palette,
                scale: scale
            });
        }

        function introRippleBurst() {
            if (currentView !== 'main' || reduceMotion) return;
            const palette = ['#b28cff', '#8f66f0', '#ffffff', '#e8b06a', '#ff6b78', '#4f9be6'];
            // two bursts, different height + size
            const rnd = (a, b) => a + Math.random() * (b - a);
            // fully random each load; left/low + right/high so they don't overlap
            const bursts = [
                { x: rnd(0.20, 0.45), y: rnd(0.34, 0.54), scale: rnd(1.00, 1.30) },
                { x: rnd(0.55, 0.80), y: rnd(0.14, 0.34), scale: rnd(1.35, 1.75) }
            ];
            if (Math.random() < 0.5) bursts.reverse(); // sometimes the big one is on the left
            bursts.forEach((b, idx) => {
                setTimeout(() => {
                    if (currentView !== 'main') return;
                    launchShell(W * b.x, H * b.y, palette, b.scale);
                }, idx * (430 + Math.random() * 160));
            });
        }

        if (!reduceMotion) {
            requestAnimationFrame(animateStardustFrame);
        }
    }
});


// Project hero loops: play when a detail view becomes visible, pause otherwise
(function () {
    const syncLoops = () => {
        document.querySelectorAll('video.project-loop').forEach(v => {
            if (v.offsetParent !== null) { v.play().catch(() => {}); }
            else if (!v.paused) { v.pause(); }
        });
    };
    document.addEventListener('click', () => setTimeout(syncLoops, 350));
    window.addEventListener('popstate', () => setTimeout(syncLoops, 350));
    document.addEventListener('DOMContentLoaded', syncLoops);
})();

// Mobile menu (hamburger)
(function () {
    const header = document.querySelector('.navheader');
    const btn = document.querySelector('.mobile-menu-btn');
    if (!header || !btn) return;
    const close = () => { header.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); };
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !header.classList.contains('menu-open');
        header.classList.toggle('menu-open', open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.querySelectorAll('.mobile-menu-link, .mobile-brand').forEach(a => a.addEventListener('click', close));
    document.addEventListener('click', (e) => { if (!header.contains(e.target)) close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 767) close(); });
})();
