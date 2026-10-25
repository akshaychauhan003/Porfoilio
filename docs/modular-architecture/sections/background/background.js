/* ╔══════════════════════════════════════════════════════════════╗
   ║  BACKGROUND SECTION - Three.js Particles System            ║
   ╚══════════════════════════════════════════════════════════════╝ */

const BackgroundSystem = (() => {
    let scene, renderer, camera, particles, meshes;
    let raf;

    /**
     * Initialize Three.js background
     */
    const init = async () => {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Scene and camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 30;

        // Create particles
        createParticleField();

        // Create geometric meshes
        createGeometricMeshes();

        // Mouse parallax
        setupMouseParallax();

        // Start animation loop
        animate();

        // Handle resize
        window.addEventListener('resize', onWindowResize);

        console.log('✓ Background system initialized');
    };

    /**
     * Create particle field
     */
    const createParticleField = () => {
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

            colors[i3] = c.r;
            colors[i3 + 1] = c.g;
            colors[i3 + 2] = c.b;
            sizes[i] = Math.random() * 1.5 + 0.3;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    };

    /**
     * Create geometric meshes
     */
    const createGeometricMeshes = () => {
        const geoGroup = new THREE.Group();
        scene.add(geoGroup);

        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x3d8bff,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
        });

        const wireMat2 = new THREE.MeshBasicMaterial({
            color: 0xc8a84b,
            wireframe: true,
            transparent: true,
            opacity: 0.06,
        });

        const addMesh = (geo, mat, x, y, z) => {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            geoGroup.add(mesh);
            return mesh;
        };

        meshes = [
            addMesh(new THREE.IcosahedronGeometry(3.5, 1), wireMat, -12, 6, -8),
            addMesh(new THREE.OctahedronGeometry(2.8, 0), wireMat2, 14, -5, -12),
            addMesh(new THREE.TorusGeometry(4, 0.8, 8, 24), wireMat, 0, -14, -6),
            addMesh(new THREE.TetrahedronGeometry(2.2, 0), wireMat2, -18, -8, -14),
        ];

        // Store group for animation
        scene.userData.geoGroup = geoGroup;
    };

    /**
     * Setup mouse parallax
     */
    const setupMouseParallax = () => {
        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        scene.userData.mouseX = () => mouseX;
        scene.userData.mouseY = () => mouseY;
    };

    /**
     * Animation loop
     */
    const animate = () => {
        raf = requestAnimationFrame(animate);

        const clock = scene.userData.clock = scene.userData.clock || new THREE.Clock();
        const elapsed = clock.getElapsedTime();

        // Rotate particle field slowly
        particles.rotation.y = elapsed * 0.025;
        particles.rotation.x = elapsed * 0.01;

        // Parallax camera drift
        const mouseX = scene.userData.mouseX?.() || 0;
        const mouseY = scene.userData.mouseY?.() || 0;

        camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;

        // Animate meshes
        if (meshes) {
            meshes.forEach((m, i) => {
                m.rotation.x = elapsed * (0.08 + i * 0.03);
                m.rotation.y = elapsed * (0.12 + i * 0.02);
            });
        }

        if (scene.userData.geoGroup) {
            scene.userData.geoGroup.rotation.y = elapsed * 0.015;
        }

        renderer.render(scene, camera);
    };

    /**
     * Handle window resize
     */
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    /**
     * Adjust background intensity
     */
    const setIntensity = (value) => {
        if (particles) {
            particles.material.opacity = Helpers.clamp(value, 0.2, 1);
        }
    };

    /**
     * Pause animation
     */
    const pause = () => {
        cancelAnimationFrame(raf);
    };

    /**
     * Resume animation
     */
    const resume = () => {
        animate();
    };

    /**
     * Cleanup
     */
    const destroy = () => {
        if (renderer) renderer.dispose();
        window.removeEventListener('resize', onWindowResize);
    };

    return {
        init,
        setIntensity,
        pause,
        resume,
        destroy,
    };
})();

// Export
window.BackgroundSystem = BackgroundSystem;
