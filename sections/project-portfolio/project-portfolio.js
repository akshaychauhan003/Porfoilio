/* ╔══════════════════════════════════════════════════════════════╗
   ║  PROJECT PORTFOLIO SECTION - Cinematic Showcase           ║
   ╚══════════════════════════════════════════════════════════════╝ */

const ProjectPortfolioSystem = (() => {
    let elements = {};
    let activeCarouselIndex = 0;
    
    const init = async () => {
        cacheElements();
        initProjectVisuals();
        console.log('✓ Project Portfolio system initialized');
    };

    const cacheElements = () => {
        elements.root = document.getElementById('project-portfolio-root');
    };

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



    const destroy = () => {
        // cleanup
    };

    return {
        init,
        destroy
    };
})();

window.ProjectPortfolioSystem = ProjectPortfolioSystem;
