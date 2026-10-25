/* ═══════════════════════════════════════════════════════════
   BACKGROUND SECTION - THREE.JS 3D PARTICLE & GEOMETRIC COSMOS
   Continuous scroll-reactive 3D space across all sections with
   multi-dimensional floating geometric structures, constellation
   network, ambient energy embers, and particle repulsion.
   ═══════════════════════════════════════════════════════════ */
window.BackgroundSystem = (() => {
    let renderer, scene, camera;
    let particles, emberParticles, constellationLines;
    let geoGroup;
    let floatingMeshes = [];
    let mouseX = 0, mouseY = 0;
    let targetCameraY = 0;
    let currentCameraY = 0;
    let animId = null;
    let clock;
    let isRunning = false;
    let isReducedMotion = false;

    // Materials reference for theme switching
    let materials = {
        wireBlue: null,
        wireCyan: null,
        wireGold: null,
        wireEmerald: null,
        coreGlow: null,
        particles: null,
        embers: null,
        lines: null
    };

    /**
     * Build Theme Materials
     */
    const createMaterials = (theme = 'dark') => {
        const isLight = theme === 'light';

        materials.wireBlue = new THREE.MeshBasicMaterial({
            color: isLight ? 0x2563eb : 0x3d8bff,
            wireframe: true,
            transparent: true,
            opacity: isLight ? 0.08 : 0.14
        });

        materials.wireCyan = new THREE.MeshBasicMaterial({
            color: isLight ? 0x0284c7 : 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: isLight ? 0.07 : 0.12
        });

        materials.wireGold = new THREE.MeshBasicMaterial({
            color: isLight ? 0xb45309 : 0xc8a84b,
            wireframe: true,
            transparent: true,
            opacity: isLight ? 0.06 : 0.11
        });

        materials.wireEmerald = new THREE.MeshBasicMaterial({
            color: isLight ? 0x059669 : 0x34d399,
            wireframe: true,
            transparent: true,
            opacity: isLight ? 0.06 : 0.10
        });

        materials.coreGlow = new THREE.MeshBasicMaterial({
            color: isLight ? 0x3b82f6 : 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: isLight ? 0.12 : 0.28
        });

        materials.lines = new THREE.LineBasicMaterial({
            color: isLight ? 0x3b82f6 : 0x3d8bff,
            transparent: true,
            opacity: isLight ? 0.04 : 0.08,
            blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending
        });

        materials.particles = new THREE.PointsMaterial({
            size: isLight ? 0.11 : 0.14,
            vertexColors: true,
            transparent: true,
            opacity: isLight ? 0.40 : 0.75,
            sizeAttenuation: true,
            depthWrite: false,
            blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending
        });

        materials.embers = new THREE.PointsMaterial({
            size: isLight ? 0.18 : 0.24,
            vertexColors: true,
            transparent: true,
            opacity: isLight ? 0.35 : 0.70,
            sizeAttenuation: true,
            depthWrite: false,
            blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending
        });
    };

    /**
     * Build Main Particle Cosmos (spanning full vertical scroll journey)
     */
    const createCosmicParticles = () => {
        const count = window.innerWidth < 768 ? 900 : 2100;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const palette = [
            new THREE.Color('#3d8bff'), // Electric Blue
            new THREE.Color('#00d4ff'), // Cyan
            new THREE.Color('#c8a84b'), // Gold
            new THREE.Color('#34d399')  // Emerald
        ];

        // Distribute in a tall vertical cylinder covering all sections (Y: +25 to -135)
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const y = (Math.random() * 160) - 135; // from +25 down to -135
            const radius = 6 + Math.random() * 38;
            const angle = Math.random() * Math.PI * 2;
            const zSpread = (Math.random() - 0.5) * 36;

            positions[i3] = radius * Math.cos(angle);
            positions[i3 + 1] = y;
            positions[i3 + 2] = (radius * Math.sin(angle) * 0.45) + zSpread - 8;

            const c = palette[i % palette.length].clone().lerp(
                palette[(i + 1) % palette.length],
                Math.random() * 0.4
            );

            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;

            sizes[i] = Math.random() * 1.6 + 0.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        particles = new THREE.Points(geo, materials.particles);
        scene.add(particles);
    };

    /**
     * Build Upward-Drifting Ambient Embers
     */
    const createAmbientEmbers = () => {
        const count = window.innerWidth < 768 ? 80 : 200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = [];

        const emberColors = [
            new THREE.Color('#00d4ff'),
            new THREE.Color('#3d8bff'),
            new THREE.Color('#c8a84b')
        ];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 60;
            positions[i3 + 1] = (Math.random() * 160) - 135;
            positions[i3 + 2] = (Math.random() - 0.5) * 24 - 6;

            const c = emberColors[i % emberColors.length];
            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;

            velocities.push({
                speedY: 0.04 + Math.random() * 0.07,
                swaySpeed: 0.8 + Math.random() * 1.2,
                swayAmp: 0.03 + Math.random() * 0.05,
                phase: Math.random() * Math.PI * 2
            });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        emberParticles = new THREE.Points(geo, materials.embers);
        emberParticles.userData.velocities = velocities;
        scene.add(emberParticles);
    };

    /**
     * Build Constellation Network (3D Graph connecting nearby nodes)
     */
    const createConstellationNetwork = () => {
        const nodeCount = 42;
        const nodePositions = [];
        const linePositions = [];

        // Distribute nodes along the vertical column
        for (let i = 0; i < nodeCount; i++) {
            const y = 15 - (i * 3.4) + (Math.random() * 2 - 1);
            const x = (Math.random() - 0.5) * 36;
            const z = (Math.random() - 0.5) * 20 - 8;
            nodePositions.push(new THREE.Vector3(x, y, z));
        }

        // Connect nodes within a distance threshold
        const maxDist = 14;
        for (let i = 0; i < nodePositions.length; i++) {
            for (let j = i + 1; j < nodePositions.length; j++) {
                const dist = nodePositions[i].distanceTo(nodePositions[j]);
                if (dist < maxDist) {
                    linePositions.push(
                        nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
                        nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
                    );
                }
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        const lines = new THREE.LineSegments(geo, materials.lines);
        lines.userData.nodes = nodePositions;
        scene.add(lines);
        constellationLines = lines;
    };

    /**
     * Build Rich Floating Geometries Spanning All Sections
     */
    const createFloatingGeometries = () => {
        geoGroup = new THREE.Group();
        scene.add(geoGroup);
        floatingMeshes = [];

        const getMat = (key) => {
            switch (key) {
                case 'cyan': return materials.wireCyan;
                case 'gold': return materials.wireGold;
                case 'emerald': return materials.wireEmerald;
                default: return materials.wireBlue;
            }
        };

        // Complete constellation of diverse geometries across the vertical scroll span
        const shapeConfigs = [
            // ── Section 0: Hero (Y: +14 to 0) ──
            {
                type: 'icosahedron', args: [3.4, 1], mat: 'blue',
                x: -14, y: 7, z: -8,
                rot: [0.07, 0.11, 0.04], float: [0.6, 0.8, 0.0]
            },
            {
                type: 'torusOrbit', args: [3.8, 0.07, 16, 64], mat: 'gold',
                x: 15, y: 4, z: -10,
                rot: [0.09, 0.06, 0.08], float: [0.5, 0.7, 1.2],
                nested: [2.6, 0.07, 16, 48, 'cyan']
            },
            {
                type: 'octahedron', args: [2.4, 0], mat: 'cyan',
                x: 12, y: -2, z: -6,
                rot: [0.08, 0.13, 0.03], float: [0.7, 0.9, 2.1]
            },

            // ── Section 1: The Architect / About (Y: -8 to -24) ──
            {
                type: 'boxInBox', args: [2.8, 2.8, 2.8], mat: 'blue',
                x: -15, y: -13, z: -9,
                rot: [0.06, 0.08, 0.07], float: [0.5, 0.7, 3.0],
                inner: [1.6, 1.6, 1.6, 'gold']
            },
            {
                type: 'tetrahedron', args: [2.4, 0], mat: 'gold',
                x: 14, y: -17, z: -8,
                rot: [0.09, 0.10, 0.05], float: [0.8, 0.7, 0.8]
            },
            {
                type: 'dodecahedron', args: [2.6, 0], mat: 'emerald',
                x: -12, y: -23, z: -7,
                rot: [0.05, 0.08, 0.06], float: [0.6, 0.8, 1.7]
            },

            // ── Section 2: Technical Arsenal / Skills (Y: -28 to -46) ──
            {
                type: 'torusKnot', args: [2.7, 0.58, 64, 14, 2, 3], mat: 'blue',
                x: 16, y: -31, z: -9,
                rot: [0.08, 0.12, 0.06], float: [0.7, 0.9, 2.5]
            },
            {
                type: 'octahedron', args: [2.8, 0], mat: 'gold',
                x: -16, y: -35, z: -8,
                rot: [0.10, 0.08, 0.05], float: [0.5, 0.7, 0.5]
            },
            {
                type: 'torusOrbit', args: [3.4, 0.06, 16, 48], mat: 'cyan',
                x: -13, y: -43, z: -11,
                rot: [0.07, 0.12, 0.08], float: [0.6, 0.8, 3.2]
            },
            {
                type: 'tetrahedron', args: [2.2, 0], mat: 'blue',
                x: 14, y: -45, z: -7,
                rot: [0.09, 0.07, 0.11], float: [0.8, 0.6, 1.4]
            },

            // ── Section 3: Project Portfolio (Y: -50 to -70) ──
            {
                type: 'boxInBox', args: [3.2, 3.2, 3.2], mat: 'cyan',
                x: -16, y: -53, z: -9,
                rot: [0.07, 0.10, 0.05], float: [0.6, 0.8, 0.9],
                inner: [2.0, 2.0, 2.0, 'blue']
            },
            {
                type: 'torusKnot', args: [2.2, 0.45, 54, 10, 3, 4], mat: 'gold',
                x: 16, y: -59, z: -8,
                rot: [0.09, 0.08, 0.12], float: [0.7, 1.0, 2.8]
            },
            {
                type: 'icosahedron', args: [3.0, 0], mat: 'blue',
                x: 13, y: -67, z: -10,
                rot: [0.06, 0.11, 0.07], float: [0.5, 0.7, 1.1]
            },
            {
                type: 'dodecahedron', args: [2.4, 0], mat: 'emerald',
                x: -14, y: -69, z: -7,
                rot: [0.08, 0.09, 0.06], float: [0.8, 0.8, 3.5]
            },

            // ── Section 4: Experience Journey (Y: -74 to -90) ──
            {
                type: 'torusOrbit', args: [4.0, 0.07, 16, 64], mat: 'blue',
                x: 15, y: -77, z: -9,
                rot: [0.08, 0.10, 0.07], float: [0.6, 0.8, 1.5],
                nested: [2.6, 0.07, 16, 48, 'gold']
            },
            {
                type: 'octahedron', args: [2.8, 0], mat: 'cyan',
                x: -15, y: -81, z: -8,
                rot: [0.10, 0.07, 0.09], float: [0.7, 0.9, 0.3]
            },
            {
                type: 'tetrahedron', args: [2.4, 0], mat: 'gold',
                x: 12, y: -87, z: -11,
                rot: [0.07, 0.12, 0.05], float: [0.5, 0.7, 2.0]
            },

            // ── Section 5: Client Reviews (Y: -92 to -106) ──
            {
                type: 'icosahedron', args: [3.2, 1], mat: 'emerald',
                x: -15, y: -95, z: -8,
                rot: [0.07, 0.09, 0.06], float: [0.6, 0.8, 1.8]
            },
            {
                type: 'torusKnot', args: [2.4, 0.5, 60, 12, 2, 3], mat: 'blue',
                x: 16, y: -99, z: -10,
                rot: [0.08, 0.11, 0.07], float: [0.7, 0.9, 2.9]
            },
            {
                type: 'octahedron', args: [2.6, 0], mat: 'gold',
                x: -12, y: -105, z: -7,
                rot: [0.09, 0.08, 0.10], float: [0.5, 0.7, 0.7]
            },

            // ── Section 6: Contact & Footer (Y: -109 to -124) ──
            {
                type: 'torusOrbit', args: [3.6, 0.08, 16, 48], mat: 'cyan',
                x: 14, y: -111, z: -9,
                rot: [0.09, 0.07, 0.08], float: [0.6, 0.8, 2.2],
                nested: [2.2, 0.08, 16, 32, 'blue']
            },
            {
                type: 'dodecahedron', args: [2.6, 0], mat: 'gold',
                x: -14, y: -115, z: -8,
                rot: [0.06, 0.10, 0.05], float: [0.7, 0.8, 1.3]
            },
            {
                type: 'boxInBox', args: [2.6, 2.6, 2.6], mat: 'emerald',
                x: 13, y: -121, z: -10,
                rot: [0.08, 0.09, 0.07], float: [0.5, 0.7, 3.1],
                inner: [1.5, 1.5, 1.5, 'cyan']
            }
        ];

        shapeConfigs.forEach((cfg, idx) => {
            let mesh;
            const primaryMat = getMat(cfg.mat);

            if (cfg.type === 'torusKnot') {
                const geo = new THREE.TorusKnotGeometry(...cfg.args);
                mesh = new THREE.Mesh(geo, primaryMat);
            } else if (cfg.type === 'icosahedron') {
                const geo = new THREE.IcosahedronGeometry(...cfg.args);
                mesh = new THREE.Mesh(geo, primaryMat);
            } else if (cfg.type === 'octahedron') {
                const geo = new THREE.OctahedronGeometry(...cfg.args);
                mesh = new THREE.Mesh(geo, primaryMat);
            } else if (cfg.type === 'dodecahedron') {
                const geo = new THREE.DodecahedronGeometry(...cfg.args);
                mesh = new THREE.Mesh(geo, primaryMat);
            } else if (cfg.type === 'tetrahedron') {
                const geo = new THREE.TetrahedronGeometry(...cfg.args);
                mesh = new THREE.Mesh(geo, primaryMat);
            } else if (cfg.type === 'torusOrbit') {
                mesh = new THREE.Group();
                const outer = new THREE.Mesh(new THREE.TorusGeometry(...cfg.args), primaryMat);
                mesh.add(outer);
                if (cfg.nested) {
                    const nestedMat = getMat(cfg.nested[4]);
                    const inner = new THREE.Mesh(
                        new THREE.TorusGeometry(cfg.nested[0], cfg.nested[1], cfg.nested[2], cfg.nested[3]),
                        nestedMat
                    );
                    inner.rotation.x = Math.PI * 0.35;
                    inner.rotation.y = Math.PI * 0.25;
                    mesh.add(inner);
                    mesh.userData.inner = inner;
                }
            } else if (cfg.type === 'boxInBox') {
                mesh = new THREE.Group();
                const outer = new THREE.Mesh(new THREE.BoxGeometry(...cfg.args), primaryMat);
                mesh.add(outer);
                if (cfg.inner) {
                    const innerMat = getMat(cfg.inner[3]);
                    const inner = new THREE.Mesh(
                        new THREE.BoxGeometry(cfg.inner[0], cfg.inner[1], cfg.inner[2]),
                        innerMat
                    );
                    mesh.add(inner);
                    mesh.userData.inner = inner;
                }
            } else {
                mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 0), primaryMat);
            }

            mesh.position.set(cfg.x, cfg.y, cfg.z);
            mesh.userData.baseX = cfg.x;
            mesh.userData.baseY = cfg.y;
            mesh.userData.baseZ = cfg.z;
            mesh.userData.rotX = cfg.rot[0];
            mesh.userData.rotY = cfg.rot[1];
            mesh.userData.rotZ = cfg.rot[2];
            mesh.userData.floatSpeed = cfg.float[0];
            mesh.userData.floatAmp = cfg.float[1];
            mesh.userData.phase = cfg.float[2] || (idx * 0.7);

            geoGroup.add(mesh);
            floatingMeshes.push(mesh);
        });
    };

    /**
     * Mouse Movement & Parallax Tracking
     */
    const setupInteractions = () => {
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        // Scroll Tracking: smoothly syncs 3D camera with page scroll
        const updateScroll = () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            const docHeight = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                1
            );
            const progress = Math.min(Math.max(scrollY / docHeight, 0), 1);
            // Translate camera down through the 3D scene from 0 to -115
            targetCameraY = -progress * 115;
        };

        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();

        // Responsive resize
        window.addEventListener('resize', onResize, { passive: true });

        // Visibility handling (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pause();
            } else {
                resume();
            }
        });
    };

    /**
     * Particle Repulsion Effect on Mouse Hover
     */
    const initParticleRepulsion = (pts) => {
        if (!pts) return;
        const geo = pts.geometry;
        const pos = geo.attributes.position;
        const orig = new Float32Array(pos.array);
        let mx = 9999, my = 9999;

        document.addEventListener('mousemove', e => {
            mx = (e.clientX / window.innerWidth) * 2 - 1;
            my = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        const repulse = () => {
            if (!isRunning) return;

            // Map mouse to current camera Y frame
            const wMx = mx * 30;
            const wMy = currentCameraY + (my * 20);
            const radius = 14, strength = 3.2;

            for (let i = 0; i < pos.count; i++) {
                const i3 = i * 3;
                const ox = orig[i3], oy = orig[i3 + 1];
                const dx = pos.array[i3] - wMx;
                const dy = pos.array[i3 + 1] - wMy;
                const distSq = dx * dx + dy * dy;

                if (distSq < radius * radius && distSq > 0.1) {
                    const dist = Math.sqrt(distSq);
                    const force = (radius - dist) / radius;
                    pos.array[i3] += dx * force * strength * 0.02;
                    pos.array[i3 + 1] += dy * force * strength * 0.02;
                }

                // Elastic return to base
                pos.array[i3] += (ox - pos.array[i3]) * 0.045;
                pos.array[i3 + 1] += (oy - pos.array[i3 + 1]) * 0.045;
            }

            pos.needsUpdate = true;
            requestAnimationFrame(repulse);
        };

        requestAnimationFrame(repulse);
    };

    /**
     * Window Resize Handler
     */
    const onResize = () => {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    /**
     * Main Render Loop
     */
    const animate = () => {
        if (!isRunning) return;
        animId = requestAnimationFrame(animate);

        const elapsed = clock ? clock.getElapsedTime() : 0;

        // Smooth Camera Drift: Lerp Y towards scroll target, X towards mouse parallax
        currentCameraY += (targetCameraY - currentCameraY) * 0.055;
        camera.position.y = currentCameraY + (-mouseY * 1.6);
        camera.position.x += (mouseX * 3.2 - camera.position.x) * 0.035;
        camera.lookAt(camera.position.x * 0.25, currentCameraY, 0);

        // Animate Cosmic Particle Field
        if (particles) {
            particles.rotation.y = elapsed * 0.018;
        }

        // Animate Ambient Rising Embers
        if (emberParticles && emberParticles.userData.velocities) {
            const pos = emberParticles.geometry.attributes.position;
            const vel = emberParticles.userData.velocities;
            for (let i = 0; i < pos.count; i++) {
                const i3 = i * 3;
                const v = vel[i];
                // Float upwards
                pos.array[i3 + 1] += v.speedY;
                // Gentle horizontal wave sway
                pos.array[i3] += Math.sin(elapsed * v.swaySpeed + v.phase) * v.swayAmp;

                // Cycle top boundary back to bottom
                if (pos.array[i3 + 1] > 26) {
                    pos.array[i3 + 1] = -135;
                }
            }
            pos.needsUpdate = true;
        }

        // Animate Constellation Lines & Nodes
        if (constellationLines) {
            constellationLines.rotation.y = elapsed * 0.008;
        }

        // Animate All Floating Geometric Meshes
        if (floatingMeshes.length) {
            floatingMeshes.forEach(m => {
                // Multi-axis spin
                m.rotation.x = elapsed * m.userData.rotX;
                m.rotation.y = elapsed * m.userData.rotY;
                m.rotation.z = elapsed * m.userData.rotZ;

                // Organic vertical levitation breathing
                const floatOffset = Math.sin(elapsed * m.userData.floatSpeed + m.userData.phase) * m.userData.floatAmp;
                m.position.y = m.userData.baseY + floatOffset;

                // Gentle horizontal swaying
                const swayOffset = Math.cos(elapsed * 0.4 + m.userData.phase) * 0.45;
                m.position.x = m.userData.baseX + swayOffset;

                // Counter-rotate nested shapes
                if (m.userData.inner) {
                    m.userData.inner.rotation.x = elapsed * -0.15;
                    m.userData.inner.rotation.y = elapsed * 0.18;
                }
            });
        }

        renderer.render(scene, camera);
    };

    /**
     * Initialize Background System
     */
    const init = () => {
        const canvas = document.getElementById('three-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        // Check reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            isReducedMotion = true;
        }

        const theme = window.AppState?.theme || 'dark';
        createMaterials(theme);

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: window.innerWidth > 768,
            powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Scene and Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(0, 0, 30);

        // Build all visual layers
        createCosmicParticles();
        createAmbientEmbers();
        createConstellationNetwork();
        createFloatingGeometries();

        // Setup interactions
        setupInteractions();
        initParticleRepulsion(particles);

        clock = new THREE.Clock();
        isRunning = true;
        animate();

        // Save reference to AppState
        if (window.AppState) {
            window.AppState.threeScene = { renderer, scene, camera, particles, floatingMeshes };
        }

        console.log('✓ Enhanced Three.js background cosmos initialized across all sections');
    };

    /**
     * Update Theme Styling Dynamically
     */
    const applyTheme = (theme) => {
        const isLight = theme === 'light';

        if (materials.wireBlue) {
            materials.wireBlue.color.setHex(isLight ? 0x2563eb : 0x3d8bff);
            materials.wireBlue.opacity = isLight ? 0.08 : 0.14;
        }
        if (materials.wireCyan) {
            materials.wireCyan.color.setHex(isLight ? 0x0284c7 : 0x00d4ff);
            materials.wireCyan.opacity = isLight ? 0.07 : 0.12;
        }
        if (materials.wireGold) {
            materials.wireGold.color.setHex(isLight ? 0xb45309 : 0xc8a84b);
            materials.wireGold.opacity = isLight ? 0.06 : 0.11;
        }
        if (materials.wireEmerald) {
            materials.wireEmerald.color.setHex(isLight ? 0x059669 : 0x34d399);
            materials.wireEmerald.opacity = isLight ? 0.06 : 0.10;
        }
        if (materials.particles) {
            materials.particles.opacity = isLight ? 0.40 : 0.75;
            materials.particles.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        }
        if (materials.embers) {
            materials.embers.opacity = isLight ? 0.35 : 0.70;
            materials.embers.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        }
        if (materials.lines) {
            materials.lines.color.setHex(isLight ? 0x3b82f6 : 0x3d8bff);
            materials.lines.opacity = isLight ? 0.04 : 0.08;
            materials.lines.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        }
    };

    /**
     * Show Background Canvas
     */
    const show = () => {
        const canvas = document.getElementById('three-canvas');
        if (canvas) canvas.classList.add('visible');
    };

    /**
     * Pause Loop
     */
    const pause = () => {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
    };

    /**
     * Resume Loop
     */
    const resume = () => {
        if (!isRunning) {
            isRunning = true;
            if (clock) clock.start();
            animate();
        }
    };

    /**
     * Cleanup
     */
    const destroy = () => {
        pause();
        window.removeEventListener('resize', onResize);
        if (renderer) renderer.dispose();
    };

    return {
        init,
        show,
        pause,
        resume,
        applyTheme,
        destroy
    };
})();
