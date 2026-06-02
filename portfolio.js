/*
    File: portfolio.js
    Purpose: Central animation orchestrator and behavior manager. This module
    initializes the cursor system, Three.js background, intro sequence, scroll
    animations, project carousel, counters, and other interactive subsystems.

    Notes:
    - Functions here rely on specific DOM IDs and classes defined in `index.html`.
    - Preserve timing constants and easing functions when refactoring.
    - To modularize: export individual init functions and keep orchestration order.
*/
                'use strict';

        /* ─────────────────────────────────────────────
           APP STATE & CONFIGURATION
        ───────────────────────────────────────────── */
        const App = (() => {
            // State
            const state = {
                introPlayed: false,
                theme: localStorage.getItem('as-theme') || 'dark',
                cartCount: 0,
                mobileActive: false,
                isMobile: window.innerWidth < 768,
                threeScene: null,
                // Ghost cursor — automated cinematic cursor control
                ghostMode: false,
                ghostX: 0,
                ghostY: 0,
            };

            // Text to type in intro search
            const SEARCH_TEXT = 'perfect coder';
            const SUGGESTIONS = [
                'perfect coder for enterprise systems',
                'perfect coder · full stack systems architect',
                'perfect coder devops automation',
            ];

            /* ─────────────────────────────────────────────
               CUSTOM CURSOR
               Ghost mode = cinematic auto-cursor during intro.
               Real mode  = follows actual mouse in portfolio.
            ───────────────────────────────────────────── */
            const initCursor = () => {
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                // Start rings at center so first ghost lerp looks natural
                let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
                let dotX = window.innerWidth / 2, dotY = window.innerHeight / 2;
                const lerp = (a, b, t) => a + (b - a) * t;

                // Real mouse tracking (only outside ghost mode)
                document.addEventListener('mousemove', e => {
                    if (!state.ghostMode) {
                        dotX = e.clientX; dotY = e.clientY;
                        // Show real cursor only once portfolio is active
                        if (state.introPlayed) {
                            dot.classList.add('active');
                            ring.classList.add('active');
                        }
                    }
                });

                const loop = () => {
                    const sx = state.ghostMode ? state.ghostX : dotX;
                    const sy = state.ghostMode ? state.ghostY : dotY;
                    // Dot position
                    if (!state.ghostMode) { dot.style.left = sx + 'px'; dot.style.top = sy + 'px'; }
                    // Ring lerps smoothly regardless
                    ringX = lerp(ringX, sx, state.ghostMode ? 0.09 : 0.13);
                    ringY = lerp(ringY, sy, state.ghostMode ? 0.09 : 0.13);
                    ring.style.left = ringX + 'px';
                    ring.style.top = ringY + 'px';
                    requestAnimationFrame(loop);
                };
                loop();

                document.addEventListener('mouseover', e => {
                    if (!state.ghostMode && e.target.closest('button,a,[role="button"],[tabindex]'))
                        document.body.classList.add('cursor-hover');
                });
                document.addEventListener('mouseout', e => {
                    if (!state.ghostMode && e.target.closest('button,a,[role="button"],[tabindex]'))
                        document.body.classList.remove('cursor-hover');
                });
                document.addEventListener('mousedown', () => { if (!state.ghostMode) document.body.classList.add('cursor-click'); });
                document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
            };

/* ─────────────────────────────────────────────
               THREE.JS 3D BACKGROUND
            ───────────────────────────────────────────── */
            const initThreeBackground = () => {
                const canvas = document.getElementById('three-canvas');
                const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.setSize(window.innerWidth, window.innerHeight);

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
                camera.position.z = 30;
            
                // ─ Particle field ─
                const PARTICLE_COUNT = 1800;
                const positions = new Float32Array(PARTICLE_COUNT * 3);
                const colors = new Float32Array(PARTICLE_COUNT * 3);
                const sizes = new Float32Array(PARTICLE_COUNT);

                const colorA = new THREE.Color('#3d8bff'); // blue
                const colorB = new THREE.Color('#c8a84b'); // gold
                const colorC = new THREE.Color('#00d4ff'); // cyan

                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const i3 = i * 3;
                    // Distribute in a sphere
                    const r = Math.random() * 50 + 5;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const theta = Math.random() * Math.PI * 2;
                    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
                    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                    positions[i3 + 2] = r * Math.cos(phi);

                    // Color blend
                    const t = Math.random();
                    const c = t < 0.6 ? colorA.clone().lerp(colorC, Math.random() * 0.5) :
                        t < 0.85 ? colorB : colorC;
                    colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
                    sizes[i] = Math.random() * 1.5 + 0.3;
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

                const material = new THREE.PointsMaterial({
                    size: 0.12, vertexColors: true, transparent: true,
                    opacity: 0.7, sizeAttenuation: true, depthWrite: false,
                    blending: THREE.AdditiveBlending,
                });

                const particles = new THREE.Points(geometry, material);
                scene.add(particles);

                // ─ Floating geometric meshes ─
                const geoGroup = new THREE.Group();
                scene.add(geoGroup);

                const addMesh = (geo, mat, x, y, z) => {
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(x, y, z);
                    geoGroup.add(mesh);
                    return mesh;
                };

                const wireMat = new THREE.MeshBasicMaterial({ color: 0x3d8bff, wireframe: true, transparent: true, opacity: 0.08 });
                const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xc8a84b, wireframe: true, transparent: true, opacity: 0.06 });

                const meshes = [
                    addMesh(new THREE.IcosahedronGeometry(3.5, 1), wireMat, -12, 6, -8),
                    addMesh(new THREE.OctahedronGeometry(2.8, 0), wireMat2, 14, -5, -12),
                    addMesh(new THREE.TorusGeometry(4, 0.8, 8, 24), wireMat, 0, -14, -6),
                    addMesh(new THREE.TetrahedronGeometry(2.2, 0), wireMat2, -18, -8, -14),
                ];

                // ─ Mouse parallax ─
                let mouseX = 0, mouseY = 0;
                document.addEventListener('mousemove', e => {
                    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
                });

                // ─ Animate ─
                const clock = new THREE.Clock();
                let raf;
                const animate = () => {
                    raf = requestAnimationFrame(animate);
                    const elapsed = clock.getElapsedTime();

                    // Rotate particle field slowly
                    particles.rotation.y = elapsed * 0.025;
                    particles.rotation.x = elapsed * 0.01;

                    // Parallax camera drift
                    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
                    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;

                    // Animate meshes
                    meshes.forEach((m, i) => {
                        m.rotation.x = elapsed * (0.08 + i * 0.03);
                        m.rotation.y = elapsed * (0.12 + i * 0.02);
                    });
                    geoGroup.rotation.y = elapsed * 0.015;

                    renderer.render(scene, camera);
                };
                animate();

                // Resize
                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                });

                state.threeScene = { renderer, scene, camera, particles };
                return { particles, meshes };
            };

            /* ─────────────────────────────────────────────
               INTRO SEQUENCE ORCHESTRATOR
            ───────────────────────────────────────────── */
            const startIntro = () => {
                document.getElementById('skip-btn').style.display = 'flex';
                document.documentElement.setAttribute('data-theme', state.theme);
                if (sessionStorage.getItem('intro-played')) { skipIntro(); return; }

                initProgressBar();
                // Phase 1: cinematic cursor appears, glides to search bar, clicks it
                setTimeout(cursorToSearchBar, 1200);
            };

            /* ── Helper: smooth bezier glide between two points ──
               Returns a promise that resolves after the glide completes.
            */
            const glideGhostCursor = (x0, y0, x1, y1, duration, cpOffsetX = 0, cpOffsetY = -80) => {
                return new Promise(resolve => {
                    const dot = document.getElementById('cursor-dot');
                    const cpX = (x0 + x1) / 2 + cpOffsetX;
                    const cpY = Math.min(y0, y1) + cpOffsetY;
                    const t0 = performance.now();
                    const step = now => {
                        const raw = Math.min((now - t0) / duration, 1);
                        // Cubic ease-in-out
                        const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
                        const u = 1 - t;
                        // Quadratic Bézier
                        state.ghostX = u * u * x0 + 2 * u * t * cpX + t * t * x1;
                        state.ghostY = u * u * y0 + 2 * u * t * cpY + t * t * y1;
                        dot.style.left = state.ghostX + 'px';
                        dot.style.top = state.ghostY + 'px';
                        if (raw < 1) requestAnimationFrame(step);
                        else resolve();
                    };
                    requestAnimationFrame(step);
                });
            };

            /* ── PHASE 1: cursor appears and glides to search bar ── */
            const cursorToSearchBar = () => {
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                const csWrap = document.getElementById('cs-wrap');
                if (!csWrap) { runTyping(); return; }

                const rect = csWrap.getBoundingClientRect();
                const targetX = rect.left + rect.width * 0.42;
                const targetY = rect.top + rect.height * 0.5;

                // Start cursor at top-left region, make it visible
                const startX = window.innerWidth * 0.15;
                const startY = window.innerHeight * 0.18;

                state.ghostMode = true;
                state.ghostX = startX;
                state.ghostY = startY;
                dot.style.left = startX + 'px';
                dot.style.top = startY + 'px';

                // Fade cursor in
                requestAnimationFrame(() => {
                    dot.classList.add('active');
                    ring.classList.add('active');
                });

                // Brief idle so user sees cursor materialise
                setTimeout(async () => {
                    // Glide to search bar
                    await glideGhostCursor(startX, startY, targetX, targetY, 1100, 40, -60);

                    // Hover over search bar — ring expands
                    document.body.classList.add('cursor-hover');
                    state.ghostX = targetX;
                    state.ghostY = targetY;
                    dot.style.left = targetX + 'px';
                    dot.style.top = targetY + 'px';

                    // Pause on search bar (0.6s)
                    await new Promise(r => setTimeout(r, 600));

                    // Click animation
                    await clickGhost(dot);

                    document.body.classList.remove('cursor-hover');

                    // Glow the search input
                    const inp = document.getElementById('cs-input');
                    inp.classList.add('focused');

                    // Wait briefly, then start typing
                    await new Promise(r => setTimeout(r, 350));
                    runTyping();
                }, 380);
            };

            /* ── Ghost click animation: dot scales up, ring snaps in ── */
            const clickGhost = (dot) => {
                return new Promise(resolve => {
                    document.body.classList.add('cursor-click');
                    dot.style.transition = 'transform 0.13s cubic-bezier(0.34,1.56,0.64,1)';
                    dot.style.transform = 'translate(-50%,-50%) scale(2.8)';
                    setTimeout(() => {
                        dot.style.transform = 'translate(-50%,-50%) scale(1)';
                        document.body.classList.remove('cursor-click');
                        setTimeout(resolve, 150);
                    }, 150);
                });
            };

            /* ── PHASE 2: typewriter ── */
            const runTyping = () => {
                const input = document.getElementById('cs-input');
                const sugg = document.getElementById('suggestions');
                let charIdx = 0;
                const typeChar = () => {
                    if (charIdx <= SEARCH_TEXT.length) {
                        input.value = SEARCH_TEXT.slice(0, charIdx);
                        charIdx++;
                        if (charIdx === 8) sugg.classList.add('visible');
                        setTimeout(typeChar, 68 + Math.random() * 44);
                    } else {
                        setTimeout(triggerSearch, 650);
                    }
                };
                typeChar();
            };

            /* ── PHASE 3: Enter pressed, fade to skeleton → results ── */
            const triggerSearch = async () => {
                const dot = document.getElementById('cursor-dot');
                const inp = document.getElementById('cs-input');
                const sugg = document.getElementById('suggestions');

                // Move cursor to search submit button area
                const csWrap = document.getElementById('cs-wrap');
                const rect = csWrap.getBoundingClientRect();
                const btnX = rect.right - 28;
                const btnY = rect.top + rect.height * 0.5;

                await glideGhostCursor(state.ghostX, state.ghostY, btnX, btnY, 450, 0, 0);
                document.body.classList.add('cursor-hover');
                await new Promise(r => setTimeout(r, 280));
                await clickGhost(dot);
                document.body.classList.remove('cursor-hover');

                // Flash input (Enter key feel)
                inp.style.background = 'rgba(61,139,255,0.1)';
                setTimeout(() => { inp.style.background = ''; }, 120);
                sugg.classList.remove('visible');

                // Fade intro out
                const intro = document.getElementById('intro-overlay');
                intro.style.transition = 'opacity 0.48s cubic-bezier(0.23,1,0.32,1)';
                intro.style.opacity = '0';
                setTimeout(() => { intro.style.display = 'none'; }, 500);

                // Show skeleton
                const skel = document.getElementById('skeleton-screen');
                skel.style.display = 'flex'; skel.style.opacity = '0';
                skel.style.transition = 'opacity 0.35s';
                requestAnimationFrame(() => { skel.style.opacity = '1'; });

                setTimeout(showResults, 1800);
            };

            /* ── PHASE 4: results page reveals ── */
            const showResults = () => {
                const skel = document.getElementById('skeleton-screen');
                const results = document.getElementById('results-page');
                skel.style.opacity = '0';
                setTimeout(() => { skel.style.display = 'none'; }, 380);

                results.style.display = 'flex'; results.style.opacity = '0';
                results.style.transition = 'opacity 0.5s cubic-bezier(0.23,1,0.32,1)';
                requestAnimationFrame(() => { results.style.opacity = '1'; });

                setTimeout(animateHeroCardStars, 600);
                setTimeout(animateReviewCounter, 900);
                // After counter finishes, cursor glides to Akshay's card
                setTimeout(autoCursorToCard, 2400);

                document.getElementById('skip-btn').style.display = 'none';
            };

            /* ── Star fill animation ── */
            const animateHeroCardStars = () => {
                document.querySelectorAll('#hero-stars .star-svg').forEach((star, i) => {
                    setTimeout(() => {
                        star.classList.remove('star-empty');
                        star.classList.add('star-full');
                        star.style.transition = 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), color 0.15s';
                        star.style.transform = 'scale(1.5)';
                        setTimeout(() => { star.style.transform = 'scale(1)'; }, 220);
                    }, i * 130);
                });
            };

            /* ═══════════════════════════════════════════════════════════
               AUTO-CURSOR → AKSHAY CARD
               The cinematic climax: cursor glides in a graceful arc to the
               hero card, hovers (card glows + ring expands), then clicks —
               triggering the circular morph transition to the portfolio.
            ═══════════════════════════════════════════════════════════ */
            const autoCursorToCard = async () => {
                const card = document.getElementById('akshay-card');
                const dot = document.getElementById('cursor-dot');
                if (!card || !dot) return;

                // Target: center of the "View Full Profile" button on the card
                const getTarget = () => {
                    const r = card.getBoundingClientRect();
                    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.80 };
                };

                // Cursor is still at the search button area from Phase 3
                const startX = state.ghostX;
                const startY = state.ghostY;
                const tgt = getTarget();

                // ── Glide: long organic arc from search bar → card ──
                // Use a wide control-point offset so the path sweeps naturally
                const cpOffX = (tgt.x - startX) * -0.15;
                await glideGhostCursor(startX, startY, tgt.x, tgt.y, 1350, cpOffX, -110);

                // ── Hover: ring expands, card lifts with glow ──
                document.body.classList.add('cursor-hover');
                card.classList.add('auto-hover');
                state.ghostX = tgt.x;
                state.ghostY = tgt.y;
                dot.style.left = tgt.x + 'px';
                dot.style.top = tgt.y + 'px';

                // Hover linger — user sees the full card glow (900ms)
                await new Promise(r => setTimeout(r, 900));

                // Subtle cursor micro-wiggle (feels natural)
                const wx = tgt.x + 3, wy = tgt.y + 2;
                await glideGhostCursor(tgt.x, tgt.y, wx, wy, 180, 0, 0);
                await new Promise(r => setTimeout(r, 120));
                await glideGhostCursor(wx, wy, tgt.x, tgt.y, 160, 0, 0);
                await new Promise(r => setTimeout(r, 200));

                // ── Click ──
                document.body.classList.remove('cursor-hover');
                card.style.transition = 'transform 0.13s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.12s';
                card.style.transform = 'translateY(-2px) scale(0.984)';

                await clickGhost(dot);

                card.classList.remove('auto-hover');
                state.ghostMode = false; // hand cursor control back to real mouse

                // Fire the morph transition → portfolio
                clickAkshayCard(null);
            };

            const animateReviewCounter = () => {
                const el = document.getElementById('review-counter');
                let count = 0;
                const target = 1e9;
                const duration = 1800;
                const start = performance.now();

                const formatNum = n => {
                    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B+';
                    if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M+';
                    return n.toLocaleString();
                };

                const step = now => {
                    const progress = Math.min((now - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 4); // ease-out quart
                    count = Math.floor(ease * target);
                    el.textContent = formatNum(count) + ' Global Trust Signals';
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            };

            /* ─────────────────────────────────────────────
               CARD CLICK → CINEMATIC TRANSITION
            ───────────────────────────────────────────── */
            const clickAkshayCard = (e) => {
                const card = document.getElementById('akshay-card');
                const layer = document.getElementById('transition-layer');
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const maxR = Math.hypot(
                    Math.max(cx, window.innerWidth - cx),
                    Math.max(cy, window.innerHeight - cy)
                ) * 2;

                // Create expanding circle from card center
                const circle = document.createElement('div');
                circle.className = 'expand-circle';
                circle.style.cssText = `
      width:  ${maxR * 2}px;
      height: ${maxR * 2}px;
      left:   ${cx - maxR}px;
      top:    ${cy - maxR}px;
    `;
                layer.appendChild(circle);

                // Slight page dim first
                document.getElementById('results-page').style.transition = 'filter 0.3s, opacity 0.3s';
                document.getElementById('results-page').style.filter = 'blur(3px)';
                document.getElementById('results-page').style.opacity = '0.7';

                // Trigger circle expansion
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        circle.style.transform = 'scale(1)';
                    });
                });

                // After circle covers screen, reveal portfolio
                setTimeout(() => {
                    document.getElementById('results-page').style.display = 'none';
                    revealPortfolio();

                    // Remove circle, fade canvas in
                    setTimeout(() => {
                        circle.style.opacity = '0';
                        setTimeout(() => { circle.remove(); layer.innerHTML = ''; }, 400);
                    }, 600);
                }, 900);

                sessionStorage.setItem('intro-played', '1');
                state.introPlayed = true;
            };

            const revealPortfolio = () => {
                const portfolio = document.getElementById('portfolio');
                const canvas = document.getElementById('three-canvas');
                const panel = document.getElementById('control-panel');

                portfolio.style.display = 'block';
                portfolio.style.opacity = '0';
                portfolio.style.transition = 'opacity 0.9s cubic-bezier(0.23,1,0.32,1) 0.1s';

                // Three.js already booted in init() — just show the canvas

                requestAnimationFrame(() => {
                    portfolio.style.opacity = '1';
                    canvas.classList.add('visible');
                });

                // Cursor: fade ghost cursor out, let real mouse take over
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                dot.style.transition += ', opacity 0.5s';
                ring.style.transition += ', opacity 0.5s';
                dot.style.opacity = '0';
                ring.style.opacity = '0';
                // Re-activate when real mouse moves (handled in initCursor)
                setTimeout(() => {
                    dot.style.opacity = '';
                    ring.style.opacity = '';
                    dot.classList.remove('active');
                    ring.classList.remove('active');
                }, 600);

                // Show control panel
                setTimeout(() => { panel.classList.add('visible'); }, 1200);

                // Animate hero text in
                setTimeout(() => {
                    document.getElementById('h-eyebrow').classList.add('revealed');
                    setTimeout(() => document.getElementById('h-name').classList.add('revealed'), 200);
                    setTimeout(() => document.getElementById('h-subtitle').classList.add('revealed'), 450);
                    setTimeout(() => document.getElementById('h-roles').classList.add('revealed'), 650);
                    setTimeout(() => document.getElementById('h-ctas').classList.add('revealed'), 800);
                }, 400);

                // Init all portfolio enhancements
                initScrollAnimations();
                initNavScrollEffect();
                initSkillCardMouseEffect();
                initRatingBarsObserver();
                initScrollProgress();
                initTiltCards();
                initMagneticButtons();
                initCounters();
                initSkillRings();
                initCursorTrail();
                initTimelineDrag();
                initProjectVisuals();
                initExperienceAnimations();

                // Particle repulsion (needs Three.js particles reference)
                if (state.threeScene && state.threeScene.particles) {
                    initParticleRepulsion(state.threeScene.particles);
                }
            };

            /* ─────────────────────────────────────────────
               SKIP INTRO
            ───────────────────────────────────────────── */
            const skipIntro = () => {
                document.getElementById('intro-overlay').style.display = 'none';
                document.getElementById('skeleton-screen').style.display = 'none';
                document.getElementById('results-page').style.display = 'none';
                document.getElementById('skip-btn').style.display = 'none';

                // Three.js already running from init()
                initProgressBar();
                revealPortfolio();
                sessionStorage.setItem('intro-played', '1');
                state.introPlayed = true;
            };

            /* ─────────────────────────────────────────────
               NAV SCROLL EFFECT
            ───────────────────────────────────────────── */
            const initNavScrollEffect = () => {
                const nav = document.getElementById('port-nav');
                const onScroll = (scrollEl) => {
                    const scrollY = scrollEl === window ? window.scrollY : scrollEl.scrollTop;
                    nav.classList.toggle('scrolled', scrollY > 60);
                };

                window.addEventListener('scroll', () => onScroll(window), { passive: true });
                const deviceScreen = document.getElementById('device-screen');
                if (deviceScreen) {
                    deviceScreen.addEventListener('scroll', () => onScroll(deviceScreen), { passive: true });
                }
                state.navScrollHandler = onScroll;
            };

            /* ─────────────────────────────────────────────
               SCROLL REVEAL ANIMATIONS
            ───────────────────────────────────────────── */
            const initScrollAnimations = () => {
                const elements = Array.from(document.querySelectorAll('.reveal, .reveal-left, .reveal-right'));
                if (elements.length === 0) return;

                const observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('visible');
                            }
                        });
                    },
                    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
                );
                elements.forEach(el => observer.observe(el));

                const updateRevealMotion = () => {
                    const viewportCenterY = window.innerHeight / 2;
                    elements.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        const elementCenterY = rect.top + rect.height / 2;
                        const dist = Math.abs(elementCenterY - viewportCenterY);
                        const maxDist = window.innerHeight / 2 + rect.height / 2;
                        const ratio = Math.max(0, 1 - dist / maxDist);
                        const opacity = Math.min(1, Math.max(0.24, 0.24 + ratio * 0.88));
                        const scale = Math.min(1.15, 0.85 + ratio * 0.30);
                        let translateX = 0;
                        let translateY = 0;

                        if (el.classList.contains('reveal-left')) {
                            translateX = -40 * (1 - ratio);
                        } else if (el.classList.contains('reveal-right')) {
                            translateX = 40 * (1 - ratio);
                        } else {
                            translateY = 40 * (1 - ratio);
                        }

                        el.style.opacity = opacity.toFixed(3);
                        el.style.transform = `translateX(${translateX.toFixed(1)}px) translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
                        el.style.willChange = 'opacity, transform';
                    });
                    requestAnimationFrame(updateRevealMotion);
                };

                updateRevealMotion();
            };

            /* ─────────────────────────────────────────────
               SKILL CARD MOUSE-FOLLOW LIGHT
            ───────────────────────────────────────────── */
            const initSkillCardMouseEffect = () => {
                document.querySelectorAll('.skill-card').forEach(card => {
                    card.addEventListener('mousemove', e => {
                        const rect = card.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        card.style.setProperty('--mx', x + '%');
                        card.style.setProperty('--my', y + '%');
                    });
                    card.addEventListener('mouseleave', () => {
                        card.style.setProperty('--mx', '50%');
                        card.style.setProperty('--my', '50%');
                    });
                });
            };

            /* ─────────────────────────────────────────────
               RATING BARS ANIMATION (on scroll)
            ───────────────────────────────────────────── */
            const initRatingBarsObserver = () => {
                const barsSection = document.getElementById('rating-bars');
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            document.querySelectorAll('.rating-bar-fill').forEach(bar => {
                                const w = bar.getAttribute('data-width') + '%';
                                requestAnimationFrame(() => { bar.style.width = w; });
                            });
                            observer.disconnect();
                        }
                    });
                }, { threshold: 0.5 });
                if (barsSection) observer.observe(barsSection);
            };

            /* ─────────────────────────────────────────────
               THEME TOGGLE
            ───────────────────────────────────────────── */
            const toggleTheme = () => {
                state.theme = state.theme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', state.theme);
                document.getElementById('theme-icon').textContent = state.theme === 'dark' ? '🌗' : '☀️';
                localStorage.setItem('as-theme', state.theme);
            };

            /* ─────────────────────────────────────────────
               CART / HIRE
            ───────────────────────────────────────────── */
            const addToCart = () => {
                state.cartCount++;
                // Update badges
                ['cart-badge', 'nav-cart-num'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = state.cartCount;
                });
                document.getElementById('nav-cart-pill').classList.add('visible');

                // Toast
                const toast = document.getElementById('cart-toast');
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3400);
            };

            /* ─────────────────────────────────────────────
               MOBILE SIMULATION
            ───────────────────────────────────────────── */
            const activateMobileView = () => {
                if (state.isMobile) return; // Don't activate on real mobile
                const wrap = document.getElementById('device-wrap');
                const screen = document.getElementById('device-screen');
                const port = document.getElementById('portfolio');
                const canvas = document.getElementById('three-canvas');

                // Clone portfolio content into device screen
                screen.innerHTML = '';
                const clone = port.cloneNode(true);

                // Strip duplicate ids from cloned content so mobile preview doesn't conflict with page selectors
                clone.querySelectorAll('[id]').forEach(el => {
                    const originalId = el.id;
                    if (originalId) {
                        el.dataset.cloneSection = originalId;
                        el.removeAttribute('id');
                    }
                });

                // Adjust clone styles for small frame
                clone.style.display = 'block';
                clone.querySelectorAll('.port-nav').forEach(el => {
                    el.style.position = 'sticky';
                    el.style.top = '0';
                    el.style.padding = '14px 18px';
                    el.style.zIndex = '10';
                });
                clone.querySelectorAll('.port-section').forEach(el => {
                    el.style.padding = '60px 18px';
                });
                clone.querySelectorAll('.hero-section').forEach(el => {
                    el.style.padding = '100px 18px 60px';
                });
                clone.querySelectorAll('.hero-name').forEach(el => {
                    el.style.fontSize = '52px';
                    el.classList.add('revealed');
                });
                clone.querySelectorAll('.hero-eyebrow,.hero-subtitle,.hero-roles,.hero-ctas').forEach(el => {
                    el.classList.add('revealed');
                });
                clone.querySelectorAll('.about-grid,.project-item,.reviews-layout').forEach(el => {
                    el.style.gridTemplateColumns = '1fr';
                });
                clone.querySelectorAll('.nav-links').forEach(el => el.style.display = 'none');
                clone.querySelectorAll('#control-panel,#device-wrap,#cursor-dot,#cursor-ring,#skip-btn').forEach(el => el.remove());
                clone.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
                clone.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => el.classList.add('visible'));
                clone.querySelectorAll('.proj-row,.project-item').forEach(el => el.style.display = 'block');

                screen.appendChild(clone);
                wrap.style.display = 'flex';
                canvas.style.filter = 'blur(8px)';
                requestAnimationFrame(() => { wrap.classList.add('visible'); });
                state.mobileActive = true;

                if (typeof state.bindMobileScrollProgress === 'function') {
                    state.bindMobileScrollProgress();
                }
                if (typeof state.navScrollHandler === 'function' && screen && !screen.dataset.navScrollBound) {
                    screen.addEventListener('scroll', () => state.navScrollHandler(screen), { passive: true });
                    screen.dataset.navScrollBound = 'true';
                }

                const mobBtn = document.getElementById('mobile-toggle-btn');
                const deskBtn = document.getElementById('desktop-toggle-btn');
                if (mobBtn) mobBtn.style.display = 'none';
                if (deskBtn) deskBtn.style.display = 'flex';
            };

            const deactivateMobileView = () => {
                const wrap = document.getElementById('device-wrap');
                const canvas = document.getElementById('three-canvas');
                const screen = document.getElementById('device-screen');
                wrap.classList.remove('visible');
                canvas.style.filter = '';
                setTimeout(() => {
                    wrap.style.display = 'none';
                    if (screen) screen.innerHTML = '';
                }, 500);
                state.mobileActive = false;
                // Toggle control panel icons: show mobile button only
                const mobBtn = document.getElementById('mobile-toggle-btn');
                const deskBtn = document.getElementById('desktop-toggle-btn');
                if (mobBtn) mobBtn.style.display = 'flex';
                if (deskBtn) deskBtn.style.display = 'none';
            };

            /* ─────────────────────────────────────────────
               REPLAY INTRO
            ───────────────────────────────────────────── */
            const replayIntro = () => {
                sessionStorage.removeItem('intro-played');
                state.introPlayed = false;

                const portfolio = document.getElementById('portfolio');
                const canvas = document.getElementById('three-canvas');
                const panel = document.getElementById('control-panel');
                const intro = document.getElementById('intro-overlay');
                const skipBtn = document.getElementById('skip-btn');

                portfolio.style.display = 'none';
                canvas.classList.remove('visible');
                panel.classList.remove('visible');

                // Reset intro input
                const csInput = document.getElementById('cs-input');
                csInput.value = '';
                csInput.classList.remove('focused');
                document.getElementById('suggestions').classList.remove('visible');

                // Show intro
                intro.style.display = 'flex';
                intro.style.opacity = '0';
                intro.style.transition = 'opacity 0.5s';
                requestAnimationFrame(() => { intro.style.opacity = '1'; });
                skipBtn.style.display = 'flex';

                // Reset ghost cursor state
                state.ghostMode = false;
                state.ghostX = window.innerWidth / 2;
                state.ghostY = window.innerHeight / 2;
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                dot.classList.remove('active');
                ring.classList.remove('active');
                dot.style.opacity = '';
                ring.style.opacity = '';

                // Restart full sequence
                setTimeout(() => cursorToSearchBar(), 1200);
            };

            /* ─────────────────────────────────────────────
               INIT
            ───────────────────────────────────────────── */
            const init = () => {
                initCursor();
                document.documentElement.setAttribute('data-theme', state.theme);
                document.getElementById('theme-icon').textContent = state.theme === 'dark' ? '🌗' : '☀️';
                // Boot Three.js early so it's ready when portfolio reveals
                const t = initThreeBackground();
                state.threeScene.particles = t.particles;
                // Ensure correct device toggle visibility
                const mobBtn = document.getElementById('mobile-toggle-btn');
                const deskBtn = document.getElementById('desktop-toggle-btn');
                if (state.mobileActive) { if (mobBtn) mobBtn.style.display = 'none'; if (deskBtn) deskBtn.style.display = 'flex'; }
                else { if (mobBtn) mobBtn.style.display = 'flex'; if (deskBtn) deskBtn.style.display = 'none'; }

                startIntro();
            };


            /* ─────────────────────────────────────────────
               INTRO PROGRESS BAR
            ───────────────────────────────────────────── */
            const initProgressBar = () => {
                const bar = document.getElementById('intro-progress');
                if (!bar) return;
                // Stages: 0 → typing start, 40% → search, 65% → skeleton, 90% → results, 100 → done
                const setP = (p, dur = 400) => {
                    bar.style.transition = `width ${dur}ms var(--ease-out)`;
                    bar.style.width = p + '%';
                };
                setTimeout(() => setP(15, 800), 800);   // intro loaded
                setTimeout(() => setP(38, 600), 2400);   // typing starts
                setTimeout(() => setP(62, 500), 4500);   // search triggered
                setTimeout(() => setP(80, 400), 6200);   // skeleton
                setTimeout(() => setP(92, 600), 7800);   // results
                setTimeout(() => { setP(100, 300); setTimeout(() => { bar.style.opacity = '0'; }, 500); }, 9000);
            };

            /* ─────────────────────────────────────────────
               SCROLL PROGRESS & SECTION DOTS
            ───────────────────────────────────────────── */
            const initScrollProgress = () => {
                const fill = document.getElementById('scroll-progress-fill');
                const dots = document.getElementById('section-dots');
                const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'reviews', 'contact'];

                const getSectionElements = (scrollEl) => {
                    if (scrollEl === window) {
                        return sections.map(id => document.getElementById(id)).filter(Boolean);
                    }
                    const screen = document.getElementById('device-screen');
                    return screen ? Array.from(screen.querySelectorAll('[data-clone-section]')) : [];
                };

                const updateProgress = (scrollEl) => {
                    const isWindow = scrollEl === window;
                    const scrolled = isWindow ? window.scrollY : scrollEl.scrollTop;
                    const total = isWindow ? document.body.scrollHeight - window.innerHeight : scrollEl.scrollHeight - scrollEl.clientHeight;
                    if (fill) fill.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';

                    let active = 'hero';
                    const threshold = (isWindow ? window.innerHeight : scrollEl.clientHeight) * 0.55;
                    getSectionElements(scrollEl).forEach(el => {
                        const top = el.getBoundingClientRect().top - (isWindow ? 0 : scrollEl.getBoundingClientRect().top);
                        if (top < threshold) {
                            active = isWindow ? el.id || active : el.dataset.cloneSection || active;
                        }
                    });

                    document.querySelectorAll('.s-dot').forEach(dot => {
                        dot.classList.toggle('active', dot.getAttribute('data-target') === active);
                    });
                };

                const onWindowScroll = () => updateProgress(window);
                window.addEventListener('scroll', onWindowScroll, { passive: true });
                state.scrollProgressHandler = onWindowScroll;

                const bindMobileProgress = () => {
                    const screen = document.getElementById('device-screen');
                    if (!screen || screen.dataset.progressBound) return;
                    screen.addEventListener('scroll', () => updateProgress(screen), { passive: true });
                    screen.dataset.progressBound = 'true';
                };
                state.bindMobileScrollProgress = bindMobileProgress;

                if (dots) setTimeout(() => dots.classList.add('visible'), 1400);
            };

            const scrollToSection = (id) => {
                    if (state.mobileActive) {
                        const screen = document.getElementById('device-screen');
                        if (screen) {
                            const target = screen.querySelector(`[data-clone-section="${id}"]`);
                            if (target) {
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                return;
                            }
                        }
                    }
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            };

            /* ─────────────────────────────────────────────
               3D TILT CARDS
            ───────────────────────────────────────────── */
            const initTiltCards = () => {
                document.querySelectorAll('.tilt-card,[data-tilt]').forEach(card => {
                    const shine = card.querySelector('.tilt-shine');
                    let raf;

                    card.addEventListener('mousemove', e => {
                        cancelAnimationFrame(raf);
                        raf = requestAnimationFrame(() => {
                            const rect = card.getBoundingClientRect();
                            const cx = rect.left + rect.width / 2;
                            const cy = rect.top + rect.height / 2;
                            const dx = (e.clientX - cx) / (rect.width / 2);
                            const dy = (e.clientY - cy) / (rect.height / 2);
                            const maxDeg = 12;
                            const rx = -dy * maxDeg;
                            const ry = dx * maxDeg;
                            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
                            card.style.transition = 'transform 0.06s linear, box-shadow 0.2s';
                            card.style.boxShadow = `${-ry * 1.2}px ${rx * 1.2}px 40px rgba(61,139,255,0.18)`;
                            if (shine) {
                                const sx = ((e.clientX - rect.left) / rect.width) * 100;
                                const sy = ((e.clientY - rect.top) / rect.height) * 100;
                                shine.style.setProperty('--sx', sx + '%');
                                shine.style.setProperty('--sy', sy + '%');
                            }
                        });
                    });

                    card.addEventListener('mouseleave', () => {
                        cancelAnimationFrame(raf);
                        card.style.transition = 'transform 0.5s var(--ease-out), box-shadow 0.5s';
                        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
                        card.style.boxShadow = '';
                    });
                });
            };

            /* ─────────────────────────────────────────────
               MAGNETIC BUTTONS
            ───────────────────────────────────────────── */
            const initMagneticButtons = () => {
                document.querySelectorAll('.magnetic').forEach(btn => {
                    btn.addEventListener('mousemove', e => {
                        const rect = btn.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;
                        const dx = (e.clientX - cx) * 0.3;
                        const dy = (e.clientY - cy) * 0.3;
                        btn.style.transform = `translate(${dx}px, ${dy}px)`;
                        btn.style.transition = 'transform 0.18s var(--ease-out)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.transform = '';
                        btn.style.transition = 'transform 0.55s var(--ease-spring)';
                    });
                });
            };

            /* ─────────────────────────────────────────────
               ANIMATED STAT COUNTERS
            ───────────────────────────────────────────── */
            const initCounters = () => {
                const counters = document.querySelectorAll('.count-up');
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        const el = entry.target;
                        const target = parseFloat(el.getAttribute('data-target'));
                        const suffix = el.getAttribute('data-suffix') || '';
                        const dur = 1800;
                        const start = performance.now();
                        const run = now => {
                            const p = Math.min((now - start) / dur, 1);
                            const ease = 1 - Math.pow(1 - p, 3);
                            const val = target * ease;
                            el.textContent = (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
                            if (p < 1) requestAnimationFrame(run);
                            else el.textContent = target + suffix;
                        };
                        requestAnimationFrame(run);
                        observer.unobserve(el);
                    });
                }, { threshold: 0.6 });
                counters.forEach(el => observer.observe(el));
            };

            /* ─────────────────────────────────────────────
               SKILL RING ANIMATIONS
            ───────────────────────────────────────────── */
            const initSkillRings = () => {
                const arcs = document.querySelectorAll('.skill-ring-arc');
                const obs = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('animated');
                        obs.unobserve(entry.target);
                    });
                }, { threshold: 0.4 });
                arcs.forEach(arc => obs.observe(arc));
            };

            /* ─────────────────────────────────────────────
               CURSOR TRAIL
            ───────────────────────────────────────────── */
            const initCursorTrail = () => {
                const trailLen = 8;
                const trail = [];
                const hist = { x: [], y: [] };
                for (let i = 0; i < trailLen; i++) { hist.x.push(0); hist.y.push(0); }

                for (let i = 0; i < trailLen; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'cursor-trail';
                    dot.style.opacity = (1 - i / trailLen) * 0.35 + '';
                    dot.style.width = (4 - i * 0.35) + 'px';
                    dot.style.height = (4 - i * 0.35) + 'px';
                    document.body.appendChild(dot);
                    trail.push(dot);
                }

                let mx = 0, my = 0;
                document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

                const update = () => {
                    hist.x.unshift(mx); hist.x.pop();
                    hist.y.unshift(my); hist.y.pop();
                    trail.forEach((dot, i) => {
                        dot.style.left = hist.x[i] + 'px';
                        dot.style.top = hist.y[i] + 'px';
                    });
                    requestAnimationFrame(update);
                };
                update();
            };

            /* ─────────────────────────────────────────────
               HORIZONTAL TIMELINE DRAG
            ───────────────────────────────────────────── */
            const initTimelineDrag = () => {
                const el = document.getElementById('timeline-drag');
                if (!el) return;
                let isDown = false, startX, scrollLeft;
                el.addEventListener('mousedown', e => {
                    isDown = true; el.classList.add('active');
                    startX = e.pageX - el.offsetLeft;
                    scrollLeft = el.scrollLeft;
                });
                el.addEventListener('mouseleave', () => { isDown = false; });
                el.addEventListener('mouseup', () => { isDown = false; });
                el.addEventListener('mousemove', e => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - el.offsetLeft;
                    const walk = (x - startX) * 1.4;
                    el.scrollLeft = scrollLeft - walk;
                });
            };

            /* ─────────────────────────────────────────────
               PARTICLE MOUSE REPULSION (Three.js)
            ───────────────────────────────────────────── */
            const initParticleRepulsion = (particles) => {
                if (!particles) return;
                const geo = particles.geometry;
                const pos = geo.attributes.position;
                const orig = new Float32Array(pos.array);
                let mx = 9999, my = 9999;

                document.addEventListener('mousemove', e => {
                    mx = (e.clientX / window.innerWidth) * 2 - 1;
                    my = -(e.clientY / window.innerHeight) * 2 + 1;
                });

                const repulse = () => {
                    // Convert mouse to 3D space (approximate at z=0 plane)
                    const wMx = mx * 40;
                    const wMy = my * 25;
                    const radius = 12, strength = 3.5;
                    for (let i = 0; i < pos.count; i++) {
                        const i3 = i * 3;
                        const ox = orig[i3], oy = orig[i3 + 1];
                        const dx = pos.array[i3] - wMx;
                        const dy = pos.array[i3 + 1] - wMy;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < radius) {
                            const force = (radius - dist) / radius;
                            pos.array[i3] += dx * force * strength * 0.02;
                            pos.array[i3 + 1] += dy * force * strength * 0.02;
                        }
                        // Return to origin
                        pos.array[i3] += (ox - pos.array[i3]) * 0.05;
                        pos.array[i3 + 1] += (oy - pos.array[i3 + 1]) * 0.05;
                    }
                    pos.needsUpdate = true;
                    requestAnimationFrame(repulse);
                };
                repulse();
            };

            /* ─────────────────────────────────────────────
               PROJECT VISUAL MOUSE FOLLOW
            ───────────────────────────────────────────── */
            const initProjectVisuals = () => {
                document.querySelectorAll('.project-visual').forEach(el => {
                    el.addEventListener('mousemove', e => {
                        const rect = el.getBoundingClientRect();
                        const px = ((e.clientX - rect.left) / rect.width) * 100;
                        const py = ((e.clientY - rect.top) / rect.height) * 100;
                        el.style.setProperty('--px', px + '%');
                        el.style.setProperty('--py', py + '%');
                    });
                });

                // Initialize project carousel and lightbox behaviors
                initProjectCarousel();
                initProjectLightbox();
            };

            /* ─────────────────────────────────────────────
               PROJECT SHOWCASE CINEMATIC SCROLL ANIMATION
            ───────────────────────────────────────────── */
            const initProjectCarousel = () => {
                const stage = document.getElementById('projects-stage');
                if (!stage) return;
                const slides = Array.from(stage.querySelectorAll('.project-showcase-card'));
                if (slides.length === 0) return;

                // Prevent double-init
                if (state.projectCarousel && state.projectCarousel.inited) return;

                const AUTO_DELAY = 6000; // default auto-advance (ms)
                let current = 0;
                let timer = null;
                let rafHandle = null;
                const stagePaddingRatio = 0.14;
                const stageGap = 38;

                const getMetrics = () => {
                    const wrapper = stage.parentElement;
                    const wrapperWidth = wrapper ? wrapper.clientWidth : window.innerWidth;
                    const slideWidth = Math.min(920, Math.max(320, wrapperWidth * 0.72));
                    const padding = wrapperWidth * stagePaddingRatio;
                    return { wrapperWidth, slideWidth, padding, gap: stageGap };
                };

                const syncSizes = () => {
                    const { slideWidth, padding, gap } = getMetrics();
                    stage.style.gap = `${gap}px`;
                    stage.style.padding = `0 ${padding}px`;
                    stage.style.display = 'flex';
                    stage.style.willChange = 'transform';
                    stage.style.alignItems = 'center';
                    stage.style.overflow = 'visible';

                    slides.forEach(s => {
                        s.style.flex = `0 0 ${slideWidth}px`;
                        s.style.maxWidth = `${slideWidth}px`;
                        s.style.minWidth = '320px';
                        s.style.boxSizing = 'border-box';
                    });
                };

                const updatePagination = () => {
                    const pag = document.getElementById('projects-pagination');
                    if (!pag) return;
                    Array.from(pag.children).forEach((b, i) => b.classList.toggle('active', i === current));
                };

                const updateStage = (instant = false) => {
                    const { wrapperWidth, slideWidth, gap, padding } = getMetrics();
                    if (instant) stage.style.transition = 'none';
                    else stage.style.transition = 'transform 0.85s var(--ease-cinema)';

                    const offset = padding + current * (slideWidth + gap);
                    const centerOffset = wrapperWidth / 2 - slideWidth / 2;
                    stage.style.transform = `translateX(${centerOffset - offset}px)`;
                    updatePagination();
                };

                const showPlaceholder = (frame, message = 'Video preview coming soon') => {
                    if (!frame) return;
                    let placeholder = frame.querySelector('.project-preview-placeholder');
                    if (!placeholder) {
                        placeholder = document.createElement('div');
                        placeholder.className = 'project-preview-placeholder';
                        placeholder.textContent = message;
                        frame.appendChild(placeholder);
                    }
                    frame.classList.add('has-placeholder');
                };

                const hidePlaceholder = (frame) => {
                    if (!frame) return;
                    frame.classList.remove('has-placeholder');
                };

                const configurePreviewVideo = (video, projectId) => {
                    if (!video || !projectId) return;
                    const baseId = projectId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const fallbackSrc = `videos/${baseId}.mp4`;
                    const src = video.dataset.videoSrc || video.getAttribute('src') || fallbackSrc;
                    const frame = video.closest('.project-preview-frame');

                    video.dataset.videoSrc = src;
                    video.src = src;
                    video.muted = true;
                    video.loop = true;
                    video.autoplay = true;
                    video.playsInline = true;
                    video.preload = 'metadata';
                    video.style.opacity = '1';
                    hidePlaceholder(frame);

                    video.addEventListener('loadeddata', () => {
                        video.play().catch(() => {});
                        hidePlaceholder(frame);
                    });
                    video.addEventListener('error', () => {
                        showPlaceholder(frame);
                    });
                };

                const setupProjectVideos = () => {
                    slides.forEach(slide => {
                        const projectId = slide.dataset.projectId || slide.dataset.projectTitle || '';
                        const video = slide.querySelector('.project-preview-video');
                        if (video) configurePreviewVideo(video, projectId);
                    });
                };

                // Assign cinematic accents per-card, reading data-accent or falling back to theme tokens
                const hexToRgba = (hex, alpha = 1) => {
                    if (!hex) return `rgba(61,139,255,${alpha})`;
                    hex = hex.replace('#','').trim();
                    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
                    const r = parseInt(hex.substring(0,2),16);
                    const g = parseInt(hex.substring(2,4),16);
                    const b = parseInt(hex.substring(4,6),16);
                    return `rgba(${r},${g},${b},${alpha})`;
                };

                const assignAccents = () => {
                    const root = getComputedStyle(document.documentElement);
                    const defaults = [root.getPropertyValue('--accent-blue').trim() || '#3d8bff', root.getPropertyValue('--accent-gold').trim() || '#c8a84b', root.getPropertyValue('--accent-cyan').trim() || '#00d4ff'];
                    slides.forEach((slide, i) => {
                        let accent = (slide.dataset.accent || slide.getAttribute('data-accent') || '').trim();
                        if (!accent) accent = defaults[i % defaults.length];
                        const accentHex = accent.startsWith('var(') ? defaults[i % defaults.length] : accent;
                        slide.style.setProperty('--project-accent', accentHex);
                        slide.style.setProperty('--project-accent-bg', hexToRgba(accentHex, 0.12));
                        slide.style.setProperty('--project-accent-border', hexToRgba(accentHex, 0.20));
                        slide.style.setProperty('--project-card-glow', hexToRgba(accentHex, 0.28));
                    });
                };

                const goTo = (idx) => {
                    current = (idx + slides.length) % slides.length;
                    updateStage();
                };
                const next = () => { goTo(current + 1); resetTimer(); };
                const prev = () => { goTo(current - 1); resetTimer(); };

                const startTimer = () => { if (timer) clearInterval(timer); timer = setInterval(() => next(), AUTO_DELAY); };
                const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
                const resetTimer = () => { stopTimer(); startTimer(); };

                const buildPagination = () => {
                    const pagEl = document.getElementById('projects-pagination');
                    if (!pagEl) return;
                    pagEl.innerHTML = '';
                    slides.forEach((_, i) => {
                        const b = document.createElement('button');
                        b.type = 'button';
                        b.addEventListener('click', () => { goTo(i); resetTimer(); });
                        if (i === current) b.classList.add('active');
                        pagEl.appendChild(b);
                    });
                };

                const updateVisuals = () => {
                    // Cinematic layered 3-card visuals
                    const { wrapperWidth, slideWidth } = getMetrics();
                    const vpCenterX = window.innerWidth / 2;
                    const maxDist = wrapperWidth / 2 + slideWidth / 2;

                    slides.forEach((slide, index) => {
                        const rect = slide.getBoundingClientRect();
                        const slideCenterX = rect.left + rect.width / 2;
                        const dist = Math.abs(slideCenterX - vpCenterX);
                        const proximity = Math.max(0, 1 - dist / maxDist); // 0..1

                        // Layered depth: center card is elevated, sides recede
                        const scaleCenter = 1.0 + proximity * 0.15; // up to +15%
                        const scaleSide = 0.92 + proximity * 0.06; // side subtle growth
                        const isActive = index === current;

                        // Vertical offset: active card sits slightly above peers
                        const translateY = isActive ? -18 * proximity : 6 * (1 - proximity);

                        // Opacity and blur for cinematic feel
                        const opacity = 0.38 + proximity * 0.62; // 0.38..1
                        const blurPx = Math.min(4, (1 - proximity) * 4); // 0..4px subtle (kept small for perf)

                        // z-index layering: active highest, then proximity-based
                        const z = isActive ? 3000 : Math.round(2000 - dist);

                        // Apply transforms and visual styles (GPU-friendly)
                        const scale = isActive ? scaleCenter : scaleSide;
                        slide.style.opacity = opacity.toFixed(3);
                        slide.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
                        slide.style.zIndex = `${z}`;
                        // Use filter sparingly for perf
                        slide.style.filter = blurPx > 0 ? `blur(${blurPx.toFixed(2)}px)` : '';
                        slide.style.willChange = 'transform, opacity';

                        // Accent-driven glow/shadow using CSS var fallback
                        const cs = getComputedStyle(slide);
                        let accent = cs.getPropertyValue('--project-accent') || '';
                        accent = accent.trim() || getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim();
                        const glow = hexToRgba(accent.replace('#',''), 0.28);
                        const darkShadowAlpha = 0.18 + proximity * 0.12;
                        slide.style.boxShadow = `0 36px 120px rgba(0,0,0,${darkShadowAlpha.toFixed(2)}), 0 12px 60px ${glow}`;

                        slide.classList.toggle('active', isActive);
                    });
                    rafHandle = requestAnimationFrame(updateVisuals);
                };

                // Clicking side cards to navigate (go directly to that index)
                slides.forEach((slide, idx) => {
                    slide.style.cursor = 'pointer';
                    slide.addEventListener('click', (e) => {
                        if (idx === current) return; // clicking center does nothing
                        goTo(idx);
                        resetTimer();
                    });
                });

                const bindControls = () => {
                    document.querySelectorAll('[data-carousel-action]').forEach(btn => {
                        const action = btn.getAttribute('data-carousel-action');
                        if (action === 'next') btn.addEventListener('click', next);
                        if (action === 'prev') btn.addEventListener('click', prev);
                    });
                };

                syncSizes();
                assignAccents();
                buildPagination();
                bindControls();
                setupProjectVideos();

                stage.addEventListener('mouseenter', stopTimer);
                stage.addEventListener('mouseleave', startTimer);

                window.addEventListener('resize', () => {
                    syncSizes();
                    updateStage(true);
                });

                // Initial positioning and start auto-advance
                updateStage(true);
                requestAnimationFrame(() => requestAnimationFrame(() => updateStage(false)));
                startTimer();
                updateVisuals();

                state.projectCarousel = { inited: true, next, prev, goTo, startTimer, stopTimer, _raf: () => rafHandle };
            };


            /* ─────────────────────────────────────────────
               PROJECT LIGHTBOX / FULLSCREEN PREVIEW
            ───────────────────────────────────────────── */
            const initProjectLightbox = () => {
                // open buttons
                document.querySelectorAll('[data-project-expand]').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const id = btn.getAttribute('data-project-expand');
                        openProjectLightbox(id);
                    });
                });

                // close controls
                document.querySelectorAll('[data-lightbox-close]').forEach(el => el.addEventListener('click', closeProjectLightbox));
                document.querySelectorAll('.project-lightbox-backdrop').forEach(b => b.addEventListener('click', closeProjectLightbox));

                // ESC close
                document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProjectLightbox(); });
            };

            const openProjectLightbox = (id) => {
                const article = document.querySelector(`[data-project-id="${id}"]`);
                if (!article) return;
                const lb = document.getElementById('project-lightbox');
                const body = document.getElementById('project-lightbox-body');
                const title = document.getElementById('project-lightbox-title');
                const kicker = document.getElementById('project-lightbox-kicker');
                const link = document.getElementById('project-lightbox-link');

                title.textContent = article.getAttribute('data-project-title') || '';
                kicker.textContent = article.getAttribute('data-project-kicker') || '';
                link.href = article.getAttribute('data-project-url') || '#';
                body.innerHTML = '';

                // Prefer video preview if available
                const vid = article.querySelector('.project-preview-video');
                if (vid && (vid.dataset && vid.dataset.videoSrc || vid.getAttribute('src'))) {
                    const src = vid.dataset.videoSrc || vid.getAttribute('src');
                    const video = document.createElement('video');
                    video.src = src;
                    video.controls = true; video.autoplay = true; video.playsInline = true; video.muted = false;
                    video.style.width = '100%'; video.style.height = 'auto';
                    body.appendChild(video);
                } else {
                    // clone surface preview if available
                    const preview = article.querySelector('.project-preview-frame');
                    if (preview) body.appendChild(preview.cloneNode(true));
                }

                lb.classList.add('open');
                lb.setAttribute('aria-hidden', 'false');
            };

            const closeProjectLightbox = () => {
                const lb = document.getElementById('project-lightbox');
                if (!lb) return;
                const v = lb.querySelector('video'); if (v) try { v.pause(); } catch (e) {}
                lb.classList.remove('open');
                lb.setAttribute('aria-hidden', 'true');
                const body = document.getElementById('project-lightbox-body'); if (body) body.innerHTML = '';
            };

            /* ─────────────────────────────────────────────
               EXPERIENCE CINEMATIC SCROLL ANIMATION
            ───────────────────────────────────────────── */
            const initExperienceAnimations = () => {
                const nodes = document.querySelectorAll('.experience-node');
                if (nodes.length === 0) return;

                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

                nodes.forEach(node => observer.observe(node));

                // Continuous scroll-linked animation (horizontal center reactive)
                let raf;
                const updateExperienceScroll = () => {
                    const vpCenterX = window.innerWidth / 2;
                    nodes.forEach(node => {
                        const rect = node.getBoundingClientRect();
                        const nodeCenterX = rect.left + rect.width / 2;
                        const dist = Math.abs(nodeCenterX - vpCenterX);
                        const maxDist = window.innerWidth / 2 + rect.width / 2;

                        // Opacity linked to horizontal position
                        const opacity = Math.max(0.4, 1 - (dist / maxDist) * 0.6);

                        // Scale up to ~1.15 near center, down when leaving
                        const scale = Math.max(0.85, 1.15 - (dist / maxDist) * 0.3);

                        // Slight Y parallax for depth
                        const translateY = Math.max(-12, Math.min(12, (rect.top - window.innerHeight / 2) * 0.03));

                        node.style.opacity = opacity.toFixed(3);
                        node.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
                    });
                    raf = requestAnimationFrame(updateExperienceScroll);
                };
                updateExperienceScroll();
            };

            /* ─────────────────────────────────────────────
               CONTACT FORM SUBMIT
            ───────────────────────────────────────────── */
            const submitForm = (btn) => {
                btn.textContent = '✓ Message Sent';
                btn.classList.add('sent');
                const inputs = btn.closest('.contact-form').querySelectorAll('input,textarea');
                inputs.forEach(inp => { inp.style.opacity = '0.5'; inp.disabled = true; });
            };


            // Public API
            return {
                init,
                skipIntro,
                clickAkshayCard,
                toggleTheme,
                addToCart,
                activateMobileView,
                deactivateMobileView,
                replayIntro,
                scrollToSection,
                submitForm,
            };
        })();

        // Bootstrap
        document.addEventListener('DOMContentLoaded', App.init);

        // Keyboard accessibility for hero card
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter' && document.activeElement.id === 'akshay-card') {
                App.clickAkshayCard(e);
            }
        });
