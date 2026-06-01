/* ╔══════════════════════════════════════════════════════════════╗
   ║  TECHNICAL ARSENAL - Skills Grid Controller                ║
   ╚══════════════════════════════════════════════════════════════╝ */

const TechnicalArsenalSystem = (() => {
    let elements = {};
    let observer;

    /**
     * Skill data
     */
    const skillsData = [
        {
            name: 'Backend',
            title: 'Node.js & Express',
            description: 'Enterprise-grade backend systems with robust APIs',
            tags: ['Node.js', 'Express', 'REST', 'GraphQL']
        },
        {
            name: 'Frontend',
            title: 'React & TypeScript',
            description: 'Modern UI architectures with type-safe JavaScript',
            tags: ['React', 'TypeScript', 'CSS-in-JS', 'Hooks']
        },
        {
            name: 'DevOps',
            title: 'Docker & Kubernetes',
            description: 'Container orchestration and cloud infrastructure',
            tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS']
        },
        {
            name: 'Database',
            title: 'PostgreSQL & MongoDB',
            description: 'Scalable data solutions for any workload',
            tags: ['SQL', 'NoSQL', 'Redis', 'Caching']
        },
        {
            name: 'Cloud',
            title: 'AWS & Azure',
            description: 'Multi-cloud architecture and deployment',
            tags: ['EC2', 'RDS', 'Lambda', 'S3']
        },
        {
            name: 'Automation',
            title: 'CI/CD Pipelines',
            description: 'Continuous integration and deployment workflows',
            tags: ['Jenkins', 'GitLab', 'GitHub', 'Terraform']
        },
        {
            name: 'Security',
            title: 'Authentication & Encryption',
            description: 'Enterprise security practices and compliance',
            tags: ['OAuth 2.0', 'JWT', 'SSL/TLS', 'OWASP']
        },
        {
            name: 'Monitoring',
            title: 'Observability Stack',
            description: 'System monitoring and performance tracking',
            tags: ['Prometheus', 'Grafana', 'ELK', 'DataDog']
        },
        {
            name: 'Architecture',
            title: 'System Design',
            description: 'Scalable architecture for complex systems',
            tags: ['Microservices', 'Event-Driven', 'CQRS', 'DDD']
        },
        {
            name: 'Testing',
            title: 'Quality Assurance',
            description: 'Comprehensive testing strategies and tools',
            tags: ['Jest', 'Mocha', 'Cypress', 'LoadTesting']
        },
        {
            name: 'Tools',
            title: 'Development Stack',
            description: 'Essential tools for modern development',
            tags: ['Git', 'VS Code', 'Webpack', 'ESLint']
        },
        {
            name: 'Agile',
            title: 'Team Practices',
            description: 'Agile methodologies and team collaboration',
            tags: ['Scrum', 'Kanban', 'JIRA', 'Confluence']
        }
    ];

    /**
     * Initialize technical arsenal section
     */
    const init = async () => {
        cacheElements();
        renderSkillCards();
        setupIntersectionObserver();
        setupEventListeners();

        console.log('✓ Technical Arsenal system initialized');
    };

    /**
     * Cache DOM elements
     */
    const cacheElements = () => {
        elements.root = document.getElementById('technical-arsenal-root');
        elements.grid = elements.root?.querySelector('#skills-grid');
    };

    /**
     * Render skill cards
     */
    const renderSkillCards = () => {
        if (!elements.grid) return;

        elements.grid.innerHTML = skillsData.map((skill, index) => `
            <div class="skill-card" data-index="${index}">
                <span class="skill-name">${skill.name}</span>
                <h3 class="skill-title">${skill.title}</h3>
                <p class="skill-description">${skill.description}</p>
                <div class="skill-tags">
                    ${skill.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        setupCardEventListeners();
    };

    /**
     * Setup skill card event listeners
     */
    const setupCardEventListeners = () => {
        const cards = elements.grid?.querySelectorAll('.skill-card');
        if (!cards) return;

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                GlowEffects.applyGlow(card, '#3d8bff', 0.4);
            });

            card.addEventListener('mouseleave', () => {
                GlowEffects.removeGlow(card);
            });
        });
    };

    /**
     * Setup intersection observer for reveal
     */
    const setupIntersectionObserver = () => {
        if (!elements.grid) return;

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger staggered reveal
                    const cards = elements.grid.querySelectorAll('.skill-card');
                    cards.forEach((card, index) => {
                        card.style.animationPlayState = 'running';
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px',
        });

        observer.observe(elements.grid);
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        // Additional event listeners if needed
    };

    /**
     * Cleanup
     */
    const destroy = () => {
        if (observer) {
            observer.disconnect();
        }
    };

    return {
        init,
        destroy,
        getSkillsData: () => skillsData,
    };
})();

// Export
window.TechnicalArsenalSystem = TechnicalArsenalSystem;
