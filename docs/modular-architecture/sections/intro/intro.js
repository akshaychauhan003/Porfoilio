/* ╔══════════════════════════════════════════════════════════════╗
   ║  INTRO SECTION - Animation & Search Controller                ║
   ╚══════════════════════════════════════════════════════════════╝ */

const IntroSystem = (() => {
    let elements = {};
    let IntroState = {
        theme: 'dark',
        ghostMode: false,
        ghostX: window.innerWidth / 2,
        ghostY: window.innerHeight / 2,
        introPlayed: false,
        threeScene: window.BackgroundSystem ? window.BackgroundSystem.getState() : null
    };

    const SEARCH_TEXT = "perfect coder";

    const init = async () => {
        cacheElements();
        
        // If already played in this session, skip
        if (sessionStorage.getItem('intro-played')) {
            skipIntro();
            return;
        }
        
        // Else start sequence
        startIntro();
        
        console.log('✓ Intro system initialized');
    };

    const cacheElements = () => {
        elements.root = document.getElementById('intro-root');
    };

    // Need a dummy initProgressBar if it's not defined
    const initProgressBar = () => {
        const bar = document.getElementById('intro-progress');
        if (!bar) return;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = '30%'; }, 200);
        setTimeout(() => { bar.style.width = '70%'; }, 1000);
        setTimeout(() => { bar.style.width = '100%'; }, 1800);
        setTimeout(() => { bar.style.opacity = '0'; }, 2200);
    };

                document.getElementById('skip-btn').style.display = 'flex';
                document.documentElement.setAttribute('data-theme', IntroState.theme);
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
                        IntroState.ghostX = u * u * x0 + 2 * u * t * cpX + t * t * x1;
                        IntroState.ghostY = u * u * y0 + 2 * u * t * cpY + t * t * y1;
                        dot.style.left = IntroState.ghostX + 'px';
                        dot.style.top = IntroState.ghostY + 'px';
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

                IntroState.ghostMode = true;
                IntroState.ghostX = startX;
                IntroState.ghostY = startY;
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
                    IntroState.ghostX = targetX;
                    IntroState.ghostY = targetY;
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

                await glideGhostCursor(IntroState.ghostX, IntroState.ghostY, btnX, btnY, 450, 0, 0);
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
                const startX = IntroState.ghostX;
                const startY = IntroState.ghostY;
                const tgt = getTarget();

                // ── Glide: long organic arc from search bar → card ──
                // Use a wide control-point offset so the path sweeps naturally
                const cpOffX = (tgt.x - startX) * -0.15;
                await glideGhostCursor(startX, startY, tgt.x, tgt.y, 1350, cpOffX, -110);

                // ── Hover: ring expands, card lifts with glow ──
                document.body.classList.add('cursor-hover');
                card.classList.add('auto-hover');
                IntroState.ghostX = tgt.x;
                IntroState.ghostY = tgt.y;
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
                IntroState.ghostMode = false; // hand cursor control back to real mouse

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
                IntroState.introPlayed = true;
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
                if (IntroState.threeScene && IntroState.threeScene.particles) {
                    initParticleRepulsion(IntroState.threeScene.particles);
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
                IntroState.introPlayed = true;
            };


    const destroy = () => {
        // Cleanup if needed
    };

    return {
        init,
        destroy,
        skipIntro,
        clickAkshayCard
    };
})();

window.IntroSystem = IntroSystem;
// For inline handlers in the extracted HTML:
window.App = window.App || {};
window.App.skipIntro = IntroSystem.skipIntro;
window.App.clickAkshayCard = IntroSystem.clickAkshayCard;
