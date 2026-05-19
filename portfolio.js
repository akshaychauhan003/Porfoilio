'use strict';

const App = (() => {
    const CONFIG = {
        searchText: 'perfect coder',
        themeTransitionMs: 1456,
        carouselIntervalMs: 2251,
        carouselSwipeThreshold: 54,
        sectionIds: ['hero', 'about', 'skills', 'projects', 'experience', 'reviews', 'contact'],
        cursorTrailCount: 4,
        scrollAnimationDistance: 150,
        scrollAnimationMaxScale: 1.15,
        contact: {
            duplicateWindowMs: 5 * 60 * 1000,
            submissionKey: 'as-contact-last-submission-v2',
            queueKey: 'as-contact-offline-queue-v2',
        },
    };

    const state = {
        introPlayed: false,
        theme: localStorage.getItem('as-theme') || 'dark',
        cartCount: 0,
        mobileActive: false,
        runtimeInitialized: false,
        isMobileViewport: false,
        isLowEndDevice: false,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        ghostMode: false,
        ghostX: window.innerWidth * 0.15,
        ghostY: window.innerHeight * 0.18,
    };

    const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const lerp = (start, end, amount) => start + (end - start) * amount;

    const getIsLowEndDevice = () => {
        const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
        const lowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const saveData = navigator.connection && navigator.connection.saveData;
        return Boolean(lowMemory || lowCpu || saveData || state.prefersReducedMotion);
    };

    const updateViewportCapabilities = () => {
        state.isMobileViewport = window.matchMedia('(max-width: 900px)').matches;
        state.isLowEndDevice = getIsLowEndDevice();
    };

    const setTheme = (theme, animate = false) => {
        state.theme = theme;
        if (animate) {
            document.documentElement.classList.add('theme-is-switching');
            window.setTimeout(() => {
                document.documentElement.classList.remove('theme-is-switching');
            }, CONFIG.themeTransitionMs + 120);
        }

        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌗' : '☀️';
        }

        localStorage.setItem('as-theme', theme);
        ThreeController.applyTheme(theme);
    };

    const supportsCustomCursor = () => {
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        const hoverCapable = window.matchMedia('(hover: hover)').matches;
        const touchPoints = navigator.maxTouchPoints || 0;
        return finePointer && hoverCapable && touchPoints === 0 && !state.isLowEndDevice && !state.prefersReducedMotion;
    };

    const CursorController = (() => {
        const runtime = {
            enabled: false,
            suspended: false,
            dot: null,
            ring: null,
            trail: [],
            rafId: 0,
            targetX: window.innerWidth * 0.5,
            targetY: window.innerHeight * 0.5,
            ringX: window.innerWidth * 0.5,
            ringY: window.innerHeight * 0.5,
            dotScale: 1,
            ringScale: 1,
            hoverForced: false,
            hoverInteractive: false,
            pulseTimeout: 0,
            listenersBound: false,
        };

        const interactiveSelector = 'a[href], button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])';

        const updateHoverState = () => {
            runtime.ring.classList.toggle('is-hover', runtime.hoverForced || runtime.hoverInteractive);
            runtime.ringScale = runtime.hoverForced || runtime.hoverInteractive ? 1.6 : 1;
        };

        const show = () => {
            runtime.dot.classList.add('active');
            runtime.ring.classList.add('active');
            runtime.trail.forEach((node) => node.classList.add('active'));
        };

        const hide = () => {
            runtime.dot.classList.remove('active');
            runtime.ring.classList.remove('active');
            runtime.trail.forEach((node) => node.classList.remove('active'));
        };

        const render = () => {
            if (!runtime.enabled || runtime.suspended) {
                runtime.rafId = 0;
                return;
            }

            const nextX = state.ghostMode ? state.ghostX : runtime.targetX;
            const nextY = state.ghostMode ? state.ghostY : runtime.targetY;

            runtime.ringX = lerp(runtime.ringX, nextX, state.ghostMode ? 0.18 : 0.24);
            runtime.ringY = lerp(runtime.ringY, nextY, state.ghostMode ? 0.18 : 0.24);

            runtime.dot.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate3d(-50%, -50%, 0) scale(${runtime.dotScale})`;
            runtime.ring.style.transform = `translate3d(${runtime.ringX}px, ${runtime.ringY}px, 0) translate3d(-50%, -50%, 0) scale(${runtime.ringScale})`;

            runtime.trail.forEach((node, index) => {
                const mix = 0.28 - index * 0.05;
                const x = lerp(runtime.ringX, nextX, clamp(mix, 0.08, 0.3));
                const y = lerp(runtime.ringY, nextY, clamp(mix, 0.08, 0.3));
                node.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
            });

            runtime.rafId = window.requestAnimationFrame(render);
        };

        const start = () => {
            if (!runtime.rafId) {
                runtime.rafId = window.requestAnimationFrame(render);
            }
        };

        const buildTrail = () => {
            if (state.isLowEndDevice || state.isMobileViewport) {
                return;
            }

            for (let index = 0; index < CONFIG.cursorTrailCount; index += 1) {
                const node = document.createElement('div');
                node.className = 'cursor-trail';
                node.style.opacity = `${0.26 - index * 0.04}`;
                document.body.appendChild(node);
                runtime.trail.push(node);
            }
        };

        const destroyTrail = () => {
            runtime.trail.forEach((node) => node.remove());
            runtime.trail = [];
        };

        const disable = () => {
            runtime.enabled = false;
            runtime.suspended = false;
            document.documentElement.setAttribute('data-custom-cursor', 'disabled');
            if (runtime.rafId) {
                window.cancelAnimationFrame(runtime.rafId);
                runtime.rafId = 0;
            }
            if (runtime.dot && runtime.ring) {
                hide();
            }
            destroyTrail();
        };

        const init = () => {
            runtime.dot = document.getElementById('cursor-dot');
            runtime.ring = document.getElementById('cursor-ring');

            if (!runtime.dot || !runtime.ring || !supportsCustomCursor()) {
                disable();
                return;
            }

            runtime.enabled = true;
            document.documentElement.setAttribute('data-custom-cursor', 'enabled');
            buildTrail();

            if (!runtime.listenersBound) {
                runtime.listenersBound = true;

                document.addEventListener('pointermove', (event) => {
                    if (event.pointerType !== 'mouse' || !runtime.enabled || runtime.suspended) {
                        return;
                    }

                    runtime.targetX = event.clientX;
                    runtime.targetY = event.clientY;
                    show();
                }, { passive: true });

                document.addEventListener('pointerdown', () => {
                    if (!runtime.enabled || runtime.suspended) {
                        return;
                    }
                    runtime.dotScale = 1.7;
                    runtime.ringScale += 0.1;
                    window.clearTimeout(runtime.pulseTimeout);
                    runtime.pulseTimeout = window.setTimeout(() => {
                        runtime.dotScale = 1;
                        updateHoverState();
                    }, 170);
                });

                document.addEventListener('pointerleave', hide);
                document.addEventListener('mouseleave', hide);
                window.addEventListener('blur', hide);

                document.addEventListener('mouseover', (event) => {
                    if (!runtime.enabled || runtime.suspended) {
                        return;
                    }
                    runtime.hoverInteractive = Boolean(event.target.closest(interactiveSelector));
                    updateHoverState();
                }, true);

                document.addEventListener('focusin', (event) => {
                    runtime.hoverInteractive = Boolean(event.target.closest(interactiveSelector));
                    updateHoverState();
                });

                document.addEventListener('focusout', () => {
                    runtime.hoverInteractive = false;
                    updateHoverState();
                });
            }

            start();
        };

        return {
            init,
            disable,
            suspend() {
                runtime.suspended = true;
                hide();
            },
            resume() {
                if (!runtime.enabled) {
                    return;
                }
                runtime.suspended = false;
                show();
                start();
            },
            setGhostMode(enabled) {
                state.ghostMode = enabled;
                if (enabled) {
                    show();
                }
            },
            setGhostPosition(x, y) {
                state.ghostX = x;
                state.ghostY = y;
                show();
            },
            setForcedHover(enabled) {
                runtime.hoverForced = enabled;
                updateHoverState();
            },
            pulse() {
                if (!runtime.enabled) {
                    return;
                }
                runtime.dotScale = 1.9;
                runtime.ringScale += 0.15;
                window.clearTimeout(runtime.pulseTimeout);
                runtime.pulseTimeout = window.setTimeout(() => {
                    runtime.dotScale = 1;
                    updateHoverState();
                }, 190);
            },
            refreshCapability() {
                if (supportsCustomCursor()) {
                    if (!runtime.enabled) {
                        init();
                    }
                } else {
                    disable();
                }
            },
        };
    })();

    const ThreeController = (() => {
        const runtime = {
            initialized: false,
            running: false,
            canvas: null,
            renderer: null,
            scene: null,
            camera: null,
            particles: null,
            material: null,
            meshGroup: null,
            rafId: 0,
            clock: null,
            mouseX: 0,
            mouseY: 0,
            reducedQuality: false,
            firstFramePainted: false,
            frameCount: 0,
            frameStart: 0,
            resizeTimeout: 0,
        };

        const getParticleCount = () => {
            if (state.isLowEndDevice || state.prefersReducedMotion) {
                return 0;
            }
            return state.isMobileViewport ? 180 : 460;
        };

        const applyQualityReduction = () => {
            if (!runtime.renderer || runtime.reducedQuality) {
                return;
            }

            runtime.reducedQuality = true;
            runtime.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));

            if (runtime.meshGroup) {
                runtime.meshGroup.visible = false;
            }

            if (runtime.material) {
                runtime.material.opacity = state.theme === 'light' ? 0.24 : 0.5;
            }
        };

        const applyTheme = (theme) => {
            if (!runtime.material || !runtime.meshGroup) {
                return;
            }

            runtime.material.opacity = theme === 'light' ? 0.3 : 0.62;
            runtime.meshGroup.children.forEach((mesh, index) => {
                mesh.material.opacity = theme === 'light'
                    ? (index === 0 ? 0.06 : 0.045)
                    : (index === 0 ? 0.11 : 0.08);
            });
        };

        const handleResize = () => {
            if (!runtime.renderer || !runtime.camera) {
                return;
            }
            runtime.camera.aspect = window.innerWidth / Math.max(window.innerHeight, 1);
            runtime.camera.updateProjectionMatrix();
            runtime.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, state.isMobileViewport ? 1.35 : 1.8));
            runtime.renderer.setSize(window.innerWidth, window.innerHeight, false);
        };

        const animate = (timestamp) => {
            if (!runtime.running) {
                runtime.rafId = 0;
                return;
            }

            runtime.rafId = window.requestAnimationFrame(animate);

            if (document.hidden || state.mobileActive) {
                return;
            }

            const elapsed = runtime.clock.getElapsedTime();

            if (runtime.particles) {
                runtime.particles.rotation.y = elapsed * 0.028;
                runtime.particles.rotation.x = elapsed * 0.012;
            }

            if (runtime.meshGroup) {
                runtime.meshGroup.rotation.y = elapsed * 0.018;
                runtime.meshGroup.rotation.x = Math.sin(elapsed * 0.15) * 0.04;
                runtime.meshGroup.children.forEach((mesh, index) => {
                    mesh.rotation.x = elapsed * (0.08 + index * 0.03);
                    mesh.rotation.y = elapsed * (0.1 + index * 0.02);
                });
            }

            runtime.camera.position.x = lerp(runtime.camera.position.x, runtime.mouseX * 2.2, 0.03);
            runtime.camera.position.y = lerp(runtime.camera.position.y, runtime.mouseY * -1.6, 0.03);
            runtime.camera.lookAt(0, 0, 0);
            runtime.renderer.render(runtime.scene, runtime.camera);

            if (!runtime.firstFramePainted && runtime.canvas) {
                runtime.canvas.classList.add('visible');
                runtime.firstFramePainted = true;
            }

            if (!runtime.reducedQuality) {
                if (!runtime.frameStart) {
                    runtime.frameStart = timestamp;
                }
                runtime.frameCount += 1;
                if (runtime.frameCount === 90) {
                    const fps = 90000 / Math.max(timestamp - runtime.frameStart, 1);
                    if (fps < 48) {
                        applyQualityReduction();
                    }
                }
            }
        };

        const init = () => {
            if (runtime.initialized || typeof window.THREE === 'undefined' || getParticleCount() === 0) {
                return;
            }

            runtime.canvas = document.getElementById('three-canvas');
            if (!runtime.canvas) {
                return;
            }

            const renderer = new THREE.WebGLRenderer({
                canvas: runtime.canvas,
                alpha: true,
                antialias: !state.isMobileViewport,
                premultipliedAlpha: true,
                powerPreference: 'high-performance',
            });
            renderer.setClearColor(0x000000, 0);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, state.isMobileViewport ? 1.35 : 1.8));
            renderer.setSize(window.innerWidth, window.innerHeight, false);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(58, window.innerWidth / Math.max(window.innerHeight, 1), 0.1, 160);
            camera.position.z = 26;

            const particleCount = getParticleCount();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const palette = [
                new THREE.Color('#3d8bff'),
                new THREE.Color('#00d4ff'),
                new THREE.Color('#c8a84b'),
            ];

            for (let index = 0; index < particleCount; index += 1) {
                const stride = index * 3;
                const radius = 6 + Math.random() * 42;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[stride] = radius * Math.sin(phi) * Math.cos(theta);
                positions[stride + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[stride + 2] = radius * Math.cos(phi);

                const tint = palette[index % palette.length].clone().lerp(palette[(index + 1) % palette.length], Math.random() * 0.45);
                colors[stride] = tint.r;
                colors[stride + 1] = tint.g;
                colors[stride + 2] = tint.b;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: state.isMobileViewport ? 0.15 : 0.12,
                vertexColors: true,
                transparent: true,
                opacity: state.theme === 'light' ? 0.3 : 0.62,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });

            const particles = new THREE.Points(geometry, material);
            scene.add(particles);

            const meshGroup = new THREE.Group();
            const wireBlue = new THREE.MeshBasicMaterial({
                color: 0x3d8bff,
                wireframe: true,
                transparent: true,
                opacity: state.theme === 'light' ? 0.06 : 0.11,
            });
            const wireGold = new THREE.MeshBasicMaterial({
                color: 0xc8a84b,
                wireframe: true,
                transparent: true,
                opacity: state.theme === 'light' ? 0.045 : 0.08,
            });

            const meshes = [
                new THREE.Mesh(new THREE.IcosahedronGeometry(3.2, 0), wireBlue),
                new THREE.Mesh(new THREE.OctahedronGeometry(2.8, 0), wireGold),
            ];
            meshes[0].position.set(-10, 6, -8);
            meshes[1].position.set(12, -8, -10);
            meshes.forEach((mesh) => meshGroup.add(mesh));
            scene.add(meshGroup);

            runtime.renderer = renderer;
            runtime.scene = scene;
            runtime.camera = camera;
            runtime.particles = particles;
            runtime.material = material;
            runtime.meshGroup = meshGroup;
            runtime.clock = new THREE.Clock();
            runtime.initialized = true;

            document.addEventListener('pointermove', (event) => {
                if (event.pointerType !== 'mouse') {
                    return;
                }
                runtime.mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
                runtime.mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
            }, { passive: true });

            window.addEventListener('resize', () => {
                window.clearTimeout(runtime.resizeTimeout);
                runtime.resizeTimeout = window.setTimeout(handleResize, 120);
            }, { passive: true });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stop();
                } else if (state.introPlayed && !state.mobileActive) {
                    start();
                }
            });

            if (navigator.getBattery) {
                navigator.getBattery().then((battery) => {
                    const maybeReduce = () => {
                        if (battery.level <= 0.2 && !battery.charging) {
                            applyQualityReduction();
                        }
                    };
                    maybeReduce();
                    battery.addEventListener('levelchange', maybeReduce);
                    battery.addEventListener('chargingchange', maybeReduce);
                }).catch(() => {
                    // Battery API is optional.
                });
            }
        };

        const start = () => {
            if (!runtime.initialized) {
                init();
            }
            if (!runtime.initialized || runtime.running) {
                return;
            }
            runtime.running = true;
            runtime.rafId = window.requestAnimationFrame(animate);
        };

        const stop = () => {
            runtime.running = false;
            if (runtime.rafId) {
                window.cancelAnimationFrame(runtime.rafId);
                runtime.rafId = 0;
            }
        };

        return {
            init,
            start,
            stop,
            applyTheme,
            refresh() {
                if (!runtime.initialized) {
                    return;
                }
                handleResize();
            },
        };
    })();

    const SectionChromeController = (() => {
        let sectionObserver = null;
        let scrollTicking = false;
        let mobileScreenObserver = null;

        const updateScrollChrome = () => {
            scrollTicking = false;
            const nav = document.getElementById('port-nav');
            const fill = document.getElementById('scroll-progress-fill');
            const device = document.getElementById('device-wrap');
            
            // Use mobile screen scroll if active, otherwise use window scroll
            const scrollElement = state.mobileActive && device?.classList.contains('visible') 
                ? document.getElementById('device-screen') 
                : window;
            
            const scrollY = scrollElement === window ? window.scrollY : scrollElement?.scrollTop || 0;
            const scrollHeight = scrollElement === window 
                ? document.documentElement.scrollHeight 
                : scrollElement?.scrollHeight || 0;
            const clientHeight = scrollElement === window 
                ? window.innerHeight 
                : scrollElement?.clientHeight || 0;
            
            if (nav && scrollElement === window) {
                nav.classList.toggle('scrolled', scrollY > 60);
            }
            
            if (fill) {
                const total = scrollHeight - clientHeight;
                fill.style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
            }
        };

        const onScroll = () => {
            if (scrollTicking) {
                return;
            }
            scrollTicking = true;
            window.requestAnimationFrame(updateScrollChrome);
        };

        return {
            init() {
                updateScrollChrome();
                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('resize', onScroll, { passive: true });

                const sections = CONFIG.sectionIds
                    .map((id) => document.getElementById(id))
                    .filter(Boolean);

                sectionObserver = new IntersectionObserver((entries) => {
                    const activeEntry = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                    if (!activeEntry) {
                        return;
                    }

                    const activeId = activeEntry.target.id;
                    document.querySelectorAll('.s-dot').forEach((dot) => {
                        dot.classList.toggle('active', dot.getAttribute('data-target') === activeId);
                    });
                }, {
                    rootMargin: '-36% 0px -40% 0px',
                    threshold: [0.2, 0.4, 0.65],
                });

                sections.forEach((section) => sectionObserver.observe(section));
                
                // Also observe mobile screen if it exists
                window.setTimeout(() => {
                    const deviceScreen = document.getElementById('device-screen');
                    if (deviceScreen) {
                        deviceScreen.addEventListener('scroll', onScroll, { passive: true });
                    }
                    document.getElementById('section-dots')?.classList.add('visible');
                }, 1200);
            },
        };
    })();

    const RevealController = (() => {
        let observer = null;

        return {
            init() {
                const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
                observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    });
                }, {
                    threshold: 0.16,
                    rootMargin: '0px 0px -9% 0px',
                });

                elements.forEach((element) => observer.observe(element));
            },
        };
    })();

    const CounterController = (() => {
        return {
            init() {
                const counters = document.querySelectorAll('.count-up');
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        const element = entry.target;
                        const target = parseFloat(element.getAttribute('data-target') || '0');
                        const suffix = element.getAttribute('data-suffix') || '';
                        const duration = 1800;
                        const start = performance.now();

                        const tick = (now) => {
                            const progress = clamp((now - start) / duration, 0, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const value = target * eased;
                            element.textContent = `${Number.isInteger(target) ? Math.floor(value) : value.toFixed(1)}${suffix}`;
                            if (progress < 1) {
                                window.requestAnimationFrame(tick);
                            } else {
                                element.textContent = `${target}${suffix}`;
                            }
                        };

                        window.requestAnimationFrame(tick);
                        observer.unobserve(element);
                    });
                }, { threshold: 0.55 });

                counters.forEach((counter) => observer.observe(counter));
            },
        };
    })();

    const ProgressRingController = (() => {
        return {
            init() {
                const rings = document.querySelectorAll('.skill-ring-arc');
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    });
                }, { threshold: 0.35 });

                rings.forEach((ring) => observer.observe(ring));
            },
        };
    })();

    const RatingBarController = (() => {
        return {
            init() {
                const ratings = document.getElementById('rating-bars');
                if (!ratings) {
                    return;
                }

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }
                        document.querySelectorAll('.rating-bar-fill').forEach((bar) => {
                            bar.style.width = `${bar.getAttribute('data-width') || '0'}%`;
                        });
                        observer.disconnect();
                    });
                }, { threshold: 0.45 });

                observer.observe(ratings);
            },
        };
    })();

    const ScrollAnimationController = (() => {
        let scrollRafId = 0;
        let lastScrollY = 0;

        const updateScrollAnimations = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            
            document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .skill-card, .stat-card').forEach((el) => {
                const rect = el.getBoundingClientRect();
                const elementCenter = rect.top + rect.height * 0.5;
                const distanceFromCenter = Math.abs(elementCenter - viewportHeight * 0.5);
                const maxDistance = CONFIG.scrollAnimationDistance;
                
                let progress = 1 - Math.min(distanceFromCenter / maxDistance, 1);
                progress = Math.max(0, progress);
                
                const scale = 1 + (CONFIG.scrollAnimationMaxScale - 1) * progress * 0.15;
                const opacity = 0.6 + progress * 0.4;
                const blur = (1 - progress) * 1.5;
                
                el.style.setProperty('--scroll-scale', `${scale}`);
                el.style.setProperty('--scroll-opacity', `${opacity}`);
                el.style.setProperty('--scroll-blur', `${blur}px`);
                
                if (!el.hasAttribute('data-scroll-animated')) {
                    el.style.transform = `scale(var(--scroll-scale))`;
                    el.style.opacity = `var(--scroll-opacity)`;
                    el.style.filter = `blur(var(--scroll-blur))`;
                    el.setAttribute('data-scroll-animated', 'true');
                }
            });
            
            scrollRafId = window.requestAnimationFrame(updateScrollAnimations);
        };

        return {
            init() {
                window.addEventListener('scroll', () => {
                    if (scrollRafId) {
                        window.cancelAnimationFrame(scrollRafId);
                    }
                    scrollRafId = window.requestAnimationFrame(updateScrollAnimations);
                }, { passive: true });
                
                updateScrollAnimations();
            },
        };
    })();

    const InteractiveSurfaceController = (() => {
        const initTiltCard = (card) => {
            if (state.isLowEndDevice || state.isMobileViewport) {
                return;
            }

            const shine = card.querySelector('.tilt-shine');
            let frame = 0;

            card.addEventListener('pointermove', (event) => {
                if (event.pointerType !== 'mouse') {
                    return;
                }

                if (frame) {
                    window.cancelAnimationFrame(frame);
                }

                frame = window.requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const percentX = (event.clientX - rect.left) / rect.width;
                    const percentY = (event.clientY - rect.top) / rect.height;
                    const rotateX = (0.5 - percentY) * 10;
                    const rotateY = (percentX - 0.5) * 12;

                    card.classList.add('is-tilting');
                    card.style.transform = `translate3d(0, -6px, 0) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

                    if (shine) {
                        shine.style.setProperty('--sx', `${percentX * 100}%`);
                        shine.style.setProperty('--sy', `${percentY * 100}%`);
                    }
                });
            });

            card.addEventListener('pointerleave', () => {
                if (frame) {
                    window.cancelAnimationFrame(frame);
                }
                card.classList.remove('is-tilting');
                card.style.transform = '';
            });
        };

        const initMagneticButton = (button) => {
            if (state.isLowEndDevice || state.isMobileViewport) {
                return;
            }

            button.addEventListener('pointermove', (event) => {
                if (event.pointerType !== 'mouse') {
                    return;
                }
                const rect = button.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
                button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });

            button.addEventListener('pointerleave', () => {
                button.style.transform = '';
            });
        };

        return {
            init() {
                document.querySelectorAll('.skill-card, .project-preview-frame[data-tilt]').forEach(initTiltCard);
                document.querySelectorAll('.magnetic').forEach(initMagneticButton);
            },
        };
    })();

    const ExperienceTimelineController = (() => {
        let autoCycleId = 0;
        let activeIndex = 0;
        let track = null;
        let nodes = [];
        let inView = false;

        const setActive = (index) => {
            activeIndex = index;
            nodes.forEach((node, nodeIndex) => {
                node.classList.toggle('is-active', nodeIndex === index);
            });
        };

        const stopAutoCycle = () => {
            window.clearInterval(autoCycleId);
            autoCycleId = 0;
        };

        const startAutoCycle = () => {
            stopAutoCycle();
            if (!inView || state.isMobileViewport || state.prefersReducedMotion) {
                return;
            }
            autoCycleId = window.setInterval(() => {
                setActive((activeIndex + 1) % nodes.length);
            }, 3200);
        };

        return {
            init() {
                track = document.getElementById('experience-track');
                if (!track) {
                    return;
                }

                nodes = Array.from(track.querySelectorAll('.experience-node'));
                track.style.setProperty('--experience-count', `${nodes.length}`);
                setActive(0);

                nodes.forEach((node, index) => {
                    node.addEventListener('mouseenter', () => {
                        setActive(index);
                        stopAutoCycle();
                    });
                    node.addEventListener('mouseleave', startAutoCycle);
                    node.addEventListener('focusin', () => setActive(index));
                });

                const observer = new IntersectionObserver((entries) => {
                    const entry = entries[0];
                    inView = entry.isIntersecting;
                    if (inView) {
                        startAutoCycle();
                    } else {
                        stopAutoCycle();
                    }
                }, { threshold: 0.35 });

                observer.observe(track);
            },
        };
    })();

    const ProjectLightboxController = (() => {
        let root = null;
        let body = null;
        let link = null;
        let title = null;
        let kicker = null;
        let lastTrigger = null;
        let fullscreenOverlay = null;

        const createFullscreenOverlay = (video) => {
            const overlay = document.createElement('div');
            overlay.className = 'video-fullscreen-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Video fullscreen view');
            
            const videoClone = video.cloneNode(true);
            videoClone.className = 'video-fullscreen-player';
            videoClone.setAttribute('controls', 'controls');
            videoClone.setAttribute('playsinline', 'playsinline');
            videoClone.style.width = '100%';
            videoClone.style.height = '100%';
            videoClone.style.objectFit = 'contain';
            
            const closeButton = document.createElement('button');
            closeButton.className = 'video-fullscreen-close';
            closeButton.type = 'button';
            closeButton.setAttribute('aria-label', 'Exit fullscreen');
            closeButton.innerHTML = '✕';
            
            const closeFullscreen = () => {
                overlay.classList.remove('is-active');
                window.setTimeout(() => {
                    overlay.remove();
                    fullscreenOverlay = null;
                }, 300);
                document.body.classList.remove('video-fullscreen-open');
            };
            
            closeButton.addEventListener('click', closeFullscreen);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeFullscreen();
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && fullscreenOverlay === overlay) {
                    closeFullscreen();
                }
            }, { once: true });
            
            overlay.appendChild(videoClone);
            overlay.appendChild(closeButton);
            document.body.appendChild(overlay);
            
            window.requestAnimationFrame(() => {
                overlay.classList.add('is-active');
            });
            
            videoClone.play().catch(() => {});
            return overlay;
        };

        const pauseLightboxMedia = () => {
            root.querySelectorAll('video').forEach((video) => video.pause());
        };

        const close = () => {
            if (!root || !root.classList.contains('is-open')) {
                return;
            }

            pauseLightboxMedia();
            root.classList.remove('is-open');
            root.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lightbox-open');
            CursorController.resume();
            ProjectCarouselController.syncMedia();
            window.setTimeout(() => {
                if (body) {
                    body.innerHTML = '';
                }
            }, 280);

            if (lastTrigger) {
                lastTrigger.focus();
            }
        };

        const open = (projectId, trigger) => {
            root = root || document.getElementById('project-lightbox');
            body = body || document.getElementById('project-lightbox-body');
            link = link || document.getElementById('project-lightbox-link');
            title = title || document.getElementById('project-lightbox-title');
            kicker = kicker || document.getElementById('project-lightbox-kicker');

            const card = document.querySelector(`.project-showcase-card[data-project-id="${projectId}"]`);
            if (!card || !root || !body || !title || !kicker || !link) {
                return;
            }

            body.innerHTML = '';
            const preview = card.querySelector('.project-preview-frame');
            const clone = preview.cloneNode(true);
            const video = clone.querySelector('video');

            title.textContent = card.getAttribute('data-project-title') || '';
            kicker.textContent = card.getAttribute('data-project-kicker') || '';

            const href = card.getAttribute('data-project-url') || '';
            if (href) {
                link.href = href;
                link.removeAttribute('hidden');
            } else {
                link.setAttribute('hidden', 'hidden');
            }

            if (video && video.dataset.videoSrc) {
                video.src = video.dataset.videoSrc;
                video.setAttribute('controls', 'controls');
                video.setAttribute('playsinline', 'playsinline');
                video.setAttribute('loop', 'loop');
                video.muted = true;
                
                // Add fullscreen button for videos
                const fullscreenBtn = document.createElement('button');
                fullscreenBtn.type = 'button';
                fullscreenBtn.className = 'video-fullscreen-btn';
                fullscreenBtn.setAttribute('aria-label', 'Expand to fullscreen');
                fullscreenBtn.innerHTML = '⛶';
                fullscreenBtn.addEventListener('click', () => {
                    fullscreenOverlay = createFullscreenOverlay(video);
                    document.body.classList.add('video-fullscreen-open');
                });
                
                clone.appendChild(fullscreenBtn);
                
                window.setTimeout(() => {
                    video.play().catch(() => {
                        // Autoplay can be blocked; controls remain available.
                    });
                }, 20);
            }

            body.appendChild(clone);
            lastTrigger = trigger || document.activeElement;

            root.classList.add('is-open');
            root.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');
            CursorController.suspend();
            ProjectCarouselController.pauseMedia();
        };

        return {
            init() {
                root = document.getElementById('project-lightbox');
                body = document.getElementById('project-lightbox-body');
                link = document.getElementById('project-lightbox-link');
                title = document.getElementById('project-lightbox-title');
                kicker = document.getElementById('project-lightbox-kicker');

                document.querySelectorAll('[data-lightbox-close]').forEach((button) => {
                    button.addEventListener('click', close);
                });

                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        close();
                    }
                });
            },
            open,
            close,
        };
    })();

    const ProjectCarouselController = (() => {
        const runtime = {
            stage: null,
            cards: [],
            dots: [],
            currentIndex: 0,
            autoId: 0,
            isDragging: false,
            dragStartX: 0,
            dragDeltaX: 0,
            inView: false,
            dragLocked: false,
        };

        const shortestOffset = (index, current, total) => {
            let offset = index - current;
            const half = Math.floor(total / 2);
            if (offset > half) {
                offset -= total;
            }
            if (offset < -half) {
                offset += total;
            }
            return offset;
        };

        const stopAuto = () => {
            window.clearInterval(runtime.autoId);
            runtime.autoId = 0;
        };

        const startAuto = () => {
            stopAuto();
            if (!runtime.inView || state.prefersReducedMotion || state.mobileActive) {
                return;
            }
            runtime.autoId = window.setInterval(() => {
                goTo(runtime.currentIndex + 1);
            }, CONFIG.carouselIntervalMs);
        };

        const loadVideoIfNeeded = (card, shouldPlay) => {
            const video = card.querySelector('.project-preview-video');
            if (!video) {
                return;
            }

            if (!video.src && video.dataset.videoSrc && shouldPlay) {
                video.src = video.dataset.videoSrc;
            }

            if (shouldPlay && video.src) {
                video.play().catch(() => {
                    // Autoplay is optional.
                });
            } else {
                video.pause();
            }
        };

        const syncMedia = () => {
            runtime.cards.forEach((card, index) => {
                loadVideoIfNeeded(card, runtime.inView && index === runtime.currentIndex && !document.hidden);
            });
        };

        const apply = () => {
            runtime.cards.forEach((card, index) => {
                const offset = shortestOffset(index, runtime.currentIndex, runtime.cards.length);
                const abs = Math.abs(offset);
                const translateX = state.isMobileViewport ? offset * 14 : offset * 56;
                const translateY = state.isMobileViewport ? abs * 18 : abs * 12;
                const scale = state.isMobileViewport
                    ? (abs === 0 ? 1 : abs === 1 ? 0.93 : 0.86)
                    : (abs === 0 ? 1 : abs === 1 ? 0.88 : 0.76);
                const opacity = abs === 0 ? 1 : abs === 1 ? 0.72 : 0.34;
                const blur = abs === 0 ? 0 : abs === 1 ? 1.2 : 2.8;

                card.style.setProperty('--card-x', `${translateX}%`);
                card.style.setProperty('--card-y', `${translateY}px`);
                card.style.setProperty('--card-scale', `${scale}`);
                card.style.setProperty('--card-opacity', `${opacity}`);
                card.style.setProperty('--card-blur', `${blur}px`);
                card.style.zIndex = `${100 - abs}`;
                card.dataset.active = abs === 0 ? 'true' : 'false';
                card.setAttribute('aria-hidden', abs === 0 ? 'false' : 'true');
            });

            runtime.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === runtime.currentIndex);
            });

            syncMedia();
        };

        const goTo = (index) => {
            const total = runtime.cards.length;
            runtime.currentIndex = (index + total) % total;
            apply();
            startAuto();
        };

        const handleCardClick = (event) => {
            const card = event.target.closest('.project-showcase-card');
            if (!card) {
                return;
            }

            const cardIndex = runtime.cards.indexOf(card);
            if (cardIndex !== runtime.currentIndex) {
                event.preventDefault();
                goTo(cardIndex);
                return;
            }

            const expandTarget = event.target.closest('[data-project-expand]');
            if (expandTarget) {
                event.preventDefault();
                const projectId = expandTarget.getAttribute('data-project-expand');
                ProjectLightboxController.open(projectId, expandTarget);
                startAuto();
            }
        };

        return {
            init() {
                runtime.stage = document.getElementById('projects-stage');
                if (!runtime.stage) {
                    return;
                }

                runtime.cards = Array.from(runtime.stage.querySelectorAll('.project-showcase-card'));
                runtime.cards.forEach((card, index) => card.setAttribute('data-card-index', `${index}`));

                const pagination = document.getElementById('projects-pagination');
                runtime.dots = runtime.cards.map((card, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'project-page-dot';
                    button.setAttribute('aria-label', `Show ${card.getAttribute('data-project-title') || `project ${index + 1}`}`);
                    button.addEventListener('click', () => goTo(index));
                    pagination?.appendChild(button);
                    return button;
                });

                document.querySelectorAll('[data-carousel-action]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const action = button.getAttribute('data-carousel-action');
                        goTo(runtime.currentIndex + (action === 'next' ? 1 : -1));
                    });
                });

                runtime.stage.addEventListener('click', handleCardClick);
                runtime.stage.addEventListener('pointerdown', (event) => {
                    if (event.pointerType === 'mouse' && event.button !== 0) {
                        return;
                    }
                    if (event.target.closest('.project-showcase-actions')) {
                        return;
                    }
                    runtime.isDragging = true;
                    runtime.dragLocked = false;
                    runtime.dragStartX = event.clientX;
                    runtime.dragDeltaX = 0;
                    runtime.stage.classList.add('is-dragging');
                    stopAuto();
                });

                window.addEventListener('pointermove', (event) => {
                    if (!runtime.isDragging) {
                        return;
                    }
                    runtime.dragDeltaX = event.clientX - runtime.dragStartX;
                    if (Math.abs(runtime.dragDeltaX) > 6) {
                        runtime.dragLocked = true;
                        event.preventDefault();
                    }
                }, { passive: false });

                window.addEventListener('pointerup', () => {
                    if (!runtime.isDragging) {
                        return;
                    }
                    runtime.isDragging = false;
                    runtime.stage.classList.remove('is-dragging');

                    if (runtime.dragDeltaX <= -CONFIG.carouselSwipeThreshold) {
                        goTo(runtime.currentIndex + 1);
                    } else if (runtime.dragDeltaX >= CONFIG.carouselSwipeThreshold) {
                        goTo(runtime.currentIndex - 1);
                    } else {
                        startAuto();
                    }

                    runtime.dragDeltaX = 0;
                });

                const observer = new IntersectionObserver((entries) => {
                    runtime.inView = entries[0].isIntersecting;
                    if (runtime.inView) {
                        startAuto();
                    } else {
                        stopAuto();
                    }
                    syncMedia();
                }, { threshold: 0.35 });

                observer.observe(document.getElementById('projects'));

                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        stopAuto();
                    } else {
                        startAuto();
                    }
                    syncMedia();
                });

                apply();
                startAuto();
            },
            syncMedia,
            pauseMedia() {
                runtime.cards.forEach((card) => loadVideoIfNeeded(card, false));
            },
            refresh() {
                apply();
                startAuto();
            },
        };
    })();

    const ContactFormController = (() => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const setStatus = (message, type = 'neutral') => {
            const status = document.getElementById('cf-status');
            if (!status) {
                return;
            }
            status.textContent = message;
            status.className = `cf-status is-${type}`;
        };

        const queueSubmission = (payload) => {
            const existing = JSON.parse(localStorage.getItem(CONFIG.contact.queueKey) || '[]');
            existing.push(payload);
            localStorage.setItem(CONFIG.contact.queueKey, JSON.stringify(existing.slice(-12)));
        };

        const setPendingState = (form, pending) => {
            const submit = form.querySelector('.cf-submit');
            const fields = form.querySelectorAll('input, textarea, button');
            submit?.classList.toggle('is-loading', pending);
            fields.forEach((field) => {
                if (field === form.querySelector('#cf-website')) {
                    return;
                }
                field.disabled = pending;
            });
        };

        const isDuplicate = (signature) => {
            const raw = localStorage.getItem(CONFIG.contact.submissionKey);
            if (!raw) {
                return false;
            }
            try {
                const record = JSON.parse(raw);
                return record.signature === signature
                    && (Date.now() - record.timestamp) < CONFIG.contact.duplicateWindowMs;
            } catch (error) {
                return false;
            }
        };

        const recordSubmission = (signature) => {
            localStorage.setItem(CONFIG.contact.submissionKey, JSON.stringify({
                signature,
                timestamp: Date.now(),
            }));
        };

        const postToEndpoint = async (endpoint, payload) => {
            const body = new URLSearchParams(payload);
            const response = await fetch(endpoint, {
                method: 'POST',
                body,
                redirect: 'follow',
            });

            const text = await response.text();
            const redirectedToLogin = response.redirected && /accounts\.google\.com/i.test(response.url);
            const looksBroken = redirectedToLogin || /Sorry,\s+unable to open the file/i.test(text);

            if (looksBroken) {
                throw new Error('The configured Google Sheets endpoint is private or misconfigured.');
            }

            let parsed = null;
            try {
                parsed = JSON.parse(text);
            } catch (error) {
                parsed = null;
            }

            if (!response.ok) {
                throw new Error('The form endpoint returned an unexpected response.');
            }

            if (parsed && parsed.success === false) {
                throw new Error(parsed.error || 'The form endpoint rejected the submission.');
            }

            if (!parsed && !/success|ok/i.test(text)) {
                throw new Error('The form endpoint did not confirm that the submission was saved.');
            }
        };

        return {
            init() {
                const form = document.getElementById('contact-form');
                if (!form) {
                    return;
                }

                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.submit(event);
                });
            },

            async submit(event) {
                const form = event?.target?.closest('form') || document.getElementById('contact-form');
                if (!form) {
                    return;
                }

                const endpoint = form.getAttribute('data-contact-endpoint') || '';
                const name = form.querySelector('#cf-name')?.value.trim() || '';
                const company = form.querySelector('#cf-company')?.value.trim() || '';
                const email = form.querySelector('#cf-email')?.value.trim() || '';
                const message = form.querySelector('#cf-message')?.value.trim() || '';
                const honeypot = form.querySelector('#cf-website')?.value.trim() || '';

                if (honeypot) {
                    setStatus('Submission blocked.', 'error');
                    return;
                }

                if (!name || !email || !message) {
                    setStatus('Please complete the required fields before sending.', 'error');
                    return;
                }

                if (!emailPattern.test(email)) {
                    setStatus('Please enter a valid email address.', 'error');
                    return;
                }

                const signature = `${email.toLowerCase()}|${message.toLowerCase().slice(0, 120)}`;
                if (isDuplicate(signature)) {
                    setStatus('This message was already sent recently. Please wait a few minutes before retrying.', 'error');
                    return;
                }

                const payload = {
                    timestamp: new Date().toISOString(),
                    name,
                    company,
                    email,
                    message,
                    source: location.href,
                    title: document.title,
                };

                setPendingState(form, true);
                setStatus('Sending message...', 'neutral');

                try {
                    if (!endpoint) {
                        throw new Error('No contact endpoint is configured.');
                    }

                    await postToEndpoint(endpoint, payload);
                    recordSubmission(signature);
                    form.reset();
                    setStatus('Message sent successfully. I will get back to you soon.', 'success');

                    const toast = document.getElementById('cart-toast');
                    if (toast) {
                        toast.innerHTML = '<span class="toast-icon">✓</span><div><span class="toast-text">Message sent successfully.</span><div class="toast-sub">Submission saved and queued for follow-up.</div></div>';
                        toast.classList.add('show');
                        window.setTimeout(() => toast.classList.remove('show'), 3400);
                    }
                } catch (error) {
                    queueSubmission(payload);
                    setStatus('The live Sheets endpoint is unavailable right now. Your message was saved locally in this browser, but the backend still needs a public endpoint.', 'error');
                    console.error('Contact submission failed:', error);
                } finally {
                    setPendingState(form, false);
                }
            },
        };
    })();

    const animateHeroCardStars = () => {
        document.querySelectorAll('#hero-stars .star-svg').forEach((star, index) => {
            window.setTimeout(() => {
                star.classList.remove('star-empty');
                star.classList.add('star-full');
                star.style.transform = 'scale(1.25)';
                window.setTimeout(() => {
                    star.style.transform = 'scale(1)';
                }, 180);
            }, index * 130);
        });
    };

    const animateReviewCounter = () => {
        const element = document.getElementById('review-counter');
        if (!element) {
            return;
        }

        const target = 1e9;
        const duration = 1800;
        const start = performance.now();

        const formatNumber = (value) => {
            if (value >= 1e9) {
                return `${(value / 1e9).toFixed(1)}B+`;
            }
            if (value >= 1e6) {
                return `${Math.round(value / 1e6)}M+`;
            }
            return value.toLocaleString();
        };

        const tick = (now) => {
            const progress = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const value = Math.floor(target * eased);
            element.textContent = `${formatNumber(value)} Global Trust Signals`;
            if (progress < 1) {
                window.requestAnimationFrame(tick);
            }
        };

        window.requestAnimationFrame(tick);
    };

    const glideGhostCursor = (x0, y0, x1, y1, duration, cpOffsetX = 0, cpOffsetY = -80) => new Promise((resolve) => {
        const controlX = (x0 + x1) * 0.5 + cpOffsetX;
        const controlY = Math.min(y0, y1) + cpOffsetY;
        const startedAt = performance.now();

        const step = (now) => {
            const raw = clamp((now - startedAt) / duration, 0, 1);
            const eased = raw < 0.5
                ? 4 * raw * raw * raw
                : 1 - Math.pow(-2 * raw + 2, 3) / 2;
            const inverse = 1 - eased;

            state.ghostX = inverse * inverse * x0 + 2 * inverse * eased * controlX + eased * eased * x1;
            state.ghostY = inverse * inverse * y0 + 2 * inverse * eased * controlY + eased * eased * y1;
            CursorController.setGhostPosition(state.ghostX, state.ghostY);

            if (raw < 1) {
                window.requestAnimationFrame(step);
            } else {
                resolve();
            }
        };

        window.requestAnimationFrame(step);
    });

    const clickGhost = async () => {
        CursorController.pulse();
        await delay(190);
    };

    const runTyping = () => {
        const input = document.getElementById('cs-input');
        const suggestions = document.getElementById('suggestions');
        if (!input || !suggestions) {
            return;
        }

        let index = 0;

        const typeCharacter = () => {
            if (index <= CONFIG.searchText.length) {
                input.value = CONFIG.searchText.slice(0, index);
                index += 1;
                if (index === 8) {
                    suggestions.classList.add('visible');
                }
                window.setTimeout(typeCharacter, 70 + Math.random() * 36);
            } else {
                window.setTimeout(triggerSearch, 650);
            }
        };

        typeCharacter();
    };

    const cursorToSearchBar = async () => {
        const searchWrap = document.getElementById('cs-wrap');
        const input = document.getElementById('cs-input');
        if (!searchWrap || !input) {
            runTyping();
            return;
        }

        const rect = searchWrap.getBoundingClientRect();
        const startX = window.innerWidth * 0.15;
        const startY = window.innerHeight * 0.18;
        const targetX = rect.left + rect.width * 0.42;
        const targetY = rect.top + rect.height * 0.5;

        CursorController.setGhostMode(true);
        CursorController.setGhostPosition(startX, startY);

        await delay(380);
        await glideGhostCursor(startX, startY, targetX, targetY, 1100, 40, -60);
        CursorController.setForcedHover(true);
        await delay(600);
        await clickGhost();
        CursorController.setForcedHover(false);
        input.classList.add('focused');
        await delay(320);
        runTyping();
    };

    const triggerSearch = async () => {
        const input = document.getElementById('cs-input');
        const suggestions = document.getElementById('suggestions');
        const searchWrap = document.getElementById('cs-wrap');
        if (!input || !suggestions || !searchWrap) {
            showResults();
            return;
        }

        const rect = searchWrap.getBoundingClientRect();
        const buttonX = rect.right - 28;
        const buttonY = rect.top + rect.height * 0.5;

        await glideGhostCursor(state.ghostX, state.ghostY, buttonX, buttonY, 440, 0, 0);
        CursorController.setForcedHover(true);
        await delay(260);
        await clickGhost();
        CursorController.setForcedHover(false);

        input.style.background = 'rgba(61,139,255,0.12)';
        suggestions.classList.remove('visible');
        window.setTimeout(() => {
            input.style.background = '';
        }, 140);

        const intro = document.getElementById('intro-overlay');
        const skeleton = document.getElementById('skeleton-screen');
        if (intro) {
            intro.style.opacity = '0';
            intro.style.transition = 'opacity 0.48s cubic-bezier(0.23,1,0.32,1)';
            window.setTimeout(() => {
                intro.style.display = 'none';
            }, 500);
        }

        if (skeleton) {
            skeleton.style.display = 'flex';
            skeleton.style.opacity = '0';
            skeleton.style.transition = 'opacity 0.35s';
            window.requestAnimationFrame(() => {
                skeleton.style.opacity = '1';
            });
        }

        window.setTimeout(showResults, 1750);
    };

    const autoCursorToCard = async () => {
        const card = document.getElementById('akshay-card');
        if (!card) {
            return;
        }

        const rect = card.getBoundingClientRect();
        const targetX = rect.left + rect.width * 0.5;
        const targetY = rect.top + rect.height * 0.8;
        const controlOffsetX = (targetX - state.ghostX) * -0.15;

        await glideGhostCursor(state.ghostX, state.ghostY, targetX, targetY, 1320, controlOffsetX, -110);
        CursorController.setForcedHover(true);
        card.classList.add('auto-hover');
        await delay(880);
        await clickGhost();
        CursorController.setForcedHover(false);
        card.classList.remove('auto-hover');
        CursorController.setGhostMode(false);
        clickAkshayCard(null);
    };

    const showResults = () => {
        const skeleton = document.getElementById('skeleton-screen');
        const results = document.getElementById('results-page');

        if (skeleton) {
            skeleton.style.opacity = '0';
            window.setTimeout(() => {
                skeleton.style.display = 'none';
            }, 320);
        }

        if (results) {
            results.style.display = 'flex';
            results.style.opacity = '0';
            results.style.transition = 'opacity 0.5s cubic-bezier(0.23,1,0.32,1)';
            window.requestAnimationFrame(() => {
                results.style.opacity = '1';
            });
        }

        window.setTimeout(animateHeroCardStars, 500);
        window.setTimeout(animateReviewCounter, 850);
        window.setTimeout(autoCursorToCard, 2200);
        document.getElementById('skip-btn')?.style.setProperty('display', 'none');
    };

    const initProgressBar = () => {
        const bar = document.getElementById('intro-progress');
        if (!bar) {
            return;
        }

        bar.style.opacity = '1';
        bar.style.width = '0%';

        const setProgress = (value, duration = 400) => {
            bar.style.transition = `width ${duration}ms var(--ease-out)`;
            bar.style.width = `${value}%`;
        };

        window.setTimeout(() => setProgress(15, 800), 800);
        window.setTimeout(() => setProgress(38, 600), 2400);
        window.setTimeout(() => setProgress(62, 500), 4500);
        window.setTimeout(() => setProgress(80, 400), 6200);
        window.setTimeout(() => setProgress(92, 600), 7800);
        window.setTimeout(() => {
            setProgress(100, 300);
            window.setTimeout(() => {
                bar.style.opacity = '0';
            }, 500);
        }, 9000);
    };

    const startIntro = () => {
        document.getElementById('skip-btn')?.style.setProperty('display', 'flex');
        setTheme(state.theme, false);

        if (sessionStorage.getItem('intro-played')) {
            skipIntro();
            return;
        }

        initProgressBar();
        window.setTimeout(cursorToSearchBar, 1200);
    };

    const initPortfolioRuntime = () => {
        if (state.runtimeInitialized) {
            return;
        }

        state.runtimeInitialized = true;
        RevealController.init();
        SectionChromeController.init();
        CounterController.init();
        ProgressRingController.init();
        RatingBarController.init();
        ScrollAnimationController.init();
        InteractiveSurfaceController.init();
        ExperienceTimelineController.init();
        ProjectLightboxController.init();
        ProjectCarouselController.init();
        ContactFormController.init();
    };

    const revealPortfolio = () => {
        const portfolio = document.getElementById('portfolio');
        const panel = document.getElementById('control-panel');

        if (portfolio) {
            portfolio.style.display = 'block';
            portfolio.style.opacity = '0';
            portfolio.style.transition = 'opacity 0.9s cubic-bezier(0.23,1,0.32,1) 0.08s';

            window.requestAnimationFrame(() => {
                portfolio.style.opacity = '1';
            });
        }

        ThreeController.start();
        initPortfolioRuntime();

        CursorController.setGhostMode(false);
        CursorController.resume();

        window.setTimeout(() => {
            panel?.classList.add('visible');
        }, 1100);

        window.setTimeout(() => document.getElementById('h-eyebrow')?.classList.add('revealed'), 320);
        window.setTimeout(() => document.getElementById('h-name')?.classList.add('revealed'), 480);
        window.setTimeout(() => document.getElementById('h-subtitle')?.classList.add('revealed'), 660);
        window.setTimeout(() => document.getElementById('h-roles')?.classList.add('revealed'), 820);
        window.setTimeout(() => document.getElementById('h-ctas')?.classList.add('revealed'), 980);
    };

    const clickAkshayCard = () => {
        const card = document.getElementById('akshay-card');
        const layer = document.getElementById('transition-layer');
        const results = document.getElementById('results-page');

        if (!card || !layer || !results) {
            revealPortfolio();
            sessionStorage.setItem('intro-played', '1');
            state.introPlayed = true;
            return;
        }

        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        const maxRadius = Math.hypot(
            Math.max(centerX, window.innerWidth - centerX),
            Math.max(centerY, window.innerHeight - centerY),
        ) * 2;

        const circle = document.createElement('div');
        circle.className = 'expand-circle';
        circle.style.width = `${maxRadius * 2}px`;
        circle.style.height = `${maxRadius * 2}px`;
        circle.style.left = `${centerX - maxRadius}px`;
        circle.style.top = `${centerY - maxRadius}px`;
        layer.appendChild(circle);

        results.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
        results.style.filter = 'blur(3px)';
        results.style.opacity = '0.72';

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                circle.style.transform = 'scale(1)';
            });
        });

        window.setTimeout(() => {
            results.style.display = 'none';
            revealPortfolio();
            window.setTimeout(() => {
                circle.style.opacity = '0';
                window.setTimeout(() => {
                    circle.remove();
                    layer.innerHTML = '';
                }, 420);
            }, 560);
        }, 920);

        sessionStorage.setItem('intro-played', '1');
        state.introPlayed = true;
    };

    const addToCart = () => {
        state.cartCount += 1;
        ['cart-badge', 'nav-cart-num'].forEach((id) => {
            const target = document.getElementById(id);
            if (target) {
                target.textContent = `${state.cartCount}`;
            }
        });

        const pill = document.getElementById('nav-cart-pill');
        pill?.classList.add('visible');

        const toast = document.getElementById('cart-toast');
        if (toast) {
            toast.innerHTML = '<span class="toast-icon">🛒</span><div><span class="toast-text"><span>Akshay Singh Chauhan</span> added to your project.</span><div class="toast-sub">Checkout opens contact form below.</div></div>';
            toast.classList.add('show');
            window.setTimeout(() => toast.classList.remove('show'), 3400);
        }

        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const activateMobileView = () => {
        if (state.isMobileViewport || state.mobileActive) {
            return;
        }

        const wrap = document.getElementById('device-wrap');
        const screen = document.getElementById('device-screen');
        const source = document.getElementById('portfolio');
        if (!wrap || !screen || !source) {
            return;
        }

        screen.innerHTML = '';
        const clone = source.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
        clone.querySelectorAll('[onclick]').forEach((element) => element.removeAttribute('onclick'));
        clone.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((element) => element.classList.add('visible'));
        clone.querySelectorAll('video').forEach((video) => {
            video.removeAttribute('autoplay');
            video.pause?.();
        });

        // Apply mobile-specific viewport detection class to trigger media queries
        clone.classList.add('mobile-preview-viewport');
        
        // Scale content for 393px viewport
        clone.style.transform = 'scale(1)';
        clone.style.transformOrigin = 'top left';
        clone.style.width = '393px';
        
        screen.appendChild(clone);
        wrap.style.display = 'flex';
        
        // Reset scroll position to top
        screen.scrollTop = 0;
        
        window.requestAnimationFrame(() => {
            wrap.classList.add('visible');
        });

        state.mobileActive = true;
        CursorController.suspend();
        ThreeController.stop();
        updateViewToggleButtons();
        
        // Enhance mobile scroll experience with smooth scrolling
        screen.style.scrollBehavior = 'smooth';
    };

    const deactivateMobileView = () => {
        const wrap = document.getElementById('device-wrap');
        const screen = document.getElementById('device-screen');
        if (!wrap || !screen) {
            return;
        }

        wrap.classList.remove('visible');
        window.setTimeout(() => {
            wrap.style.display = 'none';
            screen.innerHTML = '';
        }, 420);

        state.mobileActive = false;
        CursorController.resume();
        if (state.introPlayed) {
            ThreeController.start();
        }
        updateViewToggleButtons();
    };

    const replayIntro = () => {
        sessionStorage.removeItem('intro-played');
        state.introPlayed = false;

        document.getElementById('portfolio')?.style.setProperty('display', 'none');
        document.getElementById('results-page')?.style.setProperty('display', 'none');
        document.getElementById('skeleton-screen')?.style.setProperty('display', 'none');
        document.getElementById('intro-overlay')?.style.setProperty('display', 'flex');
        document.getElementById('intro-overlay')?.style.setProperty('opacity', '1');
        document.getElementById('skip-btn')?.style.setProperty('display', 'flex');
        document.getElementById('control-panel')?.classList.remove('visible');
        document.getElementById('three-canvas')?.classList.remove('visible');
        document.getElementById('suggestions')?.classList.remove('visible');

        const input = document.getElementById('cs-input');
        if (input) {
            input.value = '';
            input.classList.remove('focused');
        }

        CursorController.setGhostMode(false);
        CursorController.resume();
        startIntro();
    };

    const updateViewToggleButtons = () => {
        const mobileButton = document.getElementById('mobile-toggle-btn');
        const desktopButton = document.getElementById('desktop-toggle-btn');
        if (!mobileButton || !desktopButton) {
            return;
        }
        mobileButton.style.display = state.mobileActive ? 'none' : 'inline-flex';
        desktopButton.style.display = state.mobileActive ? 'inline-flex' : 'none';
    };

    const skipIntro = () => {
        document.getElementById('intro-overlay')?.style.setProperty('display', 'none');
        document.getElementById('skeleton-screen')?.style.setProperty('display', 'none');
        document.getElementById('results-page')?.style.setProperty('display', 'none');
        document.getElementById('skip-btn')?.style.setProperty('display', 'none');

        state.introPlayed = true;
        sessionStorage.setItem('intro-played', '1');
        revealPortfolio();
    };

    const toggleTheme = () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme, true);
    };

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleResize = () => {
        const wasMobile = state.isMobileViewport;
        updateViewportCapabilities();

        if (state.mobileActive && state.isMobileViewport) {
            deactivateMobileView();
        }

        CursorController.refreshCapability();
        ThreeController.refresh();

        if (state.runtimeInitialized && wasMobile !== state.isMobileViewport) {
            ProjectCarouselController.refresh();
        }
    };

    const init = () => {
        updateViewportCapabilities();
        document.documentElement.setAttribute('data-js', 'loading');
        setTheme(state.theme, false);

        try {
            CursorController.init();
        } catch (error) {
            console.warn('Custom cursor disabled after initialization failure:', error);
            CursorController.disable();
        }

        updateViewToggleButtons();
        startIntro();

        window.addEventListener('resize', () => {
            window.requestAnimationFrame(handleResize);
        }, { passive: true });

        document.documentElement.setAttribute('data-js', 'ready');
    };

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
        submitForm: (event) => ContactFormController.submit(event),
    };
})();

document.addEventListener('DOMContentLoaded', App.init);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement?.id === 'akshay-card') {
        App.clickAkshayCard(event);
    }
});
